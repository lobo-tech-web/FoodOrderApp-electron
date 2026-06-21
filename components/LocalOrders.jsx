import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  CssBaseline,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  ThemeProvider,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AccountBalance as TransferIcon,
  Add as AddIcon,
  ArrowBack as BackIcon,
  CheckCircle as SuccessIcon,
  Close as CloseIcon,
  DeleteOutline as DeleteIcon,
  LocalDining as DineInIcon,
  Payments as CashIcon,
  Person as PersonIcon,
  PointOfSale as MercadoPagoIcon,
  Print as PrintIcon,
  Remove as RemoveIcon,
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  Storefront as TakeAwayIcon,
} from "@mui/icons-material";
import logo from "@/assets/main/logo-lobotech-oj.png";
import mainLogo from "@/assets/main/logo-white.png";
import { FoodDetailModal } from "@/components/FoodDetailModal/FoodDetailModal.jsx";
import { useLobotechThemeContext } from "@/context/ThemeContext.jsx";
import { useProducts } from "@/context/Products.jsx";
import { useUser } from "@/context/Users.jsx";
import { addNewOrderServices } from "@/services/orders.js";
import { postReceiptServices } from "@/services/printer.js";
import { getAllUsersService } from "@/services/users.js";
import {
  calculateFinalProductPrice,
  calculateProductTotals,
  formatCurrency,
} from "@/utils/orderCalculations.js";
import { getProductOptionsForUI } from "@/utils/migrateCustomOptions.js";
import { lobotechAppFoodDetailTheme } from "@/theme/main-theme.js";

const ORDER_TYPES = [
  {
    value: "RETIRO EN LOCAL",
    title: "Para llevar",
    description: "Retira el pedido en el mostrador",
    icon: <TakeAwayIcon />,
  },
  {
    value: "CONSUMIR EN LOCAL",
    title: "Consumir en el local",
    description: "El pedido se entrega para comer aqui",
    icon: <DineInIcon />,
  },
];

const PAYMENT_METHODS = [
  { value: "EFECTIVO", label: "Efectivo", icon: <CashIcon /> },
  {
    value: "MERCADO PAGO",
    label: "Mercado Pago",
    icon: <MercadoPagoIcon />,
  },
  {
    value: "TRANSFERENCIA",
    label: "Transferencia",
    icon: <TransferIcon />,
  },
];

const INITIAL_CHECKOUT = {
  paymentMethod: "",
  clientName: "",
  userNumber: "",
};

const getProductPrice = (product) => {
  const price = Number(product.price || 0);
  const discount = Number(product.discount || 0);
  if (discount <= 0) return Math.round(price);
  return Math.round((price * (1 - discount / 100)) / 100) * 100;
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const getOrderDateParts = (order) => {
  const now = new Date();
  const orderDate = order.orderDate || {};
  return {
    date: orderDate.day
      ? `${orderDate.day}/${orderDate.month}/${orderDate.year}`
      : now.toLocaleDateString("es-AR"),
    time: orderDate.hour
      ? `${orderDate.hour}:${orderDate.minute}:${orderDate.second}`
      : now.toLocaleTimeString("es-AR"),
  };
};

const buildTicketData = (order) => {
  const { date, time } = getOrderDateParts(order);
  return {
    restaurantName: order.restaurantName || "LOCAL",
    orderIndex: order.id,
    date,
    time,
    clientName: order.clientName,
    contactPhone: order.contactPhone || "",
    deliveryAddress: "",
    orderType: order.orderType,
    paymentMethod: order.paymentMethod,
    cartItems: order.cartItems,
    totalRewardPoints: order.totalRewardPoints || 0,
    totalRedeemPoints: 0,
    cleanedTotalAmount: Number(order.totalAmount || 0),
    comentary: order.comentary || "",
  };
};

const buildTicketHtml = (order) => {
  const ticket = buildTicketData(order);
  const itemRows = ticket.cartItems
    .map((item) => {
      const options = (item.customOptions || [])
        .map(
          (option) =>
            `<div class="option">+ ${escapeHtml(option.name)}${
              Number(option.quantity || 1) > 1
                ? ` x${Number(option.quantity)}`
                : ""
            }</div>`,
        )
        .join("");

      return `
        <div class="item">
          <div class="item-line">
            <strong>${Number(item.quantity)} x ${escapeHtml(item.name)}</strong>
            <span>${escapeHtml(formatCurrency(item.price * item.quantity))}</span>
          </div>
          ${options}
        </div>`;
    })
    .join("");

  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Pedido ${escapeHtml(ticket.orderIndex)}</title>
      <style>
        @page { size: 80mm auto; margin: 3mm; }
        body { width: 72mm; margin: 0; color: #000; font: 12px/1.35 "Courier New", monospace; }
        h1, h2, p { margin: 0; }
        .center { text-align: center; }
        .header, .section { padding: 8px 0; border-bottom: 1px dashed #000; }
        .order { font-size: 18px; margin: 4px 0; }
        .item { padding: 5px 0; }
        .item-line, .total { display: flex; justify-content: space-between; gap: 8px; }
        .option { margin-left: 14px; font-size: 10px; }
        .total { padding-top: 10px; font-size: 18px; font-weight: 700; }
        .footer { padding-top: 12px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header center">
        <h1>${escapeHtml(ticket.restaurantName.toUpperCase())}</h1>
        <h2 class="order">PEDIDO #${escapeHtml(ticket.orderIndex)}</h2>
        <p>${escapeHtml(ticket.date)} - ${escapeHtml(ticket.time)}</p>
      </div>
      <div class="section">
        <strong>CLIENTE:</strong> ${escapeHtml(ticket.clientName)}<br />
        <strong>TIPO:</strong> ${escapeHtml(ticket.orderType)}<br />
        <strong>PAGO:</strong> ${escapeHtml(ticket.paymentMethod)}
      </div>
      <div class="section">${itemRows}</div>
      <div class="total">
        <span>TOTAL</span>
        <span>${escapeHtml(formatCurrency(ticket.cleanedTotalAmount))}</span>
      </div>
      <div class="footer">Gracias por su pedido</div>
    </body>
  </html>`;
};

const TouchOption = ({ active, icon, title, description, onClick }) => (
  <Button
    onClick={onClick}
    variant={active ? "contained" : "outlined"}
    color={active ? "primary" : "inherit"}
    sx={{
      minHeight: 112,
      justifyContent: "flex-start",
      textAlign: "left",
      p: 2,
      borderRadius: 2,
      borderWidth: 2,
      gap: 1.5,
      color: active ? "text.terciary" : "text.primary",
      "&:hover": { borderWidth: 2 },
    }}
  >
    <Box sx={{ display: "grid", placeItems: "center", fontSize: 34 }}>
      {icon}
    </Box>
    <Box>
      <Typography sx={{ fontWeight: 800, fontSize: "1.05rem" }}>
        {title}
      </Typography>
      {description && (
        <Typography
          sx={{
            color: active ? "inherit" : "text.secondary",
            mt: 0.4,
            textTransform: "none",
          }}
        >
          {description}
        </Typography>
      )}
    </Box>
  </Button>
);

export const LocalOrders = () => {
  const navigate = useNavigate();
  const { lobotechTheme } = useLobotechThemeContext();
  const { userState } = useUser();
  const { productState, getAllProducts } = useProducts();
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

  const handleProductClick = (product) => {
    const preparedProduct = { ...product, price: getProductPrice(product) };
    if (getProductOptionsForUI(preparedProduct).length > 0) {
      setSelectedProduct(preparedProduct);
      return;
    }
    addProductToCart({ ...preparedProduct, customOptions: [] });
  };

  const addProductToCart = (product) => {
    const item = {
      ...product,
      productId: product.productId || product.id,
      price: calculateFinalProductPrice(product),
      quantity: 1,
    };

    setCartItems((current) => [...current, item]);
    setSelectedProduct(null);
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
    const users = await getAllUsersService();
    return (users || []).find(
      (candidate) =>
        String(candidate.userNumber) === String(userNumber) &&
        candidate.role === "user",
    );
  };

  const printCreatedOrder = async (order) => {
    const savedPrinters = JSON.parse(
      localStorage.getItem("thermalPrinters") || "{}",
    );
    const ticketData = buildTicketData(order);

    if (savedPrinters.ticket) {
      try {
        const result = await postReceiptServices(
          savedPrinters.ticket,
          ticketData,
        );
        if (result?.success) {
          setPrintStatus(
            `Ticket impreso en ${savedPrinters.ticket.name || "impresora termica"}.`,
          );
          return;
        }
      } catch (error) {
        console.error("No se pudo imprimir el ticket termico:", error);
      }
    }

    if (window.electronAPI?.printOrderTicket) {
      const result = await window.electronAPI.printOrderTicket(
        buildTicketHtml(order),
      );
      if (result.printed) {
        setPrintStatus(`Ticket impreso en ${result.printerName}.`);
      } else if (result.reason === "no-printer") {
        setPrintStatus(
          "Pedido creado. No se encontro una impresora conectada.",
        );
      } else {
        setPrintStatus("Pedido creado. No se pudo imprimir el ticket.");
      }
      return;
    }

    setPrintStatus("Pedido creado. Impresion disponible desde Electron.");
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

      const rewardPoints = customer ? totals.totalRewardPoints : 0;
      const orderData = {
        userId: customer?.id || user.id,
        restaurantId: user.id,
        restaurantName: user.businessName || user.name || "LOCAL",
        tableid: "",
        cartItems,
        totalRewardPoints: rewardPoints,
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
      const order = { ...orderData, ...response };
      setCreatedOrder(order);
      setStep("success");
      await printCreatedOrder(order);
    } catch (error) {
      setSubmitError(error?.message || String(error));
    } finally {
      setLoading(false);
    }
  };

  const renderTypeStep = () => (
    <Box
      sx={{
        flex: 1,
        display: "grid",
        placeItems: "center",
        p: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ width: "min(760px, 100%)" }}>
        <Typography
          component="h1"
          sx={{
            fontFamily: "fontFamily.primary",
            fontSize: { xs: "1.8rem", md: "2.6rem" },
            textAlign: "center",
          }}
        >
          Como queres recibir tu pedido?
        </Typography>
        <Typography
          sx={{ color: "text.secondary", textAlign: "center", mt: 1, mb: 4 }}
        >
          Elegi una opcion para comenzar.
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
            gap: 2,
          }}
        >
          {ORDER_TYPES.map((option) => (
            <TouchOption
              key={option.value}
              {...option}
              active={orderType === option.value}
              onClick={() => {
                setOrderType(option.value);
                setStep("products");
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );

  const renderProductsStep = () => (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 360px" },
      }}
    >
      <Box sx={{ minWidth: 0, overflow: "auto", p: { xs: 1.5, md: 2.5 } }}>
        <TextField
          fullWidth
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar producto"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1.5 }}
        />

        <Box
          sx={{
            display: "flex",
            gap: 1,
            overflowX: "auto",
            pb: 1.5,
          }}
        >
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "contained" : "outlined"}
              onClick={() => setSelectedCategory(category)}
              sx={{
                flexShrink: 0,
                minHeight: 44,
                color:
                  selectedCategory === category
                    ? "text.terciary"
                    : "text.primary",
              }}
            >
              {category}
            </Button>
          ))}
        </Box>

        {loadError && (
          <Alert
            severity="error"
            action={<Button onClick={fetchProducts}>Reintentar</Button>}
            sx={{ mb: 2 }}
          >
            {loadError}
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              sm: "repeat(3, minmax(0, 1fr))",
              xl: "repeat(4, minmax(0, 1fr))",
            },
            gap: { xs: 1.2, md: 2 },
          }}
        >
          {visibleProducts.map((product) => (
            <Paper
              component="button"
              type="button"
              key={product.id}
              onClick={() => handleProductClick(product)}
              elevation={0}
              sx={{
                appearance: "none",
                p: 0,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                bgcolor: "background.paper",
                color: "text.primary",
                textAlign: "left",
                cursor: "pointer",
                minWidth: 0,
                "&:active": { transform: "scale(0.98)" },
                "&:focus-visible": {
                  outline: "3px solid",
                  outlineColor: "primary.main",
                },
              }}
            >
              <Box
                component="img"
                src={product.image || mainLogo}
                alt={product.name}
                sx={{
                  width: "100%",
                  aspectRatio: "4 / 3",
                  display: "block",
                  objectFit: "cover",
                  bgcolor: "background.default",
                }}
              />
              <Box sx={{ p: { xs: 1.1, sm: 1.5 } }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "0.92rem", sm: "1rem" },
                    lineHeight: 1.2,
                    minHeight: { xs: 36, sm: 39 },
                    overflowWrap: "anywhere",
                  }}
                >
                  {product.name}
                </Typography>
                <Typography
                  sx={{
                    color: "primary.main",
                    fontWeight: 900,
                    fontSize: { xs: "1rem", sm: "1.2rem" },
                    mt: 1,
                  }}
                >
                  {formatCurrency(getProductPrice(product))}
                </Typography>
                {getProductOptionsForUI(product).length > 0 && (
                  <Chip
                    size="small"
                    label="Personalizable"
                    sx={{ mt: 1, maxWidth: "100%" }}
                  />
                )}
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>

      <Paper
        square
        elevation={0}
        sx={{
          borderLeft: { lg: "1px solid" },
          borderTop: { xs: "1px solid", lg: 0 },
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
          minHeight: { xs: 300, lg: 0 },
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CartIcon color="primary" />
            <Typography sx={{ fontWeight: 900, fontSize: "1.2rem" }}>
              Tu pedido
            </Typography>
          </Box>
          <Chip label={`${cartItems.length} items`} />
        </Box>
        <Divider />

        <Stack sx={{ p: 1.5, flex: 1, overflowY: "auto" }} spacing={1}>
          {cartItems.length === 0 ? (
            <Box sx={{ textAlign: "center", color: "text.secondary", py: 5 }}>
              <CartIcon sx={{ fontSize: 48, opacity: 0.45 }} />
              <Typography>Selecciona productos para comenzar.</Typography>
            </Box>
          ) : (
            cartItems.map((item, index) => (
              <Paper
                key={`${item.productId}-${index}`}
                variant="outlined"
                sx={{ p: 1.25, borderRadius: 2 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 1,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800 }}>
                      {item.name}
                    </Typography>
                    {(item.customOptions || []).map((option, optionIndex) => (
                      <Typography
                        key={`${option.itemId || option.name}-${optionIndex}`}
                        variant="caption"
                        display="block"
                        color="text.secondary"
                      >
                        + {option.name}
                        {Number(option.quantity || 1) > 1
                          ? ` x${option.quantity}`
                          : ""}
                      </Typography>
                    ))}
                  </Box>
                  <Tooltip title="Quitar producto">
                    <IconButton
                      aria-label={`Quitar ${item.name}`}
                      color="error"
                      onClick={() => removeItem(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mt: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <IconButton
                      aria-label="Restar uno"
                      onClick={() => updateQuantity(index, -1)}
                      sx={{ border: "1px solid", borderColor: "divider" }}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Typography
                      sx={{ width: 34, textAlign: "center", fontWeight: 900 }}
                    >
                      {item.quantity}
                    </Typography>
                    <IconButton
                      aria-label="Sumar uno"
                      onClick={() => updateQuantity(index, 1)}
                      sx={{ border: "1px solid", borderColor: "divider" }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                  <Typography sx={{ fontWeight: 900 }}>
                    {formatCurrency(item.price * item.quantity)}
                  </Typography>
                </Box>
              </Paper>
            ))
          )}
        </Stack>

        <Divider />
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              mb: 1.5,
            }}
          >
            <Typography sx={{ fontSize: "1.1rem", fontWeight: 700 }}>
              Total
            </Typography>
            <Typography
              sx={{
                fontSize: "1.6rem",
                color: "primary.main",
                fontWeight: 900,
              }}
            >
              {formatCurrency(totals.subtotalProducts)}
            </Typography>
          </Box>
          <Button
            fullWidth
            size="large"
            variant="contained"
            disabled={!cartItems.length}
            onClick={() => setStep("checkout")}
            sx={{
              minHeight: 56,
              color: "text.terciary",
              fontWeight: 900,
              fontSize: "1rem",
            }}
          >
            Continuar
          </Button>
        </Box>
      </Paper>
    </Box>
  );

  const renderCheckoutStep = () => (
    <Box sx={{ flex: 1, overflow: "auto", p: { xs: 2, md: 4 } }}>
      <Box sx={{ width: "min(920px, 100%)", mx: "auto" }}>
        <Typography
          component="h1"
          sx={{
            fontFamily: "fontFamily.primary",
            fontSize: { xs: "1.7rem", md: "2.2rem" },
          }}
        >
          Finalizar pedido
        </Typography>
        <Typography sx={{ color: "text.secondary", mt: 0.5, mb: 3 }}>
          Completa los datos para confirmar.
        </Typography>

        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 2 }}>
          <Typography sx={{ fontWeight: 900, fontSize: "1.15rem", mb: 2 }}>
            Como queres pagar?
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
              gap: 1.5,
            }}
          >
            {PAYMENT_METHODS.map((method) => (
              <TouchOption
                key={method.value}
                icon={method.icon}
                title={method.label}
                active={checkout.paymentMethod === method.value}
                onClick={() =>
                  setCheckout((current) => ({
                    ...current,
                    paymentMethod: method.value,
                  }))
                }
              />
            ))}
          </Box>
        </Paper>

        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 2 }}>
          <Typography sx={{ fontWeight: 900, fontSize: "1.15rem", mb: 2 }}>
            Datos del cliente
          </Typography>
          <Stack spacing={2}>
            <TextField
              fullWidth
              required
              label="Nombre del cliente"
              value={checkout.clientName}
              onChange={(event) =>
                setCheckout((current) => ({
                  ...current,
                  clientName: event.target.value,
                }))
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
              inputProps={{ style: { fontSize: 18 } }}
            />
            <TextField
              fullWidth
              label="Numero de usuario LoboTech (opcional)"
              value={checkout.userNumber}
              onChange={(event) => {
                const value = event.target.value;
                if (value === "" || /^\d+$/.test(value)) {
                  setCheckout((current) => ({
                    ...current,
                    userNumber: value,
                  }));
                }
              }}
              helperText="Solo es necesario si queres sumar los puntos de este pedido."
              inputMode="numeric"
              inputProps={{ style: { fontSize: 18 } }}
            />
          </Stack>
        </Paper>

        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        <Paper
          sx={{
            p: 2,
            display: "flex",
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
          <Box>
            <Typography color="text.secondary">Total del pedido</Typography>
            <Typography
              sx={{
                color: "primary.main",
                fontSize: "2rem",
                fontWeight: 900,
              }}
            >
              {formatCurrency(totals.subtotalProducts)}
            </Typography>
          </Box>
          <Button
            size="large"
            variant="contained"
            onClick={createOrder}
            disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SuccessIcon />
              )
            }
            sx={{
              minHeight: 58,
              px: 4,
              color: "text.terciary",
              fontWeight: 900,
              fontSize: "1rem",
            }}
          >
            {loading ? "Creando pedido..." : "Crear pedido"}
          </Button>
        </Paper>
      </Box>
    </Box>
  );

  const renderSuccessStep = () => (
    <Box
      sx={{
        flex: 1,
        display: "grid",
        placeItems: "center",
        p: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "min(620px, 100%)",
          border: "1px solid",
          borderColor: "divider",
          textAlign: "center",
          p: { xs: 3, md: 5 },
        }}
      >
        <SuccessIcon sx={{ color: "success.main", fontSize: 76 }} />
        <Typography
          component="h1"
          sx={{
            fontFamily: "fontFamily.primary",
            fontSize: { xs: "1.7rem", md: "2.2rem" },
            mt: 2,
          }}
        >
          Pedido creado exitosamente
        </Typography>
        <Typography sx={{ color: "text.secondary", mt: 1 }}>
          Numero de pedido
        </Typography>
        <Typography
          sx={{
            color: "primary.main",
            fontSize: { xs: "2.5rem", md: "3.5rem" },
            fontWeight: 900,
            lineHeight: 1.1,
            overflowWrap: "anywhere",
          }}
        >
          #{createdOrder?.id}
        </Typography>
        {printStatus && (
          <Alert
            severity={printStatus.includes("impreso en") ? "success" : "info"}
            icon={<PrintIcon />}
            sx={{ mt: 3, textAlign: "left" }}
          >
            {printStatus}
          </Alert>
        )}
        <Button
          fullWidth
          size="large"
          variant="contained"
          onClick={resetOrder}
          sx={{
            minHeight: 60,
            mt: 3,
            color: "text.terciary",
            fontWeight: 900,
            fontSize: "1.05rem",
          }}
        >
          Crear siguiente pedido
        </Button>
      </Paper>
    </Box>
  );

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
              onClick={() => {
                if (step === "checkout") setStep("products");
                else if (step === "products") setStep("type");
                else navigate("/control-panel");
              }}
            >
              <BackIcon />
            </IconButton>
            <Avatar
              src={logo}
              variant="square"
              sx={{ width: 110, height: 38, objectFit: "contain" }}
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

        {step === "type" && renderTypeStep()}
        {step === "products" && renderProductsStep()}
        {step === "checkout" && renderCheckoutStep()}
        {step === "success" && renderSuccessStep()}

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
