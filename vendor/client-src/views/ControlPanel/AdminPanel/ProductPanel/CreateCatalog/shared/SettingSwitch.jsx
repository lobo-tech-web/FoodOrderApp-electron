import { Paper, Box, Typography, Switch } from "@mui/material";

export const SettingSwitch = ({
  label,
  description,
  checked,
  onChange,
  icon,
}) => {
  return (
    <Paper
      sx={{
        p: { xs: 1.2, sm: 1.5 },
        m: { xs: 1, sm: 1 },
        borderRadius: "15px",
        bgcolor: checked ? "primary.main" : "background.paper",
        transition: "all 0.2s ease",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box sx={{ display: "flex", gap: 1.2, minWidth: 0 }}>
          {icon && (
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                bgcolor: checked ? "primary.main" : "action.hover",
                color: checked ? "text.secondary" : "text.primary",
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          )}

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontFamily: "fontFamily.primary",
                color: checked ? "text.terciary" : "text.primary",
                fontSize: { xs: 13, sm: 14 },
                lineHeight: 1.2,
              }}
            >
              {label}
            </Typography>

            {description && (
              <Typography
                sx={{
                  mt: 0.3,
                  fontFamily: "fontFamily.secondary",
                  color: "text.secondary",
                  fontSize: { xs: 11, sm: 12 },
                  lineHeight: 1.25,
                }}
              >
                {description}
              </Typography>
            )}
          </Box>
        </Box>

        <Switch
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          color={checked ? "terciary" : "primary"}
        />
      </Box>
    </Paper>
  );
};
