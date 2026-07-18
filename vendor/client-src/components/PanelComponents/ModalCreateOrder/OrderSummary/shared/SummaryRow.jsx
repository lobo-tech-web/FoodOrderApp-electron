import { Box, Typography } from "@mui/material";

export const SummaryRow = ({
  label,
  value,
  strong = false,
  highlight = false,
  negative = false,
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 1.5,
      py: 1.2,
    }}
  >
    <Typography
      sx={{
        fontFamily: "fontFamily.secondary",
        color: "text.primary",
        fontSize: strong ? { xs: 13, md: 14 } : { xs: 12, md: 13 },
      }}
    >
      {label}
    </Typography>

    <Typography
      sx={{
        fontFamily: "fontFamily.terciary",
        color: negative
          ? "error.main"
          : highlight
            ? "primary.main"
            : "text.primary",
        fontSize: strong ? { xs: 16, md: 18 } : { xs: 13, md: 15 },
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </Typography>
  </Box>
);
