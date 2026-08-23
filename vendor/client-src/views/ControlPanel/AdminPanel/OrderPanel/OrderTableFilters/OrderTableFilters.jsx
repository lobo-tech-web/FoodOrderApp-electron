// ---- Material UI ----
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Chip,
  Typography,
  Button,
  ButtonBase,
  Stack,
  Divider,
} from "@mui/material";
// Icons
import {
  MoreHoriz as MoreHorizIcon,
  Pending as PendingIcon,
  FactCheck as FactCheckIcon,
  DeliveryDining as DeliveryDiningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Tune as TuneIcon,
  RestartAlt as RestartAltIcon,
  Storefront as StorefrontIcon,
  Hail as HailIcon,
  Restaurant as RestaurantIcon,
} from "@mui/icons-material";
// ----------------------

// ---- Helpers ----
const ORDER_STATUS_OPTIONS = [
  {
    value: "TODOS",
    label: "Todos",
    color: "#FFFF",
    icon: <MoreHorizIcon fontSize="small" />,
  },
  {
    value: "PENDIENTE A CONFIRMAR",
    label: "Pendientes",
    color: "#ff9800",
    icon: <PendingIcon fontSize="small" />,
  },
  {
    value: "EN PREPARACIÓN",
    label: "En preparación",
    color: "#2196f3",
    icon: <FactCheckIcon fontSize="small" />,
  },
  {
    value: "EN ENVIO",
    label: "En envío",
    color: "#9c27b0",
    icon: <DeliveryDiningIcon fontSize="small" />,
  },
  {
    value: "FINALIZADO",
    label: "Finalizados",
    color: "#4caf50",
    icon: <CheckCircleIcon fontSize="small" />,
  },
  {
    value: "CANCELADO",
    label: "Cancelados",
    color: "#f44336",
    icon: <CancelIcon fontSize="small" />,
  },
];

const ORDER_TYPE_OPTIONS = [
  {
    value: "TODOS",
    label: "Todas las entregas",
    shortLabel: "Todas",
    color: "#FFFF",
    icon: <MoreHorizIcon fontSize="small" />,
  },
  {
    value: "RETIRO EN LOCAL",
    label: "Retiro en local",
    shortLabel: "Retiro",
    color: "#f59e0b",
    icon: <StorefrontIcon fontSize="small" />,
  },
  {
    value: "ESPERA EN LOCAL",
    label: "Espera en local",
    shortLabel: "Espera",
    color: "#9c27b0",
    icon: <HailIcon fontSize="small" />,
  },
  {
    value: "DELIVERY",
    label: "Delivery",
    shortLabel: "Delivery",
    color: "#2196f3",
    icon: <DeliveryDiningIcon fontSize="small" />,
  },
  {
    value: "CONSUMIR EN LOCAL",
    label: "Consumir en local",
    shortLabel: "Local",
    color: "#22c55e",
    icon: <RestaurantIcon fontSize="small" />,
  },
];

const getCount = (counts, key) => Number(counts?.[key] || 0);
// -----------------

export const OrderTableFilters = ({
  statusFilter,
  orderTypeFilter,
  statusCounts,
  orderTypeCounts,
  totalFilteredOrders,
  onStatusChange,
  onOrderTypeChange,
  onClearFilters,
}) => {
  const activeStatus =
    ORDER_STATUS_OPTIONS.find((item) => item.value === statusFilter) ||
    ORDER_STATUS_OPTIONS[0];

  const activeOrderType =
    ORDER_TYPE_OPTIONS.find((item) => item.value === orderTypeFilter) ||
    ORDER_TYPE_OPTIONS[0];

  const hasActiveFilters =
    statusFilter !== "TODOS" || orderTypeFilter !== "TODOS";

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 2,
        p: { xs: 1.5, sm: 2 },
        bgcolor: "background.paper",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.5,
          mb: 1.5,
        }}
      >
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Box
            sx={{
              width: 38,
              height: 38,
              display: "grid",
              placeItems: "center",
              borderRadius: 2,
              bgcolor: "rgba(245, 166, 35, 0.12)",
              border: "1px solid",
              borderColor: "primary.main",
              color: "primary.main",
            }}
          >
            <TuneIcon fontSize="small" />
          </Box>

          <Box>
            <Typography
              sx={{
                fontFamily: "fontFamily.primary",
                color: "text.primary",
                fontSize: { xs: "0.95rem", sm: "1.05rem" },
                lineHeight: 1,
              }}
            >
              FILTROS DE PEDIDOS
            </Typography>

            <Typography
              sx={{
                fontFamily: "fontFamily.secondary",
                color: "primary.main",
                fontSize: "0.8rem",
                mt: 0.5,
              }}
            >
              Mostrando {totalFilteredOrders} pedido
              {totalFilteredOrders === 1 ? "" : "s"}
            </Typography>
          </Box>
        </Stack>

        {hasActiveFilters && (
          <Button
            size="small"
            variant="outlined"
            color="primary"
            startIcon={<RestartAltIcon />}
            onClick={onClearFilters}
            sx={{
              fontFamily: "fontFamily.secondary",
              textTransform: "none",
              borderRadius: 2,
              whiteSpace: "nowrap",
            }}
          >
            Limpiar filtros
          </Button>
        )}
      </Box>

      {/* FILTROS POR ESTADO */}
      <Box
        sx={{
          borderRadius: 2,
          bgcolor: "background.default",
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <Tabs
          value={statusFilter}
          onChange={(event, newValue) => onStatusChange(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 56,
            px: 1,
            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: "3px 3px 0 0",
              bgcolor: activeStatus.color,
            },
          }}
        >
          {ORDER_STATUS_OPTIONS.map((status) => {
            const selected = statusFilter === status.value;
            const count = getCount(statusCounts, status.value);

            return (
              <Tab
                key={status.value}
                value={status.value}
                label={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        color: selected ? status.color : "text.disabled",
                      }}
                    >
                      {status.icon}
                    </Box>

                    <Typography
                      sx={{
                        fontFamily: "fontFamily.secondary",
                        fontSize: "0.75rem",
                        color: selected ? status.color : "text.primary",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {status.label}
                    </Typography>

                    <Chip
                      label={count}
                      size="small"
                      variant={selected ? "filled" : "outlined"}
                      sx={{
                        height: 21,
                        minWidth: 28,
                        fontFamily: "fontFamily.secondary",
                        fontSize: "0.65rem",
                        fontWeight: 800,
                        color: selected ? "#111" : "text.primary",
                        bgcolor: selected ? status.color : "transparent",
                        borderColor: selected ? status.color : "divider",
                      }}
                    />
                  </Box>
                }
                sx={{
                  minHeight: 56,
                  textTransform: "none",
                  px: { xs: 1, sm: 1.5 },
                }}
              />
            );
          })}
        </Tabs>
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {/* FILTROS POR TIPO DE ENTREGA */}
      <Box>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 1.2 }}
        >
          <Typography
            sx={{
              fontFamily: "fontFamily.primary",
              color: "primary.main",
              fontSize: "0.85rem",
            }}
          >
            TIPO DE ENTREGA
          </Typography>

          <Chip
            size="small"
            icon={activeOrderType.icon}
            label={activeOrderType.label}
            variant="outlined"
            sx={{
              display: { xs: "none", sm: "inline-flex" },
              fontFamily: "fontFamily.secondary",
              color: activeOrderType.color,
              borderColor: activeOrderType.color,
              "& .MuiChip-icon": {
                color: activeOrderType.color,
              },
            }}
          />
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              sm: "repeat(3, minmax(0, 1fr))",
              md: "repeat(5, minmax(0, 1fr))",
            },
            gap: 1,
          }}
        >
          {ORDER_TYPE_OPTIONS.map((type) => {
            const selected = orderTypeFilter === type.value;
            const count = getCount(orderTypeCounts, type.value);

            return (
              <ButtonBase
                key={type.value}
                onClick={() => onOrderTypeChange(type.value)}
                sx={{
                  width: "100%",
                  minHeight: 58,
                  p: 1,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: selected ? type.color : "divider",
                  bgcolor: selected ? "background.paper" : "background.default",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                  transition: "all 0.18s ease",
                  textAlign: "left",

                  "&:hover": {
                    borderColor: type.color,
                    transform: "translateY(-1px)",
                  },
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ minWidth: 0 }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      minWidth: 32,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 2,
                      color: selected ? type.color : "text.secondary",
                      bgcolor: selected ? "background.paper" : "transparent",
                    }}
                  >
                    {type.icon}
                  </Box>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontFamily: "fontFamily.secondary",
                        color: selected ? type.color : "text.primary",
                        fontWeight: selected ? 900 : 700,
                        fontSize: { xs: "0.72rem", sm: "0.8rem" },
                        lineHeight: 1.1,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {type.shortLabel}
                    </Typography>
                  </Box>
                </Stack>

                <Chip
                  label={count}
                  size="small"
                  sx={{
                    height: 22,
                    minWidth: 28,
                    fontFamily: "fontFamily.secondary",
                    fontSize: "0.65rem",
                    fontWeight: 900,
                    color: selected ? "#111" : "text.primary",
                    bgcolor: selected ? type.color : "background.paper",
                    border: "1px solid",
                    borderColor: selected ? type.color : "divider",
                  }}
                />
              </ButtonBase>
            );
          })}
        </Box>
      </Box>
    </Paper>
  );
};
