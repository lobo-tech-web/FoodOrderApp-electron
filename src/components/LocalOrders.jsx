import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { ArrowBack as BackIcon, Close as CloseIcon } from "@mui/icons-material";
import logo from "@/assets/main/logo-lobotech-oj.png";
import mainLogo from "@/assets/main/logo-white.png";
import { FoodDetailModal } from "@/components/FoodDetailModal/FoodDetailModal.jsx";
import { useLobotechThemeContext } from "@/context/ThemeContext.jsx";
import { useProducts } from "@/context/Products.jsx";
import { useUser } from "@/context/Users.jsx";
import { addNewOrderServices } from "@/services/orders.js";
import { getAllUsersService } from "@/services/users.js";
import {
  calculateFinalProductPrice,
  calculateProductTotals,
} from "@/utils/orderCalculations.js";
import { getProductOptionsForUI } from "@/utils/migrateCustomOptions.js";
import { lobotechAppFoodDetailTheme } from "@/theme/main-theme.js";
import { useThermalPrinter } from "@/components/PanelComponents/ModalEditOrder/PrinterConfig/useThermalPrinter.js";
import {
  getPaymentMethods,
  INITIAL_CHECKOUT,
} from "./local-orders/constants.jsx";
import { buildTicketHtml, getProductPrice } from "./local-orders/orderUtils.js";
import { OrderTypeStep } from "./local-orders/OrderTypeStep.jsx";
import { ProductSelectionStep } from "./local-orders/ProductSelectionStep.jsx";
import { CheckoutStep } from "./local-orders/CheckoutStep.jsx";
import { SuccessStep } from "./local-orders/SuccessStep.jsx";

export const LocalOrders = () => {
  const navigate = useNavigate();
  const { lobotechTheme } = useLobotechThemeContext();
  const { userState, getClientByUserNumber } = useUser();
  const { productState, getAllProducts } = useProducts();
  const { printHtml } = useThermalPrinter();
  const user = userState.user || {};

  const [step, setStep] = useState("type");
  const [orderType, setOrderType] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("TODOS");
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
        (product) =>
          product.status !== false && Number(product.redeemPoints || 0) === 0,
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
        selectedCategory === "TODOS" ||
        product.category?.name === selectedCategory;
      const matchesSearch =
        !term ||
        product.name?.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [availableProducts, search, selectedCategory]);

  const totals = useMemo(() => calculateProductTotals(cartItems), [cartItems]);

  const resetOrder = () => {
    setStep("type");
    setOrderType("");
    setCartItems([]);
    setSearch("");
    setSelectedCategory("TODOS");
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
    if (getProductOptionsForUI(preparedProduct).length > 0) {
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

  const printCreatedOrder = async (order) => {
    const result = await printHtml("ticket", buildTicketHtml(order));
    if (result?.printed) {
      setPrintStatus(
        result.mode === "manual"
          ? "Ticket impreso con la impresora seleccionada."
          : `Ticket impreso en ${result.printerName}.`,
      );
    } else if (result?.reason === "no-printer") {
      setPrintStatus("Pedido creado. Windows no encontro impresoras.");
    } else {
      setPrintStatus("Pedido creado. No se pudo imprimir el ticket.");
    }
  };

  const createOrder = async () => {
    setSubmitError("");
    if (!checkout.paymentMethod) {
      setSubmitError("Selecciona como se pagara el pedido.");
      return;
    }
    if (!checkout.clientName.trim()) {
      setSubmitError("Ingresa el nombre del cliente.");
      return;
    }

    setLoading(true);
    try {
      let customer = null;
      if (checkout.userNumber.trim()) {
        customer = await findCustomer(checkout.userNumber.trim());
        if (!customer) {
          throw new Error(
            "No encontramos una cuenta con ese numero de usuario LoboTech.",
          );
        }
      }

      const orderData = {
        userId: customer?.id || user.id,
        restaurantId: user.id,
        restaurantName: user.businessName || user.name || "LOCAL",
        tableid: "",
        cartItems,
        totalRewardPoints: customer ? totals.totalRewardPoints : 0,
        totalRedeemPoints: 0,
        deliverycost: 0,
        servicetax: 0,
        discount: 0,
        discountamount: 0,
        totalAmount: totals.subtotalProducts,
        paymentMethod: checkout.paymentMethod,
        clientEmail: customer?.email || user.email || "",
        clientName: checkout.clientName.trim(),
        deliveryAddress: "",
        contactPhone: customer?.phone || "",
        orderType,
        comentary: "PEDIDO CREADO EN LOCAL",
        status: "PENDIENTE A CONFIRMAR",
      };

      const response = await addNewOrderServices(orderData);
      const order = { ...orderData, ...(response?.order || response) };
      setCreatedOrder(order);
      setStep("success");
      await printCreatedOrder(order);
    } catch (error) {
      setSubmitError(error?.message || String(error));
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
                  sx={{ display: { xs: "none", sm: "block" } }}
                >
                  {orderType}
                </Typography>
              )}
            </Box>
            {step !== "type" && step !== "success" && (
              <Button
                color="error"
                variant="outlined"
                startIcon={<CloseIcon />}
                onClick={resetOrder}
                sx={{ minHeight: 44 }}
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
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
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
      </Box>
    </ThemeProvider>
  );
};
