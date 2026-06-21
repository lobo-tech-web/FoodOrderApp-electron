// ---- MATERIAL UI ----
import {
  Box,
  Typography,
  TableRow,
  TableCell,
  IconButton,
  Chip,
  Checkbox,
  Tooltip,
} from '@mui/material';
// ICONS
import {
  Edit as EditIcon,
  Person as PersonIcon,
  Smartphone as SmartphoneIcon,
  Restaurant as RestaurantIcon,
  Moped as MopedIcon,
} from '@mui/icons-material';
// ---------------------

// ---- UTILS ----
import { formatCurrency } from '@/utils/orderCalculations.js';
// ---------------

// ---- STYLES ----
const tableBodyStyle = {
  fontFamily: 'fontFamily.secondary',
  fontSize: '0.85rem',
  color: 'text.primary',
  textAlign: 'center',
  py: 1.5,
};
// -----------------

export const OrderInfo = ({
  order,
  globalIndex,
  totalInList,
  handleSelectOrders,
  selectedOrdersCheckbox,
  handleOpenModal,
}) => {
  const handleColor = (status) => {
    if (status === 'FINALIZADO') return '#4caf50';
    if (status === 'CANCELADO') return '#f44336';
    if (status === 'EN PREPARACIÓN') return '#2196f3';
    if (status === 'EN ENVIO') return '#9c27b0';
    return '#ff9800';
  };

  const formatOrderDate = (orderDate) => {
    if (!orderDate?.day || !orderDate?.month || !orderDate?.year) return '-';
    return `${orderDate.day}/${orderDate.month}/${orderDate.year}`;
  };

  const formatOrderTime = (orderDate) => {
    if (!orderDate?.hour && !orderDate?.minute) return '-';

    const hour = orderDate.hour ?? '00';
    const minute = orderDate.minute ?? '00';
    const second = orderDate.second ?? '00';

    return `${hour}:${minute}:${second}`;
  };

  const isSelected = selectedOrdersCheckbox.some(
    (selectedOrder) => selectedOrder.id === order.id
  );

  const displayID = totalInList - globalIndex;

  return (
    <TableRow
      selected={isSelected}
      sx={{
        transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
        bgcolor: isSelected ? 'rgba(245, 158, 11, 0.14)' : 'transparent',
        boxShadow: isSelected ? 'inset 4px 0 0 #f59e0b' : 'none',

        '&:hover': {
          bgcolor: isSelected ? 'rgba(245, 158, 11, 0.20)' : 'action.hover',
        },

        '&.Mui-selected': {
          bgcolor: 'rgba(245, 158, 11, 0.14)',
        },

        '&.Mui-selected:hover': {
          bgcolor: 'rgba(245, 158, 11, 0.20)',
        },
      }}
    >
      <TableCell padding="checkbox">
        <Checkbox
          checked={isSelected}
          onChange={(event) => handleSelectOrders(event, order, globalIndex)}
          sx={{
            color: 'primary.main',
            '&.Mui-checked': {
              color: 'primary.main',
            },
          }}
        />
      </TableCell>

      <TableCell sx={tableBodyStyle}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 0.5,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontFamily: 'fontFamily.terciary',
              fontSize: {
                xs: '0.9rem',
                sm: '1rem',
                md: '1rem',
              },
              color: 'text.primary',
              lineHeight: 1,
            }}
          >
            {displayID}
          </Typography>

          <Typography
            variant="caption"
            sx={{
              fontFamily: 'fontFamily.secondary',
              fontSize: {
                xs: '0.60rem',
                sm: '0.65rem',
                md: '0.70rem',
              },
              color: 'text.secondary',
            }}
          >
            ID: {order.id}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={tableBodyStyle}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              textAlign: 'center',
              flexDirection: 'row',
              gap: 0.5,
            }}
          >
            <PersonIcon sx={{ color: 'primary.main', fontSize: '1rem' }} />
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'fontFamily.secondary',
                fontSize: '0.85rem',
                color: 'text.primary',
              }}
            >
              {order?.clientName?.toUpperCase() || 'SIN NOMBRE'}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              textAlign: 'center',
              flexDirection: 'row',
              gap: 0.5,
            }}
          >
            <SmartphoneIcon sx={{ color: 'primary.main', fontSize: '1rem' }} />
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'fontFamily.secondary',
                fontSize: '0.85rem',
                color: 'text.secondary',
              }}
            >
              {order?.contactPhone || 'SIN TELÉFONO'}
            </Typography>
          </Box>
        </Box>
      </TableCell>

      <TableCell sx={tableBodyStyle}>
        {order.orderType === 'DELIVERY'
          ? order.deliveryAddress.toUpperCase() || 'SIN DIRECCIÓN'
          : '-'}
      </TableCell>

      <TableCell sx={tableBodyStyle}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 0.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.85rem',
              color: 'text.primary',
            }}
          >
            {formatCurrency(order.totalAmount)}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontFamily: 'fontFamily.secondary',
              fontSize: {
                xs: '0.60rem',
                sm: '0.65rem',
                md: '0.70rem',
              },
              color:
                order.paymentMethod === 'SIN ESPECIFICAR'
                  ? 'primary.main'
                  : 'text.secondary',
            }}
          >
            {order.paymentMethod}
          </Typography>
        </Box>
      </TableCell>

      <TableCell sx={tableBodyStyle}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          {order.totalRewardPoints > 0 && (
            <Chip
              label={`+${order.totalRewardPoints} pts`}
              size="small"
              variant="contained"
              sx={{
                fontFamily: 'fontFamily.secondary',
                color: 'text.primary',
                bgcolor: 'success.main',
              }}
            />
          )}
          {order.totalRedeemPoints > 0 && (
            <Chip
              label={`-${order.totalRedeemPoints} pts`}
              size="small"
              variant="contained"
              sx={{
                fontFamily: 'fontFamily.secondary',
                color: 'text.primary',
                bgcolor: 'error.main',
              }}
            />
          )}
          {!order.totalRewardPoints && !order.totalRedeemPoints && '-'}
        </Box>
      </TableCell>

      <TableCell sx={tableBodyStyle}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 0.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.85rem',
              color: 'text.secondary',
            }}
          >
            {formatOrderDate(order?.orderDate)}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.85rem',
              color: 'text.primary',
            }}
          >
            {formatOrderTime(order?.orderDate)}
          </Typography>
        </Box>
      </TableCell>

      <TableCell sx={tableBodyStyle}>
        {order.orderType === 'CONSUMIR EN LOCAL' ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              gap: 0.4,
            }}
          >
            <Typography
              variant="caption"
              sx={{ fontSize: '0.85rem', color: 'text.primary' }}
            >
              {order.orderType}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <RestaurantIcon
                sx={{ color: 'primary.main', fontSize: '1rem' }}
              />
              <Typography
                variant="caption"
                sx={{ fontSize: '0.85rem', color: 'text.secondary' }}
              >
                Mesa {order.tableid || '-'}
              </Typography>
            </Box>
          </Box>
        ) : order.orderType === 'DELIVERY' ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              gap: 0.4,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.85rem',
                color: 'text.primary',
                fontWeight: 800,
              }}
            >
              DELIVERY
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 0.8,
                py: 0.3,
                borderRadius: 5,
                border: '1px solid',
                borderColor: order?.rider?.name
                  ? 'primary.main'
                  : 'warning.main',
                bgcolor: 'background.paper',
              }}
            >
              <MopedIcon
                sx={{
                  color: order?.rider?.name ? 'primary.main' : 'warning.main',
                  fontSize: '1rem',
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.75rem',
                  color: order?.rider?.name ? 'text.primary' : 'warning.main',
                  fontFamily: 'fontFamily.secondary',
                  fontWeight: 800,
                }}
              >
                {order?.rider?.name
                  ? order.rider.name.toUpperCase()
                  : 'SIN RIDER'}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.85rem',
              color: 'text.primary',
            }}
          >
            {order.orderType}
          </Typography>
        )}
      </TableCell>

      <TableCell align="center">
        <Chip
          label={order.status}
          sx={{
            fontFamily: 'fontFamily.primary',
            color: 'text.primary',
            bgcolor: handleColor(order.status),
          }}
        />
      </TableCell>
      <TableCell align="center">
        <Tooltip title="Editar pedido" arrow>
          <IconButton
            onClick={() => handleOpenModal(order, displayID)}
            size="small"
            sx={{ color: 'primary.main' }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};
