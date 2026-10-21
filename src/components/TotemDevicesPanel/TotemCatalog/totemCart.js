export const money = (value) =>
  Number(value || 0).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
  });

export const optionLimits = (option) => ({
  min: Math.max(
    Number(option.minSelected || 0),
    option.required || option.type === "unique" ? 1 : 0,
  ),
  max: option.type === "unique" ? 1 : (option.maxSelected ?? 99),
});

export const linePrice = (product, selections) =>
  (Math.round(Number(product.displayPrice) * 100) +
    selections.reduce((sum, selected) => {
      const item = product.customOptions
        .find((option) => option.id === selected.optionId)
        ?.items.find((entry) => entry.id === selected.itemId);

      return (
        sum + Math.round(Number(item?.extraCost || 0) * 100) * selected.quantity
      );
    }, 0)) /
  100;

export const cartTotals = (cart) =>
  cart.reduce(
    (total, item) => ({
      amount: total.amount + Math.round(item.unitPrice * 100) * item.quantity,
      points:
        total.points + Number(item.product.redeemPoints || 0) * item.quantity,
    }),
    { amount: 0, points: 0 },
  );

export const checkoutPayload = (cart, form, orderType) => ({
  clientName: form.name.trim(),
  cuit: form.cuit.trim(),
  orderType,
  expectedTotal: cartTotals(cart).amount / 100,
  cartItems: cart.map((item) => ({
    productId: item.product.id,
    quantity: item.quantity,
    customOptions: item.selections,
    productComment: item.comment,
  })),
});
