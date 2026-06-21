import {
  Box,
  Button,
  Typography,
  IconButton,
  Avatar,
  Alert,
  Stack,
  Tooltip,
} from '@mui/material';
// Icons
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Receipt as ReceiptIcon,
  Fastfood as FastfoodIcon,
  StickyNote2 as StickyNote2Icon,
} from '@mui/icons-material';

import { formatCurrency } from '@/utils/orderCalculations.js';
// ---- Shared ----
import { ModalSection } from '../../shared/ModalSection.jsx';
// ----------------

export const CartProductSection = ({
  order,
  handleEditProduct,
  handleQuantityChange,
  handleRemoveProduct,
  setShowProductSelector,
  handleQuickEditOpen,
}) => {
  const getProductImage = (item) => {
    return (
      item.image ||
      item.img ||
      item.productImage ||
      item.imageUrl ||
      item.imgUrl ||
      ''
    );
  };

  const formatCustomOptionsText = (item) => {
    if (!item?.customOptions || item.customOptions.length === 0) return '';

    return item.customOptions
      .map((opt) => {
        const name = opt.name || opt.title || opt.label || 'Opción';
        const quantity = opt.quantity || opt.qty || 1;
        return `${name?.toLowerCase()}${quantity > 1 ? ` x${quantity}` : ''}`;
      })
      .join(' · ');
  };

  const productGridColumns = {
    xs: '1fr',
    md: 'minmax(240px, 1fr) 110px 105px 115px 38px',
  };

  return (
    <ModalSection title="Editar pedido" icon={<ReceiptIcon color="primary" />}>
      <Box
        sx={{
          display: {
            xs: 'none',
            md: 'grid',
          },
          gridTemplateColumns: productGridColumns.md,
          columnGap: 1.2,
          alignItems: 'center',
          px: 1,
          mb: 0.8,
        }}
      >
        {['Producto', 'Cantidad', 'Precio', 'Subtotal', ''].map(
          (head, index) => (
            <Typography
              key={head || index}
              sx={{
                color: 'text.primary',
                fontFamily: 'fontFamily.primary',
                fontWeight: 900,
                fontSize: 11,
                textTransform: 'uppercase',
                textAlign: index === 0 ? 'left' : 'center',
              }}
            >
              {head}
            </Typography>
          )
        )}
      </Box>

      {order.cartItems.length === 0 ? (
        <Alert severity="info">
          No hay productos en el pedido. Agrega al menos uno para continuar.
        </Alert>
      ) : (
        <Stack spacing={1}>
          {order.cartItems.map((item, index) => {
            const productImage = getProductImage(item);
            const customText = formatCustomOptionsText(item);
            return (
              <Box
                key={`${item.productId || item.id || item.name}-${index}`}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: productGridColumns,
                  columnGap: { xs: 1, md: 1.2 },
                  rowGap: { xs: 1, md: 0 },
                  alignItems: 'center',
                  px: 1,
                  py: { xs: 0.9, sm: 1 },
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: 'text.primary',
                  bgcolor: 'transparent',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    minWidth: 0,
                  }}
                >
                  <Avatar
                    src={productImage}
                    variant="rounded"
                    sx={{
                      width: { xs: 42, sm: 46, md: 48 },
                      height: { xs: 42, sm: 46, md: 48 },
                      bgcolor: 'transparent',
                      borderRadius: '8px',
                    }}
                  >
                    <FastfoodIcon color="primary" />
                  </Avatar>

                  <Box sx={{ minWidth: 0 }}>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <Typography
                        sx={{
                          color: 'text.primary',
                          fontFamily: 'fontFamily.primary',
                          fontWeight: 900,
                          fontSize: { xs: 13, sm: 14, md: 17 },
                          textTransform: 'uppercase',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.name}
                      </Typography>

                      <IconButton
                        size="small"
                        onClick={() => handleEditProduct(item, index)}
                        disabled={
                          !item.customOptions || item.customOptions.length === 0
                        }
                      >
                        <EditIcon
                          sx={{
                            fontSize: 18,
                            color:
                              !item.customOptions ||
                              item.customOptions.length === 0
                                ? 'text.secondary'
                                : 'primary.main',
                          }}
                        />
                      </IconButton>
                    </Box>

                    {customText && (
                      <Typography
                        sx={{
                          color: 'text.secondary',
                          fontFamily: 'fontFamily.secondary',
                          fontSize: { xs: 11, sm: 12 },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {customText}
                      </Typography>
                    )}

                    {item?.productComment &&
                      item.productComment.trim() !== '' && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.6,
                            mt: 0.2,
                          }}
                        >
                          <StickyNote2Icon fontSize="small" color="primary" />
                          <Typography
                            sx={{
                              fontFamily: 'fontFamily.primary',
                              fontSize: {
                                xs: '0.6rem',
                                sm: '0.7rem',
                                md: '0.75rem',
                              },
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.productComment.toUpperCase()}
                          </Typography>
                          <Tooltip title="Editar comentario" arrow>
                            <IconButton
                              size="small"
                              onClick={(event) =>
                                handleQuickEditOpen(event, {
                                  target: 'cartItem',
                                  field: 'productComment',
                                  value: item.productComment || '',
                                  itemIndex: index,
                                })
                              }
                              sx={{
                                color: 'primary.main',
                                border: '1px solid',
                                borderColor: 'divider',
                                '&:hover': {
                                  borderColor: 'primary.main',
                                  bgcolor: 'rgba(245, 158, 11, 0.12)',
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: { xs: 'space-between', md: 'center' },
                    gap: 1,
                  }}
                >
                  <Typography
                    sx={{
                      display: { xs: 'block', md: 'none' },
                      color: 'text.secondary',
                      fontSize: 12,
                    }}
                  >
                    Cantidad
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleQuantityChange(index, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                      sx={{
                        width: 26,
                        height: 26,
                        border: '1px solid',
                        borderColor: 'text.primary',
                        borderRadius: '8px',
                        color: 'text.primary',
                      }}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>

                    <Typography
                      sx={{
                        minWidth: 24,
                        color: 'text.primary',
                        textAlign: 'center',
                        fontFamily: 'fontFamily.terciary',
                        fontWeight: 900,
                      }}
                    >
                      {item.quantity}
                    </Typography>

                    <IconButton
                      size="small"
                      onClick={() =>
                        handleQuantityChange(index, item.quantity + 1)
                      }
                      sx={{
                        width: 26,
                        height: 26,
                        border: '1px solid',
                        borderColor: 'text.primary',
                        borderRadius: '8px',
                        color: 'text.primary',
                      }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Typography
                  sx={{
                    color: 'text.primary',
                    fontFamily: 'fontFamily.terciary',
                    fontWeight: 800,
                    textAlign: { xs: 'left', md: 'center' },
                  }}
                >
                  {formatCurrency(item.price)}
                </Typography>

                <Typography
                  sx={{
                    color: 'text.primary',
                    fontFamily: 'fontFamily.terciary',
                    fontWeight: 900,
                    textAlign: { xs: 'left', md: 'center' },
                  }}
                >
                  {formatCurrency(item.price * item.quantity)}
                </Typography>

                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemoveProduct(index)}
                  sx={{
                    justifySelf: { xs: 'end', md: 'center' },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            );
          })}
        </Stack>
      )}

      <Button
        fullWidth
        startIcon={<AddIcon />}
        onClick={() => setShowProductSelector(true)}
        sx={{
          mt: 1.5,
          minHeight: 46,
          borderRadius: '10px',
          border: '1px dashed',
          borderColor: 'primary.main',
          color: 'primary.main',
          fontFamily: 'fontFamily.terciary',
          fontWeight: 900,
          '&:hover': {
            bgcolor: 'rgba(245,158,11,0.08)',
            borderColor: 'primary.main',
          },
        }}
      >
        Agregar producto
      </Button>
    </ModalSection>
  );
};
