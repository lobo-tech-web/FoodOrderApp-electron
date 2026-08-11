import { useState } from "react";

// ---- MATERIAL UI ----
import {
  Box,
  Typography,
  Chip,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Collapse,
} from "@mui/material";
// ---- ICONS ----
import {
  Storefront as StorefrontIcon,
  Person as PersonIcon,
  Fastfood as FastfoodIcon,
  LunchDining as LunchDiningIcon,
  LocalDining as LocalDiningIcon,
  AttachMoney as AttachMoneyIcon,
  Badge as BadgeIcon,
  Category as CategoryIcon,
  ReceiptLong as ReceiptLongIcon,
  PeopleAlt as PeopleAltIcon,
  Moped as MopedIcon,
  Logout as LogoutIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Today as TodayIcon,
  CalendarMonth as CalendarMonthIcon,
} from "@mui/icons-material";
//------------------

// ---- LOGO ----
import lobotechLogo from "@/assets/main/logo-lobotech-oj.png";
// --------------

// ---- COMPONENTS ----
import { ThemeToggle } from "@/components/ThemeToggle/ThemeToggle.jsx";
// --------------------

export const StaffDrawer = ({
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

  const getEmployeeRole = (role) => {
    if (role === "manager") return "ENCARGADO";
    if (role === "cashier") return "CAJERO";
    return "COCINERO";
  };

  const getEmployeeIcon = (role) => {
    if (role === "manager") return <BadgeIcon />;
    if (role === "cashier") return <AttachMoneyIcon />;
    return <LocalDiningIcon />;
  };

  const [openProducts, setOpenProducts] = useState(false);
  const [openOrders, setOpenOrders] = useState(false);

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

      {/* INFORMACIÓN DEL EMPLEADO */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 1,
          mb: 1,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
          <StorefrontIcon color="primary" />
          <Typography
            variant="subtitle1"
            sx={{
              fontFamily: "fontFamily.primary",
              color: "text.primary",
              textAlign: "center",
            }}
          >
            {(
              user?.restaurant?.businessName ||
              user?.restaurant?.name ||
              user?.businessName ||
              "Mi Negocio"
            ).toUpperCase()}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
          <PersonIcon color="primary" />
          <Typography
            variant="subtitle2"
            sx={{
              fontFamily: "fontFamily.primary",
              color: "text.primary",
              textAlign: "center",
              textTransform: "uppercase",
            }}
          >
            {user.name}
          </Typography>
        </Box>

        <Chip
          icon={getEmployeeIcon(user.staffRole)}
          label={getEmployeeRole(user.staffRole)}
          color="primary"
          variant="outlined"
          sx={{ fontFamily: "fontFamily.secondary" }}
        />
      </Box>

      <Divider>
        <Typography
          variant="subtitle2"
          sx={{
            fontFamily: "fontFamily.primary",
            color: "text.secondary",
            lineHeight: 1.2,
          }}
        >
          STAFF PANEL
        </Typography>
      </Divider>

      <List sx={{ px: 1 }}>
        {/* PEDIDOS */}
        <ListItemButton
          selected={activeTab === 1 || activeTab === 11 || activeTab === 12}
          onClick={() => setOpenOrders(!openOrders)}
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
            <ReceiptLongIcon />
          </ListItemIcon>
          <ListItemText
            primary="Pedidos"
            primaryTypographyProps={{ fontSize: "0.9rem" }}
          />
          {openOrders ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemButton>

        {/* COLLAPSE PEDIDOS */}
        <Collapse in={openOrders} timeout="auto" unmountOnExit>
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
                <TodayIcon
                  fontSize="small"
                  color={activeTab === 1 ? "primary" : "inherit"}
                />
              </ListItemIcon>
              <ListItemText
                primary="Hoy"
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
                <CalendarMonthIcon
                  fontSize="small"
                  color={activeTab === 11 ? "primary" : "inherit"}
                />
              </ListItemIcon>
              <ListItemText
                primary="Este Mes"
                primaryTypographyProps={{ fontSize: "0.85rem" }}
              />
            </ListItemButton>
          </List>
        </Collapse>

        {/* PRODUCTOS */}
        <ListItemButton
          selected={activeTab === 2 || activeTab === 21 || activeTab === 22}
          onClick={() => setOpenProducts(!openProducts)}
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
            <FastfoodIcon />
          </ListItemIcon>
          <ListItemText
            primary="Carta Digital"
            primaryTypographyProps={{ fontSize: "0.9rem" }}
          />
          {openProducts ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemButton>

        {/* COLLAPSE PRODUCTOS */}
        <Collapse in={openProducts} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {/* CATEGORIAS */}
            <ListItemButton
              selected={activeTab === 2}
              onClick={() => handleAction(2)}
              sx={{
                fontFamily: "fontFamily.secondary",
                pl: 4,
                borderRadius: 2,
                mb: 0.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <CategoryIcon
                  fontSize="small"
                  color={activeTab === 2 ? "primary" : "inherit"}
                />
              </ListItemIcon>
              <ListItemText
                primary="Categorías"
                primaryTypographyProps={{ fontSize: "0.85rem" }}
              />
            </ListItemButton>

            {/* PRODUCTOS */}
            <ListItemButton
              selected={activeTab === 21}
              onClick={() => handleAction(21)}
              sx={{
                fontFamily: "fontFamily.secondary",
                pl: 4,
                borderRadius: 2,
                mb: 0.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LunchDiningIcon
                  fontSize="small"
                  color={activeTab === 21 ? "primary" : "inherit"}
                />
              </ListItemIcon>
              <ListItemText
                primary="Productos"
                primaryTypographyProps={{ fontSize: "0.85rem" }}
              />
            </ListItemButton>

            {/* PERSONALIZACIÓNES */}
            <ListItemButton
              selected={activeTab === 22}
              onClick={() => handleAction(22)}
              sx={{
                fontFamily: "fontFamily.secondary",
                pl: 4,
                borderRadius: 2,
                mb: 0.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LocalDiningIcon
                  fontSize="small"
                  color={activeTab === 22 ? "primary" : "inherit"}
                />
              </ListItemIcon>
              <ListItemText
                primary="Personalizaciónes"
                primaryTypographyProps={{ fontSize: "0.85rem" }}
              />
            </ListItemButton>
          </List>
        </Collapse>

        {/* PUNTOS DE USUARIOS */}
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
            <PeopleAltIcon />
          </ListItemIcon>
          <ListItemText
            primary="Fidelización de Clientes"
            primaryTypographyProps={{ fontSize: "0.9rem" }}
          />
        </ListItemButton>

        {/* CADETES */}
        <ListItemButton
          selected={activeTab === 4}
          onClick={() => handleAction(4)}
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
            <MopedIcon />
          </ListItemIcon>
          <ListItemText
            primary="Cadetes"
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
