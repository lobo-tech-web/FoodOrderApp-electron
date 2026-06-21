import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// ---- MATERIAL UI ----
import { Container, Button, Box, ThemeProvider } from '@mui/material';
// <--------------------

// ---- THEME ----
import { laNacionTheme } from '@/theme/Client-theme/laNacion-theme.js';
// ---------------

// ---- FONT-AWESOME ----
import { faMugSaucer } from '@fortawesome/free-solid-svg-icons';
// ----------------------

// ---- COMPONENTS ----
import { MainNavBar } from '@/components/MainNavBar/MainNavBar.jsx';
import { CartPreview } from '@/components/CartPreview/CartPreview.jsx';
import { UserFormPreview } from '@/components/UserFormPreview/UserFormPreview.jsx';
import { NextDayOrderAlert } from '@/components/NextDayOrderAlert/NextDayOrderAlert.jsx';
// <-------------------

// ---- CONTEXT ----
import { useCart } from '@/context/Cart.jsx';
import { useUser } from '@/context/Users.jsx';
// <----------------

// ---- HOOKS ----
import { useAlert } from '@/hooks/Alert.jsx';
// ---------------

// ---- UTILS ----
import { isOpenNow, getNextDateNowDayjs } from '@/utils/clientWorking.js';
// ---------------

// ---- ID DEL CLIENTE ----
const client_id = import.meta.env.VITE_API_CLIENT_LA_NACION_ID;
// <-----------------------

export const LaNacionOrderPreview = () => {
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

  // ✅ ESTADOS PARA LA NUEVA ALERTA
  const [showNextDayAlert, setShowNextDayAlert] = useState(false);
  const [nextDayAlertAccepted, setNextDayAlertAccepted] = useState(false);
  const [nextDayComment, setNextDayComment] = useState('');

  // ✅ CALCULAR FECHA Y HORA DEL DÍA SIGUIENTE
  const getNextDayInfo = () => {
    const tomorrow = getNextDateNowDayjs();
    return {
      date: tomorrow,
      formattedDate: `${tomorrow.day}/${tomorrow.month}/${tomorrow.year}`,
    };
  };

  const nextDayInfo = getNextDayInfo();

  // ✅ MANEJAR ACEPTACIÓN DE LA ALERTA
  const handleNextDayAlertAccept = (selectedTimeSlot) => {
    const nextDayData = getNextDayInfo();
    const nextDayComment = `(Pedido programado para el día: ${nextDayData.formattedDate} - Horario de retiro: ${selectedTimeSlot})`;
    setNextDayComment(nextDayComment);

    setNextDayAlertAccepted(true);
    setShowNextDayAlert(false);
    setShowForm(true);
  };

  const handleContinue = () => {
    if (isOpenNow(clientInfo?.workingHours)) {
      if (!nextDayAlertAccepted) {
        setShowNextDayAlert(true);
      } else {
        setShowForm(true);
      }
    } else {
      showAlert(
        'EL LOCAL SE ENCUENTRA CERRADO EN ESTE MOMENTO',
        'warning',
        laNacionTheme
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
  const toMainMenuPage = '/menu/la-nacion';
  // const methodPay = ['MERCADO PAGO', 'EFECTIVO', 'TRANSFERENCIA']; // ESTOS SON LOS MÉTODOS DE PAGO
  const methodPay = ['MERCADO PAGO', 'EFECTIVO'];
  // const orderType = ['RETIRO EN LOCAL', 'DELIVERY', 'CONSUMIR EN LOCAL']; // ESTOS SON LOS TIPOS DE ENTREGA DEL PEDIDO
  const orderType = ['RETIRO EN LOCAL', 'DELIVERY'];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    getClientInfo(client_id);
  }, [client_id]);

  return (
    <ThemeProvider theme={laNacionTheme}>
      <Box
        sx={{
          pb: 4,
          width: '100%',
          minHeight: '100vh',
          position: 'relative',
          bgcolor: 'background.main',
        }}
      >
        <MainNavBar customIcon={faMugSaucer} restaurantId={client_id} />

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
              addComment={nextDayComment}
            />
          )}
        </Container>
        {/* ✅ ALERTA DE PEDIDOS PARA EL DÍA SIGUIENTE */}
        <NextDayOrderAlert
          open={showNextDayAlert}
          onAccept={handleNextDayAlertAccept}
          nextDayDate={nextDayInfo.date}
          workingHours={clientInfo?.workingHours}
          showAlert={showAlert}
        />
      </Box>
      {AlertComponent}
    </ThemeProvider>
  );
};
