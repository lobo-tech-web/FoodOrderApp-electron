import { useState } from 'react';

// ---- Material UI ----
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';

// Icons
import {
  Add as AddIcon,
  EditNote as EditNoteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
// ---------------------

// ---- Components ----
import { ModalCreateOrder } from '@/components/PanelComponents/ModalCreateOrder/ModalCreateOrder.jsx';
import { ModalEditArrayOrders } from '@/components/PanelComponents/ModalEditArrayOrders/ModalEditArrayOrders.jsx';
// --------------------

// ---- Utils ----
import { ORDER_STATUS, hasOrderPermission } from '@/utils/orderEditRules.js';
// ---------------

// ---- STYLES ----
const buttonStyle = {
  bgcolor: 'primary.main',
  color: 'text.terciary',
  fontFamily: 'fontFamily.terciary',
  borderRadius: '8px',
  px: 3,
  py: 1,
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    bgcolor: 'background.paper',
    color: 'primary.main',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  },
};
// ----------------

export const StaffOrderActionsBar = ({
  user,
  cashSession,
  selectedOrders,
  loading,
  onRefresh,
  setAutoRefreshEnabled,
  showAlert,
}) => {
  const [modalState, setModalState] = useState({
    createOrder: false,
    editArrayOrders: false,
  });

  const toggleModal = (modal, value) => {
    setModalState((prevState) => ({ ...prevState, [modal]: value }));
  };

  const isCashOpen = cashSession?.id && cashSession?.status === 'OPEN';
  const canCreate = hasOrderPermission(user, 'create');
  const canUpdateStatus = hasOrderPermission(user, 'updateStatus');

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          mb: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', md: 'center' }}
          spacing={1.5}
        >
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={onRefresh}
              disabled={loading}
              sx={{ fontFamily: 'fontFamily.primary' }}
            >
              Actualizar
            </Button>
            <Box>
              <Typography
                sx={{
                  fontFamily: 'fontFamily.primary',
                  fontWeight: 'bold',
                }}
              >
                GESTIÓN DE PEDIDOS
              </Typography>

              <Typography
                sx={{
                  fontFamily: 'fontFamily.secondary',
                  color: 'text.secondary',
                  fontSize: 13,
                }}
              >
                {selectedOrders.length > 0
                  ? `${selectedOrders.length} pedido(s) seleccionado(s)`
                  : 'Seleccioná pedidos desde la tabla para modificarlos juntos.'}
              </Typography>
            </Box>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              disabled={!isCashOpen || !canCreate}
              onClick={() => {
                toggleModal('createOrder', true);
                setAutoRefreshEnabled(false);
              }}
              sx={{ ...buttonStyle, bgcolor: 'success.main' }}
            >
              Nuevo pedido
            </Button>

            <Button
              variant="outlined"
              startIcon={<EditNoteIcon />}
              disabled={
                !isCashOpen || !canUpdateStatus || !selectedOrders.length
              }
              onClick={() => {
                toggleModal('editArrayOrders', true);
                setAutoRefreshEnabled(false);
              }}
              sx={buttonStyle}
            >
              Modificar seleccionados
            </Button>
          </Stack>
        </Stack>

        {!isCashOpen && (
          <Alert severity="warning" sx={{ mt: 1.5 }}>
            La caja está cerrada. Podés consultar pedidos, pero no crear ni
            modificar pedidos hasta que se abra una caja.
          </Alert>
        )}
      </Paper>

      {/* CREAR PEDIDO */}
      {modalState.createOrder && (
        <ModalCreateOrder
          show={modalState.createOrder}
          onClose={() => {
            toggleModal('createOrder', false);
            setAutoRefreshEnabled(true);
          }}
          showAlert={showAlert}
          refreshOrders={onRefresh}
        />
      )}

      {/* EDITAR ARRAY DE PEDIDOS */}
      {modalState.editArrayOrders && (
        <ModalEditArrayOrders
          show={modalState.editArrayOrders}
          handleClose={() => {
            toggleModal('editArrayOrders', false);
            setAutoRefreshEnabled(true);
          }}
          showAlert={showAlert}
          showOrders={selectedOrders}
          refreshOrders={onRefresh}
        />
      )}
    </>
  );
};
