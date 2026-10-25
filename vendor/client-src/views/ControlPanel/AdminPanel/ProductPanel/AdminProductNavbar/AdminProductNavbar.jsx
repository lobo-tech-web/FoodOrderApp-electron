import { useState } from "react";

// ---- Material UI ----
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
  Tooltip,
} from "@mui/material";
// Icons
import {
  Add,
  PriceChange,
  Refresh,
  Search,
  Close,
  Fastfood,
  PictureAsPdf,
} from "@mui/icons-material";
// ---------------------

// ---- Components ----
import { ModalEditProduct } from "@/components/PanelComponents/ModalEditProduct/ModalEditProduct.jsx";
import { ModalEditProductsPrice } from "@/components/PanelComponents/ModalEditProductsPrice/ModalEditProductsPrice.jsx";
// --------------------

// ---- Styles ----
const filterMenuProps = {
  PaperProps: {
    sx: {
      maxWidth: "min(400px, 90vw)",
      "& .MuiMenuItem-root": { fontFamily: "fontFamily.secondary" },
    },
  },
};

const buttonStyle = {
  height: 40,
  fontFamily: "fontFamily.primary",
  borderRadius: 1,
  px: 1.5,
  whiteSpace: "nowrap",
};
// ----------------

export const AdminProductNavbar = ({
  handleRefresh,
  countAllProducts,
  countFilteredProducts,
  categories,
  filters,
  onFiltersChange,
  onOpenCatalog,
  showAlert,
}) => {
  const [modalState, setModalState] = useState({
    createProduct: false,
    modifyProductsPrice: false,
  });
  const toggleModal = (modal, value) => {
    setModalState((current) => ({ ...current, [modal]: value }));
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

        <Box
          component="form"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            onFiltersChange({ search: filters.searchInput.trim() });
          }}
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
            flex: "1 1 0",
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: { xs: "wrap", sm: "nowrap" },
              gap: 1,
              flex: "1 1 600px",
              minWidth: 0,
            }}
          >
            <TextField
              fullWidth
              label="Nombre del producto"
              placeholder="Buscar productos…"
              size="small"
              sx={{
                width: { xs: "100%", md: 400 },
                maxWidth: "100%",
                minWidth: 0,
                flexShrink: 1,
              }}
              value={filters.searchInput}
              onChange={(event) =>
                onFiltersChange({ searchInput: event.target.value })
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {(filters.searchInput || filters.search) && (
                      <IconButton
                        aria-label="Limpiar búsqueda de productos"
                        size="small"
                        onClick={() =>
                          onFiltersChange({ searchInput: "", search: "" })
                        }
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    )}

                    <Tooltip title="Buscar productos">
                      <IconButton
                        type="submit"
                        aria-label="Buscar productos"
                        size="small"
                        edge="end"
                        color="primary"
                      >
                        <Search fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              select
              size="small"
              label="Categoría"
              value={filters.category}
              onChange={(event) =>
                onFiltersChange({ category: event.target.value })
              }
              sx={{
                flex: "1 1 180px",
                maxWidth: { sm: 240 },
                minWidth: 0,
                "& .MuiSelect-select": { fontFamily: "fontFamily.secondary" },
                "& .MuiInputLabel-root": { fontFamily: "fontFamily.secondary" },
              }}
              SelectProps={{ MenuProps: filterMenuProps }}
            >
              <MenuItem value="all">Todas las categorías</MenuItem>
              {categories.map((category) => (
                <MenuItem
                  key={category.id}
                  value={String(category.id)}
                  sx={{ whiteSpace: "normal", overflowWrap: "anywhere" }}
                >
                  {category.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="Estado"
              value={filters.status}
              onChange={(event) =>
                onFiltersChange({ status: event.target.value })
              }
              sx={{
                flex: "1 1 150px",
                maxWidth: { sm: 180 },
                minWidth: 0,
                "& .MuiSelect-select": { fontFamily: "fontFamily.secondary" },
                "& .MuiInputLabel-root": { fontFamily: "fontFamily.secondary" },
              }}
              SelectProps={{ MenuProps: filterMenuProps }}
            >
              <MenuItem value="all">Todos los estados</MenuItem>
              <MenuItem value="true">Activos</MenuItem>
              <MenuItem value="false">Desactivados</MenuItem>
            </TextField>
          </Box>

          {countAllProducts > 0 && (
            <Button
              type="button"
              variant="contained"
              color="error"
              startIcon={<PictureAsPdf />}
              onClick={onOpenCatalog}
              sx={{ ...buttonStyle, ml: "auto" }}
            >
              Generar catálogo PDF
            </Button>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 1,
            flex: "1 1 100%",
            minWidth: 0,
            pt: 1.5,
            mt: 0.5,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              flex: { xs: "1 1 100%", sm: "0 1 auto" },
            }}
          >
            <Button
              startIcon={<Add />}
              variant="contained"
              color="success"
              onClick={() => toggleModal("createProduct", true)}
              sx={{ ...buttonStyle, flexGrow: { xs: 1, sm: 0 } }}
            >
              Nuevo producto
            </Button>

            <Button
              startIcon={<PriceChange />}
              onClick={() => toggleModal("modifyProductsPrice", true)}
              variant="outlined"
              sx={{ ...buttonStyle, flexGrow: { xs: 1, sm: 0 } }}
            >
              Modificar precios
            </Button>
          </Box>

          <Chip
            icon={<Fastfood />}
            size="medium"
            variant="outlined"
            label={
              countFilteredProducts === countAllProducts
                ? countAllProducts + " productos"
                : countFilteredProducts +
                  " de " +
                  countAllProducts +
                  " productos"
            }
            sx={{ fontFamily: "fontFamily.secondary" }}
          />
        </Box>
      </Toolbar>

      {modalState.createProduct && (
        <ModalEditProduct
          show={modalState.createProduct}
          handleClose={() => toggleModal("createProduct", false)}
          showAlert={showAlert}
        />
      )}

      {modalState.modifyProductsPrice && (
        <ModalEditProductsPrice
          show={modalState.modifyProductsPrice}
          handleClose={() => toggleModal("modifyProductsPrice", false)}
          refreshProducts={handleRefresh}
          showAlert={showAlert}
        />
      )}
    </AppBar>
  );
};
