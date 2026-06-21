'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

export const CatalogModal = ({ open, onClose, onGenerate, defaultName }) => {
  const [restaurantName, setRestaurantName] = useState(defaultName || '');

  const handleGenerate = () => {
    if (restaurantName.trim()) {
      onGenerate(restaurantName.trim());
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          fontFamily: 'fontFamily.primary',
          color: 'text.primary',
          bgcolor: 'background.paper',
        }}
      >
        GENERAR CATÁLOGO PDF
      </DialogTitle>

      <DialogContent sx={{ bgcolor: 'background.default', pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'fontFamily.secondary',
              color: 'text.primary',
            }}
          >
            Ingresa el nombre del restaurante para el catálogo:
          </Typography>

          <TextField
            autoFocus
            fullWidth
            label="Nombre del Restaurante"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            placeholder="Ej: Toro Burger & Beer"
            sx={{
              '& .MuiInputBase-input': {
                fontFamily: 'fontFamily.secondary',
                color: 'text.primary',
              },
              '& .MuiInputLabel-root': {
                fontFamily: 'fontFamily.secondary',
                color: 'text.primary',
              },
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ bgcolor: 'background.paper', p: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            fontFamily: 'fontFamily.secondary',
            color: 'text.primary',
          }}
        >
          CANCELAR
        </Button>
        <Button
          variant="contained"
          startIcon={<PictureAsPdfIcon />}
          onClick={handleGenerate}
          disabled={!restaurantName.trim()}
          sx={{
            bgcolor: 'error.main',
            color: 'white',
            fontFamily: 'fontFamily.primary',
            '&:hover': {
              bgcolor: 'error.dark',
            },
          }}
        >
          GENERAR PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
};
