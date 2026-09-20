// ---- Material UI ----
import { Paper, Stack, Typography } from "@mui/material";
// ---------------------

export const MetricCard = ({
  label,
  value,
  subtitle,
  color = "text.primary",
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 1.75,
      borderRadius: 2.5,
      bgcolor: "background.paper",
      border: "1px solid",
      borderColor: "divider",
      height: "100%",
    }}
  >
    <Stack spacing={0.5}>
      <Typography
        sx={{
          fontFamily: "fontFamily.primary",
          color: "text.primary",
          fontSize: "1rem",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontFamily: "fontFamily.primary",
          color,
          fontSize: { xs: 17, sm: 20 },
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </Typography>

      {subtitle && (
        <Typography
          sx={{
            fontFamily: "fontFamily.secondary",
            color: "text.primary",
            fontSize: 11,
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Stack>
  </Paper>
);
