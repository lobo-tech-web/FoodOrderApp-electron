import { useState, useEffect, useCallback, useMemo } from 'react';

// ---- MATERIAL UI ----
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
// <-------------------

// ---- CONTEXT ----
import { useUser } from '@/context/Users.jsx';
import { useProducts } from '@/context/Products.jsx';
// -----------------

// ---- COMPONENTS ----
import { ProductSelectorSection } from './ProductSelectorSection/ProductSelectorSection.jsx';
import { PriceConfigSection } from './PriceConfigSection/PriceConfigSection.jsx';
import { ChangesPreview } from './ChangesPreview/ChangesPreview.jsx';
import { ProductsListSection } from './ProductsListSection/ProductsListSection.jsx';
// --------------------

// ---- SERVICES ----
import { updateProductsPriceService } from '@/services/products.js';
// ------------------

export const ModalEditProductsPrice = ({
  show,
  handleClose,
  showAlert,
  refreshProducts,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isXsScreen = useMediaQuery(theme.breakpoints.down('xs'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const [loading, setLoading] = useState(false);
  const { userState } = useUser();
  const currentUser = useMemo(() => userState?.user || {}, [userState?.user]);
  const { productState } = useProducts();
  const allProducts = useMemo(
    () => productState?.allProducts || [],
    [productState?.allProducts]
  );

  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [incrementDecrement, setIncrementDecrement] = useState('');
  const [around, setAround] = useState('');
  const [porcentage, setPorcentage] = useState(0.0);

  const selectedProducts = useMemo(() => {
    return allProducts.filter((product) =>
      selectedProductIds.includes(product.id)
    );
  }, [allProducts, selectedProductIds]);

  // FUNCIÓN QUE DESHABILITA EL BOTON SI NO SE COMPLETAN LOS CAMPOS REQUERIDOS EN EL REGISTER
  const isFormValid = useMemo(() => {
    const hasAllFields =
      selectedProductIds.length > 0 &&
      incrementDecrement.trim() &&
      around.trim() &&
      porcentage > 0;

    return hasAllFields;
  }, [selectedProductIds.length, incrementDecrement, around, porcentage]);

  // ✅ FUNCIÓN PARA CALCULAR NUEVOS PRECIOS
  const calculateNewPrice = useCallback(
    (originalPrice) => {
      const price = Number(originalPrice || 0);
      const percentageValue = Number.parseFloat(porcentage);

      if (!percentageValue || percentageValue <= 0) return price;

      let newPrice = price;
      // Aplicar aumento o disminución
      if (incrementDecrement === 'AUMENTAR') {
        newPrice = price * (1 + percentageValue / 100);
      } else if (incrementDecrement === 'DISMINUIR') {
        newPrice = price * (1 - percentageValue / 100);
      }

      // Aplicar redondeo
      if (around === 'REDONDEAR EN 100') {
        newPrice = Math.round(newPrice / 100) * 100;
      } else if (around === 'REDONDEAR EN 50') {
        newPrice = Math.round(newPrice / 50) * 50;
      }

      return Math.max(0, Number(newPrice.toFixed(2)));
    },
    [incrementDecrement, porcentage, around]
  );

  const hasValidPreview = useMemo(() => {
    return (
      selectedProducts.length > 0 &&
      incrementDecrement &&
      around &&
      Number(porcentage) > 0
    );
  }, [selectedProducts.length, incrementDecrement, around, porcentage]);

  // ✅ CALCULAR PREVIEW DE PRODUCTOS CON NUEVOS PRECIOS
  const previewProducts = useMemo(() => {
    if (!hasValidPreview) return selectedProducts;

    return selectedProducts.map((product) => {
      const oldPrice = Number(product.price || 0);
      const newPrice = calculateNewPrice(oldPrice);

      return {
        ...product,
        oldPrice,
        newPrice,
        priceDifference: newPrice - oldPrice,
      };
    });
  }, [selectedProducts, hasValidPreview, calculateNewPrice]);

  const resetModal = () => {
    setSelectedProductIds([]);
    setIncrementDecrement('');
    setAround('');
    setPorcentage(0);
    handleClose();
  };

  const handleSaveChanges = useCallback(async () => {
    if (selectedProductIds.length === 0)
      return showAlert(
        'Por favor agregue al menos un producto para modificar el precio',
        'warning'
      );
    if (!incrementDecrement)
      return showAlert(
        'Por favor seleccione si quiere AUMENTAR / DISMINUIR',
        'warning'
      );
    if (!around)
      return showAlert(
        'Por favor seleccione si quiere REDONDEAR PRECIOS',
        'warning'
      );
    if (Number(porcentage) <= 0)
      return showAlert('Por favor ingrese un porcentaje mayor a 0', 'warning');

    setLoading(true);
    try {
      const productDataPrices = {
        userId: currentUser?.id || undefined,
        productIds: selectedProductIds,
        isDecrementIncrement: incrementDecrement,
        isAround: around,
        value: Number.parseFloat(porcentage),
      };
      console.log(productDataPrices);
      await updateProductsPriceService(productDataPrices);
      showAlert('Precios actualizados correctamente!', 'success');
      resetModal();
    } catch (error) {
      showAlert(`Error al guardar los cambios: ${error}`, 'error');
      console.error(error);
    } finally {
      setLoading(false);

      setTimeout(async () => {
        await refreshProducts();
      }, 1500);
    }
  }, [
    selectedProductIds,
    currentUser?.id,
    incrementDecrement,
    around,
    porcentage,
    showAlert,
    refreshProducts,
  ]);

  return (
    <Dialog
      open={show}
      onClose={handleClose}
      maxWidth={isDesktop ? 'md' : 'sm'}
      fullWidth
      fullScreen={isXsScreen}
      PaperProps={{
        sx: {
          borderRadius: {
            xs: isXsScreen ? 0 : '12px',
            sm: '16px',
            md: '20px',
          },
          overflow: 'hidden',
          bgcolor: 'background.default',
          boxShadow: 'primary.main',
          border: 'primary.main',
          maxHeight: { xs: '100vh', sm: '95vh', md: '90vh' },
          width: { xs: '100%', sm: 'auto', md: '700px' },
          margin: { xs: 0, sm: '16px' },
        },
      }}
      TransitionProps={{
        style: {
          transition: isMobile
            ? 'transform 300ms ease-in-out'
            : 'opacity 300ms ease-in-out',
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          padding: { xs: 2, sm: 3, md: 4 },
          borderBottom: '2px solid #f5a623',
          position: { xs: 'sticky', sm: 'static' },
          top: 0,
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontFamily: 'fontFamily.primary',
              color: 'text.primary',
              fontSize: { xs: '18px', sm: '24px', md: '20px' },
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 0.5, sm: 1, md: 1.5 },
              fontWeight: 'bold',
            }}
          >
            <EditIcon
              sx={{
                color: 'primary.main',
                fontSize: { xs: '20px', sm: '24px', md: '32px' },
              }}
            />
            MODIFICAR PRECIOS
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          bgcolor: 'background.default',
          p: { xs: 1.5, sm: 3, md: 4 },
          overflow: 'auto',
          maxHeight: { xs: 'calc(100vh - 120px)', sm: 'none' },
        }}
      >
        <Box component="form" noValidate sx={{ width: '100%' }}>
          {/* Selección de productos */}
          <ProductSelectorSection
            products={allProducts}
            selectedProductIds={selectedProductIds}
            setSelectedProductIds={setSelectedProductIds}
          />
          {/* CONFIGURACIÓN DE LA EDICIÓN DE PRODUCTOS */}
          <PriceConfigSection
            incrementDecrement={incrementDecrement}
            setIncrementDecrement={setIncrementDecrement}
            around={around}
            setAround={setAround}
            porcentage={porcentage}
            setPorcentage={setPorcentage}
          />

          {/* PREVIEW DE CAMBIOS */}
          {hasValidPreview && (
            <ChangesPreview
              incrementDecrement={incrementDecrement}
              porcentage={porcentage}
              around={around}
            />
          )}

          {selectedProducts.length > 0 && (
            <ProductsListSection
              showProducts={previewProducts}
              hasValidPreview={hasValidPreview}
            />
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          onClick={resetModal}
          variant="contained"
          color="error"
          disabled={loading}
          sx={{ fontFamily: 'fontFamily.primary' }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSaveChanges}
          variant="contained"
          color="primary"
          disabled={!isFormValid || loading}
          sx={{ fontFamily: 'fontFamily.primary' }}
        >
          Actualizar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
