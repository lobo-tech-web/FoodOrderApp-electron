// ---- Material UI ----
import { Paper, Stack, Box, Typography } from "@mui/material";
// ---------------------

export const RiderSectionCard = ({
  title,
  subtitle,
  icon,
  action,
  children,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.6, sm: 2 },
        borderRadius: 3,
        bgcolor: "background.main",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={1.5}
        sx={{ mb: 1.8 }}
      >
        <Stack direction="row" spacing={1.2} alignItems="center">
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

          <Box>
            <Typography
              sx={{
                fontFamily: "fontFamily.primary",
                color: "primary.main",
                fontSize: "0.95rem",
                lineHeight: 1,
              }}
            >
              {title}
            </Typography>

            {subtitle && (
              <Typography
                sx={{
                  fontFamily: "fontFamily.secondary",
                  color: "text.primary",
                  fontSize: "0.78rem",
                  mt: 0.5,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>

        {action}
      </Stack>

      {children}
    </Paper>
  );
};
