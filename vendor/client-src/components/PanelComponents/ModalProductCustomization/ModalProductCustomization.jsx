import _ from "lodash";
import { useEffect, useMemo, useState } from "react";

// ---- MATERIAL UI ----
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Paper,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
// Icons
import {
  Close as CloseIcon,
  Edit as EditIcon,
  ShoppingBag as ShoppingBagIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Components ----
import { ConfirmDialogClose } from "@/components/ConfirmDialogClose/ConfirmDialogClose.jsx";
import { CustomLabel } from "./shared/CustomLabel/CustomLabel.jsx";
import { ProductImage } from "./shared/ProductImage/ProductImage.jsx";
import { ProductOptionSection } from "./shared/ProductOptionSection/ProductOptionSection.jsx";
// --------------------

// ---- HOOKS ----
import { useCustomizations } from "@/components/FoodDetailModal/hooks/useCustomizations.js";
import { usePriceCalculation } from "@/components/FoodDetailModal/hooks/usePriceCalculation.js";
import { useAlert } from "@/hooks/Alert.jsx";
// ---------------

// ---- CONTEXT ----
import { useLobotechThemeContext } from "@/context/ThemeContext.jsx";
// ---------------

// ---- UTILS ----
import {
  getCustomizationsFromSelectedItems,
  getExceededMaxOptions,
  getMissingRequiredOptions,
  getOptionKey,
  getProductOptionsForUI,
  getSelectedOptionItems,
} from "@/utils/migrateCustomOptions.js";
import { formatCurrency } from "@/utils/orderCalculations.js";
// ---------------

export const ModalProductCustomization = ({
  open,
  onClose,
  product,
  imageDefault,
  onProductCustomized,
  editing = false,
}) => {
  const { lobotechTheme } = useLobotechThemeContext();
  const theme = useTheme();

  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));

  const { AlertComponent, showAlert } = useAlert();

  const [isSaving, setIsSaving] = useState(false);

  const [initialCustomizations, setInitialCustomizations] = useState({});

  const [productComment, setProductComment] = useState("");

  const [initialProductComment, setInitialProductComment] = useState("");

  const [showConfirmClose, setShowConfirmClose] = useState(false);

  const { customizations, setCustomizations, handleCustomizationChange } =
    useCustomizations(showAlert, theme);

  const productOptions = useMemo(
    () => getProductOptionsForUI(product),
    [product],
  );

  const sortedProductOptions = useMemo(
    () =>
      [...productOptions]
        .filter((option) => option.status !== false)
        .sort((a, b) => {
          const priorityA = Number(a.priority ?? 10);

          const priorityB = Number(b.priority ?? 10);

          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }

          return String(a.name || "").localeCompare(String(b.name || ""));
        }),
    [productOptions],
  );

  const { totalPrice, formattedTotalPrice } = usePriceCalculation(
    product,
    customizations,
    sortedProductOptions,
  );

  const selectedItems = useMemo(
    () => getSelectedOptionItems(sortedProductOptions, customizations),
    [sortedProductOptions, customizations],
  );

  // --------------------------
  // INICIALIZAR EDICIÓN
  // --------------------------
  useEffect(() => {
    if (!open || !product) {
      return;
    }

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

  const hasChanges = useMemo(() => {
    const customizationChanged = !_.isEqual(
      customizations,
      initialCustomizations,
    );

    const commentChanged =
      productComment.trim() !== initialProductComment.trim();

    return customizationChanged || commentChanged;
  }, [
    customizations,
    initialCustomizations,
    productComment,
    initialProductComment,
  ]);

  const handleClose = () => {
    if (isSaving) return;

    if (hasChanges) {
      setShowConfirmClose(true);
      return;
    }

    onClose();
  };

  const handleConfirmModalClose = (confirmation) => {
    if (confirmation) {
      setCustomizations({});
      setProductComment("");
      onClose();
    }

    setShowConfirmClose(false);
  };

  const handleSave = () => {
    const missingSelections = getMissingRequiredOptions(
      sortedProductOptions,
      customizations,
    );

    if (missingSelections.length > 0) {
      showAlert(
        `Debes seleccionar una opción en: ${missingSelections.join(", ")}`,
        "warning",
        theme,
      );

      return;
    }

    const exceededOptions = getExceededMaxOptions(
      sortedProductOptions,
      customizations,
    );

    if (exceededOptions.length > 0) {
      showAlert(
        `Revisa el máximo permitido en: ${exceededOptions.join(", ")}`,
        "warning",
        theme,
      );

      return;
    }

    setIsSaving(true);

    const finalCustomizations = getSelectedOptionItems(
      sortedProductOptions,
      customizations,
    );

    const { productCustomOptions, ...productWithoutFullOptions } = product;

    const customizedProduct = {
      ...productWithoutFullOptions,

      customOptions: finalCustomizations,

      productComment: product?.allowComment ? productComment.trim() : "",

      quantity: Number(product.quantity) || 1,
    };

    if (onProductCustomized) {
      onProductCustomized(customizedProduct);
    }

    setIsSaving(false);
    onClose();
  };

  if (!product) {
    return null;
  }

  return (
    <ThemeProvider theme={lobotechTheme}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={false}
        fullWidth
        PaperProps={{
          elevation: 0,
          sx: {
            width: {
              xs: "100%",
              sm: "96vw",
              xl: "1500px",
            },
            maxWidth: "1500px",
            height: {
              xs: "100dvh",
              sm: "94vh",
            },
            maxHeight: {
              xs: "100dvh",
              sm: "94vh",
            },
            m: {
              xs: 0,
              sm: 2,
            },
            borderRadius: {
              xs: 0,
              sm: 3,
            },
            bgcolor: "background.default",
            overflow: "hidden",
            border: "1px solid",
            borderColor: "rgba(184, 182, 186, 0.22)",
          },
        }}
      >
        {/* CLOSE */}
        <IconButton
          onClick={handleClose}
          disabled={isSaving}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 20,
            width: 42,
            height: 42,
            color: "text.terciary",
            bgcolor: "primary.main",
            border: "1px solid",
            borderColor: "text.terciary",
            "&:hover": {
              bgcolor: "background.default",
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent
          sx={{
            p: {
              xs: 1,
              sm: 1.5,
            },
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              flex: 1,
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",

                md: "260px minmax(0, 1fr)",

                xl: "300px minmax(0, 1fr) 280px",
              },
              gap: 1.5,
              minHeight: 0,
              overflow: {
                xs: "auto",
                xl: "hidden",
              },
            }}
          >
            {/* ============================= */}
            {/* PRODUCTO */}
            {/* ============================= */}

            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: "background.main",
                border: "1px solid",
                borderColor: "rgba(184, 182, 186, 0.22)",
                overflow: "hidden",
              }}
            >
              <ProductImage
                src={product.image}
                fallbackSrc={imageDefault}
                alt={product.name}
                isAdding={isSaving}
              />

              <Box
                sx={{
                  mt: 2,
                  textAlign: "center",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "fontFamily.primary",
                    color: "text.primary",
                    fontSize: {
                      xs: 20,
                      md: 24,
                    },
                    lineHeight: 1.1,
                  }}
                >
                  {(product.name || "").toUpperCase()}
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    fontFamily: "fontFamily.secondary",
                    color: "text.secondary",
                    fontSize: 13,
                    lineHeight: 1.4,
                  }}
                >
                  {product.description}
                </Typography>

                {(product.isVeggie || product.isSinTacc) && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      flexWrap: "wrap",
                      gap: 1,
                      mt: 1.5,
                    }}
                  >
                    {product.isVeggie && <CustomLabel isActive isVeggie />}

                    {product.isSinTacc && (
                      <CustomLabel isActive isVeggie={false} />
                    )}
                  </Box>
                )}
              </Box>
            </Paper>

            {/* ============================= */}
            {/* CUSTOM OPTIONS */}
            {/* ============================= */}

            <Box
              sx={{
                minWidth: 0,
                overflowY: {
                  xs: "visible",
                  xl: "auto",
                },
                pr: {
                  xl: 0.5,
                },
              }}
            >
              <Stack spacing={1.5}>
                {sortedProductOptions.map((option) => (
                  <ProductOptionSection
                    key={getOptionKey(option)}
                    option={option}
                    customizations={customizations}
                    handleCustomizationChange={handleCustomizationChange}
                  />
                ))}

                {/* MOBILE/TABLET COMMENT */}
                {product.allowComment && isTablet && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "background.main",
                      border: "1px solid",
                      borderColor: "rgba(184, 182, 186, 0.22)",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "fontFamily.primary",
                        color: "text.primary",
                        mb: 1,
                      }}
                    >
                      COMENTARIOS
                    </Typography>

                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      value={productComment}
                      onChange={(event) =>
                        setProductComment(event.target.value)
                      }
                      placeholder="Comentarios para este producto..."
                    />
                  </Paper>
                )}
              </Stack>
            </Box>

            {/* ============================= */}
            {/* RESUMEN */}
            {/* ============================= */}

            <Paper
              elevation={0}
              sx={{
                display: {
                  xs: "none",
                  xl: "flex",
                },
                flexDirection: "column",
                p: 1.5,
                borderRadius: 2,
                bgcolor: "background.main",
                border: "1px solid",
                borderColor: "rgba(184, 182, 186, 0.22)",
                overflow: "hidden",
              }}
            >
              {product.allowComment && (
                <Box>
                  <Typography
                    sx={{
                      fontFamily: "fontFamily.primary",
                      color: "text.primary",
                      pb: 1,
                      borderBottom: "2px solid",
                      borderColor: "primary.main",
                    }}
                  >
                    COMENTARIOS
                  </Typography>

                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={productComment}
                    onChange={(event) => setProductComment(event.target.value)}
                    placeholder="Comentarios para este producto..."
                    sx={{ mt: 1.5 }}
                  />
                </Box>
              )}

              <Box sx={{ mt: 2 }}>
                <Typography
                  sx={{
                    fontFamily: "fontFamily.primary",
                    color: "text.primary",
                    pb: 1,
                    borderBottom: "2px solid",
                    borderColor: "primary.main",
                  }}
                >
                  RESUMEN DEL PRODUCTO
                </Typography>

                <Box sx={{ mt: 1.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "fontFamily.primary",
                        color: "text.primary",
                        fontSize: 16,
                        textTransform: "uppercase",
                      }}
                    >
                      {product.name}
                    </Typography>

                    <Typography
                      sx={{
                        fontFamily: "fontFamily.primary",
                        color: "primary.main",
                        fontSize: 16,
                      }}
                    >
                      {formatCurrency(product.price)}
                    </Typography>
                  </Box>

                  {selectedItems.length > 0 && (
                    <Stack spacing={0.6} sx={{ mt: 1.5 }}>
                      {selectedItems.map((selected, index) => (
                        <Box
                          key={`${selected.itemId || selected.name}-${index}`}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 1,
                          }}
                        >
                          <Typography
                            sx={{
                              fontFamily: "fontFamily.secondary",
                              color: "text.primary",
                              fontSize: 11,
                            }}
                          >
                            • {selected.name}
                            {Number(selected.quantity) > 1 &&
                              ` x${selected.quantity}`}
                          </Typography>

                          {Number(selected.extraCost) > 0 && (
                            <Typography
                              sx={{
                                fontFamily: "fontFamily.primary",
                                color: "primary.main",
                                fontSize: 11,
                              }}
                            >
                              +
                              {formatCurrency(
                                Number(selected.extraCost) *
                                  Number(selected.quantity || 1),
                              )}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Box>
              </Box>

              <Box
                sx={{
                  mt: "auto",
                  pt: 2,
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "fontFamily.primary",
                      color: "text.primary",
                      fontSize: 23,
                    }}
                  >
                    TOTAL
                  </Typography>

                  <Typography
                    sx={{
                      fontFamily: "fontFamily.primary",
                      color: "primary.main",
                      fontSize: 23,
                    }}
                  >
                    {formatCurrency(totalPrice)}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* ============================= */}
          {/* BOTTOM ACTION */}
          {/* ============================= */}

          <Paper
            elevation={0}
            sx={{
              mt: 1.5,
              p: {
                xs: 1,
                sm: 1.3,
              },
              borderRadius: 2,
              bgcolor: "background.main",
              border: "1px solid",
              borderColor: "rgba(184, 182, 186, 0.22)",
            }}
          >
            <Button
              fullWidth
              variant="contained"
              color="primary"
              disabled={isSaving}
              onClick={handleSave}
              startIcon={
                isSaving ? (
                  <CircularProgress size={20} color="inherit" />
                ) : editing ? (
                  <EditIcon />
                ) : (
                  <ShoppingBagIcon />
                )
              }
              sx={{
                minHeight: 54,
                fontFamily: "fontFamily.primary",
                color: "text.terciary",
                fontSize: {
                  xs: 14,
                  sm: 17,
                },
                borderRadius: 2,
              }}
            >
              {editing
                ? `GUARDAR CAMBIOS · ${formatCurrency(totalPrice)}`
                : `AGREGAR AL PEDIDO · ${formatCurrency(totalPrice)}`}
            </Button>
          </Paper>
        </DialogContent>
      </Dialog>

      <ConfirmDialogClose
        showConfirmClose={showConfirmClose}
        setShowConfirmClose={setShowConfirmClose}
        handleConfirmModalClose={handleConfirmModalClose}
      />

      {AlertComponent}
    </ThemeProvider>
  );
};
