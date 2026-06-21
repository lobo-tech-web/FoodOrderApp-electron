import { useState, useEffect, useMemo } from 'react';
// ---- MATERIAL UI ----
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  InputAdornment,
  Chip,
  IconButton,
} from '@mui/material';
// ICONS
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Star as StarIcon,
  MonetizationOn as MoneyIcon,
} from '@mui/icons-material';
// ---------------------

// ---- LOGO (IMAGEDEFAULT) ----
import mainLogo from '@/assets/main/logo-white.png';
// -----------------------------

// ---- THEME ----
import { lobotechAppFoodDetailTheme } from '@/theme/main-theme.js';
// ---------------

// ---- COMPONENTS ----
import { FoodDetailModal } from '@/components/FoodDetailModal/FoodDetailModal.jsx';
// --------------------

// ---- UTILS ----
import { getProductOptionsForUI } from '@/utils/migrateCustomOptions.js';
// ---------------

export const ModalSelectProducts = ({
  open,
  onClose,
  onSelectProduct,
  products = [],
  editingProduct = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  // ✅ Nuevo estado para controlar el FoodDetailModal
  const [foodDetailModalState, setFoodDetailModalState] = useState({
    isOpen: false,
    product: null,
  });

  // ✅ FILTRAR PRODUCTOS POR BÚSQUEDA
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;

    const term = searchTerm.toLowerCase();

    return products.filter((product) => {
      const name = product.name?.toLowerCase() || '';
      const description = product.description?.toLowerCase() || '';

      return name.includes(term) || description.includes(term);
    });
  }, [products, searchTerm]);

  // ✅ MANEJAR SELECCIÓN DE PRODUCTO
  const handleSelectProduct = (product) => {
    const newPrice =
      product.discount > 0
        ? Math.round(
            (product.price - (product.price * product.discount) / 100) / 100
          ) * 100
        : Math.round(product.price);

    const productOptions = getProductOptionsForUI(product);
    const hasCustomOptions = productOptions.length > 0;

    if (hasCustomOptions) {
      setFoodDetailModalState({
        isOpen: true,
        product: { ...product, price: newPrice },
      });
    } else {
      onSelectProduct({
        ...product,
        productId: product.productId || product.id,
        price: newPrice,
        customOptions: [],
      });
      setSearchTerm('');
      onClose();
    }
  };

  // ✅ Callback cuando el producto es personalizado en FoodDetailModal
  const handleProductCustomized = (customizedItem) => {
    onSelectProduct(customizedItem); // Agregamos el producto personalizado al pedido
    setFoodDetailModalState({ isOpen: false, product: null });
    setSearchTerm('');
    onClose(); // Cerrar ModalSelectProducts
  };

  // ✅ CERRAR MODAL DE SELECCIÓN DE PRODUCTOS
  const handleClose = () => {
    setSearchTerm('');
    onClose();
  };

  // ✅ CERRAR MODAL DE DETALLE DE COMIDA (si el usuario cancela la personalización)
  const handleCloseFoodDetailModal = () => {
    setFoodDetailModalState({ isOpen: false, product: null });
  };

  useEffect(() => {
    if (!editingProduct || products.length !== 1) return;

    const productOptions = getProductOptionsForUI(products[0]);

    if (productOptions.length > 0) {
      handleSelectProduct(products[0]);
    }
  }, [editingProduct, products]);

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        aria-labelledby="product-modal-title"
      >
        <DialogTitle
          id="product-modal-title"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'fontFamily.primary',
            color: 'primary.main',
            bgcolor: 'background.paper',
          }}
        >
          <Typography variant="h6">
            {editingProduct ? 'MODIFICAR PRODUCTO' : 'SELECCIONAR PRODUCTO'}
          </Typography>
          <IconButton onClick={handleClose} size="small" color="primary">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {/* ✅ BUSCADOR */}
          {!editingProduct && (
            <TextField
              fullWidth
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                color: 'text.primary',
                border: '1px solid',
                borderColor: 'primary.main',
                mt: 2,
                mb: 2,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          )}

          {/* ✅ LISTA DE PRODUCTOS */}
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {filteredProducts.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'fontFamily.primary',
                    color: 'text.primary',
                  }}
                >
                  {searchTerm
                    ? 'NO SE ENCONTRARON PRODUCTOS'
                    : 'NO HAY PRODUCTOS DISPONIBLES'}
                </Typography>
              </Box>
            ) : (
              filteredProducts.map((product) => (
                <ListItem
                  key={product.id}
                  sx={{
                    bgcolor: 'background.paper',
                    border: '2px solid',
                    borderColor: 'primary.main',
                    borderRadius: 2,
                    mb: 1,
                    '&:hover': {
                      bgcolor: 'background.default',
                      borderColor: 'text.primary',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={product.image || mainLogo}
                      sx={{
                        bgcolor: 'primary.main',
                        width: 56,
                        height: 56,
                      }}
                    />
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            fontFamily: 'fontFamily.primary',
                            fontWeight: 'bold',
                            color: 'primary.main',
                          }}
                        >
                          {product.name.toUpperCase()}
                        </Typography>
                        {product.isVeggie && <Chip label="🌱" size="small" />}
                        {product.isSinTacc && <Chip label="🌾" size="small" />}

                        {product.discount > 0 && (
                          <Chip
                            label={`-${product.discount}% OFF`}
                            size="small"
                            sx={{
                              fontFamily: 'fontFamily.terciary',
                              color: 'text.terciary',
                              bgcolor: 'primary.main',
                            }}
                          />
                        )}

                        {!product.status && (
                          <Chip
                            color="secondary"
                            label="PRODUCTO DESACTIVADO"
                            size="small"
                            sx={{ fontFamily: 'fontFamily.primary' }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'fontFamily.secondary',
                            color: 'text.secondary',
                            mb: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {product.description}
                        </Typography>

                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            flexWrap: 'wrap',
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                            }}
                          >
                            {product.discount > 0 ? (
                              <>
                                <MoneyIcon
                                  sx={{ fontSize: 16, color: 'gray' }}
                                />
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontFamily: 'fontFamily.terciary',
                                    fontWeight: 'bold',
                                    color: 'gray',
                                    textDecoration: 'line-through',
                                  }}
                                >
                                  $
                                  {Math.round(product.price).toLocaleString(
                                    'es-AR'
                                  )}
                                </Typography>

                                <MoneyIcon
                                  sx={{ fontSize: 16, color: 'success.main' }}
                                />
                                <Typography
                                  variant="body1"
                                  sx={{
                                    fontFamily: 'fontFamily.terciary',
                                    fontWeight: 'bold',
                                    color: 'success.main',
                                  }}
                                >
                                  $
                                  {(
                                    Math.round(
                                      (product.price *
                                        (1 - product.discount / 100)) /
                                        100
                                    ) * 100
                                  ).toLocaleString('es-AR')}
                                </Typography>
                              </>
                            ) : (
                              <>
                                <MoneyIcon
                                  sx={{ fontSize: 16, color: 'success.main' }}
                                />
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontFamily: 'fontFamily.terciary',
                                    fontWeight: 'bold',
                                    color: 'success.main',
                                  }}
                                >
                                  $
                                  {Math.round(product.price).toLocaleString(
                                    'es-AR'
                                  )}
                                </Typography>
                              </>
                            )}
                          </Box>

                          {product.rewardPoints > 0 && (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                              }}
                            >
                              <StarIcon
                                sx={{ fontSize: 16, color: 'warning.main' }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: 'fontFamily.terciary',
                                  color: 'warning.main',
                                }}
                              >
                                +{product.rewardPoints} pts
                              </Typography>
                            </Box>
                          )}

                          {product.redeemPoints > 0 && (
                            <Chip
                              label={`CANJE ${product.redeemPoints} pts`}
                              size="small"
                              color="error"
                              variant="contained"
                              sx={{ fontFamily: 'fontFamily.terciary' }}
                            />
                          )}
                        </Box>
                      </Box>
                    }
                  />

                  <Button
                    color="primary"
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => handleSelectProduct(product)}
                    disabled={!product.status}
                    sx={{
                      fontFamily: 'fontFamily.terciary',
                      ml: 1,
                    }}
                  >
                    {editingProduct ? 'MODIFICAR' : 'AGREGAR'}
                  </Button>
                </ListItem>
              ))
            )}
          </List>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleClose}
            variant="contained"
            color="error"
            sx={{ fontFamily: 'fontFamily.terciary' }}
          >
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ FoodDetailModal para personalización */}
      {foodDetailModalState.product && (
        <FoodDetailModal
          open={foodDetailModalState.isOpen}
          onClose={handleCloseFoodDetailModal}
          product={foodDetailModalState.product}
          imageDefault={mainLogo}
          onProductCustomized={handleProductCustomized}
          customTheme={lobotechAppFoodDetailTheme}
        />
      )}
    </>
  );
};
