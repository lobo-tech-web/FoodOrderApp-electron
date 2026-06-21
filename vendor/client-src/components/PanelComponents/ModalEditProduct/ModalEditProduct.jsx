import { useState, useEffect, useMemo, useCallback } from 'react';

// ---- MATERIAL UI ----
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
// ICONS
import CloseIcon from '@mui/icons-material/Close';
// ----------------------

// ---- UTILS ----
import {
  initialUpdateProductState,
  initialCreateProductState,
  updateField,
} from '@/utils/productUtils.js';
// ---------------

// ---- COMPONENTS -----
import { LoadingComponent } from '@/components/LoadingComponent/LoadingComponent.jsx';
import { ProductInfo } from './ProductInfo/ProductInfo.jsx';
import { CustomOptions } from './CustomOptions/CustomOptions.jsx';
// ---------------------

// ---- CONTEXT ------>
import { useProducts } from '@/context/Products.jsx';
import { useUser } from '@/context/Users.jsx';
// <-------------------

// ---- STYLES ----
const cancelButtonStyle = {
  fontFamily: 'fontFamily.primary',
  bgcolor: 'primary.dark',
  color: 'text.primary',
};

const submitButtonStyle = {
  fontFamily: 'fontFamily.primary',
  bgcolor: 'primary.main',
  color: 'text.terciary',
};

const deleteButtonStyle = {
  fontFamily: 'fontFamily.primary',
  bgcolor: 'error.main',
  color: 'text.primary',
};
// --------------

export const ModalEditProduct = ({
  show,
  handleClose,
  showAlert,
  showProduct,
  isEditing,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isXsScreen = useMediaQuery(theme.breakpoints.down('xs'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);

  const {
    productState,
    addProduct,
    updateProduct,
    deleteProduct,
    getAllCustomOptions,
  } = useProducts();
  const { userState } = useUser();

  const allCategories = useMemo(
    () => productState.categorys || [],
    [productState.categorys]
  );
  const [product, setProduct] = useState(initialUpdateProductState);
  const [customOptions, setCustomOptions] = useState([]);
  const [imagePreview, setImagePreview] = useState('');

  const handleDeleteProduct = async (productData) => {
    const isConfirmed = window.confirm(
      '¿Estás seguro de que quieres eliminar este producto?'
    );
    if (!isConfirmed) return;
    setLoading(true);
    try {
      await deleteProduct(productData.id, productData.userId);
      showAlert('Producto eliminado correctamente', 'success');
      handleClose();
    } catch (error) {
      showAlert('Error al eliminar el producto', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetProduct = useCallback(() => {
    if (!isEditing) setProduct(initialCreateProductState);
    setCustomOptions([]);
    setImagePreview('');
    handleClose();
  }, [handleClose]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField(setProduct, 'image', file);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para limpiar las propiedades que no queremos enviar al back
  const buildProductPayload = (product) => {
    const { customOptions, productCustomOptions, category, ...payload } =
      product;

    return payload;
  };

  const handleSaveChanges = useCallback(async () => {
    if (!product.name)
      return showAlert(
        'Por favor completar el campo NOMBRE del producto',
        'warning'
      );
    if (!product.price)
      return showAlert(
        'Por favor completar el campo PRECIO del producto',
        'warning'
      );
    if (!product.categoryId)
      return showAlert(
        'Por favor completar el campo CATEGORIA del producto',
        'warning'
      );
    setLoading(true);

    try {
      if (isEditing) {
        await updateProduct(buildProductPayload(product));
        showAlert('Producto Actualizado Correctamente!', 'success');
        resetProduct();
      } else {
        await addProduct(buildProductPayload(product));
        showAlert('Producto Creado Exitosamente!', 'success');
        resetProduct();
      }
    } catch (error) {
      const errorMessage = error || 'Error desconocido';
      showAlert(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [product, resetProduct]);

  useEffect(() => {
    if (show && userState?.user?.id) {
      getAllCustomOptions(userState.user.id);
      if (isEditing && showProduct) {
        setProduct({
          ...initialUpdateProductState,
          ...showProduct,
          category: showProduct?.category?.name,
          categoryId: showProduct?.categoryId,
          customOptions: [],
          productCustomOptions: [],
        });
        setCustomOptions(showProduct?.productCustomOptions || []);
        setImagePreview(showProduct?.image);
      } else {
        if (userState?.user?.id) {
          setProduct({
            ...initialCreateProductState,
            userId: userState?.user?.id,
          });
        }
      }
    }
  }, [show, isEditing, showProduct, userState.user.id, getAllCustomOptions]);

  if (loading) return <LoadingComponent message={'Guardando cambios...'} />;

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
          maxHeight: { xs: '100vh', sm: '90vh', md: '85vh' },
          width: { xs: '100%', sm: 'auto', md: '600px' },
          margin: { xs: 0, sm: '32px' },
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
          padding: { xs: 2, sm: 3, md: 3 },
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
              color: 'primary.main',
              fontSize: { xs: '18px', sm: '24px', md: '20px' },
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 0.5, sm: 1, md: 1.5 },
              fontWeight: 'bold',
            }}
          >
            {isEditing ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO'}
          </Typography>
        </Box>
        <IconButton
          aria-label="Cerrar modal"
          onClick={resetProduct}
          sx={{
            color: 'primary.main',
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Tabs
        value={tab}
        onChange={(_, newTab) => setTab(newTab)}
        centered
        variant="fullWidth"
        sx={{
          mt: 2,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Tab
          label="Datos generales"
          sx={{
            fontFamily: 'fontFamily.primary',
            color: 'text.primary',
            borderRadius: 1,
            '&.Mui-selected': {
              color: 'primary.main',
              bgcolor: 'background.paper',
            },
          }}
        />
        <Tab
          label="Opciones asignadas"
          sx={{
            fontFamily: 'fontFamily.primary',
            color: 'text.primary',
            borderRadius: 1,
            '&.Mui-selected': {
              color: 'primary.main',
              bgcolor: 'background.default',
            },
          }}
        />
      </Tabs>

      <DialogContent
        dividers
        sx={{
          maxHeight: '60vh',
          overflowY: 'auto',
          paddingX: 3,
          paddingY: 3,
          borderTop: 'none',
          borderBottom: 'none',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'primary.dark',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'primary.main',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            bgcolor: 'primary.light',
          },
        }}
      >
        {tab === 0 && (
          <ProductInfo
            product={product}
            setProduct={setProduct}
            allCategories={allCategories}
            imagePreview={imagePreview}
            handleImageUpload={handleImageUpload}
          />
        )}
        {tab === 1 && <CustomOptions selectedOptions={customOptions} />}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {/* BOTÓN PARA ELIMINAR PRODUCTO (DEV) */}
        {isEditing && (
          <Button
            size="small"
            onClick={() => handleDeleteProduct(product)}
            variant="contained"
            sx={deleteButtonStyle}
          >
            Eliminar
          </Button>
        )}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            size="medium"
            onClick={resetProduct}
            variant="contained"
            sx={cancelButtonStyle}
          >
            Cancelar
          </Button>
          <Button
            size="medium"
            onClick={handleSaveChanges}
            variant="contained"
            sx={submitButtonStyle}
          >
            {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
