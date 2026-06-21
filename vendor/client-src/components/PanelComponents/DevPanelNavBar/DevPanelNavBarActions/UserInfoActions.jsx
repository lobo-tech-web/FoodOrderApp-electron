// ---- MATERIAL UI ----
import { Box, Typography } from '@mui/material';
// ---------------------

// ---- COMPONENTS ----
import { RefreshComponent } from '@/components/PanelComponents/RefreshComponent/RefreshComponent.jsx';
import { SearchBox } from '@/components/PanelComponents/SearchBox/SearchBox.jsx';
// --------------------

export const UserInfoActions = ({ refreshGetInfoFromUser }) => {
  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}
    >
      <RefreshComponent
        isAllInfoFromUser={true}
        refreshGetInfoFromUser={refreshGetInfoFromUser}
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
          sx={{
            fontFamily: 'fontFamily.terciary',
            color: 'text.secondary',
          }}
        >
          EMAIL USUARIO
        </Typography>
        <SearchBox isAllInfoFromUser={true} placeholder={'EMAIL...'} />
      </Box>
    </Box>
  );
};
