import { getProductOptionsForUI } from './migrateCustomOptions.js';
import { calculateFinalProductPrice, getProductBasePrice } from './orderCalculations.js';

export const findCartProduct = (products, item) => {
  const id = item?.productId || item?.id;
  return id ? products.find(product => String(product.id) === String(id)) : undefined;
};

export const buildCartProductForEditing = (product, item) => ({
  ...product,
  productId: product.id,
  price: getProductBasePrice(product),
  customizationOptions: structuredClone(getProductOptionsForUI(product)),
  customOptions: structuredClone(item.customOptions || []),
  productComment: item.productComment || '',
  quantity: Number(item.quantity) || 1,
});

export const replaceCustomizedCartItem = (items, index, customizedProduct) => {
  if (!Number.isInteger(index) || !items[index]) return items;

  const { customizationOptions, productCustomOptions, ...customized } = customizedProduct;

  return items.map((item, itemIndex) => itemIndex === index ? {
    ...item,
    ...customized,
    productId: item.productId || item.id,
    quantity: Number(item.quantity) || 1,
    price: calculateFinalProductPrice(customized),
  } : item);
};
