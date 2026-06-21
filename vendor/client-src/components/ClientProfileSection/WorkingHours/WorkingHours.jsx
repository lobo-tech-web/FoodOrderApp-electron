// ---- MATERIAL UI ----
import { Paper, Chip } from '@mui/material';
// ---------------------

// ---- COMPONENTS ----
import { SchedulePopup } from './SchedulePopup.jsx';
// --------------------

// ---- UTILS ----
import { isOpenNow } from '@/utils/clientWorking.js';
// ---------------

export const WorkingHours = ({ clientWorkingHours }) => {
  const restaurantOpen = isOpenNow(clientWorkingHours);

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: 'background.default',
        border: 'none',
        display: 'flex',
        flexDirection: { xs: 'row', sm: 'column' },
        alignItems: { xs: 'center', sm: 'flex-end' },
        justifyContent: { xs: 'center', sm: 'flex-end' },
        gap: { xs: 1, sm: 0.5 },
        width: '100%',
      }}
    >
      {/* Estado del local (abierto/cerrado) */}
      <Chip
        label={restaurantOpen ? 'ABIERTO' : 'CERRADO'}
        size="small"
        sx={{
          bgcolor: restaurantOpen ? 'success.main' : 'error.main',
          color: '#FFF',
          fontFamily: 'fontFamily.secondary',
          fontSize: '0.7rem',
          height: '24px',
          transition: 'all 0.2s ease',
        }}
      />

      {/* Popup de horarios */}
      <SchedulePopup schedules={clientWorkingHours} />
    </Paper>
  );
};
