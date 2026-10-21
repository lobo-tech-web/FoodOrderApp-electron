import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

// ---- Material UI ----
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  Divider,
  Chip,
  ThemeProvider,
} from "@mui/material";
// Icons
import {
  ArrowBack as ArrowBackIcon,
  DisplaySettings as DisplaySettingsIcon,
  Computer as ComputerIcon,
  PointOfSale as PointOfSaleIcon,
  Settings as SettingsIcon,
  Pending as PendingIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Context ----
import { useLobotechThemeContext } from "@/context/lobotechThemeContext.js";
import { useUser } from "@/context/Users.jsx";
import { createTotemTheme } from "../../providers/totemTheme.js";
// -----------------

// ---- Components ----
import { ModalLinkTotem } from "./ModalLinkTotem/ModalLinkTotem.jsx";
import { ModalNewlinkUnlinkTotem } from "./ModalNewlinkUnlinkTotem/ModalNewlinkUnlinkTotem.jsx";
import { ModalTotemTerminalPoint } from "./ModalTotemTerminalPoint/ModalTotemTerminalPoint.jsx";
import { ModalTotemChangeCashRegister } from "./ModalTotemChangeCashRegister/ModalTotemChangeCashRegister.jsx";
// --------------------

// ---- Services ----
import { getCashRegistersService } from "@/services/cashRegister.js";
import {
  changeTotemAccessService,
  getTotemDevicesService,
  registerTotemDeviceService,
  configureTotemPointService,
  configureTotemCashRegisterService,
} from "@/services/totemDevices.js";
// ------------------

// ---- Helpers ----
const INITIAL_MODAL_STATE = {
  linkTotem: null,
  newlinkUnlinkTotem: null,
  terminalPoint: null,
  changeCashRegister: null,
};

const TOTEM_STATUS = [
  {
    value: "PENDING_ACTIVATION",
    title: "Pendiente de activación",
    icon: <PendingIcon />,
    color: "warning",
  },
  {
    value: "ACTIVE",
    title: "Activo",
    icon: <CheckIcon />,
    color: "success",
  },
  {
    value: "DISABLED",
    title: "Desactivado",
    icon: <CancelIcon />,
    color: "error",
  },
];

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "No se pudo completar la operación";
// -----------------

export const TotemDevicesPanel = () => {
  const navigate = useNavigate();

  const { lobotechTheme } = useLobotechThemeContext();
  const theme = useMemo(() => createTotemTheme(lobotechTheme), [lobotechTheme]);
  const { userState } = useUser();
  const user = userState.user || {};

  const [devices, setDevices] = useState([]);
  const [registers, setRegisters] = useState([]);
  const [name, setName] = useState("");
  const [cashRegisterId, setCashRegisterId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pointTerminalId, setPointTerminalId] = useState("");
  const [assignedRegisterId, setAssignedRegisterId] = useState("");
  const activeRegisters = registers.filter((register) => register.isActive);

  // Cada propiedad contiene los datos del modal abierto, o null si está cerrado.
  const [modalState, setModalState] = useState({ ...INITIAL_MODAL_STATE });
  const {
    linkTotem: pairing,
    newlinkUnlinkTotem: confirmation,
    terminalPoint: pointDevice,
    changeCashRegister: registerDevice,
  } = modalState;

  const operationRef = useRef(false);
  const openModal = (modal, data) => {
    if (operationRef.current) return;
    setError("");
    setModalState({ ...INITIAL_MODAL_STATE, [modal]: data });
  };
  const closeModal = (modal) => {
    if (operationRef.current) return;
    setModalState((current) => ({ ...current, [modal]: null }));
    setError("");
  };

  const loadData = useCallback(async () => {
    const [deviceList, registerList] = await Promise.all([
      getTotemDevicesService(),
      getCashRegistersService({
        restaurantId: user.id,
        includeInactive: true,
      }),
    ]);

    if (!Array.isArray(deviceList) || !Array.isArray(registerList)) {
      throw new Error("El servidor devolvió un listado inválido");
    }

    setDevices(deviceList);
    setRegisters(registerList);
  }, [user.id]);

  useEffect(() => {
    if (user.role !== "admin") return;

    loadData().catch((loadError) => {
      setError(getErrorMessage(loadError));
    });
  }, [loadData, user.role]);

  const runOperation = async (action) => {
    if (operationRef.current) return;

    operationRef.current = true;
    setBusy(true);
    setError("");

    try {
      const result = await action();

      setModalState({
        ...INITIAL_MODAL_STATE,
        linkTotem: result?.pairingCode ? result : null,
      });
      try {
        await loadData();
      } catch (loadError) {
        setError(
          `La operación se aplicó, pero no se pudo actualizar el listado: ${getErrorMessage(
            loadError,
          )}`,
        );
      }
    } catch (operationError) {
      setError(getErrorMessage(operationError));
    } finally {
      operationRef.current = false;
      setBusy(false);
    }
  };

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          bgcolor: "background.main",
          height: "100vh",
          overflowY: "auto",
          mx: "auto",
          p: 3,
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/control-panel")}
              disabled={busy}
              sx={{ fontFamily: "fontFamily.primary", maxWidth: 210 }}
            >
              Volver al panel
            </Button>

            <DisplaySettingsIcon fontSize="large" color="primary" />

            <Typography
              variant="h5"
              sx={{
                fontFamily: "fontFamily.primary",
                color: "primary.main",
              }}
            >
              GESTIÓN DE TÓTEMS
            </Typography>
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack
              direction={{ sm: "column", md: "row" }}
              spacing={2}
              alignItems="center"
              width="100%"
            >
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                  flex: 1,
                  minWidth: 0,
                  "& .MuiTextField-root": { flex: 1, minWidth: 0 },
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "fontFamily.primary",
                    whiteSpace: "nowrap",
                  }}
                >
                  NOMBRE DEL TOTEM
                </Typography>

                <TextField
                  label="Nombre del Tótem"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  inputProps={{ maxLength: 100 }}
                  disabled={busy}
                  sx={{ fontFamily: "fontFamily.secondary" }}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                  flex: 1,
                  minWidth: 0,
                  "& .MuiTextField-root": { flex: 1, minWidth: 0 },
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "fontFamily.primary",
                    whiteSpace: "nowrap",
                  }}
                >
                  ASOCIAR CAJA
                </Typography>

                <TextField
                  select
                  label="Caja asociada"
                  value={cashRegisterId}
                  onChange={(event) => setCashRegisterId(event.target.value)}
                  disabled={busy}
                  sx={{ fontFamily: "fontFamily.primary" }}
                >
                  {activeRegisters.map((register) => (
                    <MenuItem
                      key={register.id}
                      value={register.id}
                      sx={{
                        fontFamily: "fontFamily.primary",
                        textTransform: "uppercase",
                      }}
                    >
                      {register.name} · {register.code}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Button
                variant="contained"
                disabled={busy || !name.trim() || !cashRegisterId}
                onClick={() =>
                  runOperation(async () => {
                    const result = await registerTotemDeviceService({
                      name: name.trim(),
                      cashRegisterId,
                    });

                    setName("");
                    return result;
                  })
                }
                sx={{
                  fontFamily: "fontFamily.primary",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  ml: "auto",
                }}
              >
                REGISTRAR TÓTEM
              </Button>
            </Stack>
          </Paper>

          <Divider sx={{ bgcolor: "text.primary" }} />

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
            }}
          >
            <ComputerIcon fontSize="large" color="primary" />

            <Typography
              variant="h5"
              sx={{
                fontFamily: "fontFamily.primary",
                color: "primary.main",
              }}
            >
              TÓTEMS REGISTRADOS
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                lg: "repeat(2, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            {devices.map((device) => {
              const assignedRegister = registers.find(
                (register) => register.id === device.cashRegisterId,
              );
              return (
                <Paper
                  key={device.id}
                  variant="outlined"
                  sx={{
                    border: "1px solid",
                    borderColor: "text.primary",
                    minWidth: 0,
                    p: 2,
                  }}
                >
                  <Stack spacing={3}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignContent: "center",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 2,
                      }}
                    >
                      <ComputerIcon fontSize="large" color="primary" />

                      <Stack direction="column" spacing={0.5}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Typography
                            variant="h6"
                            sx={{
                              fontFamily: "fontFamily.primary",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {device.name}
                          </Typography>

                          <Chip
                            variant="filled"
                            label={
                              TOTEM_STATUS.find(
                                (item) => item.value === device.status,
                              )?.title ?? "Estado desconocido"
                            }
                            icon={
                              TOTEM_STATUS.find(
                                (item) => item.value === device.status,
                              )?.icon || <ComputerIcon />
                            }
                            color={
                              TOTEM_STATUS.find(
                                (item) => item.value === device.status,
                              )?.color || "primary"
                            }
                            sx={{
                              fontFamily: "fontFamily.secondary",
                              height: 28,
                              fontSize: "0.8rem",
                              maxWidth: 400,
                              "& .MuiChip-label": {
                                px: 1,
                              },
                              "& .MuiChip-icon": {
                                fontSize: 22,
                                ml: 0.5,
                              },
                            }}
                          />
                        </Stack>

                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "fontFamily.secondary",
                            overflowWrap: "anywhere",
                          }}
                        >
                          ID: {device.id}
                        </Typography>
                      </Stack>
                    </Box>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "minmax(0, 1fr)",
                          lg: "repeat(2, minmax(0, 1fr))",
                        },
                        gap: 2,
                      }}
                    >
                      <Stack direction="column" spacing={1}>
                        <Stack
                          direction="row"
                          justifyContent="center"
                          alignItems="center"
                          spacing={1}
                        >
                          <Typography
                            sx={{
                              fontFamily: "fontFamily.secondary",
                              overflowWrap: "anywhere",
                            }}
                          >
                            Caja asignada:{" "}
                          </Typography>

                          <Typography
                            sx={{
                              fontFamily: "fontFamily.primary",
                              textTransform: "uppercase",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {assignedRegister
                              ? `${assignedRegister.name} · ${assignedRegister.code}`
                              : device.cashRegisterId
                                ? `No disponible (${device.cashRegisterId})`
                                : "Sin asignar"}
                          </Typography>

                          <Chip
                            size="small"
                            variant="filled"
                            label={
                              assignedRegister
                                ? assignedRegister.isActive
                                  ? "CAJA ACTIVA"
                                  : "CAJA INACTIVA"
                                : "ESTADO NO DISPONIBLE"
                            }
                            color={
                              assignedRegister
                                ? assignedRegister.isActive
                                  ? "success"
                                  : "error"
                                : "warning"
                            }
                            sx={{ fontFamily: "fontFamily.primary" }}
                          />
                        </Stack>

                        <Button
                          size="small"
                          startIcon={<PointOfSaleIcon />}
                          variant="outlined"
                          disabled={busy || !activeRegisters.length}
                          onClick={() => {
                            setError("");
                            openModal("changeCashRegister", device);
                            setAssignedRegisterId(
                              activeRegisters.some(
                                (register) =>
                                  register.id === device.cashRegisterId,
                              )
                                ? device.cashRegisterId
                                : "",
                            );
                          }}
                        >
                          Cambiar caja
                        </Button>
                      </Stack>

                      <Stack direction="column" spacing={1}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="center"
                          spacing={1}
                        >
                          <Typography
                            sx={{
                              fontFamily: "fontFamily.secondary",
                              color: "text.primary",
                              overflowWrap: "anywhere",
                            }}
                          >
                            Terminal Point:
                          </Typography>

                          <Typography
                            sx={{
                              fontFamily: "fontFamily.primary",
                              textTransform: "uppercase",
                              color: device.pointTerminalId
                                ? "text.primary"
                                : "error.main",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {device.pointTerminalId || "SIN CONFIGURAR"}
                          </Typography>
                        </Stack>

                        <Button
                          startIcon={<SettingsIcon />}
                          size="small"
                          color="secondary"
                          disabled={busy}
                          variant="outlined"
                          onClick={() => {
                            openModal("terminalPoint", device);
                            setPointTerminalId(device.pointTerminalId || "");
                          }}
                        >
                          Configurar terminal Point
                        </Button>
                      </Stack>
                    </Box>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr",
                        gap: 2,
                      }}
                    >
                      <Button
                        color="success"
                        variant="contained"
                        disabled={busy}
                        onClick={() =>
                          openModal("newlinkUnlinkTotem", {
                            device,
                            action: "PAIR",
                          })
                        }
                        sx={{ fontFamily: "fontFamily.primary" }}
                      >
                        Generar nueva vinculación del tótem
                      </Button>

                      <Button
                        variant="contained"
                        color="error"
                        disabled={busy || device.status === "DISABLED"}
                        onClick={() =>
                          openModal("newlinkUnlinkTotem", {
                            device,
                            action: "DISABLE",
                          })
                        }
                        sx={{ fontFamily: "fontFamily.primary" }}
                      >
                        Desvincular tótem
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              );
            })}
          </Box>
        </Stack>
      </Box>

      <ModalLinkTotem
        open={Boolean(pairing)}
        onClose={() => closeModal("linkTotem")}
        pairing={pairing}
      />

      <ModalNewlinkUnlinkTotem
        open={Boolean(confirmation)}
        onClose={() => closeModal("newlinkUnlinkTotem")}
        confirmation={confirmation}
        error={error}
        onSave={() => {
          const selected = confirmation;
          runOperation(() =>
            changeTotemAccessService(selected.device.id, selected.action),
          );
        }}
        busy={busy}
      />

      <ModalTotemTerminalPoint
        open={Boolean(pointDevice)}
        onClose={() => {
          closeModal("terminalPoint");
        }}
        pointDevice={pointDevice}
        pointTerminalId={pointTerminalId}
        setPointTerminalId={setPointTerminalId}
        onSave={() =>
          runOperation(async () => {
            const result = await configureTotemPointService(
              pointDevice.id,
              pointTerminalId.trim(),
            );
            return result;
          })
        }
        busy={busy}
        error={error}
      />

      <ModalTotemChangeCashRegister
        open={Boolean(registerDevice)}
        onClose={() => {
          closeModal("changeCashRegister");
        }}
        registerDevice={registerDevice}
        assignedRegisterId={assignedRegisterId}
        onRegisterChange={setAssignedRegisterId}
        activeRegisters={activeRegisters}
        onSave={() =>
          runOperation(async () => {
            const result = await configureTotemCashRegisterService(
              registerDevice.id,
              assignedRegisterId,
            );
            return result;
          })
        }
        busy={busy}
        error={error}
      />
    </ThemeProvider>
  );
};
