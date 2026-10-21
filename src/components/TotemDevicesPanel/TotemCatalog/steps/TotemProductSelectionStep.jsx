import { useMemo, useState } from "react";

// ---- Material UI ----
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  InputAdornment,
  MenuItem,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
// Icons
import {
  Restaurant as RestaurantIcon,
  Search as SearchIcon,
  Add as AddIcon,
  GridViewOutlined as GridIcon,
  ChevronRight as ChevronRightIcon,
  Stars as StarsIcon,
  Refresh as RefreshIcon,
  Whatshot as WhatshotIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Components ----
import { TotemNavbarCart } from "./TotemNavbarCart.jsx";
// --------------------

// ---- Utils ----
import { money } from "../totemCart.js";
import { getTotemCategoryIcon } from "../totemCatalogUtils/totemCategoryIcons.jsx";
import {
  sortTotemProducts,
  TOTEM_SORT_OPTIONS,
} from "../totemCatalogUtils/totemProductSort.js";
// ---------------

// Ancho mínimo en píxeles: bajalo para mostrar más tarjetas por fila.
const PRODUCT_CARD_MIN_WIDTH = { xs: 120, sm: 180, md: 240 };

export const TotemProductSelectionStep = ({
  catalog,
  loading,
  loadError,
  search,
  onSearch,
  categories,
  onCategories,
  cart,
  onViewCart,
  onReload,
  onSelectProduct,
}) => {
  const [sortOrder, setSortOrder] = useState("name_asc");
  const products = useMemo(
    () =>
      sortTotemProducts(
        (catalog?.products || []).filter(
          (item) =>
            (!categories.length || categories.includes(item.categoryId)) &&
            `${item.name} ${item.description || ""}`
              .toLocaleLowerCase("es-AR")
              .includes(search.trim().toLocaleLowerCase("es-AR")),
        ),
        sortOrder,
      ),
    [catalog, categories, search, sortOrder],
  );
  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "100%",
            md: "220px minmax(0, 1fr)",
            xl: "240px minmax(0, 1fr)",
          },
          alignItems: "start",
        }}
      >
        <Stack
          component="nav"
          aria-label="Categorías de productos"
          spacing={1}
          sx={{
            p: 1,
            position: { md: "sticky" },
            top: 0,
            borderRight: { md: "1px solid" },
            borderColor: "divider",
            maxHeight: { xs: 200, md: "calc(100dvh - 180px)" },
            overflowY: "auto",
          }}
        >
          <Button
            startIcon={<GridIcon />}
            endIcon={<ChevronRightIcon />}
            aria-pressed={!categories.length}
            variant={!categories.length ? "contained" : "outlined"}
            onClick={() => onCategories([])}
            sx={{
              minHeight: 56,
              justifyContent: "flex-start",
              px: 1.5,
              "& .MuiButton-endIcon": { ml: "auto" },
            }}
          >
            Todos
          </Button>

          {(catalog?.categories || []).map((category) => {
            const CategoryIcon = getTotemCategoryIcon(category);

            return (
              <Button
                key={category.id}
                startIcon={<CategoryIcon />}
                endIcon={<ChevronRightIcon />}
                aria-pressed={categories.includes(category.id)}
                variant={
                  categories.includes(category.id) ? "contained" : "outlined"
                }
                onClick={() =>
                  onCategories((current) =>
                    current.includes(category.id)
                      ? current.filter((id) => id !== category.id)
                      : [...current, category.id],
                  )
                }
                sx={{
                  minHeight: 56,
                  overflowWrap: "anywhere",
                  textAlign: "left",
                  justifyContent: "flex-start",
                  px: 1.5,
                  "& .MuiButton-endIcon": { ml: "auto" },
                }}
              >
                {category.name}
              </Button>
            );
          })}
        </Stack>

        <Box sx={{ p: 2, minWidth: 0 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ mb: 2 }}
          >
            <TextField
              label="Buscar productos"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              size="small"
              fullWidth
              value={search}
              onChange={(event) => onSearch(event.target.value)}
            />

            <Button
              startIcon={<RefreshIcon />}
              disabled={loading || cart.length > 0}
              onClick={onReload}
            >
              Actualizar
            </Button>
          </Stack>

          {loadError && <Alert severity="error">{loadError}</Alert>}

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography
                component="h1"
                sx={{
                  fontFamily: "fontFamily.primary",
                  fontSize: { xs: "1.4rem", md: "1.6rem" },
                }}
              >
                NUESTROS PRODUCTOS
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Elegí tus favoritos y personalizá tu pedido.
              </Typography>
            </Box>

            <TextField
              select
              label="Ordenar por"
              size="small"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              sx={{ minWidth: { sm: 220 } }}
            >
              {TOTEM_SORT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          {loading && <CircularProgress />}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: Object.fromEntries(
                Object.entries(PRODUCT_CARD_MIN_WIDTH).map(
                  ([breakpoint, width]) => [
                    breakpoint,
                    `repeat(auto-fill, minmax(min(100%, ${width}px), 1fr))`,
                  ],
                ),
              ),
              gap: { xs: 1, md: 1.25 },
              gridAutoRows: "1fr",
            }}
          >
            {products.map((item) => (
              <Card
                key={item.id}
                variant="outlined"
                sx={{ borderRadius: 1, height: "100%", minWidth: 0 }}
              >
                <CardActionArea
                  onClick={() => onSelectProduct(item)}
                  aria-label={item.name}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    width: "100%",
                    height: "100%",
                    appearance: "none",
                    p: 0,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    bgcolor: "background.default",
                    color: "text.primary",
                    textAlign: "left",
                    cursor: "pointer",
                    minWidth: 0,
                    "&:active": { transform: "scale(0.98)" },
                    "&:focus-visible": {
                      outline: "3px solid",
                      outlineColor: "primary.main",
                    },
                  }}
                >
                  <Box
                    sx={{
                      aspectRatio: "4/3",
                      width: "100%",
                      flexShrink: 0,
                      position: "relative",
                      bgcolor: "background.paper",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {item.specialTitle && (
                      <Chip
                        icon={<WhatshotIcon />}
                        label={item.specialTitle}
                        size="small"
                        color="primary"
                        sx={{
                          position: "absolute",
                          zIndex: 1,
                          top: 8,
                          left: 8,
                          maxWidth: "calc(100% - 16px)",
                          fontFamily: "fontFamily.secondary",
                        }}
                      />
                    )}

                    {item.image || catalog?.restaurant?.businessLogoUrl ? (
                      <Box
                        component="img"
                        src={item.image || catalog.restaurant.businessLogoUrl}
                        alt={
                          item.image
                            ? item.name
                            : `Logo de ${catalog.restaurant.businessName || "el local"}`
                        }
                        loading="lazy"
                        sx={{
                          width: "100%",
                          height: "100%",
                          position: "absolute",
                          inset: 0,
                          display: "block",
                          objectFit: item.image ? "cover" : "contain",
                        }}
                      />
                    ) : (
                      <RestaurantIcon
                        sx={{ fontSize: 48, color: "text.secondary" }}
                      />
                    )}
                  </Box>

                  <CardContent
                    sx={{
                      minWidth: 0,
                      width: "100%",
                      flex: 1,
                      p: { xs: 1, sm: 1.5 },
                      "&:last-child": { pb: { xs: 1, sm: 1.5 } },
                    }}
                  >
                    <Typography
                      title={item.name}
                      sx={{
                        fontFamily: "fontFamily.primary",
                        color: "text.primary",
                        fontSize: { xs: "0.9rem", sm: "1.05rem" },
                        lineHeight: 1.2,
                        height: "2.4em",
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                        overflow: "hidden",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {item.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: "0.75rem", sm: "0.82rem" },
                        lineHeight: 1.35,
                        height: "2.7em",
                        mt: 0.5,
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                        overflow: "hidden",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {item.description || ""}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ minHeight: 64, mt: 1 }}
                    >
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        {item.redeemPoints > 0 ? (
                          <Stack
                            spacing={0.5}
                            alignItems="flex-start"
                            sx={{ minWidth: 0 }}
                          >
                            <Chip
                              icon={<StarsIcon />}
                              label="Canje por puntos"
                              color="primary"
                              size="small"
                              sx={{
                                maxWidth: "100%",
                                height: "auto",
                                minHeight: 24,
                                "& .MuiChip-label": {
                                  whiteSpace: "normal",
                                  py: 0.5,
                                },
                                fontWeight: 700,
                                fontSize: { xs: "0.65rem", sm: "0.75rem" },
                              }}
                            />
                            <Typography
                              color="primary"
                              sx={{
                                fontFamily: "fontFamily.primary",
                                fontSize: "1.1rem",
                                overflowWrap: "anywhere",
                              }}
                            >
                              {item.redeemPoints} puntos
                            </Typography>
                          </Stack>
                        ) : (
                          <Typography
                            sx={{
                              fontFamily: "fontFamily.primary",
                              color: "primary.main",
                              fontSize: { xs: "1.1rem", md: "1.2rem" },
                              overflowWrap: "anywhere",
                            }}
                          >
                            {money(item.displayPrice)}
                          </Typography>
                        )}
                      </Box>
                      <Box
                        aria-hidden="true"
                        sx={{
                          width: 32,
                          height: 32,
                          flexShrink: 0,
                          borderRadius: "50%",
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        <AddIcon fontSize="small" />
                      </Box>
                    </Stack>{" "}
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
          {!loading && !products.length && (
            <Typography sx={{ fontFamily: "fontFamily.secondary", p: 2 }}>
              No hay productos disponibles con estos filtros.
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ height: { xs: 200, sm: 140 } }} />

      <TotemNavbarCart
        cart={cart}
        onViewCart={onViewCart}
        disabled={loading || !catalog}
      />
    </>
  );
};
