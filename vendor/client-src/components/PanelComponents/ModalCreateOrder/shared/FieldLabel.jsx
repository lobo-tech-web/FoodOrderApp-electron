import { Box, Typography } from '@mui/material';

// ---- STYLES ----
import {
  labelContainerStyle,
  labelStyle,
} from '../styles/modalCreateOrder.styles.js';
// ----------------

export const FieldLabel = ({ children, icon }) => (
  <Box sx={labelContainerStyle}>
    {icon && (
      <Box
        sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}
      >
        {icon}
      </Box>
    )}
    <Typography sx={labelStyle}>{children}</Typography>
  </Box>
);
