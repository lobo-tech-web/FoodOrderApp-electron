import { useState, useMemo, useCallback } from "react";

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
  Chip,
  IconButton,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
// <--------------------

// ------- COMPONENT ----------
import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent.jsx";
import { PanelNavBar } from "@/components/PanelComponents/PanelNavBar/PanelNavBar.jsx";
import { ModalEditCategory } from "@/components/PanelComponents/ModalEditCategory/ModalEditCategory.jsx";
// ----------------------------

// ---- HOOKS ----
import { useAlert } from "@/hooks/Alert.jsx";
// ---------------

// ---- CONTEXT ------
import { useProducts } from "@/context/Products.jsx";
// -------------------

// ---- STYLES ----
const tableHeadStyle = {
  fontFamily: "fontFamily.primary",
  color: "primary.main",
  textAlign: "center",
};

const tableCellStyle = {
  fontFamily: "fontFamily.secondary",
  color: "text.primary",
  textAlign: "center",
};
// ----------------

export const CategoryPanel = ({ user }) => {
  const isElectronApp =
    typeof window !== "undefined" && Boolean(window.electronAPI);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { AlertComponent, showAlert } = useAlert();
  const { productState, getAllCategorys } = useProducts();

  // TRAEMOS LAS CATEGORIAS DEL CONTEXT
  const allCategorys = useMemo(
    () => productState.categorys || [],
    [productState.categorys],
  );

  // TRAEMOS LOS PRODUCTS DEL CONTEXT
  const allProducts = useMemo(
    () => productState.allProducts || [],
    [productState.allProducts],
  );

  // Contar productos por categoría
  const categoryCounts = useCallback(
    (category) => {
      return allProducts.filter(
        (product) => product?.categoryId === category.id,
      ).length;
    },
    [allProducts],
  );

  // ESTADO PARA MODAL EDIT CATEGORY
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryItems, setSelectedCategoryItems] = useState(null);

  // ESTADO PARA EL LOADING
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const handleOpen = (category) => {
    setSelectedCategory(category);
    const quantity = categoryCounts(category);
    setSelectedCategoryItems(quantity);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const fetchCategorys = async () => {
    setLoading(true);
    try {
      await getAllCategorys(user.id);
    } catch (error) {
      console.error("Error al obtener las categorias:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingComponent />;

  return (
    <Box
      sx={{
        width: "100%",
        height: isElectronApp ? "calc(100vh - 112px)" : "auto",
        overflowY: isElectronApp ? "auto" : "visible",
        overflowX: isElectronApp ? "auto" : "visible",
        pr: isElectronApp ? 1 : 0,
        pb: isElectronApp ? 3 : 4,
      }}
    >
      {/* PANELNAVBAR DE LAS CATEGORIAS */}
      <PanelNavBar
        isCategoryPanel={true}
        handleRefresh={fetchCategorys}
        showAlert={showAlert}
      />
      {/*  */}
      {allCategorys.length > 0 ? (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: isMobile ? 0 : 3,
            border: "1px solid",
            borderColor: "divider",
            overflowX: "auto",
          }}
        >
          <Table size={isMobile ? "small" : "medium"}>
            <TableHead sx={{ bgcolor: "background.paper" }}>
              <TableRow sx={{ textAlign: "center" }}>
                <TableCell sx={tableHeadStyle}>N° DE POSICIÓN</TableCell>
                <TableCell sx={tableHeadStyle}>
                  NOMBRE DE LA CATEGORIA
                </TableCell>
                <TableCell sx={tableHeadStyle}>CANT. DE PRODUCTOS</TableCell>
                <TableCell sx={tableHeadStyle}>ACCIONES</TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={{ bgcolor: "background.default" }}>
              {allCategorys.map((category) => (
                <TableRow key={category.id} sx={{ textAlign: "center" }}>
                  <TableCell sx={tableCellStyle}>{category.position}</TableCell>
                  <TableCell sx={tableCellStyle}>{category.name}</TableCell>
                  <TableCell sx={tableCellStyle}>
                    {categoryCounts(category)}
                  </TableCell>
                  <TableCell sx={tableCellStyle} align="right">
                    <IconButton
                      onClick={() => handleOpen(category)}
                      color="inherit"
                      sx={{
                        "&:hover": {
                          color: "primary.main",
                          bgcolor: "transparent",
                        },
                      }}
                    >
                      <EditIcon
                        sx={{
                          color: "text.primary",
                          "&:hover": {
                            color: "primary.main",
                          },
                        }}
                      />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ py: 10, textAlign: "center" }}>
          <Typography
            variant="h6"
            sx={{
              display: "flex",
              alignContent: "center",
              justifyContent: "center",
              width: "100%",
              paddingTop: "10rem",
              fontFamily: "fontFamily.primary",
              color: "text.primary",
            }}
          >
            NO HAY CATEGORIAS DISPONIBLES
          </Typography>
        </Box>
      )}
      {AlertComponent}
      <ModalEditCategory
        show={open}
        handleClose={handleClose}
        showAlert={showAlert}
        isEditing={true}
        showCategory={selectedCategory}
        selectedCategoryItems={selectedCategoryItems}
        fetchCategorys={fetchCategorys}
      />
    </Box>
  );
};
