// ---- MATERIAL UI ----
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Box,
  Typography,
} from '@mui/material';
// ICONS
import {
  Print as PrintIcon,
  Restaurant as RestaurantIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
// ---------------------

export const DialogChangeStatus = ({
  isTicket,
  loading,
  showStatusConfirmDialog,
  setShowStatusConfirmDialog,
  handleStatusChangeConfirmation,
}) => {
  return (
    <Dialog
      open={showStatusConfirmDialog}
      onClose={() => setShowStatusConfirmDialog(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: '2px solid',
          borderColor: 'primary.main',
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: 'background.main',
          color: 'text.primary',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          fontFamily: 'fontFamily.primary',
          fontWeight: 'bold',
        }}
      >
        {isTicket ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <PrintIcon color="primary" size="small" />
            <Typography variant="subtitle1">IMPRIMIR TICKET</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <RestaurantIcon color="primary" />
            <Typography variant="subtitle1">
              IMPRIMIR COMANDA DE COCINA
            </Typography>
          </Box>
        )}
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <DialogContentText
          sx={{
            fontFamily: 'fontFamily.secondary',
            color: 'text.primary',
            fontSize: '1rem',
            lineHeight: 1.6,
            mb: 2,
            mt: 2,
          }}
        >
          {isTicket ? (
            <Typography>
              ¿Deseas cambiar el estado del pedido a "EN ENVIO" antes de
              imprimir el ticket?
            </Typography>
          ) : (
            <Typography>
              ¿Deseas cambiar el estado del pedido a "EN PREPARACIÓN" antes de
              imprimir la comanda de cocina?
            </Typography>
          )}
        </DialogContentText>

        <Box
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'primary.main',
          }}
        >
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'fontFamily.terciary',
              color: 'primary.main',
              mb: 1,
            }}
          >
            RECOMENDACIÓN
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'fontFamily.secondary',
              color: 'text.primary',
            }}
          >
            Cambiar el estado ayuda a mantener un mejor control del flujo de los
            pedidos.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          onClick={() => handleStatusChangeConfirmation(false)}
          variant="contained"
          size="medium"
          startIcon={isTicket ? <PrintIcon /> : <RestaurantIcon />}
          disabled={loading}
          sx={{
            fontFamily: 'fontFamily.terciary',
            borderRadius: 2,
            borderColor: 'primary.main',
            minWidth: 120,
            bgcolor: 'primary.main',
            color: 'text.terciary',
          }}
        >
          No, solo imprimir
        </Button>

        <Button
          onClick={() => handleStatusChangeConfirmation(true)}
          variant="contained"
          size="medium"
          startIcon={<CheckCircleIcon />}
          disabled={loading}
          sx={{
            fontFamily: 'fontFamily.terciary',
            borderRadius: 2,
            borderColor: 'primary.main',
            minWidth: 120,
            bgcolor: 'success.main',
            color: 'text.primary',
          }}
        >
          Sí, cambiar estado e imprimir
        </Button>
      </DialogActions>
    </Dialog>
  );
};
