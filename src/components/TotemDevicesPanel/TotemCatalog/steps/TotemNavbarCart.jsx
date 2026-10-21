// ---- Material UI ----
import { Box, Button, Paper, Stack, Typography, Chip } from "@mui/material";
// Icons
import {
  ShoppingBagOutlined as ShoppingBagOutlinedIcon,
  ArrowForward as ArrowForwardIcon,
  Stars as StarIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Utils ----
import { cartTotals, money } from "../totemCart.js";
// ---------------

export const TotemNavbarCart = ({ cart, onViewCart, disabled }) => {
  const totals = cartTotals(cart);
  const quantity = cart.reduce((count, line) => count + line.quantity, 0);

  const viewButton = {
    variant: "contained",
    onClick: onViewCart,
    disabled: disabled || !cart.length,
    endIcon: <ArrowForwardIcon />,
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: "max(16px, env(safe-area-inset-bottom))",
        left: 0,
        right: 0,
        px: 2,
        zIndex: 1100,
      }}
    >
      <Paper
        component="nav"
        aria-label="Mi pedido"
        elevation={0}
        sx={{
          maxWidth: { xs: 960, md: 1200 },
          mx: "auto",
          p: { xs: 2, md: 2.5 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "primary.main",
          bgcolor: "background.main",
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ minWidth: 0 }}
          >
            <ShoppingBagOutlinedIcon
              sx={{ color: "primary.main", fontSize: 32 }}
            />
            <Box>
              <Typography
                sx={{ fontFamily: "fontFamily.primary", fontSize: "1rem" }}
              >
                MI PEDIDO
              </Typography>

              <Typography
                aria-live="polite"
                sx={{
                  fontFamily: "fontFamily.secondary",
                  fontSize: "0.8rem",
                  color: "text.secondary",
                }}
              >
                {quantity} {quantity === 1 ? "producto" : "productos"}
              </Typography>
            </Box>
          </Stack>

          <Stack alignItems="center" spacing={0.5}>
            <Typography
              sx={{
                fontFamily: "fontFamily.primary",
                fontSize: { xs: "1rem", md: "1.2rem" },
              }}
            >
              {money(totals.amount / 100)}
            </Typography>

            {totals?.points > 0 && (
              <Chip
                variant="filled"
                color="primary"
                icon={<StarIcon />}
                label={`+ ${totals.points} puntos`}
              />
            )}
          </Stack>

          <Button
            {...viewButton}
            size="large"
            sx={{ display: { xs: "none", sm: "inline-flex" }, minHeight: 32 }}
          >
            Ver carrito
          </Button>
        </Stack>

        <Button
          {...viewButton}
          fullWidth
          sx={{ display: { xs: "flex", sm: "none" }, mt: 1.5, minHeight: 32 }}
        >
          Ver carrito
        </Button>
      </Paper>
    </Box>
  );
};
