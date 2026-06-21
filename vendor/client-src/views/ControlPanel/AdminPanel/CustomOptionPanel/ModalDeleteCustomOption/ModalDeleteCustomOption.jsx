// ---- Material UI ----
import {
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
// Icons
import {
  Delete as DeleteIcon,
  WarningAmber as WarningIcon,
} from '@mui/icons-material';
// ---------------------

export const ModalDeleteCustomOption = ({
  open,
  option,
  relatedProductsCount = 0,
  loading = false,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={loading}
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: '2px solid',
          borderColor: 'error.main',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontFamily: 'fontFamily.primary',
          color: 'primary.main',
          fontWeight: 900,
        }}
      >
        <WarningIcon color="primary" />
        Confirmar eliminación
      </DialogTitle>

      <DialogContent>
        <Alert
          severity="warning"
          sx={{
            mb: 2,
            borderRadius: 2,
            fontFamily: 'fontFamily.secondary',
          }}
        >
          <AlertTitle sx={{ fontFamily: 'fontFamily.primary' }}>
            ESTÁS POR ELIMINAR LA PERSONALIZACIÓN:{' '}
          </AlertTitle>
          <strong>{option?.name || '-'}</strong>.
        </Alert>

        <Typography
          sx={{
            fontFamily: 'fontFamily.secondary',
            color: 'text.primary',
            mb: 1,
          }}
        >
          Esta personalización tiene <strong>{relatedProductsCount}</strong>{' '}
          producto(s) asociado(s).
        </Typography>

        <Typography
          sx={{
            fontFamily: 'fontFamily.secondary',
            color: 'text.secondary',
            fontSize: 14,
          }}
        >
          Los productos no serán eliminados.
        </Typography>
        <Typography
          sx={{
            fontFamily: 'fontFamily.secondary',
            color: 'text.secondary',
            fontSize: 14,
          }}
        >
          Solo se eliminará la personalización, sus items y sus relaciones con
          productos.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
          sx={{
            fontFamily: 'fontFamily.terciary',
          }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={onConfirm}
          disabled={loading}
          sx={{
            fontFamily: 'fontFamily.terciary',
            fontWeight: 900,
          }}
        >
          {loading ? 'Eliminando...' : 'Eliminar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
