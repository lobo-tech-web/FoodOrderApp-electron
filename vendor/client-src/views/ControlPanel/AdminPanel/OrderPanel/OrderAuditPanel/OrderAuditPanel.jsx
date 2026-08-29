import { useCallback, useEffect, useMemo, useState } from "react";

// ---- MATERIAL UI ----
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
// Icons
import {
  Cancel as CancelIcon,
  History as HistoryIcon,
  Payment as PaymentIcon,
  Refresh as RefreshIcon,
  ReceiptLong as ReceiptIcon,
  SwapHoriz as ChangeIcon,
} from "@mui/icons-material";
// ---------------------

// ---- COMPONENTS ----
import { ModalOrderAudit } from "@/components/PanelComponents/ModalOrderAudit/ModalOrderAudit.jsx";
// --------------------

// ---- SERVICES ----
import { getDailyOrderAuditService } from "@/services/orderAudit.js";
// ------------------

// ---- HOOKS ----
import { useAlert } from "@/hooks/Alert.jsx";
// ---------------

// ---- Utils ----
import {
  ACTION_SHORT_LABELS,
  ACTION_COLORS,
  getArgentinaToday,
  formatDate,
} from "@/utils/orderAuditUtils";
// ---------------

export const OrderAuditPanel = ({ user }) => {
  const { AlertComponent, showAlert } = useAlert();
  const [loading, setLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState(getArgentinaToday);
  const [auditData, setAuditData] = useState({
    summary: {},
    orders: [],
  });

  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [auditModalOpen, setAuditModalOpen] = useState(false);

  const canReadAudit =
    user?.role === "admin" ||
    user?.role === "dev" ||
    (user?.role === "staff" && user?.permissions?.orders?.readAudit === true);

  const fetchAudit = useCallback(async () => {
    if (!selectedDate || !canReadAudit) {
      return;
    }

    setLoading(true);

    try {
      const response = await getDailyOrderAuditService({ date: selectedDate });

      setAuditData({
        summary: response?.summary || {},
        orders: Array.isArray(response?.orders) ? response.orders : [],
      });
    } catch (error) {
      showAlert(error?.message || "Error al obtener auditorías", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedDate, canReadAudit, showAlert]);

  useEffect(() => {
    fetchAudit();
  }, [fetchAudit]);

  const summaryCards = useMemo(
    () => [
      {
        title: "PEDIDOS MODIFICADOS",
        value: auditData.summary?.affectedOrders || 0,
        icon: <ReceiptIcon />,
      },

      {
        title: "CAMBIOS REGISTRADOS",
        value: auditData.summary?.totalEvents || 0,
        icon: <ChangeIcon />,
      },

      {
        title: "CANCELACIONES",
        value: auditData.summary?.cancellations || 0,
        icon: <CancelIcon />,
      },

      {
        title: "CAMBIOS DE PAGO",
        value: auditData.summary?.paymentChanges || 0,
        icon: <PaymentIcon />,
      },
    ],
    [auditData.summary],
  );

  const handleOpenOrderAudit = (orderId) => {
    setSelectedOrderId(orderId);
    setAuditModalOpen(true);
  };

  if (!canReadAudit) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          sx={{
            fontFamily: "fontFamily.secondary",

            color: "text.secondary",
          }}
        >
          No tenés permisos para visualizar las auditorías de pedidos.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Stack spacing={2}>
        {/* HEADER */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            justifyContent="space-between"
            alignItems={{
              xs: "stretch",
              sm: "center",
            }}
            spacing={2}
          >
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <HistoryIcon color="primary" />

                <Typography sx={{ fontFamily: "fontFamily.primary" }}>
                  AUDITORÍA DE PEDIDOS
                </Typography>
              </Stack>

              <Typography
                sx={{
                  mt: 0.5,
                  fontFamily: "fontFamily.secondary",
                  color: "text.secondary",
                  fontSize: 13,
                }}
              >
                Revisá las modificaciones realizadas en los pedidos durante un
                día.
              </Typography>
            </Box>

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1}
            >
              <TextField
                type="date"
                size="small"
                label="Fecha"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <Button
                variant="contained"
                startIcon={
                  loading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <RefreshIcon />
                  )
                }
                disabled={loading}
                onClick={fetchAudit}
                sx={{
                  fontFamily: "fontFamily.primary",
                }}
              >
                Actualizar
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* RESUMEN */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 1.5,
          }}
        >
          {summaryCards.map((item) => (
            <Paper
              key={item.title}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={1}
              >
                <Box>
                  <Typography
                    sx={{
                      fontFamily: "fontFamily.secondary",
                      color: "text.secondary",
                      fontSize: 11,
                    }}
                  >
                    {item.title}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontFamily: "fontFamily.primary",
                      fontSize: 24,
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>

                <Box sx={{ color: "primary.main" }}>{item.icon}</Box>
              </Stack>
            </Paper>
          ))}
        </Box>

        {/* LISTADO */}

        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
          }}
        >
          {loading ? (
            <Box
              sx={{
                py: 8,
                display: "grid",
                placeItems: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : auditData.orders.length === 0 ? (
            <Box
              sx={{
                py: 7,
                textAlign: "center",
              }}
            >
              <HistoryIcon
                sx={{
                  fontSize: 42,
                  color: "text.disabled",
                }}
              />

              <Typography sx={{ mt: 1, fontFamily: "fontFamily.primary" }}>
                SIN MODIFICACIONES
              </Typography>

              <Typography
                sx={{
                  fontFamily: "fontFamily.secondary",
                  color: "text.secondary",
                  fontSize: 13,
                }}
              >
                No se registraron cambios en pedidos durante esta fecha.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>PEDIDO</TableCell>
                    <TableCell>CLIENTE</TableCell>
                    <TableCell>ESTADO</TableCell>
                    <TableCell>CAMBIOS</TableCell>
                    <TableCell>USUARIOS</TableCell>
                    <TableCell>ÚLTIMO CAMBIO</TableCell>
                    <TableCell align="right">DETALLE</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {auditData.orders.map((order) => (
                    <TableRow key={order.orderId} hover>
                      <TableCell>
                        <Typography sx={{ fontFamily: "fontFamily.primary" }}>
                          #{order.orderId}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography sx={{ fontFamily: "fontFamily.secondary" }}>
                          {order.clientName}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={order.currentStatus || "Sin estado"}
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          {Object.entries(order.actionCounts || {}).map(
                            ([action, count]) => (
                              <Chip
                                key={action}
                                size="small"
                                color={ACTION_COLORS[action] || "default"}
                                label={`${
                                  ACTION_SHORT_LABELS[action] || action
                                } · ${count}`}
                              />
                            ),
                          )}
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Stack spacing={0.3}>
                          {(order.actors || []).map((actor, index) => (
                            <Typography
                              key={`${actor.type}-${actor.name}-${index}`}
                              sx={{
                                fontFamily: "fontFamily.secondary",
                                fontSize: 12,
                              }}
                            >
                              {actor.name}{" "}
                              <Box
                                component="span"
                                sx={{ color: "text.secondary" }}
                              >
                                ({actor.type})
                              </Box>
                            </Typography>
                          ))}
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{
                            fontFamily: "fontFamily.secondary",
                            fontSize: 13,
                          }}
                        >
                          {formatDate(order.lastChangedAt)}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<HistoryIcon />}
                          onClick={() => handleOpenOrderAudit(order.orderId)}
                          sx={{
                            fontFamily: "fontFamily.primary",
                          }}
                        >
                          Historial
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Stack>

      <ModalOrderAudit
        open={auditModalOpen}
        orderId={selectedOrderId}
        showAlert={showAlert}
        onClose={() => {
          setAuditModalOpen(false);
          setSelectedOrderId(null);
        }}
      />

      {AlertComponent}
    </Box>
  );
};
