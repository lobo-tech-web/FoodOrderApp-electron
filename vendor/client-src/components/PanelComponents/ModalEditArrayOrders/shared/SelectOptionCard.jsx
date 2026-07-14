import { ButtonBase, Paper, Box, Typography, Chip } from "@mui/material";

export const SelectOptionCard = ({
  selected,
  icon,
  title,
  description,
  onClick,
  color = "primary.main",
  disabled = false,
}) => {
  return (
    <ButtonBase
      onClick={onClick}
      disabled={disabled}
      sx={{
        width: "100%",
        textAlign: "left",
        borderRadius: 2,
        overflow: "hidden",
        opacity: disabled ? 0.55 : 1,
        touchAction: "manipulation",
      }}
    >
      <Paper
        elevation={selected ? 4 : 0}
        sx={{
          width: "100%",
          minHeight: { xs: 72, sm: 82 },
          p: { xs: 1.4, sm: 1.6 },
          borderRadius: 2,
          border: "2px solid",
          borderColor: selected ? color : "rgba(184, 182, 186, 0.22)",
          bgcolor: selected ? "rgba(245, 166, 35, 0.12)" : "background.paper",
          transition: "all 0.2s ease",
          display: "flex",
          alignItems: "center",
          gap: 1.2,
          "&:hover": {
            borderColor: color,
            bgcolor: selected ? "rgba(245, 166, 35, 0.16)" : "action.hover",
          },
        }}
      >
        <Box
          sx={{
            width: { xs: 38, sm: 42 },
            height: { xs: 38, sm: 42 },
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: selected ? color : "rgba(184, 182, 186, 0.12)",
            color: selected ? "white" : color,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              fontFamily: "fontFamily.primary",
              color: selected ? "primary.main" : "text.primary",
              fontSize: { xs: 13, sm: 14 },
              lineHeight: 1.15,
            }}
          >
            {title}
          </Typography>

          {description && (
            <Typography
              sx={{
                mt: 0.35,
                fontFamily: "fontFamily.secondary",
                color: "text.secondary",
                fontSize: { xs: 11, sm: 12 },
                lineHeight: 1.2,
              }}
            >
              {description}
            </Typography>
          )}
        </Box>

        {selected && (
          <Chip
            label="Seleccionado"
            size="small"
            color="primary"
            sx={{
              display: { xs: "none", sm: "inline-flex" },
              fontFamily: "fontFamily.secondary",
              fontSize: 11,
            }}
          />
        )}
      </Paper>
    </ButtonBase>
  );
};
