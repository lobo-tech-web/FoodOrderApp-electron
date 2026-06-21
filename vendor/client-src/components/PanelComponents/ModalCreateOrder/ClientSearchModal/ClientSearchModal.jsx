import { useState, useEffect } from 'react';

// ---- MATERIAL UI ----
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
// ICONS
import { Close as CloseIcon, Add as AddIcon } from '@mui/icons-material';
// ----------------------

// ---- SERVICES ----
// import { getAllUsersClientsService } from '@/services/users.js';
// ------------------

export const ClientSearchModal = ({ show, handleClose, restaurantId }) => {
  const [loading, setLoading] = useState(false);
  const [clientsData, setClientsData] = useState([]);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (show && restaurantId !== undefined && !fetched) {
      const fetchClients = async () => {
        setLoading(true);
        try {
          // BUSCAR POR LOS USERPOINTS
          //   const response = await getAllUsersClientsService(restaurantId);
          setClientsData([]);
          setFetched(true);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchClients();
    }
  }, [show, restaurantId, fetched]);

  if (loading)
    return (
      <Box sx={{ display: 'flex' }}>
        <CircularProgress />
      </Box>
    );
  return (
    <Dialog
      open={show}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        elevation: 3,
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: 'fontFamily.primary',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'warning.main',
          bgcolor: 'background.main',
          p: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AddIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6">LISTA DE CLIENTES</Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon color="primary" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, maxHeight: '60vh', overflow: 'auto' }}>
        <Box>
          {clientsData.length > 0 ? (
            <Box>
              <Typography>Hay clientes para mostrar!</Typography>
            </Box>
          ) : (
            <Box>
              <Typography>No hay clientes para mostrar.</Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};
