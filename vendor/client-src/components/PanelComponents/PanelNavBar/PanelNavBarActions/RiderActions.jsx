// ---- MATERIAL UI ----
import { Button, Box, Typography, Divider } from '@mui/material';
// ICONS
import AddIcon from '@mui/icons-material/Add';
// <--------------------

// ---- COMPONENTS ----
import { RefreshComponent } from '@/components/PanelComponents/RefreshComponent/RefreshComponent.jsx';
import { ModalCreateEditRider } from '../../ModalCreateEditRider/ModalCreateEditRider.jsx';
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

export const RiderActions = ({
  refreshRiders,
  modalState,
  toggleModal,
  showAlert,
}) => {
  return (
    <>
      <RefreshComponent isRiderPanel={true} refreshRiders={refreshRiders} />

      <Button
        startIcon={<AddIcon />}
        onClick={() => {
          toggleModal('createNewRider', true);
        }}
        variant="contained"
        sx={{ ...buttonStyle, bgcolor: 'success.main' }}
      >
        Nuevo Cadete
      </Button>

      {/* CREAR RIDER */}
      {modalState.createNewRider && (
        <ModalCreateEditRider
          show={modalState.createNewRider}
          handleClose={() => {
            toggleModal('createNewRider', false);
          }}
          showAlert={showAlert}
        />
      )}
    </>
  );
};
