// ---- Material UI ----
import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Button,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
// Icons
import {
  ReceiptLong as ReceiptIcon,
  TwoWheeler as RiderIcon,
  PointOfSale as CashIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Utils ----
import { formatMoney } from "@/utils/cashRegisterUtils.js";
// ---------------

// ---- Shared ----
import { AmountRow } from "./shared/AmountRow.jsx";
import { ReportSection } from "./shared/ReportSection.jsx";
// ----------------

// ---- Helpers ----
const money = (value) => formatMoney(Number(value || 0));
// -----------------

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

export const ModalCashSessionReport = ({
  open,
  onClose,
  session,
  report,
  loading = false,
}) => {
  const currentSession = report?.session || session || {};
  const totals = report?.totals || {};

  const isClosed = currentSession.status === "CLOSED";

  const paymentMethods = report?.paymentMethods || [];
  const movements = report?.movements || [];
  const riderClosures = report?.riderCashClosures || [];

  const historicalExpected = isClosed
    ? Number(currentSession.expectedCashAmount || 0)
    : Number(totals.expectedCashAmount || 0);

  const calculatedExpected = Number(totals.expectedCashAmount || 0);

  const hasHistoricalDifference =
    isClosed && Math.abs(historicalExpected - calculatedExpected) > 0.009;

  const difference = Number(currentSession.differenceAmount || 0);

  const differenceColor =
    Math.abs(difference) < 0.009
      ? "success.main"
      : difference < 0
        ? "error.main"
        : "warning.main";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 },
          bgcolor: "background.default",
        },
      }}
    >
      <DialogTitle sx={{ bgcolor: "background.main" }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <ReceiptIcon color="primary" />

          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontFamily: "fontFamily.primary",
                fontSize: 17,
                color: "text.primary",
              }}
            >
              DETALLE HISTÓRICO DE CAJA
            </Typography>

            <Typography
              sx={{
                fontFamily: "fontFamily.secondary",
                fontSize: 12,
                color: "primary.main",
                textTransform: "uppercase",
              }}
            >
              {currentSession.registerName || "Caja"} ·{" "}
              {currentSession.registerCode || ""}
            </Typography>
          </Box>

          <Chip
            label={isClosed ? "CERRADA" : "ABIERTA"}
            color={isClosed ? "error" : "success"}
            size="small"
            sx={{ fontFamily: "fontFamily.primary" }}
          />
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 8,
            }}
          >
            <CircularProgress />
          </Box>
        ) : !report ? (
          <Typography
            color="text.secondary"
            sx={{ py: 5, textAlign: "center" }}
          >
            No se pudo obtener el detalle de esta sesión.
          </Typography>
        ) : (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <ReportSection title="INFORMACIÓN DE LA SESIÓN">
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Typography
                  variant="body2"
                  sx={{ fontFamily: "fontFamily.secondary" }}
                >
                  Apertura: {formatDateTime(currentSession.openedAt)}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ fontFamily: "fontFamily.secondary" }}
                >
                  Abierta por: {currentSession.openedByNameSnapshot || "-"}
                </Typography>
              </Box>

              {isClosed && (
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontFamily: "fontFamily.secondary" }}
                  >
                    Cierre: {formatDateTime(currentSession.closedAt)}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ fontFamily: "fontFamily.secondary" }}
                  >
                    Cerrada por: {currentSession.closedByNameSnapshot || "-"}
                  </Typography>
                </Box>
              )}
            </ReportSection>

            <ReportSection title="VENTAS Y PEDIDOS">
              <AmountRow
                label="VENTAS COBRADAS"
                value={totals.totalSalesAmount}
              />

              <AmountRow
                label="VENTAS EN EFECTIVO"
                value={totals.totalCashSalesAmount}
              />

              <AmountRow
                label="FINALIZADOS PENDIENTES DE COBRO"
                value={totals.totalUnpaidAmount}
              />

              <Divider />

              <Typography
                variant="body2"
                sx={{ fontFamily: "fontFamily.secondary" }}
              >
                Pedidos asociados: {totals.totalAssociatedOrders || 0}
              </Typography>

              <Typography
                variant="body2"
                sx={{ fontFamily: "fontFamily.secondary" }}
              >
                Pedidos cobrados: {totals.totalPaidOrders || 0}
              </Typography>

              <Typography
                variant="body2"
                sx={{ fontFamily: "fontFamily.secondary" }}
              >
                Cobrados todavía en preparación/envío:{" "}
                {totals.totalPaidOperationalOrders || 0}
              </Typography>

              <Typography
                variant="body2"
                sx={{ fontFamily: "fontFamily.secondary" }}
              >
                Finalizados pendientes: {totals.totalUnpaidOrders || 0}
              </Typography>

              <Typography
                variant="body2"
                sx={{ fontFamily: "fontFamily.secondary" }}
              >
                Cancelados: {totals.totalCancelledOrders || 0}
              </Typography>
            </ReportSection>

            <ReportSection title="MÉTODOS DE PAGO">
              {paymentMethods.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No hay cobros registrados.
                </Typography>
              ) : (
                paymentMethods.map((method) => (
                  <AmountRow
                    key={method.paymentMethod}
                    label={`${method.paymentMethod} · ${method.totalOrders} pedido/s`}
                    value={method.totalAmount}
                  />
                ))
              )}
            </ReportSection>

            <ReportSection title="EFECTIVO DE CAJA">
              <AmountRow label="MONTO INICIAL" value={totals.openingAmount} />

              <AmountRow
                label="VENTAS EN EFECTIVO"
                value={totals.totalCashSalesAmount}
              />

              <AmountRow label="INGRESOS MANUALES" value={totals.totalCashIn} />

              <AmountRow
                label="RETIROS MANUALES"
                value={-Number(totals.totalCashOut || 0)}
              />

              <AmountRow
                label="IMPACTO LIQUIDACIÓN RIDERS"
                value={totals.totalRiderCashImpact}
              />

              <Divider />

              <AmountRow
                label={
                  isClosed
                    ? "EFECTIVO ESPERADO AL CERRAR"
                    : "EFECTIVO ESPERADO ACTUAL"
                }
                value={historicalExpected}
                color="primary.main"
              />

              {isClosed && (
                <>
                  <AmountRow
                    label="EFECTIVO CONTADO"
                    value={currentSession.countedCashAmount}
                  />

                  <AmountRow
                    label="DIFERENCIA DEL CIERRE"
                    value={difference}
                    color={differenceColor}
                  />
                </>
              )}

              {hasHistoricalDifference && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    border: "1px solid",
                    borderColor: "warning.main",
                    bgcolor: "background.main",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "fontFamily.secondary",
                      color: "warning.main",
                      fontSize: 12,
                    }}
                  >
                    El cálculo actual difiere del importe registrado al cerrar.
                    Esto puede deberse a modificaciones posteriores de los datos
                    históricos.
                  </Typography>

                  <AmountRow
                    label="Esperado recalculado"
                    value={calculatedExpected}
                  />
                </Paper>
              )}
            </ReportSection>

            {riderClosures.length > 0 && (
              <ReportSection title="LIQUIDACIONES DE DELIVERY">
                <Stack direction="row" spacing={1} alignItems="center">
                  <RiderIcon color="primary" fontSize="small" />

                  <Typography
                    variant="body2"
                    sx={{ fontFamily: "fontFamily.secondary" }}
                  >
                    {riderClosures.length} liquidaciones vinculadas
                  </Typography>
                </Stack>

                <AmountRow
                  label="TOTAL PAGADO A RIDERS"
                  value={totals.totalRiderPayout}
                />

                <AmountRow
                  label="IMPACTO NETO EN CAJA"
                  value={totals.totalRiderCashImpact}
                />

                <Divider />

                {riderClosures.map((closure) => (
                  <Paper
                    key={closure.id}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "background.main",
                    }}
                  >
                    <Stack spacing={0.75}>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1.5,
                          borderBottom: "1px solid",
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: "fontFamily.primary",
                            fontSize: "1rem",
                            color: "primary.main",
                          }}
                        >
                          {closure.rider?.name || "Delivery"}
                        </Typography>

                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: "fontFamily.primary",
                            fontSize: "1rem",
                            color: "text.primary",
                          }}
                        >
                          {formatDateTime(closure.closedAt)} ·{" "}
                          {closure.ordersCount || 0} VIAJES
                        </Typography>
                      </Box>

                      <AmountRow
                        label="EFECTIVO COBRADO EN PEDIDOS"
                        value={closure.cashCollected}
                      />

                      <AmountRow
                        label="CAMBIO INICIAL"
                        value={closure.initialCash}
                      />

                      <AmountRow
                        label="EFECTIVO ENTREGADO"
                        value={closure.cashDelivered}
                      />

                      <AmountRow
                        label="COSTO DE ENVÍOS"
                        value={closure.deliveryFeeTotal}
                      />

                      <AmountRow
                        label="AJUSTES"
                        value={closure.adjustmentsTotal}
                      />

                      <AmountRow
                        label="DIFERENCIA DEL RIDER"
                        value={closure.cashDifference}
                      />

                      <AmountRow
                        label="PAGO AL RIDER"
                        value={closure.riderShouldKeep}
                      />

                      <AmountRow
                        label="IMPACTO EN CAJA"
                        value={
                          Number(closure.cashDifference || 0) -
                          Number(closure.riderShouldKeep || 0)
                        }
                      />
                    </Stack>
                  </Paper>
                ))}
              </ReportSection>
            )}

            {movements.length > 0 && (
              <ReportSection title="MOVIMIENTOS MANUALES">
                {movements.map((movement) => (
                  <Paper
                    key={movement.id}
                    elevation={0}
                    sx={{
                      p: 1.25,
                      borderRadius: 2,
                      bgcolor: "background.main",
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      spacing={2}
                    >
                      <Box>
                        <Typography
                          sx={{
                            fontFamily: "fontFamily.secondary",
                            fontSize: "0.9rem",
                          }}
                        >
                          {movement.type === "CASH_IN" ? "Ingreso" : "Retiro"} ·{" "}
                          {movement.reason}
                        </Typography>

                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: "fontFamily.secondary",
                            color: "text.secondary",
                          }}
                        >
                          {formatDateTime(movement.createdAt)} ·{" "}
                          {movement.createdByNameSnapshot || "-"}
                        </Typography>
                      </Box>

                      <Typography
                        variant="body1"
                        sx={{
                          fontFamily: "fontFamily.primary",
                          color:
                            movement.type === "CASH_IN"
                              ? "success.main"
                              : "error.main",
                        }}
                      >
                        {money(
                          (movement.type === "CASH_IN" ? 1 : -1) *
                            Number(movement.amount || 0),
                        )}
                      </Typography>
                    </Stack>
                  </Paper>
                ))}
              </ReportSection>
            )}

            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.main",
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <CashIcon fontSize="small" color="primary" />

                <Typography
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    fontSize: "0.9rem",
                    color: "text.primary",
                  }}
                >
                  Consulta histórica de sólo lectura (no modifica pedidos,
                  movimientos ni cierres)
                </Typography>
              </Stack>
            </Paper>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          fullWidth
          color="primary"
          variant="contained"
          disabled={loading}
          onClick={onClose}
          sx={{ fontFamily: "fontFamily.primary" }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
