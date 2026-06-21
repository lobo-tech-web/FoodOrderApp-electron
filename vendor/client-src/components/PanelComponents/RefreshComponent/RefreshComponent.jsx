// ---- MATERIAL UI ----
import { Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
// --------------------

export const RefreshComponent = ({
  isProductPanel,
  refreshProducts,
  isCategoryPanel,
  refreshCategorys,
  isOrderPanel,
  refreshOrders,
  isUsersPanel,
  refreshUsers,
  isAllInfoFromUser,
  refreshGetInfoFromUser,
  isUserPointsPanel,
  refreshUserPoints,
  isStatsPanel,
  refreshStats,
  isAllStatsOrders,
  refreshAllStatsOrders,
  isRiderPanel,
  refreshRiders,
}) => {
  const handleRefresh = () => {
    if (isProductPanel) return refreshProducts();
    if (isCategoryPanel) return refreshCategorys();
    if (isOrderPanel) return refreshOrders();
    if (isUsersPanel) return refreshUsers();
    if (isAllInfoFromUser) return refreshGetInfoFromUser();
    if (isUserPointsPanel) return refreshUserPoints();
    if (isStatsPanel) return refreshStats();
    if (isAllStatsOrders) return refreshAllStatsOrders();
    if (isRiderPanel) return refreshRiders();
  };

  return (
    <Button onClick={handleRefresh}>
      <RefreshIcon
        sx={{
          fontSize: '2rem',
          bgcolor: 'transparent',
          color: 'primary.secondary',
          '&:hover': {
            color: 'primary.main',
          },
        }}
      />
    </Button>
  );
};
