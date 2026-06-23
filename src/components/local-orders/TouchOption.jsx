import { Box, Button, Typography } from "@mui/material";

export const TouchOption = ({ active, icon, title, description, onClick }) => (
  <Button
    onClick={onClick}
    variant={active ? "contained" : "outlined"}
    color={active ? "primary" : "secondary"}
    sx={{
      minHeight: 112,
      justifyContent: "flex-start",
      textAlign: "left",
      p: 2,
      borderRadius: 2,
      borderWidth: 2,
      gap: 1.5,
      color: "text.primary",
      "&:hover": { borderWidth: 2 },
    }}
  >
    <Box
      sx={{
        display: "grid",
        placeItems: "center",
        fontSize: 34,
        color: active ? "text.terciary" : "primary.main",
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography
        sx={{
          fontFamily: "fontFamily.primary",
          fontSize: "1.15rem",
          color: active ? "text.terciary" : "text.primary",
        }}
      >
        {title}
      </Typography>
      {description && (
        <Typography
          sx={{
            fontFamily: "fontFamily.secondary",
            color: active ? "text.terciary" : "text.primary",
            mt: 0.4,
            textTransform: "none",
          }}
        >
          {description}
        </Typography>
      )}
    </Box>
  </Button>
);
