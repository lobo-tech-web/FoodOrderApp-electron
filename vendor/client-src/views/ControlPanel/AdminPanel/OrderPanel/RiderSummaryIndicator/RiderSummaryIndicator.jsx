import { useMemo } from 'react';

// ---- MATERIAL UI ----
import { Box, Typography, Chip } from '@mui/material';
// ICONS
import { Moped as MopedIcon } from '@mui/icons-material';
// -----------------------

// ---- UTILS ----
import { cleanMoneyValue, formatCurrency } from '@/utils/orderCalculations.js';
// ---------------

export const RiderSummaryIndicator = ({
  totalOrders = [],
  availableRiders = [],
}) => {
  // 👉 Agrupar pedidos por rider
  const ridersStats = useMemo(() => {
    if (!totalOrders?.length || !availableRiders?.length) {
      return {
        totalDeliveryAmount: 0,
        totalDeliveries: 0,
      };
    }

    const ridersMap = new Map(availableRiders.map((r) => [r.id, r]));

    let totalDeliveryAmount = 0;
    let totalDeliveries = 0;

    totalOrders.forEach((order) => {
      // ignorar cancelados
      if (order.status === 'CANCELADO') return;

      // ignorar pedidos sin rider
      if (!order.riderId) return;

      const rider = ridersMap.get(order.riderId);
      if (!rider) return;

      const deliveryCost = cleanMoneyValue(order.deliverycost || 0).toNumber();
      totalDeliveryAmount += deliveryCost;
      totalDeliveries += 1;
    });

    return {
      totalDeliveryAmount,
      totalDeliveries,
    };
  }, [totalOrders, availableRiders]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2.5,
        borderRadius: 3,
        bgcolor: 'background.paper',
        boxShadow: 2,
        border: '1px solid',
        borderColor: 'info.main',
        transition: '0.2s',
        minHeight: 65,
        minWidth: 300,
        '&:hover': {
          boxShadow: 4,
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {/* Lado izquierdo */}
        <Typography
          variant="caption"
          sx={{
            fontFamily: 'fontFamily.primary',
            textTransform: 'uppercase',
            color: 'text.primary',
          }}
        >
          SUBTOTAL DELIVERYS
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="h5"
            sx={{ fontFamily: 'fontFamily.primary', color: 'success.main' }}
          >
            {formatCurrency(ridersStats?.totalDeliveryAmount || 0)}
          </Typography>
        </Box>
      </Box>
      {/* Lado derecho */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Chip
          icon={<MopedIcon />}
          label={`${ridersStats?.totalDeliveries || 0} DELIVERYS`}
          color="info"
          variant="outlined"
          sx={{ fontFamily: 'fontFamily.primary' }}
        />
      </Box>
    </Box>
  );
};
