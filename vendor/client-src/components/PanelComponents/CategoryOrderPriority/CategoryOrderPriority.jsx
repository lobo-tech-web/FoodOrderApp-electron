import { useState, useEffect } from 'react';

// ---- MATERIAL UI ----
import {
  Typography,
  Box,
  Button,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Category as CategoryIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
} from '@mui/icons-material';

// <--------------------

// ---- CONTEXT ----
import { useProducts } from '@/context/Products.jsx';
import { useUser } from '@/context/Users.jsx';
// -----------------

// ---- COMPONENTS ----
import { LoadingComponent } from '@/components/LoadingComponent/LoadingComponent.jsx';
// --------------------

// ---- SERVICES ----
import { updateCategoryPositionServices } from '@/services/categorys.js';
// ------------------

// ---- STYLES ----
const fieldStyles = {
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
// ----------------

export const CategoryOrderPriority = ({ show, handleClose, showAlert }) => {
  const [loading, setLoading] = useState(false);

  // CONTEXT
  const { productState, getAllCategorys } = useProducts();
  const { userState } = useUser();

  // ESTADOS
  const [orderedCategories, setOrderedCategories] = useState([]);

  const moveCategory = (index, direction) => {
    const updated = [...orderedCategories];

    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= updated.length) return;

    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

    const reordered = updated.map((category, idx) => ({
      ...category,
      position: idx + 1,
    }));

    setOrderedCategories(reordered);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (userState?.user?.id) {
        const payload = orderedCategories.map((category) => ({
          id: category.id,
          position: category.position,
        }));

        await updateCategoryPositionServices(userState.user.id, payload);
        await getAllCategorys(userState.user.id);
        showAlert('Categorias ordenadas exitosamente', 'success');
        handleClose();
      }
    } catch (error) {
      showAlert(
        'Error al guardar los cambios',
        error || error?.message || 'Error desconocido'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productState.categorys.length > 0) {
      const sortedCategories = [...productState.categorys].sort(
        (a, b) => a.position - b.position
      );
      setOrderedCategories(sortedCategories);
    }
  }, [productState.categorys]);

  if (loading) return <LoadingComponent message={'Guardando cambios...'} />;

  return (
    <Dialog
      open={show}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        elevation: 3,
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: 'fontFamily.terciary',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 2,
          color: 'primary.main',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Typography
            variant="h5"
            component="span"
            sx={{ display: 'flex', justifyContent: 'flex-start' }}
          >
            LISTADO DE CATEGORIAS
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{ maxHeight: '65vh', overflowY: 'auto', p: 3 }}
      >
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'fontFamily.secondary',
            mb: 2,
            color: 'text.primary',
          }}
        >
          Seleccioná las categorías en el orden que quieres que aparezcan en tu
          menú.
        </Typography>

        <Divider sx={{ bgcolor: 'primary.main', mb: 2 }} />

        <Typography
          variant="h6"
          sx={{
            fontFamily: 'fontFamily.terciary',
            textAlign: 'center',
            mb: 2,
            color: 'primary.main',
          }}
        >
          CATEGORIAS DISPONIBLES
        </Typography>

        {/* LISTADO DE CATEGORIAS */}
        <List
          dense
          sx={{
            maxHeight: 400,
            overflowY: 'auto',
            border: '1px solid',
            borderColor: 'primary.main',
            borderRadius: 1,
            mb: 2,
          }}
        >
          {orderedCategories.map((category, index) => (
            <ListItem
              key={category.id}
              sx={{
                fontFamily: 'fontFamily.secondary',
                color: 'text.primary',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <Button
                variant="contained"
                size="small"
                onClick={() => moveCategory(index, 'down')}
                sx={{
                  bgcolor: 'error.main',
                  minWidth: '32px',
                  display: { xs: 'inline-flex', sm: 'inline-flex' },
                  mr: 2,
                }}
              >
                <ArrowDownwardIcon sx={{ fontSize: '1.2rem' }} />
              </Button>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  flexGrow: 1,
                  justifyContent: 'center',
                }}
              >
                <ListItemIcon>
                  <CategoryIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={`#${category.position} - ${category.name.toUpperCase()}`}
                />
              </Box>
              <Button
                variant="contained"
                size="small"
                onClick={() => moveCategory(index, 'up')}
                sx={{
                  bgcolor: 'success.main',
                  minWidth: '32px',
                  display: { xs: 'inline-flex', sm: 'inline-flex' },
                }}
              >
                <ArrowUpwardIcon sx={{ fontSize: '1.2rem' }} />
              </Button>
            </ListItem>
          ))}
        </List>
      </DialogContent>

      <DialogActions
        sx={{
          justifyContent: 'flex-end',
          px: 3,
          py: 2,
          borderTop: '1px solid',
          borderColor: 'primary.secondary',
        }}
      >
        <Button
          color="error"
          size="medium"
          onClick={handleClose}
          variant="contained"
          sx={{ fontFamily: 'fontFamily.primary' }}
        >
          Cancelar
        </Button>
        <Button
          color="primary"
          size="medium"
          onClick={handleSubmit}
          variant="contained"
          sx={{ fontFamily: 'fontFamily.primary' }}
        >
          Guardar cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
};
