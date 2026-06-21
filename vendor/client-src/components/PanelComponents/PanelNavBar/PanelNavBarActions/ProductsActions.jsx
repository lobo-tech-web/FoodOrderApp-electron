// ---- MATERIAL UI ----
import { Button, Box, Typography, Divider } from '@mui/material';
// <--------------------

// ---- COMPONENTS ----
import { SearchBox } from '@/components/PanelComponents/SearchBox/SearchBox.jsx';
import { RefreshComponent } from '@/components/PanelComponents/RefreshComponent/RefreshComponent.jsx';
import { FilterByCategory } from '@/components/PanelComponents/Filters/FilterByCategory/FilterByCategory.jsx';
import { FilterByStatusProducts } from '@/components/PanelComponents/Filters/FilterByStatusProducts/FilterByStatusProducts.jsx';
// MODALES
import { ModalEditProduct } from '@/components/PanelComponents/ModalEditProduct/ModalEditProduct.jsx';
import { ModalEditProductsPrice } from '@/components/PanelComponents/ModalEditProductsPrice/ModalEditProductsPrice.jsx';
// ICONS
import {
  Add as AddIcon,
  PriceChange as PriceChangeIcon,
} from '@mui/icons-material';
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

export const ProductsActions = ({
  refreshProducts,
  modalState,
  toggleModal,
  countAllProducts,
  showAlert,
}) => {
  return (
    <>
      <RefreshComponent
        isProductPanel={true}
        refreshProducts={refreshProducts}
      />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'fontFamily.terciary',
            color: 'text.primary',
          }}
        >
          NOMBRE
        </Typography>
        <SearchBox isProductPanel={true} placeholder={'Buscar producto...'} />
      </Box>

      <Button
        startIcon={<AddIcon />}
        onClick={() => {
          toggleModal('createProduct', true);
        }}
        variant="contained"
        sx={{ ...buttonStyle, bgcolor: 'success.main' }}
      >
        Nuevo Producto
      </Button>
      <Button
        startIcon={<PriceChangeIcon />}
        onClick={() => {
          toggleModal('modifyProductsPrice', true);
        }}
        variant="contained"
        sx={buttonStyle}
      >
        Modificar Precios
      </Button>

      <Divider
        orientation="vertical"
        flexItem
        sx={{ mx: 1, bgcolor: 'primary.main' }}
      />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'fontFamily.terciary',
            color: 'text.primary',
            mr: 2,
          }}
        >
          FILTROS
        </Typography>
        {/* FILTRO POR CATEGORIA */}
        <FilterByCategory />
        {/* FILTRO POR ESTADO */}
        <FilterByStatusProducts />
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'fontFamily.terciary',
            color: 'text.primary',
            ml: 2,
          }}
        >
          TOTAL DE PRODUCTOS: {countAllProducts}
        </Typography>
      </Box>
      {/* CREAR PRODUCTO */}
      {modalState.createProduct && (
        <ModalEditProduct
          show={modalState.createProduct}
          handleClose={() => {
            toggleModal('createProduct', false);
          }}
          showAlert={showAlert}
        />
      )}

      {/* MODIFICAR ARRAY DE PRODUCTOS */}
      {modalState.modifyProductsPrice && (
        <ModalEditProductsPrice
          show={modalState.modifyProductsPrice}
          handleClose={() => {
            toggleModal('modifyProductsPrice', false);
          }}
          refreshProducts={refreshProducts}
          showAlert={showAlert}
        />
      )}
    </>
  );
};
