// ---- MATERIAL UI ----
import { Box, Typography, Chip } from '@mui/material';
// ICONS
import {
  Pending as PendingIcon,
  FactCheck as FactCheckIcon,
  DeliveryDining as DeliveryDiningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
// -----------------------

export const OrderStatusIndicator = ({ totalOrders = [] }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'FINALIZADO':
        return {
          label: 'FINALIZADO',
          color: '#4caf50',
          icon: <CheckCircleIcon />,
        };
      case 'CANCELADO':
        return {
          label: 'CANCELADO',
          color: '#f44336',
          icon: <CancelIcon />,
        };
      case 'EN PREPARACIÓN':
        return {
          label: 'EN PREPARACIÓN',
          color: '#2196f3',
          icon: <FactCheckIcon />,
        };
      case 'EN ENVIO':
        return {
          label: 'EN ENVÍO',
          color: '#9c27b0',
          icon: <DeliveryDiningIcon />,
        };
      default:
        return {
          label: status,
          color: '#ff9800',
          icon: <PendingIcon />,
        };
    }
  };

  // Contar los distintos estados de los pedidos
  const statusCounts = totalOrders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  const hasData = Object.keys(statusCounts).length > 0;

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
        borderColor: '#4caf50',
        boxShadow: 2,
        minHeight: 70,
        minWidth: 300,
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          fontFamily: 'fontFamily.primary',
          color: 'primary.main',
          textAlign: 'center',
          width: '100%',
        }}
      >
        ESTADOS DE PEDIDOS
      </Typography>
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
        {hasData ? (
          Object.entries(statusCounts).map(([status, count]) => {
            const config = getStatusConfig(status);
            return (
              <Chip
                key={status}
                label={`${config.label} ${count}`}
                icon={config.icon}
                size="medium"
                variant="outlined"
                sx={{
                  fontFamily: 'fontFamily.primary',
                  mt: 1,
                  color: config.color || 'primary',
                  borderColor: config.color || 'primary',
                  '& .MuiChip-icon': {
                    color: config.color,
                  },
                }}
              />
            );
          })
        ) : (
          <Typography
            variant="caption"
            sx={{ color: 'text.primary', fontFamily: 'fontFamily.secondary' }}
          >
            Sin pedidos
          </Typography>
        )}
      </Box>
    </Box>
  );
};
