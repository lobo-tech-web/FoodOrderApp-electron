import { lazy, Suspense, useEffect, useMemo, useState } from "react";

// ---- Material UI ----
import {
  Box,
  CircularProgress,
  Stack,
  ThemeProvider,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { ErrorOutline } from "@mui/icons-material";
// ---------------------

// ---- Context ----
import { LobotechThemeProvider } from "@/context/ThemeContext.jsx";
import { useLobotechThemeContext } from "@/context/lobotechThemeContext.js";
import { availableThemeOptions } from "@/theme/themeRegistry.js";
import { createTotemTheme } from "./providers/totemTheme.js";
// -----------------

const TotemRoot = lazy(() =>
  import("./TotemDesktopApp.jsx").then((module) => ({
    default: module.TotemDesktopApp,
  })),
);

const RuntimeMessageContent = ({ children, error = false, title }) => {
  const { lobotechTheme } = useLobotechThemeContext();
  const theme = useMemo(() => createTotemTheme(lobotechTheme), [lobotechTheme]);

  return (
    <ThemeProvider theme={theme}>
      <Box
        component="main"
        sx={{
          height: "100dvh",
          overflowY: "auto",
          display: "flex",
          bgcolor: "background.main",
          color: "text.primary",
          p: { xs: 3, sm: 4 },
        }}
      >
        <Stack
          role={error ? "alert" : "status"}
          aria-live={error ? "assertive" : "polite"}
          spacing={3}
          alignItems="center"
          sx={{ m: "auto", width: "100%", maxWidth: 560, textAlign: "center" }}
        >
          {error ? (
            <ErrorOutline sx={{ fontSize: 64, color: "error.main" }} />
          ) : (
            <Box
              aria-hidden="true"
              sx={{
                position: "relative",
                width: 88,
                height: 88,
                "@media (prefers-reduced-motion: reduce)": {
                  "& *": { animation: "none !important" },
                },
              }}
            >
              <CircularProgress
                variant="determinate"
                value={100}
                size={88}
                thickness={2}
                sx={{
                  color: (theme) => alpha(theme.palette.primary.main, 0.18),
                }}
              />

              <CircularProgress
                size={88}
                thickness={3}
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  color: "primary.main",
                  "& .MuiCircularProgress-circle": { strokeLinecap: "round" },
                }}
              />
            </Box>
          )}

          {title && (
            <Typography variant="h5" component="h1">
              {title}
            </Typography>
          )}

          <Typography variant="body1" sx={{ overflowWrap: "anywhere" }}>
            {children}
          </Typography>
        </Stack>
      </Box>
    </ThemeProvider>
  );
};

const RuntimeMessage = ({ runtime, ...props }) => (
  <LobotechThemeProvider
    key={runtime?.mode || "startup"}
    storageKey={
      runtime?.mode === "totem" ? "lobotechTotemTheme" : "lobotechAppTheme"
    }
    initialTheme={runtime?.mode === "totem" ? runtime.totemTheme : null}
  >
    <RuntimeMessageContent {...props} />
  </LobotechThemeProvider>
);

const AdminRoot = lazy(async () => {
  const [{ AdminDesktopApp }, { AdminDesktopProviders }] = await Promise.all([
    import("./AdminDesktopApp.jsx"),
    import("./providers/AdminDesktopProviders.jsx"),
  ]);

  const Component = () => (
    <AdminDesktopProviders>
      <AdminDesktopApp />
    </AdminDesktopProviders>
  );

  return { default: Component };
});

export const DesktopRoot = () => {
  const [runtime, setRuntime] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadRuntime = async () => {
      try {
        if (!window.totemAPI?.getRuntime) {
          throw new Error("No se pudo acceder al entorno de Electron");
        }

        const registration = await window.totemAPI.registerThemes(
          availableThemeOptions,
        );

        if (!registration?.ok) {
          throw new Error(
            registration?.message || "No se pudieron registrar los temas",
          );
        }

        const response = await window.totemAPI.getRuntime();

        if (!response?.ok || !["admin", "totem"].includes(response.mode)) {
          throw new Error(
            response?.message || "El modo de la aplicación es inválido",
          );
        }

        if (active) setRuntime(response);
      } catch (runtimeError) {
        if (active) setError(runtimeError.message);
      }
    };

    loadRuntime();

    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <RuntimeMessage
        error
        title="No se pudo identificar el modo de la aplicación"
      >
        {error}
      </RuntimeMessage>
    );
  }

  if (!runtime) {
    return (
      <RuntimeMessage>Verificando el modo de la aplicación…</RuntimeMessage>
    );
  }

  return (
    <Suspense
      fallback={
        <RuntimeMessage runtime={runtime}>
          Cargando {runtime.mode === "totem" ? "tótem" : "panel"}…
        </RuntimeMessage>
      }
    >
      {runtime.mode === "totem" ? (
        <TotemRoot
          initialTheme={runtime.totemTheme}
          initialBackground={runtime.totemBackground}
          isDevelopment={runtime.isDevelopment}
        />
      ) : (
        <AdminRoot />
      )}
    </Suspense>
  );
};
