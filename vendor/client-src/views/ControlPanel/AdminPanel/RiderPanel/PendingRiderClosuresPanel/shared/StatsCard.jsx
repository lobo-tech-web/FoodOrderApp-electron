// ---- Material UI ----
import { Card, Stack, Box, Typography } from "@mui/material";
// ---------------------

export const StatsCard = ({ icon, label, value }) => {
  return (
    <Card
      sx={{
        flex: 1,
        p: 2,
        borderRadius: 3,
        bgcolor: "background.main",
        border: "1px solid",
        borderColor: "primary.main",
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(245, 166, 35, 0.12)",
            color: "primary.main",
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography
            sx={{
              fontFamily: "fontFamily.secondary",
              color: "text.primary",
              fontSize: "0.85rem",
            }}
          >
            {label}
          </Typography>

          <Typography
            sx={{
              fontFamily: "fontFamily.primary",
              color: "text.primary",
              fontSize: "1.15rem",
              lineHeight: 1.1,
            }}
          >
            {value}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
};
