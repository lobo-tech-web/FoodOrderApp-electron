// ---- Material UI ----
import { Paper, Stack, Box, Typography } from "@mui/material";
// ---------------------

export const RiderMetricCard = ({
  icon,
  label,
  value,
  color = "text.primary",
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 2.5,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        {icon && (
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(245, 166, 35, 0.10)",
              border: "1px solid",
              borderColor: "primary.main",
              color: "primary.main",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              fontFamily: "fontFamily.secondary",
              color: "primary.main",
              fontSize: "0.78rem",
            }}
          >
            {label}
          </Typography>

          <Typography
            sx={{
              fontFamily: "fontFamily.primary",
              color: "text.primary",
              fontSize: { xs: "1.05rem", md: "1.2rem" },
              lineHeight: 1,
            }}
          >
            {value}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};
