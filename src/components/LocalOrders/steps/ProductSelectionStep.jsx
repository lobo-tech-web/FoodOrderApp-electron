// ---- Material UI ----
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
// Icons
import {
  Add as AddIcon,
  CardGiftcard as CardGiftcardIcon,
  DeleteOutline as DeleteIcon,
  Remove as RemoveIcon,
  Search as SearchIcon,
  ShoppingCart as CartIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Logo ----
import mainLogo from "@/assets/main/logo-white.png";
// --------------

// ---- Utils ----
import { formatCurrency } from "@/utils/orderCalculations.js";
import { getProductPrice } from "../orderUtils.js";
// ---------------

// ---- Styles ----
import { buttonStyle1 } from "../../styles/buttonStyle.js";
// ----------------

export const ProductSelectionStep = ({
  search,
  onSearchChange,
  categories,
  selectedCategories,
  onCategoryToggle,
  loadError,
  onRetry,
  visibleProducts,
  onProductClick,
  cartItems,
  totals,
  onRemoveItem,
  onUpdateQuantity,
  onContinue,
}) => (
  <Box
    sx={{
      bgcolor: "background.main",
      flex: 1,
      minHeight: 0,
      display: "grid",
      gridTemplateColumns: {
        xs: "112px minmax(0, 1fr)",
        sm: "140px minmax(0, 1fr)",
        md: "170px minmax(0, 1fr)",
        lg: "180px minmax(0, 1fr) 360px",
      },
      gridTemplateRows: { xs: "minmax(0, 1fr) auto", lg: "1fr" },
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
        gridRow: { xs: "1 / span 2", lg: "auto" },
        overflowY: "auto",
        px: { xs: 0.75, sm: 1 },
        py: 1.25,
      }}
    >
      <Typography
        sx={{
          fontFamily: "fontFamily.primary",
          color: "primary.main",
          fontSize: "0.82rem",
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
              onClick={() => onCategoryToggle(category)}
              sx={{
                minHeight: { xs: 48, sm: 54 },
                px: { xs: 0.5, sm: 0.8 },
                py: 0.75,
                justifyContent: "center",
                borderRadius: 2,
                fontFamily: "fontFamily.secondary",
                fontSize: "0.72rem",
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

    <Box sx={{ minWidth: 0, overflow: "auto", p: { xs: 1.5, md: 2.5 } }}>
      <TextField
        fullWidth
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Buscar producto"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ fontFamily: "fontFamily.secondary", mb: 1.5 }}
      />

      {loadError && (
        <Alert
          severity="error"
          action={<Button onClick={onRetry}>Reintentar</Button>}
          sx={{ mb: 2 }}
        >
          {loadError}
        </Alert>
      )}

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
        {visibleProducts.map((product) => (
          <Paper
            component="button"
            type="button"
            key={product.id}
            onClick={() => onProductClick(product)}
            elevation={0}
            sx={{
              appearance: "none",
              p: 0,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              bgcolor: "background.main",
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
              component="img"
              src={product.image || mainLogo}
              alt={product.name}
              sx={{
                width: "100%",
                height: { xs: 86, sm: 92, md: 96 },
                display: "block",
                objectFit: "contain",
                bgcolor: "background.default",
              }}
            />
            <Box sx={{ p: { xs: 0.85, sm: 1 } }}>
              <Typography
                sx={{
                  fontFamily: "fontFamily.secondary",
                  color: "text.primary",
                  fontSize: { xs: "0.82rem", sm: "1rem" },
                  lineHeight: 1.15,
                  minHeight: { xs: 30, sm: 32 },
                  overflowWrap: "anywhere",
                  textAlign: "center",
                }}
              >
                {product.name.toUpperCase()}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "fontFamily.primary",
                  color: "primary.main",
                  fontSize: { xs: "0.9rem", sm: "1.2rem" },
                  mt: 0.6,
                  textAlign: "center",
                }}
              >
                {formatCurrency(getProductPrice(product))}
              </Typography>
              {Number(product.redeemPoints || 0) > 0 && (
                <Chip
                  icon={<CardGiftcardIcon />}
                  size="small"
                  label={`Canje ${product.redeemPoints} pts.`}
                  color="error"
                  sx={{
                    mt: 0.75,
                    width: "100%",
                    fontFamily: "fontFamily.secondary",
                  }}
                />
              )}
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>

    <Paper
      square
      elevation={0}
      sx={{
        bgcolor: "background.main",
        borderLeft: { lg: "1px solid" },
        borderTop: { xs: "1px solid", lg: 0 },
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        gridColumn: { xs: "2", lg: "auto" },
        minHeight: { xs: 300, lg: 0 },
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
            sx={{ fontFamily: "fontFamily.primary", fontSize: "1.2rem" }}
          >
            TU PEDIDO
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
          <Box sx={{ textAlign: "center", color: "text.primary", py: 5 }}>
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
              key={`${item.productId}-${index}`}
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
                  <Typography sx={{ fontFamily: "fontFamily.secondary" }}>
                    {item.name}
                  </Typography>
                  {(item.customOptions || []).map((option, optionIndex) => (
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
                  ))}
                  {Number(item.redeemPoints || 0) > 0 && (
                    <Chip
                      size="small"
                      label={`-${Number(item.redeemPoints) * Number(item.quantity || 1)} pts.`}
                      color="primary"
                      sx={{ mt: 0.75, fontFamily: "fontFamily.secondary" }}
                    />
                  )}
                </Box>
                <Tooltip title="Quitar producto">
                  <IconButton
                    aria-label={`Quitar ${item.name}`}
                    color="error"
                    onClick={() => onRemoveItem(index)}
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
                  mt: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <IconButton
                    aria-label="Restar uno"
                    onClick={() => onUpdateQuantity(index, -1)}
                    sx={{
                      color: "primary.main",
                      border: "1px solid",
                      borderColor: "primary.main",
                    }}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <Typography
                    sx={{
                      fontFamily: "fontFamily.primary",
                      width: 34,
                      textAlign: "center",
                    }}
                  >
                    {item.quantity}
                  </Typography>
                  <IconButton
                    aria-label="Sumar uno"
                    onClick={() => onUpdateQuantity(index, 1)}
                    sx={{
                      color: "primary.main",
                      border: "1px solid",
                      borderColor: "primary.main",
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
                <Typography sx={{ fontFamily: "fontFamily.primary" }}>
                  {formatCurrency(item.price * item.quantity)}
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
          <Typography
            sx={{ fontFamily: "fontFamily.primary", fontSize: "1.1rem" }}
          >
            TOTAL
          </Typography>
          <Typography
            sx={{
              fontFamily: "fontFamily.primary",
              fontSize: "1.6rem",
              color: "primary.main",
              fontWeight: 900,
            }}
          >
            {formatCurrency(totals.subtotalProducts)}
          </Typography>
        </Box>
        {Number(totals.totalRedeemPoints || 0) > 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <Typography sx={{ fontFamily: "fontFamily.secondary" }}>
              Puntos a canjear
            </Typography>
            <Chip
              label={`-${totals.totalRedeemPoints} pts.`}
              color="error"
              sx={{ fontFamily: "fontFamily.secondary", fontWeight: 800 }}
            />
          </Box>
        )}
        <Button
          fullWidth
          size="large"
          variant="contained"
          disabled={!cartItems.length}
          onClick={onContinue}
          sx={buttonStyle1}
        >
          Continuar
        </Button>
      </Box>
    </Paper>
  </Box>
);
