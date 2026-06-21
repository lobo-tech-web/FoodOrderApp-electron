import { useNavigate } from 'react-router-dom';

// ---- MATERIAL UI ----
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Stack,
  Divider,
  Card,
  CardContent,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
// ---- ICONS ----
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StickyNote2 as StickyNote2Icon,
} from '@mui/icons-material';
import ReceiptIcon from '@mui/icons-material/Receipt';
//<----------------------

// ---- CONTEXT ----
import { useCart } from '@/context/Cart.jsx';
// <----------------

export const CartPreview = ({
  cartItems,
  isEditing,
  toMenu,
  isTaxsIncluded,
  totalTaxAmount,
}) => {
  const {
    addItemToCart,
    decrementItemToCart,
    removeItemFromCart,
    clearCart,
    totalOrderAmount,
    totalRewardPoints,
    totalRedeemPoints,
  } = useCart();
  const navigate = useNavigate();
  const handleLinktoMenu = () => navigate(toMenu);

  // DETECTAMOS SI EL USUARIO ESTA EN MÓVIL
  const themeMobile = useTheme();
  const isMobile = useMediaQuery(themeMobile.breakpoints.down('sm'));

  const EmptyCart = () => {
    return (
      <Paper
        elevation={0}
        sx={{
          bgcolor: 'background.default',
          p: 4,
          borderRadius: 2,
          textAlign: 'center',
          border: '1px dashed',
          borderColor: 'divider',
          my: 3,
        }}
      >
        <ReceiptIcon
          sx={{
            fontSize: { xs: '3rem', md: '4rem' },
            color: 'text.primary',
            mb: 2,
          }}
        />

        <Typography
          variant="h5"
          sx={{
            color: 'text.terciary',
            fontFamily: 'fontFamily.secondary',
            textAlign: 'center',
            mb: 3,
          }}
        >
          NO HAY PRODUCTOS EN TU LISTA.
        </Typography>
        <Button
          variant="contained"
          onClick={handleLinktoMenu}
          sx={{
            bgcolor: 'primary.main',
            color: 'text.secondary',
            fontFamily: 'fontFamily.secondary',
            fontSize: '1rem',
            borderRadius: 4,
            boxShadow: 2,
            transition: 'all 0.3s',
            '&:hover': {
              bgcolor: 'primary.dark',
              transform: 'translateY(-2px)',
            },
          }}
        >
          IR AL MENÚ
        </Button>
      </Paper>
    );
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontFamily: 'fontFamily.secondary',
          fontSize: isMobile ? '1rem' : '2rem',
          color: 'text.primary',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          mt: 2,
        }}
      >
        RESUMEN DE TU PEDIDO
      </Typography>

      <Stack spacing={2}>
        {cartItems.length === 0 && <EmptyCart />}
        {cartItems.length > 0 &&
          cartItems.map((item, index) => (
            <Card
              key={item.id + index}
              elevation={2}
              sx={{
                bgcolor: 'background.default',
                borderRadius: 2,
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'visible',
                border: '1px solid',
                borderColor: 'primary.main',
                '&:hover': isEditing && {
                  transform: 'translateY(-3px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 1,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    {/* NOMBRE DEL PRODUCTO */}
                    <Typography
                      variant={isMobile ? 'h5' : 'h4'}
                      sx={{
                        fontFamily: 'fontFamily.primary',
                        color: 'text.primary',
                      }}
                    >
                      {item.name}
                    </Typography>

                    {/* CUSTOM OPTIONS DEL PRODUCTO */}
                    {item.customOptions && item.customOptions.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        {item.customOptions.map((option, idx) => (
                          <Typography
                            key={idx}
                            variant="body2"
                            sx={{
                              color: 'text.terciary',
                              fontFamily: 'fontFamily.secondary',
                            }}
                          >
                            {option.name}
                            {option.extraCost > 0 && ` (+$${option.extraCost})`}
                            {option.quantity > 0 ? ` x ${option.quantity}` : ''}
                          </Typography>
                        ))}
                      </Box>
                    )}

                    {/* Comentario del producto */}
                    {item?.allowComment && item?.productComment.trim() && (
                      <Box sx={{ display: 'flex', mt: 1 }}>
                        <StickyNote2Icon
                          fontSize="small"
                          sx={{ color: 'text.primary', mr: 0.5 }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'fontFamily.secondary',
                            color: 'text.primary',
                          }}
                        >
                          {item?.productComment.toUpperCase()}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      ml: 2,
                    }}
                  >
                    {/* PRECIO TOTAL DEL PRODUCTO */}
                    {item.price > 0 && (
                      <Typography
                        variant={isMobile ? 'h6' : 'h5'}
                        sx={{
                          fontFamily: 'fontFamily.secondary',
                          color: 'text.primary',
                        }}
                      >
                        ${(item.price * item.quantity).toLocaleString('es-AR')}
                      </Typography>
                    )}

                    {/* TOTAL DE PUNTOS PARA EL CANJE */}
                    {item.redeemPoints > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <StarIcon sx={{ color: 'text.primary', mr: 0.5 }} />
                        <Typography
                          variant={isMobile ? 'subtitle1' : 'h6'}
                          sx={{
                            fontFamily: 'fontFamily.secondary',
                            color: 'text.primary',
                          }}
                        >
                          - {item.redeemPoints * item.quantity} pts.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    mt: 2,
                  }}
                >
                  {/* CANTIDADES DEL PRODUCTO E INCREMENTO/DECREMENTO */}
                  {isEditing ? (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'primary.main',
                        borderRadius: 8,
                      }}
                    >
                      {/* BOTÓN PARA DECREMENTAR CANTIDAD */}
                      <Tooltip title="Quitar uno" arrow>
                        <IconButton
                          onClick={() =>
                            item.quantity === 1
                              ? removeItemFromCart(item)
                              : decrementItemToCart(item)
                          }
                          size="small"
                          sx={{ color: 'text.primary', borderRadius: 0 }}
                        >
                          <RemoveIcon />
                        </IconButton>
                      </Tooltip>

                      {/* CANTIDAD DEL PRODUCTO */}
                      <Typography
                        sx={{
                          color: 'text.primary',
                          fontFamily: 'fontFamily.secondary',
                          mx: 2,
                          minWidth: '24px',
                          textAlign: 'center',
                        }}
                      >
                        {item.quantity}
                      </Typography>

                      {/* BOTÓN PARA AUMENTAR CANTIDAD */}
                      <Tooltip title="Añadir uno" arrow>
                        <IconButton
                          onClick={() => addItemToCart(item)}
                          size="small"
                          sx={{ color: 'text.primary', borderRadius: 0 }}
                        >
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ) : (
                    <Typography
                      sx={{
                        color: 'text.primary',
                        fontFamily: 'fontFamily.secondary',
                      }}
                    >
                      Cantidad: {item.quantity}
                    </Typography>
                  )}

                  {/* BOTÓN PARA ELIMINAR PRODUCTO */}
                  {isEditing && (
                    <Tooltip title="Eliminar producto" arrow>
                      <IconButton
                        onClick={() => removeItemFromCart(item)}
                        sx={{
                          color: 'error.main',
                          ml: 1,
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
      </Stack>

      {/* BOTÓN PARA AGREGAR MÁS PRODUCTOS */}
      {isEditing && cartItems.length > 0 && (
        <Button
          variant="contained"
          onClick={handleLinktoMenu}
          startIcon={<AddIcon />}
          sx={{
            fontFamily: 'fontFamily.secondary',
            fontSize: '1rem',
            color: 'text.primary',
            bgcolor: 'primary.secondary',
            borderRadius: 8,
            border: '1px solid',
            borderColor: 'primary.main',
            width: '100%',
            my: 3,
            py: 1.5,
            '&:hover': {
              bgcolor: 'primary.main',
              color: 'primary.secondary',
            },
          }}
        >
          AGREGAR PRODUCTOS
        </Button>
      )}

      {/* TOTAL DEL CARRITO */}
      {cartItems.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            mt: 2,
            p: 3,
            borderRadius: 2,
            bgcolor: 'background.default',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              sx={{
                fontFamily: 'fontFamily.secondary',
                fontSize: isTaxsIncluded && isMobile ? '1rem' : '1.5rem',
                color: 'text.primary',
                fontWeight: 'bold',
              }}
            >
              {isTaxsIncluded ? 'SUBTOTAL' : 'TOTAL'}
            </Typography>

            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              sx={{
                fontFamily: 'fontFamily.secondary',
                fontSize: isTaxsIncluded && isMobile ? '1rem' : '1.5rem',
                color: 'text.primary',
                fontWeight: 'bold',
              }}
            >
              ${totalOrderAmount.toLocaleString('es-AR')}
            </Typography>
          </Box>

          {isTaxsIncluded && (
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  sx={{
                    fontFamily: 'fontFamily.secondary',
                    fontSize: isMobile ? '1rem' : '1.5rem',
                    color: 'text.primary',
                    fontWeight: 'bold',
                  }}
                >
                  TARIFA DE SERVICIOS
                </Typography>

                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  sx={{
                    fontFamily: 'fontFamily.secondary',
                    fontSize: isMobile ? '1rem' : '1.5rem',
                    color: 'text.primary',
                    fontWeight: 'bold',
                  }}
                >
                  ${totalTaxAmount}
                </Typography>
              </Box>
              <Divider sx={{ my: 1, bgcolor: 'primary.main' }} />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  sx={{
                    fontFamily: 'fontFamily.secondary',
                    color: 'text.primary',
                    fontWeight: 'bold',
                  }}
                >
                  TOTAL
                </Typography>

                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  sx={{
                    fontFamily: 'fontFamily.secondary',
                    color: 'text.primary',
                    fontWeight: 'bold',
                  }}
                >
                  ${(totalOrderAmount + totalTaxAmount).toLocaleString('es-AR')}
                </Typography>
              </Box>
            </Box>
          )}

          {/* PTS CANJEABLES */}
          {totalRedeemPoints > 0 && (
            <>
              <Divider sx={{ my: 2, bgcolor: 'primary.main' }} />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                  borderRadius: 1,
                }}
              >
                <Typography
                  variant={isMobile ? 'h6' : 'h5'}
                  sx={{
                    fontFamily: 'fontFamily.secondary',
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <StarIcon sx={{ mr: 1, color: 'primary.main' }} />
                  PTS. CANJEADOS
                </Typography>

                <Typography
                  variant={isMobile ? 'h6' : 'h5'}
                  sx={{
                    fontFamily: 'fontFamily.secondary',
                    color: 'text.primary',
                    fontWeight: 'bold',
                  }}
                >
                  - {totalRedeemPoints} PTS.
                </Typography>
              </Box>
            </>
          )}

          {/* PTS ACUMULABLES */}
          {totalRewardPoints > 0 && (
            <>
              <Divider sx={{ my: 2, bgcolor: 'primary.main' }} />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                  p: 1.5,
                  borderRadius: 1,
                }}
              >
                <Box>
                  <Typography
                    variant={isMobile ? 'subtitle2' : 'h6'}
                    sx={{
                      fontFamily: 'fontFamily.secondary',
                      color: 'text.primary',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <StarIcon sx={{ mr: 1, color: 'primary.main' }} />
                    PUNTOS A ACUMULAR
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'fontFamily.secondary',
                      fontSize: isMobile ? '0.65rem' : '1rem',
                      color: 'text.primary',
                      display: 'block',
                      mt: 0.5,
                    }}
                  >
                    ( SE ACREDITARÁN DENTRO DE LAS 24 HS )
                  </Typography>
                </Box>

                <Typography
                  variant={isMobile ? 'h6' : 'h5'}
                  sx={{
                    fontFamily: 'fontFamily.secondary',
                    color: 'text.primary',
                  }}
                >
                  + {totalRewardPoints} PTS.
                </Typography>
              </Box>
            </>
          )}

          <Box
            sx={{
              bgcolor: 'transparent',
              color: 'text.primary',
              borderRadius: 2,
              textAlign: 'center',
              p: 1,
            }}
          >
            <Divider sx={{ my: 1, bgcolor: 'primary.main' }} />
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'fontFamily.secondary',
                color: 'text.primary',
              }}
            >
              * SI EL PEDIDO SE REALIZA POR DELIVERY EL COSTO DEL ENVIO NO ESTA
              INCLUIDO *
            </Typography>

            <Typography
              variant="body2"
              sx={{
                fontFamily: 'fontFamily.secondary',
                color: 'text.primary',
                mt: 1,
              }}
            >
              ( TE LO AGREGAMOS AL RECIBIR EL PEDIDO POR WHATSAPP )
            </Typography>
          </Box>

          {/* BOTÓN PARA VACIAR EL CARRITO */}
          {isEditing && (
            <Button
              variant="outlined"
              fullWidth
              startIcon={<DeleteIcon />}
              onClick={() => {
                if (
                  window.confirm(
                    '¿Estás seguro de que quieres vaciar el carrito?'
                  )
                ) {
                  clearCart();
                }
              }}
              sx={{
                fontFamily: 'fontFamily.secondary',
                borderColor: 'error.main',
                color: 'error.main',
                mt: 3,
                borderRadius: 8,
                transition: 'all 0.3s',
                '&:hover': {
                  bgcolor: 'error.main',
                  color: 'error.contrastText',
                },
              }}
            >
              VACIAR CARRITO
            </Button>
          )}
        </Paper>
      )}
    </Box>
  );
};
