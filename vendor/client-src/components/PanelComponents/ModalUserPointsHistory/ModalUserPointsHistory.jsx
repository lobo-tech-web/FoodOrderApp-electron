import { useEffect, useMemo, useState } from "react";

// ---- MATERIAL UI ----
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
// Icons
import {
  AddCircleOutline as AddCircleOutlineIcon,
  Close as CloseIcon,
  FilterAltOutlined as FilterAltOutlinedIcon,
  History as HistoryIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
  RestartAlt as RestartAltIcon,
} from "@mui/icons-material";
// --------------------

// ---- SERVICES ----
import { getUserPointsHistoryService } from "@/services/userPointsHistory.js";
// ------------------

const movementOptions = [
  { value: "ALL", label: "Todos" },
  { value: "ADD", label: "Sumados" },
  { value: "SUBTRACT", label: "Restados" },
  { value: "ADJUSTMENT", label: "Ajustes" },
];

const reasonLabels = {
  ORDER_REWARD: "Compra finalizada",
  ORDER_REDEEM: "Canje en pedido",
  ORDER_REDEEM_REFUND: "Devolución por cancelación",
  MANUAL_ADJUSTMENT: "Ajuste manual",
  ORDER_POINTS_RECALCULATION: "Recalculo por edición",
  ORDER_CANCELLED: "Pedido cancelado",
  OTHER: "Otro",
};

const filterFieldStyle = {
  width: "100%",

  "& .MuiInputBase-root": {
    fontFamily: "fontFamily.secondary",
    color: "text.primary",
    bgcolor: "background.default",
    borderRadius: 2,
    minHeight: 52,
  },

  "& .MuiInputLabel-root": {
    fontFamily: "fontFamily.secondary",
    color: "text.secondary",
  },

  "& .MuiInputLabel-root.Mui-focused": {
    color: "primary.main",
  },

  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "divider",
  },

  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "primary.main",
  },

  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "primary.main",
  },
};

const getMovementConfig = (movement) => {
  if (movement === "ADD") {
    return {
      label: "Suma",
      color: "success",
      icon: <AddCircleOutlineIcon fontSize="small" />,
    };
  }

  if (movement === "SUBTRACT") {
    return {
      label: "Resta",
      color: "error",
      icon: <RemoveCircleOutlineIcon fontSize="small" />,
    };
  }

  return {
    label: "Ajuste",
    color: "warning",
    icon: <HistoryIcon fontSize="small" />,
  };
};

export const ModalUserPointsHistory = ({
  open,
  onClose,
  selectedUserPoints,
  restaurantId,
}) => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const [filters, setFilters] = useState({
    movementType: "ALL",
    dateFrom: "",
    dateTo: "",
  });

  const client = selectedUserPoints?.user;

  const clientId = client?.id;

  const currentPoints = useMemo(() => {
    return Number(selectedUserPoints?.points || 0);
  }, [selectedUserPoints]);

  const handleFilterChange = ({ target: { name, value } }) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      movementType: "ALL",
      dateFrom: "",
      dateTo: "",
    });
  };

  const hasActiveFilters = Boolean(
    filters.movementType !== "ALL" || filters.dateFrom || filters.dateTo,
  );

  const fetchHistory = async () => {
    if (!open || !restaurantId || !clientId) return;

    setLoading(true);

    try {
      const response = await getUserPointsHistoryService({
        restaurantId,
        userId: clientId,
        movementType:
          filters.movementType === "ALL" ? undefined : filters.movementType,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        limit: 80,
      });

      const rows = Array.isArray(response) ? response : response.rows || [];

      setHistory(rows);
    } catch (error) {
      console.error(error?.message || error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [
    open,
    restaurantId,
    clientId,
    filters.movementType,
    filters.dateFrom,
    filters.dateTo,
  ]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          bgcolor: "background.default",
          borderRadius: 4,
          border: "1px solid",
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
        <Box sx={{ display: "flex", gap: 2 }}>
          <HistoryIcon />
          <Typography
            sx={{
              fontFamily: "fontFamily.primary",
              color: "primary.main",
              fontSize: { xs: "1.2rem", sm: "1.5rem" },
              lineHeight: 1,
            }}
          >
            HISTORIAL DE PUNTOS
          </Typography>
        </Box>

        <IconButton onClick={onClose}>
          <CloseIcon sx={{ color: "text.primary" }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 2,
            mb: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              p: 2,
              borderBottom: "1px solid",
              borderColor: "primary.main",
            }}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <Typography
                sx={{
                  fontFamily: "fontFamily.secondary",
                  color: "text.primary",
                  fontSize: "1rem",
                }}
              >
                {client?.userNumber ? `Cliente #${client.userNumber} ` : ""}{" "}
                |{" "}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "fontFamily.secondary",
                  color: "text.primary",
                  fontSize: "1rem",
                }}
              >
                {client?.name || "Cliente"}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Typography
                sx={{
                  fontFamily: "fontFamily.secondary",
                  color: "text.primary",
                  fontSize: "1rem",
                }}
              >
                Puntos actuales:
              </Typography>
              <Typography
                sx={{
                  fontFamily: "fontFamily.primary",
                  color: "primary.main",
                  fontSize: "1.3rem",
                  lineHeight: 1,
                }}
              >
                {currentPoints}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: 3,
              bgcolor: "background.main",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            {/* HEADER DE FILTROS */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                mb: 2,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <FilterAltOutlinedIcon
                  sx={{
                    color: "primary.main",
                    fontSize: 22,
                  }}
                />

                <Box>
                  <Typography
                    sx={{
                      fontFamily: "fontFamily.primary",
                      color: "text.primary",
                      fontSize: {
                        xs: "0.9rem",
                        sm: "1rem",
                      },
                      lineHeight: 1.2,
                    }}
                  >
                    FILTRAR MOVIMIENTOS
                  </Typography>

                  <Typography
                    sx={{
                      fontFamily: "fontFamily.secondary",
                      color: "text.secondary",
                      fontSize: "0.75rem",
                      mt: 0.3,
                      display: {
                        xs: "none",
                        sm: "block",
                      },
                    }}
                  >
                    Filtrá el historial por movimiento o rango de fechas
                  </Typography>
                </Box>
              </Stack>

              {hasActiveFilters && (
                <Button
                  size="small"
                  variant="text"
                  color="primary"
                  startIcon={<RestartAltIcon />}
                  onClick={handleClearFilters}
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    textTransform: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Limpiar
                </Button>
              )}
            </Box>

            {/* CAMPOS */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  md: "1.1fr repeat(2, minmax(0, 1fr))",
                },

                gap: {
                  xs: 1.5,
                  sm: 2,
                },

                alignItems: "center",
              }}
            >
              {/* TIPO DE MOVIMIENTO */}
              <TextField
                select
                fullWidth
                label="Tipo de movimiento"
                name="movementType"
                value={filters.movementType}
                onChange={handleFilterChange}
                sx={{
                  ...filterFieldStyle,
                  gridColumn: {
                    xs: "auto",
                    sm: "1 / -1",
                    md: "auto",
                  },
                }}
              >
                {movementOptions.map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                    sx={{
                      fontFamily: "fontFamily.secondary",
                      color: "text.primary",
                    }}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              {/* FECHA DESDE */}
              <TextField
                fullWidth
                label="Desde"
                name="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  max: filters.dateTo || undefined,
                }}
                sx={filterFieldStyle}
              />

              {/* FECHA HASTA */}
              <TextField
                fullWidth
                label="Hasta"
                name="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={handleFilterChange}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: filters.dateFrom || undefined,
                }}
                sx={filterFieldStyle}
              />
            </Box>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : history.length > 0 ? (
          <Stack spacing={1.5}>
            {history.map((movement) => {
              const movementConfig = getMovementConfig(movement.movementType);
              const pointsDelta = Number(movement.pointsDelta || 0);

              return (
                <Box
                  key={movement.id}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "background.main",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={1.5}
                  >
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography
                          sx={{
                            fontFamily: "fontFamily.primary",
                            color: "text.primary",
                            textTransform: "uppercase",
                          }}
                        >
                          {reasonLabels[movement.reason] || movement.reason}
                        </Typography>

                        <Chip
                          size="small"
                          icon={movementConfig.icon}
                          label={movementConfig.label}
                          color={movementConfig.color}
                          sx={{
                            fontFamily: "fontFamily.secondary",
                            textTransform: "lowercase",
                          }}
                        />
                      </Stack>

                      <Typography
                        sx={{
                          fontFamily: "fontFamily.secondary",
                          color: "primary.main",
                          fontSize: "0.85rem",
                          mt: 0.8,
                        }}
                      >
                        {movement.description || "Sin descripción"}
                      </Typography>

                      {movement.order?.id && (
                        <Typography
                          sx={{
                            fontFamily: "fontFamily.secondary",
                            color: "text.secondary",
                            fontSize: "0.8rem",
                            mt: 0.3,
                          }}
                        >
                          Pedido #{movement.order.id} · {movement.order.status}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                      <Typography
                        sx={{
                          fontFamily: "fontFamily.primary",
                          color:
                            pointsDelta >= 0 ? "success.main" : "error.main",
                          fontSize: "1.5rem",
                          lineHeight: 1,
                        }}
                      >
                        {pointsDelta > 0 ? `+${pointsDelta}` : pointsDelta} PTS.
                      </Typography>

                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Typography
                          sx={{
                            fontFamily: "fontFamily.secondary",
                            color: "text.secondary",
                            fontSize: "0.82rem",
                            mt: 0.5,
                          }}
                        >
                          Antes: {movement.previousPoints}
                        </Typography>

                        <Typography
                          sx={{
                            fontFamily: "fontFamily.secondary",
                            color: "primary.main",
                            fontSize: "0.82rem",
                            mt: 0.5,
                          }}
                        >
                          Después: {movement.newPoints}
                        </Typography>
                      </Box>

                      <Typography
                        sx={{
                          fontFamily: "fontFamily.secondary",
                          color: "text.secondary",
                          fontSize: "0.75rem",
                          mt: 0.3,
                        }}
                      >
                        {new Date(movement.createdAt).toLocaleString("es-AR")}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        ) : (
          <Box
            sx={{
              py: 6,
              textAlign: "center",
              bgcolor: "background.paper",
              borderRadius: 3,
              border: "1px dashed",
              borderColor: "divider",
            }}
          >
            <Typography
              sx={{
                fontFamily: "fontFamily.secondary",
                color: "text.primary",
              }}
            >
              No hay movimientos de puntos para este cliente.
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
