import { useState, useEffect, useMemo, useCallback, useRef } from "react";

// ---- Material UI ----
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
// Icons
import {
  MonetizationOn as MonetizationOnIcon,
  PointOfSale as PointOfSaleIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
// --------------------

// ---- Components ----
import { ModalOpenCashRegister } from "@/components/PanelComponents/ModalOpenCashRegister/ModalOpenCashRegister.jsx";
// --------------------

// ---- Services ----
import {
  getOpenCashSessionService,
  openCashRegisterSessionService,
} from "@/services/cashRegister.js";
// ------------------

// ---- Utils ----
import { formatMoney, hasPermission } from "@/utils/cashRegisterUtils.js";
// ---------------

export const CashRegisterGate = ({ user, showAlert, onCashSessionChange }) => {
  const [cashSession, setCashSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const showAlertRef = useRef(showAlert);
  const onCashSessionChangeRef = useRef(onCashSessionChange);
  const requestInFlightRef = useRef(false);

  useEffect(() => {
    showAlertRef.current = showAlert;
  }, [showAlert]);

  useEffect(() => {
    onCashSessionChangeRef.current = onCashSessionChange;
  }, [onCashSessionChange]);

  const restaurantId = useMemo(() => {
    if (user?.role === "staff") return user.restaurantId;
    return user?.id;
  }, [user?.id, user?.restaurantId, user?.role]);

  const canOpenCash = useMemo(() => {
    return hasPermission(user, "cashRegister", "open");
  }, [user]);

  const isKitchen = user?.staffRole === "kitchen";

  const fetchOpenCashSession = useCallback(async () => {
    if (!restaurantId || isKitchen) return;
    if (requestInFlightRef.current) return;

    requestInFlightRef.current = true;
    setLoading(true);

    try {
      const response = await getOpenCashSessionService({
        restaurantId,
        registerCode: "MAIN",
      });

      setCashSession(response || null);
      onCashSessionChangeRef.current?.(response || null);
    } catch (error) {
      showAlertRef.current?.(
        error?.message || "Error al obtener caja abierta",
        "error",
      );
    } finally {
      requestInFlightRef.current = false;
      setLoading(false);
    }
  }, [restaurantId, isKitchen]);

  useEffect(() => {
    fetchOpenCashSession();
  }, [fetchOpenCashSession]);

  const handleOpenCash = async (data) => {
    setSaving(true);

    try {
      const response = await openCashRegisterSessionService({
        ...data,
        restaurantId,
      });

      setCashSession(response);
      onCashSessionChangeRef.current?.(response);

      showAlertRef.current?.("Caja abierta correctamente", "success");
      setOpenModal(false);
    } catch (error) {
      showAlertRef.current?.(error?.message || "Error al abrir caja", "error");
    } finally {
      setSaving(false);
    }
  };

  if (isKitchen) {
    return null;
  }

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
          <Typography>Verificando caja abierta...</Typography>
        </Stack>
      </Paper>
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
          borderColor: cashSession ? "success.main" : "warning.main",
          bgcolor: cashSession ? "success.main" : "warning.main",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <MonetizationOnIcon />

            <Box>
              <Typography sx={{ fontFamily: "fontFamily.primary" }}>
                {cashSession ? "CAJA ABIERTA" : "NO HAY CAJA ABIERTA"}
              </Typography>

              <Typography
                sx={{
                  fontFamily: "fontFamily.secondary",
                  fontSize: 14,
                }}
              >
                {cashSession
                  ? `${cashSession.registerName} · Monto inicial ${formatMoney(
                      cashSession.openingAmount,
                    )}`
                  : user?.role === "admin"
                    ? "Podés abrir caja para registrar ventas y cierre."
                    : "Para registrar ventas del local, abrí una caja."}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={fetchOpenCashSession}
              sx={{ fontFamily: "fontFamily.primary" }}
            >
              Actualizar
            </Button>

            {!cashSession && canOpenCash && (
              <Button
                variant="contained"
                startIcon={<PointOfSaleIcon />}
                onClick={() => setOpenModal(true)}
                sx={{ fontFamily: "fontFamily.primary" }}
              >
                Abrir caja
              </Button>
            )}
          </Stack>
        </Stack>

        {!cashSession && !canOpenCash && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Tu usuario no tiene permisos para abrir caja. Consultá con el
            administrador del local.
          </Alert>
        )}
      </Paper>

      <ModalOpenCashRegister
        open={openModal}
        saving={saving}
        onClose={() => setOpenModal(false)}
        onSubmit={handleOpenCash}
      />
    </>
  );
};
