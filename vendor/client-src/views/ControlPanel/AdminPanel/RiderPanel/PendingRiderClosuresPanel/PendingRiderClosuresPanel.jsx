import { useEffect, useMemo, useState } from "react";

// ---- MATERIAL UI ----
import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
  Chip,
  Tab,
  Tabs,
  CircularProgress,
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

// ---- Components ----
import { PendingRiderClosureCard } from "@/components/PanelComponents/PendingRiderClosureCard/PendingRiderClosureCard.jsx";
// --------------------

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
  const [selectedDateKey, setSelectedDateKey] = useState("");
  const [selectedRiderId, setSelectedRiderId] = useState("");

  const rows = useMemo(() => pendingData.rows || [], [pendingData.rows]);
  const summary = pendingData.summary || {};

  const selectedDateGroup = useMemo(() => {
    if (!rows.length) return null;

    return rows.find((group) => group.dateKey === selectedDateKey) || rows[0];
  }, [rows, selectedDateKey]);

  const selectedRider = useMemo(() => {
    const riders = selectedDateGroup?.riders || [];
    if (!riders.length) return null;

    return (
      riders.find(
        (rider) => String(rider.riderId) === String(selectedRiderId),
      ) || riders[0]
    );
  }, [selectedDateGroup, selectedRiderId]);

  const handleDateChange = (_, newDateKey) => {
    setSelectedDateKey(newDateKey);
    setSelectedRiderId("");
  };

  const handleRiderChange = (_, newRiderId) => {
    setSelectedRiderId(newRiderId);
  };

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

  useEffect(() => {
    if (!rows.length) {
      setSelectedDateKey("");
      setSelectedRiderId("");
      return;
    }

    const selectedDateExists = rows.some(
      (group) => group.dateKey === selectedDateKey,
    );

    if (!selectedDateExists) {
      setSelectedDateKey(rows[0].dateKey);
      setSelectedRiderId("");
    }
  }, [rows, selectedDateKey]);

  useEffect(() => {
    const riders = selectedDateGroup?.riders || [];

    if (!riders.length) {
      setSelectedRiderId("");
      return;
    }

    const riderExists = riders.some(
      (rider) => String(rider.riderId) === String(selectedRiderId),
    );

    if (!riderExists) {
      setSelectedRiderId(riders[0].riderId);
    }
  }, [selectedDateGroup, selectedRiderId]);

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
                Seleccioná una fecha y luego el cadete que quieras administrar.
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
              px: { xs: 1, sm: 2 },
              pt: 1.5,
              bgcolor: "background.main",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack direction="row" alignItems="center">
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "rgba(245, 166, 35, 0.10)",
                  border: "1px solid",
                  borderColor: "primary.main",
                  color: "primary.main",
                  flexShrink: 0,
                }}
              >
                <CalendarTodayIcon />
              </Box>
              <Typography
                sx={{
                  px: 1,
                  mb: 0.8,
                  fontFamily: "fontFamily.primary",
                  color: "text.primary",
                  fontSize: "1rem",
                }}
              >
                FECHAS DE CIERRES
              </Typography>
            </Stack>

            <Tabs
              value={selectedDateGroup?.dateKey || false}
              onChange={handleDateChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                minHeight: 50,
                "& .MuiTab-root": {
                  minHeight: 50,
                  textTransform: "none",
                  fontFamily: "fontFamily.primary",
                  color: "text.secondary",
                },
                "& .Mui-selected": {
                  color: "primary.main !important",
                },
              }}
            >
              {rows.map((group) => (
                <Tab
                  key={group.dateKey}
                  value={group.dateKey}
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarTodayIcon fontSize="small" />

                      <Typography
                        component="span"
                        sx={{
                          fontFamily: "fontFamily.primary",
                          fontSize: "0.85rem",
                        }}
                      >
                        {group.dateLabel}
                      </Typography>

                      <Chip
                        size="small"
                        label={group.totalTrips || 0}
                        color="primary"
                        variant="filled"
                        sx={{ height: 21, fontFamily: "fontFamily.primary" }}
                      />
                    </Stack>
                  }
                />
              ))}
            </Tabs>
          </Box>

          {selectedDateGroup && (
            <>
              {/* RESUMEN DE FECHA */}
              <Box
                sx={{
                  px: { xs: 2, sm: 2.5 },
                  py: 1.5,
                  bgcolor: "background.default",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems={{
                    xs: "flex-start",
                    sm: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "fontFamily.primary",
                      color: "text.primary",
                    }}
                  >
                    {selectedDateGroup.dateLabel}
                  </Typography>

                  <Typography
                    sx={{
                      fontFamily: "fontFamily.secondary",
                      color: "primary.main",
                      fontSize: "0.82rem",
                    }}
                  >
                    {selectedDateGroup.riders?.length || 0} cadete/s
                  </Typography>

                  <Typography
                    sx={{
                      fontFamily: "fontFamily.secondary",
                      color: "primary.main",
                      fontSize: "0.82rem",
                    }}
                  >
                    {selectedDateGroup.totalTrips || 0} viaje/s
                  </Typography>

                  <Typography
                    sx={{
                      fontFamily: "fontFamily.secondary",
                      color: "success.main",
                      fontSize: "0.82rem",
                    }}
                  >
                    Efectivo:{" "}
                    {formatCurrency(selectedDateGroup.totalCashCollected || 0)}
                  </Typography>
                </Stack>
              </Box>

              {/* Tabs de riders */}
              <Box
                sx={{
                  px: { xs: 1, sm: 2 },
                  pt: 1.5,
                  bgcolor: "background.main",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Stack direction="row" alignItems="center">
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
                    <MopedIcon />
                  </Box>

                  <Typography
                    sx={{
                      px: 1,
                      mb: 0.7,
                      fontFamily: "fontFamily.primary",
                      color: "text.primary",
                      fontSize: "1rem",
                    }}
                  >
                    CADETES POR CERRAR TURNO
                  </Typography>
                </Stack>

                <Tabs
                  value={selectedRider?.riderId || false}
                  onChange={handleRiderChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  sx={{
                    minHeight: 48,
                    "& .MuiTab-root": {
                      minHeight: 48,
                      textTransform: "none",
                      fontFamily: "fontFamily.primary",
                      color: "text.secondary",
                    },
                    "& .Mui-selected": {
                      color: "primary.main !important",
                    },
                  }}
                >
                  {(selectedDateGroup.riders || []).map((rider) => (
                    <Tab
                      key={rider.riderId}
                      value={rider.riderId}
                      label={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <MopedIcon fontSize="small" />

                          <Typography
                            component="span"
                            sx={{
                              fontFamily: "fontFamily.primary",
                              fontSize: "0.85rem",
                            }}
                          >
                            {rider.name}
                          </Typography>

                          <Chip
                            size="small"
                            label={`${rider.trips || 0}`}
                            color="primary"
                            variant="filled"
                            sx={{
                              height: 20,
                              fontFamily: "fontFamily.primary",
                            }}
                          />
                        </Stack>
                      }
                    />
                  ))}
                </Tabs>
              </Box>

              {/* RIDER SELECCIONADO */}
              <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
                <PendingRiderClosureCard
                  group={selectedDateGroup}
                  rider={selectedRider}
                  onOpenClosure={onOpenClosure}
                />
              </Box>
            </>
          )}
        </Paper>
      )}
    </Box>
  );
};
