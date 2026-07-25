import { Box, Chip, Paper, Typography } from "@mui/material";

// ---- Shared ----
import { OptionItemButton } from "./OptionItemButton.jsx";
// ----------------

// ---- UTILS ----
import {
  getOptionKey,
  isSelectionLimitEnabled,
} from "@/utils/migrateCustomOptions.js";
// ---------------

export const ProductOptionSection = ({
  option,
  customizations,
  handleCustomizationChange,
}) => {
  const optionKey = getOptionKey(option);

  const selectedMap = customizations[optionKey] || {};

  const sortedItems = [...(option.items || [])]
    .filter((item) => item.status !== false)
    .sort((a, b) => {
      const priorityA = Number(a.priority ?? 999);

      const priorityB = Number(b.priority ?? 999);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      return String(a.name || "").localeCompare(String(b.name || ""));
    });

  const isRequired =
    option.required ||
    Number(option.minSelected || 0) > 0 ||
    option.type === "unique";

  const isLimitEnabled = isSelectionLimitEnabled(option);

  const maxSelected = Number(option.maxSelected || 0);

  const currentOptionTotal = Object.values(selectedMap).reduce(
    (sum, value) => sum + Number(value || 0),
    0,
  );

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.3, sm: 1.6 },
        borderRadius: 2,
        bgcolor: "background.main",
        border: "1px solid",
        borderColor: "rgba(184, 182, 186, 0.20)",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
          pb: 1,
          mb: 1.2,
          borderBottom: "2px solid",
          borderColor: "primary.main",
        }}
      >
        <Typography
          sx={{
            fontFamily: "fontFamily.primary",
            color: "text.primary",
            fontSize: {
              xs: 13,
              sm: 15,
            },
          }}
        >
          {(option.name || "").toUpperCase()}
        </Typography>

        {isRequired && (
          <Chip
            size="small"
            color="primary"
            variant="outlined"
            label={
              Number(option.minSelected) > 0
                ? `Mín. ${option.minSelected}`
                : "Requerido"
            }
            sx={{
              fontFamily: "fontFamily.secondary",
              height: 24,
            }}
          />
        )}

        {isLimitEnabled && maxSelected > 0 && option.type !== "unique" && (
          <Chip
            size="small"
            variant="outlined"
            label={`Máx. ${maxSelected}`}
            sx={{
              fontFamily: "fontFamily.secondary",
              height: 24,
            }}
          />
        )}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns:
            option.type === "extra"
              ? {
                  xs: "repeat(2, minmax(0, 1fr))",
                  sm: "repeat(3, minmax(0, 1fr))",
                  lg: "repeat(4, minmax(0, 1fr))",
                }
              : {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  xl: "repeat(3, minmax(0, 1fr))",
                },
          gap: 1,
        }}
      >
        {sortedItems.map((item) => {
          const itemKey = item.id || item.name;

          const quantity = Number(selectedMap[itemKey] || 0);

          const selected = quantity > 0;

          const disableByMax =
            !selected &&
            isLimitEnabled &&
            maxSelected > 0 &&
            currentOptionTotal >= maxSelected;

          if (option.type === "unique") {
            return (
              <OptionItemButton
                key={itemKey}
                item={item}
                type={option.type}
                selected={selected}
                onSelect={() =>
                  handleCustomizationChange(optionKey, itemKey, true, option)
                }
              />
            );
          }

          if (option.type === "checkbox") {
            return (
              <OptionItemButton
                key={itemKey}
                item={item}
                type={option.type}
                selected={selected}
                disabled={disableByMax}
                onSelect={() =>
                  handleCustomizationChange(
                    optionKey,
                    itemKey,
                    !selected,
                    option,
                  )
                }
              />
            );
          }

          return (
            <OptionItemButton
              key={itemKey}
              item={item}
              type="extra"
              quantity={quantity}
              disabled={
                isLimitEnabled &&
                maxSelected > 0 &&
                currentOptionTotal >= maxSelected
              }
              onDecrease={() =>
                handleCustomizationChange(
                  optionKey,
                  itemKey,
                  quantity - 1,
                  option,
                )
              }
              onIncrease={() =>
                handleCustomizationChange(
                  optionKey,
                  itemKey,
                  quantity + 1,
                  option,
                )
              }
            />
          );
        })}
      </Box>
    </Paper>
  );
};
