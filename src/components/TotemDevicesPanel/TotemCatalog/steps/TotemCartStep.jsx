// ---- Material UI ----
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
// Icons
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Stars as StarsIcon,
  DeleteOutline as DeleteOutlineIcon,
  DeleteSweep as DeleteSweepIcon,
  Remove as RemoveIcon,
  ShoppingBagOutlined as ShoppingBagOutlinedIcon,
  RestaurantOutlined as RestaurantOutlinedIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
// ----------------------

// ---- Utils ----
import { cartTotals, money } from "../totemCart.js";
// ---------------

// Tamaño de la imagen en píxeles: móvil (xs) y pantallas mayores (sm).
const CART_PRODUCT_IMAGE_SIZE = { xs: 88, sm: 112 };

export const TotemCartStep = ({
  cart,
  onQuantity,
  onContinue,
  onClear,
  disabled,
  onBack,
}) => {
  const totals = cartTotals(cart);

  return (
    <Box
      component="section"
      sx={{
        minWidth: 0,
        p: 2,
        bgcolor: "background.paper",
        width: "100%",
        maxWidth: 800,
        m: "auto",
        borderRadius: 2,
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "44px minmax(0, 1fr) 44px",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "text.secondary",
          mb: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            alignContent: "center",
            gap: 1,
            gridColumn: 2,
          }}
        >
          <ShoppingBagOutlinedIcon />

          <Typography
            component="h1"
            variant="h6"
            sx={{ fontFamily: "fontFamily.secondary" }}
          >
            Mi pedido
          </Typography>
        </Box>

        <Tooltip title="Vaciar carrito">
          <Box sx={{ gridColumn: 3 }}>
            <IconButton
              aria-label="Vaciar carrito"
              disabled={!cart.length}
              onClick={onClear}
              sx={{ width: 44, height: 44 }}
            >
              <DeleteSweepIcon />
            </IconButton>
          </Box>
        </Tooltip>
      </Box>

      <Stack spacing={2}>
        {cart.map((line) => (
          <Box key={line.key}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: Object.fromEntries(
                  Object.entries(CART_PRODUCT_IMAGE_SIZE).map(
                    ([breakpoint, size]) => [
                      breakpoint,
                      `${size}px minmax(0, 1fr) max-content`,
                    ],
                  ),
                ),
                columnGap: { xs: 1, sm: 2 },
                rowGap: 1,
                alignItems: "start",
              }}
            >
              <Box
                sx={{
                  gridColumn: 1,
                  gridRow: line.comment ? "1 / span 2" : 1,
                  alignSelf: "center",
                  width: CART_PRODUCT_IMAGE_SIZE,
                  height: CART_PRODUCT_IMAGE_SIZE,
                  borderRadius: 2,
                  overflow: "hidden",
                  bgcolor: "background.default",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {line.product.image ? (
                  <Box
                    component="img"
                    src={line.product.image}
                    alt={line.product.name}
                    loading="lazy"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <RestaurantOutlinedIcon
                    sx={{ fontSize: 40, color: "text.secondary" }}
                  />
                )}
              </Box>

              <Stack
                spacing={0.5}
                sx={{ gridColumn: 2, gridRow: 1, minWidth: 0 }}
              >
                <Typography
                  sx={{
                    fontFamily: "fontFamily.primary",
                    fontSize: { xs: "1rem", sm: "1.2rem" },
                    color: "primary.main",
                    overflowWrap: "anywhere",
                    textTransform: "uppercase",
                  }}
                >
                  {line.product.name}
                </Typography>

                {line.selections.map((selected) => {
                  const item = line.product.customOptions
                    .find((option) => option.id === selected.optionId)
                    ?.items.find((entry) => entry.id === selected.itemId);
                  if (!item) return null;
                  return (
                    <Typography
                      key={`${selected.optionId}:${selected.itemId}`}
                      sx={{
                        fontFamily: "fontFamily.secondary",
                        fontSize: "0.9rem",
                        color: "text.primary",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {selected.quantity > 0 ? `${selected.quantity} × ` : "- "}
                      {item.name}
                      {Number(item.extraCost) > 0 && (
                        <Box
                          component="span"
                          sx={{
                            fontFamily: "fontFamily.secondary",
                            color: "primary.main",
                          }}
                        >
                          {` (+ ${money(item.extraCost)} ${selected.quantity > 1 ? " c/u" : ""})`}
                        </Box>
                      )}
                    </Typography>
                  );
                })}
              </Stack>

              <Stack
                spacing={0.5}
                alignItems="center"
                sx={{
                  gridColumn: 3,
                  gridRow: 1,
                  justifySelf: "end",
                  maxWidth: { xs: 132, sm: 180 },
                }}
              >
                {Number(line.unitPrice * line.quantity) > 0 && (
                  <Typography
                    sx={{
                      fontFamily: "fontFamily.primary",
                      fontSize: "1.2rem",
                      textAlign: "center",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {money(line.unitPrice * line.quantity)}
                  </Typography>
                )}

                {line.product.redeemPoints > 0 && (
                  <Chip
                    icon={<StarsIcon />}
                    color="primary"
                    label={`Canje: ${line.product.redeemPoints * line.quantity} puntos`}
                    sx={{
                      maxWidth: "100%",
                      height: "auto",
                      minHeight: 32,
                      fontSize: "0.85rem",
                      "& .MuiChip-label": { whiteSpace: "normal", py: 0.5 },
                    }}
                  />
                )}

                <Stack direction="row" alignItems="center">
                  <IconButton
                    aria-label="Quitar unidad"
                    onClick={() => onQuantity(line.key, line.quantity - 1)}
                    sx={{ width: 44, height: 44 }}
                  >
                    {line.quantity === 1 ? (
                      <DeleteOutlineIcon />
                    ) : (
                      <RemoveIcon />
                    )}
                  </IconButton>

                  <Typography sx={{ width: 28, textAlign: "center" }}>
                    {line.quantity}
                  </Typography>

                  <IconButton
                    aria-label="Agregar unidad"
                    disabled={line.quantity >= 99}
                    onClick={() => onQuantity(line.key, line.quantity + 1)}
                    sx={{ width: 44, height: 44 }}
                  >
                    <AddIcon />
                  </IconButton>
                </Stack>
              </Stack>

              {line.comment && (
                <Box sx={{ gridColumn: "2 / -1", gridRow: 2, minWidth: 0 }}>
                  <Divider sx={{ bgcolor: "divider", mb: 1 }} />

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      bgcolor: "background.default",
                      borderRadius: 1,
                      p: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "fontFamily.secondary" }}
                    >
                      Comentario:
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "fontFamily.secondary",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {line.comment}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            <Divider sx={{ bgcolor: "primary.main", mt: 1 }} />
          </Box>
        ))}
      </Stack>

      {!cart.length && (
        <Typography color="text.secondary">Tu carrito está vacío</Typography>
      )}

      <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
        <Stack direction="column" spacing={0.5} alignItems="center">
          <Typography
            sx={{ fontFamily: "fontFamily.primary", fontSize: "1.6rem" }}
          >
            TOTAL
          </Typography>

          {totals.points > 0 && (
            <Typography
              sx={{
                fontFamily: "fontFamily.primary",
                color: "primary.main",
                fontSize: "1rem",
              }}
            >
              PUNTOS A CANJEAR
            </Typography>
          )}
        </Stack>

        <Stack direction="column" spacing={0.5} alignItems="center">
          <Typography
            sx={{ fontFamily: "fontFamily.primary", fontSize: "1.4rem" }}
          >
            {money(totals.amount / 100)}
          </Typography>

          {totals.points > 0 && (
            <Chip
              icon={<StarsIcon />}
              color="primary"
              label={`${totals.points} puntos`}
              sx={{
                maxWidth: "100%",
                height: "auto",
                minHeight: 28,
                fontSize: "0.85rem",
                "& .MuiChip-label": { whiteSpace: "normal", py: 0.5 },
              }}
            />
          )}
        </Stack>
      </Stack>

      <Button
        fullWidth
        size="large"
        variant="contained"
        endIcon={<CheckCircleIcon />}
        disabled={disabled || !cart.length}
        onClick={onContinue}
        sx={{ mt: 2, minHeight: 56 }}
      >
        Confirmar mi pedido
      </Button>

      <Button
        fullWidth
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={onBack}
        sx={{ mt: 1.5, minHeight: 52 }}
      >
        Seguir eligiendo
      </Button>
    </Box>
  );
};
