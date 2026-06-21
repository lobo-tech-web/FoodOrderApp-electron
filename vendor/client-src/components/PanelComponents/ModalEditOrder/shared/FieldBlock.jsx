import { Box, Typography } from '@mui/material';

// ---- Styles ----
import { labelStyle } from '../styles/modalEditOrder.styles.js';
// ----------------

export const FieldBlock = ({ label, children }) => {
  return (
    <Box>
      <Typography sx={labelStyle}>{label}</Typography>
      {children}
    </Box>
  );
};
