import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// ---- Material UI ----
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
// Icons
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Login as LoginIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
// ------------------

// ---- Logo ----
import logo from "@/assets/main/logo-lobotech-oj.png";
// --------------

// ---- Context ----
import { useLobotechThemeContext } from "@/context/ThemeContext.jsx";
import { useUser } from "@/context/Users.jsx";
// -----------------

// ---- Styles ----
import { buttonStyle1 } from "../styles/buttonStyle.js";
// ----------------

const getPanelPathByRole = (role) => {
  if (role === "dev") return "/dev-control-panel";
  if (role === "admin") return "/control-panel";
  return "";
};

export const AdminLogin = () => {
  const navigate = useNavigate();
  const { lobotechTheme } = useLobotechThemeContext();
  const { userState, userLogin, userLogOut } = useUser();
  const [formLogin, setFormLogin] = useState({ email: "", password: "" });
  const [rememberLogin, setRememberLogin] = useState(false);
  const [hasSavedLogin, setHasSavedLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedLogin = window.secureStorage?.getItem("loginCredentials");
    if (!savedLogin) return;

    try {
      const parsedLogin = JSON.parse(savedLogin);
      if (!parsedLogin?.email || !parsedLogin?.password) return;

      setFormLogin({
        email: parsedLogin.email,
        password: parsedLogin.password,
      });
      setRememberLogin(true);
      setHasSavedLogin(true);
    } catch {
      window.secureStorage?.removeItem("loginCredentials");
    }
  }, []);

  useEffect(() => {
    const user = userState.user || {};

    if (!user.id) return;

    const panelPath = getPanelPathByRole(user.role);

    if (panelPath) {
      navigate(panelPath, { replace: true });
      return;
    }

    userLogOut();
    setMessage("Este acceso es solo para administradores y desarrolladores.");
  }, [navigate, userLogOut, userState.user]);

  const handleInputChange = (event) => {
    setMessage("");
    setFormLogin((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const removeSavedLogin = () => {
    window.secureStorage?.removeItem("loginCredentials");
    setHasSavedLogin(false);
    setRememberLogin(false);
    setFormLogin({ email: "", password: "" });
    setMessage("Datos guardados eliminados de esta computadora.");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formLogin.email || !formLogin.password) {
      setMessage("Completa email y contrasena para ingresar.");
      return;
    }

    setLoading(true);
    try {
      await userLogin(formLogin);

      if (rememberLogin) {
        const saved = window.secureStorage?.setItem(
          "loginCredentials",
          JSON.stringify({
            email: formLogin.email.trim(),
            password: formLogin.password,
          }),
        );
        if (saved) setHasSavedLogin(true);
      } else {
        window.secureStorage?.removeItem("loginCredentials");
        setHasSavedLogin(false);
      }
    } catch (error) {
      setMessage(
        error ||
          "No se pudo iniciar sesion. Revisa tus credenciales e intenta otra vez.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={lobotechTheme}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          bgcolor: "background.main",
          px: 2,
          py: 4,
        }}
      >
        <Container maxWidth="xs" disableGutters>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              border: "1px solid",
              borderColor: "primary.main",
              bgcolor: "background.paper",
              p: { xs: 3, sm: 4 },
            }}
          >
            <Box sx={{ display: "grid", gap: 3 }}>
              <Box sx={{ textAlign: "center" }}>
                <Box
                  component="img"
                  src={logo}
                  alt="LoboTech"
                  sx={{ width: 156, maxWidth: "70%", mb: 2 }}
                />
                <Typography
                  component="h1"
                  variant="h5"
                  sx={{
                    fontFamily: "fontFamily.primary",
                    fontWeight: 700,
                    color: "primary.main",
                  }}
                >
                  PANEL DE ADMINISTRACIÓN
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    color: "text.primary",
                    mt: 0.5,
                  }}
                >
                  Inicia sesion para gestionar tu restaurante.
                </Typography>
              </Box>

              {message && <Alert severity="warning">{message}</Alert>}

              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: "grid", gap: 2 }}
              >
                <Box>
                  <Box sx={{ display: "flex", gap: 1, mb: 0.5 }}>
                    <EmailIcon color="primary" />
                    <Typography sx={{ fontFamily: "fontFamily.secondary" }}>
                      Email
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    required
                    autoFocus
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formLogin.email}
                    onChange={handleInputChange}
                    sx={{ fontFamily: "fontFamily.secondary" }}
                  />
                </Box>

                <Box>
                  <Box sx={{ display: "flex", gap: 1, mb: 0.5 }}>
                    <LockIcon color="primary" />
                    <Typography sx={{ fontFamily: "fontFamily.secondary" }}>
                      Contraseña
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    required
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={formLogin.password}
                    onChange={handleInputChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={
                              showPassword
                                ? "Ocultar contraseña"
                                : "Mostrar contraseña"
                            }
                            edge="end"
                            onClick={() =>
                              setShowPassword((current) => !current)
                            }
                          >
                            {showPassword ? (
                              <VisibilityOffIcon />
                            ) : (
                              <VisibilityIcon />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ fontFamily: "fontFamily.secondary" }}
                  />
                </Box>

                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberLogin}
                        onChange={(event) =>
                          setRememberLogin(event.target.checked)
                        }
                        sx={{
                          color: "primary.main",
                          "&.Mui-checked": { color: "primary.main" },
                        }}
                      />
                    }
                    label="Recordar email y contraseña en esta computadora"
                    sx={{
                      m: 0,
                      color: "text.primary",
                      "& .MuiFormControlLabel-label": {
                        fontFamily: "fontFamily.secondary",
                        fontSize: "0.9rem",
                      },
                    }}
                  />
                  {hasSavedLogin && (
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={removeSavedLogin}
                      sx={{
                        fontFamily: "fontFamily.secondary",
                        fontSize: { xs: "0.5rem", sm: "0.7rem" },
                        mt: 0.5,
                      }}
                    >
                      Eliminar datos guardados
                    </Button>
                  )}
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={
                    loading ? (
                      <CircularProgress color="inherit" size={18} />
                    ) : (
                      <LoginIcon />
                    )
                  }
                  sx={buttonStyle1}
                >
                  {loading ? "INGRESANDO..." : "INGRESAR AL PANEL"}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};
