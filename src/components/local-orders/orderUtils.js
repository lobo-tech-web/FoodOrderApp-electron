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

export const buildTicketHtml = (order) => {
  const { date, time } = getOrderDateParts(order);
  const itemRows = (order.cartItems || [])
    .map((item) => {
      const options = (item.customOptions || [])
        .map(
          (option) =>
            `<div class="option">+ ${escapeHtml(option.name)}${
              Number(option.quantity || 1) > 1
                ? ` x${Number(option.quantity)}`
                : ''
            }</div>`
        )
        .join('');

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
      <title>Pedido ${escapeHtml(order.id)}</title>
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
        <h2 class="order">PEDIDO #${escapeHtml(order.id)}</h2>
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
