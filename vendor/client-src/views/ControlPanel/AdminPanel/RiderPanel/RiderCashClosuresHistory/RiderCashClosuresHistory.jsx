import { useEffect, useState } from "react";

// ---- MATERIAL UI ----
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
// ICONS
import {
  Visibility as VisibilityIcon,
  RequestQuote as RequestQuoteIcon,
  TwoWheeler as TwoWheelerIcon,
  Payments as PaymentsIcon,
  PriceCheck as PriceCheckIcon,
} from "@mui/icons-material";
// ---------------------

// ---- SERVICES ----
import {
  getRiderCashClosuresByRestaurantService,
  getRiderCashClosureByIdService,
} from "@/services/riderCashClosures.js";
// ------------------

// ---- Utils ----
import { formatCurrency } from "@/utils/orderCalculations.js";
// ---------------

// ---- Components ----
import { ModalRiderCashClosureDetail } from "@/components/PanelComponents/ModalRiderCashClosureDetail/ModalRiderCashClosureDetail.jsx";
// --------------------

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

export const RiderCashClosuresHistory = ({
  restaurantId,
  riders = [],
  showAlert,
}) => {
  const [loading, setLoading] = useState(false);
  const [closures, setClosures] = useState([]);
  const [selectedClosureDetail, setSelectedClosureDetail] = useState(null);

  const [filters, setFilters] = useState({
    riderId: "",
    status: "",
  });

  const handleFilterChange = ({ target: { name, value } }) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchClosures = async () => {
    if (!restaurantId) return;

    setLoading(true);

    try {
      const response = await getRiderCashClosuresByRestaurantService({
        restaurantId,
        riderId: filters.riderId || undefined,
        status: filters.status || undefined,
        limit: 100,
      });

      setClosures(Array.isArray(response) ? response : []);
    } catch (error) {
      showAlert?.(
        error.message || "Error al obtener los cierres de riders",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (closureId) => {
    try {
      const response = await getRiderCashClosureByIdService({ closureId });
      setSelectedClosureDetail(response);
    } catch (error) {
      showAlert?.(
        error.message || "Error al obtener el detalle del cierre",
        "error",
      );
    }
  };

  useEffect(() => {
    fetchClosures();
  }, [restaurantId, filters.riderId, filters.status]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
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
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
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
                fontSize: { xs: "1rem", sm: "1.1rem" },
                lineHeight: 1,
              }}
            >
              CIERRES DE RIDERS
            </Typography>

            <Typography
              sx={{
                fontFamily: "fontFamily.secondary",
                color: "text.secondary",
                fontSize: "0.82rem",
                mt: 0.4,
              }}
            >
              Historial de cierres confirmados y abiertos
            </Typography>
          </Box>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
            },
            gap: 1,
            minWidth: { md: 420 },
          }}
        >
          <TextField
            select
            size="small"
            label="Rider"
            name="riderId"
            value={filters.riderId}
            onChange={handleFilterChange}
            sx={{ fontFamily: "fontFamily.secondary" }}
          >
            <MenuItem value="" sx={{ fontFamily: "fontFamily.primary" }}>
              TODOS
            </MenuItem>

            {riders.map((rider) => (
              <MenuItem
                key={rider.id}
                value={rider.id}
                sx={{ fontFamily: "fontFamily.primary" }}
              >
                {rider.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Estado"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            sx={{ fontFamily: "fontFamily.secondary" }}
          >
            <MenuItem value="" sx={{ fontFamily: "fontFamily.primary" }}>
              TODOS
            </MenuItem>
            <MenuItem value="OPEN" sx={{ fontFamily: "fontFamily.primary" }}>
              ABIERTOS
            </MenuItem>
            <MenuItem value="CLOSED" sx={{ fontFamily: "fontFamily.primary" }}>
              CERRADOS
            </MenuItem>
            <MenuItem
              value="CANCELLED"
              sx={{ fontFamily: "fontFamily.primary" }}
            >
              CANCELADOS
            </MenuItem>
          </TextField>
        </Box>
      </Stack>

      {loading ? (
        <Box sx={{ py: 5, display: "flex", justifyContent: "center" }}>
          <CircularProgress color="primary" />
        </Box>
      ) : closures.length === 0 ? (
        <Box
          sx={{
            p: 4,
            borderRadius: 3,
            bgcolor: "background.default",
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontFamily: "fontFamily.secondary",
              color: "text.secondary",
            }}
          >
            Todavía no hay cierres registrados.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.2}>
          {closures.map((closure) => (
            <Paper
              key={closure.id}
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: 2.5,
                bgcolor: "background.default",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "1fr 1fr 100px",
                  },
                  gap: 1,
                  alignItems: "center",
                }}
              >
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <TwoWheelerIcon sx={{ color: "primary.main" }} />

                  <Box>
                    <Typography
                      sx={{
                        fontFamily: "fontFamily.primary",
                        color: "text.primary",
                        fontSize: "0.95rem",
                      }}
                    >
                      {closure.rider?.name || "Rider"}
                    </Typography>

                    <Typography
                      sx={{
                        fontFamily: "fontFamily.secondary",
                        color: "text.secondary",
                        fontSize: "0.78rem",
                      }}
                    >
                      {closure.status === "CLOSED"
                        ? `Fecha de cierre: ${formatDate(closure.closedAt)}`
                        : `Abierto desde ${formatDate(closure.startedAt || closure.createdAt)}`}
                    </Typography>
                  </Box>
                </Stack>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ xs: "stretch", md: "center" }}
                >
                  <Stack direction="column" spacing={1}>
                    <Chip
                      icon={<PaymentsIcon />}
                      label={`Efectivo entregado al local: ${formatCurrency(
                        closure.expectedCashToAdmin || 0,
                      )}`}
                      variant="outlined"
                      sx={{
                        fontFamily: "fontFamily.secondary",
                        justifyContent: "flex-start",
                      }}
                    />

                    <Chip
                      icon={<PriceCheckIcon />}
                      label={`Pagado al rider: ${formatCurrency(
                        closure.riderShouldKeep || 0,
                      )}`}
                      color={
                        Number(closure.riderShouldKeep || 0) <= 0
                          ? "error"
                          : "success"
                      }
                      variant="outlined"
                      sx={{
                        fontFamily: "fontFamily.secondary",
                        justifyContent: "flex-start",
                      }}
                    />
                  </Stack>
                </Stack>
                <Stack direction="column" spacing={1}>
                  <IconButton
                    size="small"
                    onClick={() => handleViewDetail(closure.id)}
                  >
                    <VisibilityIcon />
                  </IconButton>

                  <Chip
                    label={closure.status === "OPEN" ? "ABIERTO" : "CERRADO"}
                    color={closure.status === "OPEN" ? "success" : "default"}
                    sx={{ fontFamily: "fontFamily.primary" }}
                  />
                </Stack>
              </Box>
            </Paper>
          ))}
        </Stack>
      )}

      <ModalRiderCashClosureDetail
        open={Boolean(selectedClosureDetail)}
        onClose={() => setSelectedClosureDetail(null)}
        closure={selectedClosureDetail}
      />
    </Paper>
  );
};
