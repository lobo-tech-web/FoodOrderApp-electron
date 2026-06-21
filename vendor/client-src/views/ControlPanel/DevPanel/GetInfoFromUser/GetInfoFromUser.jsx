import { useState, useEffect, useMemo } from 'react';

// ---- MATERIAL UI ----
import { Box, Tab, Tabs } from '@mui/material';
// ------------------

// ---- COMPONENTS ----
import { DevPanelNavBar } from '@/components/PanelComponents/DevPanelNavBar/DevPanelNavBar.jsx';
import { ModalEditProduct } from '@/components/PanelComponents/ModalEditProduct/ModalEditProduct.jsx';
import { ModalEditCategory } from '@/components/PanelComponents/ModalEditCategory/ModalEditCategory.jsx';
import { ProductsTable } from './ProductsTable/ProductsTable.jsx';
import { UserTable } from './UserTable/UserTable.jsx';
import { CategoryTable } from './CategoryTable/CategoryTable.jsx';
import { OrderTable } from './OrderTable/OrderTable.jsx';
// --------------------

// ----- CONTEXT --------
import { useProducts } from '@/context/Products.jsx';
import { useUser } from '@/context/Users.jsx';
// ----------------------

// ---- STYLES ----
const tabStyles = {
  fontFamily: 'fontFamily.primary',
  color: 'text.primary',
  borderRadius: 1,
  '&.Mui-selected': {
    color: 'primary.main',
    backgroundColor: 'background.default',
  },
};
// ----------------

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const GetInfoFromUser = () => {
  const { productState, getAllCategorys, clearAllProductContext } =
    useProducts();
  const { userState, clearAllUserInfo } = useUser();

  // TRAEMOS LOS PRODUCTS DEL CONTEXT
  const getAllUserInfo = useMemo(
    () => userState.userInfo || [],
    [userState.userInfo]
  );

  // TRAEMOS LAS CATEGORIAS DEL CONTEXT
  const allCategorys = useMemo(
    () => productState.categorys || [],
    [productState.categorys]
  );

  const refreshGetInfoFromUser = () => {
    clearAllUserInfo();
    clearAllProductContext();
  };

  // SELECTED PRODUCT PUT PRODUCTS
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [open, setOpen] = useState(false);
  const handleOpen = (product) => {
    setSelectedProduct(product);
    setOpen(true);
  };

  // SELECTED CATEGORY PUT CATEGORY
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openCategory, setOpenCategory] = useState(false);
  const handleOpenCategory = (category) => {
    setSelectedCategory(category);
    setOpenCategory(true);
  };

  const handleClose = () => setOpen(false);
  const handleCloseCategory = () => setOpenCategory(false);

  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    if (userState.userInfo && userState.userInfo.id)
      getAllCategorys(userState.userInfo.id);
  }, [userState.userInfo, getAllCategorys]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ maxWidth: 'auto', width: '100%' }}>
        <DevPanelNavBar
          isAllInfoFromUser={true}
          refreshGetInfoFromUser={refreshGetInfoFromUser}
        />

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'primary.main', mt: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="info-from-user panel tabs"
            sx={{
              '& .MuiTabs-indicator': { bgcolor: 'primary.main' },
            }}
          >
            <Tab label="Usuario" sx={tabStyles} />

            <Tab label="Productos / Categorias" sx={tabStyles} />

            <Tab label="Pedidos" sx={tabStyles} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {getAllUserInfo && <UserTable user={getAllUserInfo} />}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {allCategorys && (
            <CategoryTable
              allCategorys={allCategorys}
              handleOpen={handleOpenCategory}
            />
          )}
          {getAllUserInfo.products && (
            <ProductsTable
              allProducts={getAllUserInfo?.products}
              handleOpen={handleOpen}
            />
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {getAllUserInfo.orders && (
            <OrderTable allOrders={getAllUserInfo?.orders} />
          )}
        </TabPanel>
      </Box>
      {/* Modal para editar el producto */}
      <ModalEditProduct
        show={open}
        handleClose={handleClose}
        showProduct={selectedProduct}
        isEditing={true}
      />
      <ModalEditCategory
        show={openCategory}
        handleClose={handleCloseCategory}
        showCategory={selectedCategory}
        isEditing={true}
      />
    </Box>
  );
};
