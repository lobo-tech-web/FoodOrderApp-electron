import { useId, useMemo, useState } from "react";

// ---- Material UI ----
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Popover,
  Tooltip,
  Typography,
} from "@mui/material";
// Icons
import { ExpandMore, Moped } from "@mui/icons-material";
// ---------------------

// ---- Utils ----
import { cleanMoneyValue, formatCurrency } from "@/utils/orderCalculations.js";
// ---------------

export const RiderCountIndicator = ({
  totalOrders = [],
  availableRiders = [],
}) => {
  const detailsId = useId();
  const [anchorEl, setAnchorEl] = useState(null);

  const ridersStats = useMemo(() => {
    if (!totalOrders?.length || !availableRiders?.length) return [];

    const ridersMap = new Map(availableRiders.map((r) => [r.id, r]));
    const riderStatsMap = new Map();

    totalOrders.forEach((order) => {
      if (order.status === "CANCELADO") return;

      if (!order.riderId) return;

      const rider = ridersMap.get(order.riderId);
      if (!rider) return;

      const deliveryCost = cleanMoneyValue(order.deliverycost || 0).toNumber();

      if (!riderStatsMap.has(rider.id)) {
        riderStatsMap.set(rider.id, {
          riderId: rider.id,
          name: rider.name,
          totalDeliveryAmount: 0,
          totalOrders: 0,
        });
      }

      const current = riderStatsMap.get(rider.id);
      current.totalOrders += 1;
      current.totalDeliveryAmount += deliveryCost;
    });

    return Array.from(riderStatsMap.values()).sort(
      (a, b) => b.totalDeliveryAmount - a.totalDeliveryAmount,
    );
  }, [totalOrders, availableRiders]);

  const deliverySubtotal = ridersStats.reduce(
    (subtotal, rider) => subtotal + rider.totalDeliveryAmount,
    0,
  );

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
        p: 2,
        borderRadius: 3,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "primary.main",
        boxShadow: 2,
        minHeight: 70,
      }}
    >
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Moped fontSize="small" color="primary" />

          <Typography
            variant="subtitle1"
            sx={{ fontFamily: "fontFamily.primary", color: "primary.main" }}
          >
            DELIVERYS ACTIVOS ({ridersStats.length})
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Typography
            variant="body2"
            sx={{ fontFamily: "fontFamily.secondary", color: "text.primary" }}
          >
            Subtotal de deliverys{" "}
          </Typography>

          <Typography
            sx={{
              fontFamily: "fontFamily.secondary",
              color: "success.main",
              whiteSpace: "nowrap",
            }}
          >
            {formatCurrency(deliverySubtotal)}
          </Typography>
        </Box>
      </Box>

      <Tooltip title="Ver repartidores y pedidos">
        <IconButton
          aria-label="Ver repartidores y pedidos"
          aria-expanded={Boolean(anchorEl)}
          aria-controls={anchorEl ? detailsId : undefined}
          aria-haspopup="dialog"
          color="primary"
          onClick={(event) => setAnchorEl(event.currentTarget)}
        >
          <ExpandMore />
        </IconButton>
      </Tooltip>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          id: detailsId,
          role: "dialog",
          "aria-label": "Detalle de repartidores activos",
          sx: {
            bgcolor: "background.main",
            minWidth: 240,
            maxWidth: "calc(100vw - 32px)",
            maxHeight: 320,
          },
        }}
      >
        {ridersStats.length > 0 ? (
          <List dense aria-label="Repartidores con pedidos asignados">
            {ridersStats.map((rider) => (
              <ListItem key={rider.riderId} divider>
                <ListItemText
                  primary={rider.name}
                  secondary={`${rider.totalOrders} ${rider.totalOrders === 1 ? "pedido asignado" : "pedidos asignados"} · ${formatCurrency(rider.totalDeliveryAmount)}`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography
            variant="body2"
            sx={{ fontFamily: "fontFamily.secondary", p: 2 }}
          >
            No hay repartidores con pedidos asignados.
          </Typography>
        )}
      </Popover>
    </Box>
  );
};
