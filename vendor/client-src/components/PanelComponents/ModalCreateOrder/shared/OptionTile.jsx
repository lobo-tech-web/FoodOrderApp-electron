import { Button, Box } from '@mui/material';
import { optionButtonStyle } from '../styles/modalCreateOrder.styles.js';

export const OptionTile = ({ active, icon, label, onClick }) => (
  <Button variant="outlined" onClick={onClick} sx={optionButtonStyle(active)}>
    <Box
      sx={{
        color: active ? 'primary.main' : 'text.secondary',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {icon}
    </Box>
    <Box component="span">{label}</Box>
  </Button>
);
