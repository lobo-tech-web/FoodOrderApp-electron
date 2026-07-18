// ---- Material UI ----
import { Box, IconButton, Paper, Tooltip, Typography } from "@mui/material";
// Icons
import {
  Add as AddIcon,
  DeleteOutline as DeleteIcon,
  EditOutlined as EditIcon,
  Remove as RemoveIcon,
  StickyNote2 as StickyNote2Icon,
} from "@mui/icons-material";
// --------------------

export const CartItem = ({
  item,
  index,
  onEditProduct,
  onQuantityChange,
  onRemoveProduct,
  formatCurrency,
}) => {
  const quantity = Number(item.quantity) || 1;
  const unitPrice = Number(item.price) || 0;
  const total = unitPrice * quantity;

  const hasCustomOptions =
    Array.isArray(item.customOptions) && item.customOptions.length > 0;

  const hasProductComment = item?.productComment.trim() !== "";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.2,
        border: "1px solid",
        borderColor: "rgba(184, 182, 186, 0.18)",
        borderRadius: 2,
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 1,
          alignItems: "start",
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.7,
              minWidth: 0,
            }}
          >
            <Typography
              sx={{
                fontFamily: "fontFamily.primary",
                color: "text.primary",
                fontSize: { xs: 13, sm: 14 },
                lineHeight: 1.15,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {`${quantity || 0}x`}
            </Typography>

            <Typography
              sx={{
                fontFamily: "fontFamily.primary",
                color: "primary.main",
                fontSize: { xs: 13, sm: 14 },
                lineHeight: 1.15,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {(item.name || "").toUpperCase()}
            </Typography>
          </Box>

          {hasCustomOptions && (
            <Typography
              sx={{
                fontFamily: "fontFamily.secondary",
                color: "text.primary",
                fontSize: 11,
                lineHeight: 1.25,
                mt: 0.7,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {item.customOptions
                .map((option) => {
                  const quantity = Number(option.quantity) || 1;

                  return quantity > 1
                    ? `${option.name} x${quantity}`
                    : option.name;
                })
                .join(" · ")}
            </Typography>
          )}

          {hasProductComment && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <StickyNote2Icon sx={{ fontSize: 14, color: "text.primary" }} />
              <Typography
                sx={{
                  fontFamily: "fontFamily.secondary",
                  color: "primary.main",
                  fontSize: 11,
                  lineHeight: 1.25,
                  mt: 0.7,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.productComment.toUpperCase()}
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.7,
              mt: 0.8,
            }}
          >
            <Typography
              sx={{
                fontFamily: "fontFamily.secondary",
                color: "text.secondary",
                fontSize: 11,
              }}
            >
              {formatCurrency(unitPrice)} c/u
            </Typography>

            <Typography
              sx={{
                color: "text.secondary",
                fontSize: 10,
              }}
            >
              •
            </Typography>

            <Typography
              sx={{
                fontFamily: "fontFamily.secondary",
                color: "text.primary",
                fontSize: 13,
              }}
            >
              {formatCurrency(total)}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 0.2,
          }}
        >
          <Tooltip
            title={
              hasCustomOptions || item.allowComment
                ? "Modificar producto"
                : "Este producto no se puede modificar"
            }
          >
            <span>
              <IconButton
                size="small"
                color="primary"
                onClick={() => onEditProduct(item, index)}
                disabled={!hasCustomOptions && !item.allowComment}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Eliminar producto">
            <IconButton
              size="small"
              color="error"
              onClick={() => onRemoveProduct(index)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box
        sx={{
          mt: 1,
          pt: 1,
          borderTop: "1px solid",
          borderColor: "rgba(184, 182, 186, 0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Typography
          sx={{
            fontFamily: "fontFamily.secondary",
            color: "text.primary",
            fontSize: 13,
          }}
        >
          Cantidad
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            border: "1px solid",
            borderColor: "rgba(184, 182, 186, 0.22)",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <IconButton
            size="small"
            onClick={() => onQuantityChange(index, quantity - 1)}
            disabled={quantity <= 1}
            sx={{
              width: 30,
              height: 30,
              color: "text.primary",
            }}
          >
            <RemoveIcon sx={{ fontSize: 16 }} />
          </IconButton>

          <Typography
            sx={{
              minWidth: 28,
              textAlign: "center",
              fontFamily: "fontFamily.primary",
              color: "text.primary",
              fontSize: 12,
            }}
          >
            {quantity}
          </Typography>

          <IconButton
            size="small"
            onClick={() => onQuantityChange(index, quantity + 1)}
            sx={{
              width: 30,
              height: 30,
              color: "primary.main",
            }}
          >
            <AddIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};
