// ---- MATERIAL UI ----
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
// ICONS
import {
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
// ---------------------

export const ConfirmDialogClose = ({
  showConfirmClose,
  setShowConfirmClose,
  handleConfirmModalClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={showConfirmClose}
      onClose={() => setShowConfirmClose(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.default',
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
          gap: 2,
          fontFamily: 'main-app-oswald',
          fontWeight: 'bold',
          fontSize: isMobile ? '0.8rem' : '1rem',
        }}
      >
        ¿DESCARTAR CAMBIOS NO GUARDADOS?
      </DialogTitle>

      <DialogContent>
        <DialogContentText
          sx={{
            fontFamily: 'main-app-text',
            color: 'text.primary',
            fontSize: isMobile ? '0.8rem' : '1rem',
            mt: 2,
          }}
        >
          Perderás los cambios no guardados al abandonar esta sección
        </DialogContentText>
      </DialogContent>

      <DialogActions
        sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}
      >
        <Button
          onClick={() => handleConfirmModalClose(false)}
          variant="contained"
          color="secondary"
          size={isMobile ? 'small' : 'medium'}
          startIcon={<CloseIcon />}
          sx={{
            fontFamily: 'main-app-oswald',
          }}
        >
          Volver
        </Button>

        <Button
          onClick={() => handleConfirmModalClose(true)}
          variant="contained"
          color="primary"
          size={isMobile ? 'small' : 'medium'}
          startIcon={<CheckCircleIcon />}
          sx={{
            fontFamily: 'main-app-oswald',
          }}
        >
          Descartar cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
};
