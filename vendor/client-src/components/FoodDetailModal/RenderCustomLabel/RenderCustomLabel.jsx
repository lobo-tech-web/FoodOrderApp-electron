// ---- MATERIAL UI ----
import { Chip, useMediaQuery, useTheme } from '@mui/material';
// ---------------------

// ---- FONT AWESOME ----
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWheatAwn, faSeedling } from '@fortawesome/free-solid-svg-icons';
// ----------------------

export const RenderCustomLabels = ({ isActive, isVeggie }) => {
  const themeMobile = useTheme();
  const isMobile = useMediaQuery(themeMobile.breakpoints.down('sm'));

  if (!isActive) return null;
  return (
    <Chip
      icon={<FontAwesomeIcon icon={isVeggie ? faSeedling : faWheatAwn} />}
      label={isVeggie ? 'Vegetariano' : 'Sin TACC'}
      variant="outlined"
      size={isMobile ? 'small' : 'medium'}
      sx={{
        fontFamily: 'fontFamily.secondary',
        color: isVeggie ? '#4caf50' : '#ffc107',
        borderColor: isVeggie ? '#4caf50' : '#ffc107',
        ml: 1,
        '& .MuiChip-icon': {
          color: isVeggie ? '#4caf50' : '#ffc107',
        },
        '& .MuiChip-label': {
          fontSize: isMobile ? '0.7rem' : '0.8rem',
        },
      }}
    />
  );
};
