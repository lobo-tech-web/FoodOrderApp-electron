// ---- Material UI ----
import { Box, Chip, Paper, Stack, TextField, Typography } from "@mui/material";
// Icons
import {
  RestaurantMenu as RestaurantMenuIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  Whatshot as WhatshotIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Shared ----
import { TOTEM_PRODUCT_SIZES } from "./totemProductSizes.js";
// ----------------

export const TotemProductInfo = ({
  product,
  compact = false,
  comment = "",
  onCommentChange,
}) => {
  const hasImage = Boolean(product?.image);
  const hasDescription = Boolean(product?.description?.trim());

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: compact ? 540 : "100%",
        mx: "auto",
        minWidth: 0,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          overflow: "hidden",
          borderRadius: 3,
          bgcolor: "background.main",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            height: TOTEM_PRODUCT_SIZES.imageHeight,
            bgcolor: "background.default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {hasImage ? (
            <Box
              component="img"
              src={product.image}
              alt={product.name}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <RestaurantMenuIcon
              sx={{
                fontSize: 64,
                color: "text.secondary",
                opacity: 0.35,
              }}
            />
          )}
        </Box>

        <Box sx={{ p: TOTEM_PRODUCT_SIZES.contentPadding }}>
          <Stack spacing={1}>
            {product.specialTitle && (
              <Chip
                icon={<WhatshotIcon />}
                label={product.specialTitle}
                size="small"
                color="primary"
                sx={{
                  fontFamily: "fontFamily.secondary",
                  alignSelf: "flex-start",
                }}
              />
            )}

            <Typography
              sx={{
                fontFamily: "fontFamily.primary",
                color: "text.primary",
                fontSize: TOTEM_PRODUCT_SIZES.productTitleFontSize,
                lineHeight: 1.2,
                overflowWrap: "anywhere",
              }}
            >
              {product.name}
            </Typography>

            {hasDescription && (
              <Typography
                sx={{
                  fontFamily: "fontFamily.secondary",
                  color: "text.secondary",
                  fontSize: TOTEM_PRODUCT_SIZES.bodyFontSize,
                  lineHeight: 1.45,
                  overflowWrap: "anywhere",
                }}
              >
                {product.description}
              </Typography>
            )}

            {product.allowComment === true && (
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 3,
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 1.5 }}
                >
                  <ChatBubbleOutlineIcon sx={{ color: "primary.main" }} />

                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontFamily: "fontFamily.primary",
                        color: "text.primary",
                        fontSize: "1rem",
                      }}
                    >
                      COMENTARIOS DEL PRODUCTO
                    </Typography>

                    <Typography
                      sx={{
                        fontFamily: "fontFamily.secondary",
                        color: "text.secondary",
                        fontSize: "0.78rem",
                      }}
                    >
                      Opcional
                    </Typography>
                  </Box>
                </Stack>

                <TextField
                  fullWidth
                  multiline
                  size="small"
                  minRows={TOTEM_PRODUCT_SIZES.commentMinRows}
                  maxRows={TOTEM_PRODUCT_SIZES.commentMaxRows}
                  placeholder="Comentario a tener en cuenta sobre este producto"
                  value={comment}
                  onChange={(event) => onCommentChange(event.target.value)}
                  inputProps={{
                    maxLength: 50,
                    "aria-label": "Comentarios del producto",
                  }}
                  helperText={`${comment.length}/50 caracteres · Opcional`}
                  sx={{
                    pt: 1,
                    "& .MuiInputBase-root": {
                      fontSize: TOTEM_PRODUCT_SIZES.bodyFontSize,
                      fontFamily: "fontFamily.secondary",
                    },
                  }}
                />
              </Paper>
            )}
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};
