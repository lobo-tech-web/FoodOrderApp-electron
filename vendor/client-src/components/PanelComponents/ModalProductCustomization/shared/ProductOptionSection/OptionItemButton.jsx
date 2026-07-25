import { Box, Button, IconButton, Paper, Typography } from "@mui/material";
// Icons
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Remove as RemoveIcon,
} from "@mui/icons-material";

// ---- Utils ----
import { formatCurrency } from "@/utils/orderCalculations.js";
// ---------------

export const OptionItemButton = ({
  item,
  selected,
  quantity = 0,
  type,
  disabled,
  onSelect,
  onDecrease,
  onIncrease,
}) => {
  const hasExtraCost = Number(item.extraCost) > 0;

  if (type === "extra") {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 1.3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: quantity > 0 ? "primary.main" : "text.primary",
          bgcolor: quantity > 0 ? "primary.main" : "background.main",
          minHeight: 100,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "all 0.2s ease",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "fontFamily.primary",
              color: quantity > 0 ? "text.terciary" : "text.primary",
              fontSize: { xs: 12, sm: 13 },
              lineHeight: 1.15,
              textAlign: "center",
            }}
          >
            {(item.name || "").toUpperCase()}
          </Typography>

          {hasExtraCost && (
            <Typography
              sx={{
                fontFamily: "fontFamily.primary",
                color: quantity > 0 ? "text.terciary" : "text.primary",
                fontSize: 12,
                mt: 0.5,
                textAlign: "center",
              }}
            >
              +{formatCurrency(item.extraCost)}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            mt: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.8,
          }}
        >
          <IconButton
            size="small"
            onClick={onDecrease}
            disabled={quantity <= 0}
            sx={{
              width: 34,
              height: 34,
              color: quantity > 0 ? "text.terciary" : "inherit",
              border: "1px solid",
              borderColor: "inherit",
            }}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>

          <Typography
            sx={{
              minWidth: 28,
              textAlign: "center",
              fontFamily: "fontFamily.primary",
              color: quantity > 0 ? "text.terciary" : "text.primary",
              fontSize: 16,
            }}
          >
            {quantity}
          </Typography>

          <IconButton
            size="small"
            onClick={onIncrease}
            disabled={disabled}
            sx={{
              width: 34,
              height: 34,
              color: disabled
                ? "action.disabled"
                : quantity > 0
                  ? "text.terciary"
                  : "inherit",
              border: "1px solid",
              borderColor: "inherit",
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
      </Paper>
    );
  }

  return (
    <Button
      fullWidth
      disabled={disabled}
      onClick={onSelect}
      variant={selected ? "contained" : "outlined"}
      color="primary"
      sx={{
        minHeight: 54,
        height: "100%",
        borderRadius: 2,
        px: 1.2,
        py: 1,
        justifyContent: "flex-start",
        textAlign: "left",
        color: selected ? "text.terciary" : "text.primary",
        fontFamily: "fontFamily.secondary",
        borderColor: selected ? "primary.main" : "text.primary",
        position: "relative",
        "&:active": {
          transform: "scale(0.98)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          width: "100%",
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: "fontFamily.primary",
              color: "inherit",
              fontSize: { xs: 11, sm: 12, md: 13 },
              lineHeight: 1.2,
            }}
          >
            {(item.name || "").toUpperCase()}
          </Typography>

          {hasExtraCost && (
            <Typography
              sx={{
                fontFamily: "fontFamily.primary",
                color: selected ? "inherit" : "primary.main",
                fontSize: 11,
                mt: 0.3,
              }}
            >
              +{formatCurrency(item.extraCost)}
            </Typography>
          )}
        </Box>

        {selected && (
          <CheckCircleIcon
            sx={{
              fontSize: 20,
              flexShrink: 0,
            }}
          />
        )}
      </Box>
    </Button>
  );
};
