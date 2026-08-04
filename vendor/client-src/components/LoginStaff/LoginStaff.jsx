import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ---- Material UI ----
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
// Icons
import {
  Badge as BadgeIcon,
  Lock as LockIcon,
  Login as LoginIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

// ---- Hooks ----
import { useUser } from "@/context/Users.jsx";
import { useAlert } from "@/hooks/Alert.jsx";
// ---------------

// ---- Utils ----
import { normalizeStaffUsername } from "@/utils/restaurantStaffUtils.js";
// ---------------

// ---- Components ----
import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent.jsx";
// --------------------

export const LoginStaff = () => {
  const navigate = useNavigate();
  const { AlertComponent, showAlert } = useAlert();
  const { staffLogin } = useUser();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    password: "",
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      showAlert("Ingresá tu usuario", "warning");
      return;
    }

    if (!form.password.trim()) {
      showAlert("Ingresá tu contraseña", "warning");
      return;
    }

    setLoading(true);

    try {
      await staffLogin({
        name: normalizeStaffUsername(form.name),
        password: form.password,
      });

      showAlert("Empleado logueado correctamente", "success");
      navigate("/staff-panel");
    } catch (error) {
      showAlert(
        error?.message || "Error al iniciar sesión como empleado",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingComponent message="Iniciando sesión..." />;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 440,
          p: { xs: 2.5, sm: 4 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <BadgeIcon color="primary" sx={{ fontSize: 48 }} />

          <Typography
            variant="h5"
            sx={{
              mt: 1,
              fontFamily: "fontFamily.primary",
              fontWeight: "bold",
              color: "text.primary",
            }}
          >
            Acceso empleados
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontFamily: "fontFamily.secondary",
              color: "text.secondary",
            }}
          >
            Ingresá con el usuario creado por el administrador del local.
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleLogin}>
          <TextField
            label="Usuario"
            value={form.name}
            onChange={(event) => handleChange("name", event.target.value)}
            fullWidth
            autoFocus
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BadgeIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(event) => handleChange("password", event.target.value)}
            fullWidth
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="primary" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            startIcon={<LoginIcon />}
            sx={{
              py: 1.4,
              borderRadius: 2,
              fontFamily: "fontFamily.primary",
              fontWeight: "bold",
            }}
          >
            Ingresar al panel
          </Button>
        </Box>
      </Paper>

      {AlertComponent}
    </Box>
  );
};
