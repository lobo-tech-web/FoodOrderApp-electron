import { useEffect, useMemo, useState } from "react";

// ---- MATERIAL UI ----
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
// ICONS
import {
  Moped as MopedIcon,
  Payments as PaymentsIcon,
  RequestQuote as RequestQuoteIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarTodayIcon,
  PriceCheck as PriceCheckIcon,
} from "@mui/icons-material";
// ---------------------

// ---- SERVICES ----
import { getPendingRiderDeliveriesSummaryService } from "@/services/riderCashClosures.js";
// ------------------

// ---- Utils ----
import { formatCurrency } from "@/utils/orderCalculations.js";
// ---------------

// ---- Shared ----
import { StatsCard } from "./shared/StatsCard.jsx";
import { PendingDateGroup } from "./shared/PendingDateGroup.jsx";
// ----------------

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
          <StatsCard
            icon={<CalendarTodayIcon />}
            label="Fechas pendientes"
            value={summary.totalDates || 0}
          />

          <StatsCard
            icon={<MopedIcon />}
            label="Viajes pendientes"
            value={summary.totalTrips || 0}
          />

          <StatsCard
            icon={<PaymentsIcon />}
            label="Efectivo pendiente"
            value={formatCurrency(summary.totalCashCollected || 0)}
          />

          <StatsCard
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
