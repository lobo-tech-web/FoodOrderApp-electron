import { useState, useEffect, useCallback, useMemo } from "react";

// ---- MATERIAL UI ----
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
// ICONS
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Pending as PendingIcon,
  FactCheck as FactCheckIcon,
  DeliveryDining as DeliveryDiningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  Moped as MopedIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Components ----
import { SelectOptionCard } from "./shared/SelectOptionCard.jsx";
// --------------------

// ---- CONTEXT ----
import { useOrders } from "@/context/Orders.jsx";
import { useUser } from "@/context/Users.jsx";
// -----------------

// ---- SERVICES ----
import { updateArrayOrderServices } from "@/services/orders.js";
// ------------------

// ---- Utils ----
import {
  ORDER_STATUS,
  getAllowedOrderStatuses,
  hasOrderPermission,
} from "@/utils/orderEditRules.js";
// ---------------

// ---- STYLES ----
const fieldStyles = {
  "& .MuiInputBase-root": {
    fontFamily: "fontFamily.primary",
    fontSize: { xs: "14px", sm: "16px", md: "16px" },
    minHeight: { xs: "48px", sm: "56px", md: "56px" },
    color: "text.primary",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: { xs: "8px", sm: "12px" },
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "rgba(184, 182, 186, 0.3)",
      borderWidth: "1px",
    },
    "&:hover fieldset": {
      borderColor: "primary.main",
      borderWidth: "1px",
    },
    "&.Mui-focused fieldset": {
      borderColor: "primary.main",
      borderWidth: "2px",
      boxShadow: "0 0 0 3px rgba(245, 166, 35, 0.2)",
    },
  },
  width: "100%",
  marginBottom: { xs: "16px", sm: "20px", md: "20px" },
};

const labelStyle = {
  fontFamily: "fontFamily.primary",
  color: "primary.main",
  fontWeight: "bold",
  fontSize: { xs: "14px", sm: "16px", md: "16px" },
  lineHeight: 1,
  margin: 0,
};

const labelContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: { xs: 1, sm: 1.5, md: 1.5 },
  mb: { xs: 1, sm: 1.5, md: 1 },
};
// ----------------

const statusDisplay = [
  {
    value: "PENDIENTE A CONFIRMAR",
    label: "PENDIENTE",
    description: "El pedido todavía necesita confirmación.",
    color: "#ff9800",
    icon: <PendingIcon />,
  },
  {
    value: "EN PREPARACIÓN",
    label: "EN PREPARACIÓN",
    description: "El pedido ya está siendo preparado.",
    color: "#2196f3",
    icon: <FactCheckIcon />,
  },
  {
    value: "EN ENVIO",
    label: "EN ENVÍO",
    description: "El pedido está asignado para entrega.",
    color: "#9c27b0",
    icon: <DeliveryDiningIcon />,
  },
  {
    value: "FINALIZADO",
    label: "FINALIZADO",
    description: "El pedido ya fue entregado o cerrado.",
    color: "#4caf50",
    icon: <CheckCircleIcon />,
  },
  {
    value: "CANCELADO",
    label: "CANCELADO",
    description: "El pedido no será completado.",
    color: "#f44336",
    icon: <CancelIcon />,
  },
];

export const ModalEditArrayOrders = ({
  show,
  handleClose,
  showAlert,
  showOrders = [],
  refreshOrders,
  cashSession = null,
}) => {
  const theme = useTheme();
  const isXsScreen = useMediaQuery(theme.breakpoints.down("xs"));

  const [loading, setLoading] = useState(false);
  const [extraPoints, setExtraPoints] = useState("");
  const [status, setStatus] = useState("");
  const [rider, setRider] = useState(undefined);
  const [cancelReason, setCancelReason] = useState("");

  const { orderState, getRidersByRestaurant } = useOrders();
  const { userState } = useUser();

  const currentUser = userState.user;

  const isPrivilegedUser =
    currentUser?.role === "admin" || currentUser?.role === "dev";

  const isStaff = currentUser?.role === "staff";

  const isCashOpen =
    !isStaff || (cashSession?.id && cashSession?.status === "OPEN");

  const canEdit = hasOrderPermission(currentUser, "edit");

  const canUpdateStatus = hasOrderPermission(currentUser, "updateStatus");

  const canCancel = hasOrderPermission(currentUser, "cancel");

  const canEditBulkData = isPrivilegedUser || (isCashOpen && canEdit);

  const restaurantId = useMemo(() => {
    if (userState.user?.role === "staff") {
      return userState.user.restaurantId;
    }

    return userState.user?.id;
  }, [userState.user?.id, userState.user?.restaurantId, userState.user?.role]);

  const availableRiders = useMemo(
    () => orderState?.riders || [],
    [orderState?.riders],
  );

  const availableBulkStatuses = useMemo(() => {
    if (!showOrders.length) {
      return [];
    }

    const allowedStatusSets = showOrders.map(
      (order) =>
        new Set(
          getAllowedOrderStatuses({
            originalStatus: order.status,

            canCancel,

            allowAllStatuses: isPrivilegedUser,
          }),
        ),
    );

    return statusDisplay.filter((statusItem) =>
      allowedStatusSets.every((allowedStatuses) =>
        allowedStatuses.has(statusItem.value),
      ),
    );
  }, [showOrders, canCancel, isPrivilegedUser]);

  const handlePointsChange = (e) => {
    // Solo permitir números positivos
    const value = e.target.value;
    if (value === "" || /^[0-9]+$/.test(value)) {
      setExtraPoints(value);
    }
  };

  const handleSaveChanges = useCallback(async () => {
    if (!showOrders || showOrders.length === 0)
      return showAlert(
        "No hay pedidos para actualizar, por favor seleccione los pedidos para actualizar",
        "warning",
      );
    if (!status)
      return showAlert(
        "Debe seleccionar un estado de orden para el pedido",
        "warning",
      );

    if (status === "CANCELADO" && !cancelReason.trim()) {
      return showAlert("Debes indicar el motivo de cancelación", "warning");
    }

    setLoading(true);
    try {
      const ordersData = {
        orderList: showOrders.map((order) => ({ id: order.id })),
        ...(status === ORDER_STATUS.FINISHED &&
          extraPoints !== "" && {
            extraPoints: Number(extraPoints),
          }),
        status,
        ...(rider !== undefined && { riderId: rider }),
        ...(status === "CANCELADO" && {
          cancelReason: cancelReason.trim(),
        }),
        registerCode: "MAIN",
      };

      await updateArrayOrderServices(ordersData);
      showAlert("Pedido/s actualizado/s Correctamente!", "success");
      handleClose();
    } catch (error) {
      const errorMessage =
        typeof error === "string"
          ? error
          : error?.message ||
            error?.response?.data?.message ||
            "Error al actualizar los pedidos";
      showAlert(errorMessage, "error");
    } finally {
      setLoading(false);
      setTimeout(async () => {
        await refreshOrders?.();
      }, 1500);
    }
  }, [
    status,
    extraPoints,
    rider,
    cancelReason,
    refreshOrders,
    showOrders,
    showAlert,
    handleClose,
  ]);

  useEffect(() => {
    if (!show) return;
    const fetchRiders = async () => {
      try {
        await getRidersByRestaurant(restaurantId);
      } catch (error) {
        console.error(error.message || error);
      }
    };

    fetchRiders();
    setExtraPoints("");
    setStatus("");
    setRider(undefined);
    setCancelReason("");
  }, [show, getRidersByRestaurant, restaurantId]);

  return (
    <Dialog
      open={show}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isXsScreen}
      PaperProps={{
        elevation: 3,
        sx: {
          borderRadius: 2,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: "fontFamily.terciary",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 3,
          py: 2,
          bgcolor: "background.main",
          color: "primary.main",
          borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
        }}
      >
        <Box sx={{ display: "flex", gap: 1 }}>
          <EditIcon color="primary" />
          <Typography
            variant="h5"
            component="span"
            sx={{ display: "flex", justifyContent: "flex-start" }}
          >
            EDITAR PEDIDOS
          </Typography>
          <Chip
            label={`${showOrders.length} ${
              showOrders.length === 1 ? "PEDIDO" : "PEDIDOS"
            }`}
            color="primary"
            size="medium"
            sx={{ ml: 1 }}
          />
        </Box>
        <Tooltip title="Cerrar">
          <IconButton onClick={handleClose}>
            <CloseIcon color="primary" />
          </IconButton>
        </Tooltip>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          maxHeight: { xs: "calc(100vh - 160px)", sm: "72vh" },
          overflowY: "auto",
          p: { xs: 1.5, sm: 2.5, md: 3 },
        }}
      >
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <>
            <Typography
              variant="h6"
              sx={{
                fontFamily: "fontFamily.terciary",
                textAlign: "center",
                mb: 2,
                color: "text.primary",
              }}
            >
              PEDIDOS SELECCIONADOS
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: "background.paper",
                borderRadius: 2,
                display: "flex",
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              {/* ID DE LOS PEDIDOS */}
              {showOrders.map((order) => (
                <Chip
                  key={order.id}
                  label={`PEDIDO-ID ${order.id}`}
                  variant="outlined"
                  sx={{
                    fontFamily: "fontFamily.terciary",
                    color: "primary.main",
                    borderColor: "text.primary",
                    fontSize: "1rem",
                    textAlign: "center",
                    mt: 1,
                    mb: 1,
                  }}
                />
              ))}
            </Paper>

            <Divider sx={{ bgcolor: "primary.main", my: 3 }} />

            <Typography
              variant="subtitle1"
              sx={{
                fontFamily: "fontFamily.terciary",
                mb: 2,
                color: "text.primary",
                fontWeight: "bold",
              }}
            >
              ACTUALIZAR INFORMACIÓN
            </Typography>

            {/* STATUS DEL PEDIDO */}
            <Box sx={{ mb: { xs: 2.5, sm: 3 } }}>
              <Box sx={labelContainerStyle}>
                <Typography sx={labelStyle}>ESTADO DEL PEDIDO</Typography>
              </Box>

              <Typography
                sx={{
                  fontFamily: "fontFamily.secondary",
                  color: "text.primary",
                  fontSize: { xs: 12, sm: 13 },
                  mb: 1.2,
                }}
              >
                Tocá una opción para aplicar el mismo estado a todos los pedidos
                seleccionados.
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                  },
                  gap: { xs: 1, sm: 1.2 },
                }}
              >
                {availableBulkStatuses.map((item) => (
                  <SelectOptionCard
                    key={item.value}
                    selected={status === item.value}
                    icon={item.icon}
                    title={item.label}
                    description={item.description}
                    color={item.color}
                    onClick={() => setStatus(item.value)}
                  />
                ))}
              </Box>
            </Box>

            {/* PUNTOS EXTRAS */}
            {canEditBulkData && status === ORDER_STATUS.FINISHED && (
              <Box>
                <Box sx={labelContainerStyle}>
                  <Typography sx={labelStyle}>PUNTOS EXTRAS</Typography>
                </Box>
                <TextField
                  fullWidth
                  type="text"
                  name="extraPoints"
                  value={extraPoints || 0}
                  placeholder="Sin puntos extras"
                  onChange={handlePointsChange}
                  sx={fieldStyles}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AddCircleOutlineIcon sx={{ color: "success.main" }} />
                      </InputAdornment>
                    ),
                    inputProps: { min: 0 },
                  }}
                />
              </Box>
            )}

            {status === "CANCELADO" && (
              <Box sx={{ mt: 2 }}>
                <Box sx={labelContainerStyle}>
                  <Typography sx={labelStyle}>MOTIVO DE CANCELACIÓN</Typography>
                </Box>

                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  value={cancelReason}
                  onChange={(event) => setCancelReason(event.target.value)}
                  placeholder="Ej: el cliente solicitó cancelar los pedidos"
                  sx={fieldStyles}
                />
              </Box>
            )}

            {canEditBulkData && availableRiders.length > 0 && (
              <Box sx={{ mb: { xs: 2.5, sm: 3 } }}>
                <Box sx={labelContainerStyle}>
                  <Typography sx={labelStyle}>
                    ASIGNAR RIDER (CADETE)
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    color: "text.primary",
                    fontSize: { xs: 12, sm: 13 },
                    mb: 1.2,
                  }}
                >
                  Podés asignar un cadete a todos los pedidos seleccionados o
                  dejarlo sin cambios.
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                    },
                    gap: { xs: 1, sm: 1.2 },
                  }}
                >
                  <SelectOptionCard
                    selected={rider === undefined}
                    icon={<MopedIcon />}
                    title="NO CAMBIAR RIDER"
                    description="Mantiene el cadete actual de cada pedido."
                    color="primary.main"
                    onClick={() => setRider(undefined)}
                  />

                  <SelectOptionCard
                    selected={rider === null}
                    icon={<CancelIcon />}
                    title="QUITAR RIDER"
                    description="Desasigna el cadete actual de los pedidos."
                    color="error.main"
                    onClick={() => setRider(null)}
                  />

                  {availableRiders.map((availableRider) => (
                    <SelectOptionCard
                      key={availableRider.id}
                      selected={rider === availableRider.id}
                      icon={<MopedIcon />}
                      title={availableRider.name?.toUpperCase() || "RIDER"}
                      description={
                        availableRider.phone || "Sin teléfono cargado"
                      }
                      color="primary.main"
                      onClick={() => setRider(availableRider.id)}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          justifyContent: "flex-end",
          px: { xs: 1.5, sm: 3 },
          py: { xs: 1.5, sm: 2 },
          borderTop: "1px solid rgba(0, 0, 0, 0.12)",
          gap: 1,
          flexDirection: { xs: "column-reverse", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
        }}
      >
        <Button
          size="medium"
          variant="contained"
          color="error"
          onClick={handleClose}
          disabled={loading}
          sx={{ fontFamily: "fontFamily.primary", minHeight: 44 }}
        >
          Cancelar
        </Button>
        <Button
          size="medium"
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSaveChanges}
          disabled={
            showOrders.length === 0 || loading || !canUpdateStatus || !status
          }
          sx={{
            fontFamily: "fontFamily.primary",
            minHeight: 44,
            minWidth: { xs: "100%", sm: 160 },
          }}
        >
          Guardar Cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
};
