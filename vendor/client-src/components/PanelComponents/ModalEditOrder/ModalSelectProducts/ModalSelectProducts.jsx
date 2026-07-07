import { useState, useEffect, useMemo } from "react";

// ---- MATERIAL UI ----
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
// ICONS
import {
  Add as AddIcon,
  CardGiftcard as CardGiftcardIcon,
  Close as CloseIcon,
  DeleteOutline as DeleteIcon,
  Remove as RemoveIcon,
  Search as SearchIcon,
  ShoppingCart as CartIcon,
} from "@mui/icons-material";
// ---------------------

// ---- LOGO (IMAGEDEFAULT) ----
import mainLogo from "@/assets/main/logo-white.png";
// -----------------------------

// ---- THEME ----
import { lobotechAppFoodDetailTheme } from "@/theme/main-theme.js";
// ---------------

// ---- COMPONENTS ----
import { FoodDetailModal } from "@/components/FoodDetailModal/FoodDetailModal.jsx";
// --------------------

// ---- UTILS ----
import { formatCurrency } from "@/utils/orderCalculations.js";
import { getProductOptionsForUI } from "@/utils/migrateCustomOptions.js";
// ---------------

const getProductDisplayPrice = (product) =>
  product.discount > 0
    ? Math.round(
        (product.price - (product.price * product.discount) / 100) / 100,
      ) * 100
    : Math.round(product.price || 0);

export const ModalSelectProducts = ({
  open,
  onClose,
  onSelectProduct,
  products = [],
  editingProduct = false,
  initialSelectionMode = false,
  cartItems = [],
  onUpdateQuantity,
  onRemoveProduct,
  onContinue,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [foodDetailModalState, setFoodDetailModalState] = useState({
    isOpen: false,
    product: null,
  });

  const categories = useMemo(() => {
    const values = products
      .map((product) => product.category?.name || product.category)
      .filter(Boolean);

    return ["TODOS", ...new Set(values)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const productCategory = product.category?.name || product.category;
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(productCategory);
      const matchesSearch =
        !term ||
        product.name?.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [products, searchTerm, selectedCategories]);

  const selectedProductsTotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.quantity || 1),
        0,
      ),
    [cartItems],
  );

  const toggleCategory = (category) => {
    if (category === "TODOS") {
      setSelectedCategories([]);
      return;
    }

    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((selected) => selected !== category)
        : [...current, category],
    );
  };

  const handleSelectProduct = (product) => {
    const newPrice = getProductDisplayPrice(product);
    const productOptions = getProductOptionsForUI(product);
    const hasCustomOptions = productOptions.length > 0;

    if (hasCustomOptions || product.allowComment) {
      setFoodDetailModalState({
        isOpen: true,
        product: { ...product, price: newPrice },
      });
      return;
    }

    onSelectProduct({
      ...product,
      productId: product.productId || product.id,
      price: newPrice,
      customOptions: [],
    });
    setSearchTerm("");

    if (!initialSelectionMode) onClose();
  };

  const handleProductCustomized = (customizedItem) => {
    onSelectProduct(customizedItem);
    setFoodDetailModalState({ isOpen: false, product: null });
    setSearchTerm("");

    if (!initialSelectionMode) onClose();
  };

  const handleClose = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    onClose();
  };

  const handleCloseFoodDetailModal = () => {
    setFoodDetailModalState({ isOpen: false, product: null });
  };

  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setSelectedCategories([]);
    }
  }, [open]);

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
        maxWidth={initialSelectionMode ? "xl" : "lg"}
        fullWidth
        aria-labelledby="product-modal-title"
        PaperProps={{
          sx: {
            height: initialSelectionMode ? "min(900px, 92vh)" : "82vh",
            maxHeight: "92vh",
            bgcolor: "background.main",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          id="product-modal-title"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "fontFamily.primary",
            color: "primary.main",
            bgcolor: "background.paper",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" sx={{ fontFamily: "fontFamily.primary" }}>
            {editingProduct
              ? "MODIFICAR PRODUCTO"
              : initialSelectionMode
                ? "SELECCIONAR PRODUCTOS"
                : "SELECCIONAR PRODUCTO"}
          </Typography>
          <IconButton onClick={handleClose} size="small" color="primary">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 0,
            minHeight: 0,
            display: "grid",
            gridTemplateColumns: {
              xs: "112px minmax(0, 1fr)",
              sm: "150px minmax(0, 1fr)",
              lg: initialSelectionMode
                ? "180px minmax(0, 1fr) 340px"
                : "180px minmax(0, 1fr)",
            },
          }}
        >
          <Paper
            square
            elevation={0}
            sx={{
              bgcolor: "background.paper",
              borderRight: "1px solid",
              borderColor: "divider",
              minHeight: 0,
              overflowY: "auto",
              px: { xs: 0.75, sm: 1 },
              py: 1.25,
            }}
          >
            <Typography
              sx={{
                fontFamily: "fontFamily.primary",
                color: "primary.main",
                fontSize: "1rem",
                textAlign: "center",
                mb: 1,
                overflowWrap: "anywhere",
              }}
            >
              CATEGORIAS
            </Typography>
            <Stack spacing={0.75}>
              {categories.map((category) => {
                const isAllCategory = category === "TODOS";
                const isActive = isAllCategory
                  ? selectedCategories.length === 0
                  : selectedCategories.includes(category);

                return (
                  <Button
                    key={category}
                    fullWidth
                    variant={isActive ? "contained" : "outlined"}
                    onClick={() => toggleCategory(category)}
                    sx={{
                      minHeight: 48,
                      px: { xs: 0.5, sm: 0.8 },
                      py: 0.75,
                      justifyContent: "center",
                      borderRadius: 2,
                      fontFamily: "fontFamily.secondary",
                      fontSize: "0.8rem",
                      lineHeight: 1.1,
                      textAlign: "center",
                      whiteSpace: "normal",
                      overflowWrap: "anywhere",
                      color: isActive ? "text.terciary" : "text.primary",
                    }}
                  >
                    {category}
                  </Button>
                );
              })}
            </Stack>
          </Paper>

          <Box sx={{ minWidth: 0, overflow: "auto", p: { xs: 1.5, md: 2 } }}>
            {!editingProduct && (
              <TextField
                fullWidth
                placeholder="Buscar producto"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ fontFamily: "fontFamily.secondary", mb: 1.5 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            )}

            {filteredProducts.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: "fontFamily.primary",
                    color: "text.primary",
                  }}
                >
                  {searchTerm
                    ? "NO SE ENCONTRARON PRODUCTOS"
                    : "NO HAY PRODUCTOS DISPONIBLES"}
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, minmax(0, 1fr))",
                    sm: "repeat(3, minmax(0, 1fr))",
                    md: "repeat(4, minmax(0, 1fr))",
                    xl: "repeat(5, minmax(0, 1fr))",
                  },
                  gap: { xs: 1, md: 1.25 },
                }}
              >
                {filteredProducts.map((product) => {
                  const productPrice = getProductDisplayPrice(product);
                  const productDisabled = product.status === false;

                  return (
                    <Paper
                      component="button"
                      type="button"
                      key={product.id}
                      onClick={() => handleSelectProduct(product)}
                      disabled={productDisabled}
                      elevation={0}
                      sx={{
                        appearance: "none",
                        p: 0,
                        overflow: "hidden",
                        border: "1px solid",
                        borderColor: productDisabled
                          ? "text.secondary"
                          : "divider",
                        borderRadius: 2,
                        bgcolor: "background.default",
                        color: "text.primary",
                        textAlign: "left",
                        cursor: productDisabled ? "not-allowed" : "pointer",
                        minWidth: 0,
                        opacity: productDisabled ? 0.55 : 1,
                        "&:active": { transform: "scale(0.98)" },
                        "&:focus-visible": {
                          outline: "3px solid",
                          outlineColor: "primary.main",
                        },
                      }}
                    >
                      <Box
                        component="img"
                        src={product.image || mainLogo}
                        alt={product.name}
                        sx={{
                          width: "100%",
                          height: { xs: 86, sm: 96, md: 104 },
                          display: "block",
                          objectFit: "contain",
                        }}
                      />
                      <Box sx={{ p: { xs: 0.85, sm: 1 } }}>
                        <Typography
                          sx={{
                            fontFamily: "fontFamily.secondary",
                            color: "text.primary",
                            fontSize: { xs: "0.82rem", sm: "1rem" },
                            lineHeight: 1.15,
                            minHeight: { xs: 30, sm: 34 },
                            overflowWrap: "anywhere",
                            textAlign: "center",
                          }}
                        >
                          {(product.name || "").toUpperCase()}
                        </Typography>
                        {Number(productPrice) > 0 && (
                          <Typography
                            sx={{
                              fontFamily: "fontFamily.primary",
                              color: "primary.main",
                              fontSize: { xs: "0.9rem", sm: "1.2rem" },
                              mt: 0.6,
                              textAlign: "center",
                            }}
                          >
                            {formatCurrency(productPrice)}
                          </Typography>
                        )}
                        <Box sx={{ mt: 0.75 }}>
                          {Number(product.redeemPoints || 0) > 0 && (
                            <Chip
                              icon={<CardGiftcardIcon />}
                              size="small"
                              label={`Canje ${product.redeemPoints} pts.`}
                              color="error"
                              sx={{
                                width: "100%",
                                fontFamily: "fontFamily.secondary",
                              }}
                            />
                          )}
                          {productDisabled && (
                            <Chip
                              size="small"
                              label="Desactivado"
                              color="secondary"
                              sx={{
                                width: "100%",
                                mt: 0.75,
                                fontFamily: "fontFamily.secondary",
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            )}
          </Box>

          {initialSelectionMode && (
            <Paper
              square
              elevation={0}
              sx={{
                bgcolor: "background.main",
                borderLeft: { lg: "1px solid" },
                borderTop: { xs: "1px solid", lg: 0 },
                borderColor: "divider",
                display: { xs: "none", lg: "flex" },
                flexDirection: "column",
                minHeight: 0,
              }}
            >
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CartIcon color="primary" />
                  <Typography
                    sx={{ fontFamily: "fontFamily.primary", fontSize: "1rem" }}
                  >
                    PRODUCTOS
                  </Typography>
                </Box>
                <Chip
                  label={`${cartItems.length} items`}
                  sx={{ fontFamily: "fontFamily.secondary" }}
                />
              </Box>
              <Divider />

              <Stack sx={{ p: 1.5, flex: 1, overflowY: "auto" }} spacing={1}>
                {cartItems.length === 0 ? (
                  <Box
                    sx={{ textAlign: "center", color: "text.primary", py: 5 }}
                  >
                    <CartIcon sx={{ fontSize: 48, opacity: 0.45 }} />
                    <Typography
                      variant="subtitle2"
                      sx={{ fontFamily: "fontFamily.secondary" }}
                    >
                      Selecciona productos para comenzar.
                    </Typography>
                  </Box>
                ) : (
                  cartItems.map((item, index) => (
                    <Paper
                      key={`${item.productId || item.id}-${index}`}
                      variant="outlined"
                      sx={{
                        bgcolor: "background.paper",
                        p: 1.25,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "text.primary",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 1,
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            sx={{ fontFamily: "fontFamily.secondary" }}
                          >
                            {item.name}
                          </Typography>
                          {(item.customOptions || []).map(
                            (option, optionIndex) => (
                              <Typography
                                key={`${option.itemId || option.name}-${optionIndex}`}
                                variant="caption"
                                display="block"
                                sx={{
                                  fontFamily: "fontFamily.secondary",
                                  color: "text.secondary",
                                }}
                              >
                                + {option.name}
                                {Number(option.quantity || 1) > 1
                                  ? ` x${option.quantity}`
                                  : ""}
                              </Typography>
                            ),
                          )}
                        </Box>
                        <Tooltip title="Quitar producto">
                          <IconButton
                            aria-label={`Quitar ${item.name}`}
                            color="error"
                            onClick={() => onRemoveProduct?.(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                          mt: 1,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <IconButton
                            size="small"
                            onClick={() =>
                              onUpdateQuantity?.(
                                index,
                                Number(item.quantity || 1) - 1,
                              )
                            }
                            disabled={Number(item.quantity || 1) <= 1}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <Typography
                            sx={{
                              minWidth: 28,
                              textAlign: "center",
                              fontFamily: "fontFamily.primary",
                            }}
                          >
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() =>
                              onUpdateQuantity?.(
                                index,
                                Number(item.quantity || 1) + 1,
                              )
                            }
                          >
                            <AddIcon />
                          </IconButton>
                        </Box>
                        <Typography
                          sx={{
                            fontFamily: "fontFamily.primary",
                            color: "primary.main",
                          }}
                        >
                          {formatCurrency(
                            Number(item.price || 0) *
                              Number(item.quantity || 1),
                          )}
                        </Typography>
                      </Box>
                    </Paper>
                  ))
                )}
              </Stack>
              <Divider />
              <Box sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    mb: 1.5,
                  }}
                >
                  <Typography sx={{ fontFamily: "fontFamily.primary" }}>
                    TOTAL
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "fontFamily.primary",
                      color: "primary.main",
                      fontSize: "1.4rem",
                    }}
                  >
                    {formatCurrency(selectedProductsTotal)}
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={onContinue}
                  disabled={cartItems.length === 0}
                  sx={{
                    fontFamily: "fontFamily.primary",
                    color: "text.terciary",
                    minHeight: 44,
                  }}
                >
                  Continuar
                </Button>
              </Box>
            </Paper>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: "space-between",
            gap: 1.5,
            bgcolor: "background.paper",
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Button
            onClick={handleClose}
            variant="contained"
            color="error"
            sx={{ fontFamily: "fontFamily.terciary" }}
          >
            Cancelar
          </Button>
          {initialSelectionMode && (
            <Button
              onClick={onContinue}
              variant="contained"
              color="primary"
              disabled={cartItems.length === 0}
              sx={{
                display: { xs: "inline-flex", lg: "none" },
                fontFamily: "fontFamily.primary",
                color: "text.terciary",
                minWidth: 150,
              }}
            >
              Continuar
            </Button>
          )}
        </DialogActions>
      </Dialog>

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
