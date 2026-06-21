import {
  Box,
  Button,
  Paper,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
} from '@mui/material';
//   ICONS
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ShoppingCart as ShoppingCartIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';

// ---- SHARED ----
import { SectionHeading } from '../../shared/SectionHeading.jsx';
import { sectionCardStyle } from '../../styles/modalCreateOrder.styles.js';
// ----------------

// ---- UTILS ----
import { formatCurrency } from '@/utils/orderCalculations.js';
// ---------------

export const CartProductSection = ({
  order,
  handleQuantityChange,
  handleRemoveProduct,
  handleEditProduct,
  setShowProductSelector,
}) => {
  return (
    <Paper elevation={0} sx={sectionCardStyle}>
      <SectionHeading
        icon={<ReceiptIcon />}
        title={'PRODUCTOS DEL PEDIDO (' + order.cartItems.length + ')'}
        action={
          <Button
            color="primary"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowProductSelector(true)}
            sx={{
              fontFamily: 'fontFamily.primary',
              color: 'text.terciary',
              borderRadius: '8px',
              px: 2,
              whiteSpace: 'nowrap',
            }}
          >
            AGREGAR PRODUCTO
          </Button>
        }
      />

      {order.cartItems.length === 0 ? (
        <Box
          sx={{
            minHeight: 164,
            border: '1px dashed',
            borderColor: 'rgba(184, 182, 186, 0.28)',
            borderRadius: '8px',
            display: 'grid',
            placeItems: 'center',
            textAlign: 'center',
            px: 2,
            bgcolor: 'rgba(33, 37, 41, 0.32)',
          }}
        >
          <Box>
            <Avatar
              sx={{
                width: 66,
                height: 66,
                mx: 'auto',
                mb: 1.5,
                bgcolor: 'rgba(184, 182, 186, 0.12)',
                color: 'text.secondary',
              }}
            >
              <ShoppingCartIcon fontSize="large" />
            </Avatar>
            <Typography
              sx={{
                fontFamily: 'fontFamily.secondary',
                color: 'text.primary',
                fontSize: 15,
              }}
            >
              No hay productos en el pedido.
            </Typography>
            <Typography
              sx={{
                fontFamily: 'fontFamily.secondary',
                color: 'text.secondary',
                fontSize: 14,
              }}
            >
              Agrega al menos uno para continuar.
            </Typography>
          </Box>
        </Box>
      ) : (
        <List disablePadding>
          {order.cartItems.map((item, index) => (
            <ListItem
              key={index}
              sx={{
                border: '1px solid',
                borderColor: 'rgba(184, 182, 186, 0.2)',
                borderRadius: '8px',
                mb: 1,
                bgcolor: 'rgba(33, 37, 41, 0.5)',
                alignItems: 'flex-start',
                gap: 1,
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              <Box sx={{ display: 'flex', width: '100%', minWidth: 0 }}>
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'text.terciary',
                      fontFamily: 'fontFamily.primary',
                    }}
                  >
                    {item.quantity}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        minWidth: 0,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: 'fontFamily.primary',
                          color: 'primary.main',
                          fontSize: 17,
                          lineHeight: 1.1,
                          wordBreak: 'break-word',
                        }}
                      >
                        {(item.name || '').toUpperCase()}
                      </Typography>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditProduct(item, index)}
                        disabled={
                          !item.customOptions || item.customOptions.length === 0
                        }
                        size="small"
                      >
                        <EditIcon sx={{ fontSize: '1.1rem' }} />
                      </IconButton>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: 'fontFamily.secondary',
                          color: 'text.primary',
                          fontSize: 13,
                        }}
                      >
                        PRECIO UNIT. {formatCurrency(item.price)} | TOTAL{' '}
                        {formatCurrency(item.price * item.quantity)}
                      </Typography>
                      {item.customOptions && item.customOptions.length > 0 && (
                        <Typography
                          sx={{
                            fontFamily: 'fontFamily.secondary',
                            color: 'text.secondary',
                            mt: 0.5,
                            fontSize: 13,
                            lineHeight: 1.35,
                          }}
                        >
                          EXTRAS:{' '}
                          {item.customOptions
                            .map((opt) => opt.name + ' x ' + opt.quantity)
                            .join(' - ')}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: { xs: 'flex-end', sm: 'center' },
                  gap: 0.5,
                  width: { xs: '100%', sm: 'auto' },
                  ml: { sm: 'auto' },
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => handleQuantityChange(index, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  sx={{ color: 'text.primary' }}
                >
                  <RemoveIcon />
                </IconButton>
                <Typography
                  sx={{
                    minWidth: 26,
                    textAlign: 'center',
                    fontFamily: 'fontFamily.terciary',
                    color: 'text.primary',
                  }}
                >
                  {item.quantity}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleQuantityChange(index, item.quantity + 1)}
                  sx={{ color: 'text.primary' }}
                >
                  <AddIcon />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemoveProduct(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};
