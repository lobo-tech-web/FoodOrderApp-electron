import { useState, useMemo } from 'react';

// ---- MATERIAL UI ----
import { Box, Typography, Chip, IconButton, Tooltip } from '@mui/material';
// ICONS
import {
  ReceiptLong as ReceiptLongIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
// -----------------------

// ---- UTILS ----
import { formatCurrency } from '@/utils/orderCalculations.js';
// ---------------

export const OrderSummaryIndicator = ({
  totalOrders,
  title = 'VENTA ACTUAL',
}) => {
  const [showAmount, setShowAmount] = useState(false);

  const toggleVisibility = () => {
    setShowAmount((prev) => !prev);
  };

  // Contador de suma total de pedidos
  const totalOrdersAmount = useMemo(() => {
    if (!totalOrders?.length) return 0;

    return totalOrders
      .filter((o) => o.status !== 'CANCELADO')
      .reduce((acc, order) => acc + Number(order.totalAmount || 0), 0);
  }, [totalOrders]);

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
        borderColor: 'success.main',
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontFamily: 'fontFamily.primary',
              textTransform: 'uppercase',
              color: 'text.primary',
            }}
          >
            {title}
          </Typography>
          {/* BOTÓN VISIBILIDAD */}
          <Tooltip>
            <IconButton
              size="small"
              onClick={toggleVisibility}
              sx={{
                color: 'text.primary',
              }}
            >
              {showAmount ? (
                <VisibilityOffIcon fontSize="small" />
              ) : (
                <VisibilityIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        <Typography
          variant="h5"
          sx={{ fontFamily: 'fontFamily.primary', color: 'success.main' }}
        >
          {showAmount ? formatCurrency(totalOrdersAmount) : '*****'}
        </Typography>
      </Box>
      {/* Lado derecho */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Chip
          icon={<ReceiptLongIcon />}
          label={`${totalOrders?.length || 0} PEDIDOS`}
          color="primary"
          variant="outlined"
          sx={{ fontFamily: 'fontFamily.primary' }}
        />
      </Box>
    </Box>
  );
};
