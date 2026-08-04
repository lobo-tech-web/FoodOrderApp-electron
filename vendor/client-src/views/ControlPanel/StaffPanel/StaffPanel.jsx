import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// ---- Material UI ----
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
// Icons
import {
  Logout as LogoutIcon,
  ReceiptLong as ReceiptLongIcon,
  Storefront as StorefrontIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Hooks ----
import { useUser } from "@/context/Users.jsx";
// ---------------

// ---- Components ----
// import { OrderPanel } from '@/views/ControlPanel/AdminPanel/OrderPanel/OrderPanel.jsx';
// --------------------

export const StaffPanel = () => {
  const navigate = useNavigate();
  const { userState, userLogOut } = useUser();

  const staffUser = userState.user;

  useEffect(() => {
    const token = window.localStorage.getItem("token");

    if (!token || !staffUser?.id) {
      navigate("/login-staff");
      return;
    }

    if (staffUser.role !== "staff") {
      navigate("/");
    }
  }, [navigate, staffUser?.id, staffUser?.role]);

  const restaurantName = useMemo(() => {
    return (
      staffUser?.restaurant?.businessName ||
      staffUser?.restaurant?.name ||
      "Local"
    );
  }, [staffUser]);

  const handleLogout = () => {
    userLogOut();
    navigate("/login-staff");
  };

  if (!staffUser?.id || staffUser.role !== "staff") return null;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        p: { xs: 1.5, md: 2.5 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          mb: 2,
          p: 2,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <StorefrontIcon color="primary" />

            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "fontFamily.primary",
                  fontWeight: "bold",
                }}
              >
                Panel del local
              </Typography>

              <Typography
                sx={{
                  color: "text.secondary",
                  fontFamily: "fontFamily.secondary",
                }}
              >
                {restaurantName} · {staffUser.name}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              icon={<ReceiptLongIcon />}
              label={staffUser.staffRole}
              color="primary"
              variant="outlined"
            />

            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Salir
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};
