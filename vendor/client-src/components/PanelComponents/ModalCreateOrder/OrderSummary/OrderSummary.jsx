// ---- Material UI ----
import {
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
// Icons
import {
  Add as AddIcon,
  AddShoppingCart as AddShoppingCartIcon,
  BarChart as BarChartIcon,
  ShoppingCartOutlined as ShoppingCartIcon,
  Star as StarIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Utils ----
import { cleanMoneyValue, formatCurrency } from "@/utils/orderCalculations.js";
// ---------------

// ---- Shared ----
import { CartItem } from "./shared/CartItem.jsx";
import { SummaryRow } from "./shared/SummaryRow.jsx";
// ----------------

export const OrderSummary = ({
  order,
  calculatedProductTotals,
  calculatedDiscount,
  finalOrderTotal,
  onAddProduct,
  onEditProduct,
  onQuantityChange,
  onRemoveProduct,
}) => {
  const discountLabel =
    calculatedDiscount.discountPercentage > 0
      ? "Descuento (" + calculatedDiscount.discountPercentage + "%)"
      : "Descuento";
  const discountValue =
    calculatedDiscount.discountamount > 0
      ? "-" + formatCurrency(calculatedDiscount.discountamount)
      : formatCurrency(0);

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "rgba(184, 182, 186, 0.22)",
        borderRadius: 2,
        overflow: "hidden",
        position: { lg: "sticky" },
        top: 0,
        boxShadow: {
          xs: "none",
          lg: "0 18px 50px rgba(0, 0, 0, 0.20)",
        },
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          px: { xs: 1.5, sm: 2 },
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          bgcolor: "background.main",
          borderBottom: "1px solid",
          borderColor: "rgba(184, 182, 186, 0.18)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <ShoppingCartIcon
            sx={{
              color: "primary.main",
              fontSize: 23,
            }}
          />

          <Box>
            <Typography
              sx={{
                fontFamily: "fontFamily.primary",
                color: "text.primary",
                fontSize: { xs: 15, sm: 17 },
                lineHeight: 1.1,
              }}
            >
              PRODUCTOS DEL PEDIDO
            </Typography>

            <Typography
              sx={{
                fontFamily: "fontFamily.secondary",
                color: "text.secondary",
                fontSize: 11,
                mt: 0.2,
              }}
            >
              {order.cartItems.length}{" "}
              {order.cartItems.length === 1 ? "producto" : "productos"}
            </Typography>
          </Box>
        </Box>

        <Tooltip title="Agregar producto">
          <IconButton
            color="primary"
            onClick={onAddProduct}
            sx={{
              display: "flex",
              gap: 1,
              border: "1px solid",
              borderColor: "primary.main",
              borderRadius: 2,
            }}
          >
            <Typography
              sx={{
                fontFamily: "fontFamily.secondary",
                fontSize: "0.8rem",
                color: "text.primary",
              }}
            >
              Agregar
            </Typography>
            <AddShoppingCartIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* PRODUCTOS */}
      <Box
        sx={{
          bgcolor: "background.paper",
          p: { xs: 1.2, sm: 1.5 },
        }}
      >
        {order.cartItems.length === 0 ? (
          <Box
            sx={{
              minHeight: 150,
              display: "grid",
              placeItems: "center",
              textAlign: "center",
              border: "1px dashed",
              borderColor: "rgba(184, 182, 186, 0.28)",
              borderRadius: 2,
              px: 2,
            }}
          >
            <Box>
              <ShoppingCartIcon
                sx={{
                  color: "text.secondary",
                  fontSize: 42,
                  mb: 1,
                }}
              />

              <Typography
                sx={{
                  fontFamily: "fontFamily.primary",
                  color: "text.primary",
                  fontSize: 13,
                }}
              >
                NO HAY PRODUCTOS
              </Typography>

              <Typography
                sx={{
                  fontFamily: "fontFamily.secondary",
                  color: "text.secondary",
                  fontSize: 12,
                  mt: 0.3,
                }}
              >
                Agregá al menos un producto para continuar.
              </Typography>
              <Button
                size="small"
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onAddProduct}
                sx={{
                  mt: 1.5,
                  fontFamily: "fontFamily.primary",
                  color: "text.terciary",
                }}
              >
                AGREGAR PRODUCTO
              </Button>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              maxHeight: {
                xs: "none",
                lg: 300,
              },
              overflowY: {
                xs: "visible",
                lg: "auto",
              },
              pr: {
                xs: 0,
                lg: 0.5,
              },
              "&::-webkit-scrollbar": {
                width: 5,
              },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "rgba(184, 182, 186, 0.25)",
                borderRadius: 999,
              },
            }}
          >
            {order.cartItems.map((item, index) => (
              <CartItem
                key={`${item.productId || item.id}-${index}`}
                item={item}
                index={index}
                onEditProduct={onEditProduct}
                onQuantityChange={onQuantityChange}
                onRemoveProduct={onRemoveProduct}
                formatCurrency={formatCurrency}
              />
            ))}
          </Box>
        )}
      </Box>

      <Divider
        sx={{
          borderColor: "rgba(184, 182, 186, 0.18)",
        }}
      />

      {/* RESUMEN DE PRECIOS */}
      <Box
        sx={{
          px: { xs: 1.5, sm: 2 },
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          bgcolor: "background.main",
          borderBottom: "1px solid",
          borderColor: "rgba(184, 182, 186, 0.18)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1,
            borderBottom: "1px solid",
            borderColor: "primary.main",
          }}
        >
          <BarChartIcon sx={{ color: "primary.main", fontSize: 23 }} />
          <Typography
            sx={{
              fontFamily: "fontFamily.primary",
              color: "text.primary",
              fontSize: { xs: 15, sm: 17 },
              mb: 0.5,
            }}
          >
            RESUMEN DEL PEDIDO
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          bgcolor: "background.paper",
        }}
      >
        <SummaryRow
          label="Subtotal productos"
          value={formatCurrency(calculatedProductTotals.subtotalProducts)}
        />

        {calculatedDiscount.discountamount > 0 && (
          <SummaryRow
            label={discountLabel}
            value={discountValue}
            negative={calculatedDiscount.discountamount > 0}
          />
        )}

        {order.servicetax > 0 && (
          <SummaryRow
            label="Tarifa de servicios"
            value={formatCurrency(order.servicetax)}
          />
        )}

        {order.deliverycost > 0 && (
          <SummaryRow
            label="Delivery"
            value={formatCurrency(
              cleanMoneyValue(order.deliverycost).toNumber(),
            )}
          />
        )}

        <Divider
          sx={{
            my: 1.5,
            borderColor: "text.primary",
          }}
        />

        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Typography
            sx={{
              fontFamily: "fontFamily.primary",
              color: "text.primary",
              fontSize: { xs: 22, md: 26 },
            }}
          >
            TOTAL
          </Typography>

          <Typography
            sx={{
              fontFamily: "fontFamily.terciary",
              color: "primary.main",
              fontSize: { xs: 22, md: 26 },
            }}
          >
            {formatCurrency(finalOrderTotal)}
          </Typography>
        </Box>
        {(calculatedProductTotals.totalRewardPoints > 0 ||
          calculatedProductTotals.totalRedeemPoints > 0) && (
          <>
            <Divider
              sx={{
                my: 1.5,
                borderColor: "rgba(184, 182, 186, 0.18)",
              }}
            />

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0.7,
              }}
            >
              {calculatedProductTotals.totalRewardPoints > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                  }}
                >
                  <Typography
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      fontFamily: "fontFamily.secondary",
                      color: "text.secondary",
                      fontSize: 11,
                    }}
                  >
                    <StarIcon sx={{ fontSize: 15 }} />
                    Puntos acumulables
                  </Typography>

                  <Typography
                    sx={{
                      fontFamily: "fontFamily.primary",
                      color: "success.main",
                      fontSize: 12,
                    }}
                  >
                    +{calculatedProductTotals.totalRewardPoints} pts
                  </Typography>
                </Box>
              )}

              {calculatedProductTotals.totalRedeemPoints > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                  }}
                >
                  <Typography
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      fontFamily: "fontFamily.secondary",
                      color: "text.secondary",
                      fontSize: 11,
                    }}
                  >
                    <StarIcon sx={{ fontSize: 15 }} />
                    Puntos canjeados
                  </Typography>

                  <Typography
                    sx={{
                      fontFamily: "fontFamily.primary",
                      color: "error.main",
                      fontSize: 12,
                    }}
                  >
                    -{calculatedProductTotals.totalRedeemPoints} pts
                  </Typography>
                </Box>
              )}
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
};
