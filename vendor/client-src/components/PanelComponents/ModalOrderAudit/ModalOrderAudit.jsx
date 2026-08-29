import { useEffect, useState } from "react";

// ---- Material UI ----
import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
// Iconss
import {
  Close as CloseIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  AttachMoney as MoneyIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Services -----
import { getOrderAuditLogsService } from "@/services/orderAudit.js";
// -------------------

const ACTION_LABELS = {
  CREATE: "Pedido creado",
  UPDATE: "Pedido modificado",
  STATUS_CHANGE: "Estado modificado",
  PAYMENT_CHANGE: "Pago modificado",
  CANCEL: "Pedido cancelado",
};

const ACTION_COLORS = {
  CREATE: "success",
  UPDATE: "info",
  STATUS_CHANGE: "primary",
  PAYMENT_CHANGE: "warning",
  CANCEL: "error",
};

const ACTION_ICONS = {
  CREATE: <AddIcon />,
  UPDATE: <EditIcon />,
  STATUS_CHANGE: <PendingIcon />,
  PAYMENT_CHANGE: <MoneyIcon />,
  CANCEL: <CancelIcon />,
};

const FIELD_LABELS = {
  status: "Estado",
  clientName: "Cliente",
  clientEmail: "Email",
  contactPhone: "Teléfono",
  deliveryAddress: "Dirección",
  orderType: "Entrega",
  paymentMethod: "Método de pago",
  deliverycost: "Costo de delivery",
  servicetax: "Servicio",
  discount: "Descuento",
  discountamount: "Monto descuento",
  extraPoints: "Puntos adicionales",
  riderId: "Cadete",
  comentary: "Comentario",
  cartItems: "Productos",
  totalAmount: "Total",
  totalRewardPoints: "Puntos otorgados",
  totalRedeemPoints: "Puntos canjeados",
};

const AUDIT_VISIBLE_FIELDS = [
  "status",
  "clientName",
  "clientEmail",
  "contactPhone",
  "deliveryAddress",
  "orderType",
  "paymentMethod",
  "cartItems",
  "deliverycost",
  "servicetax",
  "discount",
  "discountamount",
  "extraPoints",
  "riderId",
  "comentary",
  "totalAmount",
  "totalRewardPoints",
  "totalRedeemPoints",
];

const parseData = (value) => {
  if (!value) return {};

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const formatValue = (field, value) => {
  if (field === "cartItems" && Array.isArray(value)) {
    return `${value.length} producto(s)`;
  }

  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};

const getChanges = (log) => {
  const before = parseData(log.beforeData);
  const after = parseData(log.afterData);

  if (log.action === "CREATE") return [];

  return AUDIT_VISIBLE_FIELDS.filter(
    (field) =>
      JSON.stringify(before?.[field]) !== JSON.stringify(after?.[field]),
  ).map((field) => ({
    field,
    label: FIELD_LABELS[field] || field,
    before: formatValue(field, before?.[field]),
    after: formatValue(field, after?.[field]),
  }));
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
};

export const ModalOrderAudit = ({ open, orderId, onClose, showAlert }) => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!open || !orderId) return;

    const fetchLogs = async () => {
      setLogs([]);
      setLoading(true);

      try {
        const response = await getOrderAuditLogsService(orderId);

        setLogs(Array.isArray(response) ? response : []);
      } catch (error) {
        showAlert?.(error?.message || "Error al obtener auditoría", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [open, orderId, showAlert]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: "background.main" }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <HistoryIcon color="primary" />

            <Typography variant="h6" sx={{ fontFamily: "fontFamily.primary" }}>
              AUDITORÍA PEDIDO #{orderId}
            </Typography>
          </Stack>

          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent
        sx={{
          bgcolor: "background.default",
        }}
      >
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
        ) : logs.length === 0 ? (
          <Typography
            sx={{
              py: 4,
              textAlign: "center",
              color: "text.primary",
            }}
          >
            Este pedido todavía no posee registros de auditoría.
          </Typography>
        ) : (
          <Stack spacing={1.5} sx={{ py: 1 }}>
            {logs.map((log) => {
              const changes = getChanges(log);

              return (
                <Paper
                  key={log.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    bgcolor: "background.paper",
                  }}
                >
                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Box>
                      <Chip
                        size="small"
                        icon={ACTION_ICONS[log.action] || <EditIcon />}
                        color={ACTION_COLORS[log.action] || "default"}
                        label={ACTION_LABELS[log.action] || log.action}
                        sx={{ fontFamily: "fontFamily.secondary" }}
                      />

                      <Stack
                        direction="row"
                        spacing={0.7}
                        alignItems="center"
                        sx={{
                          mt: 1,
                        }}
                      >
                        <PersonIcon fontSize="small" color="primary" />

                        <Typography
                          sx={{
                            fontFamily: "fontFamily.secondary",
                            textTransform: "uppercase",
                          }}
                        >
                          {log.changedByNameSnapshot || "Sistema"}
                        </Typography>

                        <Typography
                          sx={{
                            fontFamily: "fontFamily.secondary",
                            fontSize: 13,
                            textTransform: "lowercase",
                          }}
                        >
                          ({log.changedByType})
                        </Typography>
                      </Stack>
                    </Box>

                    <Typography
                      sx={{ fontFamily: "fontFamily.secondary", fontSize: 13 }}
                    >
                      {formatDate(log.createdAt)}
                    </Typography>
                  </Stack>

                  {log.reason && (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Typography
                        sx={{
                          fontFamily: "fontFamily.secondary",
                          color: "primary.main",
                          mt: 1,
                        }}
                      >
                        Motivo:
                      </Typography>

                      <Typography
                        sx={{
                          fontFamily: "fontFamily.secondary",
                          color: "text.primary",
                          mt: 1,
                        }}
                      >
                        {log.reason}
                      </Typography>
                    </Box>
                  )}

                  {changes.length > 0 && (
                    <>
                      <Divider
                        sx={{
                          my: 1.5,
                        }}
                      />

                      <Stack spacing={1}>
                        {changes.map((change) => (
                          <Box key={change.field}>
                            <Typography
                              sx={{
                                fontFamily: "fontFamily.primary",
                                fontSize: 13,
                                textTransform: "uppercase",
                              }}
                            >
                              {change.label}
                            </Typography>

                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                alignItems: "center",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontFamily: "fontFamily.secondary",
                                  color: "text.secondary",
                                  fontSize: 13,
                                }}
                              >
                                {change.before}
                              </Typography>
                              <Typography
                                sx={{
                                  fontFamily: "fontFamily.secondary",
                                  color: "text.primary",
                                  fontSize: 14,
                                }}
                              >
                                →
                              </Typography>
                              <Typography
                                sx={{
                                  fontFamily: "fontFamily.secondary",
                                  color: "success.main",
                                  fontSize: 13,
                                }}
                              >
                                {change.after}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    </>
                  )}
                </Paper>
              );
            })}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
};
