import { useState, useEffect, useCallback } from 'react';

// ---- MATERIAL UI ----
import {
  Paper,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Category as CategoryIcon,
  DeleteOutline as DeleteOutlineIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
// ---------------------

// ---- UTILS ----
import {
  initialUpdateCategoryState,
  initialCreateCategoryState,
} from '@/utils/categoryUtils.js';
// ---------------

// ---- COMPONENTS ----
import { LoadingComponent } from '@/components/LoadingComponent/LoadingComponent.jsx';
// --------------------

// ---- CONTEXT ----
import { useProducts } from '@/context/Products.jsx';
import { useUser } from '@/context/Users.jsx';
// -----------------

// ---- SERVICES ----
import { deleteCategoryService } from '@/services/categorys.js';
// ------------------

// ---- STYLES ----
const inputStyles = {
  '& .MuiInputBase-root': {
    fontFamily: 'fontFamily.primary',
    fontSize: { xs: '14px', sm: '16px', md: '16px' },
    minHeight: { xs: '48px', sm: '56px', md: '56px' },
    color: 'text.primary',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: { xs: '8px', sm: '12px' },
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(184, 182, 186, 0.3)',
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: 'primary.main',
      borderWidth: '1px',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main',
      borderWidth: '2px',
      boxShadow: '0 0 0 3px rgba(245, 166, 35, 0.2)',
    },
  },
  width: '100%',
  marginBottom: { xs: '16px', sm: '20px', md: '20px' },
};

const labelStyle = {
  fontFamily: 'fontFamily.primary',
  color: 'primary.main',
  fontWeight: 'bold',
  fontSize: { xs: '14px', sm: '16px', md: '16px' },
  lineHeight: 1,
  margin: 0,
};

const labelContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: { xs: 1, sm: 1.5, md: 1.5 },
  mb: { xs: 1, sm: 1.5, md: 1 },
};

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

export const ModalEditCategory = ({
  show,
  handleClose,
  showAlert,
  isEditing,
  showCategory,
  selectedCategoryItems,
  fetchCategorys,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isXsScreen = useMediaQuery(theme.breakpoints.down('xs'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const [loading, setLoading] = useState(false);

  const { addNewCategory, updateCategory } = useProducts();
  const { userState } = useUser();
  const [category, setCategory] = useState(initialUpdateCategoryState);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCategory((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeleteCategory = async (categoryData) => {
    const isConfirmed = window.confirm(
      '¿Estás seguro de que quieres eliminar esta CATEGORIA?'
    );
    if (!isConfirmed) return;

    // SI LA CATEGORIA CONTIENE PRODUCTOS NO ELIMINARLA
    if (Number(selectedCategoryItems) > 0) {
      showAlert(
        'No se puede eliminar una categoria con productos asignados',
        'warning'
      );
      return;
    }
    setLoading(true);
    try {
      const deletedCategory = {
        categoryId: categoryData.id,
        userId: categoryData.userId,
      };
      await deleteCategoryService(deletedCategory);
      showAlert('CATEGORIA eliminada correctamente', 'success');
      handleClose();
      fetchCategorys();
    } catch (error) {
      showAlert('Error al eliminar la CATEGORIA', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetCategory = useCallback(() => {
    if (!isEditing) setCategory(initialCreateCategoryState);
    handleClose();
  }, [handleClose]);

  const handleSaveChanges = useCallback(async () => {
    if (!category.name || !category.userId) {
      showAlert(
        'Por favor completar todos los campos requeridos obligatoriamente',
        'warning'
      );
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await updateCategory(category);
        showAlert('Categoria Actualizada Correctamente!', 'success');
        resetCategory();
      } else {
        await addNewCategory(category);
        showAlert('Categoria Creada Exitosamente!', 'success');
        resetCategory();
      }
    } catch (error) {
      const errorMessage = error || 'Error desconocido';
      showAlert(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [category, resetCategory]);

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSaveChanges();
    } else if (event.key === 'Escape') {
      handleClose();
    }
  };

  useEffect(() => {
    if (show) {
      if (isEditing && showCategory) {
        setCategory({
          ...initialUpdateCategoryState,
          ...showCategory,
        });
      } else {
        if (userState?.user?.id) {
          setCategory({
            ...initialCreateCategoryState,
            userId: userState?.user?.id,
          });
        }
      }
    }
  }, [show, isEditing, showCategory, userState.user]);

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
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <CategoryIcon color="primary" />
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
            {isEditing ? 'EDITAR CATEGORIA' : 'CREAR CATEGORIA'}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* BOTÓN PARA ELIMINAR CATEGORIA */}
          {isEditing && (
            <Button
              startIcon={<DeleteOutlineIcon />}
              size="small"
              variant="contained"
              onClick={() => handleDeleteCategory(category)}
              sx={deleteButtonStyle}
            >
              Eliminar categoria
            </Button>
          )}
        </Box>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            bgcolor: 'background.paper',
            borderRadius: { xs: '8px', sm: '12px' },
            border: '1px solid rgba(184, 182, 186, 0.1)',
            mb: { xs: 2, sm: 3 },
            mt: { xs: 1, sm: 1.5 },
          }}
        >
          <Box component="form" noValidate sx={{ width: '100%' }}>
            <Box>
              <Box sx={labelContainerStyle}>
                <Typography sx={labelStyle}>NOMBRE DE LA CATEGORIA</Typography>
              </Box>
              <TextField
                required
                fullWidth
                type="text"
                name="name"
                value={category.name}
                onChange={(e) => handleInputChange(e)}
                autoFocus
                onKeyDown={handleKeyPress}
                sx={{
                  ...inputStyles,
                  '& .MuiInputBase-input': {
                    padding: {
                      xs: '14px 16px',
                      sm: '16px 20px',
                      md: '20px 24px',
                    },
                  },
                }}
                inputProps={{
                  style: {
                    fontSize: isMobile ? '16px' : isDesktop ? '16px' : '14px',
                  },
                }}
              />
            </Box>
          </Box>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            size="medium"
            onClick={resetCategory}
            variant="contained"
            sx={cancelButtonStyle}
          >
            Cancelar
          </Button>
          <Button
            startIcon={<SaveIcon />}
            size="medium"
            variant="contained"
            color="primary"
            onClick={handleSaveChanges}
            sx={submitButtonStyle}
          >
            {isEditing ? 'Guardar Cambios' : 'Crear Categoria'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
