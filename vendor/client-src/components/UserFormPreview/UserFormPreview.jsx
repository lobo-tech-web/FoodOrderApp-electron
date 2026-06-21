import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// ---- MATERIAL UI ----
import {
  TextField,
  Button,
  Box,
  FormControl,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  Paper,
  Typography,
  Stack,
  Divider,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
// ICONS
import {
  Payment as PaymentIcon,
  TableBar as TableBarIcon,
  Moped as MopedIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Comment as CommentIcon,
  AttachMoney as AttachMoneyIcon,
  ArrowBack as ArrowBackIcon,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material';
// ---------------------

// ---- COMPONENTS ----
import { LoadingComponent } from '@/components/LoadingComponent/LoadingComponent.jsx';
import { AuthBanner } from './AuthBanner/AuthBanner.jsx';
// --------------------

// ---- HOOKS ----
import { useAlert } from '@/hooks/Alert.jsx';
import { useLoginModal } from '../../context/LoginContext.jsx';
import { useRegisterModal } from '@/context/RegisterContext.jsx';
// ---------------

// ---- CONTEXT ----
import { useCart } from '@/context/Cart.jsx';
import { useOrders } from '@/context/Orders.jsx';
import { useUser } from '@/context/Users.jsx';
// -----------------

// ---- UTILS ----
import { sendWhatsAppOrder } from '@/utils/whatsAppMessage.js';
// ---------------

// ---- STYLES ----
const textFieldStyle = {
  mb: 2,
  fontFamily: 'fontFamily.secondary',
  color: 'text.primary',
  bgcolor: 'transparent',
  border: 2,
  '& .MuiInputBase-input': {
    color: 'text.primary',
    bgcolor: 'transparent',
    '&:-webkit-autofill': {
      WebkitBoxShadow: '0 0 0 1000px #FFF inset !important',
      WebkitTextFillColor: '#000',
      backgroundColor: '#FFF !important',
      transition: 'background-color 5000s ease-in-out 0s',
    },
    '&:-webkit-autofill:hover': {
      WebkitBoxShadow: '0 0 0 1000px #FFF inset !important',
      WebkitTextFillColor: '#000',
      backgroundColor: '#FFF !important',
    },
    '&:-webkit-autofill:focus': {
      WebkitBoxShadow: '0 0 0 1000px #FFF inset !important',
      WebkitTextFillColor: '#000',
      backgroundColor: '#FFF !important',
    },
    '&:-webkit-autofill:active': {
      WebkitBoxShadow: '0 0 0 1000px #FFF inset !important',
      WebkitTextFillColor: '#000',
      backgroundColor: '#FFF !important',
    },
  },
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'transparent',
    color: 'primary.main',
    '& fieldset': {
      borderColor: 'primary.main',
    },
    '&:hover fieldset': {
      borderColor: 'primary.main',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main',
    },
    '&.Mui-error fieldset': {
      borderColor: 'error.main',
    },
  },
};

const labelStyle = {
  fontFamily: 'fontFamily.secondary',
  color: 'text.primary',
  fontWeight: 600,
  fontSize: { xs: '0.875rem', md: '1rem' },
  mb: 1,
  display: 'flex',
  alignItems: 'center',
  gap: 1,
};

const selectStyle = {
  fontFamily: 'fontFamily.secondary',
  color: 'text.primary',
  border: 2,
  marginBottom: 2,
  '& .MuiInputLabel-root': { color: 'transparent' },
  '& .MuiInputBase-input': {
    color: 'text.primary',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'primary.main',
    },
    '&:hover fieldset': {
      borderColor: 'primary.light',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main',
    },
    '&.Mui-error fieldset': {
      borderColor: 'error.main',
    },
  },
};

const menuItemStyle = {
  fontFamily: 'fontFamily.secondary',
  color: '#000',
  bgcolor: '#FFF',
  '&:hover': {
    bgcolor: '#b8b6ba !important',
    color: '#000 !important',
  },
  '&.Mui-selected': {
    bgcolor: '#FFF !important',
    color: '#000 !important',
  },
  '&.Mui-selected:hover': {
    bgcolor: '#FFF !important',
    color: '#000 !important',
  },
};
// ----------------

export const UserFormPreview = ({
  restaurantId,
  restaurantName,
  whatsAppNumber,
  cartItems,
  onBack,
  methodPay = [],
  orderType = [],
  deliveryCost = 0.0,
  isTaxsIncluded,
  totalTaxAmount = 0.0,
  addComment = '',
  tables = [],
  defaultOrderType = '',
  lockOrderType = false,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { AlertComponent, showAlert } = useAlert();

  const { openLoginModal } = useLoginModal();
  const { openRegisterModal } = useRegisterModal();

  // ---- RESPONSIVE ----
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { userState, updateUserPoints } = useUser();
  const { clearCart, totalOrderAmount, totalRewardPoints, totalRedeemPoints } =
    useCart();
  const { addOrder } = useOrders();

  const isUserLoggedIn = useMemo(
    () => Boolean(userState?.user?.id),
    [userState?.user?.id]
  );

  const handleLogin = () => openLoginModal();
  const handleRegister = () => openRegisterModal();

  // VERIFICAMOS SI EL USUARIO LOGUEADO TIENE PTOS DEL RESTAURANTE
  const userPointsForRestaurant = useMemo(
    () =>
      userState?.user?.points?.find(
        (point) => point.restaurantId === restaurantId
      ) || null,
    [userState?.user?.points, restaurantId]
  );

  const currentUser = useMemo(() => userState?.user || {}, [userState?.user]);

  const [userForm, setUserForm] = useState({
    paymentMethod: '',
    clientEmail: currentUser.email || '',
    clientName: currentUser.name || '',
    deliveryAddress: currentUser.address || '',
    contactPhone: currentUser.phone || '',
    orderType: defaultOrderType || '',
    tableid: '',
    comentary: '',
  });

  // Estado para errores de validación
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prev) => {
      if (name === 'orderType') {
        return {
          ...prev,
          orderType: value,
          tableid: value === 'CONSUMIR EN LOCAL' ? prev.tableid : '',
          deliveryAddress:
            value === 'DELIVERY' ? currentUser.address || '' : value,
        };
      }
      return { ...prev, [name]: value };
    });

    // Limpiar error específico cuando el usuario comienza a escribir
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const [ignoreEmail, setIgnoreEmail] = useState(false);
  const DEFAULT_EMAIL = 'lobotech.bb@gmail.com';

  const handleIgnoreEmail = (e) => {
    const checked = e.target.checked;
    setIgnoreEmail(checked);
    if (checked) {
      setUserForm((prev) => ({ ...prev, clientEmail: DEFAULT_EMAIL }));
      if (errors.clientEmail)
        setErrors((prev) => ({ ...prev, clientEmail: '' }));
      if (totalRewardPoints > 0)
        showAlert(
          `Al omitir el email no se otorgarán los ${totalRewardPoints} puntos de este pedido`,
          'warning'
        );
    } else {
      setUserForm((prev) => ({
        ...prev,
        clientEmail: currentUser.email || '',
      }));
    }
  };

  // Validar el formulario antes de enviar
  const validateForm = () => {
    const newErrors = {};

    // Método de pago
    if (!userForm.paymentMethod) {
      newErrors.paymentMethod = 'Selecciona un método de pago';
    }

    // Tipo de orden
    if (!userForm.orderType) {
      newErrors.orderType = 'Selecciona tipo de entrega';
    }

    if (userForm.orderType === 'CONSUMIR EN LOCAL' && !userForm.tableid) {
      newErrors.tableid = 'Selecciona una mesa';
    }

    // Email válido
    if (!userForm.clientEmail) {
      newErrors.clientEmail = 'El email es obligatorio';
    } else if (!userForm.clientEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.clientEmail = 'Ingresa un email válido';
    }

    // Nombre completo
    if (userForm.clientName.length < 3) {
      newErrors.clientName = 'Ingresa tu nombre completo';
    }

    // Teléfono
    if (!userForm.contactPhone.match(/^[0-9+\s()-]{8,15}$/)) {
      newErrors.contactPhone = 'Ingresa un número de teléfono válido';
    }

    // Dirección para delivery
    if (
      userForm.orderType === 'DELIVERY' &&
      (!userForm.deliveryAddress || userForm.deliveryAddress.length < 5)
    ) {
      newErrors.deliveryAddress = 'Ingresa una dirección válida para el envío';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstErrorKey = Object.keys(newErrors)[0];
      return { isValid: false, errorMessage: newErrors[firstErrorKey] };
    }

    return { isValid: true, errorMessage: null };
  };

  const buildOrderComment = () => {
    const clientComment = userForm.comentary?.trim();
    const scheduledComment = addComment?.trim();

    if (clientComment && scheduledComment) {
      return `${clientComment}\n${scheduledComment}`;
    }

    if (scheduledComment) {
      return `${scheduledComment}`;
    }

    return clientComment || 'SIN COMENTARIOS';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateForm();
    if (validation.isValid === false) {
      console.log(validation.errorMessage);
      showAlert(validation.errorMessage, 'warning');
      return;
    }

    // SI el pedido requiere canje de puntos...
    if (totalRedeemPoints > 0) {
      // 1. Usuario no logueado
      if (!userState.user || !userState.user.id) {
        openLoginModal();
        return showAlert(
          'Debes iniciar sesión para continuar con el canje.',
          'warning'
        );
      }
      // 2. Usuario logueado pero no tiene puntos suficientes
      if (
        !userPointsForRestaurant ||
        userPointsForRestaurant.points < totalRedeemPoints
      ) {
        return showAlert('No tienes suficientes puntos para canjear.', 'error');
      }
    }

    setLoading(true);
    try {
      const orderData = {
        userId: currentUser.id || restaurantId,
        restaurantId,
        restaurantName,
        tableid: userForm.tableid,
        cartItems,
        totalRewardPoints,
        totalRedeemPoints,
        deliverycost: deliveryCost > 0 ? deliveryCost : 0.0,
        servicetax: isTaxsIncluded ? totalTaxAmount : 0.0,
        totalAmount: isTaxsIncluded
          ? totalOrderAmount + totalTaxAmount
          : totalOrderAmount,
        ...userForm,
        deliveryAddress: userForm.deliveryAddress || userForm.orderType,
        comentary: buildOrderComment(),
      };
      await addOrder(orderData);
      if (
        totalRedeemPoints > 0 &&
        totalRedeemPoints <= (userPointsForRestaurant?.points || 0)
      )
        updateUserPoints(restaurantId, totalRedeemPoints);

      if (whatsAppNumber) {
        sendWhatsAppOrder(orderData, whatsAppNumber);
        showAlert(
          '¡Pedido enviado exitosamente! Te contactaremos por WhatsApp',
          'success'
        );
      } else {
        showAlert('¡Pedido enviado exitosamente!', 'success');
        setTimeout(() => {
          navigate(-1);
        }, 1500);
      }
      clearCart();
    } catch (error) {
      showAlert(error?.message || 'Error desconocido', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUserForm((prevForm) => ({
      ...prevForm,
      clientEmail: currentUser.email || prevForm.clientEmail,
      clientName: currentUser.name || prevForm.clientName,
      contactPhone: currentUser.phone || prevForm.contactPhone,
    }));
  }, [currentUser.email, currentUser.name, currentUser.phone]);

  useEffect(() => {
    if (!defaultOrderType) return;

    setUserForm((prevForm) => ({
      ...prevForm,
      orderType: defaultOrderType,
      deliveryAddress:
        defaultOrderType === 'DELIVERY'
          ? currentUser.address || prevForm.deliveryAddress
          : defaultOrderType,
      tableid: defaultOrderType === 'CONSUMIR EN LOCAL' ? prevForm.tableid : '',
    }));
  }, [defaultOrderType, currentUser.address]);

  if (loading) return <LoadingComponent message={'Procesando tu pedido...'} />;

  return (
    <>
      <Box
        component="form"
        id="user-details-form"
        onSubmit={handleSubmit}
        sx={{ mt: 3 }}
      >
        {/* Banner de autenticación - Solo mostrar si el usuario NO está logueado */}
        {!isUserLoggedIn && (
          <AuthBanner
            onLogin={handleLogin}
            onRegister={handleRegister}
            totalRewardPoints={totalRewardPoints}
            isMobile={isMobile}
          />
        )}
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            bgcolor: 'background.default',
            mb: 3,
            border: '1px solid',
            borderColor: 'primary.main',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          <Typography
            variant={isMobile ? 'h6' : 'h5'}
            sx={{
              fontFamily: 'fontFamily.secondary',
              color: 'text.primary',
              mb: 3,
              pb: 2,
              borderBottom: '2px solid',
              borderColor: 'text.primary',
              textAlign: 'center',
            }}
          >
            CONFIRMACIÓN DEL PEDIDO
          </Typography>

          <Stack spacing={4}>
            {/* Primera fila: Método de pago y tipo de orden */}
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={3}
              sx={{ width: '100%' }}
            >
              {/* MÉTODO DE PAGO */}
              <Box sx={{ width: '100%' }}>
                <Typography sx={labelStyle}>
                  <PaymentIcon
                    sx={{ color: 'primary.main', fontSize: '1.2rem' }}
                  />
                  MÉTODO DE PAGO
                </Typography>
                <FormControl fullWidth sx={selectStyle}>
                  <Select
                    value={userForm.paymentMethod}
                    name="paymentMethod"
                    onChange={handleInputChange}
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected) {
                        return (
                          <Box
                            sx={{ color: 'text.primary', fontStyle: 'italic' }}
                          >
                            Selecciona un método de pago
                          </Box>
                        );
                      }
                      return selected;
                    }}
                  >
                    {methodPay?.map((pay, index) => (
                      <MenuItem
                        key={pay + index}
                        value={pay}
                        sx={menuItemStyle}
                      >
                        {pay}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* TAKE AWAY / DELIVERY / CONSUMIR EN LOCAL */}
              <Box sx={{ width: '100%' }}>
                <Typography sx={labelStyle}>
                  <MopedIcon
                    sx={{ color: 'primary.main', fontSize: '1.2rem' }}
                  />
                  TIPO DE ENTREGA
                </Typography>
                <FormControl fullWidth sx={selectStyle}>
                  <Select
                    value={userForm.orderType}
                    name="orderType"
                    disabled={lockOrderType}
                    onChange={handleInputChange}
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected) {
                        return (
                          <Box
                            sx={{ color: 'text.primary', fontStyle: 'italic' }}
                          >
                            Selecciona tipo de entrega
                          </Box>
                        );
                      }
                      return selected;
                    }}
                  >
                    {orderType?.map((type, index) => (
                      <MenuItem
                        key={type + index}
                        value={type}
                        sx={menuItemStyle}
                      >
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* MESAS PARA CONSUMIR EN LOCAL */}
              {userForm.orderType === 'CONSUMIR EN LOCAL' &&
                tables.length > 0 && (
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={3}
                    sx={{ width: '100%' }}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Typography sx={labelStyle}>
                        <TableBarIcon
                          sx={{ color: 'primary.main', fontSize: '1.2rem' }}
                        />
                        MESA
                      </Typography>
                      <FormControl fullWidth sx={selectStyle}>
                        <Select
                          value={userForm.tableid}
                          name="tableid"
                          onChange={handleInputChange}
                          displayEmpty
                          renderValue={(selected) => {
                            if (!selected) {
                              return (
                                <Box
                                  sx={{
                                    color: 'text.primary',
                                    fontStyle: 'italic',
                                  }}
                                >
                                  Selecciona tu mesa
                                </Box>
                              );
                            }
                            return `Mesa ${selected}`;
                          }}
                        >
                          {tables?.map((table, index) => (
                            <MenuItem
                              key={table + index}
                              value={table}
                              sx={menuItemStyle}
                            >
                              Mesa {table}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        display: { xs: 'none', md: 'block' },
                      }}
                    />
                  </Stack>
                )}
            </Stack>

            {/* Segunda fila: Email y Nombre */}
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={3}
              sx={{ width: '100%' }}
            >
              {/* EMAIL */}
              <Box sx={{ width: '100%' }}>
                <Typography sx={labelStyle}>
                  <EmailIcon
                    sx={{ color: 'primary.main', fontSize: '1.2rem' }}
                  />
                  EMAIL
                </Typography>

                <TextField
                  fullWidth
                  type="email"
                  placeholder="tu@email.com"
                  name="clientEmail"
                  value={userForm.clientEmail}
                  onChange={handleInputChange}
                  sx={textFieldStyle}
                  disabled={ignoreEmail}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={ignoreEmail}
                      onChange={handleIgnoreEmail}
                      size="small"
                      sx={{
                        color: 'primary.main',
                        '&.Mui-checked': { color: 'primary.main' },
                      }}
                    />
                  }
                  label={
                    <Typography
                      sx={{
                        fontFamily: 'fontFamily.secondary',
                        fontSize: { xs: '0.75rem', md: '0.85rem' },
                        color: 'text.primary',
                      }}
                    >
                      OMITIR EMAIL
                    </Typography>
                  }
                  sx={{ mr: 0 }}
                />
              </Box>

              {/* NOMBRE */}
              <Box sx={{ width: '100%' }}>
                <Typography sx={labelStyle}>
                  <PersonIcon
                    sx={{ color: 'primary.main', fontSize: '1.2rem' }}
                  />
                  NOMBRE COMPLETO
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Ingresa tu nombre completo"
                  name="clientName"
                  value={userForm.clientName}
                  onChange={handleInputChange}
                  sx={textFieldStyle}
                />
              </Box>
            </Stack>

            {/* Tercera fila: Teléfono y Dirección (si es DELIVERY) */}
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={3}
              sx={{ width: '100%' }}
            >
              {/* TELÉFONO */}
              <Box sx={{ width: '100%' }}>
                <Typography sx={labelStyle}>
                  <PhoneIcon
                    sx={{ color: 'primary.main', fontSize: '1.2rem' }}
                  />
                  TELÉFONO / CEL
                </Typography>
                <TextField
                  fullWidth
                  name="contactPhone"
                  value={userForm.contactPhone}
                  onChange={handleInputChange}
                  sx={textFieldStyle}
                />
              </Box>

              {/* Dirección solo si es DELIVERY */}
              {userForm.orderType === 'DELIVERY' && (
                <Box sx={{ width: '100%' }}>
                  <Typography sx={labelStyle}>
                    <HomeIcon
                      sx={{ color: 'primary.main', fontSize: '1.2rem' }}
                    />
                    DIRECCIÓN DE ENTREGA
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Calle, número, piso, depto, referencias"
                    name="deliveryAddress"
                    value={userForm.deliveryAddress}
                    onChange={handleInputChange}
                    sx={textFieldStyle}
                  />
                </Box>
              )}
            </Stack>

            {/* COMENTARIO */}
            <Box sx={{ width: '100%' }}>
              <Typography sx={labelStyle}>
                <CommentIcon
                  sx={{ color: 'primary.main', fontSize: '1.2rem' }}
                />
                COMENTARIOS PARA EL PEDIDO (OPCIONAL)
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="SIN COMENTARIOS"
                name="comentary"
                value={userForm.comentary}
                onChange={handleInputChange}
                sx={textFieldStyle}
              />
              {addComment && (
                <Alert
                  severity="info"
                  sx={{
                    mt: 1,
                    whiteSpace: 'pre-line',
                    fontFamily: 'fontFamily.secondary',
                    bgcolor: 'background.default',
                    color: 'text.primary',
                    border: '1px solid',
                    borderColor: 'primary.main',
                    '& .MuiAlert-icon': {
                      color: 'primary.main',
                    },
                  }}
                >
                  {addComment}
                </Alert>
              )}
            </Box>
            <Box>
              <Divider sx={{ my: 2, borderColor: 'primary.main' }} />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  bgcolor: 'primary.main',
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: 'primary.main',
                }}
              >
                <Typography
                  variant={isMobile ? 'h6' : 'h5'}
                  sx={{
                    fontFamily: 'fontFamily.secondary',
                    color: 'text.secondary',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <AttachMoneyIcon />
                  TOTAL A PAGAR
                </Typography>

                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  sx={{
                    fontFamily: 'fontFamily.secondary',
                    color: 'text.secondary',
                    fontWeight: 'bold',
                  }}
                >
                  {isTaxsIncluded
                    ? `${(totalOrderAmount + totalTaxAmount).toLocaleString(
                        'es-AR'
                      )} ${userForm.orderType === 'DELIVERY' ? '+ ENVIO' : ''}`
                    : `${totalOrderAmount.toLocaleString('es-AR')} ${
                        userForm.orderType === 'DELIVERY' ? '+ ENVIO' : ''
                      }`}
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Paper>

        <Stack
          spacing={2}
          direction={{ xs: 'column', md: 'row' }}
          sx={{
            mt: 3,
            maxWidth: '800px',
            mx: 'auto',
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{
              fontFamily: 'fontFamily.secondary',
              fontSize: { xs: '1rem', md: '1.1rem' },
              color: 'text.primary',
              borderColor: 'text.primary',
              borderWidth: 2,
              py: 1.5,
              borderRadius: 3,
              flex: 1,
              transition: 'all 0.3s',
              '&:hover': {
                borderColor: 'text.secondary',
                bgcolor: 'primary.main',
                color: 'text.secondary',
                transform: 'translateY(-2px)',
                borderWidth: 2,
              },
            }}
          >
            VOLVER AL CARRITO
          </Button>

          <Button
            variant="contained"
            type="submit"
            endIcon={<WhatsAppIcon />}
            sx={{
              fontFamily: 'fontFamily.secondary',
              fontSize: { xs: '1rem', md: '1.1rem' },
              bgcolor: 'primary.main',
              color: 'text.secondary',
              borderColor: 'text.secondary',
              py: 1.5,
              borderRadius: 3,
              flex: 1,
              boxShadow: 3,
              transition: 'all 0.3s',
              '&:hover': {
                bgcolor: '#075E54',
                transform: 'translateY(-2px)',
              },
            }}
          >
            ENVIAR PEDIDO
          </Button>
        </Stack>
      </Box>
      {AlertComponent}
    </>
  );
};
