import { useEffect, useRef, useState } from "react";

// ---- Material UI ----
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Sensors as SensorsIcon } from "@mui/icons-material";
// ---------------------

// ---- Logos ----
import logo from "@/assets/main/logo-lobotech-oj.png";
// ---------------

// ---- Components ----
import {
  TotemProviders,
  useTotemBackground,
} from "./providers/TotemProviders.jsx";
import { TotemCatalog } from "./components/TotemDevicesPanel/TotemCatalog/TotemCatalog.jsx";
import { ModalTotemMaintenance } from "./components/TotemDevicesPanel/ModalTotemMaintenance/ModalTotemMaintenance.jsx";
// --------------------

const TotemDesktopContent = () => {
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(true);
  const [activating, setActivating] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [pairingCode, setPairingCode] = useState("");

  const activationRef = useRef(false);

  useEffect(() => {
    let active = true;

    const checkStatus = async () => {
      if (activationRef.current) return;
      if (active) setChecking(true);

      try {
        const response = await window.totemAPI.getStatus();

        if (active && !activationRef.current && response?.status !== 409) {
          setResult((current) =>
            !response?.ok && current?.linked
              ? { ...current, connectionError: response.message }
              : response,
          );
        }
      } catch {
        if (active && !activationRef.current) {
          setResult((current) =>
            current?.linked
              ? {
                  ...current,
                  connectionError: "No se pudo verificar la conexión",
                }
              : {
                  ok: false,
                  message: "No se pudo verificar la conexión del tótem",
                },
          );
        }
      } finally {
        if (active) setChecking(false);
      }
    };

    checkStatus();

    const interval = window.setInterval(checkStatus, 30000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const activate = async () => {
    if (activationRef.current || checking) return;

    activationRef.current = true;
    setActivating(true);

    try {
      const response = await window.totemAPI.activate({
        deviceId: deviceId.trim(),
        pairingCode: pairingCode.trim(),
      });

      if (!response?.ok) {
        setResult(response);
        return;
      }

      setPairingCode("");
      setResult({
        ok: true,
        linked: true,
        device: response.device,
      });
    } catch {
      setResult({
        ok: false,
        message: "No se pudo vincular el equipo",
      });
    } finally {
      activationRef.current = false;
      setActivating(false);
    }
  };

  const linked = result?.ok === true && result?.linked === true;

  if (linked) {
    return (
      <TotemCatalog
        device={result.device}
        connectionError={result.connectionError}
      />
    );
  }

  return (
    <>
      <Box
        sx={{
          minHeight: "var(--totem-content-height, 100dvh)",
          display: "grid",
          placeItems: "center",
          bgcolor: "var(--totem-page-background)",
          color: "text.primary",
          p: 3,
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            p: 4,
            width: "100%",
            maxWidth: 620,
            bgcolor: "background.paper",
            color: "text.primary",
          }}
        >
          <Stack spacing={3}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Box
                component="img"
                src={logo}
                alt=""
                sx={{ width: 120, height: 120, objectFit: "contain" }}
              />

              <Typography
                variant="h4"
                textAlign="center"
                sx={{ fontFamily: "fontFamily.primary" }}
              >
                LOBOTECH TÓTEM
              </Typography>
            </Box>

            {checking && !result ? (
              <Box sx={{ textAlign: "center" }}>
                <CircularProgress />
                <Typography sx={{ fontFamily: "fontFamily.secondary", mt: 2 }}>
                  Verificando vinculación…
                </Typography>
              </Box>
            ) : (
              <>
                {result?.ok === false && (
                  <Alert severity="error">
                    {result.message || "No se pudo verificar el tótem"}
                  </Alert>
                )}

                <Typography
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    fontSize: "0.9rem",
                  }}
                >
                  Ingresá los datos generados por el administrador para vincular
                  este equipo.
                </Typography>

                <TextField
                  label="ID del dispositivo"
                  value={deviceId}
                  onChange={(event) => setDeviceId(event.target.value)}
                  disabled={activating || checking}
                  fullWidth
                />

                <TextField
                  label="Código de vinculación"
                  value={pairingCode}
                  onChange={(event) => setPairingCode(event.target.value)}
                  disabled={activating || checking}
                  type="password"
                  fullWidth
                />

                <Button
                  startIcon={<SensorsIcon />}
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={
                    activating ||
                    checking ||
                    !deviceId.trim() ||
                    !pairingCode.trim()
                  }
                  onClick={activate}
                >
                  {activating ? "Vinculando…" : "Vincular equipo"}
                </Button>
              </>
            )}
          </Stack>
        </Paper>
      </Box>
    </>
  );
};

const TotemDesktopLayout = ({ isDevelopment }) => {
  const background = useTotemBackground();
  const hasImage =
    background.mode === "image" &&
    /^data:image\/png;base64,/.test(background.imageUrl || "");

  const [exitError, setExitError] = useState("");
  const requestExit = async () => {
    setExitError("");
    try {
      const result = await window.totemAPI.requestExit();
      if (!result?.ok) throw new Error(result?.message);
    } catch {
      setExitError("No se pudo abrir el cierre del tótem. Volvé a intentar.");
    }
  };
  return (
    <Box
      sx={{
        height: "100dvh",
        bgcolor: "background.main",
        backgroundImage: hasImage
          ? `url(${JSON.stringify(background.imageUrl)})`
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        "--totem-content-height": isDevelopment
          ? "100dvh"
          : "calc(100dvh - 44px)",
        "--totem-page-background": (theme) =>
          hasImage ? "transparent" : theme.palette.background.main,
      }}
    >
      {!isDevelopment && (
        <Stack
          component="nav"
          aria-label="Administración del tótem"
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            height: 44,
            px: 2,
            bgcolor: "background.paper",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Tótem
          </Typography>
          <Button size="small" onClick={requestExit} sx={{ minHeight: 40 }}>
            Cerrar tótem
          </Button>
        </Stack>
      )}
      {exitError && (
        <Alert
          severity="error"
          onClose={() => setExitError("")}
          sx={{ position: "fixed", top: 48, right: 16, zIndex: 1500 }}
        >
          {exitError}
        </Alert>
      )}
      <TotemDesktopContent />
      <ModalTotemMaintenance />
    </Box>
  );
};

export const TotemDesktopApp = ({
  initialTheme,
  initialBackground,
  isDevelopment = false,
}) => (
  <TotemProviders
    initialTheme={initialTheme}
    initialBackground={initialBackground}
  >
    <TotemDesktopLayout isDevelopment={isDevelopment} />
  </TotemProviders>
);
