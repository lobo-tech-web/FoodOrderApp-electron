import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// ---- MATERIAL UI ----
import {
  Typography,
  Box,
  Drawer,
  Toolbar,
  CssBaseline,
  AppBar,
  IconButton,
  ThemeProvider,
} from "@mui/material";
// ICONS
import { Menu as MenuIcon } from "@mui/icons-material";
// <--------------------

// ---- COMPONENTS ----
import { DevDrawer } from "./DevDrawer/DevDrawer.jsx";
import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent.jsx";
import { UserProfile } from "@/views/UserProfile/UserProfile.jsx";
import { UsersPanel } from "./UsersPanel/UsersPanel.jsx";
import { GetInfoFromUser } from "./GetInfoFromUser/GetInfoFromUser.jsx";
import { UserPointsPanel } from "./UserPointsPanel/UserPointsPanel.jsx";
import { AllStatsPanel } from "./AllStatsPanel/AllStatsPanel.jsx";
// --------------------

// ---- CONTEXT ----
import { useLobotechThemeContext } from "@/context/ThemeContext.jsx";
import { useUser } from "@/context/Users.jsx";
// -----------------

// ---- STYLES ----
const drawerWidth = 260;
// ----------------

export const DevPanel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState(1);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // CONTEXT
  const { lobotechTheme } = useLobotechThemeContext();
  const { userState, getAllUsers, userLogOut } = useUser();
  const user = useMemo(() => userState.user || {}, [userState.user]);

  const logoutUser = () => {
    userLogOut();
    navigate("/");
  };

  useEffect(() => {
    if (!user || !user.id || user.role !== "dev") {
      navigate("/");
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        await getAllUsers();
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate, getAllUsers]);

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
              {activeTab === 0 && "GESTIÓN MI CUENTA"}
              {activeTab === 1 && "GESTIÓN DE USUARIOS"}
              {activeTab === 11 && "INFORMACIÓN DE USUARIO"}
              {activeTab === 2 && "FIDELIZACIÓN DE USUARIOS"}
              {activeTab === 3 && "STATS GLOBALES"}
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
            <DevDrawer
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
            <DevDrawer
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
          {activeTab === 0 && <UserProfile />}
          {activeTab === 1 && <UsersPanel user={user} />}
          {activeTab === 11 && <GetInfoFromUser user={user} />}
          {activeTab === 2 && <UserPointsPanel user={user} />}
          {activeTab === 3 && <AllStatsPanel user={user} />}
        </Box>
      </Box>
    </ThemeProvider>
  );
};
