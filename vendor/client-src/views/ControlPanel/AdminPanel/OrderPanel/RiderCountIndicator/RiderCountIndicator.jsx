import { useMemo } from 'react';

// ---- MATERIAL UI ----
import { Box, Typography } from '@mui/material';
// ICONS
import {
  Moped as MopedIcon,
  ReceiptLong as ReceiptLongIcon,
} from '@mui/icons-material';
// -----------------------

// ---- UTILS ----
import { cleanMoneyValue, formatCurrency } from '@/utils/orderCalculations.js';
// ---------------

export const RiderCountIndicator = ({
  totalOrders = [],
  availableRiders = [],
}) => {
  // 👉 Agrupar pedidos por rider
  const ridersStats = useMemo(() => {
    if (!totalOrders?.length || !availableRiders?.length) return [];

    const ridersMap = new Map(availableRiders.map((r) => [r.id, r]));
    const riderStatsMap = new Map();

    totalOrders.forEach((order) => {
      // ignorar cancelados
      if (order.status === 'CANCELADO') return;

      // ignorar pedidos sin rider
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
      (a, b) => b.totalDeliveryAmount - a.totalDeliveryAmount
    );
  }, [totalOrders, availableRiders]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        p: 2,
        borderRadius: 3,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'primary.main',
        boxShadow: 2,
        minHeight: 70,
        minWidth: 300,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <MopedIcon fontSize="small" color="primary" />
        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'fontFamily.primary',
            color: 'primary.main',
            textAlign: 'center',
          }}
        >
          DELIVERYS ACTIVOS
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 32,
        }}
      >
        {ridersStats?.length > 0 ? (
          ridersStats.map((rider) => {
            return (
              <Box
                key={rider.riderId}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.5,
                  py: 0.5,
                  mt: 1,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'text.primary',
                  bgcolor: 'transparent',
                }}
              >
                {/* Nombre */}
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'fontFamily.primary',
                    color: 'text.primary',
                    fontWeight: 500,
                  }}
                >
                  {rider.name}
                </Typography>

                {/* Monto */}
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'fontFamily.primary',
                    color: 'success.main',
                    fontWeight: 600,
                  }}
                >
                  {formatCurrency(rider.totalDeliveryAmount || 0)}
                </Typography>

                {/* Separador */}
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.primary',
                  }}
                >
                  |
                </Typography>

                {/* Cantidad de pedidos */}
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'fontFamily.primary',
                    color: 'warning.main',
                    fontWeight: 500,
                  }}
                >
                  {rider.totalOrders}
                </Typography>
                <ReceiptLongIcon fontSize="small" color="primary" />
              </Box>
            );
          })
        ) : (
          <Typography
            variant="caption"
            sx={{ color: 'text.primary', fontFamily: 'fontFamily.secondary' }}
          >
            No hay riders con pedidos asignados
          </Typography>
        )}
      </Box>
    </Box>
  );
};
