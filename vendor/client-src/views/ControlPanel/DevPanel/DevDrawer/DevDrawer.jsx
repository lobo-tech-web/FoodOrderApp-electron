import { useState } from "react";

// ---- MATERIAL UI ----
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Collapse,
} from "@mui/material";
// ---- ICONS ----
import {
  Code as CodeIcon,
  PeopleAlt as PeopleAltIcon,
  FormatListNumbered as FormatListNumberedIcon,
  Info as InfoIcon,
  CardGiftcard as CardGiftcardIcon,
  QueryStats as QueryStatsIcon,
  Logout as LogoutIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
//------------------

// ---- LOGO ----
import lobotechLogo from "@/assets/main/logo-lobotech-oj.png";
// --------------

// ---- COMPONENTS ----
import { ThemeToggle } from "@/components/ThemeToggle/ThemeToggle.jsx";
// --------------------

export const DevDrawer = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  onCloseMobile,
}) => {
  const handleAction = (tabIndex) => {
    setActiveTab(tabIndex);
    if (onCloseMobile) onCloseMobile();
  };

  const [openUsers, setOpenUsers] = useState(false);

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* CABECERA: PERFIL BREVE */}
      <Box
        sx={{
          pt: 1.5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <ThemeToggle size="small" showLabel />
        <Box
          sx={{
            width: { xs: "140px", sm: "180px", md: "160px" },
            flexShrink: 0, // Evita que el logo se achique
          }}
        >
          {/* CONTENEDOR DEL LOGO */}
          <Box
            component="img"
            src={lobotechLogo}
            alt="Lobotech Logo"
            sx={{
              width: "100%",
              height: "auto",
              objectFit: "contain",
              filter: "drop-shadow(0px 4px 10px rgba(0,0,0,0.05))",
            }}
          />
        </Box>
      </Box>

      <Divider>
        <Typography
          variant="subtitle2"
          sx={{
            fontFamily: "fontFamily.primary",
            color: "text.primary",
            textAlign: "center",
          }}
        >
          {user?.businessName?.toUpperCase() || "Mi Negocio"}
        </Typography>
      </Divider>

      {/* SECCIÓN 1: NAVEGACIÓN GENERAL */}
      <List sx={{ p: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            selected={activeTab === 0}
            onClick={() => handleAction(0)}
            sx={{
              fontFamily: "fontFamily.secondary",
              borderRadius: 2,
              mb: 0.5,
              "&.Mui-selected": {
                bgcolor: "primary.main",
                color: "text.terciary",
                "& .MuiListItemIcon-root": { color: "text.terciary" },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <CodeIcon />
            </ListItemIcon>
            <ListItemText
              primary="Mis Datos"
              primaryTypographyProps={{
                fontSize: "0.9rem",
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider>
        <Typography
          variant="subtitle2"
          sx={{
            fontFamily: "fontFamily.primary",
            color: "text.secondary",
            lineHeight: 1.2,
          }}
        >
          DEVELOPER PANEL
        </Typography>
      </Divider>

      {/* SECCIÓN 2: PANELES DEL ADMIN (TABS) */}
      <List sx={{ px: 1 }}>
        {/* PEDIDOS */}
        <ListItemButton
          selected={activeTab === 1 || activeTab === 11}
          onClick={() => setOpenUsers(!openUsers)}
          sx={{
            fontFamily: "fontFamily.secondary",
            borderRadius: 2,
            mb: 0.5,
            "&.Mui-selected": {
              bgcolor: "primary.main",
              color: "text.terciary",
              "& .MuiListItemIcon-root": { color: "text.terciary" },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <PeopleAltIcon />
          </ListItemIcon>
          <ListItemText
            primary="Usuarios"
            primaryTypographyProps={{ fontSize: "0.9rem" }}
          />
          {openUsers ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemButton>

        {/* COLLAPSE PEDIDOS */}
        <Collapse in={openUsers} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              selected={activeTab === 1}
              onClick={() => handleAction(1)}
              sx={{
                fontFamily: "fontFamily.secondary",
                pl: 4,
                borderRadius: 2,
                mb: 0.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <FormatListNumberedIcon
                  fontSize="small"
                  color={activeTab === 1 ? "primary" : "inherit"}
                />
              </ListItemIcon>
              <ListItemText
                primary="Todos"
                primaryTypographyProps={{ fontSize: "0.85rem" }}
              />
            </ListItemButton>

            <ListItemButton
              selected={activeTab === 11}
              onClick={() => handleAction(11)}
              sx={{
                fontFamily: "fontFamily.secondary",
                pl: 4,
                borderRadius: 2,
                mb: 0.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <InfoIcon
                  fontSize="small"
                  color={activeTab === 11 ? "primary" : "inherit"}
                />
              </ListItemIcon>
              <ListItemText
                primary="Información de usuario"
                primaryTypographyProps={{ fontSize: "0.85rem" }}
              />
            </ListItemButton>
          </List>
        </Collapse>

        {/* PUNTOS DE USUARIOS */}
        <ListItemButton
          selected={activeTab === 2}
          onClick={() => handleAction(2)}
          sx={{
            fontFamily: "fontFamily.secondary",
            borderRadius: 2,
            mb: 0.5,
            "&.Mui-selected": {
              bgcolor: "primary.main",
              color: "text.terciary",
              "& .MuiListItemIcon-root": { color: "text.terciary" },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <CardGiftcardIcon />
          </ListItemIcon>
          <ListItemText
            primary="Fidelización de Usuarios"
            primaryTypographyProps={{ fontSize: "0.9rem" }}
          />
        </ListItemButton>

        {/* ESTADISTICAS */}
        <ListItemButton
          selected={activeTab === 3}
          onClick={() => handleAction(3)}
          sx={{
            fontFamily: "fontFamily.secondary",
            borderRadius: 2,
            mb: 0.5,
            "&.Mui-selected": {
              bgcolor: "primary.main",
              color: "text.terciary",
              "& .MuiListItemIcon-root": { color: "text.terciary" },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <QueryStatsIcon />
          </ListItemIcon>
          <ListItemText
            primary="Estadísticas"
            primaryTypographyProps={{ fontSize: "0.9rem" }}
          />
        </ListItemButton>
      </List>

      {/* SECCIÓN FINAL: LOGOUT */}
      <Box sx={{ p: 2, mt: "auto" }}>
        <Button
          aria-label="Cerrar sesión"
          fullWidth
          variant="contained"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={onLogout}
          sx={{
            fontFamily: "fontFamily.primary",
            borderRadius: 2,
          }}
        >
          Cerrar Sesión
        </Button>
      </Box>
    </Box>
  );
};
