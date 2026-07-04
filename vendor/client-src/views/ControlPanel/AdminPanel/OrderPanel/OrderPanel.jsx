import { useState, useEffect, useMemo, useCallback } from "react";

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
  Checkbox,
  TablePagination,
  Tabs,
  Tab,
  Chip,
} from "@mui/material";
// ICONS
import {
  MoreHoriz as MoreHorizIcon,
  Pending as PendingIcon,
  FactCheck as FactCheckIcon,
  DeliveryDining as DeliveryDiningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
// -----------------------

// ---- COMPONENTS ----
import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent.jsx";
import { PanelNavBar } from "@/components/PanelComponents/PanelNavBar/PanelNavBar.jsx";
import { ModalEditOrder } from "@/components/PanelComponents/ModalEditOrder/ModalEditOrder.jsx";
import { OrderInfo } from "./OrderInfo/OrderInfo.jsx";
import { AutoRefreshIndicator } from "./AutoRefreshIndicator/AutoRefreshIndicator.jsx";
import { OrderStatusIndicator } from "./OrderStatusIndicator/OrderStatusIndicator.jsx";
import { OrderSummaryIndicator } from "./OrderSummaryIndicator/OrderSummaryIndicator.jsx";
import { RiderCountIndicator } from "./RiderCountIndicator/RiderCountIndicator.jsx";
import { RiderSummaryIndicator } from "./RiderSummaryIndicator/RiderSummaryIndicator.jsx";
// ---------------------

// ---- CONTEXT ----
import { useOrders } from "@/context/Orders.jsx";
// -----------------

// ---- HOOKS ----
import { useAlert } from "@/hooks/Alert.jsx";
import { useAutoRefresh } from "@/hooks/AutoRefreshOrders.jsx";
// ---------------

// ---- UTILS ----
import { getDateNowDayjs, getTimeNowDayjs } from "@/utils/clientWorking.js";
// ---------------

// ---- STYLES ----
const tableHeadStyle = {
  fontFamily: "fontFamily.primary",
  bgcolor: "background.paper",
  color: "primary.main",
  textAlign: "center",
  fontWeight: "bold",
  py: 0.5,
};
// ----------------

const ORDER_STATUS = {
  TODOS: { color: "#f59e0b", icon: <MoreHorizIcon fontSize="small" /> },
  "PENDIENTE A CONFIRMAR": {
    color: "#ff9800",
    icon: <PendingIcon fontSize="small" />,
  }, // Rojo
  "EN PREPARACIÓN": {
    color: "#2196f3",
    icon: <FactCheckIcon fontSize="small" />,
  }, // Ámbar
  "EN ENVIO": {
    color: "#9c27b0",
    icon: <DeliveryDiningIcon fontSize="small" />,
  }, // Azul
  FINALIZADO: { color: "#4caf50", icon: <CheckCircleIcon fontSize="small" /> }, // Verde
  CANCELADO: { color: "#f44336", icon: <CancelIcon fontSize="small" /> }, // Gris
};

export const OrderPanel = ({ user, externalView }) => {
  const { AlertComponent, showAlert } = useAlert();
  const isElectronApp =
    typeof window !== "undefined" && Boolean(window.electronAPI);
  const [loading, setLoading] = useState(false);

  // REFRESH AUTOMÁTICO
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  // PAGINADO
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const activeTab = useMemo(() => {
    if (externalView === 2) return 0;
    if (externalView === 21) return 1;
    return 2;
  }, [externalView]);

  // TRAEMOS LAS ORDENES DEL CONTEXT
  const { orderState, getAllOrders, filterOrderByDate, getRidersByRestaurant } =
    useOrders();

  const allOrders = useMemo(() => orderState.orders || [], [orderState.orders]);
  const availableRiders = useMemo(
    () => orderState?.riders || [],
    [orderState?.riders],
  );

  // ESTADOS PARA EDITAR EL PEDIDO
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(null);

  const [selectedOrdersCheckbox, setSelectedOrdersCheckbox] = useState([]);

  const handleSelectOrders = (event, order) => {
    if (event.target.checked) {
      setSelectedOrdersCheckbox((prev) => [...prev, order]);
    } else {
      setSelectedOrdersCheckbox((prev) =>
        prev.filter((o) => o.id !== order.id),
      );
    }
  };

  // SELECTED PRODUCTS CHECKBOX
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedOrdersCheckbox([...filteredOrders]);
    } else {
      setSelectedOrdersCheckbox([]);
    }
  };

  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = useCallback((order, index) => {
    setAutoRefreshEnabled(false);
    setSelectedOrder(order);
    setSelectedOrderIndex(index);
    setOpenModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedOrder(null);
    setSelectedOrderIndex(null);
    setAutoRefreshEnabled(true);
    setOpenModal(false);
  }, []);

  // FILTRADO DE PEDIDOS
  const [statusFilter, setStatusFilter] = useState("TODOS");

  const handleStatusChange = (event, newValue) => {
    setStatusFilter(newValue);
    setPage(0);
    setSelectedOrdersCheckbox([]);
  };

  const filteredOrders = useMemo(() => {
    if (statusFilter === "TODOS") return allOrders;
    return allOrders.filter((order) => order.status === statusFilter);
  }, [allOrders, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = { TODOS: allOrders.length };
    allOrders.forEach((order) => {
      counts[order.status] = (counts[order.status] || 0) + 1;
    });
    return counts;
  }, [allOrders]);

  const fetchOrders = useCallback(
    async (isAutoRefresh = false) => {
      const userId = user?.id;
      if (!userId) return;

      if (isAutoRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        if (activeTab === 0) {
          const today = getDateNowDayjs();
          await filterOrderByDate(today.day, today.month, today.year, userId);
          await getRidersByRestaurant(userId);
        } else if (activeTab === 1) {
          const today = getDateNowDayjs();
          await filterOrderByDate("", today.month, today.year, userId);
        } else {
          await getAllOrders(null, userId);
        }

        if (!isAutoRefresh) {
          setSelectedOrdersCheckbox([]);
          setPage(0);
        }

        const time = getTimeNowDayjs();
        setLastRefresh(time);
      } catch (error) {
        showAlert(`Error al obtener los pedidos: ${error}`, "error");
      } finally {
        if (isAutoRefresh) {
          setIsRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [
      activeTab,
      filterOrderByDate,
      getRidersByRestaurant,
      getAllOrders,
      showAlert,
      user?.id,
    ],
  );

  // ✅ FUNCIÓN QUE SOLO SE EJECUTA SI ESTAMOS EN LA PESTAÑA DE HOY
  const fetchTodayOrdersOnly = useCallback(async () => {
    if (activeTab !== 0) return;
    await fetchOrders(true);
  }, [activeTab, fetchOrders]);

  // Auto-refresh hook
  const { startPolling, stopPolling, restartPolling, countdown } =
    useAutoRefresh(
      fetchTodayOrdersOnly,
      30000, // 30 segundos
      {
        enabled: autoRefreshEnabled && activeTab === 0,
        pauseOnHidden: true,
        onRefresh: () => {
          showAlert("Se actualizaron los pedidos automáticamente", "success");
        },
      },
    );

  const handleToggleAutoRefresh = () => {
    setAutoRefreshEnabled((prev) => !prev);
  };

  const handleManualRefresh = async () => {
    await fetchOrders(false);
  };

  useEffect(() => {
    fetchOrders(false);
  }, [fetchOrders]);

  useEffect(() => {
    if (activeTab === 0 && autoRefreshEnabled) {
      restartPolling();
    } else {
      stopPolling();
    }
  }, [activeTab, autoRefreshEnabled, restartPolling, stopPolling]);

  const totalOrders = allOrders.length;

  if (loading) return <LoadingComponent message={"Cargando pedidos..."} />;

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
      <PanelNavBar
        showAlert={showAlert}
        isOrderPanel={true}
        handleRefresh={handleManualRefresh}
        selectedOrdersCheckbox={selectedOrdersCheckbox}
        setAutoRefreshEnabled={setAutoRefreshEnabled}
      />

      {/* RIDERS */}
      {availableRiders.length > 0 && activeTab === 0 && (
        <Box sx={{ width: "100%", mb: 2 }}>
          <RiderCountIndicator
            totalOrders={allOrders}
            availableRiders={availableRiders}
          />
        </Box>
      )}

      {/* INDICADORES DE REFRESH/STATUS/TOTALAMOUNT */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 2,
          minHeight: 72,
        }}
      >
        {/* Indicador de Auto-refresh */}
        <Box sx={{ display: "flex", alignItems: "center", minWidth: 200 }}>
          {activeTab === 0 && (
            <AutoRefreshIndicator
              isEnabled={autoRefreshEnabled}
              onToggle={handleToggleAutoRefresh}
              lastRefresh={lastRefresh}
              isRefreshing={isRefreshing}
              countdown={countdown}
            />
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            ml: "auto",
          }}
        >
          <OrderStatusIndicator totalOrders={allOrders} />
          {activeTab === 0 && availableRiders?.length > 0 && (
            <RiderSummaryIndicator
              totalOrders={allOrders}
              availableRiders={availableRiders}
            />
          )}
          {(activeTab === 0 || activeTab === 1) && (
            <OrderSummaryIndicator
              totalOrders={allOrders}
              title={activeTab === 0 ? "SUBTOTAL DEL DIA" : "SUBTOTAL DEL MES"}
            />
          )}
        </Box>
      </Box>

      {/* PEDIDOS */}

      <Paper
        sx={{
          bgcolor: "background.paper",
          width: "100%",
          mb: 2,
          borderRadius: 2,
          overflow: isElectronApp ? "visible" : "hidden",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontFamily: "fontFamily.primary",
            display: "flex",
            justifyContent: "center",
            color: "text.primary",
            m: 1,
          }}
        >
          {activeTab === 0
            ? "PEDIDOS DE HOY"
            : activeTab === 1
              ? "PEDIDOS DEL MES"
              : "HISTORIAL DE PEDIDOS"}
        </Typography>

        {/* BARRA DE FILTROS POR ESTADO */}
        <Paper
          elevation={0}
          sx={{
            mb: 0.5,
            bgcolor: "background.paper",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Tabs
            value={statusFilter}
            onChange={handleStatusChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 1,
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "3px 3px 0 0",
                bgcolor: ORDER_STATUS[statusFilter]?.color || "primary.main",
              },
            }}
          >
            {Object.keys(ORDER_STATUS).map((status) => (
              <Tab
                key={status}
                value={status}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {/* ICONO */}
                    <Box
                      sx={{
                        display: "flex",
                        color:
                          statusFilter === status
                            ? ORDER_STATUS[status].color
                            : "text.disabled",
                      }}
                    >
                      {ORDER_STATUS[status].icon}
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "fontFamily.secondary",
                        fontSize: "0.75rem",
                      }}
                    >
                      {status}
                    </Typography>
                    {/* BADGE CON CONTADOR */}
                    {statusCounts[status] > 0 && (
                      <Chip
                        label={statusCounts[status]}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontFamily: "fontFamily.secondary",
                          fontSize: "0.60rem",
                          px: 0.7,
                          py: 0.1,
                          borderRadius: 5,
                          transition: "all 0.3s",
                          color:
                            statusFilter === status
                              ? ORDER_STATUS[status].color
                              : "text.primary",
                          borderColor:
                            statusFilter === status
                              ? ORDER_STATUS[status].color
                              : "text.secondary",
                        }}
                      />
                    )}
                  </Box>
                }
                sx={{
                  minHeight: 60,
                  textTransform: "none",
                  "&.Mui-selected": { color: ORDER_STATUS[status].color },
                }}
              />
            ))}
          </Tabs>
        </Paper>

        <TableContainer
          sx={{
            maxHeight: isElectronApp
              ? "none"
              : {
                  xs: "calc(100vh - 360px)",
                  md: "calc(100vh - 390px)",
                },
            minHeight: isElectronApp ? "auto" : 260,
            overflow: isElectronApp ? "visible" : "auto",
          }}
        >
          {filteredOrders.length > 0 ? (
            <Table
              stickyHeader
              aria-label="collapsible table"
              sx={{ minWidth: 1180 }}
            >
              <TableHead sx={{ bgcolor: "background.paper" }}>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={
                        selectedOrdersCheckbox.length > 0 &&
                        selectedOrdersCheckbox.length < filteredOrders.length
                      }
                      checked={
                        filteredOrders.length > 0 &&
                        selectedOrdersCheckbox.length === filteredOrders.length
                      }
                      onChange={handleSelectAll}
                      sx={{
                        color: "primary.main",
                        "&.Mui-checked": {
                          color: "primary.main",
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell sx={tableHeadStyle}>N° PEDIDO</TableCell>
                  <TableCell sx={tableHeadStyle}>CLIENTE</TableCell>
                  <TableCell sx={tableHeadStyle}>DIRECCIÓN</TableCell>
                  <TableCell sx={tableHeadStyle}>TOTAL</TableCell>
                  <TableCell sx={tableHeadStyle}>PUNTOS</TableCell>
                  <TableCell sx={tableHeadStyle}>FECHA/HORA</TableCell>
                  <TableCell sx={tableHeadStyle}>ENTREGA</TableCell>
                  <TableCell sx={tableHeadStyle}>ESTADO</TableCell>
                  <TableCell sx={tableHeadStyle}>MOD.</TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ bgcolor: "background.default" }}>
                {filteredOrders
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((order) => {
                    const globalIndex = allOrders.findIndex(
                      (o) => o.id === order.id,
                    );
                    return (
                      <OrderInfo
                        key={order.id}
                        order={order}
                        globalIndex={globalIndex}
                        totalInList={totalOrders}
                        handleSelectOrders={handleSelectOrders}
                        selectedOrdersCheckbox={selectedOrdersCheckbox}
                        handleOpenModal={handleOpenModal}
                      />
                    );
                  })}
              </TableBody>
            </Table>
          ) : (
            <Box sx={{ p: 5, textAlign: "center" }}>
              <Typography
                sx={{
                  fontFamily: "fontFamily.secondary",
                  color: "text.primary",
                }}
              >
                No hay pedidos con estado:
              </Typography>
              <Typography
                sx={{
                  fontFamily: "fontFamily.secondary",
                  color: ORDER_STATUS[statusFilter].color || "text.primary",
                }}
              >
                {statusFilter}
              </Typography>
            </Box>
          )}
        </TableContainer>
        {filteredOrders.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[10, 20, 30, 50, 100]}
            component="div"
            count={filteredOrders.length}
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
      </Paper>
      {/* MODAL EDIT ORDER */}
      <ModalEditOrder
        show={openModal}
        onClose={handleCloseModal}
        showAlert={showAlert}
        showOrder={selectedOrder}
        showOrderIndex={selectedOrderIndex}
      />
      {AlertComponent}
    </Box>
  );
};
