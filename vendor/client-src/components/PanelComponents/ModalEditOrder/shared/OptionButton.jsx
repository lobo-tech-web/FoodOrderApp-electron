// ---- Material UI ----
import { Box, ButtonBase, Typography } from "@mui/material";
// Icons
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
// ---------------------

// ---- Helpers ----
const getOptionButtonStyle = (selected, customColor = "#f5a623") => ({
  width: "100%",
  minHeight: { xs: 58, sm: 64 },
  p: { xs: 1, sm: 1.1 },
  borderRadius: 2,
  border: "1px solid",
  borderColor: selected ? customColor : "divider",
  bgcolor: selected ? `${customColor}18` : "action.hover",
  cursor: "pointer",
  position: "relative",
  overflow: "hidden",
  transition:
    "border-color 0.18s ease, background-color 0.18s ease, transform 0.18s ease",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: 0.7,
  WebkitTapHighlightColor: "transparent",
  touchAction: "manipulation",
  "&:hover": {
    borderColor: customColor,
    bgcolor: `${customColor}12`,
    transform: "translateY(-1px)",
  },
  "&:focus-visible": {
    outline: `3px solid ${customColor}45`,
    outlineOffset: 2,
  },

  "&.Mui-disabled": {
    opacity: 0.42,
    borderColor: "divider",
    bgcolor: "action.disabledBackground",
    transform: "none",
  },
});

const optionLabelStyle = (selected, customColor = "#f5a623") => ({
  fontFamily: "fontFamily.terciary",
  color: selected ? customColor : "text.primary",
  fontSize: { xs: "0.68rem", sm: "0.7rem", md: "0.72rem" },
  textAlign: "center",
  lineHeight: 1.15,
});
// -----------------

export const OptionButton = ({
  selected,
  icon,
  label,
  disabled = false,
  onClick,
  customColor = "#f5a623",
}) => {
  const handleClick = () => {
    if (disabled || selected) {
      return;
    }
    onClick?.();
  };

  return (
    <ButtonBase
      aria-pressed={selected}
      aria-label={label}
      type="button"
      disabled={disabled}
      onClick={handleClick}
      sx={getOptionButtonStyle(selected, customColor)}
    >
      <Box
        sx={{
          color: disabled
            ? "text.disabled"
            : selected
              ? customColor
              : "text.secondary",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          "& svg": {
            fontSize: { xs: 22, sm: 24 },
          },
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          ...optionLabelStyle(selected, customColor),
          ...(disabled && { color: "text.disabled" }),
        }}
      >
        {label}
      </Typography>

      {selected && (
        <CheckCircleIcon
          sx={{
            position: "absolute",
            top: 7,
            right: 7,
            fontSize: 14,
            color: disabled ? "text.disabled" : customColor,
          }}
        />
      )}
    </ButtonBase>
  );
};
