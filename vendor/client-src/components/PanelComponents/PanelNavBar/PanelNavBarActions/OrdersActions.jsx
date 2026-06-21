// ---- MATERIAL UI ----
import { Button, Box, Typography } from '@mui/material';
// ---------------------

// ---- COMPONENTS ----
import { RefreshComponent } from '@/components/PanelComponents/RefreshComponent/RefreshComponent.jsx';
import { SearchBox } from '@/components/PanelComponents/SearchBox/SearchBox.jsx';
import { FilterByDateOrders } from '@/components/PanelComponents/Filters/FilterByDateOrders/FilterByDateOrders.jsx';
// import { FilterByStatusOrders } from '@/components/PanelComponents/Filters/FilterByStatusOrders/FilterByStatusOrders.jsx';
// MODALES
import { ModalCreateOrder } from '@/components/PanelComponents/ModalCreateOrder/ModalCreateOrder.jsx';
import { ModalEditArrayOrders } from '@/components/PanelComponents/ModalEditArrayOrders/ModalEditArrayOrders.jsx';
// ICONS
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
// --------------------

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

export const OrdersActions = ({
  refreshOrders,
  modalState,
  toggleModal,
  selectedOrdersCheckbox,
  setAutoRefreshEnabled,
  showAlert,
}) => {
  return (
    <>
      <RefreshComponent isOrderPanel={true} refreshOrders={refreshOrders} />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'fontFamily.terciary',
            color: 'text.primary',
          }}
        >
          NOMBRE / TEL.
        </Typography>
        <SearchBox isOrderPanel={true} placeholder={'Nombre / Teléfono'} />
      </Box>
      <Button
        startIcon={<AddIcon />}
        onClick={() => {
          toggleModal('createOrder', true);
          setAutoRefreshEnabled(false);
        }}
        variant="contained"
        sx={{ ...buttonStyle, bgcolor: 'success.main' }}
      >
        Nuevo Pedido
      </Button>
      <Button
        startIcon={<EditIcon />}
        onClick={() => {
          toggleModal('editArrayOrders', true);
          setAutoRefreshEnabled(false);
        }}
        variant="contained"
        sx={buttonStyle}
      >
        Modificar Pedidos
      </Button>
      <Box
        sx={{
          ml: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: 3,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'fontFamily.terciary',
            color: 'text.primary',
          }}
        >
          FILTROS
        </Typography>
        {/* FILTRO POR ESTADOS */}
        {/* <FilterByStatusOrders />  <-- ELIMINAR */}
        {/* FILTRO POR FECHA */}
        <FilterByDateOrders />
      </Box>
      {/* CREAR PEDIDO */}
      {modalState.createOrder && (
        <ModalCreateOrder
          show={modalState.createOrder}
          onClose={() => {
            toggleModal('createOrder', false);
            setAutoRefreshEnabled(true);
          }}
          showAlert={showAlert}
          refreshOrders={refreshOrders}
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
          showOrders={selectedOrdersCheckbox}
          refreshOrders={refreshOrders}
        />
      )}
    </>
  );
};
