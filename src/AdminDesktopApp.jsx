import { PrinterConfigModal } from "@/components/PanelComponents/ModalEditOrder/PrinterConfig/PrinterConfigModal.jsx";
import { useUser } from "@/context/Users.jsx";
import { AdminPanel } from "@/views/ControlPanel/AdminPanel/AdminPanel.jsx";
import { DevPanel } from "@/views/ControlPanel/DevPanel/DevPanel.jsx";
import { StaffPanel } from "@/views/ControlPanel/StaffPanel/StaffPanel.jsx";
import { useOrders } from "@/context/Orders.jsx";
import {
  getOfflineStatusSnapshot,
  setBackendReachable,
  setForcedOfflineMode,
  subscribeOfflineStatus,
} from "@/utils/offlineStorage.js";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import SyncIcon from "@mui/icons-material/Sync";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
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
import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { AdminLogin } from "./components/AdminLogin/AdminLogin.jsx";
import { LocalOrders } from "./components/LocalOrders/LocalOrders.jsx";
import { clearDesktopRuntimeSession } from "./utils/desktopSessionCleanup.js";
import { checkBackendHealthService } from "@/services/health.js";

const getHomePathByRole = (role) => {
  if (role === "dev") return "/dev-control-panel";
  if (role === "admin") return "/control-panel";
  if (role === "staff") return "/staff-panel";
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

const OfflineStatusIndicator = ({
  status,
  onDisableOfflineMode,
  onSyncPendingOrders,
}) => {
  const forcedOffline = status?.forcedOffline;
  const browserOffline = status?.browserOnline === false;
  const backendOffline = status?.backendReachable === false;
  const pendingOrders = Number(status?.pendingOrders || 0);
  const connected = !forcedOffline && !browserOffline && !backendOffline;
  const color =
    forcedOffline || backendOffline || browserOffline
      ? "warning.main"
      : pendingOrders > 0
        ? "info.main"
        : "success.main";
  const title = forcedOffline
    ? "Trabajando sin conexión"
    : backendOffline || browserOffline
      ? "Sin conexión con el backend"
      : pendingOrders > 0
        ? "Pedidos pendientes de sincronizar"
        : "Online";
  const Icon = connected ? CloudDoneIcon : CloudOffIcon;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 8,
        right: 12,
        zIndex: 1500,
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1.5,
        py: 0.8,
        borderRadius: 2,
        bgcolor: "background.paper",
        color: "text.primary",
        border: "1px solid",
        borderColor: color,
        boxShadow: 4,
      }}
    >
      <Icon sx={{ color, fontSize: 20 }} />
      <Box>
        <Typography
          sx={{
            fontFamily: "fontFamily.primary",
            fontSize: 12,
            fontWeight: 900,
            lineHeight: 1.1,
          }}
        >
          {title}
        </Typography>
        {pendingOrders > 0 && (
          <Typography
            sx={{
              fontFamily: "fontFamily.secondary",
              fontSize: 11,
              color: "text.secondary",
              lineHeight: 1.1,
            }}
          >
            {pendingOrders} pedido{pendingOrders === 1 ? "" : "s"} pendiente
            {pendingOrders === 1 ? "" : "s"}
          </Typography>
        )}
      </Box>
      {forcedOffline ? (
        <Button
          size="small"
          variant="outlined"
          onClick={onDisableOfflineMode}
          sx={{ fontSize: 11, py: 0.2 }}
        >
          Conectar
        </Button>
      ) : (
        pendingOrders > 0 &&
        connected && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<SyncIcon />}
            onClick={onSyncPendingOrders}
            sx={{ fontSize: 11, py: 0.2 }}
          >
            Sync
          </Button>
        )
      )}
    </Box>
  );
};

export const AdminDesktopApp = () => {
  const { syncOfflineOrders } = useOrders();
  const reconnectInProgressRef = useRef(false);
  const [printerConfigOpen, setPrinterConfigOpen] = useState(false);
  const [updateState, setUpdateState] = useState(null);
  const [updateMessage, setUpdateMessage] = useState(null);
  const [offlineStatus, setOfflineStatus] = useState(() =>
    getOfflineStatusSnapshot(),
  );
  const [syncDialog, setSyncDialog] = useState({
    open: false,
    loading: false,
    severity: "info",
    title: "",
    message: "",
  });

  useEffect(() => {
    const handleClose = () => {
      clearDesktopRuntimeSession();
    };

    window.addEventListener("beforeunload", handleClose);
    window.addEventListener("pagehide", handleClose);

    return () => {
      window.removeEventListener("beforeunload", handleClose);
      window.removeEventListener("pagehide", handleClose);
    };
  }, []);

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

  const refreshBackendConnection = useCallback(
    async ({ manual = false, fromForcedOffline = false } = {}) => {
      if (reconnectInProgressRef.current) return false;

      reconnectInProgressRef.current = true;

      if (manual) {
        setSyncDialog({
          open: true,
          loading: true,
          severity: "info",
          title: "Conectando con el backend",
          message: "Verificando conexion con Railway y la base de datos...",
        });
      }

      try {
        await checkBackendHealthService();
        setBackendReachable(true);

        if (fromForcedOffline) {
          setForcedOfflineMode(false);
        }

        const pendingOrders = getOfflineStatusSnapshot().pendingOrders;

        if (pendingOrders > 0) {
          setSyncDialog({
            open: true,
            loading: true,
            severity: "info",
            title: "Sincronizando datos",
            message:
              "Estamos sincronizando los pedidos creados sin conexion. Espera unos segundos antes de seguir trabajando.",
          });

          const syncedOrders = await syncOfflineOrders?.();
          const pendingAfterSync = getOfflineStatusSnapshot().pendingOrders;

          setSyncDialog({
            open: true,
            loading: false,
            severity: pendingAfterSync > 0 ? "warning" : "success",
            title:
              pendingAfterSync > 0
                ? "Sincronizacion incompleta"
                : "Sistema sincronizado",
            message:
              pendingAfterSync > 0
                ? `Quedaron ${pendingAfterSync} pedidos pendientes. Algunos pedidos necesitan revision o el backend rechazo su sincronizacion.`
                : `Se sincronizaron ${syncedOrders?.length || pendingOrders} pedidos correctamente.`,
          });
        } else if (manual) {
          setSyncDialog({
            open: true,
            loading: false,
            severity: "success",
            title: "Conexion restablecida",
            message:
              "Se reestableció la conexión con el servidor correctamente!",
          });
        }

        return true;
      } catch (error) {
        setBackendReachable(false);

        if (fromForcedOffline) {
          setForcedOfflineMode(true);
        }

        if (manual) {
          setSyncDialog({
            open: true,
            loading: false,
            severity: "error",
            title: "No se pudo conectar",
            message:
              error?.message ||
              "No se pudo conectar con el backend o la base de datos.",
          });
        }

        return false;
      } finally {
        reconnectInProgressRef.current = false;
      }
    },
    [syncOfflineOrders],
  );

  useEffect(() => {
    const updateStatus = (nextStatus) => {
      setOfflineStatus(nextStatus);
      window.electronAPI?.setOfflineStatus?.(nextStatus).catch(() => {});
    };

    updateStatus(getOfflineStatusSnapshot());
    return subscribeOfflineStatus(updateStatus);
  }, []);

  useEffect(() => {
    refreshBackendConnection().catch(() => {});

    const intervalId = window.setInterval(() => {
      if (getOfflineStatusSnapshot().forcedOffline) return;
      refreshBackendConnection().catch(() => {});
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [refreshBackendConnection]);

  useEffect(() => {
    if (
      offlineStatus.forcedOffline ||
      offlineStatus.browserOnline === false ||
      offlineStatus.backendReachable === false ||
      offlineStatus.pendingOrders <= 0
    ) {
      return;
    }

    refreshBackendConnection().catch(() => {});
  }, [offlineStatus, refreshBackendConnection]);

  useEffect(() => {
    if (!window.electronAPI?.onToggleOfflineMode) return undefined;

    return window.electronAPI.onToggleOfflineMode((enabled) => {
      if (enabled) {
        setForcedOfflineMode(true);
        return;
      }

      refreshBackendConnection({
        manual: true,
        fromForcedOffline: true,
      }).catch(() => {});
    });
  }, [refreshBackendConnection]);

  const handleDisableOfflineMode = () => {
    refreshBackendConnection({
      manual: true,
      fromForcedOffline: true,
    }).catch(() => {});
  };

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
      <OfflineStatusIndicator
        status={offlineStatus}
        onDisableOfflineMode={handleDisableOfflineMode}
        onSyncPendingOrders={() =>
          refreshBackendConnection({ manual: true }).catch(() => {})
        }
      />
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route
          path="/login-staff"
          element={<AdminLogin initialMode="staff" />}
        />
        <Route path="/control-panel" element={<AdminPanel />} />
        <Route path="/dev-control-panel" element={<DevPanel />} />
        <Route path="/staff-panel" element={<StaffPanel />} />
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
      <Dialog
        open={syncDialog.open}
        onClose={
          syncDialog.loading
            ? undefined
            : () => setSyncDialog((current) => ({ ...current, open: false }))
        }
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
          <Alert severity={syncDialog.severity} sx={{ mb: 2 }}>
            {syncDialog.title}
          </Alert>
          <Typography sx={{ fontFamily: "fontFamily.secondary", mb: 2 }}>
            {syncDialog.message}
          </Typography>
          {syncDialog.loading && <LinearProgress color="primary" />}
        </DialogContent>
        {!syncDialog.loading && (
          <DialogActions sx={{ bgcolor: "background.paper", px: 3, pb: 2 }}>
            <Button
              variant="contained"
              onClick={() =>
                setSyncDialog((current) => ({ ...current, open: false }))
              }
            >
              Entendido
            </Button>
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
