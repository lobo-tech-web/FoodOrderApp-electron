import { useEffect, useMemo, useState } from "react";

// ---- MATERIAL UI ----
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
// ICONS
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Moped as MopedIcon,
  Payments as PaymentsIcon,
  RequestQuote as RequestQuoteIcon,
  Refresh as RefreshIcon,
  ReceiptLong as ReceiptLongIcon,
  CalendarToday as CalendarTodayIcon,
  PriceCheck as PriceCheckIcon,
} from "@mui/icons-material";
// ---------------------

// ---- SERVICES ----
import { getPendingRiderDeliveriesSummaryService } from "@/services/riderCashClosures.js";
// ------------------

import { formatCurrency } from "@/utils/orderCalculations.js";

const StatCard = ({ icon, label, value }) => {
  return (
    <Card
      sx={{
        flex: 1,
        p: 2,
        borderRadius: 3,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
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
            color: "primary.main",
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography
            sx={{
              fontFamily: "fontFamily.secondary",
              color: "text.secondary",
              fontSize: "0.78rem",
            }}
          >
            {label}
          </Typography>

          <Typography
            sx={{
              fontFamily: "fontFamily.primary",
              color: "text.primary",
              fontSize: "1.15rem",
              lineHeight: 1.1,
            }}
          >
            {value}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
};

const PendingDateGroup = ({ group, onOpenClosure }) => {
  const [open, setOpen] = useState(true);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.5,
          bgcolor: "background.main",
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <IconButton size="small" onClick={() => setOpen((prev) => !prev)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>

          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(245, 166, 35, 0.12)",
              color: "primary.main",
            }}
          >
            <CalendarTodayIcon />
          </Box>

          <Box>
            <Typography
              sx={{
                fontFamily: "fontFamily.primary",
                color: "text.primary",
                fontSize: { xs: "1rem", sm: "1.12rem" },
                lineHeight: 1,
              }}
            >
              {group.dateLabel}
            </Typography>

            <Typography
              sx={{
                fontFamily: "fontFamily.secondary",
                color: "text.secondary",
                fontSize: "0.82rem",
                mt: 0.5,
              }}
            >
              {group.riders.length} rider
              {group.riders.length === 1 ? "" : "s"} con cierres pendientes
            </Typography>
          </Box>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Chip
            icon={<MopedIcon />}
            label={`${group.totalTrips} viajes`}
            variant="outlined"
            sx={{ fontFamily: "fontFamily.secondary" }}
          />

          <Chip
            icon={<PaymentsIcon />}
            label={`Efectivo: ${formatCurrency(group.totalCashCollected)}`}
            color="success"
            variant="outlined"
            sx={{ fontFamily: "fontFamily.secondary" }}
          />

          <Chip
            icon={<PriceCheckIcon />}
            label={`Deliverys: ${formatCurrency(group.totalDeliveryFee)}`}
            color="primary"
            variant="outlined"
            sx={{ fontFamily: "fontFamily.secondary" }}
          />
        </Stack>
      </Box>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <Stack spacing={1.2} sx={{ p: { xs: 1.5, sm: 2 } }}>
          {group.riders.map((rider) => (
            <Paper
              key={rider.riderId}
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: 2.5,
                bgcolor: "background.default",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1.5}
                alignItems={{ xs: "stretch", md: "center" }}
                justifyContent="space-between"
              >
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: "primary.main",
                      color: "text.terciary",
                      fontFamily: "fontFamily.secondary",
                    }}
                  >
                    {rider.name?.charAt(0) || "R"}
                  </Avatar>

                  <Box>
                    <Typography
                      sx={{
                        fontFamily: "fontFamily.primary",
                        color: "text.primary",
                        lineHeight: 1.1,
                      }}
                    >
                      {rider.name}
                    </Typography>

                    <Typography
                      sx={{
                        fontFamily: "fontFamily.secondary",
                        color: "text.secondary",
                        fontSize: "0.8rem",
                        mt: 0.4,
                      }}
                    >
                      {rider.phone || "Sin teléfono"}
                    </Typography>
                  </Box>
                </Stack>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ xs: "stretch", sm: "center" }}
                >
                  <Chip
                    icon={<ReceiptLongIcon />}
                    label={`${rider.trips} pedidos`}
                    variant="outlined"
                    sx={{ fontFamily: "fontFamily.secondary" }}
                  />

                  <Chip
                    icon={<PaymentsIcon />}
                    label={`Efectivo: ${formatCurrency(rider.cashCollected)}`}
                    color="success"
                    variant="outlined"
                    sx={{ fontFamily: "fontFamily.secondary" }}
                  />

                  <Chip
                    icon={<PriceCheckIcon />}
                    label={`Rider: ${formatCurrency(rider.deliveryFeeTotal)}`}
                    color="primary"
                    variant="outlined"
                    sx={{ fontFamily: "fontFamily.secondary" }}
                  />

                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<RequestQuoteIcon />}
                    onClick={() =>
                      onOpenClosure({
                        id: rider.riderId,
                        name: rider.name,
                        phone: rider.phone,
                        closureDateKey: group.dateKey,
                        closureDateLabel: group.dateLabel,
                      })
                    }
                    sx={{
                      fontFamily: "fontFamily.primary",
                      borderRadius: 2,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Cerrar turno
                  </Button>
                </Stack>
              </Stack>

              <Box
                sx={{
                  mt: 1.2,
                  pt: 1.2,
                  borderTop: "1px dashed",
                  borderColor: "divider",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    color: "text.secondary",
                    fontSize: "0.8rem",
                    mb: 0.8,
                  }}
                >
                  Pedidos repartidos
                </Typography>

                <Stack spacing={0.7}>
                  {rider.deliveries.map((delivery) => (
                    <Box
                      key={delivery.id}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "90px 1fr 130px 130px",
                        },
                        gap: 1,
                        p: 1,
                        borderRadius: 2,
                        bgcolor: "background.paper",
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "fontFamily.secondary",
                          color: "primary.main",
                          fontWeight: 800,
                          fontSize: "0.8rem",
                        }}
                      >
                        #{delivery.orderId}
                      </Typography>

                      <Typography
                        sx={{
                          fontFamily: "fontFamily.secondary",
                          color: "text.primary",
                          fontSize: "0.8rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {delivery.clientName || "Cliente"} ·{" "}
                        {delivery.deliveryAddress || "Sin dirección"}
                      </Typography>

                      <Typography
                        sx={{
                          fontFamily: "fontFamily.secondary",
                          color: "text.secondary",
                          fontSize: "0.8rem",
                        }}
                      >
                        {delivery.paymentMethod}
                      </Typography>

                      <Typography
                        sx={{
                          fontFamily: "fontFamily.secondary",
                          color: "success.main",
                          fontWeight: 800,
                          fontSize: "0.8rem",
                          textAlign: { xs: "left", sm: "right" },
                        }}
                      >
                        {formatCurrency(delivery.orderTotal)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Paper>
          ))}
        </Stack>
      </Collapse>
    </Paper>
  );
};

export const PendingRiderClosuresPanel = ({
  restaurantId,
  showAlert,
  refreshKey = 0,
  onOpenClosure,
}) => {
  const [loading, setLoading] = useState(false);
  const [pendingData, setPendingData] = useState({
    summary: {},
    rows: [],
  });

  const rows = useMemo(() => pendingData.rows || [], [pendingData.rows]);
  const summary = pendingData.summary || {};

  const fetchPendingDeliveries = async () => {
    if (!restaurantId) return;

    setLoading(true);

    try {
      const response = await getPendingRiderDeliveriesSummaryService({
        restaurantId,
      });

      setPendingData({
        summary: response.summary || {},
        rows: response.rows || [],
      });
    } catch (error) {
      showAlert?.(
        error.message || "Error al obtener cierres pendientes",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDeliveries();
  }, [restaurantId, refreshKey]);

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          mb: 2,
          borderRadius: 3,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
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

            <Box>
              <Typography
                sx={{
                  fontFamily: "fontFamily.primary",
                  color: "text.primary",
                  fontSize: { xs: "1.05rem", sm: "1.25rem" },
                  lineHeight: 1,
                }}
              >
                CIERRES PENDIENTES
              </Typography>

              <Typography
                sx={{
                  fontFamily: "fontFamily.secondary",
                  color: "text.secondary",
                  fontSize: "0.85rem",
                  mt: 0.5,
                }}
              >
                Fechas y riders con pedidos entregados pendientes de pago
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={fetchPendingDeliveries}
            disabled={loading}
            sx={{
              fontFamily: "fontFamily.primary",
              borderRadius: 2,
            }}
          >
            Actualizar
          </Button>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <StatCard
            icon={<CalendarTodayIcon />}
            label="Fechas pendientes"
            value={summary.totalDates || 0}
          />

          <StatCard
            icon={<MopedIcon />}
            label="Viajes pendientes"
            value={summary.totalTrips || 0}
          />

          <StatCard
            icon={<PaymentsIcon />}
            label="Efectivo pendiente"
            value={formatCurrency(summary.totalCashCollected || 0)}
          />

          <StatCard
            icon={<PriceCheckIcon />}
            label="A pagar riders"
            value={formatCurrency(summary.totalDeliveryFee || 0)}
          />
        </Stack>
      </Paper>

      {loading ? (
        <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
          <CircularProgress color="primary" />
        </Box>
      ) : rows.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 3,
            bgcolor: "background.paper",
            border: "1px dashed",
            borderColor: "divider",
            textAlign: "center",
          }}
        >
          <RequestQuoteIcon
            sx={{
              fontSize: 46,
              color: "text.secondary",
              mb: 1,
            }}
          />

          <Typography
            sx={{
              fontFamily: "fontFamily.primary",
              color: "text.primary",
              fontSize: "1.1rem",
            }}
          >
            No hay cierres pendientes
          </Typography>

          <Typography
            sx={{
              fontFamily: "fontFamily.secondary",
              color: "text.secondary",
              fontSize: "0.9rem",
              mt: 0.5,
            }}
          >
            Cuando un rider tenga pedidos finalizados sin cerrar, aparecerán
            acá.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {rows.map((group) => (
            <PendingDateGroup
              key={group.id}
              group={group}
              onOpenClosure={onOpenClosure}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};
