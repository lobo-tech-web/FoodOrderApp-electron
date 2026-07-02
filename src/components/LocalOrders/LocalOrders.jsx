import { useCallback, useEffect, useMemo, useState } from "react";
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
} from "@/utils/orderCalculations.js";
import { getProductOptionsForUI } from "@/utils/migrateCustomOptions.js";
import { getDateNowDayjs } from "@/utils/clientWorking.js";
import { buildOrderKitchenPrinterHtml } from "@/utils/printTemplates/orderKitchenTemplate.js";
import { buildOrderTicketPrinterHtml } from "@/utils/printTemplates/orderTicketTemplate.js";
import { getProductPrice } from "./orderUtils.js";
import { getPaymentMethods, INITIAL_CHECKOUT } from "./constants.jsx";
// ---------------

// ---- Steps ----
import { OrderTypeStep } from "./steps/OrderTypeStep.jsx";
import { ProductSelectionStep } from "./steps/ProductSelectionStep.jsx";
import { CheckoutStep } from "./steps/CheckoutStep.jsx";
import { SuccessStep } from "./steps/SuccessStep.jsx";
// ---------------

export const LocalOrders = () => {
  const navigate = useNavigate();
  const { lobotechTheme } = useLobotechThemeContext();
  const { userState, getClientByUserNumber } = useUser();
  const { productState, getAllProducts } = useProducts();
  const { addOrder, filterOrderByDate } = useOrders();
  const { printHtml } = useThermalPrinter();
  const { AlertComponent, showAlert } = useAlert();
  const user = userState.user || {};

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

  const paymentMethods = useMemo(
    () => getPaymentMethods(user.paymentMethods),
    [user.paymentMethods],
  );

  const fetchProducts = useCallback(async () => {
    if (!user.id) return;
    setLoading(true);
    setLoadError("");
    try {
      await getAllProducts(user.id);
    } catch (error) {
      setLoadError(error?.message || String(error));
    } finally {
      setLoading(false);
    }
  }, [getAllProducts, user.id]);

  useEffect(() => {
    if (!user.id || user.role !== "admin") {
      navigate("/", { replace: true });
      return;
    }
    fetchProducts();
  }, [fetchProducts, navigate, user.id, user.role]);

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

  const resetOrder = () => {
    setStep("type");
    setOrderType("");
    setCartItems([]);
    setSearch("");
    setSelectedCategories([]);
    setSelectedProduct(null);
    setCheckout(INITIAL_CHECKOUT);
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
    setCartItems((current) =>
      current
        .map((item, itemIndex) =>
          itemIndex === index
            ? { ...item, quantity: item.quantity + amount }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeItem = (index) => {
    setCartItems((current) =>
      current.filter((_item, itemIndex) => itemIndex !== index),
    );
  };

  const findCustomer = async (userNumber) => {
    return getClientByUserNumber(user.id, userNumber);
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

  const createOrder = async () => {
    setSubmitError("");
    if (!checkout.paymentMethod) {
      setSubmitError("Selecciona como se pagara el pedido.");
      showAlert(
        "Selecciona como se pagara el pedido.",
        "warning",
        lobotechTheme,
      );
      return;
    }
    if (!checkout.clientName.trim()) {
      setSubmitError("Ingresa el nombre del cliente.");
      showAlert("Ingresa el nombre del cliente.", "warning", lobotechTheme);
      return;
    }

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
            `El usuario no posee puntos suficientes para esta compra. Tiene ${availablePoints} pts. y necesita ${redeemPoints} pts.`,
          );
        }
      }

      const orderData = {
        userId: customer?.id || user.id,
        restaurantId: user.id,
        restaurantName: user.businessName || user.name || "LOCAL",
        businessName: user.businessName || user.name || "LOCAL",
        businessLogoUrl: user.businessLogoUrl || "",
        tableid: "",
        cartItems,
        totalRewardPoints: customer ? totals.totalRewardPoints : 0,
        totalRedeemPoints: customer ? totals.totalRedeemPoints : 0,
        deliverycost: 0,
        servicetax: 0,
        discount: 0,
        discountamount: 0,
        totalAmount: totals.subtotalProducts,
        paymentMethod: checkout.paymentMethod,
        clientEmail: customer?.email || "",
        clientName: checkout.clientName.trim(),
        deliveryAddress: customer?.address || "",
        contactPhone: customer?.phone || "",
        orderType,
        comentary: "",
        status: "FINALIZADO",
        ticketVariant: "local-order",
      };

      const response = await addOrder(orderData);
      const savedOrder = response?.order || response;
      const today = getDateNowDayjs();
      const refreshedOrders = await filterOrderByDate(
        today.day,
        today.month,
        today.year,
        user.id,
      );
      const globalIndex = refreshedOrders.findIndex(
        (order) => order.id === savedOrder?.id,
      );
      const orderIndex =
        globalIndex >= 0
          ? refreshedOrders.length - globalIndex
          : refreshedOrders.length || undefined;
      const order = {
        ...orderData,
        ...savedOrder,
        orderIndex,
        ticketVariant: "local-order",
      };
      setCreatedOrder(order);
      setStep("success");
      await printCreatedOrder(order);
    } catch (error) {
      const message = error?.message || String(error);
      setSubmitError(message);
      showAlert(message, "warning", lobotechTheme);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "checkout") setStep("products");
    else if (step === "products") setStep("type");
    else navigate("/control-panel");
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
        {AlertComponent}
      </Box>
    </ThemeProvider>
  );
};
