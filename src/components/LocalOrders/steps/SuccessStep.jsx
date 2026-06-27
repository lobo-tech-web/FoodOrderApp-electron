// ---- Material UI ----
import { Alert, Box, Button, Paper, Typography } from "@mui/material";
// Icons
import {
  CheckCircle as SuccessIcon,
  Print as PrintIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Styles ----
import { buttonStyle1 } from "../../styles/buttonStyle.js";
// ----------------

export const SuccessStep = ({ createdOrder, printStatus, onCreateNext }) => (
  <Box
    sx={{
      flex: 1,
      display: "grid",
      placeItems: "center",
      p: 3,
      bgcolor: "background.main",
    }}
  >
    <Paper
      elevation={0}
      sx={{
        width: "min(620px, 100%)",
        border: "1px solid",
        borderColor: "divider",
        textAlign: "center",
        p: { xs: 3, md: 5 },
      }}
    >
      <SuccessIcon sx={{ color: "success.main", fontSize: 76 }} />
      <Typography
        component="h1"
        sx={{
          fontFamily: "fontFamily.primary",
          fontSize: { xs: "1.7rem", md: "2.2rem" },
          mt: 2,
        }}
      >
        PEDIDO CREADO EXITOSAMENTE !
      </Typography>
      <Typography
        sx={{
          fontFamily: "fontFamily.secondary",
          color: "text.secondary",
          mt: 1,
        }}
      >
        Numero de pedido
      </Typography>
      <Typography
        sx={{
          fontFamily: "fontFamily.primary",
          color: "primary.main",
          fontSize: { xs: "2.5rem", md: "3.5rem" },
          lineHeight: 1.1,
          overflowWrap: "anywhere",
        }}
      >
        #{createdOrder?.id}
      </Typography>
      {printStatus && (
        <Alert
          severity={printStatus.includes("impreso en") ? "success" : "info"}
          icon={<PrintIcon />}
          sx={{ fontFamily: "fontFamily.secondary", mt: 3, textAlign: "left" }}
        >
          {printStatus}
        </Alert>
      )}
      <Button
        fullWidth
        size="large"
        variant="contained"
        onClick={onCreateNext}
        sx={{
          ...buttonStyle1,
          minHeight: 60,
          mt: 3,
          fontSize: "1.2rem",
        }}
      >
        Crear siguiente pedido
      </Button>
    </Paper>
  </Box>
);
