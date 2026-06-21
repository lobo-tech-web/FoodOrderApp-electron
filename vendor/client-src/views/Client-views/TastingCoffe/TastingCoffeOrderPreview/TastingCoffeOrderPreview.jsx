import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// ---- MATERIAL UI ----
import { Container, Button, Box, ThemeProvider } from '@mui/material';
// <--------------------

// ---- THEME ----
import { tastingCoffeTheme } from '@/theme/Client-theme/tastingCoffe-theme.js';
// <--------------

// ---- FONT-AWESOME ----
import { faMugSaucer } from '@fortawesome/free-solid-svg-icons';
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
import { taxAmount } from '@/utils/lobotechUtils.js'; // TARIFA DE SERVICIO
// ---------------

// ---- ID DEL CLIENTE ----
const client_id = import.meta.env.VITE_API_CLIENT_TASTING_COFFE_ID;
// <-----------------------

export const TastingCoffeOrderPreview = () => {
  const navigate = useNavigate();
  const { AlertComponent, showAlert } = useAlert();
  const { cartItems } = useCart();
  const { userState, getClientInfo } = useUser();

  // Información del local
  const clientInfo = useMemo(
    () => userState?.clientUserInfo || {},
    [userState?.clientUserInfo]
  );

  // Formulario UserFormPreview
  const [showForm, setShowForm] = useState(false);
  const handleContinue = () => {
    if (isOpenNow(clientInfo?.workingHours)) {
      setShowForm(true);
    } else {
      showAlert(
        'EL LOCAL SE ENCUENTRA CERRADO EN ESTE MOMENTO',
        'warning',
        tastingCoffeTheme
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
  const toMainMenuPage = '/menu/tasting-coffe';
  // const methodPay = ['MERCADO PAGO', 'EFECTIVO', 'TRANSFERENCIA']; // ESTOS SON LOS MÉTODOS DE PAGO
  const methodPay = ['MERCADO PAGO', 'EFECTIVO', 'TRANSFERENCIA'];
  // const orderType = ['RETIRO EN LOCAL', 'DELIVERY', 'CONSUMIR EN LOCAL']; // ESTOS SON LOS TIPOS DE ENTREGA DEL PEDIDO
  const orderType = ['RETIRO EN LOCAL', 'DELIVERY', 'CONSUMIR EN LOCAL'];
  const tables = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!client_id) return;
    getClientInfo(client_id);
  }, [getClientInfo]);

  return (
    <ThemeProvider theme={tastingCoffeTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          pb: 4,
          position: 'relative',
          bgcolor: 'background.main',
        }}
      >
        <MainNavBar
          customIcon={faMugSaucer}
          title={'Tasting Coffe'}
          restaurantId={client_id}
        />

        <Container maxWidth="lg">
          {!showForm ? (
            <>
              <CartPreview
                cartItems={cartItems}
                isEditing={true}
                toMenu={toMainMenuPage}
                isTaxsIncluded={true} // TARIFA DE SERVICIO
                totalTaxAmount={taxAmount} // VALOR DE LA TARIFA
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
              isTaxsIncluded={true} // TARIFA DE SERVICIO
              totalTaxAmount={taxAmount} // VALOR DE LA TARIFA
              tables={tables}
            />
          )}
        </Container>
      </Box>
      {AlertComponent}
    </ThemeProvider>
  );
};
