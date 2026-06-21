import { useState, useEffect, useCallback, useMemo } from 'react';

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
  TablePagination,
  Button,
} from '@mui/material';
// ICONS
import PrintIcon from '@mui/icons-material/Print';
// ---------------------

// ---- COMPONENTS ----
import { LoadingComponent } from '@/components/LoadingComponent/LoadingComponent.jsx';
import { PanelNavBar } from '@/components/PanelComponents/PanelNavBar/PanelNavBar.jsx';
import { PrintDailySalesTicket } from './PrintDailySalesTicket/PrintDailySalesTicket.jsx';
import { CategorySalesReport } from './CategorySalesReport.jsx';
// --------------------

// ---- CONTEXT ----
import { useOrders } from '@/context/Orders.jsx';
// -----------------

// ---- HOOKS ----
import { useAlert } from '@/hooks/Alert.jsx';
// ---------------

// ---- STYLES ----
const tableHeadStyle = {
  color: 'primary.main',
  textAlign: 'center',
  fontFamily: 'fontFamily.primary',
};

const tableBodyStyle = {
  color: 'text.primary',
  textAlign: 'center',
  fontFamily: 'fontFamily.secondary',
};
// ----------------

export const StatsPanel = ({ user, externalView }) => {
  const { AlertComponent, showAlert } = useAlert();
  const [loading, setLoading] = useState(false);

  const activeTab = useMemo(() => {
    if (externalView === 4) return 0;
    if (externalView === 41) return 1;
    if (externalView === 42) return 2;
    return 2;
  }, [externalView]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const { orderState, getMonthlyOrderStats, getDailyOrderStats } = useOrders();
  const orderStats = useMemo(
    () => orderState.orderStats || [],
    [orderState.orderStats]
  );

  const fetchStats = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      if (activeTab === 0) {
        await getDailyOrderStats(user.id);
      } else {
        await getMonthlyOrderStats(user.id);
      }
      setPage(0);
      showAlert('Estadisticas Actualizadas!', 'success');
    } catch (error) {
      console.error('Error al obtener las estadisticas:', error);
      showAlert?.('Error al obtener las estadísticas', 'error');
    } finally {
      setLoading(false);
    }
  }, [
    activeTab,
    user?.id,
    getDailyOrderStats,
    getMonthlyOrderStats,
    showAlert,
  ]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Estado para el modal de impresión
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedDayStats, setSelectedDayStats] = useState(null);

  const handleOpenPrintModal = (stats) => {
    setSelectedDayStats(stats);
    setIsPrintModalOpen(true);
  };

  // Función para cerrar el modal de impresión
  const handleClosePrintModal = () => {
    setIsPrintModalOpen(false);
    setSelectedDayStats(null);
  };

  if (loading) return <LoadingComponent message={'Cargando estadisticas...'} />;

  return (
    <Box sx={{ width: '100%' }}>
      {/* PANELNAVBAR DE LOS PEDIDOS */}
      <PanelNavBar isStatsPanel={true} handleRefresh={fetchStats} />

      {/* STATS */}
      {activeTab === 2 ? (
        orderStats.length > 0 ? (
          <CategorySalesReport monthlyStats={orderStats} />
        ) : (
          <Typography
            sx={{
              display: 'flex',
              alignContent: 'center',
              justifyContent: 'center',
              width: '100%',
              paddingTop: '10rem',
              fontFamily: 'fontFamily.primary',
            }}
          >
            NO HAY REPORTES MENSUALES DISPONIBLES.
          </Typography>
        )
      ) : orderStats.length > 0 ? (
        <Paper
          sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}
        >
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'fontFamily.primary',
              display: 'flex',
              justifyContent: 'center',
              color: 'text.primary',
              m: 2,
            }}
          >
            {activeTab === 0 ? 'VENTAS DIARIAS' : 'VENTAS MENSUALES'}
          </Typography>
          <TableContainer>
            <Table aria-label="collapsible table">
              <TableHead sx={{ bgcolor: 'background.paper' }}>
                <TableRow sx={{ textAlign: 'center' }}>
                  <TableCell sx={tableHeadStyle}>FECHA</TableCell>
                  <TableCell sx={tableHeadStyle}>TOTAL DE PEDIDOS</TableCell>
                  <TableCell sx={tableHeadStyle}>VENTA TOTAL</TableCell>
                  <TableCell sx={tableHeadStyle}>IMPRIMIR VENTAS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ bgcolor: 'background.default' }}>
                {(rowsPerPage > 0
                  ? orderStats.slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage
                    )
                  : orderStats
                ).map((stats, index) => (
                  <TableRow key={index} sx={{ textAlign: 'center' }}>
                    <TableCell component="th" scope="row" sx={tableBodyStyle}>
                      {activeTab === 0
                        ? `${stats?.date?.day} - ${stats?.date?.monthName} - ${stats?.date?.year}`
                        : `${stats?.date?.monthName} - ${stats?.date?.year}`}
                    </TableCell>
                    <TableCell component="th" scope="row" sx={tableBodyStyle}>
                      {stats?.totalOrders}
                    </TableCell>
                    <TableCell component="th" scope="row" sx={tableBodyStyle}>
                      ${stats?.totalAmount?.toLocaleString('es-AR')}
                    </TableCell>
                    <TableCell component="th" scope="row" sx={tableBodyStyle}>
                      <Button
                        variant="outlined"
                        startIcon={<PrintIcon />}
                        onClick={() => handleOpenPrintModal(stats)}
                        size="small"
                        sx={{
                          fontFamily: 'fontFamily.terciary',
                          borderColor: 'primary.main',
                          color: 'primary.main',
                          '&:hover': {
                            bgcolor: 'primary.secondary',
                          },
                        }}
                      >
                        Imprimir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
                fontFamily: 'fontFamily.primary',
                bgcolor: 'background.paper',
                color: 'text.primary',
              }}
            />
          )}
        </Paper>
      ) : (
        <Typography
          sx={{
            display: 'flex',
            alignContent: 'center',
            justifyContent: 'center',
            width: '100%',
            paddingTop: '10rem',
            fontFamily: 'fontFamily.primary',
          }}
        >
          NO HAY ESTADÍSTICAS DISPONIBLES.
        </Typography>
      )}

      {AlertComponent}

      {/* Modal de impresión del reporte diario */}
      {isPrintModalOpen && (
        <PrintDailySalesTicket
          open={isPrintModalOpen}
          onClose={handleClosePrintModal}
          dayStats={selectedDayStats}
          restaurantName={user.restaurantName || 'LOCAL'}
        />
      )}
    </Box>
  );
};
