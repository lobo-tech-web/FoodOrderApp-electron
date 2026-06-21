// ---- COMPONENTS ----
import { RefreshComponent } from '@/components/PanelComponents/RefreshComponent/RefreshComponent.jsx';
// --------------------

export const StatsActions = ({ refreshStats }) => {
  return (
    <>
      <RefreshComponent isStatsPanel={true} refreshStats={refreshStats} />
    </>
  );
};
