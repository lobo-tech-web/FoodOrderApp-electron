// ---- Material UI ----
import {
  Box,
  Chip,
  Divider,
  Paper,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
// Icons
import {
  LockOpen as LockOpenIcon,
  ReceiptLong as ReceiptLongIcon,
  People as PeopleIcon,
  PointOfSale as PointOfSaleIcon,
  Settings as SettingsIcon,
  Insights as InsightsIcon,
} from "@mui/icons-material";

// ---- Helpers ----
const PERMISSION_GROUPS = [
  {
    module: "orders",
    title: "PEDIDOS",
    icon: <ReceiptLongIcon />,
    permissions: [
      {
        key: "read",
        label: "Ver pedidos",
        description: "Permite consultar los pedidos del local.",
      },
      {
        key: "create",
        label: "Crear pedidos",
        description: "Permite registrar nuevos pedidos.",
      },
      {
        key: "edit",
        label: "Editar pedidos",
        description:
          "Permite modificar cliente, productos y demás datos según el estado del pedido.",
      },
      {
        key: "updateStatus",
        label: "Cambiar estado",
        description: "Permite avanzar el estado de los pedidos.",
      },
      {
        key: "cancel",
        label: "Cancelar pedidos",
        description: "Permite cancelar pedidos indicando un motivo.",
      },
    ],
  },
  {
    module: "clients",
    title: "CLIENTES",
    icon: <PeopleIcon />,
    permissions: [
      {
        key: "read",
        label: "Ver clientes",
        description: "Permite consultar clientes y puntos del local.",
      },
      {
        key: "create",
        label: "Crear clientes",
        description: "Permite registrar nuevos clientes.",
      },
    ],
  },
  {
    module: "cashRegister",
    title: "CAJA",
    icon: <PointOfSaleIcon />,
    permissions: [
      {
        key: "open",
        label: "Abrir caja",
        description: "Permite iniciar una sesión de caja.",
      },
      {
        key: "close",
        label: "Cerrar caja",
        description: "Permite realizar el cierre de caja.",
      },
      {
        key: "movements",
        label: "Movimientos",
        description: "Permite registrar ingresos y retiros manuales.",
      },
      {
        key: "readReport",
        label: "Ver reportes",
        description: "Permite consultar reportes y resultados de caja.",
      },
    ],
  },
  {
    module: "sales",
    title: "VENTAS",
    icon: <InsightsIcon />,
    permissions: [
      {
        key: "read",
        label: "Ver ventas",
        description:
          "Permite consultar estadísticas de ventas habilitadas para empleados.",
      },
    ],
  },
  {
    module: "settings",
    title: "CONFIGURACIÓN",
    icon: <SettingsIcon />,
    permissions: [
      {
        key: "read",
        label: "Ver configuración",
        description: "Permite consultar configuraciones habilitadas.",
      },
      {
        key: "update",
        label: "Modificar configuración",
        description: "Permite modificar configuraciones del local.",
      },
    ],
  },
];
// -----------------

export const StaffPermissionsEditor = ({ permissions = {}, onChange }) => {
  const enabledCount = PERMISSION_GROUPS.reduce((total, group) => {
    return (
      total +
      group.permissions.filter(
        (permission) => permissions?.[group.module]?.[permission.key] === true,
      ).length
    );
  }, 0);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.main",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={1}
        sx={{ mb: 1 }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <LockOpenIcon color="primary" />

          <Typography
            sx={{
              fontFamily: "fontFamily.primary",
              fontWeight: "bold",
            }}
          >
            PERMISOS
          </Typography>
        </Stack>

        <Chip
          size="small"
          color="primary"
          variant="filled"
          label={`${enabledCount} activos`}
          sx={{ fontFamily: "fontFamily.secondary" }}
        />
      </Stack>

      <Typography
        variant="body2"
        sx={{
          fontFamily: "fontFamily.secondary",
          color: "primary.main",
          borderBottom: "1px solid",
        }}
      >
        Estos permisos son exclusivos de este empleado y pueden ser modificados.
      </Typography>

      <Stack spacing={2} sx={{ mt: 1 }}>
        {PERMISSION_GROUPS.map((group, groupIndex) => (
          <Box key={group.module}>
            {groupIndex > 0 && <Divider sx={{ mb: 2 }} />}

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Box
                sx={{
                  display: "flex",
                  color: "primary.main",
                }}
              >
                {group.icon}
              </Box>

              <Typography
                sx={{
                  fontFamily: "fontFamily.primary",
                  fontWeight: "bold",
                }}
              >
                {group.title}
              </Typography>
            </Stack>

            <Stack spacing={0.5}>
              {group.permissions.map((permission) => {
                const checked =
                  permissions?.[group.module]?.[permission.key] === true;

                return (
                  <Box
                    key={permission.key}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 2,
                      py: 0.75,
                      px: 1,
                      borderRadius: 1.5,

                      "&:hover": {
                        bgcolor: "action.hover",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        minWidth: 0,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "fontFamily.secondary",
                          color: "primary.main",
                          fontSize: 14,
                        }}
                      >
                        {permission.label}
                      </Typography>

                      <Typography
                        sx={{
                          fontFamily: "fontFamily.secondary",
                          color: "text.primary",
                          fontSize: 12,
                        }}
                      >
                        {permission.description}
                      </Typography>
                    </Box>

                    <Switch
                      checked={checked}
                      onChange={(event) =>
                        onChange?.(
                          group.module,
                          permission.key,
                          event.target.checked,
                        )
                      }
                    />
                  </Box>
                );
              })}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};
