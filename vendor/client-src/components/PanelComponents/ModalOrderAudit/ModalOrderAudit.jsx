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
  Paid as PaidIcon,
  MoneyOff as MoneyOffIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Services -----
import { getOrderAuditLogsService } from "@/services/orderAudit.js";
// -------------------

// ---- Utils ----
import {
  ACTION_LABELS,
  ACTION_COLORS,
  getChanges,
  formatDate,
} from "@/utils/orderAuditUtils.js";
import { statusOptions } from "@/utils/components/StatusUtils.jsx";
import { orderTypeOptions } from "@/utils/components/OrderTypeUtils.jsx";
import { paymentMethods } from "@/utils/components/PaymentUtils.jsx";
import { discountMethods } from "@/utils/components/DiscountUtils.jsx";
// ---------------

const ACTION_ICONS = {
  CREATE: <AddIcon />,
  UPDATE: <EditIcon />,
  STATUS_CHANGE: <PendingIcon />,
  PAYMENT_CHANGE: <MoneyIcon />,
  CANCEL: <CancelIcon />,
};

const findOptionIcon = (options, value) => {
  return options.find((option) => option.value === value)?.icon || null;
};

const getAuditValueIcon = (field, value) => {
  if (!value && value !== 0) {
    return null;
  }

  switch (field) {
    case "status":
      return findOptionIcon(statusOptions, value);

    case "orderType":
      return findOptionIcon(orderTypeOptions, value);

    case "paymentMethod":
      return findOptionIcon(paymentMethods, value);

    case "isPaid":
      return value === true || value === "true" ? (
        <PaidIcon sx={{ color: "success.main" }} />
      ) : (
        <MoneyOffIcon sx={{ color: "warning.main" }} />
      );

    case "discount":
      return findOptionIcon(discountMethods, "PORCENTAJE");

    case "discountamount":
      return findOptionIcon(discountMethods, "MONTO");

    default:
      return null;
  }
};

const AuditValue = ({
  field,
  rawValue,
  formattedValue,
  color = "text.primary",
}) => {
  const icon = getAuditValueIcon(field, rawValue);

  return (
    <Stack
      direction="row"
      spacing={0.6}
      alignItems="center"
      sx={{
        minWidth: 0,
      }}
    >
      {icon && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            "& svg": { fontSize: 18 },
          }}
        >
          {icon}
        </Box>
      )}

      <Typography
        sx={{
          fontFamily: "fontFamily.secondary",
          color,
          fontSize: 13,
        }}
      >
        {formattedValue}
      </Typography>
    </Stack>
  );
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
                                mt: 0.4,
                                display: "flex",
                                gap: 1,
                                alignItems: "center",
                                flexWrap: "wrap",
                              }}
                            >
                              <AuditValue
                                field={change.field}
                                rawValue={change.beforeValue}
                                formattedValue={change.before}
                                color="text.secondary"
                              />

                              <Typography
                                sx={{
                                  fontFamily: "fontFamily.secondary",
                                  color: "text.secondary",
                                  fontSize: 15,
                                }}
                              >
                                →
                              </Typography>

                              <AuditValue
                                field={change.field}
                                rawValue={change.afterValue}
                                formattedValue={change.after}
                                color="success.main"
                              />
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
