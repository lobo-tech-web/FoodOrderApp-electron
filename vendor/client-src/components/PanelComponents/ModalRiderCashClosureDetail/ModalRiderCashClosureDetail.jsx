// ---- Material UI ----
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
// Icons
import {
  Close as CloseIcon,
  TwoWheeler as TwoWheelerIcon,
  Flag as FlagIcon,
  Payments as PaymentsIcon,
  ReceiptLong as ReceiptLongIcon,
  PriceCheck as PriceCheckIcon,
  Wallet as WalletIcon,
  Difference as DifferenceIcon,
  CalendarToday as CalendarTodayIcon,
  RequestQuote as RequestQuoteIcon,
  Person as PersonIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Utils ----
import { formatCurrency } from "@/utils/orderCalculations.js";
// ---------------

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const SummaryCard = ({ icon, label, value, color = "text.primary" }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 2.5,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.8 }}>
        {icon}

        <Typography
          sx={{
            fontFamily: "fontFamily.secondary",
            color: "text.secondary",
            fontSize: "0.78rem",
          }}
        >
          {label}
        </Typography>
      </Stack>

      <Typography
        sx={{
          display: "flex",
          justifyContent: "center",
          fontFamily: "fontFamily.primary",
          color,
          fontSize: "1.15rem",
          lineHeight: 1.1,
        }}
      >
        {value}
      </Typography>
    </Paper>
  );
};

export const ModalRiderCashClosureDetail = ({ open, onClose, closure }) => {
  const deliveries = closure?.deliveries || [];
  const adjustments = closure?.adjustments || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          bgcolor: "background.default",
          borderRadius: { xs: 0, sm: 4 },
          border: { xs: "none", sm: "1px solid" },
          borderColor: "primary.main",
          overflow: "hidden",
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
              color: "primary.main",
            }}
          >
            <RequestQuoteIcon />
          </Box>

          <Typography
            sx={{
              fontFamily: "fontFamily.primary",
              color: "text.primary",
              fontSize: { xs: "1rem", sm: "1.25rem" },
              lineHeight: 1,
            }}
          >
            DETALLE DEL CIERRE
          </Typography>

          <Chip
            size="small"
            label={closure?.status === "OPEN" ? "Abierto" : "Cerrado"}
            color={closure?.status === "OPEN" ? "success" : "warning"}
            sx={{ fontFamily: "fontFamily.secondary" }}
          />
        </Stack>

        <IconButton onClick={onClose}>
          <CloseIcon sx={{ color: "text.primary" }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 1, p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              flexWrap="wrap"
            >
              <Chip
                icon={<CalendarTodayIcon />}
                label={
                  closure?.closureDateLabel ||
                  closure?.closureDateKey ||
                  formatDate(closure?.closedAt || closure?.createdAt)
                }
                color="primary"
                variant="outlined"
                sx={{ fontFamily: "fontFamily.secondary" }}
              />

              <Chip
                icon={<TwoWheelerIcon />}
                label={`${closure?.rider?.name || "Rider"} - ${closure?.rider?.phone || "Sin teléfono"}`}
                variant="outlined"
                sx={{ fontFamily: "fontFamily.secondary" }}
              />

              <Chip
                icon={<FlagIcon />}
                label={`Creado: ${formatDate(closure?.createdAt)}`}
                color="success"
                variant="contained"
                sx={{ fontFamily: "fontFamily.secondary" }}
              />

              {closure?.closedAt && (
                <Chip
                  icon={<FlagIcon />}
                  label={`Cerrado: ${formatDate(closure.closedAt)}`}
                  color="error"
                  variant="contained"
                  sx={{ fontFamily: "fontFamily.secondary" }}
                />
              )}
            </Stack>
          </Paper>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 1.5,
            }}
          >
            <SummaryCard
              icon={<ReceiptLongIcon color="primary" />}
              label="Pedidos repartidos"
              value={closure?.ordersCount || 0}
            />

            <SummaryCard
              icon={<PaymentsIcon color="success" />}
              label="Efectivo cobrado"
              value={formatCurrency(closure?.cashCollected || 0)}
            />

            <SummaryCard
              icon={<PriceCheckIcon color="primary" />}
              label="Se queda el rider"
              value={formatCurrency(closure?.riderShouldKeep || 0)}
              color="success.main"
            />

            <SummaryCard
              icon={<DifferenceIcon color="warning" />}
              label="Diferencia"
              value={formatCurrency(closure?.cashDifference || 0)}
              color={
                Number(closure?.cashDifference || 0) === 0
                  ? "success.main"
                  : Number(closure?.cashDifference || 0) > 0
                    ? "info.main"
                    : "error.main"
              }
            />

            <SummaryCard
              icon={<WalletIcon />}
              label="Cambio inicial"
              value={formatCurrency(closure?.initialCash || 0)}
            />

            <SummaryCard
              icon={<PaymentsIcon color="primary" />}
              label="Efectivo entregado"
              value={formatCurrency(closure?.cashDelivered || 0)}
            />

            <SummaryCard
              icon={<TwoWheelerIcon color="warning" />}
              label="Deliverys"
              value={formatCurrency(closure?.deliveryFeeTotal || 0)}
            />

            <SummaryCard
              icon={<PriceCheckIcon color="secondary" />}
              label="Ajustes"
              value={formatCurrency(closure?.adjustmentsTotal || 0)}
            />
          </Box>

          {adjustments.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box sx={{ display: "flex", gap: 1 }}>
                <RequestQuoteIcon />
                <Typography
                  sx={{
                    fontFamily: "fontFamily.primary",
                    color: "primary.main",
                    mb: 1.5,
                  }}
                >
                  AJUSTES DEL CIERRE
                </Typography>
              </Box>

              <Stack spacing={1}>
                {adjustments.map((adjustment) => (
                  <Box
                    key={adjustment.id}
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: "background.default",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: "fontFamily.secondary",
                          color: "text.primary",
                          fontSize: "0.88rem",
                        }}
                      >
                        {adjustment.description || "Ajuste"}
                      </Typography>

                      <Typography
                        sx={{
                          fontFamily: "fontFamily.secondary",
                          color: "text.secondary",
                          fontSize: "0.75rem",
                        }}
                      >
                        {adjustment.type === "CHARGE"
                          ? "Resta al rider"
                          : "Suma al rider"}
                      </Typography>
                    </Box>

                    <Typography
                      sx={{
                        fontFamily: "fontFamily.primary",
                        color:
                          adjustment.type === "CHARGE"
                            ? "error.main"
                            : "success.main",
                      }}
                    >
                      {adjustment.type === "CHARGE" ? "-" : "+"}
                      {formatCurrency(adjustment.amount || 0)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          )}

          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <ReceiptLongIcon />
              <Typography
                sx={{
                  fontFamily: "fontFamily.primary",
                  color: "primary.main",
                  mb: 1.5,
                }}
              >
                PEDIDOS INCLUIDOS
              </Typography>
            </Box>

            {deliveries.length === 0 ? (
              <Typography
                sx={{
                  fontFamily: "fontFamily.secondary",
                  color: "text.secondary",
                }}
              >
                Este cierre no tiene pedidos asociados.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {deliveries.map((delivery) => {
                  const order = delivery.order || {};

                  return (
                    <Box
                      key={delivery.id}
                      sx={{
                        bgcolor: "background.default",
                        display: "flex",
                        justifyContent: "space-around",
                        alignItems: "center",
                        gap: 1,
                        p: 1.2,
                        borderRadius: 2,
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <ReceiptLongIcon fontSize="small" />
                        <Typography
                          sx={{
                            fontFamily: "fontFamily.primary",
                            color: "primary.main",
                            fontSize: "0.85rem",
                          }}
                        >
                          ID# {order.id || delivery.orderId}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                        }}
                      >
                        <Box
                          sx={{ display: "flex", gap: 1, alignItems: "center" }}
                        >
                          <PersonIcon fontSize="small" />
                          <Typography
                            sx={{
                              fontFamily: "fontFamily.secondary",
                              color: "primary.main",
                              fontSize: "0.80rem",
                              textTransform: "uppercase",
                            }}
                          >
                            {order.clientName || "Cliente"}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            alignItems: "center",
                          }}
                        >
                          <HomeIcon fontSize="small" />
                          <Typography
                            sx={{
                              fontFamily: "fontFamily.secondary",
                              color: "primary.main",
                              fontSize: "0.80rem",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              textTransform: "uppercase",
                            }}
                          >
                            {order.deliveryAddress || "Sin dirección"}
                          </Typography>
                        </Box>
                      </Box>

                      <Chip
                        size="small"
                        label={order.paymentMethod || "-"}
                        color="success"
                        variant="contained"
                        sx={{ fontFamily: "fontFamily.secondary" }}
                      />

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Typography
                            sx={{
                              fontFamily: "fontFamily.secondary",
                              color: "text.primary",
                            }}
                          >
                            Total del pedido:
                          </Typography>
                          <Typography
                            sx={{
                              fontFamily: "fontFamily.primary",
                              color: "text.primary",
                            }}
                          >
                            {formatCurrency(
                              order.totalAmount || delivery.orderTotal || 0,
                            )}
                          </Typography>
                        </Box>

                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Typography
                            sx={{
                              fontFamily: "fontFamily.secondary",
                              color: "success.main",
                              fontSize: 16,
                            }}
                          >
                            Costo del Envío:
                          </Typography>
                          <Typography
                            sx={{
                              fontFamily: "fontFamily.primary",
                              color: "success.main",
                            }}
                          >
                            {formatCurrency(delivery.deliveryCost || 0)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
