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
          >
            <MenuItem value="">Todos</MenuItem>

            {riders.map((rider) => (
              <MenuItem key={rider.id} value={rider.id}>
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
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="OPEN">Abiertos</MenuItem>
            <MenuItem value="CLOSED">Cerrados</MenuItem>
            <MenuItem value="CANCELLED">Cancelados</MenuItem>
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
              <Stack
                direction={{ xs: "column", md: "row" }}
                alignItems={{ xs: "stretch", md: "center" }}
                justifyContent="space-between"
                spacing={1.5}
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
                        ? formatDate(closure.closedAt)
                        : `Abierto desde ${formatDate(closure.startedAt || closure.createdAt)}`}
                    </Typography>
                  </Box>
                </Stack>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ xs: "stretch", sm: "center" }}
                >
                  <Chip
                    icon={<PaymentsIcon />}
                    label={`Entrega local: ${formatCurrency(
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
                    label={`Rider: ${formatCurrency(
                      closure.riderShouldKeep || 0,
                    )}`}
                    color="success"
                    variant="outlined"
                    sx={{
                      fontFamily: "fontFamily.secondary",
                      justifyContent: "flex-start",
                    }}
                  />

                  <Chip
                    label={closure.status === "OPEN" ? "Abierto" : "Cerrado"}
                    color={closure.status === "OPEN" ? "success" : "warning"}
                    sx={{ fontFamily: "fontFamily.secondary" }}
                  />

                  <IconButton
                    size="small"
                    onClick={() => handleViewDetail(closure.id)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </Stack>
              </Stack>
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
