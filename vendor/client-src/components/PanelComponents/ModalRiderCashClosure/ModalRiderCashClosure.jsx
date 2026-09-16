import { useEffect, useMemo, useState } from "react";

// ---- MATERIAL UI ----
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
// ICONS
import {
  Close as CloseIcon,
  TwoWheeler as TwoWheelerIcon,
  Payments as PaymentsIcon,
  Wallet as WalletIcon,
  CurrencyExchange as CurrencyExchangeIcon,
  ReceiptLong as ReceiptLongIcon,
  Add as AddIcon,
  RemoveCircleOutline as RemoveIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  Paid as PaidIcon,
  LocalGasStation as GasIcon,
  WarningAmber as WarningAmberIcon,
  Comment as CommentIcon,
  PointOfSale as PointOfSaleIcon,
} from "@mui/icons-material";
// ---------------------

// ---- SERVICES ----
import {
  getCashRegistersService,
  getOpenCashSessionService,
} from "@/services/cashRegister.js";
import {
  getOrCreateOpenRiderCashClosureService,
  updateOpenRiderCashClosureService,
  closeRiderCashClosureService,
} from "@/services/riderCashClosures.js";
// ------------------

// ---- Utils ----
import { formatCurrency } from "@/utils/orderCalculations.js";
import { getStoredCashRegisterId } from "@/utils/cashRegisterUtils.js";
import {
  createLocalId,
  calculateLocalSummary,
} from "@/utils/riderCashClosureUtils.js";
// ---------------

// ---- Shared ----
import { RiderSummaryRow } from "./shared/RiderSummaryRow.jsx";
import { RiderSectionCard } from "./shared/RiderSectionCard.jsx";
import { RiderMetricCard } from "./shared/RiderMetricCard.jsx";
// ----------------

// ---- Components ----
import { ModalConfirmCashClosure } from "./ModalConfirmCashClosure/ModalConfirmCashClosure.jsx";
// --------------------

export const ModalRiderCashClosure = ({
  open,
  onClose,
  restaurantId,
  rider,
  user,
  showAlert,
  onClosed,
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [closure, setClosure] = useState(null);
  const [deliveries, setDeliveries] = useState([]);

  const [loadingCashRegisters, setLoadingCashRegisters] = useState(false);
  const [cashRegisters, setCashRegisters] = useState([]);
  const [openSessionsByRegister, setOpenSessionsByRegister] = useState({});
  const [selectedCashRegisterId, setSelectedCashRegisterId] = useState("");

  const isStaff = user?.role === "staff";

  const selectedCashSession = useMemo(() => {
    if (!selectedCashRegisterId) {
      return null;
    }
    return openSessionsByRegister[selectedCashRegisterId] || null;
  }, [openSessionsByRegister, selectedCashRegisterId]);

  const [form, setForm] = useState({
    initialCash: 0,
    cashDelivered: 0,
    adjustments: [],
    notes: "",
  });

  const isClosed = closure?.status === "CLOSED";

  const summary = useMemo(() => {
    return calculateLocalSummary({
      deliveries,
      form,
    });
  }, [deliveries, form]);

  const handleChange = ({ target: { name, value } }) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddAdjustment = (type) => {
    setForm((prev) => ({
      ...prev,
      adjustments: [
        ...prev.adjustments,
        {
          id: createLocalId(),
          type,
          description: type === "CHARGE" ? "Consumo / descuento" : "Propina",
          amount: 0,
        },
      ],
    }));
  };

  const handleAdjustmentChange = (id, field, value) => {
    setForm((prev) => ({
      ...prev,
      adjustments: prev.adjustments.map((adjustment) =>
        adjustment.id === id
          ? {
              ...adjustment,
              [field]: value,
            }
          : adjustment,
      ),
    }));
  };

  const handleRemoveAdjustment = (id) => {
    setForm((prev) => ({
      ...prev,
      adjustments: prev.adjustments.filter(
        (adjustment) => adjustment.id !== id,
      ),
    }));
  };

  const loadCashWorkspace = async () => {
    if (!open || !restaurantId || !user?.id) {
      return;
    }

    setLoadingCashRegisters(true);

    try {
      const registersResponse = await getCashRegistersService({
        restaurantId,
        includeInactive: false,
      });

      const registers = Array.isArray(registersResponse)
        ? registersResponse
        : [];

      setCashRegisters(registers);

      const sessionEntries = await Promise.all(
        registers.map(async (register) => {
          const session = await getOpenCashSessionService({
            restaurantId,
            cashRegisterId: register.id,
          });
          return [register.id, session || null];
        }),
      );

      const sessionsMap = Object.fromEntries(sessionEntries);

      setOpenSessionsByRegister(sessionsMap);

      const storedId = getStoredCashRegisterId({
        user,
        restaurantId,
      });

      const storedIsOpen = Boolean(
        storedId && sessionsMap[storedId]?.status === "OPEN",
      );

      if (isStaff) {
        if (storedIsOpen) {
          setSelectedCashRegisterId(storedId);
          return;
        }
        const firstOpen = registers.find(
          (register) => sessionsMap[register.id]?.status === "OPEN",
        );
        setSelectedCashRegisterId(firstOpen?.id || "");
        return;
      }

      setSelectedCashRegisterId("");
    } catch (error) {
      showAlert?.(
        error?.message || "Error al obtener las cajas del local",
        "error",
      );
    } finally {
      setLoadingCashRegisters(false);
    }
  };

  const loadClosure = async () => {
    if (!open || !restaurantId || !rider?.id) return;

    setLoading(true);

    try {
      const response = await getOrCreateOpenRiderCashClosureService({
        restaurantId,
        riderId: rider.id,
        dateKey: rider.closureDateKey,
        closureDateKey: rider.closureDateKey,
        closureDateLabel: rider.closureDateLabel,
      });

      const currentClosure = response.closure;

      setClosure(currentClosure);
      setDeliveries(response.deliveries || []);

      setForm({
        initialCash: Number(currentClosure?.initialCash || 0),
        cashDelivered: Number(currentClosure?.cashDelivered || 0),
        adjustments: Array.isArray(currentClosure?.adjustments)
          ? currentClosure.adjustments
          : [],
        notes: currentClosure?.notes || "",
      });
    } catch (error) {
      showAlert?.(
        error.message || "Error al obtener el cierre del rider",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!closure?.id || isClosed) return;

    setSaving(true);

    try {
      const response = await updateOpenRiderCashClosureService({
        closureId: closure.id,
        initialCash: form.initialCash,
        cashDelivered: form.cashDelivered,
        adjustments: form.adjustments,
        notes: form.notes,
      });

      setClosure(response.closure);
      setDeliveries(response.deliveries || []);

      showAlert?.("Cierre guardado correctamente", "success");
    } catch (error) {
      showAlert?.(error.message || "Error al guardar el cierre", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAskConfirmClose = () => {
    if (!closure?.id || isClosed) return;

    if (deliveries.length === 0) {
      showAlert?.(
        "El rider no tiene entregas finalizadas pendientes de cierre",
        "warning",
      );
      return;
    }

    if (
      isStaff &&
      (!selectedCashRegisterId ||
        !selectedCashSession?.id ||
        selectedCashSession?.status !== "OPEN")
    ) {
      showAlert?.(
        "Debes seleccionar una caja abierta para confirmar el cierre del delivery",
        "warning",
      );
      return;
    }

    setShowConfirmClose(true);
  };

  const handleConfirmCashClosure = async () => {
    if (!closure?.id || isClosed) return;

    if (
      isStaff &&
      (!selectedCashRegisterId ||
        !selectedCashSession?.id ||
        selectedCashSession?.status !== "OPEN")
    ) {
      showAlert?.(
        "Debes seleccionar una caja abierta para confirmar el cierre del delivery",
        "warning",
      );

      return;
    }

    setShowConfirmClose(false);
    setSaving(true);

    try {
      await updateOpenRiderCashClosureService({
        closureId: closure.id,
        initialCash: form.initialCash,
        cashDelivered: form.cashDelivered,
        adjustments: form.adjustments,
        notes: form.notes,
      });

      const response = await closeRiderCashClosureService({
        closureId: closure.id,
        cashRegisterId:
          selectedCashSession?.status === "OPEN"
            ? selectedCashRegisterId
            : null,
      });

      showAlert?.("Cierre confirmado correctamente", "success");

      onClosed?.(response);
      onClose?.();
    } catch (error) {
      showAlert?.(error.message || "Error al confirmar el cierre", "error");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadCashWorkspace();
  }, [open, restaurantId, user?.id, user?.role]);

  useEffect(() => {
    loadClosure();
  }, [open, restaurantId, rider?.id, rider?.closureDateKey]);

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          bgcolor: "background.default",
          borderRadius: { xs: 0, sm: 4 },
          border: { xs: "none", sm: "1px solid" },
          borderColor: "primary.main",
          overflow: "hidden",
          minHeight: { xs: "100dvh", sm: "auto" },
          boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "background.main",
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          px: { xs: 2, sm: 3 },
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(245, 166, 35, 0.12)",
              border: "1px solid",
              borderColor: "primary.main",
            }}
          >
            <TwoWheelerIcon sx={{ color: "primary.main" }} />
          </Box>

          <Box>
            <Typography
              sx={{
                fontFamily: "fontFamily.primary",
                color: "text.primary",
                fontSize: { xs: "1rem", sm: "1.25rem" },
                lineHeight: 1,
              }}
            >
              CIERRE DE TURNO
            </Typography>

            <Typography
              sx={{
                fontFamily: "fontFamily.secondary",
                color: "primary.main",
                fontSize: "0.85rem",
                mt: 0.5,
              }}
            >
              {rider?.name || "Rider"}
            </Typography>

            <Typography
              sx={{
                fontFamily: "fontFamily.secondary",
                color: "text.secondary",
                fontSize: "0.8rem",
                mt: 0.3,
              }}
            >
              {rider?.closureDateLabel
                ? `Fecha de cierre: ${rider.closureDateLabel}`
                : "Cierre de viajes pendientes"}
            </Typography>
          </Box>

          {closure?.status && (
            <Chip
              size="small"
              label={closure.status === "OPEN" ? "Abierto" : "Cerrado"}
              color={closure.status === "OPEN" ? "warning" : "success"}
              sx={{ fontFamily: "fontFamily.secondary" }}
            />
          )}
        </Stack>

        <IconButton onClick={onClose} disabled={saving}>
          <CloseIcon sx={{ color: "text.primary" }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: { xs: 1, sm: 2 }, p: { xs: 2, sm: 3 } }}>
        {loading ? (
          <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "minmax(0, 1fr) 420px",
              },
              gap: 2,
            }}
          >
            <Stack spacing={2}>
              <RiderSectionCard
                title="DETALLES DE ENTREGAS"
                subtitle="Resumen de viajes incluidos en este cierre"
                icon={<ReceiptLongIcon fontSize="small" />}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, 1fr)",
                    },
                    gap: 1.2,
                  }}
                >
                  <RiderMetricCard
                    icon={<ReceiptLongIcon color="primary" />}
                    label="Pedidos repartidos"
                    value={summary.ordersCount}
                  />

                  <RiderMetricCard
                    icon={<PaymentsIcon color="success" />}
                    label="Pedidos en efectivo"
                    value={summary.cashOrdersCount}
                  />
                </Box>
              </RiderSectionCard>

              <RiderSectionCard
                title="DATOS DEL CIERRE"
                subtitle="Efectivo entregado al cadete y dinero recibido al finalizar"
                icon={<WalletIcon fontSize="small" />}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "1fr 1fr",
                    },
                    gap: 1.5,
                  }}
                >
                  <TextField
                    fullWidth
                    label="Efectivo inicial para cambio"
                    name="initialCash"
                    type="number"
                    value={form.initialCash}
                    onChange={handleChange}
                    disabled={isClosed}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <WalletIcon color="success" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      fontFamily: "fontFamily.secondary",
                      color: "text.primary",
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Efectivo entregado por el rider"
                    name="cashDelivered"
                    type="number"
                    value={form.cashDelivered}
                    onChange={handleChange}
                    disabled={isClosed}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CurrencyExchangeIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      fontFamily: "fontFamily.secondary",
                      color: "text.primary",
                    }}
                  />
                </Box>

                <Divider sx={{ borderColor: "text.primary", my: 2 }} />

                <Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <PointOfSaleIcon color="primary" fontSize="small" />

                    <Typography
                      sx={{
                        fontFamily: "fontFamily.primary",
                        color: "text.primary",
                        fontSize: 16,
                      }}
                    >
                      CAJA RECEPTORA
                    </Typography>

                    {!isStaff && (
                      <Typography
                        sx={{
                          fontFamily: "fontFamily.secondary",
                          color: "text.primary",
                          fontSize: 12,
                        }}
                      >
                        (OPCIONAL)
                      </Typography>
                    )}
                  </Stack>

                  <TextField
                    select
                    fullWidth
                    size="small"
                    label={"CAJA RECEPTORA"}
                    value={selectedCashRegisterId}
                    onChange={(event) =>
                      setSelectedCashRegisterId(event.target.value)
                    }
                    disabled={isClosed || saving || loadingCashRegisters}
                    sx={{
                      fontFamily: "fontFamily.primary",
                      color: "text.primary",
                    }}
                  >
                    {!isStaff && (
                      <MenuItem
                        value=""
                        sx={{
                          fontFamily: "fontFamily.primary",
                          color: "text.primary",
                        }}
                      >
                        NO ASOCIAR CAJA
                      </MenuItem>
                    )}

                    {cashRegisters.map((register) => {
                      const session = openSessionsByRegister[register.id];
                      const isOpen = session?.status === "OPEN";
                      return (
                        <MenuItem
                          key={register.id}
                          value={register.id}
                          disabled={!isOpen}
                          sx={{
                            fontFamily: "fontFamily.primary",
                            color: "text.primary",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              width: "100%",
                              gap: 2,
                            }}
                          >
                            <Box>
                              <Typography
                                sx={{
                                  fontFamily: "fontFamily.primary",
                                  fontSize: 14,
                                  textTransform: "uppercase",
                                }}
                              >
                                {register.name}
                              </Typography>

                              <Typography
                                sx={{
                                  fontFamily: "fontFamily.secondary",
                                  color: "primary.main",
                                  fontSize: 11,
                                }}
                              >
                                {register.code}
                              </Typography>
                            </Box>

                            <Chip
                              size="small"
                              label={isOpen ? "ABIERTA" : "CERRADA"}
                              color={isOpen ? "success" : "error"}
                              sx={{ fontFamily: "fontFamily.primary" }}
                            />
                          </Box>
                        </MenuItem>
                      );
                    })}
                  </TextField>

                  {!isStaff && !selectedCashRegisterId && (
                    <Typography
                      sx={{
                        mt: 1,
                        fontFamily: "fontFamily.secondary",
                        color: "primary.main",
                        fontSize: 12,
                      }}
                    >
                      El cierre se puede confirmar sin asociarlo a una caja, los
                      cobros en efectivo quedarán registrados sin sesión de
                      caja.
                    </Typography>
                  )}

                  {isStaff && !selectedCashSession && (
                    <Typography
                      sx={{
                        mt: 1,
                        fontFamily: "fontFamily.secondary",
                        color: "warning.main",
                        fontSize: 12,
                      }}
                    >
                      Para un empleado es obligatorio seleccionar una caja
                      abierta.
                    </Typography>
                  )}
                </Box>
              </RiderSectionCard>

              <RiderSectionCard
                title="AJUSTES DEL RIDER"
                subtitle="Extras, propinas, descuentos o cargos aplicados al pago final"
                icon={<GasIcon fontSize="small" />}
                action={
                  !isClosed && (
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<RemoveIcon />}
                        onClick={() => handleAddAdjustment("CHARGE")}
                        sx={{ fontFamily: "fontFamily.secondary" }}
                      >
                        Restar
                      </Button>

                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<AddIcon />}
                        onClick={() => handleAddAdjustment("BONUS")}
                        sx={{ fontFamily: "fontFamily.secondary" }}
                      >
                        Sumar
                      </Button>
                    </Stack>
                  )
                }
              >
                <Stack
                  spacing={1.2}
                  sx={{
                    maxHeight: { xs: "none", md: 150 },
                    overflowY: { xs: "visible", md: "auto" },
                    pr: { md: 0.5 },
                  }}
                >
                  {form.adjustments.map((adjustment) => (
                    <Paper
                      key={adjustment.id}
                      elevation={0}
                      sx={{
                        p: 1.2,
                        borderRadius: 2,
                        bgcolor: "background.default",
                        border: "1px solid",
                        borderColor:
                          adjustment.type === "CHARGE"
                            ? "error.main"
                            : "success.main",
                      }}
                    >
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr",
                            sm: "115px 1fr 120px 38px",
                          },
                          gap: 1,
                          alignItems: "center",
                        }}
                      >
                        <TextField
                          select
                          size="small"
                          value={adjustment.type}
                          disabled={isClosed}
                          onChange={(e) =>
                            handleAdjustmentChange(
                              adjustment.id,
                              "type",
                              e.target.value,
                            )
                          }
                          sx={{ fontFamily: "fontFamily.secondary" }}
                        >
                          <MenuItem
                            value="CHARGE"
                            sx={{ fontFamily: "fontFamily.secondary" }}
                          >
                            Restar
                          </MenuItem>
                          <MenuItem
                            value="BONUS"
                            sx={{ fontFamily: "fontFamily.secondary" }}
                          >
                            Sumar
                          </MenuItem>
                        </TextField>

                        <TextField
                          size="small"
                          placeholder="Motivo"
                          value={adjustment.description}
                          disabled={isClosed}
                          onChange={(e) =>
                            handleAdjustmentChange(
                              adjustment.id,
                              "description",
                              e.target.value,
                            )
                          }
                          sx={{ fontFamily: "fontFamily.secondary" }}
                        />

                        <TextField
                          size="small"
                          type="number"
                          value={adjustment.amount}
                          disabled={isClosed}
                          onChange={(e) =>
                            handleAdjustmentChange(
                              adjustment.id,
                              "amount",
                              e.target.value,
                            )
                          }
                          sx={{ fontFamily: "fontFamily.primary" }}
                        />

                        {!isClosed && (
                          <IconButton
                            color="error"
                            onClick={() =>
                              handleRemoveAdjustment(adjustment.id)
                            }
                          >
                            <CloseIcon />
                          </IconButton>
                        )}
                      </Box>
                    </Paper>
                  ))}

                  {form.adjustments.length === 0 && (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "background.default",
                        border: "1px dashed",
                        borderColor: "divider",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <WarningAmberIcon
                        fontSize="small"
                        sx={{ color: "text.secondary" }}
                      />

                      <Typography
                        sx={{
                          fontFamily: "fontFamily.secondary",
                          color: "text.secondary",
                          fontSize: "0.85rem",
                        }}
                      >
                        No hay ajustes cargados.
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </RiderSectionCard>

              <RiderSectionCard
                title="NOTA"
                subtitle="Observación interna del cierre"
                icon={<CommentIcon fontSize="small" />}
              >
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  name="notes"
                  placeholder="Agrega una observación para el cierre del turno"
                  value={form.notes}
                  onChange={handleChange}
                  disabled={isClosed}
                  sx={{ fontFamily: "fontFamily.secondary" }}
                />
              </RiderSectionCard>
            </Stack>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: "background.main",
                border: "1px solid",
                borderColor: "divider",
                alignSelf: "start",
                position: { md: "sticky" },
                top: { md: 16 },
              }}
            >
              <Typography
                sx={{
                  fontFamily: "fontFamily.primary",
                  color: "primary.main",
                  mb: 1.5,
                }}
              >
                RESUMEN DEL CIERRE
              </Typography>

              <RiderSummaryRow
                icon={<PaidIcon color="success" />}
                label="Efectivo cobrado"
                value={formatCurrency(summary.cashCollected)}
              />

              <RiderSummaryRow
                icon={<WalletIcon color="success" />}
                label="Cambio inicial"
                value={formatCurrency(summary.initialCash)}
              />

              <RiderSummaryRow
                icon={<CurrencyExchangeIcon color="primary" />}
                label="Efectivo entregado"
                value={formatCurrency(summary.cashDelivered)}
              />

              <RiderSummaryRow
                icon={<TwoWheelerIcon color="primary" />}
                label="Envio del delivery"
                value={formatCurrency(summary.deliveryFeeTotal)}
                color="primary.main"
              />

              {summary.adjustmentsTotal !== 0 && (
                <RiderSummaryRow
                  icon={
                    <GasIcon
                      color={
                        summary.adjustmentsTotal >= 0 ? "success" : "error"
                      }
                    />
                  }
                  label={
                    summary.adjustmentsTotal >= 0
                      ? "Extras / propinas"
                      : "Descuentos / cargos"
                  }
                  value={formatCurrency(summary.adjustmentsTotal)}
                  color={
                    summary.adjustmentsTotal >= 0
                      ? "success.main"
                      : "error.main"
                  }
                />
              )}

              {summary.cashDifference !== 0 && (
                <RiderSummaryRow
                  icon={
                    <WalletIcon
                      color={summary.cashDifference > 0 ? "success" : "error"}
                    />
                  }
                  label={
                    summary.cashDifference > 0
                      ? "Sobrante / Propina"
                      : "Faltante descontado"
                  }
                  value={
                    summary.cashDifference > 0
                      ? formatCurrency(summary.cashDifference)
                      : `-${formatCurrency(Math.abs(summary.cashDifference))}`
                  }
                  color={
                    summary.cashDifference > 0 ? "success.main" : "error.main"
                  }
                />
              )}

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor:
                    summary.cashDifference === 0
                      ? "success.main"
                      : summary.cashDifference > 0
                        ? "primary.main"
                        : "error.main",
                  mb: 1.5,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    color: "text.primary",
                    fontSize: "0.78rem",
                  }}
                >
                  TOTAL A ENTREGAR AL LOCAL
                </Typography>

                <Typography
                  sx={{
                    fontFamily: "fontFamily.primary",
                    color: "primary.main",
                    fontSize: { xs: "1.2rem", md: "1.6rem" },
                    lineHeight: 1.2,
                  }}
                >
                  {formatCurrency(summary.expectedCashToAdmin)}
                </Typography>

                {summary.remainingDebt > 0 && (
                  <Typography
                    sx={{
                      mt: 1,
                      fontFamily: "fontFamily.secondary",
                      color: "error.main",
                      fontSize: "0.8rem",
                    }}
                  >
                    El faltante supera el pago del rider, queda pendiente:{" "}
                    {formatCurrency(summary.remainingDebt)}
                  </Typography>
                )}
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "success.main",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    color: "text.primary",
                    fontSize: "0.78rem",
                  }}
                >
                  TOTAL FINAL A PAGAR AL DELIVERY
                </Typography>

                <Typography
                  sx={{
                    fontFamily: "fontFamily.primary",
                    color: "success.main",
                    fontSize: { xs: "1.2rem", md: "1.6rem" },
                    lineHeight: 1.2,
                  }}
                >
                  {formatCurrency(summary.riderShouldKeep)}
                </Typography>
              </Box>
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: { xs: 1.5, sm: 2 },
          bgcolor: "background.main",
          borderTop: "1px solid",
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          gap: 1.2,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          justifyContent="flex-end"
          sx={{ width: "100%" }}
        >
          <Button
            onClick={onClose}
            disabled={saving}
            variant="outlined"
            color="inherit"
            startIcon={<CloseIcon />}
            sx={{ fontFamily: "fontFamily.primary" }}
          >
            Cancelar
          </Button>

          {!isClosed && (
            <Button
              onClick={handleSaveDraft}
              disabled={saving || loading}
              variant="outlined"
              color="primary"
              startIcon={<SaveIcon />}
              sx={{ fontFamily: "fontFamily.primary" }}
            >
              Guardar Borrador
            </Button>
          )}
        </Stack>

        {!isClosed && (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
              pt: 1.2,
              borderTop: "1px dashed",
              borderColor: "rgba(255,255,255,0.14)",
            }}
          >
            <Button
              onClick={handleAskConfirmClose}
              disabled={saving || loading || deliveries.length === 0}
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              sx={{
                fontFamily: "fontFamily.primary",
                minWidth: { xs: "100%", sm: 230 },
                py: 1.1,
                boxShadow: "0 8px 22px rgba(46, 125, 50, 0.35)",
              }}
            >
              Realizar cierre
            </Button>
          </Box>
        )}
      </DialogActions>

      <ModalConfirmCashClosure
        open={showConfirmClose}
        onCancel={() => setShowConfirmClose(false)}
        onConfirm={handleConfirmCashClosure}
        loading={saving}
      />
    </Dialog>
  );
};
