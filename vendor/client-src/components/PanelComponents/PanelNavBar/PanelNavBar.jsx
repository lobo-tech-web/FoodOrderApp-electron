import { useState } from "react";

// ---- MATERIAL UI ----
import { AppBar, Toolbar, Box } from "@mui/material";
// <--------------------

// ---- ACTIONS ----
import { UserPointsActions } from "./PanelNavBarActions/UserPointsActions.jsx";
import { StatsActions } from "./PanelNavBarActions/StatsActions.jsx";
import { RiderActions } from "./PanelNavBarActions/RiderActions.jsx";
// -----------------

export const PanelNavBar = ({
  handleRefresh,
  showAlert,
  isUserPointsPanel,
  countAllUserPoints,
  isStatsPanel,
  isRidersPanel,
}) => {
  // ESTADOS PARA LOS MODALES
  const [modalState, setModalState] = useState({
    createProduct: false,
    modifyProductsPrice: false,
    createOrder: false,
    editArrayOrders: false,
    addUserPoints: false,
    removeUserPoints: false,
    createNewRider: false,
  });

  // ABRIR/CERRAR MODALES
  const toggleModal = (modal, value) => {
    setModalState((prevState) => ({ ...prevState, [modal]: value }));
  };

  return (
    <AppBar
      position="static"
      elevation={1}
      sx={{
        width: "100%",
        borderRadius: "8px",
        mb: 2,
        bgcolor: "background.main",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          overflow: "auto",
          justifyContent: "space-between",
          flexWrap: "nowrap",
          px: { xs: 1, sm: 2 },
          py: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
            justifyContent: "flex-start",
            flexGrow: 1,
            overflow: "auto",
          }}
        >
          {/* USERPOINTS */}
          {isUserPointsPanel && (
            <UserPointsActions
              refreshUserPoints={handleRefresh}
              modalState={modalState}
              toggleModal={toggleModal}
              countAllUserPoints={countAllUserPoints}
              showAlert={showAlert}
            />
          )}

          {/* STATS */}
          {isStatsPanel && <StatsActions refreshStats={handleRefresh} />}

          {/* RIDERS */}
          {isRidersPanel && (
            <RiderActions
              refreshRiders={handleRefresh}
              modalState={modalState}
              toggleModal={toggleModal}
              showAlert={showAlert}
            />
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
