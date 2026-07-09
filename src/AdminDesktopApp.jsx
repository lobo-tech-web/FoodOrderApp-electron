import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  LinearProgress,
  Snackbar,
  Typography,
} from "@mui/material";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import { AdminLogin } from "./components/AdminLogin/AdminLogin.jsx";
import { LocalOrders } from "./components/LocalOrders/LocalOrders.jsx";
import { AdminPanel } from "@/views/ControlPanel/AdminPanel/AdminPanel.jsx";
import { DevPanel } from "@/views/ControlPanel/DevPanel/DevPanel.jsx";
import { PrinterConfigModal } from "@/components/PanelComponents/ModalEditOrder/PrinterConfig/PrinterConfigModal.jsx";
import { useUser } from "@/context/Users.jsx";

const getHomePathByRole = (role) => {
  if (role === "dev") return "/dev-control-panel";
  if (role === "admin") return "/control-panel";
  return "/";
};

const ElectronBridge = ({ onOpenPrinterConfig }) => {
  const navigate = useNavigate();
  const { userState } = useUser();

  useEffect(() => {
    if (!window.electronAPI?.onNavigate) return undefined;

    return window.electronAPI.onNavigate((path) => {
      const user = userState.user || {};

      if (!user.id) {
        navigate("/");
        return;
      }

      if (user.role === "admin") {
        navigate(path);
        return;
      }

      navigate(getHomePathByRole(user.role));
    });
  }, [navigate, userState.user]);

  useEffect(() => {
    if (!window.electronAPI?.onOpenPrinterConfig) return undefined;

    return window.electronAPI.onOpenPrinterConfig(onOpenPrinterConfig);
  }, [onOpenPrinterConfig]);

  return null;
};

export const AdminDesktopApp = () => {
  const [printerConfigOpen, setPrinterConfigOpen] = useState(false);
  const [updateState, setUpdateState] = useState(null);
  const [updateMessage, setUpdateMessage] = useState(null);

  useEffect(() => {
    if (!window.electronAPI?.onUpdateStatus) return undefined;

    return window.electronAPI.onUpdateStatus((payload) => {
      if (!payload?.status) return;

      if (payload.status === "idle") {
        setUpdateState(null);
        return;
      }

      if (["not-available", "error"].includes(payload.status)) {
        setUpdateMessage(payload);
        setUpdateState(null);
        return;
      }

      setUpdateState(payload);
    });
  }, []);

  const handleInstallUpdate = async () => {
    setUpdateState((current) => ({
      ...current,
      status: "installing",
      message: "Instalando actualizacion. La aplicacion se reiniciara...",
    }));
    await window.electronAPI?.installUpdate?.();
  };

  const handleDismissUpdate = () => {
    setUpdateState(null);
  };

  const updateDialogOpen = Boolean(updateState);
  const updateIsReady = updateState?.status === "ready";
  const updateIsInstalling = updateState?.status === "installing";
  const updateIsBusy = ["checking", "downloading", "installing"].includes(
    updateState?.status,
  );

  return (
    <>
      <ElectronBridge onOpenPrinterConfig={() => setPrinterConfigOpen(true)} />
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route path="/control-panel" element={<AdminPanel />} />
        <Route path="/dev-control-panel" element={<DevPanel />} />
        <Route path="/local-orders" element={<LocalOrders />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <PrinterConfigModal
        open={printerConfigOpen}
        onClose={() => setPrinterConfigOpen(false)}
      />
      <Dialog
        open={updateDialogOpen}
        onClose={updateIsReady ? handleDismissUpdate : undefined}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent
          sx={{
            p: 3,
            bgcolor: "background.paper",
            color: "text.primary",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <SystemUpdateAltIcon color="primary" sx={{ fontSize: 34 }} />
            <Box>
              <Typography
                sx={{
                  fontFamily: "fontFamily.primary",
                  color: "primary.main",
                  fontSize: "1.1rem",
                }}
              >
                {updateIsReady
                  ? "Actualizacion disponible"
                  : "Actualizando aplicacion"}
              </Typography>
              {updateState?.version && (
                <Typography
                  variant="caption"
                  sx={{ fontFamily: "fontFamily.secondary" }}
                >
                  Version {updateState.version}
                </Typography>
              )}
            </Box>
          </Box>

          <Typography sx={{ fontFamily: "fontFamily.secondary", mb: 1.5 }}>
            {updateState?.message || "Preparando actualizacion..."}
          </Typography>
          {updateState?.detail && (
            <Typography
              variant="body2"
              sx={{
                fontFamily: "fontFamily.secondary",
                color: "text.secondary",
                mb: 1.5,
              }}
            >
              {updateState.detail}
            </Typography>
          )}
          {updateIsBusy && <LinearProgress color="primary" />}
        </DialogContent>
        {updateIsReady && (
          <DialogActions sx={{ bgcolor: "background.paper", px: 3, pb: 2 }}>
            <Button onClick={handleDismissUpdate} color="inherit">
              Mas tarde
            </Button>
            <Button variant="contained" onClick={handleInstallUpdate}>
              Actualizar ahora
            </Button>
          </DialogActions>
        )}
        {updateIsInstalling && (
          <DialogActions sx={{ bgcolor: "background.paper", px: 3, pb: 2 }}>
            <Typography
              variant="caption"
              sx={{ fontFamily: "fontFamily.secondary", color: "text.primary" }}
            >
              La app se cerrara y volvera a abrir automaticamente.
            </Typography>
          </DialogActions>
        )}
      </Dialog>
      <Snackbar
        open={Boolean(updateMessage)}
        autoHideDuration={6000}
        onClose={() => setUpdateMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={updateMessage?.status === "error" ? "error" : "info"}
          onClose={() => setUpdateMessage(null)}
          sx={{ width: "100%" }}
        >
          {updateMessage?.message}
        </Alert>
      </Snackbar>
    </>
  );
};
