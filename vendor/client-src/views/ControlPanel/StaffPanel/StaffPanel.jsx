import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ---- Material UI ----
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  Paper,
  Toolbar,
  Typography,
  ThemeProvider,
} from "@mui/material";
// Icons
import { Menu as MenuIcon } from "@mui/icons-material";
// ---------------------

// ---- Hooks ----
import { useAlert } from "@/hooks/Alert.jsx";
// ---------------

// ---- Context ----
import { useLobotechThemeContext } from "@/context/ThemeContext.jsx";
import { useUser } from "@/context/Users.jsx";
import { useProducts } from "@/context/Products.jsx";
import { useOrders } from "@/context/Orders.jsx";
// -----------------

// ---- Components ----
import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent.jsx";
import { StaffDrawer } from "./StaffDrawer/StaffDrawer.jsx";
import { CashRegisterGate } from "./CashRegisterGate/CashRegisterGate.jsx";
import { CashMovementModal } from "./CashMovementModal/CashMovementModal.jsx";
import { CashCloseModal } from "./CashCloseModal/CashCloseModal.jsx";
import { StaffOrderPanel } from "./StaffOrderPanel/StaffOrderPanel.jsx";
import { CashRegisterHistoryPanel } from "./CashRegisterHistoryPanel/CashRegisterHistoryPanel.jsx";
// --------------------

// ---- STYLES ----
const drawerWidth = 260;

const STAFF_PANEL_TITLES = {
  1: "PEDIDOS DE HOY",
  11: "PEDIDOS DEL MES",
  2: "CATEGORÍAS",
  21: "PRODUCTOS",
  22: "PERSONALIZACIONES",
  3: "FIDELIZACIÓN DE CLIENTES",
  4: "CADETES",
  5: "REGISTRO DE CAJAS",
};
// ----------------

const isOrdersTab = (activeTab) => {
  return activeTab === 1 || activeTab === 11;
};

const getStoredSessionToken = () => {
  return (
    window.secureStorage?.getItem?.("token") ||
    window.localStorage.getItem("token")
  );
};

const PlaceholderSection = ({ title, description }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontFamily: "fontFamily.primary",
          fontWeight: "bold",
          color: "text.primary",
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          mt: 1,
          fontFamily: "fontFamily.secondary",
          color: "text.secondary",
        }}
      >
        {description}
      </Typography>
    </Paper>
  );
};

export const StaffPanel = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const { AlertComponent, showAlert } = useAlert();

  const { lobotechTheme } = useLobotechThemeContext();
  const { userState, userLogOut } = useUser();
  const { getAllProducts, getAllCategorys } = useProducts();
  const { getRidersByRestaurant } = useOrders();

  const staffUser = userState.user;

  const [cashSession, setCashSession] = useState(null);
  const [cashMovementDialog, setCashMovementDialog] = useState(false);
  const [cashCloseDialogOpen, setCashCloseDialogOpen] = useState(false);

  const initialLoadKeyRef = useRef("");

  const handleCashSessionChange = useCallback((nextSession) => {
    setCashSession((currentSession) => {
      const currentKey = currentSession
        ? `${currentSession.id || ""}:${currentSession.status || ""}`
        : "";
      const nextKey = nextSession
        ? `${nextSession.id || ""}:${nextSession.status || ""}`
        : "";

      return currentKey === nextKey ? currentSession : nextSession;
    });
  }, []);

  useEffect(() => {
    const token = getStoredSessionToken();

    if (!token || !staffUser?.id) {
      navigate("/login-staff");
      return;
    }

    if (staffUser.role !== "staff") {
      navigate("/");
      return;
    }

    const staffLoadKey = `${staffUser.id || ""}:${staffUser.restaurantId || ""}`;
    if (initialLoadKeyRef.current === staffLoadKey) return;
    initialLoadKeyRef.current = staffLoadKey;

    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          getAllProducts(staffUser?.restaurantId),
          getAllCategorys(staffUser?.restaurantId),
          getRidersByRestaurant(staffUser?.restaurantId),
        ]);
      } catch (error) {
        console.error("Error al obtener productos y categorías:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    navigate,
    staffUser?.id,
    staffUser?.role,
    staffUser?.restaurantId,
    getAllProducts,
    getAllCategorys,
    getRidersByRestaurant,
  ]);

  const handleLogout = () => {
    userLogOut();
    navigate("/login-staff");
  };

  const panelTitle = useMemo(() => {
    return STAFF_PANEL_TITLES[activeTab] || "PANEL DEL LOCAL";
  }, [activeTab]);

  if (!staffUser?.id || staffUser.role !== "staff") return null;

  if (loading) return <LoadingComponent message="Cargando panel..." />;

  return (
    <ThemeProvider theme={lobotechTheme}>
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
        }}
      >
        <CssBaseline />

        {/* NAVBAR SUPERIOR: Ahora mucho más limpia, solo título y botón menú */}
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
            bgcolor: "background.paper",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: "none" }, color: "primary.main" }}
            >
              <MenuIcon />
            </IconButton>

            <Typography
              variant="h6"
              noWrap
              sx={{ fontFamily: "fontFamily.primary", color: "text.primary" }}
            >
              {panelTitle}
            </Typography>
          </Toolbar>
        </AppBar>

        <Box
          component="nav"
          sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        >
          {/* Móvil */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                bgcolor: "background.paper",
              },
            }}
          >
            <StaffDrawer
              user={staffUser}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onLogout={handleLogout}
              onCloseMobile={() => setMobileOpen(false)}
              cashSession={cashSession}
              onCashMovement={() => {
                setMobileOpen(false);
                setCashMovementDialog(true);
              }}
              onCloseCash={() => {
                setMobileOpen(false);
                setCashCloseDialogOpen(true);
              }}
              onViewCashHistory={() => {
                setActiveTab(5);
                setMobileOpen(false);
              }}
            />
          </Drawer>

          {/* Desktop */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", md: "block" },
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                boxSizing: "border-box",
                bgcolor: "background.paper",
                borderRight: "1px solid",
                borderColor: "divider",
              },
            }}
            open
          >
            <StaffDrawer
              user={staffUser}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onLogout={handleLogout}
              cashSession={cashSession}
              onCashMovement={() => setCashMovementDialog(true)}
              onCloseCash={() => setCashCloseDialogOpen(true)}
              onViewCashHistory={() => setActiveTab(5)}
            />
          </Drawer>
        </Box>

        {/* CONTENIDO PRINCIPAL CENTRAL */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
            minHeight: "100vh",
            bgcolor: "background.default",
            p: { xs: 1.5, sm: 2, md: 3 },
          }}
        >
          <Toolbar />

          <CashRegisterGate
            user={staffUser}
            cashSession={cashSession}
            showAlert={showAlert}
            onCashSessionChange={handleCashSessionChange}
            showPrompt={isOrdersTab(activeTab)}
          />

          {(activeTab === 1 || activeTab === 11) && (
            <StaffOrderPanel
              user={staffUser}
              showAlert={showAlert}
              cashSession={cashSession}
              externalView={activeTab}
            />
          )}

          {activeTab === 2 && (
            <PlaceholderSection
              title="Categorías"
              description="Más adelante agregamos la visualización limitada de categorías para empleados."
            />
          )}

          {activeTab === 21 && (
            <PlaceholderSection
              title="Productos"
              description="Más adelante agregamos la visualización limitada de productos para empleados."
            />
          )}

          {activeTab === 22 && (
            <PlaceholderSection
              title="Personalizaciones"
              description="Más adelante agregamos la visualización de opciones personalizadas."
            />
          )}

          {activeTab === 3 && (
            <PlaceholderSection
              title="Fidelización de clientes"
              description="Más adelante agregamos puntos y clientes del local."
            />
          )}

          {activeTab === 4 && (
            <PlaceholderSection
              title="Cadetes"
              description="Más adelante agregamos la gestión de cadetes para empleados habilitados."
            />
          )}

          {activeTab === 5 && (
            <CashRegisterHistoryPanel user={staffUser} showAlert={showAlert} />
          )}
        </Box>

        <CashMovementModal
          open={cashMovementDialog}
          user={staffUser}
          cashSession={cashSession}
          showAlert={showAlert}
          onClose={() => setCashMovementDialog(false)}
          onMovementCreated={() => {}}
        />

        <CashCloseModal
          open={cashCloseDialogOpen}
          user={staffUser}
          cashSession={cashSession}
          showAlert={showAlert}
          onClose={() => setCashCloseDialogOpen(false)}
          onClosed={() => {
            setCashCloseDialogOpen(false);
            handleCashSessionChange(null);
          }}
        />
        {AlertComponent}
      </Box>
    </ThemeProvider>
  );
};
