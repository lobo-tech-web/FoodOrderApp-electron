// ---- Material UI ----
import { Box, Button, Chip, Typography } from "@mui/material";
// Icon
import {
  Refresh as RefreshIcon,
  ScheduleOutlined as ScheduleOutlinedIcon,
  AlarmOn as AlarmOnIcon,
} from "@mui/icons-material";
// ---------------------

const connectionLabels = {
  connecting: "Conectando…",
  connected: "En tiempo real",
  disconnected: "Sin conexión en tiempo real",
  offline: "Modo offline",
  unauthorized: "Reiniciá sesión para recibir avisos",
};

export const OrderRealtimeIndicator = ({
  connection,
  hasUpdates,
  isProtected,
  isRefreshing,
  lastRefresh,
  onRefresh,
}) => (
  <Box
    role="status"
    sx={{
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      columnGap: 1.5,
      rowGap: 1,
      px: { xs: 1, sm: 2 },
      py: 1.25,
      width: "100%",
      minWidth: 0,
      borderTop: "1px solid",
      borderColor: "divider",
      bgcolor: hasUpdates ? "action.hover" : "transparent",
      transition: "background-color 0.2s ease",
    }}
  >
    <Chip
      size="medium"
      variant="outlined"
      icon={<AlarmOnIcon />}
      color={connection === "connected" ? "success" : "default"}
      label={connectionLabels[connection] || connectionLabels.disconnected}
      sx={{ fontFamily: "fontFamily.secondary", maxWidth: "100%" }}
    />

    <Box sx={{ flex: "1 1 180px", minWidth: 0 }}>
      <Typography
        variant="body2"
        sx={{
          fontFamily: "fontFamily.secondary",
          color: hasUpdates ? "primary.main" : "text.primary",
        }}
      >
        {hasUpdates
          ? "Hay cambios de pedidos disponibles"
          : isRefreshing
            ? "Actualizando pedidos…"
            : ["connected", "offline"].includes(connection)
              ? "Los pedidos se actualizan automáticamente"
              : "Podés actualizar los pedidos manualmente"}
      </Typography>

      {isProtected && hasUpdates && (
        <Typography
          variant="caption"
          sx={{ display: "block", color: "primary.main" }}
        >
          Se cargarán automáticamente al terminar la operación.
        </Typography>
      )}
    </Box>

    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        alignContent: "center",
        gap: 0.5,
        ml: "auto",
      }}
    >
      <ScheduleOutlinedIcon fontSize="small" color="primary" />

      <Typography
        variant="caption"
        sx={{
          fontFamily: "fontFamily.secondary",
          whiteSpace: "nowrap",
          color: "text.primary",
        }}
      >
        Última actualización: {lastRefresh || "—"}
      </Typography>
    </Box>

    {hasUpdates && (
      <Button
        size="small"
        startIcon={<RefreshIcon />}
        onClick={onRefresh}
        aria-label="Cargar cambios de pedidos"
        disabled={isProtected || isRefreshing}
        variant="contained"
        sx={{
          fontFamily: "fontFamily.primary",
          flexShrink: 0,
          whiteSpace: "nowrap",
          minHeight: 32,
        }}
      >
        Cargar cambios
      </Button>
    )}
  </Box>
);
