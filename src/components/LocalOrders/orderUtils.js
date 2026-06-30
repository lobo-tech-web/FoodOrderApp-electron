import {
  formatCurrency,
} from '@/utils/orderCalculations.js';

export const getProductPrice = (product) => {
  const price = Number(product.price || 0);
  const discount = Number(product.discount || 0);
  if (discount <= 0) return Math.round(price);
  return Math.round((price * (1 - discount / 100)) / 100) * 100;
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const getOrderDateParts = (order) => {
  const now = new Date();
  const orderDate = order.orderDate || {};
  return {
    date: orderDate.day
      ? `${orderDate.day}/${orderDate.month}/${orderDate.year}`
      : now.toLocaleDateString('es-AR'),
    time: orderDate.hour
      ? `${orderDate.hour}:${orderDate.minute}:${orderDate.second}`
      : now.toLocaleTimeString('es-AR'),
  };
};

const getOrderNumber = (order) =>
  order.orderNumber || order.orderIndex || order.id;

const getCustomOptionsRows = (item, className = 'option') =>
  (item.customOptions || [])
    .map(
      (option) =>
        `<div class="${className}">+ ${escapeHtml(option.name)}${
          Number(option.quantity || 1) > 1
            ? ` x${Number(option.quantity)}`
            : ''
        }</div>`
    )
    .join('');

export const buildTicketHtml = (order) => {
  const { date, time } = getOrderDateParts(order);
  const itemRows = (order.cartItems || [])
    .map((item) => {
      const options = getCustomOptionsRows(item);

      return `
        <div class="item">
          <div class="item-line">
            <strong>${Number(item.quantity)} x ${escapeHtml(item.name)}</strong>
            <span>${escapeHtml(formatCurrency(item.price * item.quantity))}</span>
          </div>
          ${options}
        </div>`;
    })
    .join('');

  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Pedido ${escapeHtml(getOrderNumber(order))}</title>
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
        <h1>${escapeHtml(
          (order.restaurantName || 'LOCAL').toUpperCase()
        )}</h1>
        <h2 class="order">PEDIDO #${escapeHtml(getOrderNumber(order))}</h2>
        <p>${escapeHtml(date)} - ${escapeHtml(time)}</p>
      </div>
      <div class="section">
        <strong>CLIENTE:</strong> ${escapeHtml(order.clientName)}<br />
        <strong>TIPO:</strong> ${escapeHtml(order.orderType)}<br />
        <strong>PAGO:</strong> ${escapeHtml(order.paymentMethod)}
      </div>
      <div class="section">${itemRows}</div>
      <div class="total">
        <span>TOTAL</span>
        <span>${escapeHtml(formatCurrency(Number(order.totalAmount || 0)))}</span>
      </div>
      <div class="footer">Gracias por su pedido</div>
    </body>
  </html>`;
};

export const buildKitchenHtml = (order) => {
  const { date, time } = getOrderDateParts(order);
  const itemRows = (order.cartItems || [])
    .map((item) => {
      const options = getCustomOptionsRows(item, 'option-item');
      const productComment = item.productComment
        ? `<div class="product-comment">NOTA: ${escapeHtml(
            item.productComment,
          )}</div>`
        : '';

      return `
        <div class="item-container">
          <div class="item-header">
            <span class="item-qty">${Number(item.quantity || 1)}x</span>
            <span class="item-name">${escapeHtml(item.name).toUpperCase()}</span>
          </div>
          ${options ? `<div class="item-options">${options}</div>` : ''}
          ${productComment}
        </div>`;
    })
    .join('');

  const orderComment = order.comentary
    ? `<div class="comments">
        <div class="comments-title">COMENTARIO GENERAL</div>
        ${escapeHtml(order.comentary)}
      </div>`
    : '';

  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Comanda ${escapeHtml(getOrderNumber(order))}</title>
      <style>
        @page { size: 80mm auto; margin: 3mm; }
        body { width: 72mm; margin: 0; color: #000; font: 13px/1.25 Arial, sans-serif; }
        h1, h2, p { margin: 0; }
        .center { text-align: center; }
        .header { text-align: center; padding-bottom: 6px; border-bottom: 2px solid #000; }
        .order-number { font-size: 24px; font-weight: 900; margin: 4px 0; }
        .date-time { font-size: 12px; font-weight: 700; }
        .order-type { display: inline-block; margin-top: 6px; padding: 4px 8px; border: 2px solid #000; font-weight: 900; }
        .customer { margin: 8px 0; padding: 6px; border: 1px solid #000; font-size: 12px; }
        .section-title { text-align: center; font-weight: 900; font-size: 16px; text-decoration: underline; margin: 8px 0 5px; }
        .item-container { padding: 6px 0; border-bottom: 1px dashed #000; }
        .item-header { display: flex; gap: 8px; align-items: flex-start; }
        .item-qty { min-width: 34px; font-size: 18px; font-weight: 900; }
        .item-name { flex: 1; font-size: 16px; font-weight: 900; overflow-wrap: anywhere; }
        .item-options { margin: 3px 0 0 42px; font-size: 13px; font-weight: 700; }
        .option-item { margin-bottom: 2px; }
        .product-comment, .comments { margin-top: 6px; padding: 5px; border: 1px dashed #000; font-weight: 800; }
        .comments-title { text-align: center; text-decoration: underline; margin-bottom: 4px; }
        .footer { margin-top: 12px; padding-top: 8px; border-top: 2px solid #000; text-align: center; font-size: 12px; font-weight: 900; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>COMANDA DE COCINA</h1>
        <div class="order-number">PEDIDO #${escapeHtml(getOrderNumber(order))}</div>
        <div class="date-time">${escapeHtml(date)} - ${escapeHtml(time)}</div>
        <div class="order-type">${escapeHtml(order.orderType)}</div>
      </div>
      <div class="customer">
        <strong>CLIENTE:</strong> ${escapeHtml(order.clientName)}<br />
        <strong>PAGO:</strong> ${escapeHtml(order.paymentMethod)}
      </div>
      <div class="section-title">PRODUCTOS</div>
      ${itemRows}
      ${orderComment}
      <div class="footer">FoodOrderApp Admin</div>
    </body>
  </html>`;
};
