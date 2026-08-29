import { useCallback, useEffect, useMemo, useState } from "react";

// ---- Material UI ----
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
// Icons
import {
  History as HistoryIcon,
  ReceiptLong as ReceiptIcon,
  Refresh as RefreshIcon,
  PointOfSale as PointOfSaleIcon,
} from "@mui/icons-material";
// -----------------------

// ---- Components ----
import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent.jsx";
// --------------------

// ---- Services ----
import {
  getCashSessionsService,
  getCashSessionReportService,
} from "@/services/cashRegister.js";
// ------------------

// ---- Utils ----
import { formatMoney, hasPermission } from "@/utils/cashRegisterUtils.js";
// ---------------

const formatArgentinaDateTime = (value) => {
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

export const CashRegisterHistoryPanel = ({ user, refreshKey, showAlert }) => {
  const isElectronApp =
    typeof window !== "undefined" && Boolean(window.electronAPI);
  const [loading, setLoading] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const restaurantId = useMemo(
    () => (user?.role === "staff" ? user.restaurantId : user?.id),
    [user?.id, user?.restaurantId, user?.role],
  );

  const canReadReport = hasPermission(user, "cashRegister", "readReport");

  const fetchSessions = useCallback(async () => {
    if (!restaurantId || !canReadReport) {
      return;
    }

    setLoading(true);

    try {
      const response = await getCashSessionsService({
        restaurantId,
        limit: 30,
      });

      setSessions(Array.isArray(response) ? response : []);
    } catch (error) {
      showAlert?.(error?.message || "Error al obtener las cajas", "error");
    } finally {
      setLoading(false);
    }
  }, [restaurantId, canReadReport, showAlert]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions, refreshKey]);

  const handleViewReport = async (session) => {
    setReportLoading(true);

    try {
      const response = await getCashSessionReportService(session.id);

      setSelectedReport(response);
    } catch (error) {
      showAlert?.(error?.message || "Error al obtener el reporte", "error");
    } finally {
      setReportLoading(false);
    }
  };

  if (!canReadReport) return null;

  if (reportLoading) return <LoadingComponent message="Cargando detalle..." />;

  return (
    <Box
      sx={{
        width: "100%",
        height: isElectronApp ? "calc(100vh - 112px)" : "auto",
        overflowY: isElectronApp ? "auto" : "visible",
        overflowX: isElectronApp ? "auto" : "visible",
        pr: isElectronApp ? 1 : 0,
        pb: isElectronApp ? 3 : 0,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          bgcolor: "background.main",
        }}
      >
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          justifyContent="space-between"
          spacing={1}
          mb={2}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <HistoryIcon color="primary" />

            <Box>
              <Typography
                sx={{
                  fontFamily: "fontFamily.primary",
                  fontWeight: "bold",
                }}
              >
                REGISTRO DE CAJAS
              </Typography>

              <Typography
                sx={{
                  fontFamily: "fontFamily.secondary",
                  fontSize: 13,
                  color: "text.secondary",
                }}
              >
                Últimas aperturas y cierres registrados.
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<RefreshIcon />}
            onClick={fetchSessions}
            disabled={loading}
            sx={{ fontFamily: "fontFamily.primary" }}
          >
            Actualizar Historial
          </Button>
        </Stack>

        {loading ? (
          <Box
            sx={{
              py: 5,
              display: "grid",
              placeItems: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={1}>
            {sessions.map((session) => (
              <Paper
                key={session.id}
                elevation={0}
                sx={{
                  bgcolor: "background.paper",
                  p: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                <Stack
                  direction={{
                    xs: "column",
                    md: "row",
                  }}
                  justifyContent="space-between"
                  spacing={1.5}
                >
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PointOfSaleIcon color="primary" />
                      <Typography
                        sx={{
                          fontFamily: "fontFamily.primary",
                          textTransform: "uppercase",
                          color: "primary.main",
                        }}
                      >
                        {session.registerName || "Caja Principal"}
                      </Typography>

                      <Chip
                        variant="outlined"
                        size="small"
                        label={
                          session.status === "OPEN" ? "ABIERTA" : "CERRADA"
                        }
                        sx={{
                          fontFamily: "fontFamily.secondary",
                          color:
                            session.status === "OPEN"
                              ? "success.main"
                              : "error.main",
                          borderColor:
                            session.status === "OPEN"
                              ? "success.main"
                              : "error.main",
                        }}
                      />
                    </Stack>

                    {/* <Typography
                      sx={{
                        fontFamily: "fontFamily.primary",
                        fontSize: 12,
                        textTransform: "lowercase",
                        color: "text.primary",
                      }}
                    >
                      Código: {session.registerCode}
                    </Typography> */}

                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={{ xs: 0.2, sm: 1.5 }}
                      sx={{ mt: 0.5 }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "fontFamily.secondary",
                          color: "text.secondary",
                          fontSize: 12,
                        }}
                      >
                        Apertura: {formatArgentinaDateTime(session.openedAt)}
                      </Typography>

                      {session.closedAt && (
                        <Typography
                          sx={{
                            fontFamily: "fontFamily.secondary",
                            color: "text.secondary",
                            fontSize: 12,
                          }}
                        >
                          Cierre: {formatArgentinaDateTime(session.closedAt)}
                        </Typography>
                      )}
                    </Stack>

                    <Typography
                      sx={{
                        fontFamily: "fontFamily.secondary",
                        fontSize: 13,
                        color: "text.primary",
                        mt: 1,
                      }}
                    >
                      Inicial:{" "}
                      <strong>{formatMoney(session.openingAmount)}</strong>
                    </Typography>

                    {session.status === "CLOSED" && (
                      <Typography
                        sx={{
                          fontFamily: "fontFamily.secondary",
                          fontSize: 13,
                          color: "text.primary",
                          mt: 1,
                        }}
                      >
                        Diferencia:{" "}
                        <strong>{formatMoney(session.differenceAmount)}</strong>
                      </Typography>
                    )}
                  </Box>

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ReceiptIcon />}
                    onClick={() => handleViewReport(session)}
                    sx={{ fontFamily: "fontFamily.secondary" }}
                  >
                    Ver detalle
                  </Button>
                </Stack>
              </Paper>
            ))}

            {!sessions.length && (
              <Typography color="text.secondary" textAlign="center" py={4}>
                Todavía no existen registros de caja.
              </Typography>
            )}
          </Stack>
        )}
      </Paper>

      <Dialog
        open={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "background.main" }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <ReceiptIcon color="primary" />
            <Typography
              variant="h6"
              sx={{
                fontFamily: "fontFamily.primary",
                fontWeight: "bold",
              }}
            >
              DETALLE DE CAJA
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ bgcolor: "background.default", pt: 2 }}>
          {selectedReport ? (
            <Stack spacing={1.5} mt={1}>
              <Typography sx={{ fontFamily: "fontFamily.secondary" }}>
                Ventas:{" "}
                <strong>
                  {formatMoney(selectedReport?.totals?.totalSalesAmount)}
                </strong>
              </Typography>

              <Typography sx={{ fontFamily: "fontFamily.secondary" }}>
                Ventas en efectivo:{" "}
                <strong>
                  {formatMoney(selectedReport?.totals?.totalCashSalesAmount)}
                </strong>
              </Typography>

              <Typography sx={{ fontFamily: "fontFamily.secondary" }}>
                Ingresos manuales:{" "}
                <strong>
                  {formatMoney(selectedReport?.totals?.totalCashIn)}
                </strong>
              </Typography>

              <Typography sx={{ fontFamily: "fontFamily.secondary" }}>
                Retiros:{" "}
                <strong>
                  {formatMoney(selectedReport?.totals?.totalCashOut)}
                </strong>
              </Typography>

              <Typography sx={{ fontFamily: "fontFamily.secondary" }}>
                Efectivo esperado:{" "}
                <strong>
                  {formatMoney(selectedReport?.totals?.expectedCashAmount)}
                </strong>
              </Typography>
            </Stack>
          ) : null}
        </DialogContent>

        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => setSelectedReport(null)}
            sx={{ fontFamily: "fontFamily.primary" }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
