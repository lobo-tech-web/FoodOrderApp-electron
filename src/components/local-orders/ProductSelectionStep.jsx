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
import {
  Add as AddIcon,
  DeleteOutline as DeleteIcon,
  Remove as RemoveIcon,
  Search as SearchIcon,
  ShoppingCart as CartIcon,
} from "@mui/icons-material";
import mainLogo from "@/assets/main/logo-white.png";
import { formatCurrency } from "@/utils/orderCalculations.js";
import { getProductOptionsForUI } from "@/utils/migrateCustomOptions.js";
import { getProductPrice } from "./orderUtils.js";

export const ProductSelectionStep = ({
  search,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
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
      gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 360px" },
    }}
  >
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
        sx={{ mb: 1.5 }}
      />

      <Box sx={{ display: "flex", gap: 1, overflowX: "auto", pb: 1.5 }}>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "contained" : "outlined"}
            onClick={() => onCategoryChange(category)}
            sx={{
              fontFamily: "fontFamily.secondary",
              flexShrink: 0,
              minHeight: 44,
              color:
                selectedCategory === category
                  ? "text.terciary"
                  : "text.primary",
            }}
          >
            {category}
          </Button>
        ))}
      </Box>

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
            xl: "repeat(4, minmax(0, 1fr))",
          },
          gap: { xs: 1.2, md: 2 },
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
              bgcolor: "background.paper",
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
                aspectRatio: "4 / 3",
                display: "block",
                objectFit: "cover",
                bgcolor: "background.default",
              }}
            />
            <Box sx={{ p: { xs: 1.1, sm: 1.5 } }}>
              <Typography
                sx={{
                  fontFamily: "fontFamily.secondary",
                  fontSize: { xs: "0.92rem", sm: "1rem" },
                  lineHeight: 1.2,
                  minHeight: { xs: 36, sm: 39 },
                  overflowWrap: "anywhere",
                }}
              >
                {product.name}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "fontFamily.primary",
                  color: "primary.main",
                  fontSize: { xs: "1rem", sm: "1.2rem" },
                  mt: 1,
                }}
              >
                {formatCurrency(getProductPrice(product))}
              </Typography>
              {getProductOptionsForUI(product).length > 0 && (
                <Chip
                  size="small"
                  label="Personalizable"
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    mt: 1,
                    maxWidth: "100%",
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
        <Button
          fullWidth
          size="large"
          variant="contained"
          disabled={!cartItems.length}
          onClick={onContinue}
          sx={{
            fontFamily: "fontFamily.primary",
            minHeight: 56,
            color: "text.terciary",
            fontSize: "1rem",
          }}
        >
          Continuar
        </Button>
      </Box>
    </Paper>
  </Box>
);
