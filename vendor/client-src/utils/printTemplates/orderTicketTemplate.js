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
    ['Nombre', normalizeUpper(order.clientName, 'SIN NOMBRE')],
  ];

  if (order.contactPhone || order.clientPhone || !hideEmptyClientContact) {
    rows.push(['Telefono', order.contactPhone || order.clientPhone || '-']);
  }

  if (order.deliveryAddress) {
    rows.push(['Direccion', normalizeUpper(order.deliveryAddress)]);
  }

  rows.push(['Entrega', normalizeUpper(order.orderType, '-')]);
  rows.push(['Pago', normalizeUpper(order.paymentMethod, '-')]);

  if (order.tableid || order.tableName) {
    rows.push(['Mesa', order.tableName || order.tableid]);
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
        body {
          width: 80mm;
          margin: 0;
          padding: 2.5mm;
          color: #000;
          background: #fff;
          font-family: "Courier New", Courier, monospace;
          font-size: 11.5px;
          line-height: 1.24;
        }
        h1, h2, p { margin: 0; }
        .ticket {
          position: relative;
          width: 75mm;
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
          padding: 2mm 0 1.8mm;
        }
        .ticket-business {
          font-size: 22px;
          font-weight: 900;
          letter-spacing: 0;
          overflow-wrap: anywhere;
        }
        .ticket-order-badge {
          display: inline-block;
          margin: 1.6mm 0;
          padding: 1mm 3mm;
          border-radius: 2px;
          color: #fff;
          background: #000;
          font-size: 17px;
          font-weight: 900;
        }
        .ticket-date {
          font-size: 13px;
        }
        .ticket-tax-label {
          margin: 2mm 0 0.8mm;
          padding: 1.3mm;
          color: #fff;
          background: #000;
          text-align: center;
          font-size: 13px;
          font-weight: 900;
        }
        .ticket-dashes {
          border-top: 1px dashed #000;
          margin: 1.6mm 0;
        }
        .ticket-section {
          padding: 0.4mm 0 1.4mm;
        }
        .ticket-section h2 {
          padding-bottom: 0.7mm;
          border-bottom: 1.5px solid #000;
          font-size: 17px;
          font-weight: 900;
        }
        .ticket-info-row {
          display: flex;
          gap: 2mm;
          margin-top: 1.1mm;
          font-size: 13px;
          overflow-wrap: anywhere;
        }
        .ticket-info-row strong {
          flex: 0 0 auto;
          font-weight: 900;
        }
        .ticket-product {
          padding: 1.5mm 0 1.1mm;
        }
        .ticket-product-line {
          display: grid;
          grid-template-columns: 7mm 1fr auto;
          gap: 1.5mm;
          align-items: start;
          font-size: 13px;
        }
        .ticket-product-qty,
        .ticket-product-name,
        .ticket-product-price {
          font-weight: 700;
        }
        .ticket-product-name {
          overflow-wrap: anywhere;
        }
        .ticket-options {
          margin: 0.8mm 0 0 9mm;
          font-size: 11px;
          font-weight: 700;
          overflow-wrap: anywhere;
        }
        .ticket-points-row,
        .ticket-total-row {
          display: flex;
          justify-content: space-between;
          gap: 3mm;
          margin-top: 1.2mm;
          font-size: 12.5px;
        }
        .ticket-points-row {
          justify-content: flex-start;
          gap: 5mm;
          font-weight: 700;
        }
        .ticket-total-row span:last-child {
          white-space: nowrap;
        }
        .ticket-double-line {
          border-top: 3px double #000;
          margin: 1.3mm 0;
        }
        .ticket-grand-total {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 3mm;
          padding: 1.6mm 0;
          font-size: 18px;
          font-weight: 900;
        }
        .ticket-grand-total span:last-child {
          font-size: 20px;
          white-space: nowrap;
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
          ${getCommentHtml(order)}

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
