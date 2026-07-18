import _ from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";

// ---- MATERIAL UI ----
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
// ICONS
import {
  AccessTime as AccessTimeIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
// ---------------------

// ---- CONTEXT ----
import { useOrders } from "@/context/Orders.jsx";
import { useProducts } from "@/context/Products.jsx";
import { useUser } from "@/context/Users.jsx";
// -----------------

// ---- SERVICES ----
import { deleteOrderService } from "@/services/orders.js";
// ------------------

// ---- COMPONENTS ----
import { ConfirmDialogClose } from "@/components/ConfirmDialogClose/ConfirmDialogClose.jsx";
import { LoadingInModal } from "@/components/LoadingInModal/LoadingInModal.jsx";
import { SavingOverlay } from "@/components/LoadingInModal/SavingOverlay.jsx";
import { ModalSelectProducts } from "./ModalSelectProducts/ModalSelectProducts.jsx";
import { OrderManagementPanel } from "./OrderDetails/OrderManagementPanel.jsx";
import { OrderSummaryPanel } from "./OrderDetails/OrderSummaryPanel.jsx";
import { PrinterConfigModal } from "./PrinterConfig/PrinterConfigModal.jsx";
import { QuickEditOrder } from "./QuickEditOrder/QuickEditOrder.jsx";
// --------------------

// ---- UTILS ----
import { getProductOptionsForUI } from "@/utils/migrateCustomOptions.js";
import {
  calculateDiscount,
  calculateFinalProductPrice,
  calculateFinalTotal,
  calculateProductTotals,
  cleanMoneyValue,
} from "@/utils/orderCalculations.js";
import {
  initialUpdateOrderState,
  normalizeOrderForCompare,
} from "@/utils/orderUtils.js";
// ---------------

export const ModalEditOrder = ({
  show,
  onClose,
  showAlert,
  showOrder,
  showOrderIndex,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingOrderDetail, setLoadingOrderDetail] = useState(false);
  const [showPrinterConfig, setShowPrinterConfig] = useState(false);

  const { orderState, getOrderById, updateOrder, getRidersByRestaurant } =
    useOrders();
  const { productState } = useProducts();
  const { userState } = useUser();

  // Estados para el pedido
  const [order, setOrder] = useState(initialUpdateOrderState);

  const [orderCopy, setOrderCopy] = useState(null);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  const handleConfirmModalClose = (confirmation) => {
    if (confirmation) {
      setLoading(false);
      setOrder(initialUpdateOrderState);
      setOrderCopy(null);
      onClose();
    }
    setShowConfirmClose(false);
  };

  const hasChanges = useMemo(() => {
    if (!orderCopy) return false;

    const normalizedCurrentOrder = normalizeOrderForCompare(order);
    const normalizedOriginalOrder = normalizeOrderForCompare(orderCopy);

    return !_.isEqual(normalizedCurrentOrder, normalizedOriginalOrder);
  }, [order, orderCopy]);

  const handleClose = useCallback(() => {
    if (hasChanges) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  }, [hasChanges, onClose]);

  // ✅ ESTADOS PARA RIDERS
  const [editingRider, setEditingRider] = useState(false);
  const [openSelectRider, setOpenSelectRider] = useState(false);

  const availableRiders = useMemo(
    () => orderState?.riders || [],
    [orderState?.riders],
  );

  const selectedRider = useMemo(() => {
    return (
      availableRiders.find((r) => r.id === order.riderId) || order.rider || null
    );
  }, [availableRiders, order.riderId, order.rider]);

  // ✅ ESTADOS PARA QUICK EDIT POPOVERS
  const [quickEditState, setQuickEditState] = useState({
    anchorEl: null,
    target: "order",
    field: null,
    value: "",
    itemIndex: null,
  });

  // ✅ QUICK EDIT HANDLERS
  const handleQuickEditOpen = (event, config) => {
    const { target = "order", field, value = "", itemIndex = null } = config;

    setQuickEditState({
      anchorEl: event.currentTarget,
      target,
      field,
      value: value?.toString() || "",
      itemIndex,
    });
  };

  const handleQuickEditClose = () => {
    setQuickEditState({
      anchorEl: null,
      target: "order",
      field: null,
      value: "",
      itemIndex: null,
    });
  };

  const handleQuickEditSave = async (newValue) => {
    try {
      const { target, field, itemIndex } = quickEditState;

      if (!field) return;

      if (target === "cartItem") {
        setOrder((prev) => ({
          ...prev,
          cartItems: prev.cartItems.map((item, index) =>
            index === itemIndex
              ? {
                  ...item,
                  [field]: newValue,
                }
              : item,
          ),
        }));

        handleQuickEditClose();
        return;
      }

      setOrder((prev) => ({
        ...prev,
        [field]: newValue,
      }));

      handleQuickEditClose();
    } catch (error) {
      console.error("Error al actualizar el campo:", error);
      showAlert("Error al actualizar el campo", "error");
    }
  };

  // Estados para modificación de productos
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [editingProductIndex, setEditingProductIndex] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  const handleCloseProductSelector = () => {
    setShowProductSelector(false);
    setEditingProductIndex(null);
    setEditingProduct(null);
  };

  const [isDiscount, setIsDiscount] = useState("");

  // ✅ CALCULAR TOTALES AUTOMÁTICAMENTE
  const calculatedProductTotals = useMemo(() => {
    return calculateProductTotals(order.cartItems);
  }, [order.cartItems]);

  // ✅ CALCULAR EL DESCUENTO
  const calculatedDiscount = useMemo(() => {
    if (isDiscount === "MONTO") {
      return {
        discountamount: cleanMoneyValue(order.discountamount).toNumber(),
        discountPercentage: 0,
      };
    } else if (isDiscount === "SIN DESCUENTO") {
      return {
        discountamount: 0,
        discountPercentage: 0,
      };
    } else {
      return calculateDiscount(
        calculatedProductTotals.subtotalProducts,
        order.discount,
      );
    }
  }, [
    calculatedProductTotals.subtotalProducts,
    order.discount,
    order.discountamount,
    isDiscount,
  ]);

  // ✅ CALCULAR EL TOTAL FINAL DEL PEDIDO (incluyendo delivery y service tax)
  const finalOrderTotal = useMemo(() => {
    return calculateFinalTotal(
      calculatedProductTotals.subtotalProducts,
      calculatedDiscount.discountamount,
      order.servicetax,
      order.deliverycost,
    );
  }, [
    calculatedProductTotals.subtotalProducts,
    calculatedDiscount.discountamount,
    order.servicetax,
    order.deliverycost,
  ]);

  // ✅ ACTUALIZAR TOTALES CUANDO CAMBIAN LOS PRODUCTOS O DESCUENTO
  useEffect(() => {
    setOrder((prev) => ({
      ...prev,
      totalAmount: finalOrderTotal,
      totalRewardPoints: calculatedProductTotals.totalRewardPoints,
      totalRedeemPoints: calculatedProductTotals.totalRedeemPoints,
      discountamount: calculatedDiscount.discountamount,
      discount: calculatedDiscount.discountPercentage,
    }));
  }, [
    finalOrderTotal,
    calculatedProductTotals.totalRewardPoints,
    calculatedProductTotals.totalRedeemPoints,
    calculatedDiscount.discountamount,
    calculatedDiscount.discountPercentage,
  ]);

  // Formatear fecha para mostrar
  const formatDate = (orderDate) => {
    if (!orderDate?.day || !orderDate?.month || !orderDate?.year) return "-";

    const hour = orderDate.hour ?? "00";
    const minute = orderDate.minute ?? "00";

    return `${orderDate.day}/${orderDate.month}/${orderDate.year} ${hour}:${minute}`;
  };

  // ✅ MANEJAR CAMBIOS EN CAMPOS BÁSICOS
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "orderType") {
      setOrder((prev) => ({
        ...prev,
        orderType: value,
        riderId: value === "DELIVERY" ? prev.riderId : null,
        rider: value === "DELIVERY" ? prev.rider : null,
        deliverycost: value === "DELIVERY" ? prev.deliverycost : 0,
      }));
      return;
    }

    if (
      name === "extraPoints" ||
      name === "deliverycost" ||
      name === "discountamount"
    ) {
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setOrder((prev) => ({
          ...prev,
          [name]: value === "" ? "" : Number(value),
        }));
      }
      return;
    }

    if (name === "discount") {
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        const parsedValue = parseFloat(value);
        if (!isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 100) {
          setOrder((prev) => ({
            ...prev,
            discount: parsedValue,
          }));
        }
      }
      return;
    }

    setOrder((prev) => ({ ...prev, [name]: value }));
  };

  const handleDiscountChange = (discountType) => {
    setIsDiscount(discountType);
    if (discountType === "SIN DESCUENTO") {
      setOrder((prev) => ({
        ...prev,
        discount: 0,
        discountamount: 0,
      }));
    }
  };

  // ✅ AGREGAR PRODUCTO AL PEDIDO
  const handleAddProduct = (productWithCustomizations) => {
    const finalPrice = calculateFinalProductPrice(productWithCustomizations);

    const newItem = {
      ...productWithCustomizations,
      productId:
        productWithCustomizations.productId || productWithCustomizations.id,
      price: finalPrice,
      quantity: 1,
    };

    setOrder((prev) => ({
      ...prev,
      cartItems: [...prev.cartItems, newItem],
    }));

    setShowProductSelector(false);
    showAlert("Producto agregado al pedido", "success");
  };

  const handleProductModified = (modifiedProduct) => {
    if (editingProductIndex === null) return;

    const currentItem = order.cartItems[editingProductIndex];

    if (!currentItem) {
      showAlert(
        "No se encontró el producto que se estaba modificando",
        "warning",
      );
      return;
    }

    const finalPrice = calculateFinalProductPrice(modifiedProduct);

    const newItemModified = {
      ...currentItem,
      ...modifiedProduct,
      productId:
        modifiedProduct.productId ||
        modifiedProduct.id ||
        currentItem.productId,
      price: finalPrice,
      quantity:
        Number(modifiedProduct.quantity) || Number(currentItem.quantity) || 1,
      customOptions: _.cloneDeep(modifiedProduct.customOptions || []),
      productComment: modifiedProduct.productComment || "",
    };

    setOrder((prev) => ({
      ...prev,
      cartItems: prev.cartItems.map((item, index) =>
        index === editingProductIndex ? newItemModified : item,
      ),
    }));

    // Reset editing states
    setEditingProductIndex(null);
    setEditingProduct(null);
    setShowProductSelector(false);

    showAlert("Producto modificado en el pedido", "success");
  };

  // ✅ EDITAR PRODUCTO DEL PEDIDO
  const handleEditProduct = (item, index) => {
    // Find the original product from productState to get full product data including customOptions
    const originalProduct = productState.allProducts.find(
      (product) =>
        product.id === item.productId ||
        product.id === item.id ||
        product.name === item.name,
    );

    if (!originalProduct) {
      showAlert(
        "No se encontró el producto original para modificar",
        "warning",
      );
      return;
    }

    const productOptions = getProductOptionsForUI(originalProduct);

    if (productOptions.length === 0 && !originalProduct.allowComment) {
      showAlert("Este producto no se puede modificar", "info");
      return;
    }

    setEditingProductIndex(index);
    setEditingProduct({
      ...originalProduct,
      id: originalProduct.id,
      productId: originalProduct.id,
      customOptions: _.cloneDeep(item.customOptions || []),
      productComment: item.productComment || "",
      quantity: Number(item.quantity) || 1,
    });
    setShowProductSelector(true);
  };

  // ✅ MODIFICAR CANTIDAD DE PRODUCTO
  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity < 1) return;

    setOrder((prev) => ({
      ...prev,
      cartItems: prev.cartItems.map((item, i) =>
        i === index ? { ...item, quantity: newQuantity } : item,
      ),
    }));
  };

  // ✅ ELIMINAR PRODUCTO DEL PEDIDO
  const handleRemoveProduct = (index) => {
    setOrder((prev) => ({
      ...prev,
      cartItems: prev.cartItems.filter((_, i) => i !== index),
    }));
    showAlert("Producto eliminado del pedido", "info");
  };

  const buildOrderUpdateData = useCallback(
    (statusOverride = null) => {
      return {
        tableid: order.tableid || "",
        cartItems: order.cartItems,
        totalRewardPoints: calculatedProductTotals.totalRewardPoints,
        totalRedeemPoints: calculatedProductTotals.totalRedeemPoints,
        deliverycost: cleanMoneyValue(order.deliverycost).toNumber(),
        servicetax: cleanMoneyValue(order.servicetax).toNumber(),
        discount: Number(order.discount) || 0,
        discountamount: cleanMoneyValue(
          calculatedDiscount.discountamount,
        ).toNumber(),
        totalAmount: cleanMoneyValue(finalOrderTotal).toNumber(),
        paymentMethod: order.paymentMethod,
        clientEmail: order.clientEmail,
        clientName: order.clientName,
        deliveryAddress: order.deliveryAddress,
        contactPhone: order.contactPhone,
        orderType: order.orderType,
        comentary: order.comentary,
        status: statusOverride || order.status,
        extraPoints: Number(order.extraPoints) || 0,
        riderId: order.riderId ? order.riderId : null,
      };
    },
    [
      order,
      calculatedProductTotals.totalRewardPoints,
      calculatedProductTotals.totalRedeemPoints,
      calculatedDiscount.discountamount,
      finalOrderTotal,
    ],
  );

  const handleChangeOrderStatusFromPrint = useCallback(
    async (nextStatus) => {
      if (!order.id) return null;

      const updateData = buildOrderUpdateData(nextStatus);

      const response = await updateOrder(order.id, updateData);

      const savedOrder = {
        ...order,
        ...updateData,
        status: response?.order?.status || nextStatus,
        totalAmount: updateData.totalAmount,
        totalRewardPoints: updateData.totalRewardPoints,
        totalRedeemPoints: updateData.totalRedeemPoints,
        discountamount: updateData.discountamount,
        discount: updateData.discount,
        riderId: response?.order?.riderId ?? updateData.riderId,
        rider: response?.order?.rider ?? order.rider ?? null,
      };

      setOrder(savedOrder);
      setOrderCopy(_.cloneDeep(savedOrder));

      return response;
    },
    [order, updateOrder, buildOrderUpdateData],
  );

  // ✅ GUARDAR CAMBIOS
  const handleSaveChanges = useCallback(async () => {
    if (!order.status) {
      showAlert("Debe seleccionar un estado para el pedido", "warning");
      return;
    }

    if (order.cartItems.length === 0) {
      showAlert("El pedido debe tener al menos un producto", "warning");
      return;
    }

    if (!order.clientName.trim()) {
      showAlert("El nombre del cliente es requerido", "warning");
      return;
    }

    if (!order.clientEmail.trim()) {
      showAlert("El email del cliente es requerido", "warning");
      return;
    }

    setLoading(true);
    try {
      const updateData = buildOrderUpdateData();

      const response = await updateOrder(order.id, updateData);

      const savedOrder = {
        ...order,
        ...updateData,
        status: response?.order?.status || updateData.status,
        riderId: response?.order?.riderId ?? updateData.riderId,
        rider: response?.order?.rider ?? order.rider ?? null,
      };

      setOrder(savedOrder);
      setOrderCopy(_.cloneDeep(savedOrder));

      showAlert("Pedido actualizado correctamente!", "success");
      onClose();
    } catch (error) {
      const errorMessage = error.message || "Error desconocido";
      showAlert(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [order, buildOrderUpdateData, showAlert, onClose, updateOrder]);

  const handleDeleteOrder = async (orderData) => {
    const isConfirmed = window.confirm(
      "¿Estás seguro de que quieres eliminar este pedido?",
    );
    if (!isConfirmed) return;
    setLoading(true);
    try {
      const deletedOrder = {
        id: orderData.id,
        restaurantId: orderData.restaurantId,
      };
      await deleteOrderService(deletedOrder);
      showAlert("Pedido eliminado correctamente", "success");
      onClose();
    } catch (error) {
      showAlert("Error al eliminar el pedido", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ INICIALIZAR DATOS CUANDO SE ABRE EL MODAL
  useEffect(() => {
    let isMounted = true;

    const loadOrderDetail = async () => {
      if (!show || !showOrder?.id) return;

      setOrder(initialUpdateOrderState);
      setOrderCopy(null);
      setIsDiscount("");
      setLoadingOrderDetail(true);

      try {
        const fullOrder = await getOrderById(showOrder.id);

        if (!isMounted) return;

        const initialOrder = {
          ...initialUpdateOrderState,
          id: fullOrder.id || "",
          restaurantId: fullOrder.restaurantId || "",
          restaurantName: fullOrder.restaurantName || "",
          tableid: fullOrder.tableid || "",
          cartItems: Array.isArray(fullOrder.cartItems)
            ? fullOrder.cartItems
            : [],
          totalRewardPoints: Number(fullOrder.totalRewardPoints) || 0,
          totalRedeemPoints: Number(fullOrder.totalRedeemPoints) || 0,
          deliverycost: cleanMoneyValue(fullOrder.deliverycost).toNumber(),
          servicetax: cleanMoneyValue(fullOrder.servicetax).toNumber(),
          discount: Number(fullOrder.discount) || 0,
          discountamount: cleanMoneyValue(fullOrder.discountamount).toNumber(),
          totalAmount: cleanMoneyValue(fullOrder.totalAmount).toNumber(),
          paymentMethod: fullOrder.paymentMethod || "",
          clientEmail: fullOrder.clientEmail || "",
          clientName: fullOrder.clientName || "",
          deliveryAddress: fullOrder.deliveryAddress || "",
          contactPhone: fullOrder.contactPhone || "",
          orderType: fullOrder.orderType || "",
          comentary: fullOrder.comentary || "",
          status: fullOrder.status || "",
          orderDate: fullOrder.orderDate || {},
          extraPoints: Number(fullOrder.extraPoints) || 0,
          riderId: fullOrder.riderId || null,
          rider: fullOrder.rider || null,
        };

        setOrder(initialOrder);
        setOrderCopy(_.cloneDeep(initialOrder));

        if (
          Number(initialOrder.discount) === 0 &&
          Number(initialOrder.discountamount) > 0
        ) {
          setIsDiscount("MONTO");
        } else if (Number(initialOrder.discount) > 0) {
          setIsDiscount("PORCENTAJE");
        } else {
          setIsDiscount("SIN DESCUENTO");
        }
      } catch (error) {
        const errorMessage =
          typeof error === "string"
            ? error
            : error?.message || "Error al obtener el detalle del pedido";

        showAlert(errorMessage, "error");
        onClose();
      } finally {
        if (isMounted) {
          setLoadingOrderDetail(false);
        }
      }
    };

    loadOrderDetail();

    return () => {
      isMounted = false;
    };
  }, [show, showOrder?.id, getOrderById, showAlert, onClose]);

  useEffect(() => {
    const fetchRiders = async () => {
      try {
        if (show && userState?.user?.id)
          await getRidersByRestaurant(userState.user.id);
      } catch (error) {
        console.error("Error al obtener los riders:", error);
      }
    };
    fetchRiders();
  }, [show, userState?.user?.id, getRidersByRestaurant]);

  return (
    <>
      <Dialog
        open={show}
        onClose={loading ? undefined : handleClose}
        maxWidth={false}
        fullWidth
        PaperProps={{
          elevation: 0,
          sx: {
            position: "relative",
            width: {
              xs: "100%",
              sm: "96vw",
              lg: "92vw",
              xl: "1380px",
            },
            maxWidth: "1380px",
            height: {
              xs: "100dvh",
              md: "92vh",
            },
            maxHeight: {
              xs: "100dvh",
              md: "92vh",
            },
            m: { xs: 0, md: 2 },
            borderRadius: { xs: 0, md: "18px" },
            overflow: "hidden",
            bgcolor: "background.default",
            border: {
              xs: "none",
              md: "1px solid",
            },
            borderColor: "background.main",
          },
        }}
      >
        {loading && <SavingOverlay message="Guardando cambios..." />}
        <DialogTitle
          sx={{
            minHeight: 82,
            px: { xs: 2, sm: 3 },
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            borderBottom: "1px solid",
            borderColor: "primary.main",
            bgcolor: "background.main",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                display: { xs: "none", sm: "grid" },
                placeItems: "center",
                borderRadius: "12px",
                bgcolor: "rgba(245, 158, 11, 0.12)",
                border: "1px solid",
                borderColor: "primary.main",
              }}
            >
              <EditIcon fontSize="small" sx={{ color: "primary.main" }} />
            </Box>

            <Typography
              sx={{
                color: "text.primary",
                fontFamily: "fontFamily.primary",
                fontWeight: 900,
                fontSize: { xs: "14px", sm: "18px", md: "22px" },
                lineHeight: 1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              EDITAR PEDIDO N° {showOrderIndex}
            </Typography>

            {/* Botón para eliminar pedido (Dev) */}
            {userState?.user?.role === "dev" && (
              <Button
                color="error"
                variant="contained"
                size="small"
                onClick={() => handleDeleteOrder(order)}
                sx={{
                  ml: 1,
                  display: { xs: "none", md: "inline-flex" },
                  fontFamily: "fontFamily.terciary",
                  borderRadius: 2,
                }}
              >
                ELIMINAR
              </Button>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, sm: 2 },
            }}
          >
            {showOrder?.orderDate && (
              <Box
                sx={{
                  display: { xs: "none", sm: "flex" },
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <AccessTimeIcon
                  fontSize="small"
                  sx={{ color: "text.primary" }}
                />
                <Typography
                  sx={{
                    fontFamily: "fontFamily.terciary",
                    fontWeight: 700,
                    color: "text.primary",
                  }}
                >
                  {formatDate(showOrder.orderDate)}
                </Typography>
              </Box>
            )}

            <IconButton
              onClick={handleClose}
              disabled={loading}
              size="small"
              sx={{
                width: 36,
                height: 36,
                color: "primary.main",
                "&:hover": {
                  color: "text.primary",
                },
              }}
            >
              <CloseIcon color="primary" />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent
          sx={{
            p: { xs: 1, sm: 1.2, md: 1.5 },
            mt: 1,
            bgcolor: "transparent",
            overflow: "auto",
          }}
        >
          {loadingOrderDetail ? (
            <LoadingInModal
              message="Cargando pedido..."
              minHeight={{ xs: "calc(100dvh - 170px)", md: 480 }}
            />
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  lg: "minmax(0, 1fr) 330px",
                },
                gap: { xs: 2, lg: 3 },
                alignItems: "start",
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <OrderManagementPanel
                  order={order}
                  setOrder={setOrder}
                  handleInputChange={handleInputChange}
                  isDiscount={isDiscount}
                  handleDiscountChange={handleDiscountChange}
                  availableRiders={availableRiders}
                  editingRider={editingRider}
                  selectedRider={selectedRider}
                  setEditingRider={setEditingRider}
                  setOpenSelectRider={setOpenSelectRider}
                  openSelectRider={openSelectRider}
                  handleEditProduct={handleEditProduct}
                  handleQuantityChange={handleQuantityChange}
                  handleRemoveProduct={handleRemoveProduct}
                  setShowProductSelector={setShowProductSelector}
                  handleQuickEditOpen={handleQuickEditOpen}
                />
              </Box>

              <OrderSummaryPanel
                order={order}
                showOrderIndex={showOrderIndex}
                setShowPrinterConfig={setShowPrinterConfig}
                finalOrderTotal={finalOrderTotal}
                onChangeOrderStatus={handleChangeOrderStatusFromPrint}
              />
            </Box>
          )}
        </DialogContent>

        <Divider />

        <DialogActions sx={{ justifyContent: "flex-end", p: 2 }}>
          <Button
            onClick={handleClose}
            disabled={loading || loadingOrderDetail}
            variant="contained"
            color="error"
            startIcon={<CloseIcon />}
            sx={{ fontFamily: "fontFamily.primary" }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveChanges}
            disabled={
              loading || loadingOrderDetail || order.cartItems.length === 0
            }
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            sx={{ fontFamily: "fontFamily.primary" }}
          >
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      {showConfirmClose && (
        <ConfirmDialogClose
          showConfirmClose={showConfirmClose}
          setShowConfirmClose={setShowConfirmClose}
          handleConfirmModalClose={handleConfirmModalClose}
        />
      )}

      {/* ✅ MODAL PARA SELECCIONAR PRODUCTOS */}
      {showProductSelector && (
        <ModalSelectProducts
          open={showProductSelector}
          onClose={handleCloseProductSelector}
          onSelectProduct={
            editingProduct ? handleProductModified : handleAddProduct
          }
          products={
            editingProduct ? [editingProduct] : productState.allProducts
          }
          editingProduct={Boolean(editingProduct)}
        />
      )}

      {/* ✅ POPOVER PARA EDICIÓN RÁPIDA */}
      <QuickEditOrder
        open={Boolean(quickEditState.anchorEl)}
        anchorEl={quickEditState.anchorEl}
        onClose={handleQuickEditClose}
        showAlert={showAlert}
        onSave={handleQuickEditSave}
        field={quickEditState.field}
        value={quickEditState.value}
        onChange={(newValue) =>
          setQuickEditState((prev) => ({ ...prev, value: newValue }))
        }
      />

      <PrinterConfigModal
        open={showPrinterConfig}
        onClose={() => setShowPrinterConfig(false)}
      />
    </>
  );
};
