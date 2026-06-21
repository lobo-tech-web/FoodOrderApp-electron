import { useRef, useState, useMemo } from 'react';
// ---- MATERIAL UI ----
import { Button, Box, Typography } from '@mui/material';
// ICONS
import { Print as PrintIcon } from '@mui/icons-material';
// ---------------------

// ---- COMPONENTS ----
// import { DialogChangeStatus } from '../DialogChangeStatus/DialogChangeStatus.jsx';
// --------------------

// ---- UTILS ----
import {
  getSortedCustomOptionsForPrint,
  formatCustomOptionForTicketPrint,
} from '@/utils/printCustomOptions.js';
// ---------------

// ---- HOOKS ----
import { useAlert } from '@/hooks/Alert.jsx';
import { useThermalPrinter } from '../PrinterConfig/useThermalPrinter.js';
// ---------------

// ---- UTILS ----
import { cleanMoneyValue, formatCurrency } from '@/utils/orderCalculations.js';
// ---------------

export const PrintTicket = ({
  order,
  orderIndex,
  restaurantName = 'LOCAL',
  onChangeOrderStatus,
}) => {
  const printRef = useRef();
  const { showAlert } = useAlert();
  const { savedPrinters, isPrinting, printToThermal } = useThermalPrinter();

  const [loading, setLoading] = useState(false);
  // const [showStatusConfirmDialog, setShowStatusConfirmDialog] = useState(false);

  const formatDate = (orderDate) => {
    return `${orderDate.day}/${orderDate.month}/${orderDate.year}`;
  };

  const formatTime = (orderDate) => {
    return `${orderDate.hour}:${orderDate.minute}:${orderDate.second}`;
  };

  const formatItemName = (name) => {
    // Limitar el nombre a 25 caracteres para que quepa en el ticket
    return name.length > 25 ? name.substring(0, 22) + '...' : name;
  };

  // ✅ CALCULAR TOTALES AUTOMÁTICAMENTE
  const calculatedProductTotals = useMemo(() => {
    let subtotalProducts = 0;

    order.cartItems.forEach((item) => {
      let itemTotal = Number.parseFloat(item.price) * item.quantity;

      subtotalProducts += itemTotal;
    });

    return subtotalProducts;
  }, [order.cartItems]);

  // const handlePrintButtonClick = () => {
  //   setShowStatusConfirmDialog(true);
  // };

  const handleThermalPrint = async () => {
    // Si no hay impresora conectada, conectar primero
    if (!savedPrinters.ticket) {
      showAlert(
        'No hay impresora térmica configurada para los tickets',
        'error'
      );
      return;
    }

    // Preparar datos para impresión térmica
    const printData = {
      restaurantName: order.restaurantName,
      orderIndex,
      date: formatDate(order.orderDate),
      time: formatTime(order.orderDate),
      clientName: order.clientName,
      contactPhone: order.contactPhone,
      deliveryAddress: order.deliveryAddress,
      orderType: order.orderType,
      paymentMethod: order.paymentMethod,
      cartItems: order.cartItems,
      totalRewardPoints: order.totalRewardPoints,
      totalRedeemPoints: order.totalRedeemPoints,
      cleanedTotalAmount: order.totalAmount,
      subtotal: formatCurrency(calculatedProductTotals),
      deliverycost: cleanMoneyValue(order.deliverycost),
      servicetax: cleanMoneyValue(order.servicetax),
      discountamount: cleanMoneyValue(order.discountamount),
    };

    // Imprimir directamente a impresora térmica
    const success = await printToThermal('ticket', printData);

    if (success) {
      showAlert('Comanda enviada a impresora térmica', 'success');
    } else {
      showAlert('Error al imprimir en impresora térmica', 'error');
    }
  };

  const handleManualPrint = () => {
    const printContent = printRef.current;
    // Crear una nueva ventana para la impresión
    const printWindow = window.open('', '_blank', 'width=300,height=600');

    if (printWindow) {
      printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket - Pedido #${orderIndex}</title>
          <style>
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.2;
                margin: 0;
                padding: 5mm;
                width: 70mm;
                color: black;
                background: white;
              }
              
              .ticket-container {
                width: 100%;
                max-width: 70mm;
              }
              
              .header {
                text-align: center;
                margin-bottom: 10px;
                border-bottom: 1px dashed #000;
                padding-bottom: 5px;
              }
              
              .restaurant-name {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 3px;
              }
              
              .order-number {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 3px;
              }
              
              .date-time {
                font-size: 10px;
                margin-bottom: 5px;
              }
              
              .section {
                margin: 8px 0;
              }
              
              .section-title {
                font-weight: bold;
                font-size: 16px;
                margin-bottom: 3px;
                text-decoration: underline;
              }
              
              .customer-info {
                font-family: 'Arial', sans-serif;
                font-weight: bold;
                font-size: 14px;
                line-height: 1.3;
              }
              
              .items-table {
                width: 100%;
              }
              
              .item-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 2px;
              }

              .item-qty-name {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                font-size: 14px;
                font-weight: bold;
              }
              
              .item-price {
                font-size: 12px;
                font-weight: bold;
              }
              
              .item-options {
                font-family: 'Arial', sans-serif;
                font-size: 10px;
                margin-left: 25px;
                color: black;
              }

              .points-label {
                font-size: 12px;
                font-weight: bold;
              }
              
              .divider {
                border-top: 1px dashed #000;
                margin: 8px 0;
              }
              
              .total-section {
                text-align: right;
                font-weight: bold;
                font-size: 12px;
                margin-top: 10px;
                border-top: 2px solid #000;
                padding-top: 5px;
              }

              .total-line {
                display: flex;
                justify-content: space-between;
                margin-bottom: 2px;
              }

              .total-label {
                font-size: 14px;
                font-weight: bold;
              }

              .total-value {
                font-size: 14px;
                font-weight: bold;
              }

              .total-order-label {
                font-size: 20px;
                font-weight: bold;
              }

              .total-order-value {
                font-size: 20px;
                font-weight: bold;
              }
              
              .footer {
                text-align: center;
                margin-top: 15px;
                font-size: 12px;
                border-top: 1px dashed #000;
                padding-top: 5px;
              }
              
              .comments {
                font-family: 'Arial', sans-serif;
                font-size: 12px;
                font-style: italic;
                margin: 8px 0;
                padding: 3px;
                border: 1px solid #000;
              }
            }
            
            /* Ocultar todo excepto el contenido del ticket */
            body * {
              visibility: hidden;
            }
            
            .ticket-container, .ticket-container * {
              visibility: visible;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

      printWindow.document.close();
      printWindow.focus();

      // Esperar a que se cargue y luego imprimir
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const handlePrint = async () => {
    setLoading(true);
    try {
      if (order.status === 'EN PREPARACIÓN') {
        const nextStatus =
          order.orderType === 'DELIVERY' ? 'EN ENVIO' : 'FINALIZADO';
        await onChangeOrderStatus?.(nextStatus);

        showAlert(
          `Estado del pedido actualizado a ${order.orderType === 'DELIVERY' ? 'EN ENVIO' : 'FINALIZADO'}`,
          'success'
        );
      }

      // Si hay impresora térmica conectada, usar impresión directa
      if (savedPrinters.ticket) {
        await handleThermalPrint();
      } else {
        handleManualPrint();
      }
    } catch (error) {
      console.error(error);
      showAlert('Error al actualizar el estado o imprimir el pedido', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar la confirmación de cambio de estado
  // const handleStatusChangeConfirmation = async (changeStatus) => {
  //   if (changeStatus) {
  //     setLoading(true);
  //     try {
  //       // Crear una copia completa del pedido y solo cambiar el status
  //       const updatedOrderData = {
  //         ...order,
  //         status: 'EN ENVIO',
  //       };

  //       await updateOrder(order.id, updatedOrderData);

  //       showAlert('Estado del pedido actualizado a "EN ENVIO"', 'success');
  //     } catch (error) {
  //       console.error('Error al actualizar el estado del pedido:', error);
  //       showAlert('Error al actualizar el estado del pedido', 'error');
  //     } finally {
  //       setLoading(false);
  //     }
  //   }

  //   // Siempre imprimir después de la confirmación
  //   handlePrint();
  //   setShowStatusConfirmDialog(false);
  // };

  // Clean and get numeric values for calculations
  const cleanedTotalAmount = cleanMoneyValue(order.totalAmount).toNumber();
  const cleanedServiceTax = cleanMoneyValue(order.servicetax).toNumber();
  const cleanedDeliveryCost = cleanMoneyValue(order.deliverycost).toNumber();
  const cleanedDiscountAmount = cleanMoneyValue(
    order.discountamount
  ).toNumber();

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          disabled={loading || isPrinting}
          sx={{
            fontFamily: 'fontFamily.terciary',
            borderRadius: 2,
            minWidth: 140,
            bgcolor: 'success.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'success.dark',
            },
          }}
        >
          {loading || isPrinting ? 'Procesando...' : 'Imprimir Ticket'}
        </Button>

        {savedPrinters.ticket && (
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.7rem',
              lineHeight: 1,
              color: 'inherit',
              opacity: 0.8,
            }}
          >
            🖨️{' '}
            {savedPrinters.ticket.name
              ? savedPrinters.ticket.name
              : 'Impresora Térmica'}
          </Typography>
        )}
        {!savedPrinters.ticket && (
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.7rem',
              lineHeight: 1,
              color: 'text.primary',
              opacity: 0.8,
            }}
          >
            ⚠️ Impresora sin configurar
          </Typography>
        )}
        {isPrinting && (
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.7rem',
              lineHeight: 1,
              color: 'text.primary',
              opacity: 0.8,
            }}
          >
            Enviando comanda a impresora...
          </Typography>
        )}
      </Box>

      {/* CONTENIDO OCULTO PARA IMPRESIÓN */}
      <Box
        ref={printRef}
        sx={{
          display: 'none',
          '@media print': {
            display: 'block',
          },
        }}
      >
        <div className="ticket-container">
          {/* HEADER */}
          <div className="header">
            <div className="restaurant-name">
              {restaurantName.toUpperCase()}
            </div>
            <div className="order-number">PEDIDO #{orderIndex}</div>
            <div className="date-time">
              {formatDate(order.orderDate)} - {formatTime(order.orderDate)}
            </div>
            <div className="customer-info">TICKET NO VALIDO COMO FACTURA</div>
          </div>

          {/* INFORMACIÓN DEL CLIENTE */}
          <div className="section">
            <div className="section-title">CLIENTE</div>
            <div className="customer-info">
              <div>
                <strong>Nombre:</strong> {order.clientName?.toUpperCase()}
              </div>
              <div>
                <strong>Teléfono:</strong> {order.contactPhone}
              </div>
              {order.orderType === 'DELIVERY' && (
                <div>
                  <strong>Dirección:</strong>{' '}
                  {order.deliveryAddress?.toUpperCase()}
                </div>
              )}
              <div>
                <strong>Entrega:</strong> {order.orderType}
              </div>
              <div>
                <strong>Pago:</strong> {order.paymentMethod}
              </div>
            </div>
          </div>

          <div className="divider"></div>

          {/* PRODUCTOS */}
          <div className="section">
            <div className="section-title">PRODUCTOS</div>
            <div className="items-table">
              {order.cartItems.map((item, index) => (
                <div key={index}>
                  <div className="item-row">
                    <div className="item-qty-name">
                      <div>{item.quantity}</div>
                      <div>{formatItemName(item.name.toUpperCase())}</div>
                    </div>
                    <div className="item-price">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                  {/* OPCIONES PERSONALIZADAS */}
                  {Array.isArray(item.customOptions) &&
                    item.customOptions.length > 0 && (
                      <div className="item-options">
                        {getSortedCustomOptionsForPrint(item.customOptions).map(
                          (option, idx) => (
                            <div
                              key={`${option.optionId || option.optionName || 'option'}-${
                                option.itemId || option.name || idx
                              }`}
                              className="option-item"
                            >
                              + {formatCustomOptionForTicketPrint(option)}
                            </div>
                          )
                        )}
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>

          <div className="divider"></div>

          {/* PUNTOS */}
          {(order.totalRewardPoints > 0 || order.totalRedeemPoints > 0) && (
            <>
              <div className="section">
                <div className="section-title">PUNTOS</div>
                {order.totalRewardPoints > 0 && (
                  <div className="points-label">
                    PUNTOS A GANAR: +{order.totalRewardPoints}
                  </div>
                )}
                {order.totalRedeemPoints > 0 && (
                  <div className="points-label">
                    PUNTOS CANJEADOS: -{order.totalRedeemPoints}
                  </div>
                )}
              </div>
            </>
          )}

          {/* TOTAL */}
          <div className="total-section">
            {(cleanedServiceTax > 0 ||
              (order.orderType === 'DELIVERY' && cleanedDeliveryCost > 0)) && (
              <div className="total-line">
                <span className="total-label">SUBTOTAL:</span>
                <span className="total-value">
                  {formatCurrency(calculatedProductTotals)}
                </span>
              </div>
            )}

            {/* TARIFA DE SERVICIO */}
            {cleanedServiceTax > 0 && (
              <div className="total-line">
                <span className="total-label">TARIFA DE SERVICIO:</span>
                <span className="total-value">
                  + {formatCurrency(cleanedServiceTax)}
                </span>
              </div>
            )}

            {/* COSTO DE ENVÍO */}
            {cleanedDeliveryCost > 0 && (
              <div className="total-line">
                <span className="total-label">COSTO DE ENVÍO:</span>
                <span className="total-value">
                  + {formatCurrency(cleanedDeliveryCost)}
                </span>
              </div>
            )}

            {/* DESCUENTO DEL TOTAL SI ES QUE HAY */}
            {order.discountamount > 0 && (
              <div className="total-line">
                {order.discount > 0 ? (
                  <span className="total-label">
                    DESCUENTO ({order.discount}%):
                  </span>
                ) : (
                  <span className="total-label">AJUSTE:</span>
                )}
                <span className="total-value">
                  - {formatCurrency(cleanedDiscountAmount)}
                </span>
              </div>
            )}

            <div className="divider"></div>

            {/* TOTAL FINAL */}
            <div
              className="total-line"
              style={{ fontSize: '14px', marginTop: '5px' }}
            >
              <span className="total-order-label">TOTAL:</span>
              <span className="total-order-value">
                {formatCurrency(cleanedTotalAmount)}
              </span>
            </div>
          </div>

          {/* FOOTER */}
          <div className="footer">
            <div>¡Gracias por su pedido!</div>
            <div>Ticket generado automáticamente</div>
            <div>{new Date().toLocaleString('es-ES')}</div>
          </div>
        </div>
      </Box>

      {/* <DialogChangeStatus
        isTicket={true}
        loading={loading}
        showStatusConfirmDialog={showStatusConfirmDialog}
        setShowStatusConfirmDialog={setShowStatusConfirmDialog}
        handleStatusChangeConfirmation={handleStatusChangeConfirmation}
      /> */}
    </>
  );
};
