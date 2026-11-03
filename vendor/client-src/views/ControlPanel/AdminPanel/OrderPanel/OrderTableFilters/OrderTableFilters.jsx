import { useId } from "react";

// ---- Material UI ----
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Chip,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
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
    color: "#FFFF",
    icon: <MoreHorizIcon fontSize="small" />,
  },
  {
    value: "RETIRO EN LOCAL",
    label: "Retiro en local",
    color: "#f59e0b",
    icon: <StorefrontIcon fontSize="small" />,
  },
  {
    value: "ESPERA EN LOCAL",
    label: "Espera en local",
    color: "#9c27b0",
    icon: <HailIcon fontSize="small" />,
  },
  {
    value: "DELIVERY",
    label: "Delivery",
    color: "#2196f3",
    icon: <DeliveryDiningIcon fontSize="small" />,
  },
  {
    value: "CONSUMIR EN LOCAL",
    label: "Consumir en local",
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
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const orderTypeLabelId = useId();

  const activeStatus =
    ORDER_STATUS_OPTIONS.find((item) => item.value === statusFilter) ||
    ORDER_STATUS_OPTIONS[0];

  const activeOrderType =
    ORDER_TYPE_OPTIONS.find((item) => item.value === orderTypeFilter) ||
    ORDER_TYPE_OPTIONS[0];

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
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1.5 }}>
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

        <FormControl
          size="small"
          sx={{
            ml: "auto",
            width: { xs: 168, sm: 220, lg: 260 },
            flexShrink: 0,
            minWidth: 0,
          }}
        >
          <InputLabel
            id={orderTypeLabelId}
            sx={{ fontFamily: "fontFamily.secondary" }}
          >
            Tipo de entrega
          </InputLabel>

          <Select
            labelId={orderTypeLabelId}
            label="Tipo de entrega"
            value={orderTypeFilter}
            onChange={(event) => onOrderTypeChange(event.target.value)}
            sx={{ fontFamily: "fontFamily.secondary", borderRadius: 2 }}
            renderValue={() => (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  minWidth: 0,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    color:
                      activeOrderType.value === "TODOS"
                        ? "text.primary"
                        : activeOrderType.color,
                  }}
                >
                  {activeOrderType.icon}
                </Box>

                <Typography
                  component="span"
                  noWrap
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    fontSize: "0.85rem",
                    flex: 1,
                  }}
                >
                  {activeOrderType.label}
                </Typography>

                <Chip
                  size="small"
                  label={getCount(orderTypeCounts, activeOrderType.value)}
                  sx={{ height: 22 }}
                />
              </Box>
            )}
          >
            {ORDER_TYPE_OPTIONS.map((type) => (
              <MenuItem
                key={type.value}
                value={type.value}
                sx={{ gap: 1, fontFamily: "fontFamily.secondary" }}
              >
                <Box
                  sx={{
                    display: "flex",
                    color: type.value === "TODOS" ? "text.primary" : type.color,
                  }}
                >
                  {type.icon}
                </Box>

                <Typography
                  component="span"
                  sx={{
                    flex: 1,
                    fontFamily: "fontFamily.secondary",
                    fontSize: "0.85rem",
                  }}
                >
                  {type.label}
                </Typography>

                <Chip
                  size="small"
                  variant="filled"
                  label={getCount(orderTypeCounts, type.value)}
                  sx={{ height: 22 }}
                />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          size="small"
          variant="outlined"
          color="primary"
          aria-label="Limpiar filtros"
          title="Limpiar filtros"
          startIcon={<RestartAltIcon />}
          onClick={onClearFilters}
          sx={{
            fontFamily: "fontFamily.secondary",
            textTransform: "none",
            borderRadius: 2,
            whiteSpace: "nowrap",
            flexShrink: 0,
            minWidth: { xs: 40, sm: "auto" },
            px: { xs: 1, sm: 1.5 },
            minHeight: 40,
            "& .MuiButton-startIcon": { mr: { xs: 0, sm: 1 }, ml: 0 },
          }}
        >
          <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
            Limpiar filtros
          </Box>
        </Button>
      </Box>

      <Box
        data-order-filter-row
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          minWidth: 0,
          width: "100%",
        }}
      >
        <Box
          sx={{
            flex: "1 1 0%",
            minWidth: 0,
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
            variant={isSmallScreen ? "scrollable" : "fullWidth"}
            scrollButtons={isSmallScreen ? "auto" : false}
            allowScrollButtonsMobile={isSmallScreen}
            sx={{
              width: "100%",
              minHeight: 56,
              px: 0,
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
                          color: selected ? "#111" : "text.primary",
                          bgcolor: selected ? status.color : "transparent",
                          borderColor: selected ? status.color : "divider",
                        }}
                      />
                    </Box>
                  }
                  sx={{
                    minHeight: 56,
                    minWidth: { xs: 120, md: 0 },
                    maxWidth: "none",
                    textTransform: "none",
                    px: 1,
                  }}
                />
              );
            })}
          </Tabs>
        </Box>
      </Box>
    </Paper>
  );
};
