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
} from "@mui/icons-material";
// ---------------------

// ---- SERVICES ----
import {
  getOrCreateOpenRiderCashClosureService,
  updateOpenRiderCashClosureService,
  closeRiderCashClosureService,
} from "@/services/riderCashClosures.js";
// ------------------

// ---- Utils ----
import { formatCurrency } from "@/utils/orderCalculations.js";
import {
  createLocalId,
  calculateLocalSummary,
} from "@/utils/riderCashClosureUtils.js";
// ---------------

// ---- Components ----
import { ModalConfirmCashClosure } from "./ModalConfirmCashClosure/ModalConfirmCashClosure.jsx";
// --------------------

const SummaryRow = ({ icon, label, value, color = "text.primary" }) => {
  return (
    <Box
      sx={{
        py: 1.15,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 2,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        {icon}

        <Typography
          sx={{
            fontFamily: "fontFamily.secondary",
            color: "text.primary",
            fontSize: "0.88rem",
          }}
        >
          {label}
        </Typography>
      </Stack>

      <Typography
        sx={{
          fontFamily: "fontFamily.primary",
          color,
          fontSize: "1rem",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};

export const ModalRiderCashClosure = ({
  open,
  onClose,
  restaurantId,
  rider,
  showAlert,
  onClosed,
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [closure, setClosure] = useState(null);
  const [deliveries, setDeliveries] = useState([]);

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

    setShowConfirmClose(true);
  };

  const handleConfirmCashClosure = async () => {
    if (!closure?.id || isClosed) return;

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
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: "background.main",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "fontFamily.primary",
                    color: "primary.main",
                    mb: 2,
                  }}
                >
                  DATOS DEL CIERRE
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "1fr 1fr",
                    },
                    gap: 2,
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
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: "background.main",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "stretch", sm: "center" }}
                  spacing={1}
                  sx={{ mb: 1.5 }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: "fontFamily.primary",
                        color: "primary.main",
                      }}
                    >
                      AJUSTES DEL RIDER
                    </Typography>

                    <Typography
                      sx={{
                        fontFamily: "fontFamily.secondary",
                        color: "text.primary",
                        fontSize: "0.8rem",
                        mt: 0.3,
                      }}
                    >
                      Sumá extras a favor del rider o restá consumos/cargos.
                    </Typography>
                  </Box>

                  {!isClosed && (
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
                        variant="outlined"
                        color="success"
                        startIcon={<AddIcon />}
                        onClick={() => handleAddAdjustment("BONUS")}
                        sx={{ fontFamily: "fontFamily.secondary" }}
                      >
                        Sumar
                      </Button>
                    </Stack>
                  )}
                </Stack>

                <Stack
                  spacing={1.2}
                  sx={{
                    maxHeight: { xs: "none", md: 190 },
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
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: "background.main",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                  <CommentIcon color="primary" />
                  <Typography
                    variant="subtitle1"
                    sx={{ fontFamily: "fontFamily.primary" }}
                  >
                    NOTA
                  </Typography>
                </Box>
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
              </Paper>
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
                  mb: 2,
                }}
              >
                RESUMEN DEL CIERRE
              </Typography>

              <SummaryRow
                icon={<ReceiptLongIcon color="primary" />}
                label="Pedidos repartidos"
                value={`${summary.ordersCount}`}
              />

              <SummaryRow
                icon={<PaymentsIcon color="success" />}
                label="Pedidos en efectivo"
                value={`${summary.cashOrdersCount}`}
              />

              <SummaryRow
                icon={<PaymentsIcon color="success" />}
                label="Efectivo cobrado"
                value={formatCurrency(summary.cashCollected)}
              />

              <SummaryRow
                icon={<WalletIcon color="success" />}
                label="Cambio inicial"
                value={formatCurrency(summary.initialCash)}
              />

              <SummaryRow
                icon={<TwoWheelerIcon color="warning" />}
                label="Deliverys del rider"
                value={formatCurrency(summary.deliveryFeeTotal)}
                color="primary.main"
              />

              <SummaryRow
                icon={<GasIcon color="error" />}
                label="Ajustes"
                value={formatCurrency(summary.adjustmentsTotal)}
                color={
                  summary.adjustmentsTotal >= 0 ? "success.main" : "error.main"
                }
              />

              <SummaryRow
                icon={<PaidIcon color="primary" />}
                label="Efectivo entregado"
                value={formatCurrency(summary.cashDelivered)}
              />

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
                  TOTAL A ENTREGAR
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
                {summary.cashDifference !== 0 && (
                  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontFamily: "fontFamily.secondary",
                        color:
                          summary.cashDifference > 0
                            ? "info.main"
                            : "error.main",
                      }}
                    >
                      {summary.cashDifference > 0
                        ? `Sobra efectivo: `
                        : `Falta entregar: `}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontFamily: "fontFamily.secondary",
                        color:
                          summary.cashDifference > 0
                            ? "info.main"
                            : "error.main",
                      }}
                    >
                      {formatCurrency(summary.cashDifference)}
                    </Typography>
                  </Box>
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
                  TOTAL A PAGAR AL DELIVERY
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
          p: 2,
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
              Guardar
            </Button>
          )}
        </Stack>

        {!isClosed && (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
              pt: 1,
            }}
          >
            <Button
              onClick={handleAskConfirmClose}
              disabled={saving || loading || deliveries.length === 0}
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              sx={{ fontFamily: "fontFamily.primary" }}
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
