// ---- Material UI ----
import { Box, Stack, Typography } from "@mui/material";
// ---------------------

export const RiderSummaryRow = ({
  icon,
  label,
  value,
  color = "text.primary",
}) => {
  return (
    <Box
      sx={{
        py: 1.15,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 2,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        {icon}

        <Typography
          sx={{
            fontFamily: "fontFamily.secondary",
            color: "text.primary",
            fontSize: "0.88rem",
          }}
        >
          {label}
        </Typography>
      </Stack>

      <Typography
        sx={{
          fontFamily: "fontFamily.primary",
          color,
          fontSize: "1rem",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};
