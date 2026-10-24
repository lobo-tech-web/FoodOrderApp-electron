import { useState, useEffect, useMemo, useCallback } from "react";

// ---- MATERIAL UI ----
import {
  Alert,
  Box,
  Checkbox,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
} from "@mui/material";
// -----------------------

// ---- COMPONENTS ----
import { AdminOrderNavbar } from "./AdminOrderNavbar/AdminOrderNavbar.jsx";
import { ModalEditOrder } from "@/components/PanelComponents/ModalEditOrder/ModalEditOrder.jsx";
import { OrderInfo } from "./OrderInfo/OrderInfo.jsx";
import { OrderTableFilters } from "./OrderTableFilters/OrderTableFilters.jsx";
import { AutoRefreshIndicator } from "./AutoRefreshIndicator/AutoRefreshIndicator.jsx";
import { OrderStatusIndicator } from "./OrderStatusIndicator/OrderStatusIndicator.jsx";
import { OrderSummaryIndicator } from "./OrderSummaryIndicator/OrderSummaryIndicator.jsx";
import { RiderCountIndicator } from "./RiderCountIndicator/RiderCountIndicator.jsx";
import { RiderSummaryIndicator } from "./RiderSummaryIndicator/RiderSummaryIndicator.jsx";
import { ModalConfirmOrderPaid } from "@/components/PanelComponents/ModalConfirmOrderPaid/ModalConfirmOrderPaid.jsx";
import { ModalConfirmCancelOrderPayment } from "@/components/PanelComponents/ModalConfirmCancelOrderPayment/ModalConfirmCancelOrderPayment.jsx";
// ---------------------

// ---- CONTEXT ----
import { useOrders } from "@/context/Orders.jsx";
// -----------------

// ---- HOOKS ----
import { useAlert } from "@/hooks/Alert.jsx";
import { useAutoRefresh } from "@/hooks/AutoRefreshOrders.jsx";
// ---------------

// ---- UTILS ----
import { useOrderPanelData } from "@/hooks/useOrderPanelData.js";
import { getRidersByRestaurantServices } from "@/services/riders.js";
import {
  createOrderPanelFilters,
  getOrderPanelQuery,
  getOrderPanelTitle,
} from "./orderPanelFilters.js";
import { getConfiguredPaymentMethods } from "@/utils/components/PaymentUtils.jsx";
// ---------------

// ---- STYLES ----
const tableHeadStyle = {
  fontFamily: "fontFamily.primary",
  bgcolor: "background.paper",
  color: "primary.main",
  textAlign: "center",
  py: 0.5,
};
// ----------------

export const OrderPanel = ({
  user,
  externalView,
  cashSession = null,
  cashRegisterId = null,
}) => {
  const isElectronApp =
    typeof window !== "undefined" && Boolean(window.electronAPI);
  const { AlertComponent, showAlert } = useAlert();

  const [filters, setFilters] = useState(() =>
    createOrderPanelFilters(externalView),
  );

  const currentFilters =
    filters.view === externalView
      ? filters
      : createOrderPanelFilters(externalView);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [navbarModals, setNavbarModals] = useState({
    createOrder: false,
    editArrayOrders: false,
  });

  // REFRESH AUTOMÁTICO
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

  // TRAEMOS LAS ORDENES DEL CONTEXT
  const {
    getAllOrders,
    filterOrderByDate,
    filterOrderByNamePhone,
    updateOrder,
  } = useOrders();

  const query = useMemo(
    () => getOrderPanelQuery(currentFilters, user?.id),
    [
      currentFilters.mode,
      currentFilters.searchTerm,
      currentFilters.period,
      currentFilters.date,
      user?.id,
    ],
  );

  const loadOrders = useCallback(
    (requested) => {
      const readOnly = { updateState: false };
      if (requested.mode === "search") {
        const numeric = /^\d+$/.test(requested.searchTerm);
        return filterOrderByNamePhone(
          numeric ? "" : requested.searchTerm,
          numeric ? requested.searchTerm : "",
          requested.restaurantId,
          readOnly,
        );
      }
      if (requested.period === "all")
        return getAllOrders(null, requested.restaurantId, readOnly);
      const [year, month, day] = requested.date.split("-");
      return filterOrderByDate(
        requested.period === "month" ? "" : day,
        month,
        year,
        requested.restaurantId,
        readOnly,
      );
    },
    [getAllOrders, filterOrderByDate, filterOrderByNamePhone],
  );

  const onLoadError = useCallback(
    (error) => showAlert(error?.message || String(error), "error"),
    [showAlert],
  );

  const {
    orders: allOrders,
    riders: availableRiders,
    isRefreshing,
    lastRefresh,
    isProtected,
    pendingUpdates,
    refresh,
    setInteractionBlocked,
  } = useOrderPanelData({
    query,
    loadOrders,
    loadRiders: getRidersByRestaurantServices,
    autoRefreshEnabled,
    onError: onLoadError,
  });

  const fetchOrders = useCallback(() => refresh(), [refresh]);
  const changeNavbarModal = useCallback(
    (modal, open) => {
      setInteractionBlocked(modal, open);
      setNavbarModals((current) => ({ ...current, [modal]: open }));
    },
    [setInteractionBlocked],
  );

  // ESTADOS PARA EDITAR EL PEDIDO
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(null);

  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const selectedOrdersCheckbox = useMemo(
    () => allOrders.filter((order) => selectedOrderIds.includes(order.id)),
    [allOrders, selectedOrderIds],
  );

  useEffect(() => {
    setSelectedOrderIds((previous) =>
      previous.filter((id) => allOrders.some((order) => order.id === id)),
    );
  }, [allOrders]);
  const setSelectedOrdersCheckbox = useCallback((value) => {
    if (Array.isArray(value))
      setSelectedOrderIds(value.map((order) => order.id));
  }, []);

  useEffect(() => {
    setFilters(createOrderPanelFilters(externalView));
    setSelectedOrderIds([]);
    setPage(0);
  }, [externalView, user?.id]);

  const changeFilters = useCallback(
    (patch) => {
      setFilters((previous) => ({
        ...(previous.view === externalView
          ? previous
          : createOrderPanelFilters(externalView)),
        ...patch,
      }));
      setSelectedOrderIds([]);
      setPage(0);
    },
    [externalView],
  );

  const handleSelectOrders = (event, order) => {
    if (event.target.checked) {
      setSelectedOrderIds((previous) =>
        previous.includes(order.id) ? previous : [...previous, order.id],
      );
    } else {
      setSelectedOrderIds((previous) =>
        previous.filter((id) => id !== order.id),
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

  const handleOpenModal = useCallback(
    (order, index) => {
      setInteractionBlocked("editOrder", true);
      setSelectedOrder(order);
      setSelectedOrderIndex(index);
      setOpenModal(true);
    },
    [setInteractionBlocked],
  );

  const handleCloseModal = useCallback(() => {
    setSelectedOrder(null);
    setSelectedOrderIndex(null);
    setOpenModal(false);
    setInteractionBlocked("editOrder", false);
  }, [setInteractionBlocked]);

  const [paymentConfirm, setPaymentConfirm] = useState({
    open: false,
    order: null,
    displayID: null,
  });
  const [payingOrderId, setPayingOrderId] = useState(null);

  const [cancelingPaymentOrderId, setCancelingPaymentOrderId] = useState(null);
  const [cancelPaymentConfirm, setCancelPaymentConfirm] = useState({
    open: false,
    order: null,
    displayID: null,
  });

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

      setInteractionBlocked("payment", true);
      setPaymentConfirm({
        open: true,
        order,
        displayID,
      });
    },
    [showAlert, setInteractionBlocked],
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

  const handleOpenCancelPaymentConfirm = useCallback(
    (order, displayID) => {
      if (user?.role !== "admin") {
        showAlert(
          "Solo el administrador puede cancelar el pago de un pedido",
          "warning",
        );
        return;
      }

      if (!order?.id) return;
      if (!order.isPaid) {
        showAlert("Este pedido ya se encuentra pendiente de pago", "info");
        return;
      }

      setInteractionBlocked("cancelPayment", true);
      setCancelPaymentConfirm({
        open: true,
        order,
        displayID,
      });
    },
    [user?.role, showAlert, setInteractionBlocked],
  );

  const handleCloseCancelPaymentConfirm = useCallback(() => {
    if (cancelingPaymentOrderId) return;

    setCancelPaymentConfirm({
      open: false,
      order: null,
      displayID: null,
    });
    setInteractionBlocked("cancelPayment", false);
  }, [cancelingPaymentOrderId, setInteractionBlocked]);

  const statusFilter = currentFilters.status;
  const orderTypeFilter = currentFilters.orderType;
  const handleStatusChange = (status) => changeFilters({ status });
  const handleOrderTypeChange = (orderType) => changeFilters({ orderType });
  const handleClearTableFilters = () =>
    changeFilters({ status: "TODOS", orderType: "TODOS" });

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

    const counts = { TODOS: baseOrders.length };

    baseOrders.forEach((order) => {
      counts[order.orderType] = (counts[order.orderType] || 0) + 1;
    });

    return counts;
  }, [allOrders, statusFilter]);

  const handleConfirmMarkPaid = useCallback(
    async (payments) => {
      const targetOrder = paymentConfirm.order;

      if (!targetOrder?.id || targetOrder.isPaid || payingOrderId) return;

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
            : error?.message || "Error desconocido";
        showAlert(errorMessage, "error");
      } finally {
        setPayingOrderId(null);
      }
    },
    [
      paymentConfirm,
      payingOrderId,
      cashRegisterId,
      updateOrder,
      showAlert,
      fetchOrders,
      setInteractionBlocked,
    ],
  );

  const handleConfirmCancelPayment = useCallback(async () => {
    const targetOrder = cancelPaymentConfirm.order;

    if (
      user?.role !== "admin" ||
      !targetOrder?.id ||
      !targetOrder.isPaid ||
      cancelingPaymentOrderId
    ) {
      return;
    }

    setCancelingPaymentOrderId(targetOrder.id);

    try {
      await updateOrder(targetOrder.id, {
        isPaid: false,
        auditReason: "Pago cancelado desde el acceso rápido del pedido",
      });

      showAlert(
        `El pago del pedido N° ${
          cancelPaymentConfirm.displayID || targetOrder.id
        } fue cancelado`,
        "success",
      );

      setCancelPaymentConfirm({
        open: false,
        order: null,
        displayID: null,
      });

      await fetchOrders();
      setInteractionBlocked("cancelPayment", false);
    } catch (error) {
      const errorMessage =
        typeof error === "string"
          ? error
          : error?.message || "No se pudo cancelar el pago";

      showAlert(errorMessage, "error");
    } finally {
      setCancelingPaymentOrderId(null);
    }
  }, [
    user?.role,
    cancelPaymentConfirm,
    cancelingPaymentOrderId,
    updateOrder,
    showAlert,
    fetchOrders,
    setInteractionBlocked,
  ]);

  const { countdown } = useAutoRefresh(
    () => refresh({ automatic: true }),
    30000,
    {
      enabled:
        autoRefreshEnabled &&
        !isProtected &&
        currentFilters.mode !== "search" &&
        currentFilters.period === "day",
      pauseOnHidden: true,
    },
  );
  const handleToggleAutoRefresh = () =>
    setAutoRefreshEnabled((previous) => !previous);
  const handleManualRefresh = useCallback(() => refresh(), [refresh]);
  const displayedPage = Math.min(
    page,
    Math.max(0, Math.ceil(filteredOrders.length / rowsPerPage) - 1),
  );
  useEffect(() => {
    setPage((previous) =>
      Math.min(
        previous,
        Math.max(0, Math.ceil(filteredOrders.length / rowsPerPage) - 1),
      ),
    );
  }, [filteredOrders.length, rowsPerPage]);

  const totalOrders = allOrders.length;

  return (
    <Box
      data-order-panel
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
      <AdminOrderNavbar
        handleRefresh={handleManualRefresh}
        selectedOrdersCheckbox={selectedOrdersCheckbox}
        filters={currentFilters}
        onSearchInputChange={(searchInput) =>
          setFilters((previous) => ({ ...previous, searchInput }))
        }
        onSearch={() => {
          const searchTerm = currentFilters.searchInput.trim();
          changeFilters({
            mode: searchTerm ? "search" : "date",
            searchTerm,
            searchInput: searchTerm,
          });
        }}
        onClearSearch={() =>
          changeFilters({ mode: "date", searchInput: "", searchTerm: "" })
        }
        onDateChange={(patch) =>
          changeFilters({
            ...patch,
            mode: "date",
            searchInput: "",
            searchTerm: "",
          })
        }
        disabled={isProtected}
        refreshing={isRefreshing}
        modalState={navbarModals}
        onModalChange={changeNavbarModal}
        onHeightChange={setNavbarHeight}
        cashSession={cashSession}
        cashRegisterId={cashRegisterId}
        showAlert={showAlert}
      />

      <LinearProgress
        aria-label="Actualizando pedidos"
        sx={{ visibility: isRefreshing ? "visible" : "hidden", mb: 1 }}
      />

      {pendingUpdates && isProtected && (
        <Alert severity="info" sx={{ mb: 1 }}>
          Actualización pendiente, se aplicará al terminar la operación.
        </Alert>
      )}

      {/* RIDERS */}
      {availableRiders.length > 0 &&
        currentFilters.mode !== "search" &&
        currentFilters.period === "day" && (
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
          {currentFilters.mode !== "search" &&
            currentFilters.period === "day" && (
              <AutoRefreshIndicator
                isEnabled={autoRefreshEnabled}
                onToggle={handleToggleAutoRefresh}
                lastRefresh={lastRefresh}
                isRefreshing={isRefreshing}
                countdown={countdown}
                pauseReason={isProtected ? "Formulario abierto" : undefined}
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
          {currentFilters.mode !== "search" &&
            currentFilters.period === "day" &&
            availableRiders?.length > 0 && (
              <RiderSummaryIndicator
                totalOrders={allOrders}
                availableRiders={availableRiders}
              />
            )}
          {currentFilters.mode !== "search" &&
            currentFilters.period !== "all" && (
              <OrderSummaryIndicator
                totalOrders={allOrders}
                title={
                  currentFilters.period === "day"
                    ? "SUBTOTAL DEL DÍA SELECCIONADO"
                    : "SUBTOTAL DEL MES SELECCIONADO"
                }
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
          sx={{
            display: "flex",
            justifyContent: "center",
            fontFamily: "fontFamily.terciary",
            fontWeight: 800,
            fontSize: "1rem",
            color: "primary.main",
            m: 1,
          }}
        >
          {getOrderPanelTitle(currentFilters)}
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
                  .slice(
                    displayedPage * rowsPerPage,
                    displayedPage * rowsPerPage + rowsPerPage,
                  )
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
                        onCancelPayment={handleOpenCancelPaymentConfirm}
                        canCancelPayment={user?.role === "admin"}
                        paymentUpdating={
                          payingOrderId === order.id ||
                          cancelingPaymentOrderId === order.id
                        }
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
                {isRefreshing
                  ? "Cargando pedidos..."
                  : "No hay pedidos para los filtros seleccionados"}
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
            page={displayedPage}
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
        enabledPaymentMethods={getConfiguredPaymentMethods(user)}
      />

      <ModalConfirmCancelOrderPayment
        open={cancelPaymentConfirm.open}
        order={cancelPaymentConfirm.order}
        displayID={cancelPaymentConfirm.displayID}
        loading={Boolean(cancelingPaymentOrderId)}
        onClose={handleCloseCancelPaymentConfirm}
        onConfirm={handleConfirmCancelPayment}
      />

      {/* MODAL EDIT ORDER */}
      <ModalEditOrder
        show={openModal}
        onClose={handleCloseModal}
        showAlert={showAlert}
        showOrder={selectedOrder}
        showOrderIndex={selectedOrderIndex}
        cashSession={cashSession}
        cashRegisterId={cashRegisterId}
        onOrderUpdated={fetchOrders}
      />
      {AlertComponent}
    </Box>
  );
};
