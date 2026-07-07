import { useState, useEffect, useMemo, useCallback } from "react";

// ---- MATERIAL UI ----
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  Collapse,
  Divider,
  List,
  ListItem,
  TextField,
  InputAdornment,
  Stack,
  Tooltip,
} from "@mui/material";
// ICONS
import {
  ExpandLess,
  ExpandMore,
  Edit as EditIcon,
  Add as AddIcon,
  LocalDining as LocalDiningIcon,
  LunchDining as LunchDiningIcon,
  TaskAlt as TaskAltIcon,
  CheckBox as CheckBoxIcon,
  PlusOne as PlusOneIcon,
  Search as SearchIcon,
  Inventory2 as EmptyIcon,
  Category as CategoryIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
// ---------------------

// ---- CONTEXT ----
import { useProducts } from "@/context/Products.jsx";
// -----------------

// ---- HOOKS ----
import { useAlert } from "@/hooks/Alert.jsx";
// ---------------

// ---- COMPONENTS ----
import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent.jsx";
import { CustomOptionNavBar } from "./CustomOptionNavBar/CustomOptionNavBar.jsx";
import { ModalCreateCustomOption } from "@/components/PanelComponents/ModalCreateCustomOption/ModalCreateCustomOption.jsx";
import { ModalAssignProductsCustomOption } from "@/components/PanelComponents/ModalAssignProductsCustomOption/ModalAssignProductsCustomOption.jsx";
import { ModalDeleteCustomOption } from "./ModalDeleteCustomOption/ModalDeleteCustomOption.jsx";
// --------------------

// ---- STYLES ----
const buttonStyle = {
  bgcolor: "primary.main",
  color: "text.terciary",
  fontFamily: "fontFamily.terciary",
  borderRadius: "8px",
  px: 2,
  py: 0.5,
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  "&:hover": {
    bgcolor: "background.paper",
    color: "primary.main",
    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
  },
};
const chipStyle = {
  fontFamily: "fontFamily.secondary",
  color: "text.primary",
};
// ----------------

export const CustomOptionPanel = ({ user }) => {
  const isElectronApp =
    typeof window !== "undefined" && Boolean(window.electronAPI);
  const [loading, setLoading] = useState(false);
  const { AlertComponent, showAlert } = useAlert();
  const { productState, getAllCustomOptions, deleteCustomOption } =
    useProducts();

  const allCustomOptions = useMemo(
    () => productState.customOptions || [],
    [productState.customOptions],
  );

  const allProducts = useMemo(
    () => productState?.allProducts || [],
    [productState?.allProducts],
  );

  const [expanded, setExpanded] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOption, setEditOption] = useState(null);

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    option: null,
    loading: false,
  });

  const openDeleteDialog = (option) => {
    setDeleteDialog({
      open: true,
      option,
      loading: false,
    });
  };

  const closeDeleteDialog = () => {
    if (deleteDialog.loading) return;

    setDeleteDialog({
      open: false,
      option: null,
      loading: false,
    });
  };

  const handleDeleteCustomOption = async () => {
    if (!deleteDialog.option?.id) return;

    setDeleteDialog((prev) => ({
      ...prev,
      loading: true,
    }));

    try {
      await deleteCustomOption(deleteDialog.option.id, user?.id);

      setExpanded((prev) => (prev === deleteDialog.option.id ? null : prev));

      if (assignModal.option?.id === deleteDialog.option.id) closeAssignModal();

      showAlert("Personalización eliminada correctamente", "success");

      setDeleteDialog({
        open: false,
        option: null,
        loading: false,
      });
    } catch (error) {
      showAlert(error || "Error al eliminar la personalización", "error");

      setDeleteDialog((prev) => ({
        ...prev,
        loading: false,
      }));
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [relationFilter, setRelationFilter] = useState("all");

  const getProductCategoryName = (product) => {
    return product?.category?.name || product?.category || "Sin categoría";
  };

  // Devuelve los productos relacionados a una custom option
  const getRelatedProducts = useCallback(
    (option) => {
      if (!option) return [];
      if (Array.isArray(option.products)) return option.products;

      return allProducts.filter((product) =>
        product.productCustomOptions?.some(
          (customOption) => customOption.id === option.id,
        ),
      );
    },
    [allProducts],
  );

  const getRelatedCategories = (products = []) => {
    const categoriesMap = new Map();

    products.forEach((product) => {
      const categoryName = getProductCategoryName(product);
      categoriesMap.set(categoryName, {
        name: categoryName,
        count: (categoriesMap.get(categoryName)?.count || 0) + 1,
      });
    });

    return [...categoriesMap.values()].sort((a, b) => b.count - a.count);
  };

  const filteredCustomOptions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return allCustomOptions.filter((option) => {
      const relatedProducts = getRelatedProducts(option);

      const matchesSearch =
        !term ||
        option.name?.toLowerCase().includes(term) ||
        option.items?.some((item) => item.name?.toLowerCase().includes(term)) ||
        relatedProducts.some((product) =>
          product.name?.toLowerCase().includes(term),
        );

      const matchesType = typeFilter === "all" || option.type === typeFilter;

      const matchesRelation =
        relationFilter === "all" ||
        (relationFilter === "withProducts" && relatedProducts.length > 0) ||
        (relationFilter === "withoutProducts" && relatedProducts.length === 0);

      return matchesSearch && matchesType && matchesRelation;
    });
  }, [
    allCustomOptions,
    searchTerm,
    typeFilter,
    relationFilter,
    getRelatedProducts,
  ]);

  const [assignModal, setAssignModal] = useState({
    open: false,
    option: null,
  });

  const openAssignModal = (option) => {
    setAssignModal({
      open: true,
      option,
    });
  };

  const closeAssignModal = () => {
    setAssignModal({
      open: false,
      option: null,
    });
  };

  const fetchCustomOptions = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      await getAllCustomOptions(user.id);
    } catch (error) {
      console.error("Error al obtener las custom options:", error);
    } finally {
      setLoading(false);
    }
  }, [getAllCustomOptions, user.id]);

  const onSaved = async () => {
    try {
      await fetchCustomOptions();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error al obtener las custom options:", error);
    }
  };

  // Cargar custom options al montar
  useEffect(() => {
    if (user?.id) {
      fetchCustomOptions();
    }
  }, [user?.id, fetchCustomOptions]);

  const openCreateDialog = () => {
    setEditOption(null);
    setDialogOpen(true);
  };

  const openEditDialog = (option) => {
    setEditOption(option);
    setDialogOpen(true);
  };

  const optionTypes = {
    unique: {
      label: "Seleccion única obligatoria",
      icon: <TaskAltIcon color="primary" />,
    },
    checkbox: {
      label: "Seleccion múltiple",
      icon: <CheckBoxIcon color="info" />,
    },
    extra: {
      label: "Opción incrementable",
      icon: <PlusOneIcon color="success" />,
    },
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
      <Box sx={{ width: "100%" }}>
        <CustomOptionNavBar
          handleRefresh={fetchCustomOptions}
          addCustom={openCreateDialog}
        />

        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: "fontFamily.secondary",
            color: "text.primary",
            mb: 1,
          }}
        >
          Personaliza tu menú agregandole opciones a tus productos para
          acompañar, agregar o quitar (ingredientes - productos - u otros) según
          el criterio de tus clientes.
        </Typography>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "rgba(184, 182, 186, 0.22)",
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1.4fr 1fr 1fr",
              },
              gap: 1.5,
              alignItems: "center",
            }}
          >
            <TextField
              fullWidth
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar opción, item o producto..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Typography
                variant="caption"
                sx={{ fontFamily: "fontFamily.secondary" }}
              >
                Tipo:
              </Typography>
              <Chip
                label="Todas"
                clickable
                color={typeFilter === "all" ? "primary" : "default"}
                onClick={() => setTypeFilter("all")}
                sx={chipStyle}
              />
              <Chip
                label="Única"
                clickable
                color={typeFilter === "unique" ? "primary" : "default"}
                onClick={() => setTypeFilter("unique")}
                sx={chipStyle}
              />
              <Chip
                label="Múltiple"
                clickable
                color={typeFilter === "checkbox" ? "primary" : "default"}
                onClick={() => setTypeFilter("checkbox")}
                sx={chipStyle}
              />
              <Chip
                label="Incrementable"
                clickable
                color={typeFilter === "extra" ? "primary" : "default"}
                onClick={() => setTypeFilter("extra")}
                sx={chipStyle}
              />
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Typography
                variant="caption"
                sx={{ fontFamily: "fontFamily.secondary" }}
              >
                Mostrar:
              </Typography>
              <Chip
                label="Todas"
                clickable
                variant={relationFilter === "all" ? "filled" : "outlined"}
                color={relationFilter === "all" ? "primary" : "default"}
                onClick={() => setRelationFilter("all")}
                sx={chipStyle}
              />
              <Chip
                label="Con productos"
                clickable
                variant={
                  relationFilter === "withProducts" ? "filled" : "outlined"
                }
                color={
                  relationFilter === "withProducts" ? "primary" : "default"
                }
                onClick={() => setRelationFilter("withProducts")}
                sx={chipStyle}
              />
              <Chip
                label="Sin productos"
                clickable
                variant={
                  relationFilter === "withoutProducts" ? "filled" : "outlined"
                }
                color={
                  relationFilter === "withoutProducts" ? "primary" : "default"
                }
                onClick={() => setRelationFilter("withoutProducts")}
                sx={chipStyle}
              />
            </Stack>
          </Box>
        </Paper>

        {filteredCustomOptions.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: "center",
              bgcolor: "background.paper",
              border: "1px dashed",
              borderColor: "rgba(184, 182, 186, 0.28)",
              borderRadius: 2,
            }}
          >
            <EmptyIcon sx={{ fontSize: 44, color: "text.secondary", mb: 1 }} />
            <Typography
              sx={{
                fontFamily: "fontFamily.primary",
                color: "text.primary",
              }}
            >
              No se encontraron personalizaciónes
            </Typography>
            <Typography
              sx={{
                fontFamily: "fontFamily.secondary",
                color: "text.secondary",
                fontSize: 14,
              }}
            >
              Probá cambiando los filtros o creando una nueva personalización.
            </Typography>
          </Paper>
        ) : (
          filteredCustomOptions.map((option) => {
            const relatedProducts = getRelatedProducts(option);
            const relatedCategories = getRelatedCategories(relatedProducts);
            const visibleProducts = relatedProducts.slice(0, 3);
            const hiddenProductsCount =
              relatedProducts.length - visibleProducts.length;
            const isExpanded = expanded === option.id;
            const selectedType = optionTypes[option.type];
            return (
              <Paper
                key={option.id}
                sx={{
                  mb: 2,
                  p: 2,
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "primary.main",
                  borderRadius: 1,
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto 1fr",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifySelf: "start",
                      gap: 1,
                    }}
                  >
                    <IconButton
                      onClick={() => setExpanded(isExpanded ? null : option.id)}
                      size="small"
                      sx={{ color: "primary.main" }}
                    >
                      {isExpanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>

                    <LocalDiningIcon color="primary" />

                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontFamily: "fontFamily.primary",
                        color: "text.primary",
                      }}
                    >
                      {option.name}
                    </Typography>

                    <IconButton
                      onClick={() => openEditDialog(option)}
                      size="small"
                      sx={{ color: "primary.main" }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>

                    <Tooltip title="Eliminar personalización" arrow>
                      <IconButton
                        onClick={() => openDeleteDialog(option)}
                        size="small"
                        sx={{
                          color: "error.main",
                          border: "1px solid",
                          borderColor: "transparent",
                          "&:hover": {
                            borderColor: "error.main",
                            bgcolor: "rgba(244, 67, 54, 0.08)",
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      justifySelf: "center",
                      gap: 1,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontFamily: "fontFamily.secondary",
                        color: "text.primary",
                      }}
                    >
                      Tipo:
                    </Typography>

                    {selectedType?.icon}

                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontFamily: "fontFamily.secondary",
                        color: "primary.main",
                      }}
                    >
                      {selectedType?.label || option.type}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: 1,
                      justifySelf: "end",
                    }}
                  >
                    <Chip
                      label={`${relatedProducts.length} producto(s)`}
                      variant="outlined"
                      size="medium"
                      sx={{
                        fontFamily: "fontFamily.secondary",
                        borderColor: "text.primary",
                      }}
                    />
                    <Button
                      startIcon={<AddIcon />}
                      endIcon={<LunchDiningIcon />}
                      variant="outlined"
                      onClick={() => openAssignModal(option)}
                      sx={buttonStyle}
                    >
                      PRODUCTOS
                    </Button>
                  </Box>
                </Box>

                {/* Panel desplegable con productos e items */}
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <Divider sx={{ my: 2 }} />
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontFamily: "fontFamily.secondary",
                      color: "primary.main",
                      mt: 1,
                    }}
                  >
                    Items personalizados:
                  </Typography>
                  <List dense>
                    {[...(option.items || [])]
                      .sort(
                        (a, b) =>
                          Number(a.priority ?? 10) - Number(b.priority ?? 10),
                      )
                      .map((item) => (
                        <ListItem
                          key={item.id}
                          disableGutters
                          sx={{
                            pl: 0.5,
                            opacity: item.status === false ? 0.5 : 1,
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontFamily: "fontFamily.secondary",
                              color: "text.primary",
                            }}
                          >
                            {item.name}
                            {Number(item.extraCost) > 0 &&
                              ` (+$${item.extraCost})`}
                            {item.status === false && " — Inactivo"}
                          </Typography>
                        </ListItem>
                      ))}
                  </List>

                  <Divider sx={{ my: 1 }} />

                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontFamily: "fontFamily.secondary",
                      color: "primary.main",
                      mb: 0.5,
                    }}
                  >
                    Productos asociados:
                  </Typography>
                  {relatedProducts.length === 0 ? (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        color: "text.secondary",
                        mb: 1,
                      }}
                    >
                      <EmptyIcon fontSize="small" />
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontFamily: "fontFamily.secondary",
                          color: "text.secondary",
                        }}
                      >
                        No hay productos asociados.
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1,
                          mb: 1.5,
                        }}
                      >
                        {relatedCategories.map((category) => (
                          <Chip
                            key={category.name}
                            icon={<CategoryIcon />}
                            label={`${category.name} (${category.count})`}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontFamily: "fontFamily.secondary",
                              color: "text.primary",
                              borderColor: "text.primary",
                            }}
                          />
                        ))}
                      </Box>
                      <List
                        dense
                        sx={{
                          display: "flex",
                          gap: 1,
                        }}
                      >
                        {visibleProducts.map((prod) => {
                          const relation =
                            prod.ProductCustomOption ||
                            prod.productCustomOption ||
                            prod.ProductCustomOptions ||
                            {};

                          return (
                            <ListItem
                              key={prod.id}
                              disableGutters
                              sx={{
                                display: "flex",
                                gap: 1,
                                alignItems: "center",
                                px: 1,
                                py: 0.8,
                                mb: 0.6,
                                borderRadius: 8,
                                bgcolor: "background.paper",
                              }}
                            >
                              <LunchDiningIcon color="primary" />
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography
                                  sx={{
                                    fontFamily: "fontFamily.primary",
                                    color: "text.primary",
                                    fontSize: 16,
                                  }}
                                >
                                  {prod.name}
                                </Typography>

                                <Typography
                                  sx={{
                                    fontFamily: "fontFamily.secondary",
                                    color: "text.secondary",
                                    fontSize: 12,
                                  }}
                                >
                                  {getProductCategoryName(prod)}
                                </Typography>
                              </Box>

                              <Chip
                                label={`Prioridad ${relation.priority ?? 10}`}
                                size="small"
                                variant="outlined"
                                sx={chipStyle}
                              />
                            </ListItem>
                          );
                        })}
                      </List>
                      {hiddenProductsCount > 0 && (
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "fontFamily.secondary",
                            color: "text.primary",
                            mt: 0.8,
                          }}
                        >
                          + {hiddenProductsCount} producto(s) más. Tocá
                          “PRODUCTOS” para ver o editar todos.
                        </Typography>
                      )}
                    </>
                  )}
                </Collapse>
              </Paper>
            );
          })
        )}
      </Box>
      {/* Modal para crear/editar */}
      <ModalCreateCustomOption
        open={dialogOpen}
        option={editOption}
        handleClose={() => setDialogOpen(false)}
        showAlert={showAlert}
        onSaved={onSaved}
      />
      <ModalAssignProductsCustomOption
        open={assignModal.open}
        option={assignModal.option}
        onClose={closeAssignModal}
        onSaved={async () => {
          closeAssignModal();
          await fetchCustomOptions();
        }}
        showAlert={showAlert}
      />

      <ModalDeleteCustomOption
        open={deleteDialog.open}
        option={deleteDialog.option}
        relatedProductsCount={
          deleteDialog.option
            ? getRelatedProducts(deleteDialog.option).length
            : 0
        }
        loading={deleteDialog.loading}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteCustomOption}
      />
      {AlertComponent}
    </Box>
  );
};
