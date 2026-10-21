import { useState, useEffect, useMemo, useRef } from "react";

// ---- Material UI ----
import {
  Alert,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
// Icons
import {
  Close as CloseIcon,
  RestaurantMenu as RestaurantMenuIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Shared ----
import { TotemProductInfo } from "./shared/TotemProductInfo.jsx";
import { TotemCustomOption } from "./shared/TotemCustomOption.jsx";
import { TotemProductFooter } from "./shared/TotemProductFooter.jsx";
import { TOTEM_PRODUCT_SIZES } from "./shared/totemProductSizes.js";
// ----------------

// ---- Utils ----
import { linePrice, optionLimits } from "../totemCart.js";
// ---------------

export const TotemProductModal = ({ product, onClose, onAdd }) => {
  const optionRefs = useRef({});

  const [selections, setSelections] = useState([]);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [invalidOptionId, setInvalidOptionId] = useState(null);

  const customOptions = useMemo(() => {
    const options = Array.isArray(product?.customOptions)
      ? product.customOptions
      : Array.isArray(product?.productCustomOptions)
        ? product.productCustomOptions
        : [];
    return options
      .filter((option) => option.status !== false)
      .map((option) => ({
        ...option,
        items: (Array.isArray(option.items) ? option.items : [])
          .filter((item) => item.status !== false)
          .sort((a, b) => Number(a.priority ?? 10) - Number(b.priority ?? 10)),
      }))
      .sort((a, b) => Number(a.priority ?? 10) - Number(b.priority ?? 10));
  }, [product]);

  // El precio, la validación y el carrito usan las mismas opciones visibles.
  const cartProduct = useMemo(
    () => (product ? { ...product, customOptions } : null),
    [product, customOptions],
  );

  const totalPrice = cartProduct ? linePrice(cartProduct, selections) : 0;
  const hasCustomOptions = customOptions.length > 0;
  const allowComment = product?.allowComment === true;

  useEffect(() => {
    setSelections([]);
    setComment("");
    setError("");
    setInvalidOptionId(null);
  }, [product?.id]);

  const change = (option, item, delta = null) => {
    setSelections((previous) => {
      const current = previous.find(
        (entry) => entry.optionId === option.id && entry.itemId === item.id,
      );

      const quantity =
        delta === null ? (current ? 0 : 1) : (current?.quantity || 0) + delta;

      const others = previous.filter(
        (entry) =>
          entry.optionId !== option.id ||
          (option.type !== "unique" && entry.itemId !== item.id),
      );

      const count = others
        .filter((entry) => entry.optionId === option.id)
        .reduce((sum, entry) => sum + entry.quantity, 0);

      if (
        quantity < 0 ||
        quantity > 99 ||
        count + quantity > optionLimits(option).max
      ) {
        return previous;
      }

      return quantity
        ? [...others, { optionId: option.id, itemId: item.id, quantity }]
        : others;
    });

    setError("");
    setInvalidOptionId(null);
  };

  const handleAdd = () => {
    if (!cartProduct) return;

    for (const option of customOptions) {
      const count = selections
        .filter((entry) => entry.optionId === option.id)
        .reduce((sum, entry) => sum + entry.quantity, 0);

      const limits = optionLimits(option);

      if (count < limits.min || count > limits.max) {
        setError(`Completá ${option.name}`);
        setInvalidOptionId(option.id);
        optionRefs.current[option.id]?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
        return;
      }
    }

    onAdd({
      key: crypto.randomUUID(),
      product: cartProduct,
      selections,
      comment: allowComment ? comment.trim() : "",
      quantity: 1,
      unitPrice: totalPrice,
    });
  };

  if (!product) return null;

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth={hasCustomOptions ? "lg" : "sm"}
      scroll="paper"
      aria-labelledby="totem-product-dialog-title"
      PaperProps={{
        sx: {
          bgcolor: "background.default",
          borderRadius: { xs: 1, sm: 2 },
          overflow: "hidden",
          maxHeight: "92dvh",
        },
      }}
    >
      <DialogTitle
        id="totem-product-dialog-title"
        sx={{
          bgcolor: "background.main",
          borderBottom: "1px solid",
          borderColor: "divider",
          p: 1.5,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
        >
          <Box sx={{ width: TOTEM_PRODUCT_SIZES.controlSize, flexShrink: 0 }} />

          <Typography
            component="span"
            sx={{
              flex: 1,
              textAlign: "center",
              fontFamily: "fontFamily.primary",
              fontSize: TOTEM_PRODUCT_SIZES.modalTitleFontSize,
              overflowWrap: "anywhere",
            }}
          >
            {hasCustomOptions ? "PERSONALIZÁ TU PEDIDO" : product.name}
          </Typography>

          <IconButton
            onClick={onClose}
            aria-label="Cerrar producto"
            sx={{
              width: TOTEM_PRODUCT_SIZES.controlSize,
              height: TOTEM_PRODUCT_SIZES.controlSize,
              flexShrink: 0,
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          p: TOTEM_PRODUCT_SIZES.contentPadding,
          overflowY: "auto",
          overscrollBehavior: "contain",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: hasCustomOptions
              ? { xs: "1fr", md: "minmax(0, 0.9fr) minmax(0, 1.1fr)" }
              : "1fr",
            alignItems: "start",
            gap: TOTEM_PRODUCT_SIZES.sectionGap,
          }}
        >
          <TotemProductInfo
            product={product}
            compact={!hasCustomOptions}
            comment={comment}
            onCommentChange={setComment}
          />

          {hasCustomOptions && (
            <Stack
              spacing={TOTEM_PRODUCT_SIZES.sectionGap}
              sx={{ minWidth: 0 }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <RestaurantMenuIcon color="primary" fontSize="medium" />

                <Typography
                  sx={{
                    fontFamily: "fontFamily.primary",
                    fontSize: TOTEM_PRODUCT_SIZES.optionTitleFontSize,
                    color: "primary.main",
                    borderBottom: "1px solid",
                  }}
                >
                  ELEGÍ TUS OPCIONES
                </Typography>
              </Stack>

              {error && <Alert severity="warning">{error}</Alert>}

              {customOptions.map((option) => (
                <Box
                  key={option.id}
                  ref={(element) => {
                    optionRefs.current[option.id] = element;
                  }}
                  sx={{ scrollMarginTop: 8 }}
                >
                  <TotemCustomOption
                    option={option}
                    selections={selections}
                    onChange={change}
                    hasError={invalidOptionId === option.id}
                  />
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </DialogContent>

      <TotemProductFooter
        price={totalPrice}
        redeemPoints={product.redeemPoints}
        onClose={onClose}
        onAdd={handleAdd}
      />
    </Dialog>
  );
};
