import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ---- MATERIAL UI ----
import {
  Container,
  ThemeProvider,
  Typography,
  Box,
  Stack,
  useTheme,
  useMediaQuery,
  Fade,
  Paper,
} from '@mui/material';
//<---------------------

// ---- UTILS ----
import { hasSpecialTitle } from '@/utils/productUtils.js';
// ---------------

// ---- CONTEXT ----
import { useProducts } from '@/context/Products.jsx';
import { useUser } from '@/context/Users.jsx';
// <----------------

// ---- LOGO ----
import logo from '@/assets/tasting-coffe/tasting-coffe-logo.jpeg';
import { tastingCoffeTheme } from '@/theme/Client-theme/tastingCoffe-theme.js';
// <------------

// ---- FONT-AWESOME ----
import { faMugSaucer } from '@fortawesome/free-solid-svg-icons';
// ----------------------

// ---- COMPONENTS ----
import { LoadingComponent } from '@/components/LoadingComponent/LoadingComponent.jsx';
import { MainNavBar } from '@/components/MainNavBar/MainNavBar.jsx';
import { CartNavBar } from '@/components/CartNavBar/CartNavBar.jsx';
import { FoodCard } from '@/components/FoodCard/FoodCard.jsx';
import { FoodDetailModal } from '@/components/FoodDetailModal/FoodDetailModal.jsx';
import { CategoryNavBar } from '@/components/CategoryNavBar/CategoryNavBar.jsx';
import { ClientProfileBanner } from '@/components/ClientProfileSection/ClientProfileBanner.jsx';
// --------------------

// ---- ID DEL CLIENTE ----
const client_id = import.meta.env.VITE_API_CLIENT_TASTING_COFFE_ID;
// <-----------------------

export const TastingCoffeProductsPage = () => {
  // DETECTAMOS SI EL USUARIO ESTA EN MÓVIL
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(false);

  // Estados y handlers para el FoodDetailModal (centralizados aquí)
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleProductClick = (product) => {
    const newPrice =
      product.discount > 0
        ? Math.round(
            (product.price - (product.price * product.discount) / 100) / 100
          ) * 100
        : Math.round(product.price);
    setSelectedProduct({
      ...product,
      price: newPrice,
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  const {
    productState,
    getAllProducts,
    getAllCategorys,
    clearAllProductContext,
  } = useProducts();
  const { userState, getClientInfo } = useUser();

  // TRAEMOS LOS PRODUCTOS DEL CONTEXT
  const allProducts = useMemo(
    () => productState.products || [],
    [productState.products]
  );

  // TRAEMOS LAS CATEGORIAS DEL CONTEXT
  const allCategories = useMemo(
    () => productState.categorys || [],
    [productState.categorys]
  );

  // ORDENA LOS PRODUCTOS DENTRO DE SUS CATEGORIAS EN UN MAP
  const productsByCategoryMap = useMemo(() => {
    const map = {};

    for (const product of allProducts) {
      if (!product.status) continue;

      const categoryId = product.categoryId;

      if (!map[categoryId]) {
        map[categoryId] = [];
      }

      map[categoryId].push(product);
    }

    Object.values(map).forEach((products) => {
      products.sort((a, b) => {
        const aHas = hasSpecialTitle(a);
        const bHas = hasSpecialTitle(b);

        if (aHas && !bHas) return -1;
        if (!aHas && bHas) return 1;
        return 0;
      });
    });

    return map;
  }, [allProducts]);

  // MUESTRA LAS CATEGORIAS QUE CONTENGAN PRODUCTOS
  const categoriesWithProducts = useMemo(() => {
    return allCategories
      .filter((category) => productsByCategoryMap[category.id]?.length > 0)
      .sort((a, b) => a.position - b.position);
  }, [allCategories, productsByCategoryMap]);

  // INFORMACION DEL CLIENTE (RESTAURANTE)
  const clientInfo = useMemo(
    () => userState.clientUserInfo || {},
    [userState.clientUserInfo]
  );

  // ---- INFORMACIÓN HARDCODEADA PARA CADA CLIENTE ----
  const tastingCoffeURL = 'https://www.lobo-tech.com.ar/menu/tasting-coffe';

  const tastingCoffeInfo = {
    title: 'Tasting Coffe',
    location: 'España 249 - Bahia Blanca - Bs. As.',
    description:
      '!BIENVENIDO/A! HACE TU PEDIDO PARA CONSUMIR EN LOCAL, RETIRAR O PEDÍ CON ENVIO A DOMICILIO',
    socialMedia: {
      instagram: 'https://www.instagram.com',
      share: tastingCoffeURL,
    },
    orderButtonDescription: 'TAKE AWAY & DELIVERY',
  };
  // ----------------------------------------------------

  const isRefreshingRef = useRef(false);

  const refreshMenuData = useCallback(
    async ({ showLoader = false, clearContext = false } = {}) => {
      if (!client_id) return;
      if (isRefreshingRef.current) return;

      isRefreshingRef.current = true;

      try {
        if (showLoader) {
          setLoading(true);
        }

        if (clearContext) {
          clearAllProductContext();
        }

        await Promise.all([
          getClientInfo(client_id),
          getAllProducts(client_id),
          getAllCategorys(client_id),
        ]);
      } catch (error) {
        console.error(error?.message || error || 'Error al cargar el menú');
      } finally {
        isRefreshingRef.current = false;

        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [clearAllProductContext, getClientInfo, getAllProducts, getAllCategorys]
  );

  useEffect(() => {
    refreshMenuData({
      showLoader: true,
      clearContext: true,
    });
  }, [refreshMenuData]);

  useEffect(() => {
    const refreshInBackground = () => {
      refreshMenuData({
        showLoader: false,
        clearContext: false,
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshInBackground();
      }
    };

    window.addEventListener('focus', refreshInBackground);
    window.addEventListener('pageshow', refreshInBackground);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', refreshInBackground);
      window.removeEventListener('pageshow', refreshInBackground);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshMenuData]);

  if (loading)
    return (
      <LoadingComponent message={'Cargando...'} theme={tastingCoffeTheme} />
    );

  return (
    <ThemeProvider theme={tastingCoffeTheme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          position: 'relative',
          bgcolor: 'background.main',
        }}
      >
        <MainNavBar
          customIcon={faMugSaucer}
          title={'Tasting Coffe'}
          restaurantId={client_id}
        />

        {/* CLIENT PROFILE */}
        <ClientProfileBanner
          logo={logo}
          clientInformation={tastingCoffeInfo}
          clientWorkingHours={clientInfo.workingHours}
          clientURL={tastingCoffeURL}
        />

        {/* CATEGORY NAVBAR */}
        <CategoryNavBar categories={categoriesWithProducts} />

        {/* PRODUCT CARDS */}
        <Container
          sx={{
            py: { xs: 2, sm: 4 },
            px: { xs: 1, sm: 2, md: 3 },
            maxWidth: { xs: '100%', sm: '95%', lg: '1200px' },
            borderRadius: '8px',
          }}
        >
          {categoriesWithProducts?.length > 0 &&
            categoriesWithProducts.map((category) => {
              const products = productsByCategoryMap[category.id] || [];
              return (
                <Fade key={category.id} in={true} timeout={500}>
                  <Paper
                    id={`category-${category.id}`}
                    elevation={1}
                    sx={{
                      mb: 4,
                      borderRadius: 2,
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      bgcolor: 'transparent',
                      border: 2,
                      borderColor: 'primary.main',
                    }}
                  >
                    {/* TÍTULO DE CATEGORÍA */}
                    <Box
                      sx={{
                        bgcolor: 'primary.main',
                        p: { xs: 1.5, sm: 2 },
                        position: 'relative',
                        borderBottom: '1px solid',
                        borderColor: 'primary.main',
                      }}
                    >
                      <Typography
                        variant={isMobile ? 'h5' : 'h4'}
                        sx={{
                          fontFamily: 'fontFamily.primary',
                          bgcolor: 'primary.main',
                          color: 'text.secondary',
                          textAlign: 'center',
                          display: 'block',
                          padding: '8px',
                        }}
                      >
                        {category.name}
                      </Typography>
                    </Box>

                    <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
                      <Stack spacing={2}>
                        {allProducts.length > 0 &&
                          allProducts
                            .filter(
                              (product) =>
                                product.categoryId === category.id &&
                                product.status === true
                            )
                            .map((product) => (
                              <Box key={product.id}>
                                <FoodCard
                                  product={product}
                                  imageDefault={logo}
                                  onProductClick={handleProductClick}
                                />
                              </Box>
                            ))}
                      </Stack>
                    </Box>
                  </Paper>
                </Fade>
              );
            })}
        </Container>

        {/* NAVBAR DEL CARRITO */}
        <CartNavBar linkToCart={'/menu/tasting-coffe/cart'} />

        {selectedProduct && (
          <FoodDetailModal
            open={modalOpen}
            onClose={handleCloseModal}
            product={selectedProduct}
            imageDefault={logo}
          />
        )}
      </Box>
    </ThemeProvider>
  );
};
