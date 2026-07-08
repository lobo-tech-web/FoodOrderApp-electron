import { cleanMoneyValue, formatCurrency } from '@/utils/orderCalculations.js';
import {
  formatCustomOptionForTicketPrint,
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

const getBusinessName = (order = {}, options = {}) =>
  options.businessName ||
  order.businessName ||
  order.restaurantBusinessName ||
  order.restaurant?.businessName ||
  order.user?.businessName ||
  order.restaurantName ||
  options.restaurantName ||
  'LOCAL';

const getBusinessLogoUrl = (order = {}, options = {}) =>
  options.businessLogoUrl ||
  options.logoUrl ||
  order.businessLogoUrl ||
  order.restaurantLogoUrl ||
  order.restaurant?.businessLogoUrl ||
  order.user?.businessLogoUrl ||
  '';

const getCartItems = (order = {}) =>
  Array.isArray(order.cartItems) ? order.cartItems : [];

const getItemSubtotal = (item = {}) =>
  cleanMoneyValue(item.price).mul(Number(item.quantity || 0)).toNumber();

const getProductsSubtotal = (order = {}) =>
  getCartItems(order).reduce((sum, item) => sum + getItemSubtotal(item), 0);

const getDiscountAmount = (order = {}) =>
  cleanMoneyValue(order.discountamount).toNumber();

const getServiceTax = (order = {}) =>
  cleanMoneyValue(order.servicetax).toNumber();

const getDeliveryCost = (order = {}) =>
  cleanMoneyValue(order.deliverycost).toNumber();

const getTotalAmount = (order = {}) => {
  const rawTotal = cleanMoneyValue(order.totalAmount).toNumber();
  if (rawTotal > 0) return rawTotal;

  return (
    getProductsSubtotal(order) +
    getServiceTax(order) +
    getDeliveryCost(order) -
    getDiscountAmount(order)
  );
};

const getCustomOptionsHtml = (item = {}) => {
  const options = getSortedCustomOptionsForPrint(item.customOptions || []);

  return options
    .map(
      (option, index) =>
        `<div class="ticket-option" key="${index}">+ ${escapeHtml(
          formatCustomOptionForTicketPrint(option),
        )}</div>`,
    )
    .join('');
};

const getProductsHtml = (order = {}) =>
  getCartItems(order)
    .map((item, index) => {
      const optionsHtml = getCustomOptionsHtml(item);

      return `
        <div class="ticket-product">
          <div class="ticket-product-line">
            <span class="ticket-product-qty">${escapeHtml(
        Number(item.quantity || 1),
      )}</span>
            <span class="ticket-product-name">${escapeHtml(
        normalizeUpper(item.name, 'PRODUCTO'),
      )}</span>
            <span class="ticket-product-price">${escapeHtml(
        formatCurrency(getItemSubtotal(item)),
      )}</span>
          </div>
          ${optionsHtml ? `<div class="ticket-options">${optionsHtml}</div>` : ''}
        </div>
      `;
    })
    .join('');

const getClientRowsHtml = (order = {}, options = {}) => {
  const hideEmptyClientContact = Boolean(options.hideEmptyClientContact);
  const rows = [
    ['NOMBRE', normalizeUpper(order.clientName, 'SIN NOMBRE')],
  ];

  if (order.contactPhone || order.clientPhone || !hideEmptyClientContact) {
    rows.push(['TELÉFONO', order.contactPhone || order.clientPhone || '-']);
  }

  if (order.deliveryAddress) {
    rows.push(['DIRECCIÓN', normalizeUpper(order.deliveryAddress)]);
  }

  rows.push(['ENTREGA', normalizeUpper(order.orderType, '-')]);
  rows.push(['PAGO', normalizeUpper(order.paymentMethod, '-')]);

  if (order.tableid || order.tableName) {
    rows.push(['MESA', order.tableName || order.tableid]);
  }

  return rows
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(
      ([label, value]) =>
        `<div class="ticket-info-row"><strong>${escapeHtml(
          label,
        )}:</strong><span>${escapeHtml(value)}</span></div>`,
    )
    .join('');
};

const getPointsHtml = (order = {}) => {
  const rewardPoints = Number(order.totalRewardPoints || 0);
  const redeemPoints = Number(order.totalRedeemPoints || 0);

  if (rewardPoints <= 0 && redeemPoints <= 0) return '';

  return `
    <section class="ticket-section">
      <h2>PUNTOS</h2>
      ${rewardPoints > 0
      ? `<div class="ticket-points-row">PUNTOS A GANAR:<span>+${escapeHtml(
        rewardPoints,
      )}</span></div>`
      : ''
    }
      ${redeemPoints > 0
      ? `<div class="ticket-points-row">PUNTOS CANJEADOS:<span>-${escapeHtml(
        redeemPoints,
      )}</span></div>`
      : ''
    }
    </section>
  `;
};

const getCommentHtml = (order = {}) => {
  const comment = String(order.comentary || order.comment || '').trim();

  if (!comment || comment === 'SIN COMENTARIOS') return '';

  return `
    <section class="ticket-section">
      <h2>COMENTARIOS</h2>
      <p class="ticket-comment">${escapeHtml(normalizeUpper(comment))}</p>
    </section>
  `;
};

export const buildOrderTicketHtml = (order = {}, options = {}) => {
  const { date, time } = getOrderDateParts(order);
  const orderNumber = getOrderNumber(order, options);
  const isLocalOrderTicket =
    options.variant === 'local-order' || order.ticketVariant === 'local-order';
  const businessName = normalizeUpper(getBusinessName(order, options), 'LOCAL');
  const ticketTitle = isLocalOrderTicket
    ? normalizeUpper(order.orderType, businessName)
    : businessName;
  const ticketBadge = isLocalOrderTicket
    ? `TE LLAMAN CON EL #${orderNumber}`
    : `PEDIDO #${orderNumber}`;
  const logoUrl = getBusinessLogoUrl(order, options);
  const subtotal = getProductsSubtotal(order);
  const serviceTax = getServiceTax(order);
  const deliveryCost = getDeliveryCost(order);
  const discountAmount = getDiscountAmount(order);
  const totalAmount = getTotalAmount(order);
  const showSubtotal =
    isLocalOrderTicket ||
    serviceTax > 0 || deliveryCost > 0 || discountAmount > 0;

  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Ticket Pedido #${escapeHtml(orderNumber)}</title>
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
          width: 68mm;
          margin: 0;
          padding: 1mm 1mm 1mm 1.5mm;
          color: #000;
          background: #fff;
          font-family: "Courier New", Courier, monospace;
          font-size: 10.2px;
          line-height: 1.18;
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
        h1, h2, p { margin: 0; }
        .ticket {
          position: relative;
          width: 66mm;
          min-height: 24mm;
          overflow: hidden;
        }
        .ticket-watermark {
          position: fixed;
          top: 30mm;
          left: 50%;
          width: 48mm;
          max-height: 48mm;
          object-fit: contain;
          opacity: 0.08;
          transform: translateX(-50%);
          z-index: 0;
        }
        .ticket-content {
          position: relative;
          z-index: 1;
        }
        .ticket-header {
          text-align: center;
          padding: 1.4mm 0 1.4mm;
        }
        .ticket-business {
          font-size: 18px;
          font-weight: 900;
          letter-spacing: 0;
          color: #000;
          overflow-wrap: anywhere;
        }
        .ticket-order-badge {
          display: inline-block;
          margin: 1.2mm 0;
          padding: 0.8mm 2mm;
          border-radius: 2px;
          border: 2px solid #000;
          color: #000 !important;
          background: #fff !important;
          font-size: 14px;
          font-weight: 900;
          line-height: 1.1;
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
        .ticket-date {
          font-size: 12px;
          font-weight: 900;
          color: #000;
        }
        .ticket-tax-label {
          margin: 1.2mm 0 0.4mm;
          padding: 0.9mm;
          border: 2px solid #000;
          color: #000 !important;
          background: #fff !important;
          text-align: center;
          font-size: 10.5px;
          font-weight: 900;
          line-height: 1.1;
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
        .ticket-dashes {
          border-top: 1px dashed #000;
          margin: 1.2mm 0;
        }
        .ticket-section {
          padding: 0.3mm 0 1mm;
        }
        .ticket-section h2 {
          padding-bottom: 0.7mm;
          border-bottom: 1.5px solid #000;
          font-size: 14px;
          font-weight: 900;
        }
        .ticket-info-row {
          display: grid;
          grid-template-columns: 17mm minmax(0, 1fr);
          column-gap: 0.8mm;
          margin-top: 0.8mm;
          font-size: 11px;
          font-family: "Courier New", Courier, monospace;
          font-weight: 800;
          color: #000;
          overflow-wrap: anywhere;
        }
        .ticket-info-row strong {
          font-weight: 900;
          white-space: nowrap;
        }
        .ticket-info-row span {
          font-weight: 800;
          overflow-wrap: anywhere;
        }
        .ticket-product {
          padding: 1.1mm 0 0.9mm;
        }
        .ticket-product-line {
          display: grid;
          grid-template-columns: 3.5mm minmax(0, 1fr) 20mm;
          gap: 0.7mm;
          align-items: start;
          font-size: 10.4px;
        }
        .ticket-product-qty,
        .ticket-product-name,
        .ticket-product-price {
          font-weight: 700;
          white-space: nowrap;
        }
        .ticket-product-qty {
          text-align: center;
        }
        .ticket-product-name {
          text-align: left;
          overflow-wrap: anywhere;
          white-space: normal;
          word-break: break-word;
        }
        .ticket-product-price {
          text-align: right;
          font-size: 10.2px;
        }
        .ticket-options {
          margin: 0.6mm 0 0 4.4mm;
          font-size: 9.8px;
          font-weight: 700;
          overflow-wrap: anywhere;
        }
        .ticket-points-row,
        .ticket-total-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 22mm;
          gap: 1mm;
          margin-top: 1mm;
          font-size: 10.4px;
        }
        .ticket-total-row span:last-child {
          text-align: right;
          white-space: nowrap;
        }
        .ticket-points-row {
          display: flex;
          justify-content: flex-start;
          gap: 5mm;
          font-weight: 700;
        }
        .ticket-double-line {
          border-top: 3px double #000;
          margin: 1mm 0;
        }
        .ticket-grand-total {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 24mm;
          align-items: baseline;
          gap: 1mm;
          padding: 1.6mm 0;
          font-size: 14px;
          font-weight: 900;
        }
        .ticket-grand-total span:last-child {
          font-size: 15px;
          white-space: nowrap;
          text-align: right;
        }
        .ticket-comment {
          padding-top: 1mm;
          font-size: 12px;
          font-weight: 700;
          overflow-wrap: anywhere;
        }
        .ticket-footer {
          padding: 2.2mm 0 1.2mm;
          text-align: center;
          font-family: Arial, sans-serif;
        }
        .ticket-footer strong {
          display: block;
          font-size: 12.5px;
          margin-bottom: 0.5mm;
        }
        .ticket-footer span {
          display: block;
          font-size: 10.5px;
        }
      </style>
    </head>
    <body>
      <main class="ticket">
        ${logoUrl ? `<img class="ticket-watermark" src="${escapeHtml(logoUrl)}" alt="" />` : ''}
        <div class="ticket-content">
          <header class="ticket-header">
            <h1 class="ticket-business">${escapeHtml(ticketTitle)}</h1>
            <div class="ticket-order-badge">${escapeHtml(ticketBadge)}</div>
            <p class="ticket-date">${escapeHtml(date)} - ${escapeHtml(time)}</p>
            <div class="ticket-tax-label">TICKET NO VALIDO COMO FACTURA</div>
          </header>

          <div class="ticket-dashes"></div>

          <section class="ticket-section">
            <h2>CLIENTE</h2>
            ${getClientRowsHtml(order, options)}
          </section>

          <div class="ticket-dashes"></div>

          <section class="ticket-section">
            <h2>PRODUCTOS</h2>
            ${getProductsHtml(order)}
          </section>

          <div class="ticket-dashes"></div>

          ${getPointsHtml(order)}

          <section class="ticket-section">
            ${showSubtotal
      ? `<div class="ticket-total-row"><span>SUBTOTAL:</span><span>${escapeHtml(
        formatCurrency(subtotal),
      )}</span></div>`
      : ''
    }
            ${serviceTax > 0
      ? `<div class="ticket-total-row"><span>TARIFA DE SERVICIO:</span><span>+ ${escapeHtml(
        formatCurrency(serviceTax),
      )}</span></div>`
      : ''
    }
            ${deliveryCost > 0
      ? `<div class="ticket-total-row"><span>COSTO DE ENVIO:</span><span>+ ${escapeHtml(
        formatCurrency(deliveryCost),
      )}</span></div>`
      : ''
    }
            ${discountAmount > 0
      ? `<div class="ticket-total-row"><span>${Number(order.discount || 0) > 0
        ? `DESCUENTO (${escapeHtml(order.discount)}%):`
        : 'AJUSTE:'
      }</span><span>- ${escapeHtml(formatCurrency(discountAmount))}</span></div>`
      : ''
    }
            <div class="ticket-double-line"></div>
            <div class="ticket-grand-total">
              <span>TOTAL:</span>
              <span>${escapeHtml(formatCurrency(totalAmount))}</span>
            </div>
          </section>

          <div class="ticket-dashes"></div>

          <footer class="ticket-footer">
            <strong>Gracias por su pedido!</strong>
            <span>Ticket generado automaticamente</span>
          </footer>
        </div>
      </main>
    </body>
  </html>`;
};

export const buildOrderTicketPrinterHtml = buildOrderTicketHtml;
