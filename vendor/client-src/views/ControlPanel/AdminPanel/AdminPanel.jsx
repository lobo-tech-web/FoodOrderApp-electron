import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// ---- MATERIAL UI ----
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  ThemeProvider,
  Toolbar,
  Typography,
} from "@mui/material";
// ICONS
import { Menu as MenuIcon } from "@mui/icons-material";
// <--------------------

// ---- COMPONENTS ----
import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent.jsx";
import { AdminDrawer } from "./AdminDrawer/AdminDrawer.jsx";
import { CategoryPanel } from "./CategoryPanel/CategoryPanel.jsx";
import { CustomOptionPanel } from "./CustomOptionPanel/CustomOptionPanel.jsx";
import { LocalSettingsPanel } from "./LocalSettingsPanel/LocalSettingsPanel.jsx";
import { OrderPanel } from "./OrderPanel/OrderPanel.jsx";
import { OrderAuditPanel } from "./OrderPanel/OrderAuditPanel/OrderAuditPanel.jsx";
import { ProductPanel } from "./ProductPanel/ProductPanel.jsx";
import { RestaurantStaffPanel } from "./RestaurantStaffPanel/RestaurantStaffPanel.jsx";
import { RiderPanel } from "./RiderPanel/RiderPanel.jsx";
import { StatsPanel } from "./StatsPanel/StatsPanel.jsx";
import { UserPointsRestaurantPanel } from "./UserPointsRestaurantPanel/UserPointsRestaurantPanel.jsx";
import { CashRegisterPanel } from "./CashRegisterPanel/CashRegisterPanel.jsx";
// <-------------------

// ---- Hooks ----
// ELIMINAR EL DE LOS OTROS COMPONENTES Y UTILIZAR ESTE
// import { useAlert } from "@/hooks/Alert.jsx";
// ---------------

// ---- CONTEXT ----
import { useOrders } from "@/context/Orders.jsx";
import { useProducts } from "@/context/Products.jsx";
import { useLobotechThemeContext } from "@/context/ThemeContext.jsx";
import { useUser } from "@/context/Users.jsx";
// <----------------

// ---- STYLES ----
const drawerWidth = 260;
// ----------------

export const AdminPanel = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // CONTEXT
  const { lobotechTheme } = useLobotechThemeContext();
  const { getAllProducts, getAllCategorys } = useProducts();
  const { getMonthlyOrderStats, getRidersByRestaurant } = useOrders();
  const { userState, userLogOut } = useUser();
  const user = useMemo(() => userState.user || {}, [userState.user]);

  const logoutUser = () => {
    userLogOut();
    navigate("/");
  };

  useEffect(() => {
    if (!user || !user.id || user.role !== "admin") {
      navigate("/");
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        await getAllProducts(user.id);
        await getAllCategorys(user.id);
        await getMonthlyOrderStats(user.id);
        await getRidersByRestaurant(user.id);
      } catch (error) {
        console.error("Error al obtener productos y categorías:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    user,
    navigate,
    getAllProducts,
    getAllCategorys,
    getMonthlyOrderStats,
    getRidersByRestaurant,
  ]);

  if (loading) return <LoadingComponent />;

  return (
    <ThemeProvider theme={lobotechTheme}>
      <Box sx={{ display: "flex" }}>
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
              {activeTab === 0 && "GESTIÓN DE MI NEGOCIO"}
              {activeTab === 1 && "PEDIDOS DE HOY"}
              {activeTab === 11 && "PEDIDOS DEL MES"}
              {activeTab === 12 && "HISTORIAL DE PEDIDOS"}
              {activeTab === 13 && "AUDITORIA DE PEDIDOS"}
              {activeTab === 2 && "GESTIÓN DE CATEGORÍAS"}
              {activeTab === 21 && "CATÁLOGO DE PRODUCTOS"}
              {activeTab === 22 && "GESTIÓN DE PERSONALIZACIÓNES"}
              {activeTab === 3 && "FIDELIZACIÓN DE CLIENTES"}
              {activeTab === 4 && "ESTADÍSTICAS DE VENTAS DIARIAS"}
              {activeTab === 41 && "ESTADÍSTICAS DE VENTAS MENSUALES"}
              {activeTab === 42 && "REPORTE DE VENTAS POR CATEGORÍA"}
              {activeTab === 5 && "MIS CADETES"}
              {activeTab === 51 && "CIERRES PENDIENTES DE CADETES"}
              {activeTab === 52 && "HISTORIAL DE CIERRES DE CADETES"}
              {activeTab === 53 && "ENVÍOS DEL MES DE CADETES"}
              {activeTab === 54 && "ESTADÍSTICAS TOTALES DE CADETES"}
              {activeTab === 6 && "GESTIÓN DE EMPLEADOS"}
              {activeTab === 7 && "GESTIÓN DE CAJA"}
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
              "& .MuiDrawer-paper": { width: drawerWidth },
            }}
          >
            <AdminDrawer
              user={user}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onLogout={logoutUser}
              onCloseMobile={() => setMobileOpen(false)}
            />
          </Drawer>

          {/* Desktop */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", md: "block" },
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                borderRight: "1px solid",
                borderColor: "divider",
              },
            }}
            open
          >
            <AdminDrawer
              user={user}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onLogout={logoutUser}
            />
          </Drawer>
        </Box>

        {/* CONTENIDO PRINCIPAL CENTRAL */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { md: `calc(100% - ${drawerWidth}px)` },
            bgcolor: "background.default",
          }}
        >
          <Toolbar /> {/* Espaciador */}
          {activeTab === 0 && <LocalSettingsPanel user={user} />}
          {(activeTab === 1 || activeTab === 11 || activeTab === 12) && (
            <OrderPanel user={user} externalView={activeTab} />
          )}
          {activeTab === 13 && <OrderAuditPanel user={user} />}
          {activeTab === 2 && <CategoryPanel user={user} />}
          {activeTab === 21 && <ProductPanel user={user} />}
          {activeTab === 22 && <CustomOptionPanel user={user} />}
          {activeTab === 3 && <UserPointsRestaurantPanel user={user} />}
          {(activeTab === 4 || activeTab === 41 || activeTab === 42) && (
            <StatsPanel user={user} externalView={activeTab} />
          )}
          {[5, 51, 52, 53, 54].includes(activeTab) && (
            <RiderPanel user={user} externalView={activeTab} />
          )}
          {activeTab === 6 && <RestaurantStaffPanel user={user} />}
          {activeTab === 7 && <CashRegisterPanel user={user} />}
        </Box>
      </Box>
    </ThemeProvider>
  );
};
