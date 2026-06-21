import { useState } from 'react';

// ---- MATERIAL UI ----
import { AppBar, Toolbar, Box } from '@mui/material';
// <--------------------

// ---- COMPONENTS ----
import { ModalModifyUserPoints } from '@/components/PanelComponents/ModalModifyUserPoints/ModalModifyUserPoints.jsx';
// --------------------

// ---- ACTIONS ----
import { AllStatsActions } from './DevPanelNavBarActions/AllStatsActions.jsx';
import { DevUserPointsActions } from './DevPanelNavBarActions/DevUserPointsActions.jsx';
import { UserInfoActions } from './DevPanelNavBarActions/UserInfoActions.jsx';
import { UsersActions } from './DevPanelNavBarActions/UsersActions.jsx';
// -----------------

export const DevPanelNavBar = ({
  showAlert,
  isUsersPanel,
  refreshUsers,
  isAllInfoFromUser,
  refreshGetInfoFromUser,
  isUserPointsPanel,
  refreshUserPoints,
  isAllStatsOrders,
  refreshAllStatsOrders,
}) => {
  // ESTADOS PARA LOS MODALES
  const [modalState, setModalState] = useState({
    addUserPoints: false,
    removeUserPoints: false,
  });

  // ABRIR/CERRAR MODALES
  const toggleModal = (modal, value) => {
    setModalState((prevState) => ({ ...prevState, [modal]: value }));
  };

  return (
    <>
      <AppBar
        position="static"
        elevation={3}
        sx={{
          borderRadius: '8px',
          mb: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            overflow: 'auto',
            justifyContent: 'space-between',
            flexWrap: 'nowrap',
            px: { xs: 1, sm: 2 },
            py: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              alignItems: 'center',
              justifyContent: 'flex-start',
              flexGrow: 1,
              overflow: 'auto',
            }}
          >
            {/* USERS */}
            {isUsersPanel && <UsersActions refreshUsers={refreshUsers} />}

            {/* PRODUCTS BY USER */}
            {isAllInfoFromUser && (
              <UserInfoActions
                refreshGetInfoFromUser={refreshGetInfoFromUser}
              />
            )}
            {/* USER POINTS */}
            {isUserPointsPanel && (
              <DevUserPointsActions
                refreshUserPoints={refreshUserPoints}
                toggleModal={toggleModal}
              />
            )}
            {/* STATS */}
            {isAllStatsOrders && (
              <AllStatsActions refreshAllStatsOrders={refreshAllStatsOrders} />
            )}
          </Box>
        </Toolbar>
      </AppBar>
      {/* MODALES */}

      {/* AGREGAR PUNTOS */}
      {modalState.addUserPoints && (
        <ModalModifyUserPoints
          refreshUserPoints={refreshUserPoints}
          show={modalState.addUserPoints}
          handleClose={() => {
            toggleModal('addUserPoints', false);
          }}
          showAlert={showAlert}
          isAddingPoints={true}
        />
      )}

      {/* RESTAR PUNTOS */}
      {modalState.removeUserPoints && (
        <ModalModifyUserPoints
          refreshUserPoints={refreshUserPoints}
          show={modalState.removeUserPoints}
          handleClose={() => {
            toggleModal('removeUserPoints', false);
          }}
          showAlert={showAlert}
        />
      )}
    </>
  );
};
