// ---- Material UI ----
import { Box, IconButton, Paper, Tooltip, Typography } from "@mui/material";
// Icons
import {
  Restaurant as RestaurantIcon,
  Add as AddIcon,
  DeleteOutline as DeleteIcon,
  EditOutlined as EditIcon,
  Remove as RemoveIcon,
  StickyNote2 as StickyNote2Icon,
} from "@mui/icons-material";
// ---------------------

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
  const hasProductComment =
    item.productComment && item.productComment.trim() !== "";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1,
        border: "1px solid",
        borderColor: "primary.main",
        borderRadius: 2,
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
        gap: 0.75,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <RestaurantIcon color="primary" fontSize="small" />

          <Typography
            sx={{
              minWidth: 0,
              fontFamily: "fontFamily.primary",
              color: "text.primary",
              fontSize: 16,
              lineHeight: 1.2,
              overflowWrap: "anywhere",
            }}
          >
            {(item.name || "").toUpperCase()}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <Tooltip title="Modificar producto">
            <IconButton
              size="small"
              color="primary"
              onClick={() => onEditProduct(item, index)}
              aria-label={`Editar ${item.name}`}
              disabled={!onEditProduct}
            >
              <EditIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Eliminar producto">
            <IconButton
              size="small"
              color="error"
              aria-label={`Eliminar ${item.name}`}
              onClick={() => onRemoveProduct(index)}
            >
              <DeleteIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {hasCustomOptions && (
        <Box
          component="ul"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.4,
            listStyle: "none",
            m: 0,
            pl: 2,
          }}
        >
          {item.customOptions.map((option, optionIndex) => {
            const optionQuantity = Number(option.quantity) || 1;
            return (
              <Typography
                component="li"
                key={`${option.id || option.name}-${optionIndex}`}
                sx={{
                  fontFamily: "fontFamily.secondary",
                  color: "text.primary",
                  fontSize: 12,
                  lineHeight: 1.4,
                  overflowWrap: "anywhere",
                }}
              >
                - {option.name}
                {optionQuantity > 1 ? ` x${optionQuantity}` : ""}
              </Typography>
            );
          })}
        </Box>
      )}

      {hasProductComment && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <StickyNote2Icon sx={{ fontSize: 16, color: "text.primary" }} />

          <Typography
            sx={{
              fontFamily: "fontFamily.secondary",
              color: "primary.main",
              fontSize: 12,
              lineHeight: 1.25,
              mt: 0.7,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            {item.productComment}
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography
          sx={{
            fontFamily: "fontFamily.secondary",
            color: "primary.main",
            fontSize: 11,
            ml: 1,
          }}
        >
          {formatCurrency(unitPrice)} c/u
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            border: "1px solid",
            borderColor: "primary.main",
            borderRadius: 2,
          }}
        >
          <IconButton
            size="small"
            aria-label="Restar uno"
            onClick={() => onQuantityChange(index, quantity - 1)}
            disabled={quantity <= 1}
            sx={{ width: 26, height: 26, color: "text.primary" }}
          >
            <RemoveIcon sx={{ fontSize: 18 }} />
          </IconButton>

          <Typography
            sx={{
              minWidth: 20,
              textAlign: "center",
              fontFamily: "fontFamily.primary",
              fontSize: 14,
            }}
          >
            {quantity}
          </Typography>

          <IconButton
            size="small"
            aria-label="Sumar uno"
            onClick={() => onQuantityChange(index, quantity + 1)}
            sx={{ width: 26, height: 26, color: "primary.main" }}
          >
            <AddIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <Typography
          sx={{
            fontFamily: "fontFamily.secondary",
            color: "text.primary",
            fontSize: 13,
            whiteSpace: "nowrap",
          }}
        >
          {formatCurrency(total)}
        </Typography>
      </Box>
    </Paper>
  );
};
