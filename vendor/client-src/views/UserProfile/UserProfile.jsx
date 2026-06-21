import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// ---- MATERIAL UI ----
import {
  ThemeProvider,
  Card,
  CardContent,
  Typography,
  Divider,
  Box,
  Button,
  Tab,
  Tabs,
  Paper,
  IconButton,
  useMediaQuery,
  useTheme,
  Fade,
  Stack,
} from '@mui/material';

// ICONS
import {
  Edit as EditIcon,
  Key as KeyIcon,
  Person as PersonIcon,
  Star as StarIcon,
  Receipt as ReceiptIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
// ---------------------

// ---- THEMES ----
import { lobotechAppTheme } from '@/theme/main-theme.js';
// ----------------

// ---- COMPONENTS ----
import { UserNavBar } from '@/components/PanelComponents/UserNavBar/UserNavBar.jsx';
import { ModalEditUser } from '@/components/PanelComponents/ModalEditUser/ModalEditUser.jsx';
import { ChangePassword } from './ChangePassword/ChangePassword.jsx';
import { ProfileUserOrders } from './ProfileUserOrders/ProfileUserOrders.jsx';
import { ProfileUserPoints } from './ProfileUserPoints/ProfileUserPoints.jsx';
import { ProfileUserInfo } from './ProfileUserInfo/ProfileUserInfo.jsx';
// --------------------

// ---- CONTEXT ----
import { useUser } from '@/context/Users.jsx';
// -----------------

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      style={{ width: '100%' }}
    >
      {value === index && (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, mt: 2 }}>
          <Fade in={value === index} timeout={500}>
            <div>{children}</div>
          </Fade>
        </Box>
      )}
    </div>
  );
}

export const UserProfile = () => {
  const navigate = useNavigate();

  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [value, setValue] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    setShowAnimation(true);
  }, []);

  const handleChange = (event, newValue) => setValue(newValue);

  // ESTADOS PARA LOS MODALES
  const [modalState, setModalState] = useState({
    showEditUser: false,
    showChangePassword: false,
  });

  // ABRIR/CERRAR MODALES
  const toggleModal = (modal, value) => {
    setModalState((prevState) => ({ ...prevState, [modal]: value }));
  };

  const { userState, userLogOut } = useUser();

  const user = useMemo(() => userState.user || {}, [userState.user]);

  const logoutUser = () => {
    userLogOut();
    navigate(-1);
  };

  useEffect(() => {
    if (!userState.user.id) navigate('/');
  }, [userState.user]);

  return (
    <ThemeProvider theme={lobotechAppTheme}>
      <Box
        sx={{
          width: '100%',
          minHeight: '100vh',
          bgcolor: 'background.main',
          position: 'relative',
        }}
      >
        <UserNavBar user={user} onLogout={logoutUser} />

        <Box
          sx={{
            maxWidth: '1200px',
            margin: '0 auto',
            p: { xs: 1, sm: 2, md: 3 },
          }}
        >
          <Fade in={showAnimation} timeout={800}>
            <Box>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <IconButton
                  onClick={() => navigate(-1)}
                  sx={{
                    color: 'text.secondary',
                    mr: 1,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <ArrowBackIcon sx={{ color: 'text.primary' }} />
                </IconButton>
                <Typography
                  variant="h5"
                  component="h1"
                  sx={{
                    fontFamily: 'fontFamily.terciary',
                    color: 'text.primary',
                  }}
                >
                  MI PERFIL
                </Typography>
              </Box>

              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={3}
                sx={{ width: '100%' }}
              >
                {/* Tarjeta de perfil */}
                <Box sx={{ flex: { md: '0 0 33.333%' }, width: '100%' }}>
                  <Card
                    elevation={3}
                    sx={{
                      bgcolor: 'background.main',
                      borderRadius: 3,
                      overflow: 'hidden',
                      height: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: 'background.paper',
                        py: 4,
                        px: 2,
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography
                        variant="h5"
                        component="h2"
                        sx={{
                          fontFamily: 'fontFamily.terciary',
                          color: 'text.primary',
                          mt: 2,
                        }}
                      >
                        {user.name}
                      </Typography>

                      {user.businessName && (
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'fontFamily.secondary',
                            color: 'text.primary',
                            mt: 1,
                          }}
                        >
                          {user.businessName}
                        </Typography>
                      )}
                    </Box>

                    <CardContent sx={{ p: 3 }}>
                      <Stack spacing={2}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 2,
                            borderRadius: 2,
                            bgcolor: 'primary.main',
                          }}
                        >
                          <PersonIcon sx={{ color: 'text.terciary', mr: 2 }} />

                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                fontFamily: 'fontFamily.secondary',
                                color: 'text.terciary',
                                display: 'block',
                              }}
                            >
                              N° de usuario
                            </Typography>

                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'fontFamily.secondary',
                                color: 'text.terciary',
                              }}
                            >
                              {user.userNumber}
                            </Typography>
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 2,
                            borderRadius: 2,
                            bgcolor: 'primary.main',
                          }}
                        >
                          <PersonIcon sx={{ color: 'text.terciary', mr: 2 }} />

                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                fontFamily: 'fontFamily.secondary',
                                color: 'text.terciary',
                                display: 'block',
                              }}
                            >
                              Email
                            </Typography>

                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'fontFamily.secondary',
                                color: 'text.terciary',
                              }}
                            >
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>

                        <Divider sx={{ my: 1 }} />

                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<EditIcon fontSize="small" />}
                          onClick={() => toggleModal('showEditUser', true)}
                          sx={{
                            fontFamily: 'fontFamily.secondary',
                            bgcolor: 'primary.main',
                            color: 'text.terciary',
                            py: 1,
                            borderRadius: 2,
                            textTransform: 'none',
                          }}
                        >
                          Editar perfil
                        </Button>

                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<KeyIcon />}
                          onClick={() =>
                            toggleModal('showChangePassword', true)
                          }
                          sx={{
                            fontFamily: 'fontFamily.secondary',
                            bgcolor: 'primary.main',
                            color: 'text.terciary',
                            py: 1,
                            borderRadius: 2,
                            textTransform: 'none',
                          }}
                        >
                          Cambiar contraseña
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>

                {/* Contenido principal */}
                <Box sx={{ flex: { md: '0 0 66.667%' }, width: '100%' }}>
                  <Paper
                    elevation={3}
                    sx={{
                      bgcolor: 'background.default',
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}
                  >
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                      <Tabs
                        value={value}
                        onChange={handleChange}
                        variant={isTablet ? 'fullWidth' : 'standard'}
                        scrollButtons={isTablet ? 'auto' : false}
                        aria-label="profile tabs"
                        sx={{
                          bgcolor: 'background.paper',
                          '& .MuiTabs-indicator': {
                            backgroundColor: 'primary.main',
                            height: 3,
                          },
                          '& .MuiTab-root': {
                            fontFamily: 'fontFamily.secondary',
                            color: 'text.primary',
                            textTransform: 'none',
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                            minHeight: 64,
                            '&.Mui-selected': {
                              color: 'primary.main',
                            },
                          },
                        }}
                      >
                        <Tab
                          icon={<PersonIcon />}
                          iconPosition="start"
                          label="Mis datos"
                          id="profile-tab-0"
                          aria-controls="profile-tabpanel-0"
                        />
                        <Tab
                          icon={<StarIcon />}
                          iconPosition="start"
                          label="Mis puntos"
                          id="profile-tab-1"
                          aria-controls="profile-tabpanel-1"
                        />
                        <Tab
                          icon={<ReceiptIcon />}
                          iconPosition="start"
                          label="Mis pedidos"
                          id="profile-tab-2"
                          aria-controls="profile-tabpanel-2"
                        />
                      </Tabs>
                    </Box>

                    {/* TAB INFORMACIÓN DEL USUARIO */}
                    <TabPanel value={value} index={0}>
                      <ProfileUserInfo user={user} />
                    </TabPanel>

                    {/* TAB PUNTOS DEL USUARIO */}
                    <TabPanel value={value} index={1}>
                      <ProfileUserPoints user={user} />
                    </TabPanel>

                    {/* TAB PEDIDOS DEL USUARIO */}
                    <TabPanel value={value} index={2}>
                      <ProfileUserOrders user={user} />
                    </TabPanel>
                  </Paper>
                </Box>
              </Stack>
            </Box>
          </Fade>
        </Box>
      </Box>
      {/* MODAL EDITAR USUARIO */}
      <ModalEditUser
        show={modalState.showEditUser}
        handleClose={() => {
          toggleModal('showEditUser', false);
        }}
        isEditing={true}
        showUser={user}
      />
      {/* MODAL CHANGE PASSWORD */}
      <ChangePassword
        show={modalState.showChangePassword}
        handleClose={() => {
          toggleModal('showChangePassword', false);
        }}
        showUser={user}
      />
    </ThemeProvider>
  );
};
