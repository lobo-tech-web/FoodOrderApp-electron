// ---- MATERIAL UI ----
import {
  Typography,
  Divider,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Box,
  Paper,
} from '@mui/material';
// ---------------------

// ---- STYLES ----
const mainLabelStyle = {
  fontFamily: 'fontFamily.primary',
  color: 'primary.main',
  mb: 1,
  display: 'flex',
  alignItems: 'center',
  gap: 1,
};

const inputStyles = {
  '& .MuiInputBase-root': {
    fontFamily: 'fontFamily.primary',
    color: 'text.primary',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: { xs: '8px', sm: '12px' },
    fontSize: { xs: '14px', sm: '16px', md: '16px' },
    minHeight: { xs: '48px', sm: '56px', md: '56px' },
    transition: 'all 0.3s ease',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(184, 182, 186, 0.3)',
      borderWidth: '1px',
      transition: 'all 0.3s ease',
    },
    '&:hover fieldset': {
      borderColor: 'primary.main',
      borderWidth: '1px',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main',
      borderWidth: '2px',
      boxShadow: '0 0 0 3px rgba(245, 166, 35, 0.2)',
    },
    '&.Mui-error fieldset': {
      borderColor: 'error.main',
      borderWidth: '1px',
    },
    '&.Mui-error:hover fieldset': {
      borderColor: 'error.main',
      borderWidth: '2px',
    },
  },
  width: '100%',
  marginBottom: { xs: '8px', sm: '12px', md: '12px' },
};
// ----------------

export const PriceConfigSection = ({
  incrementDecrement,
  setIncrementDecrement,
  around,
  setAround,
  porcentage,
  setPorcentage,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderRadius: { xs: '8px', sm: '12px' },
        border: '1px solid rgba(184, 182, 186, 0.1)',
        borderColor: 'divider',
        mb: { xs: 2, sm: 3 },
        mt: { xs: 1, sm: 1.5 },
        p: { xs: 2, sm: 3, md: 4 },
      }}
    >
      {/* AUMENTAR / DISMINUIR PRECIOS */}
      <Typography
        component="label"
        htmlFor="increment-decrement-select"
        sx={mainLabelStyle}
      >
        AUMENTAR / DISMINUIR PRECIOS
      </Typography>

      <Divider sx={{ bgcolor: 'primary.main', mb: 1 }} />

      <Box>
        <FormControl required fullWidth sx={inputStyles}>
          <Select
            value={incrementDecrement}
            onChange={(e) => setIncrementDecrement(e.target.value)}
            displayEmpty
            renderValue={(selected) => {
              if (!selected) {
                return (
                  <Typography sx={{ color: 'text.disabled' }}>
                    Selecciona aumentar/disminuir
                  </Typography>
                );
              }
              return selected;
            }}
          >
            {['AUMENTAR', 'DISMINUIR'].map((option) => (
              <MenuItem
                key={option}
                value={option}
                sx={{
                  fontFamily: 'fontFamily.terciary',
                  color: 'text.primary',
                }}
              >
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* REDONDEAR PRECIO */}
      <Typography
        component="label"
        htmlFor="increment-decrement-select"
        sx={mainLabelStyle}
      >
        REDONDEAR PRECIOS
      </Typography>

      <Divider sx={{ bgcolor: 'primary.main', mb: 1 }} />

      <Box>
        <FormControl required fullWidth sx={inputStyles}>
          <Select
            value={around}
            onChange={(e) => setAround(e.target.value)}
            displayEmpty
            renderValue={(selected) => {
              if (!selected) {
                return (
                  <Typography sx={{ color: 'text.disabled' }}>
                    Selecciona redondeo
                  </Typography>
                );
              }
              return selected;
            }}
          >
            {['NO REDONDEAR', 'REDONDEAR EN 100', 'REDONDEAR EN 50'].map(
              (option) => (
                <MenuItem
                  key={option}
                  value={option}
                  sx={{
                    fontFamily: 'fontFamily.terciary',
                    color: 'text.primary',
                  }}
                >
                  {option}
                </MenuItem>
              )
            )}
          </Select>
        </FormControl>
      </Box>

      {/* INPUT DEL % A AUMENTAR/DISMINUIR */}
      <Typography
        component="label"
        htmlFor="product-options-select"
        sx={mainLabelStyle}
      >
        VALOR EN %
      </Typography>

      <Divider sx={{ bgcolor: 'primary.main', mb: 1 }} />

      <TextField
        required
        fullWidth
        type="number"
        value={porcentage}
        onChange={(e) => {
          const value = Math.min(100, Math.max(0, Number(e.target.value) || 0));
          setPorcentage(value);
        }}
        sx={inputStyles}
      />
    </Paper>
  );
};
