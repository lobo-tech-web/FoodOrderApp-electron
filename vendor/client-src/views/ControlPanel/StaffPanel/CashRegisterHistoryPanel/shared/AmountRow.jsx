// ---- Material UI ----
import { Stack, Typography } from "@mui/material";
// ---------------------

// ---- Helpers ----
import { formatMoney } from "@/utils/cashRegisterUtils.js";
const money = (value) => formatMoney(Number(value || 0));
// -----------------

export const AmountRow = ({ label, value, color = "text.primary" }) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="center"
    spacing={2}
  >
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
        fontSize: "1rem",
        color,
        textAlign: "right",
      }}
    >
      {money(value)}
    </Typography>
  </Stack>
);
