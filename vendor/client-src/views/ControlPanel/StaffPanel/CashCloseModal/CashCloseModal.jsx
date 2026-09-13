import { useState, useEffect, useMemo, useCallback } from "react";

// ---- Material UI ----
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
// Icons
import {
  LockClock as LockClockIcon,
  PointOfSale as PointOfSaleIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Services ----
import {
  closeCashRegisterSessionService,
  getCashClosePreviewService,
  // getCashSessionReportService,
} from "@/services/cashRegister.js";
// ------------------

// ---- Styles ----
import {
  textFieldStyle,
  labelStyle,
  labelContainerStyle,
} from "../styles/styles.js";
// ----------------

const formatMoney = (value) => {
  return Number(value || 0).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
  });
};

const hasCashPermission = (user, permission) => {
  if (user?.role === "admin") return true;

  return (
    user?.role === "staff" &&
    user?.permissions?.cashRegister?.[permission] === true
  );
};

export const CashCloseModal = ({
  open,
  onClose,
  onClosed,
  user,
  cashSession,
  showAlert,
}) => {
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);
  const [report, setReport] = useState(null);
  const [countedCashAmount, setCountedCashAmount] = useState("");
  const [note, setNote] = useState("");

  const canClose = useMemo(() => hasCashPermission(user, "close"), [user]);
  const totals = report?.totals || report || {};

  const expectedCashAmount = Number(totals.expectedCashAmount || 0);
  const totalPaidOrders = Number(totals.totalPaidOrders || 0);
  const totalUnpaidOrders = Number(totals.totalUnpaidOrders || 0);
  const totalUnpaidAmount = Number(totals.totalUnpaidAmount || 0);
  const counted = countedCashAmount === "" ? null : Number(countedCashAmount);
  const difference = counted === null ? null : counted - expectedCashAmount;

  const loadClosePreview = useCallback(async () => {
    if (!cashSession?.id) return;

    setLoading(true);
    try {
      const response = await getCashClosePreviewService(cashSession.id);

      setReport(response);
    } catch (error) {
      console.error("Error obteniendo preview de caja:", error);
      showAlert?.(
        error?.message || "Error al obtener resumen de cierre",
        "error",
      );

      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [cashSession?.id, showAlert]);

  const resetCloseForm = () => {
    setReport(null);
    setCountedCashAmount("");
    setNote("");
  };

  const handleCloseModal = () => {
    if (closing) return;

    resetCloseForm();
    onClose?.();
  };

  const handleConfirmClose = async () => {
    const amount = Number(countedCashAmount);

    if (countedCashAmount === "" || !Number.isFinite(amount) || amount < 0) {
      showAlert?.("Ingresá el efectivo contado", "warning");
      return;
    }
    setClosing(true);

    try {
      const response = await closeCashRegisterSessionService(cashSession.id, {
        countedCashAmount: amount,
        note: note.trim() || null,
      });

      showAlert?.("Caja cerrada correctamente", "success");
      resetCloseForm();
      onClosed?.(response);
    } catch (error) {
      showAlert?.(error?.message || "Error al cerrar la caja", "error");
    } finally {
      setClosing(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    setReport(null);
    setCountedCashAmount("");
    setNote("");

    loadClosePreview();
  }, [open, loadClosePreview]);

  if (!canClose) return null;

  return (
    <Dialog open={open} onClose={handleCloseModal} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: "background.main" }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <PointOfSaleIcon color="primary" />

          <Typography
            variant="h6"
            sx={{
              fontFamily: "fontFamily.primary",
              fontWeight: "bold",
            }}
          >
            CIERRE DE CAJA
          </Typography>

          {cashSession?.registerName && (
            <Chip
              size="small"
              color="primary"
              variant="outlined"
              label={cashSession.registerName}
              sx={{
                fontFamily: "fontFamily.secondary",
                textTransform: "uppercase",
              }}
            />
          )}
        </Stack>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box
            sx={{
              py: 6,
              display: "grid",
              placeItems: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1}
              flexWrap="wrap"
              useFlexGap
            >
              <Chip
                size="small"
                variant="filled"
                label={`Finalizados: ${Number(totals.totalOrders || 0)}`}
                sx={{ fontFamily: "fontFamily.secondary" }}
              />

              <Chip
                size="small"
                color="success"
                variant="filled"
                label={`Cobrados: ${totalPaidOrders}`}
                sx={{ fontFamily: "fontFamily.secondary" }}
              />

              <Chip
                size="small"
                color={totalUnpaidOrders > 0 ? "warning" : "default"}
                variant="filled"
                label={`Pendientes: ${totalUnpaidOrders}`}
                sx={{ fontFamily: "fontFamily.secondary" }}
              />

              <Chip
                size="small"
                color="error"
                variant="filled"
                label={`Cancelados: ${Number(
                  totals.totalCancelledOrders || 0,
                )}`}
                sx={{ fontFamily: "fontFamily.secondary" }}
              />
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                },
                gap: 1.5,
              }}
            >
              {[
                {
                  label: "Monto inicial",
                  value: totals.openingAmount,
                },
                {
                  label: "Ingresos manuales",
                  value: totals.totalCashIn,
                },
                {
                  label: "Retiros manuales",
                  value: totals.totalCashOut,
                },
                {
                  label: "Ventas cobradas",
                  value: totals.totalSalesAmount,
                },
                {
                  label: "Ventas efectivo",
                  value: totals.totalCashSalesAmount,
                },
                {
                  label: "Pendiente de cobro",
                  value: totals.totalUnpaidAmount,
                },
                {
                  label: "Efectivo esperado",
                  value: expectedCashAmount,
                },
              ].map((item) => (
                <Paper
                  key={item.label}
                  elevation={0}
                  sx={{
                    bgcolor: "background.paper",
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "fontFamily.secondary",
                      fontSize: 13,
                      color: "primary.main",
                    }}
                  >
                    {item.label}
                  </Typography>

                  <Typography
                    sx={{
                      fontFamily: "fontFamily.primary",
                      fontSize: 18,
                      color: "text.primary",
                      mt: 0.5,
                    }}
                  >
                    {formatMoney(item.value)}
                  </Typography>
                </Paper>
              ))}
            </Box>

            {totalUnpaidOrders > 0 && (
              <Alert
                severity="warning"
                variant="outlined"
                sx={{
                  bgcolor: "background.main",
                  borderRadius: 2,
                  fontFamily: "fontFamily.secondary",
                  "& .MuiAlert-message": {
                    width: "100%",
                  },
                }}
              >
                <Stack spacing={0.5}>
                  <Typography
                    sx={{
                      fontFamily: "fontFamily.primary",
                      fontSize: 16,
                      color: "primary.main",
                    }}
                  >
                    HAY PEDIDOS PENDIENTES DE COBRO
                  </Typography>

                  <Typography
                    sx={{
                      fontFamily: "fontFamily.secondary",
                      fontSize: 14,
                      color: "primary.main",
                    }}
                  >
                    {totalUnpaidOrders}{" "}
                    {totalUnpaidOrders === 1
                      ? "pedido finalizado todavía no fue cobrado"
                      : "pedidos finalizados todavía no fueron cobrados"}
                    {" · "}
                    {formatMoney(totalUnpaidAmount)}
                  </Typography>

                  <Typography
                    sx={{
                      fontFamily: "fontFamily.secondary",
                      fontSize: 12,
                      color: "text.primary",
                    }}
                  >
                    Estos pedidos no se incluyen en las ventas cobradas ni en el
                    efectivo esperado de la caja.
                  </Typography>
                </Stack>
              </Alert>
            )}

            {Array.isArray(report?.paymentMethods) &&
              report.paymentMethods.length > 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "fontFamily.secondary",
                      mb: 1,
                    }}
                  >
                    Cobros por método de pago
                  </Typography>

                  <Stack spacing={1}>
                    {report.paymentMethods.map((payment) => (
                      <Stack
                        key={payment.paymentMethod}
                        direction="row"
                        justifyContent="space-between"
                      >
                        <Chip
                          label={payment.paymentMethod}
                          variant="outlined"
                          sx={{ fontFamily: "fontFamily.secondary" }}
                        />

                        <Typography sx={{ fontFamily: "fontFamily.secondary" }}>
                          {formatMoney(payment.totalAmount)}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              )}

            <Divider sx={{ borderColor: "text.primary" }} />

            <Box>
              <Box sx={labelContainerStyle}>
                <Typography sx={labelStyle}>EFECTIVO CONTADO</Typography>
              </Box>
              <TextField
                type="number"
                value={countedCashAmount}
                onChange={(event) => setCountedCashAmount(event.target.value)}
                inputProps={{
                  min: 0,
                  step: 0.01,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
                sx={textFieldStyle}
              />
            </Box>

            {difference !== null && (
              <Alert
                severity={
                  difference === 0
                    ? "success"
                    : difference < 0
                      ? "error"
                      : "warning"
                }
              >
                Diferencia: <strong>{formatMoney(difference)}</strong>
              </Alert>
            )}

            <Box>
              <Box sx={labelContainerStyle}>
                <Typography sx={labelStyle}>NOTA CIERRE DE CAJA</Typography>
              </Box>
              <TextField
                multiline
                minRows={2}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                sx={textFieldStyle}
              />
            </Box>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          variant="outlined"
          color="inherit"
          onClick={handleCloseModal}
          disabled={closing}
          sx={{ fontFamily: "fontFamily.primary" }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          color="primary"
          startIcon={<LockClockIcon />}
          disabled={closing || loading || !report}
          onClick={handleConfirmClose}
          sx={{ fontFamily: "fontFamily.primary" }}
        >
          {closing ? "Cerrando..." : "Confirmar cierre"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
