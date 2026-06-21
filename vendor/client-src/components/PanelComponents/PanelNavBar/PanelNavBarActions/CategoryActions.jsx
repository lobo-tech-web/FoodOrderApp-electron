// ---- MATERIAL UI ----
import { Button, Box, useMediaQuery, useTheme } from '@mui/material';
// <--------------------

// ---- COMPONENTS ----
import { RefreshComponent } from '@/components/PanelComponents/RefreshComponent/RefreshComponent.jsx';
// MODALES
import { ModalEditCategory } from '@/components/PanelComponents/ModalEditCategory/ModalEditCategory.jsx';
import { CategoryOrderPriority } from '@/components/PanelComponents/CategoryOrderPriority/CategoryOrderPriority.jsx';
// ICONS
import {
  Add as AddIcon,
  Category as CategoryIcon,
  ImportExport as ImportExportIcon,
} from '@mui/icons-material';
// --------------------

// ---- STYLES ----
const buttonStyle = {
  bgcolor: 'primary.main',
  color: 'text.terciary',
  fontFamily: 'fontFamily.terciary',
  borderRadius: '8px',
  px: { xs: 1.5, sm: 2, md: 3 },
  py: { xs: 0.5, sm: 1 },
  fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
  minWidth: { xs: 'auto', sm: '120px' },
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    bgcolor: 'background.paper',
    color: 'primary.main',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  },
};
// ----------------

export const CategoryActions = ({
  refreshCategorys,
  modalState,
  toggleModal,
  showAlert,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <RefreshComponent
          isCategoryPanel={true}
          refreshCategorys={refreshCategorys}
        />
        <Button
          startIcon={<AddIcon sx={{ fontSize: { xs: 18, md: 22 } }} />}
          onClick={() => {
            toggleModal('createCategory', true);
          }}
          variant="contained"
          sx={{ ...buttonStyle, bgcolor: 'success.main' }}
        >
          {!isMobile && 'Nueva Categoria'}
        </Button>
        <Button
          startIcon={<ImportExportIcon sx={{ fontSize: { xs: 18, md: 22 } }} />}
          onClick={() => {
            toggleModal('orderCategory', true);
          }}
          variant="contained"
          sx={buttonStyle}
        >
          {!isMobile && 'Ordenar Categorias'}
        </Button>
      </Box>
      {/* CREAR CATEGORIA */}
      {modalState.createCategory && (
        <ModalEditCategory
          show={modalState.createCategory}
          handleClose={() => {
            toggleModal('createCategory', false);
          }}
          showAlert={showAlert}
        />
      )}

      {/* ORDENAR PRIORIDAD DE CATEGORIAS */}
      {modalState.orderCategory && (
        <CategoryOrderPriority
          show={modalState.orderCategory}
          handleClose={() => {
            toggleModal('orderCategory', false);
          }}
          showAlert={showAlert}
        />
      )}
    </>
  );
};
