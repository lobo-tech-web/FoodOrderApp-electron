import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// ---- MATERIAL UI ----
import { Typography, Box, Tab, Tabs, ThemeProvider } from '@mui/material';
// <--------------------

// ---- THEME ----
import { lobotechAppTheme } from '@/theme/main-theme.js';
// <--------------

// ---- CONTEXT ----
import { useUser } from '@/context/Users.jsx';
// <----------------

// ---- COMPONENTS ----
import { LoadingComponent } from '@/components/LoadingComponent/LoadingComponent.jsx';
import { UserNavBar } from '@/components/PanelComponents/UserNavBar/UserNavBar.jsx';
import { UsersPanel } from './UsersPanel/UsersPanel.jsx';
import { GetInfoFromUser } from './GetInfoFromUser/GetInfoFromUser.jsx';
import { UserPointsPanel } from './UserPointsPanel/UserPointsPanel.jsx';
import { AllStatsPanel } from './AllStatsPanel/AllStatsPanel.jsx';
// --------------------

// ---- STYLES ----
const tabStyles = {
  fontFamily: 'fontFamily.primary',
  color: 'text.primary',
  borderRadius: 1,
  '&.Mui-selected': {
    color: 'primary.main',
    bgcolor: 'background.default',
  },
};
// ----------------

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const DevPanel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // CONTEXT
  const { userState, getAllUsers, userLogOut } = useUser();
  const user = useMemo(() => userState.user || {}, [userState.user]);

  const logoutUser = () => {
    userLogOut();
    navigate('/');
  };

  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (!user.id || user.role !== 'dev') {
      navigate('/');
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        await getAllUsers();
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id, navigate, getAllUsers]);

  if (loading) return <LoadingComponent />;

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
        <Typography
          variant="h4"
          sx={{
            display: 'flex',
            justifyContent: 'center',
            fontFamily: 'fontFamily.primary',
            color: 'primary.main',
            pt: 3,
          }}
        >
          PANEL DEVELOPER
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 5,
            borderBottom: 1,
            borderColor: 'divider',
            mt: 2,
          }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="user panel tabs"
            sx={{
              '& .MuiTabs-indicator': { backgroundColor: 'text.secondary' },
            }}
          >
            <Tab label="Usuarios" sx={tabStyles} />
            <Tab label="Info. User" sx={tabStyles} />
            <Tab label="Ptos. Usuarios" sx={tabStyles} />
            <Tab label="Stats globales" sx={tabStyles} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <UsersPanel />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <GetInfoFromUser />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <UserPointsPanel />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <AllStatsPanel />
        </TabPanel>
      </Box>
    </ThemeProvider>
  );
};
