// ---- MATERIAL UI ----
import { Snackbar, Alert } from '@mui/material';
//<---------------------

export const CustomAlert = ({
  openSnackbar,
  onCloseSnackbar,
  message,
  severity = 'success',
  theme,
}) => {
  return (
    <Snackbar
      open={openSnackbar}
      autoHideDuration={1500}
      onClose={onCloseSnackbar}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        onClose={onCloseSnackbar}
        severity={severity}
        sx={{
          width: '100%',
          fontFamily: theme.typography.fontFamily.secondary,
          fontWeight: 'bold',
          fontSize: '1rem',
          bgcolor: theme.palette.background.default,
          color: theme.palette.primary.main,
          border: `1px solid ${theme.palette.primary.main}`,
          borderRadius: '8px',
          mt: 10,
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};
