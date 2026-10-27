import { useEffect, useRef } from "react";

// ---- Material UI ----
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
} from "@mui/material";
// Icons
import { Edit, Add, Refresh, Search, Close } from "@mui/icons-material";
// ---------------------

// ---- Components ----
import { ModalCreateOrder } from "@/components/PanelComponents/ModalCreateOrder/ModalCreateOrder.jsx";
import { ModalEditArrayOrders } from "@/components/PanelComponents/ModalEditArrayOrders/ModalEditArrayOrders.jsx";
import { FilterByDateOrders } from "@/components/PanelComponents/Filters/FilterByDateOrders/FilterByDateOrders.jsx";
import { OrderRealtimeIndicator } from "../OrderRealtimeIndicator/OrderRealtimeIndicator.jsx";
// --------------------

export const AdminOrderNavbar = ({
  handleRefresh,
  selectedOrdersCheckbox,
  onOrdersUpdated,
  filters,
  onSearchInputChange,
  onSearch,
  onClearSearch,
  onDateChange,
  disabled,
  refreshing,
  modalState,
  onModalChange,
  onHeightChange,
  cashSession = null,
  cashRegisterId = null,
  showAlert,
  connection,
  hasUpdates,
  isProtected,
  lastRefresh,
}) => {
  const navbarRef = useRef(null);

  useEffect(() => {
    const element = navbarRef.current;
    const measure = () =>
      onHeightChange(element.getBoundingClientRect().height);

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [onHeightChange]);

  return (
    <AppBar
      ref={navbarRef}
      position="sticky"
      elevation={0}
      sx={{
        width: "100%",
        top: 0,
        zIndex: 10,
        borderRadius: 1,
        mb: 2,
        bgcolor: "background.paper",
        backgroundImage: "none",
        color: "text.primary",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1.5,
          px: { xs: 1, sm: 2 },
          py: 1.5,
        }}
      >
        <Tooltip title="Actualizar pedidos">
          <Box component="span">
            <IconButton
              aria-label="Actualizar pedidos"
              onClick={handleRefresh}
              disabled={disabled || refreshing}
              sx={{ color: "primary.main" }}
            >
              <Refresh />
            </IconButton>
          </Box>
        </Tooltip>

        <Box
          component="form"
          onSubmit={(event) => {
            event.preventDefault();
            onSearch();
          }}
          sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
        >
          <TextField
            label="Nombre o teléfono"
            placeholder="Buscar..."
            size="small"
            value={filters.searchInput}
            disabled={disabled}
            onChange={(event) => onSearchInputChange(event.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {(filters.searchInput || filters.mode === "search") && (
                    <IconButton
                      aria-label="Limpiar búsqueda"
                      size="small"
                      disabled={disabled}
                      onClick={onClearSearch}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  )}

                  <Tooltip title="Buscar pedidos">
                    <Box component="span">
                      <IconButton
                        type="submit"
                        aria-label="Buscar pedidos"
                        size="small"
                        edge="end"
                        color="primary"
                        disabled={disabled}
                      >
                        <Search fontSize="small" />
                      </IconButton>
                    </Box>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
            sx={{
              fontFamily: "fontFamily.secondary",
              minWidth: { xs: 200, sm: 240 },
            }}
          />
        </Box>

        <Button
          startIcon={<Add />}
          variant="contained"
          disabled={disabled}
          onClick={() => onModalChange("createOrder", true)}
          sx={{
            fontFamily: "fontFamily.primary",
            minHeight: 40,
            bgcolor: "success.main",
          }}
        >
          Nuevo Pedido
        </Button>

        <Button
          startIcon={<Edit />}
          onClick={() => onModalChange("editArrayOrders", true)}
          variant="contained"
          disabled={disabled || !selectedOrdersCheckbox.length}
          sx={{ fontFamily: "fontFamily.primary", minHeight: 40 }}
        >
          Modificar Pedidos
        </Button>

        {filters.period !== "all" && (
          <Box sx={{ ml: "auto", display: "flex", justifyContent: "flex-end" }}>
            <FilterByDateOrders
              period={filters.period}
              date={filters.date}
              onChange={onDateChange}
              disabled={disabled}
            />
          </Box>
        )}
      </Toolbar>

      <OrderRealtimeIndicator
        connection={connection}
        hasUpdates={hasUpdates}
        isProtected={isProtected}
        isRefreshing={refreshing}
        lastRefresh={lastRefresh}
        onRefresh={handleRefresh}
      />

      {modalState.createOrder && (
        <ModalCreateOrder
          show
          onClose={() => onModalChange("createOrder", false)}
          showAlert={showAlert}
          refreshOrders={handleRefresh}
          cashRegisterId={cashRegisterId}
        />
      )}

      {modalState.editArrayOrders && (
        <ModalEditArrayOrders
          show
          handleClose={() => onModalChange("editArrayOrders", false)}
          showAlert={showAlert}
          showOrders={selectedOrdersCheckbox}
          onOrdersUpdated={onOrdersUpdated}
          refreshOrders={handleRefresh}
          cashSession={cashSession}
          cashRegisterId={cashRegisterId}
        />
      )}
    </AppBar>
  );
};
