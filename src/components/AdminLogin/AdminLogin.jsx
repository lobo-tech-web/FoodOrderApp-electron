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
  Storefront as StoreFrontIcon,
  Person as PersonIcon,
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

// ---- Utils ----
import { normalizeStaffUsername } from "@/utils/restaurantStaffUtils.js";
// ---------------

// ---- Styles ----
import { buttonStyle1 } from "../styles/buttonStyle.js";
// ----------------

const LOGIN_MODES = {
  ADMIN: "admin",
  STAFF: "staff",
};

const getPanelPathByRole = (role) => {
  if (role === "dev") return "/dev-control-panel";
  if (role === "admin") return "/control-panel";
  if (role === "staff") return "/staff-panel";
  return "";
};

export const AdminLogin = ({ initialMode = LOGIN_MODES.ADMIN }) => {
  const navigate = useNavigate();
  const { lobotechTheme } = useLobotechThemeContext();
  const { userState, userLogin, staffLogin, userLogOut } = useUser();

  const [activeMode, setActiveMode] = useState(initialMode);
  const [formLogin, setFormLogin] = useState({ email: "", password: "" });
  const [staffForm, setStaffForm] = useState({ name: "", password: "" });
  const [rememberLogin, setRememberLogin] = useState(false);
  const [hasSavedLogin, setHasSavedLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const isStaffMode = activeMode === LOGIN_MODES.STAFF;

  useEffect(() => {
    setActiveMode(initialMode);
  }, [initialMode]);

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
    setMessage(
      "Este acceso es solo para administradores, desarrolladores o empleados.",
    );
  }, [navigate, userLogOut, userState.user]);

  const handleModeChange = (mode) => {
    setMessage("");
    setShowPassword(false);
    setActiveMode(mode);
  };

  const handleInputChange = (event) => {
    setMessage("");
    setFormLogin((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleStaffInputChange = (event) => {
    setMessage("");
    setStaffForm((current) => ({
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

  const handleAdminLogin = async () => {
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

  const handleStaffLogin = async () => {
    if (!staffForm.name.trim() || !staffForm.password.trim()) {
      setMessage("Completa usuario y contrasena para ingresar.");
      return;
    }

    setLoading(true);
    try {
      await staffLogin({
        name: normalizeStaffUsername(staffForm.name),
        password: staffForm.password,
      });

      navigate("/staff-panel", { replace: true });
    } catch (error) {
      setMessage(
        error?.message ||
          error ||
          "No se pudo iniciar sesion como empleado. Revisa tus credenciales.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isStaffMode) {
      await handleStaffLogin();
      return;
    }

    await handleAdminLogin();
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
        <Container maxWidth="sm" disableGutters>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              border: "1px solid",
              borderColor: "primary.main",
              bgcolor: "background.paper",
              p: { xs: 2.5, sm: 4 },
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
                  {isStaffMode
                    ? "ACCESO DE EMPLEADOS"
                    : "PANEL DE ADMINISTRADOR"}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    color: "text.primary",
                    mt: 0.5,
                  }}
                >
                  {isStaffMode
                    ? "Ingresa con el usuario creado por el administrador del local."
                    : "Inicia sesion para gestionar tu restaurante."}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 1,
                  p: 0.75,
                  borderRadius: 2,
                  bgcolor: "background.main",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Button
                  type="button"
                  variant={!isStaffMode ? "contained" : "text"}
                  startIcon={<StoreFrontIcon />}
                  onClick={() => handleModeChange(LOGIN_MODES.ADMIN)}
                  sx={{
                    minHeight: 44,
                    borderRadius: 1.5,
                    fontFamily: "fontFamily.primary",
                    fontWeight: 800,
                    color: !isStaffMode ? "text.primary" : "primary.main",
                  }}
                >
                  ADMINISTRADOR
                </Button>

                <Button
                  type="button"
                  variant={isStaffMode ? "contained" : "text"}
                  startIcon={<PersonIcon />}
                  onClick={() => handleModeChange(LOGIN_MODES.STAFF)}
                  sx={{
                    minHeight: 44,
                    borderRadius: 1.5,
                    fontFamily: "fontFamily.primary",
                    fontWeight: 800,
                    color: isStaffMode ? "text.primary" : "primary.main",
                  }}
                >
                  EMPLEADOS
                </Button>
              </Box>

              {message && <Alert severity="warning">{message}</Alert>}

              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: "grid", gap: 2 }}
              >
                {!isStaffMode ? (
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
                ) : (
                  <Box>
                    <Box sx={{ display: "flex", gap: 1, mb: 0.5 }}>
                      <PersonIcon color="primary" />
                      <Typography sx={{ fontFamily: "fontFamily.secondary" }}>
                        Usuario
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      required
                      autoFocus
                      id="staff-name"
                      name="name"
                      type="text"
                      autoComplete="username"
                      value={staffForm.name}
                      onChange={handleStaffInputChange}
                      sx={{ fontFamily: "fontFamily.secondary" }}
                    />
                  </Box>
                )}

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
                    value={
                      isStaffMode ? staffForm.password : formLogin.password
                    }
                    onChange={
                      isStaffMode ? handleStaffInputChange : handleInputChange
                    }
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

                {!isStaffMode && (
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
                      label="Recordar email y contrasena en esta computadora"
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
                )}

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
