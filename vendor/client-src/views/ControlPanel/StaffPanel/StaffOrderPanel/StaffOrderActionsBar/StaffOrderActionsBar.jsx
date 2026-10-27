import { useEffect, useRef } from "react";

// ---- Material UI ----
import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";
// Icons
import {
  Add as AddIcon,
  EditNote as EditNoteIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Components ----
import { ModalCreateOrder } from "@/components/PanelComponents/ModalCreateOrder/ModalCreateOrder.jsx";
import { ModalEditArrayOrders } from "@/components/PanelComponents/ModalEditArrayOrders/ModalEditArrayOrders.jsx";
import { OrderRealtimeIndicator } from "../../../AdminPanel/OrderPanel/OrderRealtimeIndicator/OrderRealtimeIndicator.jsx";
// --------------------

// ---- Utils ----
import { hasOrderPermission } from "@/utils/orderEditRules.js";
// ---------------

// ---- STYLES ----
const buttonStyle = {
  bgcolor: "primary.main",
  color: "text.terciary",
  fontFamily: "fontFamily.primary",
  borderRadius: "8px",
  px: 3,
  py: 1,
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  "&:hover": {
    bgcolor: "background.paper",
    color: "primary.main",
    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
  },
};
// ----------------

export const StaffOrderActionsBar = ({
  user,
  cashSession,
  cashRegisterId,
  selectedOrders,
  loading,
  onRefresh,
  modalState,
  onModalChange,
  onOrdersUpdated,
  onHeightChange,
  realtime,
  showAlert,
}) => {
  const navbarRef = useRef(null);

  const isCashOpen = Boolean(
    cashRegisterId &&
    cashSession?.id &&
    cashSession.status === "OPEN" &&
    String(cashSession.cashRegisterId) === String(cashRegisterId),
  );
  const canCreate = hasOrderPermission(user, "create");
  const canUpdateStatus = hasOrderPermission(user, "updateStatus");

  useEffect(() => {
    const element = navbarRef.current;
    if (!element) return;
    let active = true;
    const measure = () => {
      if (active) onHeightChange(element.getBoundingClientRect().height);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [onHeightChange]);

  return (
    <>
      <Paper
        ref={navbarRef}
        elevation={0}
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          mb: 2,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={1.5}
          sx={{ p: 1.5 }}
        >
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={onRefresh}
              disabled={loading}
              sx={{ fontFamily: "fontFamily.primary" }}
            >
              Actualizar
            </Button>

            <Box>
              <Typography
                sx={{
                  fontFamily: "fontFamily.primary",
                  fontWeight: "bold",
                }}
              >
                GESTIÓN DE PEDIDOS
              </Typography>

              <Typography
                sx={{
                  fontFamily: "fontFamily.secondary",
                  color: "text.secondary",
                  fontSize: 13,
                }}
              >
                {selectedOrders.length > 0
                  ? `${selectedOrders.length} pedido(s) seleccionado(s)`
                  : "Seleccioná pedidos desde la tabla para modificarlos juntos."}
              </Typography>
            </Box>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              disabled={!isCashOpen || !canCreate}
              onClick={() => onModalChange("createOrder", true)}
              sx={{ ...buttonStyle, bgcolor: "success.main" }}
            >
              Nuevo pedido
            </Button>

            <Button
              variant="outlined"
              startIcon={<EditNoteIcon />}
              disabled={
                !isCashOpen || !canUpdateStatus || !selectedOrders.length
              }
              onClick={() => onModalChange("editArrayOrders", true)}
              sx={buttonStyle}
            >
              Modificar seleccionados
            </Button>
          </Stack>
        </Stack>

        {!isCashOpen && (
          <Alert severity="warning" sx={{ m: 1.5, mt: 0 }}>
            La caja está cerrada. Podés consultar pedidos, pero no crear ni
            modificar pedidos hasta que se abra una caja.
          </Alert>
        )}

        <OrderRealtimeIndicator {...realtime} />
      </Paper>

      {/* CREAR PEDIDO */}
      {modalState.createOrder && (
        <ModalCreateOrder
          show={modalState.createOrder}
          onClose={() => {
            onModalChange("createOrder", false);
          }}
          showAlert={showAlert}
          refreshOrders={onRefresh}
          cashRegisterId={cashRegisterId}
        />
      )}

      {/* EDITAR ARRAY DE PEDIDOS */}
      {modalState.editArrayOrders && (
        <ModalEditArrayOrders
          show={modalState.editArrayOrders}
          handleClose={() => {
            onModalChange("editArrayOrders", false);
          }}
          showAlert={showAlert}
          showOrders={selectedOrders}
          onOrdersUpdated={onOrdersUpdated}
          refreshOrders={onRefresh}
          cashSession={cashSession}
          cashRegisterId={cashRegisterId}
        />
      )}
    </>
  );
};
