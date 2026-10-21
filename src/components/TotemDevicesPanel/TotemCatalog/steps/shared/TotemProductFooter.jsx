// ---- Material UI ----
import { Box, Button, DialogActions, Typography } from "@mui/material";
// Icons
import {
  ArrowBack as ArrowBackIcon,
  ShoppingCart as ShoppingCartIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Shared ----
import { TOTEM_PRODUCT_SIZES } from "./totemProductSizes.js";
// ----------------

// ---- Utils ----
import { money } from "../../totemCart.js";
// ---------------

export const TotemProductFooter = ({
  price,
  redeemPoints = 0,
  onClose,
  onAdd,
}) => {
  return (
    <DialogActions
      sx={{
        p: 1.5,
        bgcolor: "background.main",
        borderTop: "1px solid",
        borderColor: "divider",
        display: "block",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr 1fr",
            sm: "minmax(0, 1fr) auto auto",
          },
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box
          sx={{
            textAlign: { xs: "center", sm: "left" },
            gridColumn: { xs: "1 / -1", sm: "auto" },
          }}
        >
          <Typography
            sx={{
              fontFamily: "fontFamily.secondary",
              color: "text.primary",
              fontSize: "0.78rem",
            }}
          >
            TOTAL DEL PRODUCTO
          </Typography>

          <Typography
            sx={{
              fontFamily: "fontFamily.primary",
              color: "primary.main",
              fontSize: TOTEM_PRODUCT_SIZES.priceFontSize,
              lineHeight: 1.2,
            }}
          >
            {money(price)}
          </Typography>

          {Number(redeemPoints) > 0 && (
            <Typography
              sx={{
                fontFamily: "fontFamily.secondary",
                color: "primary.main",
                fontSize: "0.75rem",
              }}
            >
              + {redeemPoints} puntos
            </Typography>
          )}
        </Box>

        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
          startIcon={<ArrowBackIcon />}
          sx={{
            minHeight: TOTEM_PRODUCT_SIZES.footerButtonHeight,
            minWidth: { sm: 100 },
            borderRadius: 2.5,
            fontFamily: "fontFamily.primary",
            fontWeight: 800,
          }}
        >
          Volver
        </Button>

        <Button
          onClick={onAdd}
          variant="contained"
          color="primary"
          startIcon={<ShoppingCartIcon />}
          sx={{
            minHeight: TOTEM_PRODUCT_SIZES.footerButtonHeight,
            minWidth: { sm: 180 },
            px: 2,
            borderRadius: 2.5,
            fontFamily: "fontFamily.primary",
            fontWeight: 900,
            fontSize: TOTEM_PRODUCT_SIZES.itemFontSize,
            boxShadow: "0 6px 18px rgba(0,0,0,0.16)",
          }}
        >
          Agregar al pedido
        </Button>
      </Box>
    </DialogActions>
  );
};
