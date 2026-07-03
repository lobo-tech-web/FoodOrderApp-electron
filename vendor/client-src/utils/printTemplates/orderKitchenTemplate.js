import {
  formatCustomOptionForKitchenPrint,
  getSortedCustomOptionsForPrint,
} from '@/utils/printCustomOptions.js';

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const normalizeUpper = (value, fallback = '') =>
  String(value || fallback).trim().toUpperCase();

const getOrderDateParts = (order = {}) => {
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

const getOrderNumber = (order = {}, options = {}) =>
  options.orderIndex ||
  order.orderIndex ||
  order.orderNumber ||
  order.number ||
  order.id ||
  '';

const flattenCartItemsByQuantity = (cartItems = []) => {
  if (!Array.isArray(cartItems)) return [];

  return cartItems.flatMap((item) => {
    const quantity = Math.max(1, Number(item.quantity || 1));

    return Array.from({ length: quantity }, () => ({
      ...item,
      quantity: 1,
    }));
  });
};

const getOptionRowsHtml = (item = {}) => {
  const options = getSortedCustomOptionsForPrint(item.customOptions || []);

  if (!options.length) return '';

  return `
    <div class="item-options">
      ${options
      .map(
        (option) =>
          `<div class="option-item">- ${escapeHtml(
            formatCustomOptionForKitchenPrint(option),
          )}</div>`,
      )
      .join('')}
    </div>
  `;
};

const getProductCommentHtml = (item = {}) => {
  const comment = String(item.productComment || '').trim();

  if (!comment) return '';

  return `
    <div class="product-comment">
      <strong>NOTA:</strong> ${escapeHtml(normalizeUpper(comment))}
    </div>
  `;
};

const getProductsHtml = (order = {}) =>
  flattenCartItemsByQuantity(order.cartItems || [])
    .map(
      (item) => `
        <div class="item-container">
          <div class="item-header">
            <span class="item-name">${escapeHtml(
        normalizeUpper(item.name, 'PRODUCTO'),
      )}</span>
          </div>
          ${getOptionRowsHtml(item)}
          ${getProductCommentHtml(item)}
        </div>
      `,
    )
    .join('');

const getOrderTypeClass = (orderType = '') => {
  if (orderType === 'RETIRO EN LOCAL') return 'order-type order-type-takeaway';
  if (orderType === 'ESPERA EN LOCAL') return 'order-type order-type-waiting';
  return 'order-type';
};

const getCommentHtml = (order = {}) => {
  const comment = String(order.comentary || order.comment || '').trim();

  if (!comment || comment === 'SIN COMENTARIOS') return '';

  return `
    <div class="comments">
      <div class="comments-title">COMENTARIOS</div>
      <div>${escapeHtml(normalizeUpper(comment))}</div>
    </div>
  `;
};

export const buildOrderKitchenHtml = (order = {}, options = {}) => {
  const { date, time } = getOrderDateParts(order);
  const orderNumber = getOrderNumber(order, options);
  const orderType = normalizeUpper(order.orderType, 'SIN TIPO');
  const orderTypeClass = getOrderTypeClass(orderType);

  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Comanda Pedido #${escapeHtml(orderNumber)}</title>
      <style>
        @page { size: 80mm auto; margin: 0; }
        * { box-sizing: border-box; }
        html {
          width: 80mm;
          margin: 0;
          padding: 0;
          background: #fff;
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
        body {
          width: 80mm;
          margin: 0;
          padding: 1.5mm;
          color: #000;
          background: #fff;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 12.5px;
          line-height: 1.18;
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
        h1, h2, p { margin: 0; }
        .cook-order-container {
          width: 77mm;
        }
        .header {
          text-align: center;
          padding-bottom: 1mm;
        }
        .order-number {
          padding: 0.8mm;
          color: #000;
          font-size: 23px;
          font-weight: 900;
        }
        .client-name {
          margin-top: 0.5mm;
          font-size: 16px;
          font-weight: 900;
          overflow-wrap: anywhere;
        }
        .date-time {
          margin-top: 0.5mm;
          font-size: 11px;
          font-weight: 800;
        }
        .order-type {
          display: inline-block;
          margin-top: 1mm;
          padding: 1mm 2.5mm;
          border: 2px solid #000;
          font-size: 13px;
          font-weight: 900;
        }
        .order-type-takeaway {
          border-style: dashed;
          border-radius: 10px;
        }
        .order-type-waiting {
          border: 3px double #000;
          border-radius: 2px;
          padding: 1.2mm 3mm;
          font-size: 14px;
        }
        .customer-info {
          margin: 1.2mm 0;
          padding: 1.3mm;
          border: 1px solid #000;
          font-size: 11.5px;
          font-weight: 800;
          overflow-wrap: anywhere;
        }
        .divider {
          border-top: 2px solid #000;
          margin: 1.2mm 0;
        }
        .item-container {
          padding: 1.2mm 0;
          border-bottom: 1px dashed #000;
        }
        .item-header {
          display: flex;
          align-items: flex-start;
        }
        .item-name {
          flex: 1;
          font-size: 16px;
          font-weight: 900;
          overflow-wrap: anywhere;
        }
        .item-options {
          margin-top: 0.7mm;
          padding-left: 3mm;
          font-size: 12px;
          font-weight: 800;
        }
        .option-item {
          margin-bottom: 0.5mm;
          overflow-wrap: anywhere;
        }
        .product-comment {
          margin: 0.6mm 0 0 3mm;
          padding: 0.3mm 0 0.2mm 2mm;
          border: 0;
          border-left: 2px solid #000;
          font-size: 12px;
          font-weight: 900;
          overflow-wrap: anywhere;
        }
        .comments {
          margin-top: 1.2mm;
          padding: 1.3mm;
          border: 1px dashed #000;
          font-size: 12px;
          font-weight: 900;
          overflow-wrap: anywhere;
        }
        .comments-title {
          margin-bottom: 0.6mm;
          text-align: center;
          text-decoration: underline;
          font-size: 14px;
          font-weight: 900;
        }
        .footer {
          margin-top: 2mm;
          padding-top: 1mm;
          border-top: 2px solid #000;
          text-align: center;
          font-size: 11px;
          font-weight: 900;
        }
        .print-padding-end {
          padding-top: 4mm;
        }
      </style>
    </head>
    <body>
      <main class="cook-order-container">
        <header class="header">
          <h1 class="order-number">PEDIDO #${escapeHtml(orderNumber)}</h1>
          <div class="client-name">${escapeHtml(
    normalizeUpper(order.clientName, 'SIN NOMBRE'),
  )}</div>
          <div class="date-time">${escapeHtml(date)} - ${escapeHtml(time)}</div>
          <div class="${escapeHtml(orderTypeClass)}">${escapeHtml(orderType)}</div>
        </header>

        <section class="customer-info">
          <div><strong>CLIENTE:</strong> ${escapeHtml(
    normalizeUpper(order.clientName, 'SIN NOMBRE'),
  )}</div>
          ${order.orderType === 'DELIVERY'
      ? `<div><strong>DIRECCION:</strong> ${escapeHtml(
        normalizeUpper(order.deliveryAddress),
      )}</div>`
      : ''
    }
          <div><strong>TIPO:</strong> ${escapeHtml(orderType)}</div>
        </section>

        <div class="divider"></div>

        <section>
          ${getProductsHtml(order)}
        </section>

        ${getCommentHtml(order)}

        <footer class="footer">${escapeHtml(new Date().toLocaleString('es-AR'))}</footer>
        <div class="print-padding-end"></div>
      </main>
    </body>
  </html>`;
};

export const buildOrderKitchenPrinterHtml = buildOrderKitchenHtml;
