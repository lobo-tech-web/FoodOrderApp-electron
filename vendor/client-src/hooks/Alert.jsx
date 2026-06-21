import { useState, useCallback } from 'react';

// ---- THEME ----
import { lobotechAppTheme } from '@/theme/main-theme.js';
// ---------------

// ---- COMPONENTS ----
import { CustomAlert } from '@/components/CustomAlert/CustomAlert.jsx';
// --------------------

export const useAlert = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('');
  const [theme, setTheme] = useState(lobotechAppTheme);

  const showAlert = useCallback(
    (message, alertSeverity, customTheme = lobotechAppTheme) => {
      setTheme(customTheme);
      setMessage(message);
      setSeverity(alertSeverity);
      setOpen(true);
    },
    []
  );

  const closeAlert = useCallback(() => {
    setOpen(false);
  }, []);

  const AlertComponent = (
    <CustomAlert
      openSnackbar={open}
      onCloseSnackbar={closeAlert}
      message={message}
      severity={severity}
      theme={theme}
    />
  );

  return { showAlert, AlertComponent };
};
