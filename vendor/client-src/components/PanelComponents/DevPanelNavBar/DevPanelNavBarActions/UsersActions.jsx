// ---- MATERIAL UI ----
import { Box, Typography, Divider } from '@mui/material';
// ---------------------

// ---- COMPONENTS ----
import { RefreshComponent } from '@/components/PanelComponents/RefreshComponent/RefreshComponent.jsx';
import { SearchBox } from '@/components/PanelComponents/SearchBox/SearchBox.jsx';
import { FilterByActiveUsers } from '@/components/PanelComponents/Filters/FilterByActiveUsers/FilterByActiveUsers.jsx';
import { FilterByRoleUsers } from '@/components/PanelComponents/Filters/FilterByRoleUsers/FilterByRoleUsers';
// --------------------

export const UsersActions = ({ refreshUsers }) => {
  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}
    >
      <RefreshComponent isUsersPanel={true} refreshUsers={refreshUsers} />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography
          sx={{
            fontFamily: 'fontFamily.terciary',
            color: 'text.secondary',
          }}
        >
          NOMBRE USUARIO
        </Typography>
        <SearchBox isUsersPanel={true} />
      </Box>

      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'fontFamily.terciary',
            color: 'text.secondary',
            mr: 2,
          }}
        >
          FILTROS
        </Typography>
        <FilterByActiveUsers />
        <FilterByRoleUsers />
      </Box>
    </Box>
  );
};
