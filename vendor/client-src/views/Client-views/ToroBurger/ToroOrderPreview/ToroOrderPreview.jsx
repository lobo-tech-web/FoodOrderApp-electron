import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// ---- MATERIAL UI ----
import { Container, Button, Box, ThemeProvider } from '@mui/material';
// <--------------------

// ---- THEME ----
import { toroBurgerTheme } from '@/theme/Client-theme/toroBurger-theme.js';
// <--------------

// ---- FONT-AWESOME ----
import { faBurger } from '@fortawesome/free-solid-svg-icons';
// ----------------------

// ---- COMPONENTS ----
import { MainNavBar } from '@/components/MainNavBar/MainNavBar.jsx';
import { CartPreview } from '@/components/CartPreview/CartPreview.jsx';
import { UserFormPreview } from '@/components/UserFormPreview/UserFormPreview.jsx';
// <-------------------

// ---- CONTEXT ----
import { useCart } from '@/context/Cart.jsx';
import { useUser } from '@/context/Users.jsx';
// <----------------

// ---- HOOKS ----
import { useAlert } from '@/hooks/Alert.jsx';
// ---------------

// ---- UTILS ----
import { isOpenNow } from '@/utils/clientWorking.js';
// ---------------

// ---- ID DEL CLIENTE ----
const client_id = import.meta.env.VITE_API_CLIENT_TORO_BURGER_ID;
// <-----------------------

export const ToroOrderPreview = () => {
  const navigate = useNavigate();
  // HOOK
  const { AlertComponent, showAlert } = useAlert();
  // CONTEXT
  const { cartItems } = useCart();
  const { userState, getClientInfo } = useUser();

  // INFORMACIÓN DEL CLIENTE (RESTAURANTE)
  const clientInfo = useMemo(
    () => userState?.clientUserInfo || {},
    [userState?.clientInfo]
  );

  // MOSTRAR FORMULARIO DEL USUARIO
  const [showForm, setShowForm] = useState(false);
  const handleContinue = () => {
    if (isOpenNow(clientInfo?.workingHours)) {
      showAlert(
        '!Recorda registrarte para sumar puntos!',
        'success',
        toroBurgerTheme
      );
      setShowForm(true);
    } else {
      showAlert(
        'EL LOCAL SE ENCUENTRA CERRADO EN ESTE MOMENTO',
        'warning',
        toroBurgerTheme
      );
      setTimeout(() => {
        navigate(-1);
      }, 1000);
    }
  };

  const handleBack = useCallback(() => {
    setShowForm(false);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Hacer scroll hasta arriba
  }, []);

  // ---- HARDCODEO PARA CADA CLIENTE ----
  const toMainMenuPage = '/menu/toro-burger';
  // const methodPay = ['MERCADO PAGO', 'EFECTIVO', 'TRANSFERENCIA']; // ESTOS SON LOS MÉTODOS DE PAGO
  const methodPay = ['MERCADO PAGO', 'EFECTIVO', 'TRANSFERENCIA'];
  // const orderType = ['RETIRO EN LOCAL', 'DELIVERY', 'CONSUMIR EN LOCAL']; // ESTOS SON LOS TIPOS DE ENTREGA DEL PEDIDO
  const orderType = ['RETIRO EN LOCAL', 'DELIVERY'];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    getClientInfo(client_id);
  }, [client_id]);

  return (
    <ThemeProvider theme={toroBurgerTheme}>
      <Box
        sx={{
          pb: 4,
          width: '100%',
          minHeight: '100vh',
          position: 'relative',
          bgcolor: 'background.main',
        }}
      >
        <MainNavBar
          customIcon={faBurger}
          title={'toro burger & beer'}
          restaurantId={client_id}
        />

        <Container maxWidth="lg">
          {!showForm ? (
            <>
              <CartPreview
                cartItems={cartItems}
                isEditing={true}
                toMenu={toMainMenuPage}
              />

              <Button
                variant="contained"
                fullWidth
                onClick={handleContinue}
                disabled={cartItems.length === 0}
                sx={{
                  fontFamily: 'fontFamily.secondary',
                  fontSize: '1.2rem',
                  bgcolor: 'primary.main',
                  color: 'text.secondary',
                  py: 2,
                  mt: 2,
                  maxWidth: '800px',
                  mx: 'auto',
                  display: 'block',
                  borderRadius: 3,
                }}
              >
                CONTINUAR
              </Button>
            </>
          ) : (
            <UserFormPreview
              restaurantId={client_id}
              restaurantName={clientInfo.businessName}
              whatsAppNumber={clientInfo.whatsappNumber}
              cartItems={cartItems}
              onBack={handleBack}
              methodPay={methodPay}
              orderType={orderType}
            />
          )}
        </Container>
      </Box>
      {AlertComponent}
    </ThemeProvider>
  );
};
