import { useState } from "react";

// ---- Material UI ----
import { AppBar, Toolbar, Button, IconButton, Tooltip } from "@mui/material";
// Icons
import { Refresh, Add, ImportExport } from "@mui/icons-material";
// ---------------------

// ---- Components ----
import { ModalEditCategory } from "@/components/PanelComponents/ModalEditCategory/ModalEditCategory.jsx";
import { CategoryOrderPriority } from "@/components/PanelComponents/CategoryOrderPriority/CategoryOrderPriority.jsx";
// --------------------

// ---- STYLES ----
const buttonStyle = {
  bgcolor: "primary.main",
  color: "text.terciary",
  fontFamily: "fontFamily.primary",
  borderRadius: "8px",
  px: { xs: 1.5, sm: 2, md: 3 },
  py: { xs: 0.5, sm: 1 },
  fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.9rem" },
  minWidth: { xs: "auto", sm: "120px" },
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  "&:hover": {
    bgcolor: "background.paper",
    color: "primary.main",
    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
  },
};
// ----------------

export const AdminCategoryNavbar = ({ handleRefresh, showAlert }) => {
  const [modalState, setModalState] = useState({
    createCategory: false,
    orderCategory: false,
  });

  // ABRIR/CERRAR MODALES
  const toggleModal = (modal, value) => {
    setModalState((prevState) => ({ ...prevState, [modal]: value }));
  };

  return (
    <AppBar
      component="section"
      aria-label="Herramientas de productos"
      position="sticky"
      elevation={0}
      sx={{
        width: "100%",
        top: 0,
        zIndex: 10,
        borderRadius: 1,
        mb: 2,
        bgcolor: "background.paper",
        backgroundImage: "none",
        color: "text.primary",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar
        sx={{
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1,
          px: { xs: 1, sm: 1.5 },
          py: 1.5,
          minHeight: "unset !important",
        }}
      >
        <Tooltip title="Actualizar productos">
          <IconButton
            aria-label="Actualizar productos"
            onClick={handleRefresh}
            color="primary"
            sx={{ alignSelf: "flex-start" }}
          >
            <Refresh />
          </IconButton>
        </Tooltip>

        <Button
          startIcon={<Add sx={{ fontSize: { xs: 18, md: 22 } }} />}
          onClick={() => {
            toggleModal("createCategory", true);
          }}
          variant="contained"
          sx={{ ...buttonStyle, bgcolor: "success.main" }}
        >
          Nueva Categoria
        </Button>

        <Button
          startIcon={<ImportExport sx={{ fontSize: { xs: 18, md: 22 } }} />}
          onClick={() => {
            toggleModal("orderCategory", true);
          }}
          variant="contained"
          sx={buttonStyle}
        >
          Ordenar Categorias
        </Button>
      </Toolbar>

      {/* CREAR CATEGORIA */}
      {modalState.createCategory && (
        <ModalEditCategory
          show={modalState.createCategory}
          handleClose={() => {
            toggleModal("createCategory", false);
          }}
          showAlert={showAlert}
        />
      )}

      {/* ORDENAR PRIORIDAD DE CATEGORIAS */}
      {modalState.orderCategory && (
        <CategoryOrderPriority
          show={modalState.orderCategory}
          handleClose={() => {
            toggleModal("orderCategory", false);
          }}
          showAlert={showAlert}
        />
      )}
    </AppBar>
  );
};
