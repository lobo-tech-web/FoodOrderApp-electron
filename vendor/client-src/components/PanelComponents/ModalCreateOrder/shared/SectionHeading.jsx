import { Box, Typography } from "@mui/material";

export const SectionHeading = ({ icon, title, description, action, step }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: { xs: "column", sm: "row" },
      justifyContent: "space-between",
      alignItems: { xs: "flex-start", sm: "center" },
      gap: 1.5,
      mb: 1,
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
      <Box
        sx={{
          color: "primary.main",
          display: "flex",
          alignItems: "center",
          "& .MuiSvgIcon-root": { fontSize: 22 },
          ...(step && {
            width: 26,
            height: 26,
            justifyContent: "center",
            borderRadius: "50%",
            bgcolor: "primary.main",
            color: "text.terciary",
            fontFamily: "fontFamily.primary",
            fontSize: 18,
            flexShrink: 0,
          }),
        }}
      >
        {step || icon}
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Typography
          sx={{
            fontFamily: "fontFamily.primary",
            color: "text.primary",
            fontSize: "18px",
            lineHeight: 1,
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            fontFamily: "fontFamily.secondary",
            color: "text.secondary",
            fontSize: "14px",
            lineHeight: 1,
          }}
        >
          {description}
        </Typography>
      </Box>
    </Box>

    {action}
  </Box>
);
