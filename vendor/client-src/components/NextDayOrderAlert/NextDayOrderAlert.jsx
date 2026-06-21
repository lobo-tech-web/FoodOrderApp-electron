import { useState, useMemo, useEffect, useRef } from 'react';
// ---- MATERIAL UI ----
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Divider,
  Alert,
  AlertTitle,
  FormControl,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
// ICONS
import {
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
// ---------------------

// ---- STYLES ----
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
// ----------------

export const NextDayOrderAlert = ({
  open,
  handleClose,
  onAccept,
  nextDayDate,
  workingHours,
  orderTypes = [],
  deliveryOrderType = 'DELIVERY',
  showAlert,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [understood, setUnderstood] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const dialogContentRef = useRef(null);
  const timeSlotSectionRef = useRef(null);

  const [selectedOrderType, setSelectedOrderType] = useState('');
  const isDeliveryOrder = selectedOrderType === deliveryOrderType;

  const handleAccept = () => {
    if (!selectedOrderType) {
      showAlert?.('Seleccioná el tipo de entrega para continuar', 'warning');
      return;
    }

    // Si NO es delivery, no necesita seleccionar horario
    if (!isDeliveryOrder) {
      onAccept({
        orderType: selectedOrderType,
        selectedTimeSlot: null,
        isNextDayDelivery: false,
      });
      return;
    }

    // Si es delivery, primero debe leer la información
    if (!understood) {
      setUnderstood(true);
      return;
    }

    // Si es delivery, debe seleccionar horario
    if (!selectedTimeSlot) {
      showAlert?.('Seleccioná un horario de entrega para continuar', 'warning');
      return;
    }

    onAccept({
      orderType: selectedOrderType,
      selectedTimeSlot,
      isNextDayDelivery: true,
    });
  };

  const nextDayKey = useMemo(() => {
    if (!nextDayDate?.dayName) return '';

    return nextDayDate.dayName.toUpperCase();
  }, [nextDayDate?.dayName]);

  const timeSlots = useMemo(() => {
    if (!workingHours || !nextDayKey) return [];

    try {
      const dayHours = workingHours[nextDayKey];

      if (!Array.isArray(dayHours) || dayHours.length === 0) {
        return [];
      }

      const allSlots = [];

      dayHours.forEach((timeRange) => {
        const [startTime, endTime] = String(timeRange).split('-');

        if (!startTime || !endTime) return;

        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        if (
          !Number.isFinite(startHour) ||
          !Number.isFinite(startMinute) ||
          !Number.isFinite(endHour) ||
          !Number.isFinite(endMinute)
        ) {
          return;
        }

        let currentHour = startHour;
        let currentMinute = startMinute;

        while (
          currentHour < endHour ||
          (currentHour === endHour && currentMinute < endMinute)
        ) {
          const slotStartHour = currentHour;
          const slotStartMinute = currentMinute;

          let slotEndHour = currentHour;
          let slotEndMinute = currentMinute + 30;

          if (slotEndMinute >= 60) {
            slotEndHour += 1;
            slotEndMinute -= 60;
          }

          const isValidSlot =
            slotEndHour < endHour ||
            (slotEndHour === endHour && slotEndMinute <= endMinute);

          if (isValidSlot) {
            const startTimeStr = `${slotStartHour
              .toString()
              .padStart(2, '0')}:${slotStartMinute
              .toString()
              .padStart(2, '0')}`;

            const endTimeStr = `${slotEndHour
              .toString()
              .padStart(2, '0')}:${slotEndMinute.toString().padStart(2, '0')}`;

            allSlots.push(`${startTimeStr} - ${endTimeStr}`);
          }

          currentHour = slotEndHour;
          currentMinute = slotEndMinute;
        }
      });

      return allSlots;
    } catch (error) {
      console.error('Error parsing working hours:', error);
      return [];
    }
  }, [workingHours, nextDayKey]);

  useEffect(() => {
    if (!open) return;
    if (!isDeliveryOrder) return;
    if (!understood) return;
    if (!nextDayKey) return;
    if (timeSlots.length > 0) return;

    showAlert?.(
      `No hay horarios disponibles para el día: ${nextDayKey}`,
      'error'
    );
  }, [
    open,
    isDeliveryOrder,
    understood,
    nextDayKey,
    timeSlots.length,
    showAlert,
  ]);

  useEffect(() => {
    if (!open) return;
    if (!isDeliveryOrder) return;
    if (!understood) return;
    if (timeSlots.length === 0) return;

    const timeoutId = setTimeout(() => {
      const contentElement = dialogContentRef.current;
      const targetElement = timeSlotSectionRef.current;

      if (!contentElement || !targetElement) return;

      const contentRect = contentElement.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();

      const scrollTop =
        contentElement.scrollTop + (targetRect.top - contentRect.top) - 16;

      contentElement.scrollTo({
        top: Math.max(scrollTop, 0),
        behavior: 'smooth',
      });
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [open, isDeliveryOrder, understood, timeSlots.length]);

  useEffect(() => {
    if (open) {
      setUnderstood(false);
      setSelectedTimeSlot('');
      setSelectedOrderType('');
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderColor: 'primary.main',
          border: '2px solid',
          borderRadius: 4,
          overflow: 'hidden',
          bgcolor: 'background.main',
          mx: isMobile ? 1 : 2,
          my: isMobile ? 1 : 2,
          maxHeight: isMobile ? '95vh' : 'auto',
        },
      }}
      // No permitir cerrar clickeando fuera
      disableEscapeKeyDown
    >
      {/* Header con gradiente */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'text.secondary',
          p: isMobile ? 2 : 3,
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isMobile ? 1 : 2,
            mb: 1,
          }}
        >
          <ScheduleIcon sx={{ fontSize: isMobile ? '2rem' : '2.5rem' }} />
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            sx={{
              fontFamily: 'fontFamily.primary',
              fontWeight: 'bold',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            ¡ATENCIÓN!
          </Typography>
        </Box>
        <Typography
          variant={isMobile ? 'body1' : 'h6'}
          sx={{
            fontFamily: 'fontFamily.secondary',
            opacity: 0.95,
            fontWeight: '500',
          }}
        >
          Información importante sobre tu pedido
        </Typography>
      </Box>

      <DialogContent ref={dialogContentRef} sx={{ p: 0 }}>
        <Box sx={{ p: isMobile ? 2 : 4 }}>
          <Paper
            elevation={2}
            sx={{
              p: isMobile ? 2 : 3,
              bgcolor: 'background.default',
              borderColor: 'primary.main',
              border: '2px solid',
              borderRadius: 3,
              mb: 3,
            }}
          >
            <Typography
              sx={{
                fontFamily: 'fontFamily.primary',
                color: 'text.terciary',
                fontWeight: 'bold',
                mb: 1,
                fontSize: isMobile ? '1rem' : '1.1rem',
              }}
            >
              ¿Cómo querés recibir tu pedido?
            </Typography>

            <Typography
              sx={{
                fontFamily: 'fontFamily.secondary',
                color: 'text.terciary',
                mb: 2,
                fontSize: isMobile ? '0.85rem' : '0.95rem',
              }}
            >
              Seleccioná el tipo de entrega para continuar.
            </Typography>

            <FormControl fullWidth sx={selectStyle}>
              <Select
                value={selectedOrderType}
                onChange={(e) => {
                  setSelectedOrderType(e.target.value);
                  setUnderstood(false);
                  setSelectedTimeSlot('');
                }}
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
                        Seleccioná una opción
                      </Box>
                    );
                  }

                  return selected;
                }}
              >
                {orderTypes.map((type) => (
                  <MenuItem
                    key={type}
                    value={type}
                    sx={{
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
                    }}
                  >
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
          {/* Alerta principal */}
          {isDeliveryOrder && (
            <Alert
              severity="warning"
              icon={<CalendarIcon />}
              sx={{
                bgcolor: 'background.default',
                color: 'text.terciary',
                mb: 3,
                borderColor: 'primary.main',
                border: '2px solid',
                borderRadius: 3,
                fontSize: isMobile ? '1rem' : '1.1rem',
                '& .MuiAlert-message': {
                  width: '100%',
                },
              }}
            >
              <AlertTitle
                sx={{
                  fontFamily: 'fontFamily.primary',
                  fontWeight: 'bold',
                  fontSize: isMobile ? '1.1rem' : '1.3rem',
                  color: 'text.terciary',
                }}
              >
                Entrega del pedido{' '}
                {`${nextDayDate.day}/${nextDayDate.month}/${nextDayDate.year}`}
              </AlertTitle>
              <Typography
                sx={{
                  fontFamily: 'fontFamily.secondary',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  mt: 1,
                }}
              >
                Todos los pedidos realizados en este momento serán preparados y
                entregados el{' '}
                <strong>{`${nextDayDate.day}/${nextDayDate.month}/${nextDayDate.year}`}</strong>
                .
              </Typography>
            </Alert>
          )}

          {/* Información detallada */}
          {isDeliveryOrder && (
            <Paper
              elevation={2}
              sx={{
                p: isMobile ? 2 : 3,
                bgcolor: 'background.default',
                borderColor: 'primary.main',
                border: '2px solid',
                borderRadius: 3,
              }}
            >
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}
              >
                <InfoIcon sx={{ color: 'primary.main', fontSize: '1.5rem' }} />
                <Typography
                  variant={isMobile ? 'body1' : 'h6'}
                  sx={{
                    fontFamily: 'fontFamily.primary',
                    fontWeight: 'bold',
                    color: 'text.terciary',
                  }}
                >
                  Importante:
                </Typography>
              </Box>

              <Box sx={{ ml: isMobile ? 2 : 4 }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'fontFamily.secondary',
                    color: 'text.terciary',
                    mb: 2,
                    lineHeight: 1.6,
                    fontSize: isMobile ? '0.9rem' : '1rem',
                  }}
                >
                  • <strong>Fecha de entrega:</strong>{' '}
                  {nextDayDate.dayName.toUpperCase()}
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'fontFamily.secondary',
                    color: 'text.terciary',
                    mb: 2,
                    lineHeight: 1.6,
                    fontSize: isMobile ? '0.9rem' : '1rem',
                  }}
                >
                  • Selecciona tu horario preferido para la entrega del pedido.
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'fontFamily.secondary',
                    color: 'text.terciary',
                    mb: 2,
                    lineHeight: 1.6,
                    fontSize: isMobile ? '0.9rem' : '1rem',
                  }}
                >
                  • Si tu pedido es por delivery, el costo de envío NO está
                  incluido.
                </Typography>
              </Box>
            </Paper>
          )}

          {selectedOrderType && !isDeliveryOrder && (
            <Paper
              elevation={2}
              sx={{
                p: isMobile ? 2 : 3,
                bgcolor: 'background.default',
                borderColor: 'primary.main',
                border: '2px solid',
                borderRadius: 3,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircleIcon sx={{ color: 'success.main' }} />
                <Typography
                  sx={{
                    fontFamily: 'fontFamily.secondary',
                    color: 'text.terciary',
                    fontWeight: 'bold',
                  }}
                >
                  Perfecto. Continuarás con: {selectedOrderType}
                </Typography>
              </Box>
            </Paper>
          )}

          {isDeliveryOrder && understood && timeSlots.length > 0 && (
            <Box ref={timeSlotSectionRef}>
              <Divider sx={{ my: 3 }} />

              {/* Confirmación de entendimiento */}
              <Paper
                elevation={2}
                sx={{
                  p: isMobile ? 2 : 3,
                  bgcolor: 'background.default',
                  borderColor: 'primary.main',
                  border: '2px solid',
                  borderRadius: 3,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <AccessTimeIcon
                    sx={{ color: 'primary.main', fontSize: '1.5rem' }}
                  />
                  <Typography
                    variant={isMobile ? 'body1' : 'h6'}
                    sx={{
                      fontFamily: 'fontFamily.primary',
                      fontWeight: 'bold',
                      color: 'text.terciary',
                    }}
                  >
                    Selecciona tu horario de entrega:
                  </Typography>
                </Box>

                <Box sx={{ width: '100%' }}>
                  <Typography sx={labelStyle}>HORARIO DE ENTREGA</Typography>
                  <FormControl
                    fullWidth
                    sx={{
                      mt: 2,
                      ...selectStyle,
                    }}
                  >
                    <Select
                      value={selectedTimeSlot}
                      onChange={(e) => setSelectedTimeSlot(e.target.value)}
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
                              Selecciona un horario de entrega
                            </Box>
                          );
                        }
                        return selected;
                      }}
                    >
                      {timeSlots.map((slot, index) => (
                        <MenuItem
                          key={index}
                          value={slot}
                          sx={{
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
                          }}
                        >
                          {slot}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Paper>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Confirmación de entendimiento */}
          <Box
            sx={{
              textAlign: 'center',
              p: 2,
              bgcolor: 'background.default',
              borderColor: 'primary.main',
              border: '2px solid',
              borderRadius: 3,
              transition: 'all 0.3s ease',
            }}
          >
            {!selectedOrderType ? (
              <Typography
                variant="body1"
                sx={{
                  fontFamily: 'fontFamily.secondary',
                  color: 'text.terciary',
                  fontStyle: 'italic',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                }}
              >
                Seleccioná cómo querés recibir tu pedido para continuar
              </Typography>
            ) : !isDeliveryOrder ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  flexDirection: isMobile ? 'column' : 'row',
                }}
              >
                <CheckCircleIcon sx={{ color: 'success.main' }} />
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'fontFamily.secondary',
                    color: 'success.main',
                    fontWeight: 'bold',
                    fontSize: isMobile ? '0.9rem' : '1rem',
                    textAlign: 'center',
                  }}
                >
                  Continuarás con: {selectedOrderType}
                </Typography>
              </Box>
            ) : understood && selectedTimeSlot ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  flexDirection: isMobile ? 'column' : 'row', // Stack on mobile
                }}
              >
                <CheckCircleIcon sx={{ color: 'success.main' }} />
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'fontFamily.secondary',
                    color: 'success.main',
                    fontWeight: 'bold',
                    fontSize: isMobile ? '0.9rem' : '1rem', // Responsive font size
                    textAlign: 'center',
                  }}
                >
                  ¡Perfecto! Horario seleccionado: {selectedTimeSlot}
                </Typography>
              </Box>
            ) : understood ? (
              <Typography
                variant="body1"
                sx={{
                  fontFamily: 'fontFamily.secondary',
                  color: 'text.terciary',
                  fontStyle: 'italic',
                  fontSize: isMobile ? '0.9rem' : '1rem', // Responsive font size
                }}
              >
                Por favor, selecciona un horario de entrega para continuar
              </Typography>
            ) : (
              <Typography
                variant="body1"
                sx={{
                  fontFamily: 'fontFamily.secondary',
                  color: 'text.terciary',
                  fontStyle: 'italic',
                  fontSize: isMobile ? '0.9rem' : '1rem', // Responsive font size
                }}
              >
                Haz clic en &quot;Entendido&quot; para confirmar que has leído
                la información
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: isMobile ? 2 : 3,
          justifyContent: 'center',
        }}
      >
        <Button
          onClick={handleClose}
          variant="outlined"
          size={isMobile ? 'medium' : 'large'}
          sx={{ fontFamily: 'fontFamily.terciary' }}
        >
          Volver
        </Button>
        <Button
          onClick={handleAccept}
          variant="contained"
          size={isMobile ? 'medium' : 'large'}
          color="primary"
          disabled={
            !selectedOrderType ||
            (isDeliveryOrder && understood && !selectedTimeSlot)
          }
          sx={{
            fontFamily: 'fontFamily.terciary',
            fontWeight: 'bold',
            fontSize: isMobile ? '1rem' : '1.1rem',
            px: isMobile ? 4 : 6,
            py: 1.5,
            borderRadius: 3,
            bgcolor: 'primary.main',
            color: 'text.secondary',
            minWidth: isMobile ? 150 : 200,
            '&:hover': {
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          {!selectedOrderType
            ? 'SELECCIONÁ ENTREGA'
            : !isDeliveryOrder
              ? 'CONTINUAR'
              : understood && selectedTimeSlot
                ? 'CONTINUAR CON EL PEDIDO'
                : 'ENTENDIDO'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
