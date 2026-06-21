import { Paper, Typography } from '@mui/material';

// ---- Styles ----
import { panelSx, sectionTitleStyle } from '../styles/modalEditOrder.styles.js';
// ----------------

export const ModalSection = ({ icon, title, children, sx }) => {
  return (
    <Paper
      elevation={0}
      sx={{ ...panelSx, p: { xs: 1.2, sm: 1.5, md: 1.8 }, ...sx }}
    >
      {title && (
        <Typography sx={{ ...sectionTitleStyle, mb: 1.2 }}>
          {icon}
          {title}
        </Typography>
      )}
      {children}
    </Paper>
  );
};
