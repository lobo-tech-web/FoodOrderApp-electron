import { useState, useEffect, useMemo, useCallback, useRef } from "react";

// ---- Material UI ----
import {
  Box,
  Checkbox,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  Tab,
  Typography,
} from "@mui/material";
// Icons
import {
  MoreHoriz as MoreHorizIcon,
  Pending as PendingIcon,
  FactCheck as FactCheckIcon,
  DeliveryDining as DeliveryDiningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
// -------------------

// ---- CONTEXT ----
import { useOrders } from "@/context/Orders.jsx";
// -----------------

// ---- HOOKS ----
import { useAutoRefresh } from "@/hooks/AutoRefreshOrders.jsx";
// ---------------

// ---- Components ----
import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent.jsx";
import { StaffOrderActionsBar } from "./StaffOrderActionsBar/StaffOrderActionsBar.jsx";
import { OrderInfo } from "../../AdminPanel/OrderPanel/OrderInfo/OrderInfo.jsx";
import { AutoRefreshIndicator } from "../../AdminPanel/OrderPanel/AutoRefreshIndicator/AutoRefreshIndicator.jsx";
import { RiderCountIndicator } from "../../AdminPanel/OrderPanel/RiderCountIndicator/RiderCountIndicator.jsx";
import { ModalEditOrder } from "@/components/PanelComponents/ModalEditOrder/ModalEditOrder.jsx";
// --------------------

// ---- Utils ----
import { getDateNowDayjs, getTimeNowDayjs } from "@/utils/clientWorking.js";
import {
  isTerminalOrderStatus,
  hasOrderPermission,
} from "@/utils/orderEditRules.js";
// import { statusOptions } from "@/utils/components/StatusUtils.jsx";
// ---------------

const ORDER_STATUS = {
  TODOS: {
    color: "#f59e0b",
    icon: <MoreHorizIcon fontSize="small" />,
  },

  "PENDIENTE A CONFIRMAR": {
    color: "#ff9800",
    icon: <PendingIcon fontSize="small" />,
  },

  "EN PREPARACIÓN": {
    color: "#2196f3",
    icon: <FactCheckIcon fontSize="small" />,
  },

  "EN ENVIO": {
    color: "#9c27b0",
    icon: <DeliveryDiningIcon fontSize="small" />,
  },

  FINALIZADO: {
    color: "#4caf50",
    icon: <CheckCircleIcon fontSize="small" />,
  },

  CANCELADO: {
    color: "#f44336",
    icon: <CancelIcon fontSize="small" />,
  },
};

// ---- Styles ----
const tableHeadStyle = {
  fontFamily: "fontFamily.primary",
  color: "primary.main",
  textAlign: "center",
  fontWeight: "bold",
  py: 2,
};
// ----------------

export const StaffOrderPanel = ({
  user,
  externalView,
  cashSession,
  showAlert,
}) => {
  const isElectronApp =
    typeof window !== "undefined" && Boolean(window.electronAPI);

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const ordersRequestInFlightRef = useRef("");
  const initialFetchKeyRef = useRef("");

  const activeTab = useMemo(() => {
    if (externalView === 1) return 0;
    if (externalView === 11) return 1;
    return 2;
  }, [externalView]);

  const { orderState, filterOrderByDate, getRidersByRestaurant } = useOrders();

  const allOrders = useMemo(() => orderState.orders || [], [orderState.orders]);
  const availableRiders = useMemo(
    () => orderState?.riders || [],
    [orderState?.riders],
  );

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

  const restaurantId = useMemo(() => {
    if (user?.role === "staff") return user.restaurantId;
    return user?.id;
  }, [user?.id, user?.restaurantId, user?.role]);

  const canUpdateStatus = hasOrderPermission(user, "updateStatus");
  const isCashOpen = cashSession?.id && cashSession?.status === "OPEN";

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(null);
  const [selectedOrdersCheckbox, setSelectedOrdersCheckbox] = useState([]);

  const [openOrderModal, setOpenOrderModal] = useState(false);

  const handleOpenOrderModal = useCallback((order, index) => {
    setAutoRefreshEnabled(false);
    setSelectedOrder(order);
    setSelectedOrderIndex(index);
    setOpenOrderModal(true);
  }, []);

  const handleCloseOrderModal = useCallback(() => {
    setSelectedOrder(null);
    setSelectedOrderIndex(null);
    setAutoRefreshEnabled(true);
    setOpenOrderModal(false);
  }, []);

  const selectableOrders = useMemo(() => {
    if (!isCashOpen) return [];

    return filteredOrders.filter(
      (order) => !isTerminalOrderStatus(order.status),
    );
  }, [filteredOrders, isCashOpen]);

  const handleSelectOrders = (event, order) => {
    if (!isCashOpen) return;

    if (isTerminalOrderStatus(order.status)) return;

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
    if (!isCashOpen) return;

    if (event.target.checked) {
      setSelectedOrdersCheckbox([...selectableOrders]);
    } else {
      setSelectedOrdersCheckbox([]);
    }
  };

  const fetchOrders = useCallback(
    async (isAutoRefresh = false) => {
      if (!restaurantId) return;

      const requestKey = `${activeTab}:${restaurantId}`;
      if (ordersRequestInFlightRef.current === requestKey) return;
      ordersRequestInFlightRef.current = requestKey;

      if (isAutoRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const today = getDateNowDayjs();

        if (activeTab === 0) {
          await filterOrderByDate(
            today.day,
            today.month,
            today.year,
            restaurantId,
          );
          await getRidersByRestaurant(restaurantId);
        }
        if (activeTab === 1) {
          await filterOrderByDate("", today.month, today.year, restaurantId);
        }

        if (!isAutoRefresh) {
          setSelectedOrdersCheckbox([]);
          setPage(0);
        }
        const time = getTimeNowDayjs();
        setLastRefresh(time);
      } catch (error) {
        showAlert?.(
          error?.message || "Error al obtener pedidos del local",
          "error",
        );
      } finally {
        if (isAutoRefresh) {
          setIsRefreshing(false);
        } else {
          setLoading(false);
        }
        ordersRequestInFlightRef.current = "";
      }
    },
    [
      activeTab,
      restaurantId,
      filterOrderByDate,
      getRidersByRestaurant,
      showAlert,
    ],
  );

  useEffect(() => {
    const fetchKey = `${activeTab}:${restaurantId || ""}`;
    if (!restaurantId || initialFetchKeyRef.current === fetchKey) return;

    initialFetchKeyRef.current = fetchKey;
    fetchOrders(false);
  }, [activeTab, restaurantId, fetchOrders]);

  // Auto-refresh hook
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  const fetchTodayOrdersOnly = useCallback(async () => {
    if (activeTab !== 0) return;
    await fetchOrders(true);
  }, [activeTab, fetchOrders]);

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

  if (loading && !allOrders.length) {
    return <LoadingComponent message="Cargando pedidos..." />;
  }

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
      <StaffOrderActionsBar
        user={user}
        cashSession={cashSession}
        selectedOrders={selectedOrdersCheckbox}
        loading={loading}
        onRefresh={handleManualRefresh}
        setAutoRefreshEnabled={setAutoRefreshEnabled}
        showAlert={showAlert}
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
          {activeTab === 0 ? "PEDIDOS DE HOY" : "PEDIDOS DEL MES"}
        </Typography>

        <Paper
          elevation={0}
          sx={{
            mb: 2,
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
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
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

                    {statusCounts[status] > 0 && (
                      <Chip
                        label={statusCounts[status]}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: "0.60rem",

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
                  "&.Mui-selected": {
                    color: ORDER_STATUS[status].color,
                  },
                }}
              />
            ))}
          </Tabs>
        </Paper>

        <TableContainer>
          {filteredOrders.length > 0 ? (
            <Table>
              <TableHead sx={{ bgcolor: "background.paper" }}>
                <TableRow>
                  <TableCell padding="checkbox">
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
                  <TableCell sx={tableHeadStyle}>DIRECCIÓN</TableCell>
                  <TableCell sx={tableHeadStyle}>TOTAL</TableCell>
                  <TableCell sx={tableHeadStyle}>PUNTOS</TableCell>
                  <TableCell sx={tableHeadStyle}>FECHA/HORA</TableCell>
                  <TableCell sx={tableHeadStyle}>ENTREGA</TableCell>
                  <TableCell sx={tableHeadStyle}>ESTADO</TableCell>
                  <TableCell sx={tableHeadStyle}>MODIFICAR</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredOrders
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
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
                      />
                    );
                  })}
              </TableBody>
            </Table>
          ) : (
            <Box
              sx={{
                p: 5,
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontFamily: "fontFamily.primary" }}>
                NO HAY PEDIDOS CON ESTADO:
              </Typography>

              <Typography
                sx={{
                  fontFamily: "fontFamily.secondary",
                  color: ORDER_STATUS[statusFilter]?.color,
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

      <ModalEditOrder
        show={openOrderModal}
        onClose={handleCloseOrderModal}
        showAlert={showAlert}
        showOrder={selectedOrder}
        showOrderIndex={selectedOrderIndex}
        cashSession={cashSession}
        onOrderUpdated={fetchOrders}
      />
    </Box>
  );
};
