import { Box, Typography, Tooltip, IconButton } from '@mui/material';
// ICONS
import { Edit as EditIcon } from '@mui/icons-material';
// ---------------------

export const ClientInfoBox = ({ icon, label, value, onEdit }) => {
  return (
    <Box
      sx={{
        minHeight: { xs: 44, sm: 48 },
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: { xs: 1, sm: 1.2 },
        py: 0.8,
        minWidth: 0,
        borderRadius: '12px',
        border: '1px solid',
        borderColor: 'primary.main',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          width: {
            xs: 28,
            sm: 32,
          },
          height: {
            xs: 28,
            sm: 32,
          },
          display: 'grid',
          placeItems: 'center',
          borderRadius: '10px',
          bgcolor: 'background.main',
          color: 'text.primary',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          color: 'text.secondary',
          fontFamily: 'fontFamily.primary',
          fontSize: {
            xs: '0.75rem',
            sm: '0.82rem',
          },
          whiteSpace: 'nowrap',
        }}
      >
        {label}:
      </Typography>

      <Typography
        sx={{
          color: 'text.primary',
          fontFamily: 'fontFamily.terciary',
          fontSize: {
            xs: '0.78rem',
            sm: '1rem',
          },
          fontWeight: 900,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          minWidth: 0,
        }}
      >
        {value || '-'}
      </Typography>
      <Tooltip title={`Editar ${label}`} arrow>
        <IconButton
          size="small"
          onClick={onEdit}
          sx={{
            color: 'primary.main',
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'rgba(245, 158, 11, 0.12)',
            },
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};
