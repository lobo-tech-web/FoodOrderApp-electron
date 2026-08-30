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
} from "@mui/material";
// -----------------------

// ---- COMPONENTS ----
import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent.jsx";
import { PanelNavBar } from "@/components/PanelComponents/PanelNavBar/PanelNavBar.jsx";
import { ModalEditOrder } from "@/components/PanelComponents/ModalEditOrder/ModalEditOrder.jsx";
import { OrderInfo } from "./OrderInfo/OrderInfo.jsx";
import { OrderTableFilters } from "./OrderTableFilters/OrderTableFilters.jsx";
import { AutoRefreshIndicator } from "./AutoRefreshIndicator/AutoRefreshIndicator.jsx";
import { OrderStatusIndicator } from "./OrderStatusIndicator/OrderStatusIndicator.jsx";
import { OrderSummaryIndicator } from "./OrderSummaryIndicator/OrderSummaryIndicator.jsx";
import { RiderCountIndicator } from "./RiderCountIndicator/RiderCountIndicator.jsx";
import { RiderSummaryIndicator } from "./RiderSummaryIndicator/RiderSummaryIndicator.jsx";
import { ModalConfirmOrderPaid } from "@/components/PanelComponents/ModalConfirmOrderPaid/ModalConfirmOrderPaid.jsx";
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

export const OrderPanel = ({ user, externalView }) => {
  const isElectronApp =
    typeof window !== "undefined" && Boolean(window.electronAPI);
  const { AlertComponent, showAlert } = useAlert();
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
    if (externalView === 1) return 0;
    if (externalView === 11) return 1;
    return 2;
  }, [externalView]);

  // TRAEMOS LAS ORDENES DEL CONTEXT
  const {
    orderState,
    getAllOrders,
    filterOrderByDate,
    getRidersByRestaurant,
    updateOrder,
  } = useOrders();

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

  const [paymentConfirm, setPaymentConfirm] = useState({
    open: false,
    order: null,
    displayID: null,
  });

  const [payingOrderId, setPayingOrderId] = useState(null);

  const handleOpenPaymentConfirm = useCallback(
    (order, displayID) => {
      if (!order?.id) return;

      if (order.isPaid) {
        showAlert("Este pedido ya se encuentra pagado", "info");
        return;
      }

      if (order.status === "CANCELADO") {
        showAlert(
          "No se puede registrar el pago desde esta acción en un pedido cancelado",
          "warning",
        );
        return;
      }

      setPaymentConfirm({
        open: true,
        order,
        displayID,
      });
    },
    [showAlert],
  );

  const handleClosePaymentConfirm = useCallback(() => {
    if (payingOrderId) return;

    setPaymentConfirm({
      open: false,
      order: null,
      displayID: null,
    });
  }, [payingOrderId]);

  // FILTRADO DE PEDIDOS
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [orderTypeFilter, setOrderTypeFilter] = useState("TODOS");

  const handleStatusChange = (newValue) => {
    setStatusFilter(newValue);
    setPage(0);
    setSelectedOrdersCheckbox([]);
  };

  const handleOrderTypeChange = (newValue) => {
    setOrderTypeFilter(newValue);
    setPage(0);
    setSelectedOrdersCheckbox([]);
  };

  const handleClearTableFilters = () => {
    setStatusFilter("TODOS");
    setOrderTypeFilter("TODOS");
    setPage(0);
    setSelectedOrdersCheckbox([]);
  };

  const ordersFilteredByType = useMemo(() => {
    if (orderTypeFilter === "TODOS") return allOrders;

    return allOrders.filter((order) => order.orderType === orderTypeFilter);
  }, [allOrders, orderTypeFilter]);

  const filteredOrders = useMemo(() => {
    if (statusFilter === "TODOS") return ordersFilteredByType;

    return ordersFilteredByType.filter(
      (order) => order.status === statusFilter,
    );
  }, [ordersFilteredByType, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = {
      TODOS: ordersFilteredByType.length,
    };

    ordersFilteredByType.forEach((order) => {
      counts[order.status] = (counts[order.status] || 0) + 1;
    });

    return counts;
  }, [ordersFilteredByType]);

  const orderTypeCounts = useMemo(() => {
    const baseOrders =
      statusFilter === "TODOS"
        ? allOrders
        : allOrders.filter((order) => order.status === statusFilter);

    const counts = {
      TODOS: baseOrders.length,
    };

    baseOrders.forEach((order) => {
      counts[order.orderType] = (counts[order.orderType] || 0) + 1;
    });

    return counts;
  }, [allOrders, statusFilter]);

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

  const handleConfirmMarkPaid = useCallback(async () => {
    const targetOrder = paymentConfirm.order;
    if (!targetOrder?.id || targetOrder.isPaid || payingOrderId) {
      return;
    }

    setPayingOrderId(targetOrder.id);

    try {
      await updateOrder(targetOrder.id, {
        isPaid: true,
        auditReason: "Pedido marcado como pagado desde acceso rápido",
      });

      showAlert(
        `Pedido N° ${
          paymentConfirm.displayID || targetOrder.id
        } marcado como pagado`,
        "success",
      );

      setPaymentConfirm({
        open: false,
        order: null,
        displayID: null,
      });

      // Refresco silencioso:
      // no reemplaza la tabla por LoadingComponent.
      await fetchOrders(true);
    } catch (error) {
      showAlert(
        error?.message || "No se pudo marcar el pedido como pagado",
        "error",
      );
    } finally {
      setPayingOrderId(null);
    }
  }, [paymentConfirm, payingOrderId, updateOrder, showAlert, fetchOrders]);

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
        <OrderTableFilters
          statusFilter={statusFilter}
          orderTypeFilter={orderTypeFilter}
          statusCounts={statusCounts}
          orderTypeCounts={orderTypeCounts}
          totalFilteredOrders={filteredOrders.length}
          onStatusChange={handleStatusChange}
          onOrderTypeChange={handleOrderTypeChange}
          onClearFilters={handleClearTableFilters}
        />

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
                        onMarkPaid={handleOpenPaymentConfirm}
                        paymentUpdating={payingOrderId === order.id}
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
                  fontSize: "1rem",
                  mb: 1,
                }}
              >
                No hay pedidos para los filtros seleccionados
              </Typography>
              <Typography
                sx={{
                  fontFamily: "fontFamily.secondary",
                  color: "text.secondary",
                  fontSize: "0.9rem",
                }}
              >
                Estado:{" "}
                <Box
                  component="span"
                  sx={{ color: "primary.main", fontWeight: 800 }}
                >
                  {statusFilter}
                </Box>
                {" · "}
                Entrega:{" "}
                <Box
                  component="span"
                  sx={{ color: "primary.main", fontWeight: 800 }}
                >
                  {orderTypeFilter === "TODOS" ? "TODAS" : orderTypeFilter}
                </Box>
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

      <ModalConfirmOrderPaid
        open={paymentConfirm.open}
        order={paymentConfirm.order}
        displayID={paymentConfirm.displayID}
        loading={Boolean(payingOrderId)}
        onClose={handleClosePaymentConfirm}
        onConfirm={handleConfirmMarkPaid}
      />
      {/* MODAL EDIT ORDER */}
      <ModalEditOrder
        show={openModal}
        onClose={handleCloseModal}
        showAlert={showAlert}
        showOrder={selectedOrder}
        showOrderIndex={selectedOrderIndex}
        onOrderUpdated={() => fetchOrders(true)}
      />
      {AlertComponent}
    </Box>
  );
};
