import { useId, useMemo, useState } from "react";

// ---- Material UI ----
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
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
  const [detailsOpen, setDetailsOpen] = useState(false);

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
              fontFamily: "fontFamily.primary",
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
          color="primary"
          aria-label="Ver repartidores y pedidos"
          aria-haspopup="dialog"
          aria-expanded={detailsOpen}
          aria-controls={detailsOpen ? detailsId : undefined}
          onClick={() => setDetailsOpen(true)}
        >
          <ExpandMore />
        </IconButton>
      </Tooltip>

      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        fullWidth
        maxWidth="sm"
        scroll="paper"
        aria-labelledby={detailsId}
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: "background.paper",
          },
        }}
      >
        <DialogTitle
          id={detailsId}
          sx={{
            bgcolor: "background.main",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Moped color="primary" />
          <Typography
            sx={{
              fontFamily: "fontFamily.primary",
              fontSize: "1.2rem",
              color: "primary.main",
            }}
          >
            REPARTIDORES ACTIVOS
          </Typography>
        </DialogTitle>

        <DialogContent dividers sx={{ bgcolor: "background.default" }}>
          {ridersStats.length > 0 ? (
            <List dense aria-label="Repartidores con pedidos asignados">
              {ridersStats.map((rider) => (
                <ListItem key={rider.riderId} divider disableGutters>
                  <ListItemText
                    primary={rider.name}
                    secondary={`${rider.totalOrders} ${
                      rider.totalOrders === 1
                        ? "pedido asignado"
                        : "pedidos asignados"
                    } · ${formatCurrency(rider.totalDeliveryAmount)}`}
                    sx={{ fontFamily: "fontFamily.secondary" }}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography
              variant="body2"
              sx={{ fontFamily: "fontFamily.secondary", color: "primary.main" }}
            >
              No hay repartidores con pedidos asignados.
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ bgcolor: "background.paper" }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setDetailsOpen(false)}
            sx={{ fontFamily: "fontFamily.primary" }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
