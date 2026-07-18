import _ from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";

// ---- MATERIAL UI ----
import { Add as AddIcon, Close as CloseIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Fade,
  IconButton,
  Modal,
  Paper,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
// ---------------------

// ---- COMPONENTS ----
import { ConfirmDialogClose } from "../ConfirmDialogClose/ConfirmDialogClose.jsx";
import { ProductImageHero } from "./ProductImageHero/ProductImageHero.jsx";
import { RenderCustomLabels } from "./RenderCustomLabel/RenderCustomLabel.jsx";
import { RenderCustomOptions } from "./RenderCustomOptions/RenderCustomOptions.jsx";
// --------------------

// ---- HOOKS ----
import { useAlert } from "@/hooks/Alert.jsx";
import { useCustomizations } from "./hooks/useCustomizations.js";
import { usePriceCalculation } from "./hooks/usePriceCalculation.js";
// ---------------

// ---- USE CONTEXT ----
import { useCart } from "@/context/Cart.jsx";
import { useUser } from "@/context/Users.jsx";
// <------------------

// ---- UTILS ----
import {
  getCustomizationsFromSelectedItems,
  getExceededMaxOptions,
  getMissingRequiredOptions,
  getOptionKey,
  getProductOptionsForUI,
  getSelectedOptionItems,
} from "@/utils/migrateCustomOptions.js";
// ---------------

export const FoodDetailModal = ({
  open,
  onClose,
  product,
  imageDefault,
  onProductCustomized,
  customTheme,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const modalRef = useRef(null);

  const { AlertComponent, showAlert } = useAlert();
  // CREAMOS UNA COPIA DE LAS CUSTOM PARA VER SI HAY CAMBIOS DEL ESTADO INICIAL
  const [initialCustomizations, setInitialCustomizations] = useState({});
  const [initialProductComment, setInitialProductComment] = useState("");
  const [productComment, setProductComment] = useState("");
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  const optionRefs = useRef({});
  const [highlightedOptionKey, setHighlightedOptionKey] = useState(null);

  const handleConfirmModalClose = (confirmation) => {
    if (confirmation) {
      setIsAdding(false);
      setCustomizations({});
      setProductComment("");
      onClose();
    }
    setShowConfirmClose(false);
  };

  const handleClose = () => {
    if (isAdding) return;

    const customizationsChanged = !_.isEqual(
      customizations,
      initialCustomizations,
    );

    const commentChanged =
      productComment.trim() !== initialProductComment.trim();

    const hasChanges = customizationsChanged || commentChanged;

    if (hasChanges) {
      setShowConfirmClose(true);
      return;
    }
    onClose();
  };

  const productOptions = useMemo(
    () => getProductOptionsForUI(product),
    [product],
  );

  const sortedProductOptions = useMemo(() => {
    return [...productOptions]
      .filter((option) => option.status !== false)
      .sort((a, b) => {
        const priorityA = Number(a.priority ?? 10);
        const priorityB = Number(b.priority ?? 10);

        if (priorityA !== priorityB) return priorityA - priorityB;

        return String(a.name).localeCompare(String(b.name));
      });
  }, [productOptions]);

  const getFirstMissingRequiredOption = () => {
    return sortedProductOptions.find((option) => {
      const minSelected = Number(option.minSelected ?? 0);
      const isRequired =
        option.required || minSelected > 0 || option.type === "unique";

      if (!isRequired) return false;

      const optionKey = getOptionKey(option);
      const selectedMap = customizations[optionKey] || {};

      const totalSelected = Object.values(selectedMap).reduce(
        (sum, value) => sum + Number(value || 0),
        0,
      );

      const requiredMin = Number(option.minSelected || 1);

      return totalSelected < requiredMin;
    });
  };

  const scrollToOption = (option) => {
    if (!option) return;

    const optionKey = getOptionKey(option);
    const optionElement = optionRefs.current[optionKey];

    if (optionElement) {
      optionElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      setHighlightedOptionKey(optionKey);

      setTimeout(() => {
        setHighlightedOptionKey(null);
      }, 1800);
    }
  };

  const { addItemToCart } = useCart();
  const { userState } = useUser();
  const isUserLoggedIn = useMemo(
    () => Boolean(userState?.user?.id),
    [userState?.user?.id],
  );

  // Estado para animación de agregar al carrito
  const [isAdding, setIsAdding] = useState(false);

  // Estado para las personalizaciones (opciones extra)
  const { customizations, setCustomizations, handleCustomizationChange } =
    useCustomizations(showAlert, theme);

  const { totalPrice, formattedTotalPrice } = usePriceCalculation(
    product,
    customizations,
    sortedProductOptions,
  );

  // HANDLE PARA ENVIAR EL PRODUCTO AL CARRITO
  const handleAddToCart = () => {
    const missingSelections = getMissingRequiredOptions(
      sortedProductOptions,
      customizations,
    );

    if (missingSelections.length > 0) {
      const firstMissingOption = getFirstMissingRequiredOption();
      scrollToOption(firstMissingOption);
      // Mostrar alerta si falta alguna selección
      showAlert(
        `Por favor, selecciona una opción para: ${missingSelections.join(
          ", ",
        )}`,
        "warning",
        theme,
      );
      return;
    }

    const exceededMaxSelections = getExceededMaxOptions(
      sortedProductOptions,
      customizations,
    );

    if (exceededMaxSelections.length > 0) {
      showAlert(
        `Revisa el máximo permitido en: ${exceededMaxSelections.join(", ")}`,
        "warning",
        theme,
      );
      return;
    }

    // ✅ VERIFICAR PRODUCTOS DE CANJE
    if (product.redeemPoints > 0 && !isUserLoggedIn) {
      showAlert(
        "El producto seleccionado es de CANJE y no te encuentras logueado",
        "warning",
        theme,
      );
      return;
    }

    // Animación de agregar al carrito
    setIsAdding(true);
    // ENVIAMOS EL PRODUCTO AL CARRITO
    if (product.id) {
      setTimeout(() => {
        const finalCustomizations = getSelectedOptionItems(
          sortedProductOptions,
          customizations,
        );

        const { productCustomOptions, ...productWithoutFullOptions } = product;

        const itemToAdd = {
          ...productWithoutFullOptions,
          customOptions: finalCustomizations,
          productComment: product?.allowComment ? productComment.trim() : "",
        };

        // ✅ Si se proporciona el callback, lo usamos
        if (onProductCustomized) {
          onProductCustomized(itemToAdd);
        } else {
          // ✅ Si no, usamos la lógica original de añadir al carrito
          addItemToCart(itemToAdd);
          showAlert("Producto agregado al pedido", "success", theme);
        }

        setCustomizations({});
        setProductComment("");
        setIsAdding(false);
        onClose();
      }, 800);
    }
  };

  // Efecto para inicializar las personalizaciones cuando el producto cambia
  useEffect(() => {
    if (!open || !product) return;

    const initialState = getCustomizationsFromSelectedItems(
      sortedProductOptions,
      product.customOptions || [],
    );

    const initialComment = product.productComment || "";

    setCustomizations(_.cloneDeep(initialState));
    setInitialCustomizations(_.cloneDeep(initialState));

    setProductComment(initialComment);
    setInitialProductComment(initialComment);
  }, [open, product, sortedProductOptions, setCustomizations]);

  // Efecto para hacer scroll al inicio cuando cambia el paso
  useEffect(() => {
    if (modalRef.current && open) {
      modalRef.current.scrollTop = 0;
    }
  }, [open]);
  // -----------------------------------------------
  if (!product) return null;

  return (
    <ThemeProvider theme={customTheme || theme}>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="product-modal-title"
        aria-describedby="product-modal-description"
        closeAfterTransition
      >
        <Fade in={open}>
          <Box
            id="food-detail-modal"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "100%", sm: "92%", md: "560px" },
              height: { xs: "100%", sm: "auto" },
              maxHeight: { xs: "100vh", sm: "92vh" },
              border: { xs: "none", sm: "2px solid" },
              borderColor: "primary.main",
              bgcolor: "background.default",
              color: "text.terciary",
              borderRadius: { xs: 0, sm: 4 },
              outline: "none",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: 24,
              p: 0,
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: "rgba(0,0,0,0.1)",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(0,0,0,0.2)",
                borderRadius: "4px",
              },
            }}
          >
            <Box
              ref={modalRef}
              sx={{
                flex: 1,
                overflowY: "auto",
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "rgba(0,0,0,0.1)",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "rgba(0,0,0,0.2)",
                  borderRadius: "4px",
                },
              }}
            >
              <Stack spacing={1.5}>
                <Box
                  sx={{
                    position: "sticky",
                    top: 0,
                    backgroundColor: "transparent",
                    zIndex: 2, // Para asegurarse de que esté por encima del contenido
                    display: "flex",
                    justifyContent: "flex-end",
                    padding: 1,
                  }}
                >
                  {/* BOTÓN PARA CERRAR EL MODAL */}
                  <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    disabled={isAdding}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      zIndex: 10,
                      color: "text.primary",
                      bgcolor: "rgba(0,0,0,0.35)",
                      "&:hover": {
                        bgcolor: "rgba(0,0,0,0.55)",
                      },
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>

                <Box
                  sx={{
                    px: {
                      xs: 2,
                      sm: 3,
                    },
                    pb: 3,
                  }}
                >
                  <ProductImageHero
                    src={product?.image}
                    fallbackSrc={imageDefault}
                    alt={product.name}
                    isAdding={isAdding}
                  />

                  <Box
                    sx={{
                      mt: 2,
                      mb: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1,
                      px: { xs: 0, sm: 1 },
                    }}
                  >
                    {/* Nombre */}
                    <Typography
                      id="product-modal-title"
                      variant="h4"
                      component="h2"
                      sx={{
                        fontFamily: "fontFamily.primary",
                        color: "text.primary",
                        fontSize: { xs: "1.6rem", sm: "2rem" },
                        lineHeight: 1.1,
                        textAlign: "center",
                        wordBreak: "break-word",
                      }}
                    >
                      {product.name}
                    </Typography>
                    {(product.isVeggie || product.isSinTacc) && (
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        {product.isVeggie && (
                          <RenderCustomLabels
                            isActive={product.isVeggie}
                            isVeggie={true}
                          />
                        )}

                        {product.isSinTacc && (
                          <RenderCustomLabels
                            isActive={product.isSinTacc}
                            isVeggie={false}
                          />
                        )}
                      </Box>
                    )}
                  </Box>

                  <Typography
                    id="product-modal-description"
                    variant={isMobile ? "body2" : "body1"}
                    sx={{
                      fontFamily: "fontFamily.secondary",
                      color: "text.primary",
                      textAlign: "center",
                      mb: 3,
                      lineHeight: 1.6,
                    }}
                  >
                    {product.description}
                  </Typography>

                  {sortedProductOptions.length > 0 && (
                    <>
                      <Stack spacing={3}>
                        {sortedProductOptions.map((option) => {
                          const optionKey = getOptionKey(option);
                          const isHighlighted =
                            highlightedOptionKey === optionKey;

                          return (
                            <Box
                              key={optionKey}
                              ref={(element) => {
                                optionRefs.current[optionKey] = element;
                              }}
                              sx={{
                                borderRadius: 2,
                                outline: isHighlighted
                                  ? "2px solid"
                                  : "2px solid transparent",
                                outlineColor: isHighlighted
                                  ? "warning.main"
                                  : "transparent",
                                transition: "outline-color 200ms ease",
                                scrollMarginTop: "24px",
                              }}
                            >
                              <RenderCustomOptions
                                option={option}
                                optionKey={optionKey}
                                customizations={customizations}
                                handleCustomizationChange={
                                  handleCustomizationChange
                                }
                              />
                            </Box>
                          );
                        })}
                      </Stack>
                    </>
                  )}

                  {product?.allowComment && (
                    <Box sx={{ mt: 3 }}>
                      <Typography
                        sx={{
                          fontFamily: "fontFamily.terciary",
                          color: "text.primary",
                          fontSize: { xs: "0.85rem", sm: "1rem" },
                        }}
                      >
                        Comentarios para este producto
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        minRows={1}
                        maxRows={2}
                        value={productComment}
                        onChange={(e) => setProductComment(e.target.value)}
                        placeholder="Ej: Sin cebolla, sin tomate, otros..."
                        disabled={isAdding}
                        sx={{
                          "& .MuiInputBase-root": {
                            fontFamily: "fontFamily.secondary",
                            color: "#000",
                            bgcolor: "#fff",
                            borderRadius: 2,
                          },
                          "& .MuiInputLabel-root": {
                            fontFamily: "fontFamily.secondary",
                            color: "text.secondary",
                          },
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                              borderColor: "primary.main",
                            },
                            "&:hover fieldset": {
                              borderColor: "primary.main",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "primary.main",
                            },
                          },
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Stack>
            </Box>

            {/* Botón de agregar al carrito */}
            <Paper
              elevation={10}
              sx={{
                position: "sticky",
                bottom: 0,
                zIndex: 5,
                mt: 2,
                p: { xs: 1.5, sm: 2 },
                bgcolor: "background.default",
                borderTop: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Button
                fullWidth
                variant="contained"
                disabled={
                  (totalPrice === 0 && product.redeemPoints === 0) || isAdding
                }
                onClick={handleAddToCart}
                size="large"
                startIcon={
                  isAdding ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <AddIcon />
                  )
                }
                sx={{
                  fontFamily: "fontFamily.secondary",
                  color: "text.secondary",
                  fontWeight: "bold",
                  fontSize: { xs: "0.95rem", sm: "1.1rem" },
                  py: { xs: 1.3, sm: 1.6 },
                  borderRadius: "12px",
                  boxShadow: "0px 4px 14px rgba(0, 0, 0, 0.15)",
                  // mt: 3,
                  "&.Mui-disabled": {
                    bgcolor: "grey.500",
                    color: "#000",
                    cursor: "not-allowed",
                  },
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 4,
                  },
                  transition: "all 0.2s ease",
                }}
              >
                {isAdding
                  ? "Agregando..."
                  : totalPrice > 0 && product.redeemPoints > 0
                    ? `$${formattedTotalPrice} + ${product.redeemPoints} PTS.`
                    : totalPrice > 0
                      ? `$${formattedTotalPrice} - Agregar`
                      : product.redeemPoints > 0
                        ? `Canjear por ${product.redeemPoints} PTS.`
                        : "Agregar al carrito"}
              </Button>
            </Paper>
          </Box>
        </Fade>
      </Modal>
      <ConfirmDialogClose
        showConfirmClose={showConfirmClose}
        setShowConfirmClose={setShowConfirmClose}
        handleConfirmModalClose={handleConfirmModalClose}
      />
      {AlertComponent}
    </ThemeProvider>
  );
};
