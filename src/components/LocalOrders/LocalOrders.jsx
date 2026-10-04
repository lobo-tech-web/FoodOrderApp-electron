import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ---- Material UI ----
import {
  AppBar,
  Avatar,
  Box,
  Button,
  CircularProgress,
  CssBaseline,
  Divider,
  IconButton,
  ThemeProvider,
  Toolbar,
  Typography,
} from "@mui/material";
// Icons
import { ArrowBack as BackIcon, Close as CloseIcon } from "@mui/icons-material";
// --------------------

// ---- Logos ----
import logo from "@/assets/main/logo-lobotech-oj.png";
import mainLogo from "@/assets/main/logo-white.png";
// ---------------

// ---- Theme ----
import { lobotechAppFoodDetailTheme } from "@/theme/main-theme.js";
// ---------------

// ---- Components ----
import { FoodDetailModal } from "@/components/FoodDetailModal/FoodDetailModal.jsx";
import { useThermalPrinter } from "@/components/PanelComponents/ModalEditOrder/PrinterConfig/useThermalPrinter.js";
import { DiscountModal } from "./DiscountModal.jsx";
import { CashRegisterGate } from "@/views/ControlPanel/StaffPanel/CashRegisterGate/CashRegisterGate.jsx";
import { ModalConfirmCreateOrderPaid } from "@/components/PanelComponents/ModalConfirmCreateOrderPaid/ModalConfirmCreateOrderPaid.jsx";
import { ModalConfirmOrderPaid } from "@/components/PanelComponents/ModalConfirmOrderPaid/ModalConfirmOrderPaid.jsx";
// --------------------

// ---- Hooks ----
import { useAlert } from "@/hooks/Alert.jsx";
// ---------------

// ---- Context ----
import { useLobotechThemeContext } from "@/context/ThemeContext.jsx";
import { useProducts } from "@/context/Products.jsx";
import { useUser } from "@/context/Users.jsx";
import { useOrders } from "@/context/Orders.jsx";
// -----------------

// ---- Utils ----
import {
  calculateFinalProductPrice,
  calculateProductTotals,
  cleanMoneyValue,
} from "@/utils/orderCalculations.js";
import { getProductOptionsForUI } from "@/utils/migrateCustomOptions.js";
import { getDateNowDayjs } from "@/utils/clientWorking.js";
import { buildOrderKitchenPrinterHtml } from "@/utils/printTemplates/orderKitchenTemplate.js";
import { buildOrderTicketPrinterHtml } from "@/utils/printTemplates/orderTicketTemplate.js";
import { getProductPrice } from "./orderUtils.js";
import { hasOrderPermission } from "@/utils/orderEditRules.js";
import { getPaymentMethods, INITIAL_CHECKOUT } from "./constants.jsx";
// ---------------

// ---- Steps ----
import { OrderTypeStep } from "./steps/OrderTypeStep.jsx";
import { ProductSelectionStep } from "./steps/ProductSelectionStep.jsx";
import { CheckoutStep } from "./steps/CheckoutStep.jsx";
import { SuccessStep } from "./steps/SuccessStep.jsx";
// ---------------

const INITIAL_DISCOUNT = {
  type: "SIN DESCUENTO",
  discount: 0,
  discountamount: 0,
};

export const LocalOrders = () => {
  const navigate = useNavigate();
  const { AlertComponent, showAlert } = useAlert();
  const { lobotechTheme } = useLobotechThemeContext();
  const createInProgressRef = useRef(false);
  const { printHtml } = useThermalPrinter();

  const { userState, getClientByUserNumber } = useUser();
  const { productState, getAllProducts, getAllCategorys, getAllCustomOptions } =
    useProducts();
  const { addOrder, filterOrderByDate } = useOrders();

  const user = userState.user || {};
  const isStaff = user.role === "staff";

  const restaurantId = isStaff ? user.restaurantId || "" : user.id || "";
  const restaurantData = isStaff ? user.restaurant || {} : user;
  const restaurantName =
    restaurantData.businessName || restaurantData.name || "LOCAL";
  const restaurantLogo = restaurantData.businessLogoUrl || "";
  const canCreateOrder = hasOrderPermission(user, "create");
  const canMarkPaid = hasOrderPermission(user, "markPaid");

  const [selectedCashRegisterId, setSelectedCashRegisterId] = useState(null);
  const [cashSession, setCashSession] = useState(null);
  const [showCreateConfirmation, setShowCreateConfirmation] = useState(false);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);

  const [step, setStep] = useState("type");
  const [orderType, setOrderType] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [checkout, setCheckout] = useState(INITIAL_CHECKOUT);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [createdOrder, setCreatedOrder] = useState(null);
  const [printStatus, setPrintStatus] = useState("");
  const [discountConfig, setDiscountConfig] = useState(INITIAL_DISCOUNT);
  const [showDiscountModal, setShowDiscountModal] = useState(false);

  const paymentMethods = useMemo(
    () => getPaymentMethods(restaurantData.paymentMethods),
    [restaurantData.paymentMethods],
  );

  const resolvedOrderStatus =
    orderType === "ESPERA EN LOCAL" ? "FINALIZADO" : "PENDIENTE A CONFIRMAR";

  const paymentRequiredByStatus = resolvedOrderStatus === "FINALIZADO";

  const hasSelectedOpenCash = Boolean(
    selectedCashRegisterId &&
    cashSession?.id &&
    cashSession.status === "OPEN" &&
    String(cashSession.cashRegisterId) === String(selectedCashRegisterId),
  );

  const fetchProducts = useCallback(async () => {
    if (!restaurantId) return;

    setLoading(true);
    setLoadError("");
    try {
      await Promise.all([
        getAllProducts(restaurantId),
        getAllCategorys(restaurantId),
        getAllCustomOptions(restaurantId),
      ]);
    } catch (error) {
      setLoadError(error?.message || String(error));
    } finally {
      setLoading(false);
    }
  }, [restaurantId, getAllCategorys, getAllCustomOptions, getAllProducts]);

  useEffect(() => {
    const hasAllowedRole = user.role === "admin" || user.role === "staff";

    if (!user.id || !hasAllowedRole) {
      navigate("/", { replace: true });
      return;
    }

    if (isStaff && !canCreateOrder) {
      navigate("/staff-panel", { replace: true });
      return;
    }

    fetchProducts();
  }, [fetchProducts, navigate, user.id, user.role, isStaff, canCreateOrder]);

  const availableProducts = useMemo(
    () =>
      (productState.allProducts || []).filter(
        (product) => product.status !== false,
      ),
    [productState.allProducts],
  );

  const categories = useMemo(() => {
    const values = availableProducts
      .map((product) => product.category?.name)
      .filter(Boolean);
    return ["TODOS", ...new Set(values)];
  }, [availableProducts]);

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return availableProducts.filter((product) => {
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category?.name);
      const matchesSearch =
        !term ||
        product.name?.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [availableProducts, search, selectedCategories]);

  const toggleCategory = (category) => {
    if (category === "TODOS") {
      setSelectedCategories([]);
      return;
    }

    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((selected) => selected !== category)
        : [...current, category],
    );
  };

  const totals = useMemo(() => calculateProductTotals(cartItems), [cartItems]);

  const discountSummary = useMemo(() => {
    const subtotal = cleanMoneyValue(totals.subtotalProducts).toNumber();

    if (subtotal <= 0 || discountConfig.type === "SIN DESCUENTO") {
      return {
        discount: 0,
        discountamount: 0,
        totalAmount: subtotal,
      };
    }

    if (discountConfig.type === "PORCENTAJE") {
      const discount = Math.min(
        Math.max(Number(discountConfig.discount || 0), 0),
        100,
      );
      const discountamount = Math.min(subtotal * (discount / 100), subtotal);

      return {
        discount,
        discountamount,
        totalAmount: Math.max(subtotal - discountamount, 0),
      };
    }

    const discountamount = Math.min(
      Math.max(cleanMoneyValue(discountConfig.discountamount).toNumber(), 0),
      subtotal,
    );

    return {
      discount: 0,
      discountamount,
      totalAmount: Math.max(subtotal - discountamount, 0),
    };
  }, [discountConfig, totals.subtotalProducts]);

  const resetDiscount = () => {
    setDiscountConfig({
      ...INITIAL_DISCOUNT,
    });
  };

  const resetOrder = () => {
    setStep("type");
    setOrderType("");
    setCartItems([]);
    setSearch("");
    setSelectedCategories([]);
    setSelectedProduct(null);

    setCheckout({
      ...INITIAL_CHECKOUT,
    });
    resetDiscount();

    setShowCreateConfirmation(false);
    setShowPaymentConfirmation(false);
    setShowDiscountModal(false);
    setSubmitError("");
    setCreatedOrder(null);
    setPrintStatus("");
  };

  const addProductToCart = (product) => {
    setCartItems((current) => [
      ...current,
      {
        ...product,
        productId: product.productId || product.id,
        price: calculateFinalProductPrice(product),
        quantity: 1,
      },
    ]);
    setSelectedProduct(null);
  };

  const handleProductClick = (product) => {
    const preparedProduct = { ...product, price: getProductPrice(product) };
    if (
      getProductOptionsForUI(preparedProduct).length > 0 ||
      preparedProduct.allowComment
    ) {
      setSelectedProduct(preparedProduct);
      return;
    }
    addProductToCart({ ...preparedProduct, customOptions: [] });
  };

  const updateQuantity = (index, amount) => {
    const currentItem = cartItems[index];
    const removesProduct =
      currentItem && Number(currentItem.quantity || 0) + amount <= 0;

    setCartItems((current) =>
      current
        .map((item, itemIndex) =>
          itemIndex === index
            ? { ...item, quantity: item.quantity + amount }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );

    if (removesProduct) {
      resetDiscount();
    }
  };

  const removeItem = (index) => {
    setCartItems((current) =>
      current.filter((_item, itemIndex) => itemIndex !== index),
    );
    resetDiscount();
  };

  const clearCart = () => {
    setCartItems([]);
    resetDiscount();
    setSelectedProduct(null);
  };

  const handleDiscountTypeChange = (type) => {
    setDiscountConfig((current) => ({
      ...current,
      type,
      discount: type === "PORCENTAJE" ? current.discount : 0,
      discountamount: type === "MONTO" ? current.discountamount : 0,
    }));
  };

  const handleDiscountValueChange = (value) => {
    const numericValue = Number(value || 0);

    setDiscountConfig((current) => {
      if (current.type === "PORCENTAJE") {
        return {
          ...current,
          discount: Math.min(Math.max(numericValue, 0), 100),
          discountamount: 0,
        };
      }

      return {
        ...current,
        discount: 0,
        discountamount: Math.max(numericValue, 0),
      };
    });
  };

  const findCustomer = async (userNumber) => {
    return getClientByUserNumber(restaurantId, userNumber);
  };

  const getPrintResultMessage = (label, result) => {
    if (result?.printed) {
      return result.mode === "manual"
        ? `${label} impreso con la impresora seleccionada.`
        : `${label} impreso en ${result.printerName}.`;
    }
    if (result?.reason === "no-printer") {
      return `${label}: Windows no encontro impresoras conectadas.`;
    }
    return `${label}: no se pudo imprimir o se cancelo la seleccion de impresora.`;
  };

  const tryPrintOrderDocument = async (label, type, html) => {
    try {
      const result = await printHtml(type, html);
      return getPrintResultMessage(label, result);
    } catch {
      return `${label}: no se pudo imprimir.`;
    }
  };

  const printCreatedOrder = async (order) => {
    const printMessages = [];

    printMessages.push(
      await tryPrintOrderDocument(
        "Ticket",
        "ticket",
        buildOrderTicketPrinterHtml(order, {
          variant: "local-order",
          hideEmptyClientContact: true,
        }),
      ),
    );
    printMessages.push(
      await tryPrintOrderDocument(
        "Comanda de cocina",
        "kitchen",
        buildOrderKitchenPrinterHtml(order),
      ),
    );

    setPrintStatus(printMessages.join(" "));
  };

  const createOrder = async ({
    markAsPaid = false,
    payments = undefined,
    creationConfirmed = false,
    paymentConfirmed = false,
  } = {}) => {
    setSubmitError("");

    if (!canCreateOrder) {
      const message = "No tenés permisos para crear pedidos";
      setSubmitError(message);
      showAlert(message, "warning", lobotechTheme);
      return;
    }

    if (!checkout.paymentMethod) {
      const message = "Selecciona el método de pago del pedido.";
      setSubmitError(message);
      showAlert(message, "warning", lobotechTheme);
      return;
    }

    if (
      !paymentMethods.some((method) => method.value === checkout.paymentMethod)
    ) {
      const message = "El método de pago seleccionado no está habilitado";
      setSubmitError(message);
      showAlert(message, "warning", lobotechTheme);
      return;
    }

    if (!checkout.clientName.trim()) {
      const message = "Ingresá el nombre del cliente";
      setSubmitError(message);
      showAlert(message, "warning", lobotechTheme);
      return;
    }

    if (cartItems.length === 0) {
      const message = "El pedido debe contener al menos un producto";
      setSubmitError(message);
      showAlert(message, "warning", lobotechTheme);
      return;
    }

    if (isStaff && !hasSelectedOpenCash) {
      const message =
        "Debés seleccionar una caja abierta antes de crear el pedido";
      setSubmitError(message);
      showAlert(message, "warning", lobotechTheme);
      return;
    }

    const shouldCreatePaid = markAsPaid || paymentRequiredByStatus;
    const isZeroTotal =
      Math.round(Number(discountSummary.totalAmount || 0) * 100) === 0;

    if (!creationConfirmed) {
      setShowCreateConfirmation(true);
      return;
    }
    if (shouldCreatePaid && !canMarkPaid) {
      const message = "No tenés permisos para registrar el pago del pedido";
      setSubmitError(message);
      showAlert(message, "warning", lobotechTheme);
      return;
    }

    if (
      shouldCreatePaid &&
      !isZeroTotal &&
      checkout.paymentMethod === "SIN ESPECIFICAR"
    ) {
      const message = "Seleccioná un método de pago concreto antes de cobrar";
      setSubmitError(message);
      showAlert(message, "warning", lobotechTheme);
      return;
    }

    if (shouldCreatePaid && !paymentConfirmed) {
      setShowCreateConfirmation(false);
      setShowPaymentConfirmation(true);
      return;
    }

    if (createInProgressRef.current) return;
    createInProgressRef.current = true;

    setLoading(true);
    try {
      let customer = null;
      const userNumber = checkout.userNumber.trim();
      const redeemPoints = Number(totals.totalRedeemPoints || 0);

      if (userNumber) {
        try {
          customer = await findCustomer(userNumber);
        } catch {
          customer = null;
        }

        if (!customer) {
          showAlert(
            "No encontramos una cuenta con ese numero de usuario LoboTech. El pedido se creara sin puntos.",
            "warning",
            lobotechTheme,
          );
        }
      }

      if (redeemPoints > 0) {
        if (!customer) {
          throw new Error(
            "No se puede proceder con esta compra si no existe un usuario para canjear puntos.",
          );
        }

        const availablePoints = Number(customer.restaurantPoints || 0);
        if (availablePoints < redeemPoints) {
          throw new Error(
            `El usuario posee ${availablePoints} puntos. y necesita ${redeemPoints}.`,
          );
        }
      }

      const orderData = {
        userId: customer?.id || restaurantId,
        restaurantId,
        restaurantName,
        businessName: restaurantName,
        businessLogoUrl: restaurantLogo,
        tableid: "",
        cartItems,
        totalRewardPoints: customer ? totals.totalRewardPoints : 0,
        totalRedeemPoints: customer ? totals.totalRedeemPoints : 0,
        deliverycost: 0,
        servicetax: 0,
        discount: discountSummary.discount,
        discountamount: discountSummary.discountamount,
        totalAmount: discountSummary.totalAmount,
        paymentMethod: checkout.paymentMethod,
        clientEmail:
          customer?.email || restaurantData.email || "lobotech.bb@gmail.com",
        clientName: checkout.clientName.trim(),
        deliveryAddress: customer?.address || "SIN ESPECIFICAR",
        contactPhone: customer?.phone || "SIN ESPECIFICAR",
        orderType,
        comentary: "",
        status: resolvedOrderStatus,
        cashRegisterId: selectedCashRegisterId || null,
        isPaid: shouldCreatePaid,
        ...(shouldCreatePaid &&
          checkout.paymentMethod === "COMBINADO" && {
            payments,
          }),
        ticketVariant: "local-order",
      };

      const response = await addOrder(orderData);
      const savedOrder = response?.order || response;
      let refreshedOrders = [];

      try {
        const today = getDateNowDayjs();
        const result = await filterOrderByDate(
          today.day,
          today.month,
          today.year,
          restaurantId,
        );

        refreshedOrders = Array.isArray(result) ? result : [];
      } catch (refreshError) {
        console.error(
          "El pedido se creó, pero no se pudo actualizar el listado:",
          refreshError,
        );

        showAlert(
          "El pedido se creó correctamente, pero no se pudo actualizar el listado.",
          "warning",
          lobotechTheme,
        );
      }

      const globalIndex = refreshedOrders.findIndex(
        (order) => order.id === savedOrder?.id,
      );

      const matchedOrder =
        globalIndex >= 0 ? refreshedOrders[globalIndex] : null;

      const orderIndex =
        matchedOrder?.dailyOrderNumber ||
        savedOrder?.dailyOrderNumber ||
        savedOrder?.orderIndex ||
        savedOrder?.orderNumber ||
        (globalIndex >= 0 ? refreshedOrders.length - globalIndex : undefined);

      const finalOrder = {
        ...orderData,
        ...savedOrder,
        orderIndex,
        ticketVariant: "local-order",
      };

      setCreatedOrder(finalOrder);
      setShowCreateConfirmation(false);
      setShowPaymentConfirmation(false);
      setStep("success");

      await printCreatedOrder(finalOrder);
    } catch (error) {
      const message = error?.message || String(error);
      setSubmitError(message);
      showAlert(message, "warning", lobotechTheme);
    } finally {
      createInProgressRef.current = false;
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "checkout") setStep("products");
    else if (step === "products") setStep("type");
    else navigate(isStaff ? "/staff-panel" : "/control-panel");
  };

  return (
    <ThemeProvider theme={lobotechTheme}>
      <CssBaseline />
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
        }}
      >
        <AppBar position="static" elevation={0} color="inherit">
          <Toolbar sx={{ gap: 1.5, minHeight: 64 }}>
            <IconButton
              aria-label={
                step === "products" || step === "checkout"
                  ? "Volver"
                  : "Ir al panel"
              }
              onClick={handleBack}
            >
              <BackIcon />
            </IconButton>
            <Avatar
              src={logo}
              variant="square"
              sx={{ width: 70, height: 38, objectFit: "contain" }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontFamily: "fontFamily.primary",
                  fontWeight: 900,
                  fontSize: { xs: "0.95rem", sm: "1.2rem" },
                }}
              >
                PEDIDOS LOCAL
              </Typography>
              {orderType && step !== "type" && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: { xs: "none", sm: "block" },
                    fontFamily: "fontFamily.secondary",
                    color: "primary.main",
                  }}
                >
                  {orderType}
                </Typography>
              )}
            </Box>
            {step !== "type" && step !== "success" && (
              <Button
                color="error"
                variant="contained"
                startIcon={<CloseIcon />}
                onClick={resetOrder}
                sx={{ fontFamily: "fontFamily.primary", minHeight: 38 }}
              >
                Cancelar
              </Button>
            )}
          </Toolbar>
        </AppBar>

        <Divider />

        {step !== "success" && (
          <Box
            sx={{
              px: 2,
              py: 1,
              bgcolor: "background.default",
            }}
          >
            <CashRegisterGate
              user={user}
              cashSession={cashSession}
              selectedCashRegisterId={selectedCashRegisterId}
              onCashRegisterChange={setSelectedCashRegisterId}
              onCashSessionChange={setCashSession}
              showAlert={(message, severity) =>
                showAlert(message, severity, lobotechTheme)
              }
              variant="compact"
            />
          </Box>
        )}

        {loading && step !== "checkout" && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              zIndex: 20,
              bgcolor: "rgba(0,0,0,0.45)",
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {step === "type" && (
          <OrderTypeStep
            orderType={orderType}
            onSelect={(value) => {
              setOrderType(value);
              setStep("products");
            }}
          />
        )}
        {step === "products" && (
          <ProductSelectionStep
            search={search}
            onSearchChange={setSearch}
            categories={categories}
            selectedCategories={selectedCategories}
            onCategoryToggle={toggleCategory}
            loadError={loadError}
            onRetry={fetchProducts}
            visibleProducts={visibleProducts}
            onProductClick={handleProductClick}
            cartItems={cartItems}
            totals={totals}
            discountAmount={discountSummary.discountamount}
            totalAmount={discountSummary.totalAmount}
            onOpenDiscount={() => setShowDiscountModal(true)}
            onClearCart={clearCart}
            onRemoveItem={removeItem}
            onUpdateQuantity={updateQuantity}
            onContinue={() => setStep("checkout")}
          />
        )}
        {step === "checkout" && (
          <CheckoutStep
            checkout={checkout}
            onCheckoutChange={setCheckout}
            paymentMethods={paymentMethods}
            totals={totals}
            discountAmount={discountSummary.discountamount}
            totalAmount={discountSummary.totalAmount}
            discountPercentage={discountSummary.discount}
            submitError={submitError}
            loading={loading}
            onCreateOrder={createOrder}
          />
        )}

        {step === "success" && (
          <SuccessStep
            createdOrder={createdOrder}
            printStatus={printStatus}
            onCreateNext={resetOrder}
          />
        )}

        {selectedProduct && (
          <FoodDetailModal
            open
            onClose={() => setSelectedProduct(null)}
            product={selectedProduct}
            imageDefault={mainLogo}
            onProductCustomized={addProductToCart}
            customTheme={lobotechAppFoodDetailTheme}
          />
        )}

        <DiscountModal
          open={showDiscountModal}
          onClose={() => setShowDiscountModal(false)}
          subtotal={totals.subtotalProducts}
          discountConfig={discountConfig}
          discountAmount={discountSummary.discountamount}
          totalAmount={discountSummary.totalAmount}
          onDiscountTypeChange={handleDiscountTypeChange}
          onDiscountValueChange={handleDiscountValueChange}
        />

        <ModalConfirmCreateOrderPaid
          open={showCreateConfirmation}
          order={{
            clientName: checkout.clientName,
            paymentMethod: checkout.paymentMethod,
            totalAmount: discountSummary.totalAmount,
            status: resolvedOrderStatus,
          }}
          paymentRequired={paymentRequiredByStatus}
          canMarkPaid={canMarkPaid}
          loading={loading}
          onCancel={() => setShowCreateConfirmation(false)}
          onCreatePending={() =>
            createOrder({
              markAsPaid: false,
              creationConfirmed: true,
            })
          }
          onContinueToPayment={() =>
            createOrder({
              markAsPaid: true,
              creationConfirmed: true,
            })
          }
        />

        <ModalConfirmOrderPaid
          open={showPaymentConfirmation}
          order={{
            clientName: checkout.clientName,
            paymentMethod: checkout.paymentMethod,
            totalAmount: discountSummary.totalAmount,
            status: resolvedOrderStatus,
          }}
          displayID="NUEVO"
          loading={loading}
          onClose={() => {
            setShowPaymentConfirmation(false);
            setShowCreateConfirmation(true);
          }}
          onConfirm={(payments) =>
            createOrder({
              markAsPaid: true,
              payments,
              creationConfirmed: true,
              paymentConfirmed: true,
            })
          }
          enabledPaymentMethods={paymentMethods.map((method) => method.value)}
        />
        {AlertComponent}
      </Box>
    </ThemeProvider>
  );
};
