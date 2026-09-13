import { useState, useEffect, useMemo, useCallback, useRef } from "react";

// ---- Material UI ----
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
// Icons
import {
  PointOfSale as PointOfSaleIcon,
  Refresh as RefreshIcon,
  Storefront as StorefrontIcon,
} from "@mui/icons-material";
// --------------------

// ---- Components ----
import { ModalOpenCashRegister } from "@/components/PanelComponents/ModalOpenCashRegister/ModalOpenCashRegister.jsx";
// --------------------

// ---- Services ----
import {
  getCashRegistersService,
  getOpenCashSessionService,
  openCashRegisterSessionService,
} from "@/services/cashRegister.js";
// ------------------

// ---- Utils ----
import {
  formatMoney,
  hasPermission,
  getStoredCashRegisterId,
  setStoredCashRegisterId,
} from "@/utils/cashRegisterUtils.js";
// ---------------

export const CashRegisterGate = ({
  user,
  cashSession,
  selectedCashRegisterId,
  onCashRegisterChange,
  onCashSessionChange,
  showPrompt = true,
  showAlert,
  refreshKey = 0,
  variant = "full",
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const isCompact = variant === "compact";

  const requestInFlightRef = useRef(false);
  const onCashRegisterChangeRef = useRef(onCashRegisterChange);
  const onCashSessionChangeRef = useRef(onCashSessionChange);
  const showAlertRef = useRef(showAlert);

  const [openModal, setOpenModal] = useState(false);
  const [cashRegisters, setCashRegisters] = useState([]);
  const [openSessionsByRegister, setOpenSessionsByRegister] = useState({});

  const restaurantId = useMemo(() => {
    if (user?.role === "staff") return user.restaurantId;
    return user?.id;
  }, [user?.id, user?.restaurantId, user?.role]);

  const canOpenCash = useMemo(() => {
    return hasPermission(user, "cashRegister", "open");
  }, [user]);

  const isKitchen = user?.staffRole === "kitchen";

  const selectedCashRegister = useMemo(() => {
    return (
      cashRegisters.find(
        (register) => register.id === selectedCashRegisterId,
      ) || null
    );
  }, [cashRegisters, selectedCashRegisterId]);

  const loadCashWorkspace = useCallback(async () => {
    if (!restaurantId) return;

    if (requestInFlightRef.current) return;
    requestInFlightRef.current = true;

    setLoading(true);

    try {
      const registersResponse = await getCashRegistersService({
        restaurantId,
        includeInactive: false,
      });

      const registers = Array.isArray(registersResponse)
        ? registersResponse
        : [];

      setCashRegisters(registers);

      const sessionEntries = await Promise.all(
        registers.map(async (register) => {
          const session = await getOpenCashSessionService({
            restaurantId,
            cashRegisterId: register.id,
          });
          return [register.id, session || null];
        }),
      );

      const sessionsMap = Object.fromEntries(sessionEntries);
      setOpenSessionsByRegister(sessionsMap);

      const currentRegister = registers.find(
        (register) => register.id === selectedCashRegisterId,
      );

      const storedId = getStoredCashRegisterId({
        user,
        restaurantId,
      });

      const storedRegister = registers.find(
        (register) => register.id === storedId,
      );

      const defaultRegister = registers.find(
        (register) => register.isDefault === true,
      );

      const finalRegister =
        storedRegister ||
        currentRegister ||
        defaultRegister ||
        registers[0] ||
        null;

      const finalRegisterId = finalRegister?.id || null;

      if (finalRegisterId) {
        setStoredCashRegisterId({
          user,
          restaurantId,
          cashRegisterId: finalRegisterId,
        });
      }

      onCashRegisterChangeRef.current?.(finalRegisterId, finalRegister);
      onCashSessionChangeRef.current?.(
        finalRegisterId ? sessionsMap[finalRegisterId] || null : null,
      );
    } catch (error) {
      showAlertRef.current?.(
        error?.message || "Error al obtener las cajas del local",
        "error",
      );
    } finally {
      requestInFlightRef.current = false;
      setLoading(false);
    }
  }, [restaurantId, selectedCashRegisterId, user]);

  const handleSelectRegister = (cashRegisterId) => {
    const register = cashRegisters.find((item) => item.id === cashRegisterId);

    if (!register) return;

    setStoredCashRegisterId({
      user,
      restaurantId,
      cashRegisterId,
    });

    onCashRegisterChangeRef.current?.(cashRegisterId, register);
    onCashSessionChangeRef.current?.(
      openSessionsByRegister[cashRegisterId] || null,
    );
  };

  useEffect(() => {
    loadCashWorkspace();
  }, [loadCashWorkspace, refreshKey]);

  const handleOpenCash = async (data) => {
    if (!selectedCashRegister?.id) {
      showAlertRef.current?.("Seleccioná una caja", "warning");
      return;
    }

    setSaving(true);

    try {
      const response = await openCashRegisterSessionService({
        ...data,
        restaurantId,
        cashRegisterId: selectedCashRegister.id,
      });

      setOpenSessionsByRegister((prev) => ({
        ...prev,
        [selectedCashRegister.id]: response,
      }));

      onCashSessionChangeRef.current?.(response);
      showAlertRef.current?.(
        `${response?.registerName || selectedCashRegister.name} abierta correctamente!`,
        "success",
      );
      setOpenModal(false);
    } catch (error) {
      showAlertRef.current?.(error?.message || "Error al abrir caja", "error");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    onCashRegisterChangeRef.current = onCashRegisterChange;
  }, [onCashRegisterChange]);

  useEffect(() => {
    onCashSessionChangeRef.current = onCashSessionChange;
  }, [onCashSessionChange]);

  useEffect(() => {
    showAlertRef.current = showAlert;
  }, [showAlert]);

  if (!showPrompt || isKitchen) return null;

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={20} />
          <Typography>Cargando cajas...</Typography>
        </Stack>
      </Paper>
    );
  }

  if (cashRegisters.length === 0) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        El local no posee cajas activas.
      </Alert>
    );
  }

  const selectedIsOpen = Boolean(
    cashSession?.id && cashSession?.status === "OPEN",
  );

  const cashRegisterSelect = (
    <FormControl
      size="small"
      sx={{
        minWidth: { xs: "100%", sm: isCompact ? 260 : 320 },
        width: { xs: "100%", sm: isCompact ? 280 : "100%" },
      }}
    >
      <InputLabel
        sx={{ fontFamily: "fontFamily.primary", color: "primary.main" }}
      >
        CAJA OPERATIVA
      </InputLabel>

      <Select
        value={selectedCashRegisterId || ""}
        label="Caja operativa"
        onChange={(event) => handleSelectRegister(event.target.value)}
        sx={{ fontFamily: "fontFamily.primary" }}
      >
        {cashRegisters.map((register) => {
          const session = openSessionsByRegister[register.id];
          const isOpen = session?.status === "OPEN";
          return (
            <MenuItem key={register.id} value={register.id}>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                justifyContent="space-between"
                width="100%"
              >
                <Box>
                  <Typography
                    sx={{
                      fontFamily: "fontFamily.primary",
                      fontSize: 13,
                      textTransform: "uppercase",
                    }}
                  >
                    {register.name}
                  </Typography>

                  <Typography
                    sx={{
                      fontFamily: "fontFamily.secondary",
                      fontSize: 10,
                      color: "text.secondary",
                    }}
                  >
                    {register.code}
                    {register.isDefault ? " · PREDETERMINADA" : ""}
                  </Typography>
                </Box>

                <Chip
                  size="small"
                  color={isOpen ? "success" : "error"}
                  variant="outlined"
                  label={isOpen ? "ABIERTA" : "CERRADA"}
                  sx={{
                    fontFamily: "fontFamily.primary",
                    fontSize: 10,
                  }}
                />
              </Stack>
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );

  if (isCompact) {
    return (
      <>
        <Paper
          elevation={0}
          sx={{
            px: 1.5,
            py: 1,
            mb: 1.5,
            borderRadius: 2,
            border: "1px solid",
            borderColor: selectedIsOpen ? "success.main" : "divider",
            bgcolor: "background.paper",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
          >
            {/* IZQUIERDA */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "stretch", sm: "center" }}
              sx={{ flexGrow: 1 }}
            >
              <Stack
                direction="row"
                spacing={0.75}
                alignItems="center"
                sx={{ minWidth: "max-content" }}
              >
                <PointOfSaleIcon color="primary" fontSize="small" />

                <Typography
                  sx={{
                    fontFamily: "fontFamily.primary",
                    fontSize: 16,
                    color: "text.primary",
                    display: { xs: "block", md: "none", lg: "block" },
                  }}
                >
                  CAJA
                </Typography>
              </Stack>
              {cashRegisterSelect}
            </Stack>

            {/* DERECHA */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent={{ xs: "space-between", sm: "flex-end" }}
              sx={{ flexShrink: 0 }}
            >
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Chip
                  size="small"
                  color={selectedIsOpen ? "success" : "error"}
                  variant={selectedIsOpen ? "filled" : "outlined"}
                  label={selectedIsOpen ? "ABIERTA" : "CERRADA"}
                  sx={{
                    fontFamily: "fontFamily.primary",
                    fontSize: 12,
                  }}
                />

                {selectedIsOpen && (
                  <Typography
                    sx={{
                      display: { xs: "none", md: "block" },
                      fontFamily: "fontFamily.secondary",
                      fontSize: 11,
                      color: "text.primary",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Inicial: {formatMoney(cashSession?.openingAmount)}
                  </Typography>
                )}
              </Box>

              {!selectedIsOpen && canOpenCash && (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<PointOfSaleIcon fontSize="small" />}
                  onClick={() => setOpenModal(true)}
                  sx={{
                    fontFamily: "fontFamily.primary",
                    fontSize: 12,
                    whiteSpace: "nowrap",
                  }}
                >
                  ABRIR CAJA
                </Button>
              )}

              <Tooltip title="Actualizar cajas">
                <IconButton
                  size="small"
                  onClick={loadCashWorkspace}
                  sx={{
                    border: "1px solid",
                    borderColor: "primary.main",
                  }}
                >
                  <RefreshIcon color="inherit" fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Paper>

        <ModalOpenCashRegister
          open={openModal}
          saving={saving}
          cashRegister={selectedCashRegister}
          onClose={() => setOpenModal(false)}
          onSubmit={handleOpenCash}
        />
      </>
    );
  }

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 3,
          border: "1px solid",
          borderColor: selectedIsOpen ? "success.main" : "primary.main",
          bgcolor: "background.paper",
        }}
      >
        <Stack spacing={2}>
          <Stack
            spacing={2}
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <StorefrontIcon color="primary" />

              <Box>
                <Typography
                  sx={{ fontFamily: "fontFamily.primary", fontSize: 16 }}
                >
                  CAJA OPERATIVA
                </Typography>

                <Typography
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    fontSize: 14,
                  }}
                >
                  Seleccioná la caja que utilizará esta operación.
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadCashWorkspace}
              sx={{ fontFamily: "fontFamily.primary" }}
            >
              Actualizar
            </Button>
          </Stack>

          <FormControl fullWidth size="small">
            <InputLabel
              sx={{ fontFamily: "fontFamily.primary", color: "primary.main" }}
            >
              CAJA OPERATIVA
            </InputLabel>

            <Select
              value={selectedCashRegisterId || ""}
              label="Caja operativa"
              onChange={(event) => handleSelectRegister(event.target.value)}
              sx={{ fontFamily: "fontFamily.primary" }}
            >
              {cashRegisters.map((register) => {
                const session = openSessionsByRegister[register.id];
                const isOpen = session?.status === "OPEN";
                return (
                  <MenuItem key={register.id} value={register.id}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={2}
                      width="100%"
                    >
                      <Box>
                        <Typography
                          sx={{
                            fontFamily: "fontFamily.primary",
                            textTransform: "uppercase",
                          }}
                        >
                          {register.name}
                        </Typography>

                        <Typography
                          sx={{
                            fontFamily: "fontFamily.secondary",
                            fontSize: 10,
                            color: "text.secondary",
                          }}
                        >
                          {register.code}
                          {register.isDefault ? " · PREDETERMINADA" : ""}
                        </Typography>
                      </Box>

                      <Chip
                        size="small"
                        color={isOpen ? "success" : "error"}
                        variant="outlined"
                        label={isOpen ? "ABIERTA" : "CERRADA"}
                        sx={{ fontFamily: "fontFamily.primary" }}
                      />
                    </Stack>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {selectedCashRegister && (
            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1}
              alignItems={{
                xs: "stretch",
                sm: "center",
              }}
              justifyContent="space-between"
            >
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PointOfSaleIcon
                    color={selectedIsOpen ? "success" : "disabled"}
                  />

                  <Typography
                    sx={{
                      fontFamily: "fontFamily.primary",
                      textTransform: "uppercase",
                    }}
                  >
                    {selectedCashRegister.name}
                  </Typography>

                  <Chip
                    size="small"
                    color={selectedIsOpen ? "success" : "error"}
                    label={selectedIsOpen ? "ABIERTA" : "CERRADA"}
                    sx={{ fontFamily: "fontFamily.primary" }}
                  />
                </Stack>
                {selectedIsOpen && (
                  <Typography
                    sx={{
                      mt: 0.5,
                      fontFamily: "fontFamily.secondary",
                      fontSize: 13,
                      color: "text.secondary",
                    }}
                  >
                    Monto inicial: {formatMoney(cashSession.openingAmount)}
                  </Typography>
                )}
              </Box>
              {!selectedIsOpen && canOpenCash && (
                <Button
                  variant="contained"
                  startIcon={<PointOfSaleIcon />}
                  onClick={() => setOpenModal(true)}
                  sx={{
                    fontFamily: "fontFamily.primary",
                  }}
                >
                  Abrir caja
                </Button>
              )}
            </Stack>
          )}

          {selectedCashRegister && !selectedIsOpen && !canOpenCash && (
            <Alert severity="warning" variant="outlined">
              La caja seleccionada está cerrada y tu usuario no posee permisos
              para abrirla.
            </Alert>
          )}
        </Stack>
      </Paper>

      <ModalOpenCashRegister
        open={openModal}
        saving={saving}
        cashRegister={selectedCashRegister}
        onClose={() => setOpenModal(false)}
        onSubmit={handleOpenCash}
      />
    </>
  );
};
