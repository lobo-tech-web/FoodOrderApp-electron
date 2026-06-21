import React from 'react';
import { useEffect, useState } from 'react';

// ---- MATERIAL UI ----
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
} from '@mui/material';
// ---------------------

// ---- SERVICES ----
import { updateUserAdminPasswordService } from '@/services/users.js';
// ------------------

// ---- COMPONENTS ----
import { LoadingComponent } from '@/components/LoadingComponent/LoadingComponent.jsx';
// --------------------

// ---- HOOKS ----
import { useAlert } from '@/hooks/Alert.jsx';
// ---------------

export const RestoreUserPassword = ({ show, handleClose, showUser }) => {
  // ALERT
  const { AlertComponent, showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    id: '',
    cuit: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserAdminPasswordService(user);
      showAlert('Contraseña del usuario restaurado correctamente!', 'success');
      handleClose();
    } catch (error) {
      const errorMessage = error || 'Error desconocido';
      showAlert(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show && showUser) {
      setUser((prev) => ({
        ...prev,
        id: showUser.id,
        cuit: showUser.cuit,
        password: showUser.cuit,
      }));
    }
  }, [show, showUser]);

  if (loading) return <LoadingComponent />;

  return (
    <>
      <Dialog open={show} onClose={handleClose}>
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'center',
            fontFamily: 'fontFamily.primary',
            color: 'text.secondary',
            borderBottom: 5,
            borderRadius: 10,
            marginBottom: '1rem',
          }}
        >
          RESTAURAR CONTRASEÑA
        </DialogTitle>

        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            {/* CAMPOS DE SÓLO LECTURA */}
            {[
              { label: 'USER ID', name: 'id' },
              { label: 'CUIT/CUIL/DNI', name: 'cuit' },
            ].map((field) => (
              <TextField
                key={field.name}
                disabled
                margin="normal"
                fullWidth
                {...field}
                value={user[field.name]}
                sx={{
                  fontFamily: 'fontFamily.terciary',
                  marginTop: 1,
                  marginBottom: 2,
                }}
              />
            ))}
            {showUser?.email && (
              <TextField
                disabled
                margin="normal"
                fullWidth
                label={'EMAIL'}
                value={showUser.email}
                sx={{
                  fontFamily: 'fontFamily.terciary',
                  marginTop: 1,
                  marginBottom: 2,
                }}
              />
            )}
            {showUser?.name && (
              <TextField
                disabled
                margin="normal"
                fullWidth
                label={'NOMBRE COMPLETO'}
                value={showUser.name}
                sx={{
                  fontFamily: 'fontFamily.terciary',
                  marginTop: 1,
                  marginBottom: 2,
                }}
              />
            )}
            <Typography
              component="label"
              htmlFor="increment-decrement-select"
              sx={{
                fontFamily: 'fontFamily.primary',
                color: 'text.primary',
                bgcolor: 'background.default',
                mb: 1,
                display: 'block',
                textAlign: 'center',
              }}
            >
              REESTABLECER CONTRASEÑA
            </Typography>
            <TextField
              label="PASSWORD"
              name="password"
              margin="normal"
              type="text"
              fullWidth
              value={user.password}
              onChange={(e) =>
                setUser((prev) => ({ ...prev, password: e.target.value }))
              }
              sx={{
                fontFamily: 'fontFamily.terciary',
                marginTop: 1,
                marginBottom: 2,
                '& .MuiInputBase-root': {
                  color: 'text.secondary',
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            color="error"
            sx={{ fontFamily: 'fontFamily.primary' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            sx={{ fontFamily: 'fontFamily.primary' }}
          >
            Restaurar Contraseña
          </Button>
        </DialogActions>
      </Dialog>
      {AlertComponent}
    </>
  );
};
