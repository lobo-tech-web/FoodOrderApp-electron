// ---- Material UI ----
import { Paper, Stack, Typography } from "@mui/material";
// ---------------------

export const ReportSection = ({ title, children }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      borderRadius: 2.5,
      border: "1px solid",
      borderColor: "divider",
      bgcolor: "background.paper",
    }}
  >
    <Typography
      sx={{
        fontFamily: "fontFamily.primary",
        fontSize: "1.1rem",
        color: "primary.main",
        borderBottom: "1px solid",
        borderColor: "text.primary",
        mb: 1.5,
      }}
    >
      {title}
    </Typography>

    <Stack spacing={1}>{children}</Stack>
  </Paper>
);
