// ---- MATERIAL UI ----
import { Box, Typography, Button } from '@mui/material';
// ICONS
import AddIcon from '@mui/icons-material/Add';
// ---------------------

// ---- COMPONENTS ----
import { RefreshComponent } from '@/components/PanelComponents/RefreshComponent/RefreshComponent.jsx';
import { SearchBox } from '@/components/PanelComponents/SearchBox/SearchBox.jsx';
// --------------------

// ---- STYLES ----
const buttonStyle = {
  bgcolor: 'background.default',
  color: 'primary.main',
  fontFamily: 'fontFamily.terciary',
  borderRadius: '8px',
  px: 3,
  py: 1,
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    bgcolor: 'background.paper',
    color: 'primary.secondary',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  },
};
// ----------------

export const DevUserPointsActions = ({ refreshUserPoints, toggleModal }) => {
  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}
    >
      <RefreshComponent
        isUserPointsPanel={true}
        refreshUserPoints={refreshUserPoints}
      />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          overflow: 'hidden',
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'fontFamily.terciary',
            color: 'text.secondary',
          }}
        >
          NOMBRE / TELÉFONO
        </Typography>
        <SearchBox isUserPointsPanel={true} placeholder={'Nombre / Teléfono'} />
      </Box>
      <Button
        startIcon={<AddIcon />}
        onClick={() => {
          toggleModal('addUserPoints', true);
        }}
        variant="contained"
        sx={buttonStyle}
      >
        Agregar puntos
      </Button>
      <Button
        onClick={() => {
          toggleModal('removeUserPoints', true);
        }}
        variant="contained"
        sx={buttonStyle}
      >
        Remover puntos
      </Button>
    </Box>
  );
};
