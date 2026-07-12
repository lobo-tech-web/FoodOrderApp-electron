import { useState, useMemo, useEffect } from "react";

// ---- MATERIAL UI ----
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Tabs,
  Tab,
  TablePagination,
  Card,
} from "@mui/material";
// ICONS
import TodayIcon from "@mui/icons-material/Today";
import HistoryIcon from "@mui/icons-material/History";
// ---------------------

// ---- COMPONENTS ----
import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent.jsx";
import { DevPanelNavBar } from "@/components/PanelComponents/DevPanelNavBar/DevPanelNavBar.jsx";
// --------------------

// ---- CONTEXT ----
import { useOrders } from "@/context/Orders.jsx";
// -----------------

// ---- STYLES ----
const tabStyles = {
  fontFamily: "fontFamily.primary",
  color: "text.primary",
  borderRadius: 1,
};

const tableHeadStyle = {
  color: "primary.main",
  textAlign: "center",
  fontFamily: "fontFamily.primary",
};

const tableBodyStyle = {
  color: "text.primary",
  textAlign: "center",
  fontFamily: "fontFamily.secondary",
};
// ----------------

export const AllStatsPanel = () => {
  const isElectronApp =
    typeof window !== "undefined" && Boolean(window.electronAPI);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  // Cambiar de pestaña
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0); // Resetear la paginación al cambiar de pestaña
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const { orderState, getMonthlyOrderStats } = useOrders();
  const orderStats = useMemo(
    () => orderState.orderStats || [],
    [orderState.orderStats],
  );

  const fetchStats = async () => {
    setLoading(true);
    try {
      await getMonthlyOrderStats();
      setPage(0);
    } catch (error) {
      console.error("Error al obtener las estadisticas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <LoadingComponent message={"Cargando estadisticas..."} />;

  return (
    <Box
      sx={{
        width: "100%",
        height: isElectronApp ? "calc(100vh - 112px)" : "auto",
        overflowY: isElectronApp ? "auto" : "visible",
        overflowX: isElectronApp ? "auto" : "visible",
        pr: isElectronApp ? 1 : 0,
        pb: isElectronApp ? 3 : 0,
      }}
    >
      {/* PANELNAVBAR DE LOS PEDIDOS */}
      <DevPanelNavBar
        isAllStatsOrders={true}
        refreshAllStatsOrders={fetchStats}
      />

      <Card sx={{ mb: 2, borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={"standard"}
            sx={{
              px: 2,
              pt: 1,
              "& .MuiTabs-indicator": {
                bgcolor: "primary.main",
              },
            }}
          >
            <Tab
              icon={<TodayIcon color="primary" />}
              iconPosition="start"
              label={
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: "text.primary",
                  }}
                >
                  PEDIDOS MENSUALES
                </Box>
              }
              sx={tabStyles}
            />

            <Tab
              icon={<HistoryIcon color="primary" />}
              iconPosition="start"
              label={
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: "text.primary",
                  }}
                >
                  PEDIDOS DIARIOS ( POR LOCAL )
                </Box>
              }
              sx={tabStyles}
            />
          </Tabs>
        </Box>
      </Card>

      {orderStats.length > 0 ? (
        <Paper
          sx={{ width: "100%", mb: 2, borderRadius: 2, overflow: "hidden" }}
        >
          <Typography
            variant="h6"
            sx={{
              fontFamily: "fontFamily.primary",
              display: "flex",
              justifyContent: "center",
              color: "text.primary",
              m: 2,
            }}
          >
            {activeTab === 0
              ? "PEDIDOS MENSUALES"
              : "PEDIDOS DIARIOS ( POR LOCAL )"}
          </Typography>

          <TableContainer>
            <Table aria-label="collapsible table">
              <TableHead sx={{ bgcolor: "background.paper" }}>
                <TableRow sx={{ textAlign: "center" }}>
                  <TableCell sx={tableHeadStyle}>ID RESTAURANT</TableCell>
                  <TableCell sx={tableHeadStyle}>RESTAURANT NAME</TableCell>
                  <TableCell sx={tableHeadStyle}>FECHA</TableCell>
                  <TableCell sx={tableHeadStyle}>TOTAL PEDIDOS</TableCell>
                  <TableCell sx={tableHeadStyle}>VENTA TOTAL</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(rowsPerPage > 0
                  ? orderStats.slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage,
                    )
                  : orderStats
                ).map((elem) =>
                  elem.stats?.map((stat, index) => (
                    <TableRow key={`${elem.restaurantId}-${index}`}>
                      <TableCell sx={tableBodyStyle}>
                        {elem.restaurantId}
                      </TableCell>
                      <TableCell sx={tableBodyStyle}>
                        {elem.restaurantName}
                      </TableCell>
                      <TableCell sx={tableBodyStyle}>
                        {stat?.month} - {stat?.year}
                      </TableCell>
                      <TableCell sx={tableBodyStyle}>
                        {stat.totalOrders}
                      </TableCell>
                      <TableCell sx={tableBodyStyle}>
                        ${stat.totalAmount?.toLocaleString("es-AR")}
                      </TableCell>
                    </TableRow>
                  )),
                )}
              </TableBody>
            </Table>
            {orderStats.length > 0 && (
              <TablePagination
                rowsPerPageOptions={[10, 20, 30, 50]}
                component="div"
                count={orderStats.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Mostrar por página:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`
                }
                sx={{
                  fontFamily: "fontFamily.primary",
                  bgcolor: "background.paper",
                  color: "text.primary",
                }}
              />
            )}
          </TableContainer>
        </Paper>
      ) : (
        <Typography
          sx={{
            display: "flex",
            alignContent: "center",
            justifyContent: "center",
            width: "100%",
            paddingTop: "10rem",
            fontFamily: "fontFamily.primary",
            color: "text.primary",
          }}
        >
          NO HAY ESTADÍSTICAS DISPONIBLES.
        </Typography>
      )}
    </Box>
  );
};
