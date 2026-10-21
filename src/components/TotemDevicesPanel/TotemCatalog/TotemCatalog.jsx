import { useState, useEffect, useCallback } from "react";

// ---- Material UI ----
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
// ---------------------

// ---- Steps ----
import { TotemOrderTypeStep } from "./steps/TotemOrderTypeStep.jsx";
import { TotemProductSelectionStep } from "./steps/TotemProductSelectionStep.jsx";
import { TotemProductModal } from "./steps/TotemProductModal.jsx";
import { TotemCartStep } from "./steps/TotemCartStep.jsx";
import { TotemIdentifyCustomer } from "./steps/TotemIdentifyCustomer.jsx";
import { TotemCustomerStep } from "./steps/TotemCustomerStep.jsx";
import { TotemPaymentStep } from "./steps/TotemPaymentStep.jsx";
import { TotemRecoveryStep } from "./steps/TotemRecoveryStep.jsx";
// ---------------

// ---- Utils ----
import { TOTEM_ORDER_TYPES } from "./totemCatalogUtils/totemOrderTypes.jsx";
import { useTotemPurchase } from "./useTotemPurchase.js";
import { cartTotals, checkoutPayload } from "./totemCart.js";
// ---------------

export const TotemCatalog = ({ device, connectionError }) => {
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [reload, setReload] = useState(0);

  const [search, setSearch] = useState("");
  const [catalog, setCatalog] = useState(null);
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState(null);
  const [cart, setCart] = useState([]);

  const [orderType, setOrderType] = useState("");
  const [form, setForm] = useState({ name: "", cuit: "" });
  const [customer, setCustomer] = useState(null);

  const purchase = useTotemPurchase();

  const selectedOrderType = TOTEM_ORDER_TYPES.find(
    (option) => option.value === orderType,
  );
  const canChangeOrderType =
    !purchase.busy &&
    ["shopping", "cart", "identify", "customer"].includes(purchase.phase);

  const changeOrderType = () => {
    if (!canChangeOrderType) return;
    setOrderType("");
    purchase.setPhase("shopping");
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    window.totemAPI
      .getCatalog()
      .then((result) => {
        if (!active) return;
        if (!result.ok) {
          setLoadError(result.message);
          return;
        }
        setCatalog(result.catalog);
        setLoadError("");
      })
      .catch(() => {
        if (active) setLoadError("No se pudo cargar el menú");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [device.id, reload]);

  const updateQuantity = (key, quantity) =>
    setCart((current) =>
      current
        .map((line) => (line.key === key ? { ...line, quantity } : line))
        .filter((line) => line.quantity > 0),
    );

  const continueOrder = () => {
    setCustomer(null);
    setForm({ name: "", cuit: "" });

    purchase.setPhase("identify");
  };

  const finish = useCallback(async () => {
    const result = await purchase.finish();

    if (result?.ok) {
      setCart([]);
      setForm({ name: "", cuit: "" });
      setCustomer(null);
      setOrderType("");
      setSearch("");
      setCategories([]);
      setReload((value) => value + 1);
    }
  }, [purchase.finish]);

  return (
    <Box
      sx={{
        height: "var(--totem-content-height, 100dvh)",
        display:
          ["identify", "customer", "cart"].includes(purchase.phase) ||
          (!orderType && purchase.phase === "shopping")
            ? "flex"
            : "block",
        flexDirection: "column",
        overflowY: "auto",
        bgcolor: "var(--totem-page-background)",
        color: "text.primary",
        "& .MuiButton-root": { letterSpacing: 0, borderRadius: 1 },
      }}
    >
      <Stack
        component="header"
        direction="row"
        useFlexGap
        spacing={2}
        alignItems="center"
        sx={{
          p: 2,
          flexShrink: 0,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          flexWrap: "wrap",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{ flex: "1 1 180px", minWidth: 0 }}
        >
          {catalog?.restaurant?.businessLogoUrl && (
            <Box
              component="img"
              src={catalog.restaurant.businessLogoUrl}
              alt=""
              sx={{
                width: 48,
                height: 48,
                flexShrink: 0,
                objectFit: "contain",
              }}
            />
          )}

          <Typography
            sx={{
              fontFamily: "fontFamily.primary",
              fontSize: "1.5rem",
              overflowWrap: "anywhere",
              textTransform: "uppercase",
            }}
          >
            {catalog?.restaurant?.businessName || device.name}
          </Typography>
        </Stack>

        {selectedOrderType && (
          <Button
            variant="contained"
            startIcon={selectedOrderType.icon}
            disabled={!canChangeOrderType}
            onClick={changeOrderType}
            sx={{
              m: 0,
              ml: "auto",
              px: 2,
              py: 1,
              minHeight: 44,
              flexShrink: 0,
              textAlign: "center",
            }}
          >
            {selectedOrderType.title}
          </Button>
        )}
      </Stack>

      {connectionError && (
        <Alert severity="warning">
          No se pudo verificar la conexión con el local. {connectionError}
        </Alert>
      )}

      {purchase.phase === "recovering" ? (
        <TotemRecoveryStep
          error={purchase.error}
          onRecover={purchase.recover}
        />
      ) : purchase.phase === "payment" ? (
        <TotemPaymentStep
          checkout={purchase.checkout}
          error={purchase.error}
          busy={purchase.busy}
          onRecover={purchase.recover}
          onCancel={purchase.cancel}
          onFinish={finish}
        />
      ) : purchase.phase === "identify" ? (
        <TotemIdentifyCustomer
          restaurant={catalog?.restaurant || { businessName: device.name }}
          requiresIdentification={cartTotals(cart).points > 0}
          onBack={() => purchase.setPhase("cart")}
          onIdentified={(identified) => {
            setCustomer(identified);
            setForm({ name: identified.name, cuit: identified.cuit });
            purchase.setPhase("customer");
          }}
          onGuest={() => {
            setCustomer(null);
            setForm({ name: "", cuit: "" });
            purchase.setPhase("customer");
          }}
        />
      ) : purchase.phase === "customer" ? (
        <TotemCustomerStep
          cart={cart}
          form={form}
          setForm={setForm}
          customer={customer}
          onBack={() => purchase.setPhase("identify")}
          onPay={() =>
            purchase.create(
              checkoutPayload(
                cart,
                customer
                  ? { name: customer.name, cuit: customer.cuit }
                  : { name: form.name, cuit: "" },
                orderType,
              ),
            )
          }
          busy={purchase.busy}
          error={purchase.error}
        />
      ) : purchase.phase === "cart" ? (
        <Box sx={{ flex: 1, display: "flex", p: { xs: 2, sm: 4 } }}>
          <TotemCartStep
            cart={cart}
            onClear={() => setCart([])}
            onQuantity={updateQuantity}
            onContinue={continueOrder}
            onBack={() => purchase.setPhase("shopping")}
            disabled={loading || !catalog}
          />
        </Box>
      ) : !orderType ? (
        <TotemOrderTypeStep onSelect={setOrderType} />
      ) : (
        <TotemProductSelectionStep
          catalog={catalog}
          loading={loading}
          loadError={loadError}
          search={search}
          onSearch={setSearch}
          categories={categories}
          onCategories={setCategories}
          cart={cart}
          onViewCart={() => purchase.setPhase("cart")}
          onReload={() => setReload((value) => value + 1)}
          onSelectProduct={setProduct}
        />
      )}

      {product && (
        <TotemProductModal
          key={product.id}
          product={product}
          onClose={() => setProduct(null)}
          onAdd={(line) => {
            if (cart.length >= 100)
              setLoadError("El carrito admite hasta 100 productos distintos.");
            else setCart((current) => [...current, line]);
            setProduct(null);
          }}
        />
      )}
    </Box>
  );
};
