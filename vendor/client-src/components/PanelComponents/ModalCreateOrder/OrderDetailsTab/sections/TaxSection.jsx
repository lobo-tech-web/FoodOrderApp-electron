import {
  Box,
  TextField,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Typography,
} from '@mui/material';
//   ICONS
import {
  Add as AddIcon,
  CardGiftcard as CardGiftcardIcon,
} from '@mui/icons-material';

// ---- SHARED ----
import { FieldLabel } from '../../shared/FieldLabel.jsx';
// ----------------

// ---- UTILS ----
import { formatCurrency } from '@/utils/orderCalculations.js';
import { taxAmount } from '@/utils/lobotechUtils.js';
// ---------------

// ---- STYLES ----
import { fieldStyles } from '../../styles/modalCreateOrder.styles.js';
// ----------------

export const TaxSection = ({ addServiceTax, setAddServiceTax }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        minHeight: '56px',
      }}
    >
      <FormControlLabel
        control={
          <Checkbox
            checked={addServiceTax}
            onChange={(e) => setAddServiceTax(e.target.checked)}
            sx={{
              color: 'text.secondary',
              '&.Mui-checked': { color: 'primary.main' },
            }}
          />
        }
        label={
          <Typography
            sx={{
              fontFamily: 'fontFamily.primary',
              color: 'text.primary',
              fontSize: { xs: '13px', sm: '15px' },
            }}
          >
            AGREGAR TARIFA DE SERVICIOS&nbsp;
            <Box component="span" sx={{ color: 'primary.main' }}>
              {formatCurrency(taxAmount)}
            </Box>
          </Typography>
        }
      />
    </Box>
  );
};
