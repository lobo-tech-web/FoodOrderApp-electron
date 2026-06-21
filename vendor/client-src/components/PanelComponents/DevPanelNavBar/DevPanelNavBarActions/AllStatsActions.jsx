// ---- MATERIAL UI ----
import { Box } from '@mui/material';
// ---------------------

// ---- COMPONENTS ----
import { RefreshComponent } from '@/components/PanelComponents/RefreshComponent/RefreshComponent.jsx';
// --------------------

export const AllStatsActions = ({ refreshAllStatsOrders }) => {
  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}
    >
      <RefreshComponent
        isAllStatsOrders={true}
        refreshAllStatsOrders={refreshAllStatsOrders}
      />
    </Box>
  );
};
