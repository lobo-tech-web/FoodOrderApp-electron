import { useState, useEffect, useMemo, useCallback } from "react";

// ---- Material UI ----
import {
  Alert,
  Box,
  Checkbox,
  Paper,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
// -------------------

// ---- CONTEXT ----
import { useOrders } from "@/context/Orders.jsx";
// -----------------

// ---- HOOKS ----
import { useOrderRealtime } from "@/hooks/useOrderRealtime.js";
import { useOrderPanelData } from "@/hooks/useOrderPanelData.js";
import { getRidersByRestaurantServices } from "@/services/riders.js";
// ---------------

// ---- Components ----
import { StaffOrderActionsBar } from "./StaffOrderActionsBar/StaffOrderActionsBar.jsx";
import { OrderInfo } from "../../AdminPanel/OrderPanel/OrderInfo/OrderInfo.jsx";
import { OrderTableFilters } from "../../AdminPanel/OrderPanel/OrderTableFilters/OrderTableFilters.jsx";
import { OrderStatusIndicator } from "../../AdminPanel/OrderPanel/OrderStatusIndicator/OrderStatusIndicator.jsx";
import { RiderCountIndicator } from "../../AdminPanel/OrderPanel/RiderCountIndicator/RiderCountIndicator.jsx";
import { ModalEditOrder } from "@/components/PanelComponents/ModalEditOrder/ModalEditOrder.jsx";
import { ModalConfirmOrderPaid } from "@/components/PanelComponents/ModalConfirmOrderPaid/ModalConfirmOrderPaid.jsx";
// --------------------

// ---- Utils ----
import { getDateNowDayjs } from "@/utils/clientWorking.js";
import { getConfiguredPaymentMethods } from "@/utils/components/PaymentUtils.jsx";
import {
  isTerminalOrderStatus,
  hasOrderPermission,
} from "@/utils/orderEditRules.js";
// ---------------

// ---- Styles ----
const tableHeadStyle = {
  fontFamily: "fontFamily.primary",
  bgcolor: "background.paper",
  color: "primary.main",
  textAlign: "center",
  py: 0.5,
};
// ----------------

export const StaffOrderPanel = ({
  user,
  cashSession,
  cashRegisterId,
  showAlert,
}) => {
  const isElectronApp =
    typeof window !== "undefined" && Boolean(window.electronAPI);

  const [navbarHeight, setNavbarHeight] = useState(0);
  const [navbarModals, setNavbarModals] = useState({
    createOrder: false,
    editArrayOrders: false,
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const [period, setPeriod] = useState("day");
  const { filterOrderByDate, updateOrder } = useOrders();
  const restaurantId = user?.role === "staff" ? user.restaurantId : user?.id;
  const canReadOrders = hasOrderPermission(user, "read");
  const canUpdateStatus = hasOrderPermission(user, "updateStatus");
  const canMarkPaid = hasOrderPermission(user, "markPaid");

  const { connection, hasUpdates, notificationVersion, acknowledgeUpdates } =
    useOrderRealtime({
      restaurantId: canReadOrders ? restaurantId : null,
    });

  const query = useMemo(() => {
    const { day, month, year } = getDateNowDayjs();
    return {
      restaurantId: canReadOrders ? restaurantId : null,
      mode: "date",
      period,
      date: year + "-" + month + "-" + day,
    };
  }, [restaurantId, canReadOrders, period]);

  const loadOrders = useCallback(
    (requested) => {
      const [year, month, day] = requested.date.split("-");
      return filterOrderByDate(
        requested.period === "day" ? day : "",
        month,
        year,
        requested.restaurantId,
        { updateState: false },
      );
    },
    [filterOrderByDate],
  );

  const onLoadError = useCallback(
    (error) => showAlert?.(error?.message || String(error), "error"),
    [showAlert],
  );

  const [selectedOrderIds, setSelectedOrderIds] = useState([]);

  const {
    orders: allOrders,
    riders: availableRiders,
    isRefreshing,
    lastRefresh,
    isProtected,
    refresh,
    setInteractionBlocked,
  } = useOrderPanelData({
    query,
    loadOrders,
    loadRiders: getRidersByRestaurantServices,
    autoRefreshEnabled: selectedOrderIds.length === 0,
    onError: onLoadError,
    onSnapshot: acknowledgeUpdates,
  });

  const selectedOrdersCheckbox = useMemo(
    () => allOrders.filter((order) => selectedOrderIds.includes(order.id)),
    [allOrders, selectedOrderIds],
  );

  const setSelectedOrdersCheckbox = useCallback(
    (value) => {
      setSelectedOrderIds((previous) => {
        const previousOrders = allOrders.filter((order) =>
          previous.includes(order.id),
        );
        const next =
          typeof value === "function" ? value(previousOrders) : value;
        return next.map((order) => order.id);
      });
    },
    [allOrders],
  );
  const fetchOrders = useCallback(() => refresh(), [refresh]);

  const changeNavbarModal = useCallback(
    (modal, open) => {
      setInteractionBlocked(modal, open);
      setNavbarModals((current) => ({ ...current, [modal]: open }));
    },
    [setInteractionBlocked],
  );

  const handleOrdersUpdated = useCallback((ids) => {
    setSelectedOrderIds((previous) =>
      previous.filter((id) => !ids.includes(id)),
    );
  }, []);

  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [orderTypeFilter, setOrderTypeFilter] = useState("TODOS");

  const resetFilterSelection = () => {
    setPage(0);
    setSelectedOrderIds([]);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    resetFilterSelection();
  };

  const handleOrderTypeChange = (value) => {
    setOrderTypeFilter(value);
    resetFilterSelection();
  };

  const handleClearFilters = () => {
    setStatusFilter("TODOS");
    setOrderTypeFilter("TODOS");
    resetFilterSelection();
  };

  const ordersFilteredByType = useMemo(
    () =>
      orderTypeFilter === "TODOS"
        ? allOrders
        : allOrders.filter((order) => order.orderType === orderTypeFilter),
    [allOrders, orderTypeFilter],
  );

  const filteredOrders = useMemo(
    () =>
      statusFilter === "TODOS"
        ? ordersFilteredByType
        : ordersFilteredByType.filter((order) => order.status === statusFilter),
    [ordersFilteredByType, statusFilter],
  );

  const displayedPage = Math.min(
    page,
    Math.max(0, Math.ceil(filteredOrders.length / rowsPerPage) - 1),
  );

  const statusCounts = useMemo(() => {
    const counts = { TODOS: ordersFilteredByType.length };
    ordersFilteredByType.forEach((order) => {
      counts[order.status] = (counts[order.status] || 0) + 1;
    });
    return counts;
  }, [ordersFilteredByType]);

  const orderTypeCounts = useMemo(() => {
    const base =
      statusFilter === "TODOS"
        ? allOrders
        : allOrders.filter((order) => order.status === statusFilter);
    const counts = { TODOS: base.length };
    base.forEach((order) => {
      counts[order.orderType] = (counts[order.orderType] || 0) + 1;
    });
    return counts;
  }, [allOrders, statusFilter]);

  const isCashOpen = Boolean(
    cashRegisterId &&
    cashSession?.id &&
    cashSession.status === "OPEN" &&
    String(cashSession.cashRegisterId) === String(cashRegisterId),
  );

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(null);
  const [openOrderModal, setOpenOrderModal] = useState(false);

  const handleOpenOrderModal = useCallback(
    (order, index) => {
      setInteractionBlocked("editOrder", true);
      setSelectedOrder(order);
      setSelectedOrderIndex(index);
      setOpenOrderModal(true);
    },
    [setInteractionBlocked],
  );

  const handleCloseOrderModal = useCallback(() => {
    setSelectedOrder(null);
    setSelectedOrderIndex(null);
    setInteractionBlocked("editOrder", false);
    setOpenOrderModal(false);
  }, [setInteractionBlocked]);

  const [payingOrderId, setPayingOrderId] = useState(null);

  const [paymentConfirm, setPaymentConfirm] = useState({
    open: false,
    order: null,
    displayID: null,
  });

  const handleOpenPaymentConfirm = useCallback(
    (order, displayID) => {
      if (!order?.id) return;

      if (!canMarkPaid) {
        showAlert?.("No tienes permisos para registrar cobros", "warning");
        return;
      }

      if (!isCashOpen) {
        showAlert?.(
          "Debes seleccionar una caja abierta para registrar el cobro",
          "warning",
        );
        return;
      }

      if (order.isPaid) {
        showAlert?.("Este pedido ya se encuentra pagado", "info");
        return;
      }

      if (order.status === "CANCELADO") {
        showAlert?.(
          "No se puede registrar el pago desde esta acción en un pedido cancelado",
          "warning",
        );
        return;
      }

      setInteractionBlocked("payment", true);
      setPaymentConfirm({
        open: true,
        order,
        displayID,
      });
    },
    [canMarkPaid, isCashOpen, showAlert, setInteractionBlocked],
  );

  const handleClosePaymentConfirm = useCallback(() => {
    if (payingOrderId) return;

    setPaymentConfirm({
      open: false,
      order: null,
      displayID: null,
    });
    setInteractionBlocked("payment", false);
  }, [payingOrderId, setInteractionBlocked]);

  const selectableOrders = useMemo(() => {
    if (!isCashOpen || !canUpdateStatus) return [];

    return filteredOrders.filter(
      (order) => !isTerminalOrderStatus(order.status),
    );
  }, [filteredOrders, isCashOpen, canUpdateStatus]);

  const handleSelectOrders = (event, order) => {
    if (!isCashOpen || !canUpdateStatus) return;

    if (isTerminalOrderStatus(order.status)) return;

    if (event.target.checked) {
      setSelectedOrdersCheckbox((prev) => [...prev, order]);
    } else {
      setSelectedOrdersCheckbox((prev) =>
        prev.filter((o) => o.id !== order.id),
      );
    }
  };

  const handleConfirmMarkPaid = useCallback(
    async (payments) => {
      const targetOrder = paymentConfirm.order;
      if (!targetOrder?.id || targetOrder.isPaid || payingOrderId) {
        return;
      }

      if (!canMarkPaid) {
        showAlert?.("No tienes permisos para registrar cobros", "warning");
        return;
      }

      if (!isCashOpen) {
        showAlert(
          "Debes seleccionar una caja abierta para registrar el cobro",
          "warning",
        );
        return;
      }

      setPayingOrderId(targetOrder.id);

      try {
        await updateOrder(targetOrder.id, {
          isPaid: true,
          cashRegisterId,
          ...(targetOrder.paymentMethod === "COMBINADO" ? { payments } : {}),
          auditReason: "Pedido marcado como pagado desde acceso rápido",
        });

        showAlert(
          `Pedido N° ${paymentConfirm.displayID || targetOrder.id} marcado como pagado`,
          "success",
        );

        setPaymentConfirm({
          open: false,
          order: null,
          displayID: null,
        });

        await fetchOrders();
        setInteractionBlocked("payment", false);
      } catch (error) {
        const errorMessage =
          typeof error === "string"
            ? error
            : error?.message || "No se pudo marcar el pedido como pagado";
        showAlert(errorMessage, "error");
      } finally {
        setPayingOrderId(null);
      }
    },
    [
      canMarkPaid,
      isCashOpen,
      paymentConfirm,
      payingOrderId,
      cashRegisterId,
      updateOrder,
      showAlert,
      fetchOrders,
      setInteractionBlocked,
    ],
  );

  // SELECTED PRODUCTS CHECKBOX
  const handleSelectAll = (event) => {
    if (!isCashOpen || !canUpdateStatus) return;

    if (event.target.checked) {
      setSelectedOrdersCheckbox([...selectableOrders]);
    } else {
      setSelectedOrdersCheckbox([]);
    }
  };

  useEffect(() => {
    setPage((previous) =>
      Math.min(
        previous,
        Math.max(0, Math.ceil(filteredOrders.length / rowsPerPage) - 1),
      ),
    );
  }, [filteredOrders.length, rowsPerPage]);

  useEffect(() => {
    if (notificationVersion > 0) refresh({ automatic: true });
  }, [notificationVersion, refresh]);

  useEffect(() => {
    setSelectedOrderIds((previous) =>
      previous.filter((id) => allOrders.some((order) => order.id === id)),
    );
  }, [allOrders]);

  useEffect(() => {
    setSelectedOrderIds([]);
    setPage(0);
  }, [restaurantId]);

  if (!canReadOrders) {
    return (
      <Alert severity="warning">
        No tenés permisos para consultar pedidos.
      </Alert>
    );
  }

  return (
    <Box
      data-staff-order-panel
      sx={{
        width: "100%",
        height: isElectronApp ? "calc(100vh - 112px)" : "auto",
        overflowY: isElectronApp ? "auto" : "visible",
        overflowX: isElectronApp ? "auto" : "visible",
        pr: isElectronApp ? 1 : 0,
        pb: isElectronApp ? 3 : 0,
      }}
    >
      <StaffOrderActionsBar
        user={user}
        cashSession={cashSession}
        cashRegisterId={cashRegisterId}
        selectedOrders={selectedOrdersCheckbox}
        loading={isRefreshing}
        period={period}
        onPeriodChange={(nextPeriod) => {
          setPeriod(nextPeriod);
          handleClearFilters();
        }}
        periodDisabled={isProtected}
        onRefresh={fetchOrders}
        modalState={navbarModals}
        onModalChange={changeNavbarModal}
        onOrdersUpdated={handleOrdersUpdated}
        onHeightChange={setNavbarHeight}
        realtime={{
          connection,
          hasUpdates,
          isProtected: isProtected || selectedOrderIds.length > 0,
          isRefreshing,
          lastRefresh,
          onRefresh: fetchOrders,
        }}
        showAlert={showAlert}
      />

      <LinearProgress
        aria-label="Actualizando pedidos"
        sx={{ visibility: isRefreshing ? "visible" : "hidden", mb: 1 }}
      />

      <Box
        sx={{
          display: "flex",
          alignItems: "stretch",
          flexWrap: "wrap",
          gap: 2,
          mb: 2,
        }}
      >
        <OrderStatusIndicator
          totalOrders={allOrders}
          sx={{ flex: "1 1 300px", minWidth: 0 }}
        />

        {availableRiders.length > 0 && period === "day" && (
          <RiderCountIndicator
            totalOrders={allOrders}
            availableRiders={availableRiders}
          />
        )}
      </Box>

      <Paper
        elevation={0}
        sx={{
          bgcolor: "background.main",
          width: "100%",
          mb: 2,
          borderRadius: 2,
          overflow: "hidden",
        }}
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
          {period === "day" ? "PEDIDOS DE HOY" : "PEDIDOS DEL MES"}
        </Typography>

        <OrderTableFilters
          statusFilter={statusFilter}
          orderTypeFilter={orderTypeFilter}
          statusCounts={statusCounts}
          orderTypeCounts={orderTypeCounts}
          totalFilteredOrders={filteredOrders.length}
          onStatusChange={handleStatusChange}
          onOrderTypeChange={handleOrderTypeChange}
          onClearFilters={handleClearFilters}
        />

        <TableContainer
          sx={{
            maxHeight: isElectronApp
              ? "none"
              : { xs: "calc(100vh - 360px)", md: "calc(100vh - 390px)" },
            minHeight: isElectronApp ? "auto" : 260,
            overflow: isElectronApp ? "visible" : "auto",
            border: "1px solid",
            borderColor: "background.main",
          }}
        >
          {filteredOrders.length > 0 ? (
            <Table
              stickyHeader
              aria-label="collapsible table"
              sx={{
                minWidth: 1040,
                "& .MuiTableCell-stickyHeader": {
                  top: isElectronApp ? navbarHeight : 0,
                },
              }}
            >
              <TableHead sx={{ bgcolor: "background.paper" }}>
                <TableRow>
                  <TableCell
                    padding="checkbox"
                    sx={{ bgcolor: "background.paper" }}
                  >
                    <Checkbox
                      disabled={!isCashOpen || !canUpdateStatus}
                      indeterminate={
                        selectedOrdersCheckbox.length > 0 &&
                        selectedOrdersCheckbox.length < selectableOrders.length
                      }
                      checked={
                        selectableOrders.length > 0 &&
                        selectedOrdersCheckbox.length ===
                          selectableOrders.length
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
                  <TableCell sx={tableHeadStyle}>PUNTOS</TableCell>
                  <TableCell sx={tableHeadStyle}>PAGO</TableCell>
                  <TableCell sx={tableHeadStyle}>TOTAL</TableCell>
                  <TableCell sx={tableHeadStyle}>FECHA/HORA</TableCell>
                  <TableCell sx={tableHeadStyle}>ENTREGA</TableCell>
                  <TableCell sx={tableHeadStyle}>ESTADO</TableCell>
                  <TableCell sx={tableHeadStyle}>MODIFICAR</TableCell>
                </TableRow>
              </TableHead>

              <TableBody sx={{ bgcolor: "background.default" }}>
                {filteredOrders
                  .slice(
                    displayedPage * rowsPerPage,
                    displayedPage * rowsPerPage + rowsPerPage,
                  )
                  .map((order) => {
                    const globalIndex = allOrders.findIndex(
                      (o) => o.id === order.id,
                    );
                    const terminal = isTerminalOrderStatus(order.status);

                    return (
                      <OrderInfo
                        key={order.id}
                        order={order}
                        globalIndex={globalIndex}
                        totalInList={allOrders.length}
                        handleSelectOrders={handleSelectOrders}
                        selectedOrdersCheckbox={selectedOrdersCheckbox}
                        handleOpenModal={handleOpenOrderModal}
                        disableSelection={
                          !isCashOpen || !canUpdateStatus || terminal
                        }
                        disableEdit={false}
                        onMarkPaid={handleOpenPaymentConfirm}
                        paymentUpdating={payingOrderId === order.id}
                      />
                    );
                  })}
              </TableBody>
            </Table>
          ) : (
            <Box sx={{ p: 5, textAlign: "center" }}>
              <Typography sx={{ fontFamily: "fontFamily.primary" }}>
                {isRefreshing
                  ? "CARGANDO PEDIDOS..."
                  : "NO HAY PEDIDOS CON LOS FILTROS SELECCIONADOS"}
              </Typography>

              {!isRefreshing && (
                <Typography
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    color: "primary.main",
                  }}
                >
                  Estado: {statusFilter} · Entrega: {orderTypeFilter}
                </Typography>
              )}
            </Box>
          )}
        </TableContainer>

        {filteredOrders.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[10, 20, 30, 50, 100]}
            component="div"
            count={filteredOrders.length}
            rowsPerPage={rowsPerPage}
            page={displayedPage}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(Number.parseInt(event.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Mostrar:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} de ${count}`
            }
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
        enabledPaymentMethods={getConfiguredPaymentMethods(user)}
      />

      <ModalEditOrder
        show={openOrderModal}
        onClose={handleCloseOrderModal}
        showAlert={showAlert}
        showOrder={selectedOrder}
        showOrderIndex={selectedOrderIndex}
        cashSession={cashSession}
        cashRegisterId={cashRegisterId}
        onOrderUpdated={fetchOrders}
      />
    </Box>
  );
};
