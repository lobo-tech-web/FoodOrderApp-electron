import { useEffect, useState } from 'react';

// ---- MATERIAL UI ----
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
  ListItem,
  Box,
  Paper,
  Chip,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
  Avatar,
  Fade,
  Pagination,
  Button,
} from '@mui/material';
// ICONS
import {
  ExpandMore as ExpandMoreIcon,
  Restaurant as RestaurantIcon,
  AccessTime as AccessTimeIcon,
  LocalShipping as LocalShippingIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Receipt as ReceiptIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
// ---------------------

// ---- COMPONENTS ----
import { LoadingComponent } from '@/components/LoadingComponent/LoadingComponent.jsx';
// --------------------

// ---- SERVICES ----
import { getAllOrdersFromUserServices } from '@/services/orders.js';
// ------------------

export const ProfileUserOrders = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [allOrders, setAllOrders] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  // Calcular pedidos para la página actual
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = allOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(allOrders.length / ordersPerPage);

  // Manejar cambio de página
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Navegación con botones
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Función para obtener el icono de estado
  const getStatusIcon = (status) => {
    switch (status) {
      case 'FINALIZADO':
        return (
          <CheckCircleIcon sx={{ color: 'success.main', fontSize: '1rem' }} />
        );
      case 'CANCELADO':
        return <CancelIcon sx={{ color: 'error.main', fontSize: '1rem' }} />;
      default:
        return <PendingIcon sx={{ color: 'warning.main', fontSize: '1rem' }} />;
    }
  };

  // Función para obtener el color del chip de estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'FINALIZADO':
        return 'success';
      case 'CANCELADO':
        return 'error';
      case 'EN PREPARACIÓN':
        return 'info';
      case 'EN ENVIO':
        return 'info';
      default:
        return 'warning';
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) return;
      setLoading(true);

      try {
        const response = await getAllOrdersFromUserServices(user.id);
        setAllOrders(response);
      } catch (error) {
        console.error('Error al obtener las órdenes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user?.id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [allOrders.length]);

  if (loading) return <LoadingComponent />;

  if (!allOrders || allOrders.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          px: 2,
        }}
      >
        <ReceiptIcon
          sx={{
            fontSize: '4rem',
            color: 'text.primary',
            mb: 2,
          }}
        />
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'fontFamily.secondary',
            color: 'text.primary',
            textAlign: 'center',
            mb: 1,
          }}
        >
          No tienes pedidos aún
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'fontFamily.secondary',
            color: 'text.primary',
            textAlign: 'center',
          }}
        >
          Cuando realices tu primer pedido aparecerá aquí
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header con información de paginación */}
      <Box sx={{ mb: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'fontFamily.terciary',
              color: 'text.primary',
            }}
          >
            Mis Pedidos ({allOrders.length})
          </Typography>

          <Typography
            variant="body2"
            sx={{
              fontFamily: 'fontFamily.secondary',
              color: 'text.primary',
            }}
          >
            Mostrando {indexOfFirstOrder + 1}-
            {Math.min(indexOfLastOrder, allOrders.length)} de {allOrders.length}{' '}
            pedidos
          </Typography>
        </Stack>
      </Box>

      <Stack spacing={2}>
        {currentOrders.map((order, index) => (
          <Fade key={order.id} in={true} timeout={300 + index * 100}>
            <Accordion
              elevation={2}
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'primary.main',
                '&:before': {
                  display: 'none',
                },
                '&.Mui-expanded': {
                  margin: 0,
                },
                '& .MuiAccordionSummary-root': {
                  minHeight: { xs: 80, sm: 72 },
                },
              }}
            >
              <AccordionSummary
                expandIcon={
                  <ExpandMoreIcon
                    sx={{
                      color: 'text.primary',
                      fontSize: { xs: '1.2rem', sm: '1.5rem' },
                    }}
                  />
                }
                sx={{
                  bgcolor: 'background.main',
                  borderBottom: '1px solid',
                  borderColor: 'primary.main',
                  px: { xs: 2, sm: 3 },
                  py: { xs: 1, sm: 1.5 },
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 1, sm: 2 }}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  sx={{ width: '100%', pr: 1 }}
                >
                  {/* Información principal del pedido */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: 'background.paper',
                          width: { xs: 32, sm: 40 },
                          height: { xs: 32, sm: 40 },
                          display: { xs: 'none', sm: 'flex' },
                        }}
                      >
                        <RestaurantIcon
                          sx={{
                            fontSize: '1.2rem',
                            color: 'primary.main',
                          }}
                        />
                      </Avatar>

                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontFamily: 'fontFamily.secondary',
                            color: 'primary.main',
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {order?.restaurantName?.toUpperCase()}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'fontFamily.secondary',
                            color: 'text.primary',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          }}
                        >
                          Pedido #{order.id}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Box sx={{ minWidth: { xs: 'auto', sm: 140 } }}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <AccessTimeIcon
                        sx={{
                          color: 'text.primary',
                          fontSize: { xs: '0.9rem', sm: '1rem' },
                        }}
                      />
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'fontFamily.secondary',
                            color: 'text.secondary',
                            fontSize: { xs: '0.7rem', sm: '0.8rem' },
                          }}
                        >
                          {`${order.orderDate.hour}:${order.orderDate.minute}:${order.orderDate.second} - ${order.orderDate.day}/${order.orderDate.month}/${order.orderDate.year}`}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  {/* Estado del pedido */}
                  <Box sx={{ minWidth: { xs: 'auto', sm: 120 } }}>
                    <Chip
                      icon={getStatusIcon(order.status)}
                      label={order.status}
                      color={getStatusColor(order.status)}
                      size={isMobile ? 'small' : 'medium'}
                      sx={{
                        fontFamily: 'fontFamily.secondary',
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        '& .MuiChip-icon': {
                          fontSize: { xs: '0.8rem', sm: '1rem' },
                        },
                      }}
                    />
                  </Box>
                </Stack>
              </AccordionSummary>

              <AccordionDetails sx={{ p: 0 }}>
                {/* Detalles del pedido */}
                <Box
                  sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.default' }}
                >
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={{ xs: 2, md: 3 }}
                    alignItems="stretch"
                  >
                    <Box
                      sx={{
                        flex: { xs: 1, md: '0 0 300px', overflow: 'hidden' },
                      }}
                    >
                      <Paper
                        elevation={1}
                        sx={{
                          p: { xs: 2, sm: 2.5 },
                          borderRadius: 2,
                          bgcolor: 'background.main',
                          height: 'auto',
                          border: '1px solid',
                          borderColor: 'primary.main',
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontFamily: 'fontFamily.terciary',
                            color: 'text.primary',
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            mb: 2,
                          }}
                        >
                          DETALLES DEL PEDIDO
                        </Typography>

                        <Stack spacing={2}>
                          <Box>
                            <Stack
                              direction="row"
                              spacing={1.5}
                              alignItems="center"
                            >
                              <LocalShippingIcon
                                sx={{
                                  color: 'primary.main',
                                  mr: 1.5,
                                  fontSize: '1.2rem',
                                }}
                              />
                              <Box>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontFamily: 'fontFamily.secondary',
                                    color: 'text.secondary',
                                    display: 'block',
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  Tipo de entrega
                                </Typography>

                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontFamily: 'fontFamily.secondary',
                                    color: 'text.primary',
                                  }}
                                >
                                  {order.orderType}
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>

                          <Divider sx={{ bgcolor: 'primary.main' }} />

                          <Box>
                            <Stack
                              direction="row"
                              spacing={1.5}
                              alignItems="center"
                            >
                              <AccessTimeIcon
                                sx={{
                                  color: 'primary.main',
                                  fontSize: '1.2rem',
                                }}
                              />
                              <Box>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontFamily: 'fontFamily.secondary',
                                    color: 'text.secondary',
                                    display: 'block',
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  Hora y fecha
                                </Typography>

                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontFamily: 'fontFamily.secondary',
                                    color: 'text.primary',
                                  }}
                                >
                                  {`${order.orderDate.hour}:${order.orderDate.minute}:${order.orderDate.second} - ${order.orderDate.day}/${order.orderDate.month}/${order.orderDate.year}`}
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>

                          {order.comentary &&
                            order.comentary !== 'SIN COMENTARIOS' && (
                              <Box>
                                <Divider sx={{ bgcolor: 'primary.main' }} />
                                <Box sx={{ mt: 1 }}>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontFamily: 'fontFamily.secondary',
                                      color: 'text.secondary',
                                      display: 'block',
                                      fontSize: '0.75rem',
                                      mb: 0.5,
                                    }}
                                  >
                                    Comentarios
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontFamily: 'fontFamily.terciary',
                                      color: 'text.primary',
                                      p: 1,
                                      bgcolor: 'background.default',
                                      borderRadius: 1,
                                      border: '1px solid',
                                      borderColor: 'primary.main',
                                    }}
                                  >
                                    {order.comentary}
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                        </Stack>
                      </Paper>
                    </Box>

                    {/* Productos */}
                    <Box sx={{ flex: 1 }}>
                      <Paper
                        elevation={1}
                        sx={{
                          p: { xs: 2, sm: 2.5 },
                          borderRadius: 2,
                          bgcolor: 'background.main',
                          border: '1px solid',
                          borderColor: 'primary.main',
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontFamily: 'fontFamily.terciary',
                            color: 'text.primary',
                            mb: 2,
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                          }}
                        >
                          PRODUCTOS ( {order.cartItems.length} )
                        </Typography>

                        <List disablePadding>
                          {order.cartItems.map((item, index) => (
                            <Box key={index} sx={{ mb: 1 }}>
                              <ListItem
                                sx={{
                                  px: { xs: 1.5, sm: 2 },
                                  py: { xs: 1, sm: 1.5 },
                                  borderRadius: 2,
                                  bgcolor: 'background.default',
                                  border: '1px solid',
                                  borderColor: 'primary.main',
                                }}
                              >
                                <Stack
                                  direction={{ xs: 'column', sm: 'row' }}
                                  spacing={{ xs: 1, sm: 2 }}
                                  sx={{ width: '100%' }}
                                >
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      alignItems="center"
                                      flexWrap="wrap"
                                    >
                                      <Typography
                                        variant="subtitle2"
                                        sx={{
                                          fontFamily: 'fontFamily.primary',
                                          color: 'text.primary',
                                        }}
                                      >
                                        {item.quantity}x{' '}
                                        {item?.name?.toUpperCase()}
                                      </Typography>

                                      {/* PUNTOS DE RECOMPENSA */}
                                      {item.rewardPoints > 0 && (
                                        <Chip
                                          icon={
                                            <StarIcon
                                              sx={{
                                                fontSize: '0.8rem !important',
                                              }}
                                            />
                                          }
                                          label={`+${item.rewardPoints}`}
                                          color="primary"
                                          size="small"
                                          sx={{
                                            height: 20,
                                            '& .MuiChip-label': {
                                              px: 1,
                                              fontSize: '0.7rem',
                                            },
                                          }}
                                        />
                                      )}

                                      {/* PUNTOS RECLAMADOS */}
                                      {item.redeemPoints > 0 && (
                                        <Chip
                                          icon={
                                            <StarIcon
                                              sx={{
                                                fontSize: '0.8rem !important',
                                              }}
                                            />
                                          }
                                          label={`-${item.redeemPoints}`}
                                          color="primary"
                                          size="small"
                                          sx={{
                                            height: 20,
                                            '& .MuiChip-label': {
                                              px: 1,
                                              fontSize: '0.7rem',
                                            },
                                          }}
                                        />
                                      )}
                                    </Stack>

                                    {item.customOptions &&
                                      item.customOptions.length > 0 && (
                                        <Box
                                          sx={{ mt: 1, ml: { xs: 0, sm: 2 } }}
                                        >
                                          {item.customOptions.map(
                                            (opt, optIndex) => (
                                              <Typography
                                                key={optIndex}
                                                variant="caption"
                                                sx={{
                                                  fontFamily:
                                                    'fontFamily.terciary',
                                                  color: 'text.primary',
                                                  display: 'block',
                                                  fontSize: '0.75rem',
                                                }}
                                              >
                                                •{' '}
                                                {opt.quantity > 1
                                                  ? `${opt.quantity}x `
                                                  : ''}
                                                {opt?.name?.toUpperCase()}
                                                {opt.extraCost > 0
                                                  ? ` (+$${opt.extraCost})`
                                                  : ''}
                                              </Typography>
                                            )
                                          )}
                                        </Box>
                                      )}
                                  </Box>

                                  <Box
                                    sx={{
                                      textAlign: { xs: 'left', sm: 'right' },
                                      minWidth: 'fit-content',
                                    }}
                                  >
                                    <Typography
                                      variant="subtitle2"
                                      sx={{
                                        fontFamily: 'fontFamily.secondary',
                                        color: 'text.primary',
                                      }}
                                    >
                                      $
                                      {(
                                        item.price * item.quantity
                                      ).toLocaleString('es-AR')}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </ListItem>
                            </Box>
                          ))}
                        </List>

                        <Divider sx={{ bgcolor: 'primary.main', my: 2 }} />

                        {/* Resumen */}
                        <Stack spacing={1} alignItems="flex-end">
                          <Typography
                            variant="h6"
                            sx={{
                              fontFamily: 'fontFamily.secondary',
                              color: '#FFFF',
                            }}
                          >
                            Total: ${order.totalAmount.toLocaleString('es-AR')}
                          </Typography>

                          {/* PUNTOS CANJEADOS Y ACUMULADOS */}
                          <Stack
                            direction="row"
                            spacing={1}
                            flexWrap="wrap"
                            justifyContent="flex-end"
                          >
                            {order.totalRedeemPoints > 0 && (
                              <Chip
                                icon={<StarIcon />}
                                label={`-${order.totalRedeemPoints} puntos canjeados`}
                                size="small"
                                color="error"
                                sx={{
                                  fontFamily: 'fontFamily.secondary',
                                  fontSize: '0.75rem',
                                }}
                              />
                            )}

                            {order.totalRewardPoints > 0 && (
                              <Chip
                                icon={<StarIcon />}
                                label={`+${order.totalRewardPoints} puntos acumulados`}
                                color="success"
                                size="small"
                                sx={{
                                  fontFamily: 'fontFamily.secondary',
                                  fontSize: '0.75rem',
                                }}
                              />
                            )}
                          </Stack>
                        </Stack>
                      </Paper>
                    </Box>
                  </Stack>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Fade>
        ))}
      </Stack>
      {/* Controles de paginación */}
      {totalPages > 1 && (
        <Box sx={{ mt: 4, mb: 2 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
          >
            {/* Botones de navegación para móvil */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ display: { xs: 'flex', sm: 'none' } }}
            >
              <Button
                variant="outlined"
                startIcon={<NavigateBeforeIcon />}
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                size="small"
                sx={{
                  fontFamily: 'fontFamily.secondary',
                  borderColor: 'primary.main',
                  color: 'text.primary',
                }}
              >
                Anterior
              </Button>
              <Button
                variant="outlined"
                endIcon={<NavigateNextIcon />}
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                size="small"
                sx={{
                  fontFamily: 'fontFamily.secondary',
                  borderColor: 'primary.main',
                  color: 'text.primary',
                }}
              >
                Siguiente
              </Button>
            </Stack>

            {/* Paginación estándar para desktop */}
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                justifyContent: 'center',
                width: '100%',
              }}
            >
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size={isMobile ? 'small' : 'medium'}
                showFirstButton
                showLastButton
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontFamily: 'fontFamily.secondary',
                    color: 'text.primary',
                    borderColor: 'primary.main',
                  },
                  '& .Mui-selected': {
                    bgcolor: 'background.paper',
                    color: 'text.secondary',
                  },
                }}
              />
            </Box>

            {/* Información de página para móvil */}
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'fontFamily.secondary',
                color: 'text.primary',
                display: { xs: 'block', sm: 'none' },
                textAlign: 'center',
              }}
            >
              Página {currentPage} de {totalPages}
            </Typography>
          </Stack>
        </Box>
      )}
    </Box>
  );
};
