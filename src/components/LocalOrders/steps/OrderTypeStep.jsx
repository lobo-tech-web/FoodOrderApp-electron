// ---- Material UI ----
import { Box, Typography } from "@mui/material";
// ---------------------

// ---- Utils ----
import { ORDER_TYPES } from "../constants.jsx";
// ---------------

// ---- Shared ----
import { TouchOption } from "../shared/TouchOption.jsx";
// ----------------

export const OrderTypeStep = ({ orderType, onSelect }) => (
  <Box
    sx={{
      bgcolor: "background.main",
      flex: 1,
      display: "grid",
      placeItems: "center",
      p: { xs: 2, md: 4 },
    }}
  >
    <Box sx={{ width: "min(760px, 100%)" }}>
      <Typography
        component="h1"
        sx={{
          fontFamily: "fontFamily.primary",
          fontSize: { xs: "1.8rem", md: "2.6rem" },
          textAlign: "center",
          color: "primary.main",
        }}
      >
        COMO QUERES RECIBIR TU PEDIDO ?
      </Typography>
      <Typography
        sx={{
          fontFamily: "fontFamily.secondary",
          color: "text.primary",
          textAlign: "center",
          mt: 1,
          mb: 4,
        }}
      >
        Elegi una opcion para comenzar.
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
          gap: 2,
        }}
      >
        {ORDER_TYPES.map((option) => (
          <TouchOption
            key={option.value}
            {...option}
            active={orderType === option.value}
            onClick={() => onSelect(option.value)}
          />
        ))}
      </Box>
    </Box>
  </Box>
);
