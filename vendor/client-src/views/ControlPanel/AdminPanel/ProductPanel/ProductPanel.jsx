import { useState, useMemo } from "react";

// ---- MATERIAL UI ----
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
// ICONS
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
// <-------------------

// ---- COMPONENTS ----
// import { ProductCard } from './ProductCard/ProductCard.jsx';
import { ModalEditProduct } from "@/components/PanelComponents/ModalEditProduct/ModalEditProduct.jsx";
import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent.jsx";
import { PanelNavBar } from "@/components/PanelComponents/PanelNavBar/PanelNavBar.jsx";
import { QuickEditPopover } from "./QuickEditPopover/QuickEditPopover.jsx";
import { CatalogModal } from "./CreateCatalog/CatalogModal.jsx";
import { generateProductCatalogPDF } from "./CreateCatalog/CreateCatalog.jsx";
// <-------------------

// ---- HOOKS ----
import { useAlert } from "@/hooks/Alert.jsx";
// ---------------

// ---- CONTEXT ----
import { useProducts } from "@/context/Products.jsx";
// -----------------

// ---- STYLES ----
const tableHeadStyle = {
  color: "primary.main",
  textAlign: "center",
  fontFamily: "fontFamily.primary",
};

const tableCellStyle = {
  color: "text.primary",
  textAlign: "center",
  fontFamily: "fontFamily.secondary",
};
// ----------------

export const ProductPanel = ({ user }) => {
  const isElectronApp =
    typeof window !== "undefined" && Boolean(window.electronAPI);
  const [loading, setLoading] = useState(false);
  const { AlertComponent, showAlert } = useAlert();

  const { productState, getAllProducts, updateProduct } = useProducts();

  const allProducts = useMemo(
    () => productState.products || [],
    [productState.products],
  );

  const countAllProducts = useMemo(
    () => productState.products.length || 0,
    [productState.products],
  );

  const [openEditProduct, setOpenEditProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Estados para los popovers de edición rápida
  const [quickEditState, setQuickEditState] = useState({
    anchorEl: null,
    product: null,
    field: null,
    value: "",
  });

  // QUICK EDIT HANDLERS
  const handleQuickEditOpen = (event, product, field) => {
    setQuickEditState({
      anchorEl: event.currentTarget,
      product,
      field,
      value: product[field]?.toString() || "",
    });
  };

  const handleQuickEditClose = () => {
    setQuickEditState({
      anchorEl: null,
      product: null,
      field: null,
      value: "",
    });
  };

  const handleQuickEditSave = async (newValue) => {
    try {
      const updatedProduct = {
        ...quickEditState.product,
        [quickEditState.field]:
          quickEditState.field === "price"
            ? Number.parseFloat(newValue)
            : quickEditState.field === "discount" ||
                quickEditState.field === "rewardPoints" ||
                quickEditState.field === "redeemPoints"
              ? Number.parseInt(newValue, 10)
              : newValue,
      };
      await updateProduct(updatedProduct);
      handleQuickEditClose();
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
    }
  };

  // SELECTED PRODUCT PUT PRODUCTS
  const handleOpenEditProduct = (product) => {
    setSelectedProduct(product);
    setOpenEditProduct(true);
  };

  const handleCloseEditProduct = () => setOpenEditProduct(false);

  const [catalogModalOpen, setCatalogModalOpen] = useState(false);

  const handleOpenCatalogModal = () => {
    const activeProducts = allProducts.filter((p) => p.status === true);

    if (activeProducts.length === 0) {
      showAlert("No hay productos activos para generar el catálogo", "warning");
      return;
    }

    setCatalogModalOpen(true);
  };

  const handleGenerateCatalog = async (restaurantName) => {
    setLoading(true);
    try {
      await generateProductCatalogPDF(allProducts, restaurantName);
      showAlert("Catálogo PDF generado exitosamente", "success");
    } catch (error) {
      console.error("Error al generar el catálogo:", error);
      showAlert(error.message || "Error al generar el catálogo PDF", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      await getAllProducts(user.id);
      showAlert("Productos Actualizados!", "success");
    } catch (error) {
      console.error("Error al obtener los productos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingComponent />;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        height: isElectronApp ? "calc(100vh - 112px)" : "auto",
        overflowY: isElectronApp ? "auto" : "visible",
        overflowX: isElectronApp ? "auto" : "visible",
        pr: isElectronApp ? 1 : 0,
        pb: isElectronApp ? 3 : 0,
      }}
    >
      <Box sx={{ maxWidth: "auto", width: "100%" }}>
        {/* PANELNAVBAR DE LOS PRODUCTOS */}
        <PanelNavBar
          isProductPanel={true}
          handleRefresh={fetchProducts}
          countAllProducts={countAllProducts}
          showAlert={showAlert}
        />
        {/* BOTON PARA CREAR CATALOGO */}
        {allProducts.length > 0 && (
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", mb: 2, px: 2 }}
          >
            <Button
              variant="contained"
              startIcon={<PictureAsPdfIcon />}
              onClick={handleOpenCatalogModal}
              sx={{
                bgcolor: "error.main",
                color: "white",
                fontFamily: "fontFamily.primary",
                "&:hover": {
                  bgcolor: "error.dark",
                },
              }}
            >
              GENERAR CATÁLOGO PDF
            </Button>
          </Box>
        )}
        {/* ---------- */}
        {/* <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          <Stack spacing={2}>
            {allProducts.length > 0 &&
              allProducts.map((p) => (
                <Box key={p.id}>
                  <ProductCard product={p} onEditProduct={() => {}} />
                </Box>
              ))}
          </Stack>
        </Box> */}

        {allProducts.length > 0 ? (
          <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
            <Table sx={{ minWidth: 1180 }}>
              <TableHead sx={{ bgcolor: "background.paper" }}>
                <TableRow sx={{ textAlign: "center" }}>
                  <TableCell sx={tableHeadStyle}>NOMBRE</TableCell>
                  <TableCell sx={tableHeadStyle}>DESCRIPCIÓN</TableCell>
                  <TableCell sx={tableHeadStyle}>CATEGORIA</TableCell>
                  <TableCell sx={tableHeadStyle}>PRECIO</TableCell>
                  <TableCell sx={tableHeadStyle}>DESCUENTO</TableCell>
                  <TableCell sx={tableHeadStyle}>RECOMPENSA</TableCell>
                  <TableCell sx={tableHeadStyle}>CANJE</TableCell>
                  <TableCell sx={tableHeadStyle}>ESTADO</TableCell>
                  <TableCell sx={tableHeadStyle}>MODIFICAR</TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ bgcolor: "background.default" }}>
                {allProducts.map((product) => (
                  <TableRow
                    key={product.id}
                    sx={{
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: "action.hover", // color del fondo
                        transform: "scale(1.002)", // efecto suave
                        boxShadow: 2,
                      },
                    }}
                  >
                    <TableCell component="th" scope="row" sx={tableCellStyle}>
                      {product.name}
                    </TableCell>
                    <TableCell sx={tableCellStyle}>
                      {product.description}
                    </TableCell>
                    <TableCell sx={tableCellStyle}>
                      {product?.category?.name}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...tableCellStyle,
                        cursor: "pointer",
                        position: "relative",
                        "&:hover": {
                          color: "primary.main",
                          bgcolor: "action.hover",
                          "& .quick-edit-icon": {
                            opacity: 1,
                          },
                        },
                      }}
                      onClick={(event) =>
                        handleQuickEditOpen(event, product, "price")
                      }
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: "fontFamily.secondary" }}
                        >
                          ${product.price}
                        </Typography>
                        <EditIcon
                          className="quick-edit-icon"
                          sx={{
                            fontSize: "16px",
                            color: "primary.main",
                            opacity: 0,
                            transition: "opacity 0.2s ease",
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        ...tableCellStyle,
                        cursor: "pointer",
                        "&:hover": {
                          color: "primary.main",
                          bgcolor: "action.hover",
                          "& .quick-edit-icon": {
                            opacity: 1,
                          },
                        },
                      }}
                      onClick={(event) =>
                        handleQuickEditOpen(event, product, "discount")
                      }
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: "fontFamily.secondary" }}
                        >
                          {product.discount}%
                        </Typography>
                        <EditIcon
                          className="quick-edit-icon"
                          sx={{
                            fontSize: "16px",
                            color: "primary.main",
                            opacity: 0,
                            transition: "opacity 0.2s ease",
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        ...tableCellStyle,
                        cursor: "pointer",
                        "&:hover": {
                          color: "primary.main",
                          bgcolor: "action.hover",
                          "& .quick-edit-icon": {
                            opacity: 1,
                          },
                        },
                      }}
                      onClick={(event) =>
                        handleQuickEditOpen(event, product, "rewardPoints")
                      }
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: "fontFamily.secondary" }}
                        >
                          {product.rewardPoints}
                        </Typography>
                        <EditIcon
                          className="quick-edit-icon"
                          sx={{
                            fontSize: "16px",
                            color: "primary.main",
                            opacity: 0,
                            transition: "opacity 0.2s ease",
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        ...tableCellStyle,
                        cursor: "pointer",
                        "&:hover": {
                          color: "primary.main",
                          bgcolor: "action.hover",
                          "& .quick-edit-icon": {
                            opacity: 1,
                          },
                        },
                      }}
                      onClick={(event) =>
                        handleQuickEditOpen(event, product, "redeemPoints")
                      }
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: "fontFamily.secondary" }}
                        >
                          {product.redeemPoints}
                        </Typography>
                        <EditIcon
                          className="quick-edit-icon"
                          sx={{
                            fontSize: "16px",
                            color: "warning.main",
                            opacity: 0,
                            transition: "opacity 0.2s ease",
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {product.status ? (
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "fontFamily.terciary",
                            color: "success.main",
                          }}
                        >
                          ACTIVO
                          <CheckIcon sx={{ color: "success.main" }} />
                        </Typography>
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "fontFamily.terciary",
                            color: "error.main",
                          }}
                        >
                          DESACTIVADO
                          <ClearIcon sx={{ color: "error.main" }} />
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Button onClick={() => handleOpenEditProduct(product)}>
                        <EditIcon
                          sx={{
                            color: "text.primary",
                            "&:hover": {
                              color: "primary.main",
                            },
                          }}
                        />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography
            sx={{
              display: "flex",
              alignContent: "center",
              justifyContent: "center",
              width: "100%",
              paddingTop: "10rem",
              fontFamily: "fontFamily.primary",
            }}
          >
            NO HAY PRODUCTOS DISPONIBLES.
          </Typography>
        )}
        {/* Modal para editar el producto */}
        <ModalEditProduct
          show={openEditProduct}
          handleClose={handleCloseEditProduct}
          showAlert={showAlert}
          showProduct={selectedProduct}
          isEditing={true}
        />
        {/* Popover para edición rápida */}
        <QuickEditPopover
          open={Boolean(quickEditState.anchorEl)}
          anchorEl={quickEditState.anchorEl}
          onClose={handleQuickEditClose}
          showAlert={showAlert}
          onSave={handleQuickEditSave}
          field={quickEditState.field}
          value={quickEditState.value}
          onChange={(newValue) =>
            setQuickEditState((prev) => ({ ...prev, value: newValue }))
          }
        />
      </Box>
      <CatalogModal
        open={catalogModalOpen}
        onClose={() => setCatalogModalOpen(false)}
        onGenerate={handleGenerateCatalog}
        defaultName={user?.businessName || "MI RESTAURANTE"}
      />
      {AlertComponent}
    </Box>
  );
};
