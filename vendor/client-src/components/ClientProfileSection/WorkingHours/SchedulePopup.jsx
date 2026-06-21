import { useState } from 'react';

// ---- MATERIAL UI ----
import {
  Box,
  Popover,
  Typography,
  Paper,
  Divider,
  useTheme,
  useMediaQuery,
  Button,
} from '@mui/material';
// ICONS
import AccessTimeIcon from '@mui/icons-material/AccessTime';
// ---------------------

// Componente para mostrar los horarios en un popup
export const SchedulePopup = ({ schedules = [] }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'schedule-popover' : undefined;

  // Días de la semana para mostrar en el popup
  const daysOfWeek = [
    'LUNES',
    'MARTES',
    'MIÉRCOLES',
    'JUEVES',
    'VIERNES',
    'SÁBADO',
    'DOMINGO',
  ];

  // FUNCIÓN PARA RENDERIZAR HORARIOS MÚLTIPLES
  const renderScheduleHours = (hours) => {
    if (!hours || (Array.isArray(hours) && hours.length === 0)) {
      return (
        <Typography
          sx={{
            color: 'red',
            fontFamily: 'fontFamily.secondary',
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          CERRADO
        </Typography>
      );
    }

    if (!Array.isArray(hours)) {
      return (
        <Typography
          sx={{
            color: '#000',
            fontFamily: 'fontFamily.secondary',
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          {hours}
        </Typography>
      );
    }

    const validHours = hours.filter(
      (hour) => hour && hour.trim && hour.trim() !== ''
    );

    if (validHours.length === 0) {
      return (
        <Typography
          sx={{
            color: 'red',
            fontFamily: 'fontFamily.secondary',
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          CERRADO
        </Typography>
      );
    }

    // Si hay múltiples horarios, mostrarlos en líneas separadas
    if (validHours.length > 1) {
      return (
        <Box sx={{ textAlign: 'right' }}>
          {validHours.map((hour, index) => (
            <Typography
              key={index}
              sx={{
                color: '#000',
                fontFamily: 'fontFamily.secondary',
                fontSize: { xs: '0.875rem', sm: '1rem' },
                lineHeight: 1.2,
              }}
            >
              {hour}
            </Typography>
          ))}
        </Box>
      );
    }

    // Un solo horario
    return (
      <Typography
        sx={{
          color: '#000',
          fontFamily: 'fontFamily.secondary',
          fontSize: { xs: '0.875rem', sm: '1rem' },
        }}
      >
        {validHours[0]}
      </Typography>
    );
  };

  return (
    <Box>
      <Button
        aria-describedby={id}
        onClick={handleClick}
        startIcon={<AccessTimeIcon fontSize={isMobile ? 'small' : 'medium'} />}
        variant="text"
        size={isMobile ? 'small' : 'medium'}
        sx={{
          fontFamily: 'fontFamily.secondary',
          fontSize: { xs: '0.875rem', sm: '1rem' },
          color: 'text.primary',
          textTransform: 'none',
          p: { xs: 0.5, sm: 1 },
          minWidth: 'auto',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: 'rgba(0, 0, 0, 0.04)',
          },
        }}
      >
        HORARIOS
      </Button>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          elevation: 8,
          sx: {
            borderRadius: 2,
            width: isMobile ? '280px' : '350px',
            overflow: 'hidden',
          },
        }}
      >
        <Paper sx={{ p: 0 }}>
          {/* Encabezado del popup */}
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <AccessTimeIcon />
            <Typography
              variant={isMobile ? 'subtitle2' : 'h6'}
              sx={{ fontFamily: 'fontFamily.secondary' }}
            >
              HORARIOS DE ATENCIÓN
            </Typography>
          </Box>

          <Divider />

          {/* Contenido del popup */}
          <Box
            sx={{
              bgcolor: 'white',
              borderColor: 'primary.main',
              border: 2,
              maxHeight: '350px',
              overflowY: 'auto',
              p: 2,
            }}
          >
            {schedules ? (
              daysOfWeek.map((day, index) => {
                const daySchedule = schedules[day];

                return (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      py: 1.5,
                      borderBottom:
                        index < daysOfWeek.length - 1
                          ? '1px solid rgba(0, 0, 0, 0.12)'
                          : 'none',
                      minHeight: '40px',
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: 'fontFamily.secondary',
                        color: '#000',
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        flex: '0 0 auto',
                        marginRight: 2,
                      }}
                    >
                      {day}
                    </Typography>

                    <Box sx={{ flex: '1 1 auto', textAlign: 'right' }}>
                      {renderScheduleHours(daySchedule)}
                    </Box>
                  </Box>
                );
              })
            ) : (
              <Typography
                sx={{
                  fontFamily: 'fontFamily.secondary',
                  textAlign: 'center',
                  color: '#000',
                  py: 2,
                }}
              >
                No hay horarios disponibles
              </Typography>
            )}
          </Box>
        </Paper>
      </Popover>
    </Box>
  );
};
