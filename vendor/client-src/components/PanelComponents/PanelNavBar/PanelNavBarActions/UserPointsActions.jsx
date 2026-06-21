// ---- MATERIAL UI ----
import { Box, Typography, Button } from '@mui/material';
// ICONS
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
// <--------------------

// ---- COMPONENTS ----
import { SearchBox } from '@/components/PanelComponents/SearchBox/SearchBox.jsx';
import { RefreshComponent } from '@/components/PanelComponents/RefreshComponent/RefreshComponent.jsx';
// MODALES
import { ModalModifyUserPoints } from '@/components/PanelComponents/ModalModifyUserPoints/ModalModifyUserPoints.jsx';
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

export const UserPointsActions = ({
  refreshUserPoints,
  modalState,
  toggleModal,
  countAllUserPoints,
  showAlert,
}) => {
  return (
    <>
      <RefreshComponent
        isUserPointsPanel={true}
        refreshUserPoints={refreshUserPoints}
      />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          overflow: 'hidden',
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'fontFamily.terciary',
            color: 'text.primary',
          }}
        >
          BUSCAR
        </Typography>
        <SearchBox isUserPointsPanel={true} placeholder={'Nombre / Teléfono'} />
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          startIcon={<AddIcon />}
          onClick={() => {
            toggleModal('addUserPoints', true);
          }}
          variant="contained"
          sx={{ ...buttonStyle, bgcolor: 'success.main' }}
        >
          Agregar puntos
        </Button>
        <Button
          startIcon={<RemoveIcon />}
          onClick={() => {
            toggleModal('removeUserPoints', true);
          }}
          variant="contained"
          sx={{ ...buttonStyle, bgcolor: 'error.main' }}
        >
          Remover puntos
        </Button>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          overflow: 'hidden',
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'fontFamily.terciary',
            color: 'text.primary',
          }}
        >
          CLIENTES REGISTRADOS: {countAllUserPoints}
        </Typography>
      </Box>
      {/* AGREGAR PUNTOS */}
      {modalState.addUserPoints && (
        <ModalModifyUserPoints
          show={modalState.addUserPoints}
          handleClose={() => {
            toggleModal('addUserPoints', false);
          }}
          refreshUserPoints={refreshUserPoints}
          isAddingPoints={true}
          showAlert={showAlert}
        />
      )}

      {/* RESTAR PUNTOS */}
      {modalState.removeUserPoints && (
        <ModalModifyUserPoints
          show={modalState.removeUserPoints}
          handleClose={() => {
            toggleModal('removeUserPoints', false);
          }}
          refreshUserPoints={refreshUserPoints}
          showAlert={showAlert}
        />
      )}
    </>
  );
};
