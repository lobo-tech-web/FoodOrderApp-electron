// ---- MATERIAL UI ----
import { Box, Typography, IconButton, Tooltip, Chip } from '@mui/material';
// ICONS
import { Pause, PlayArrow } from '@mui/icons-material';
// ---------------------

export const AutoRefreshIndicator = ({
  isEnabled,
  onToggle,
  lastRefresh,
  isRefreshing = false,
  countdown,
}) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatLastRefresh = (date) => {
    if (!date) return 'Nunca';
    return date;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 3,
        border: 1,
        borderColor: isEnabled ? 'primary.main' : 'divider',
        boxShadow: isEnabled ? 3 : 1,
        transition: 'all 0.3s ease',
      }}
    >
      <Tooltip
        title={
          isEnabled ? 'Pausar auto-actualización' : 'Activar auto-actualización'
        }
      >
        <IconButton
          size="small"
          onClick={onToggle}
          sx={{
            color: isEnabled ? 'text.terciary' : 'text.secondary',
            bgcolor: isEnabled ? 'primary.main' : 'background.default',
          }}
        >
          {isEnabled ? <Pause /> : <PlayArrow />}
        </IconButton>
      </Tooltip>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minWidth: 120,
        }}
      >
        <Typography
          variant="caption"
          sx={{ fontFamily: 'fontFamily.secondary', color: 'text.secondary' }}
        >
          Auto-actualización
        </Typography>
        <Chip
          size="small"
          label={
            isEnabled
              ? isRefreshing
                ? 'Actualizando...'
                : `Próxima: ${formatTime(countdown || 0)}`
              : 'Pausada'
          }
          color={isEnabled ? 'success' : 'default'}
          variant={isEnabled ? 'filled' : 'outlined'}
          sx={{
            fontFamily: 'fontFamily.terciary',
            fontSize: '0.8rem',
            minWidth: 120,
          }}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minWidth: 120,
        }}
      >
        <Typography
          variant="caption"
          sx={{ fontFamily: 'fontFamily.secondary', color: 'text.secondary' }}
        >
          Última actualización
        </Typography>
        <Typography
          variant="caption"
          sx={{ fontFamily: 'fontFamily.secondary', color: 'text.primary' }}
        >
          {formatLastRefresh(lastRefresh)}
        </Typography>
      </Box>
    </Box>
  );
};
