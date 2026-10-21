// ---- Material UI ----
import {
  Box,
  ButtonBase,
  Chip,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
// Icons
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  RadioButtonUnchecked as UncheckedIcon,
  RestaurantMenu as RestaurantMenuIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Shared ----
import { TOTEM_PRODUCT_SIZES } from "./totemProductSizes.js";
// ----------------

// ---- Utils ----
import { money, optionLimits } from "../../totemCart.js";
// ---------------

export const TotemCustomOption = ({
  option,
  selections,
  onChange,
  hasError = false,
}) => {
  const limits = optionLimits(option);
  const required = limits.min > 0;
  const isExtra = option.type === "extra";
  const isUnique = option.type === "unique";

  const selectedCount = selections
    .filter((entry) => entry.optionId === option.id)
    .reduce((sum, entry) => sum + Number(entry.quantity || 0), 0);

  const completed = selectedCount >= limits.min;

  const items = Array.isArray(option.items)
    ? option.items.filter((item) => item.status !== false)
    : [];

  const limitText = isUnique
    ? "Elegí una opción"
    : limits.min === limits.max
      ? `Elegí ${limits.min} opciones`
      : `Elegí hasta ${limits.max} opciones`;

  return (
    <Paper
      elevation={0}
      sx={{
        p: TOTEM_PRODUCT_SIZES.optionPadding,
        borderRadius: 2,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: hasError ? "error.main" : "divider",
      }}
    >
      {/* ENCABEZADO */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={1}
        sx={{ mb: 1 }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              bgcolor: "action.hover",
              display: "grid",
              placeItems: "center",
              color: hasError ? "error.main" : "primary.main",
              flexShrink: 0,
            }}
          >
            <RestaurantMenuIcon />
          </Box>

          <Box>
            <Typography
              sx={{
                fontFamily: "fontFamily.primary",
                color: "text.primary",
                fontSize: TOTEM_PRODUCT_SIZES.optionTitleFontSize,
              }}
            >
              {option.name}
            </Typography>

            <Typography
              sx={{
                fontFamily: "fontFamily.secondary",
                color: "text.secondary",
                fontSize: "0.82rem",
              }}
            >
              {limitText}
            </Typography>
          </Box>
        </Stack>

        <Chip
          size="small"
          label={required ? "OBLIGATORIO" : "OPCIONAL"}
          color={required ? "warning" : "default"}
          variant={required ? "filled" : "outlined"}
          sx={{ fontFamily: "fontFamily.terciary" }}
        />
      </Stack>

      {/* OPCIONES */}
      <Stack spacing={1}>
        {items.map((item) => {
          const selected = selections.find(
            (entry) => entry.optionId === option.id && entry.itemId === item.id,
          );

          const quantity = Number(selected?.quantity || 0);
          const isSelected = quantity > 0;
          const atLimit = selectedCount >= limits.max;
          const canIncrease = !atLimit && quantity < 99;

          return (
            <Paper
              key={item.id}
              elevation={0}
              sx={{
                borderRadius: 2.5,
                overflow: "hidden",
                bgcolor: isSelected ? "action.selected" : "background.default",
                border: "1.5px solid",
                borderColor: isSelected ? "primary.main" : "divider",
                transition: "background-color 150ms, border-color 150ms",
              }}
            >
              {isExtra ? (
                <Box
                  sx={{
                    p: TOTEM_PRODUCT_SIZES.itemPadding,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontFamily: "fontFamily.secondary",
                        fontWeight: 800,
                        color: "text.primary",
                        fontSize: TOTEM_PRODUCT_SIZES.itemFontSize,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {item.name}
                    </Typography>

                    <Typography
                      sx={{
                        fontFamily: "fontFamily.secondary",
                        color: "primary.main",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                      }}
                    >
                      {Number(item.extraCost || 0) > 0
                        ? `+ ${money(item.extraCost)}`
                        : "Sin costo adicional"}
                    </Typography>
                  </Box>

                  {/* CONTADOR TÁCTIL */}
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <IconButton
                      aria-label={`Quitar ${item.name}`}
                      onClick={() => onChange(option, item, -1)}
                      disabled={!isSelected}
                      sx={{
                        width: TOTEM_PRODUCT_SIZES.controlSize,
                        height: TOTEM_PRODUCT_SIZES.controlSize,
                        border: "1px solid",
                        borderColor: "divider",
                        color: "text.primary",
                      }}
                    >
                      <RemoveIcon />
                    </IconButton>

                    <Typography
                      sx={{
                        minWidth: 24,
                        textAlign: "center",
                        fontFamily: "fontFamily.primary",
                        fontSize: "1rem",
                        fontWeight: 800,
                        color: "text.primary",
                      }}
                    >
                      {quantity}
                    </Typography>

                    <IconButton
                      aria-label={`Agregar ${item.name}`}
                      onClick={() => onChange(option, item, 1)}
                      disabled={!canIncrease}
                      sx={{
                        width: TOTEM_PRODUCT_SIZES.controlSize,
                        height: TOTEM_PRODUCT_SIZES.controlSize,
                        bgcolor: canIncrease
                          ? "primary.main"
                          : "action.disabledBackground",
                        color: canIncrease
                          ? "primary.contrastText"
                          : "text.disabled",
                        "&:hover": {
                          bgcolor: "primary.dark",
                        },
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Stack>
                </Box>
              ) : (
                <ButtonBase
                  component="button"
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onChange(option, item)}
                  disabled={!isUnique && !isSelected && atLimit}
                  sx={{
                    width: "100%",
                    minHeight: TOTEM_PRODUCT_SIZES.optionMinHeight,
                    py: TOTEM_PRODUCT_SIZES.itemPadding,
                    px: 1.25,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    textAlign: "left",
                    opacity: !isUnique && !isSelected && atLimit ? 0.5 : 1,
                  }}
                >
                  {isSelected ? (
                    <CheckCircleIcon
                      sx={{
                        fontSize: 22,
                        color: "primary.main",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <UncheckedIcon
                      sx={{
                        fontSize: 22,
                        color: "text.secondary",
                        flexShrink: 0,
                      }}
                    />
                  )}

                  <Typography
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      fontFamily: "fontFamily.secondary",
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: TOTEM_PRODUCT_SIZES.itemFontSize,
                      color: "text.primary",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {item.name}
                  </Typography>

                  <Typography
                    sx={{
                      flexShrink: 0,
                      fontFamily: "fontFamily.primary",
                      color: "primary.main",
                      fontSize: TOTEM_PRODUCT_SIZES.itemFontSize,
                    }}
                  >
                    {Number(item.extraCost || 0) > 0
                      ? `+ ${money(item.extraCost)}`
                      : ""}
                  </Typography>
                </ButtonBase>
              )}
            </Paper>
          );
        })}
      </Stack>

      {required && (
        <Stack
          direction="row"
          spacing={0.8}
          justifyContent="center"
          alignItems="center"
          sx={{
            borderRadius: 8,
            mt: 1,
          }}
        >
          {completed ? (
            <CheckCircleIcon fontSize="small" color="success" />
          ) : (
            <CancelIcon fontSize="small" color="error" />
          )}

          <Typography
            sx={{
              fontFamily: "fontFamily.secondary",
              fontSize: "0.8rem",
            }}
          >
            {completed
              ? "Selección completa"
              : `Faltan ${limits.min - selectedCount} selecciones`}
          </Typography>
        </Stack>
      )}
    </Paper>
  );
};
