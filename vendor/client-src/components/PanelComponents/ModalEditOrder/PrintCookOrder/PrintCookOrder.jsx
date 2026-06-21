import { useState, useRef } from 'react';

// ---- MATERIAL UI ----
import { Button, Box, Typography } from '@mui/material';
// ICONS
import { Restaurant as RestaurantIcon } from '@mui/icons-material';
// ---------------------

// ---- COMPONENTS ----
// import { DialogChangeStatus } from '../DialogChangeStatus/DialogChangeStatus.jsx';
// --------------------

// ---- UTILS ----
import {
  getSortedCustomOptionsForPrint,
  formatCustomOptionForKitchenPrint,
} from '@/utils/printCustomOptions.js';
// ---------------

// ---- HOOKS ----
import { useAlert } from '@/hooks/Alert.jsx';
import { useThermalPrinter } from '../PrinterConfig/useThermalPrinter.js';
// ---------------

export const PrintCookOrder = ({ order, orderIndex, onChangeOrderStatus }) => {
  const printRef = useRef();
  const { showAlert } = useAlert();
  const { savedPrinters, isPrinting, printToThermal } = useThermalPrinter();

  const [loading, setLoading] = useState(false);
  // const [showStatusConfirmDialog, setShowStatusConfirmDialog] = useState(false);

  // const handlePrintButtonClick = () => {
  //   setShowStatusConfirmDialog(true);
  // };

  const handleThermalPrint = async () => {
    // Si no hay impresora conectada, conectar primero
    if (!savedPrinters.kitchen) {
      showAlert('No hay impresora térmica configurada para la cocina', 'error');
      return;
    }

    // Preparar datos para impresión térmica
    const printData = {
      orderIndex,
      date: formatDate(order.orderDate),
      time: formatTime(order.orderDate),
      clientName: order.clientName,
      deliveryAddress: order.deliveryAddress,
      orderType: order.orderType,
      // tableNumber: order.tableNumber || 'N/A',
      cartItems: order.cartItems,
      comentary: order.comentary !== 'SIN COMENTARIOS' ? order.comentary : '',
    };

    // Imprimir directamente a impresora térmica
    const success = await printToThermal('kitchen', printData);

    if (success) {
      showAlert('Comanda enviada a impresora térmica de cocina', 'success');
    } else {
      showAlert('Error al imprimir en impresora térmica de cocina', 'error');
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
          <title>Comanda - Pedido #${orderIndex}</title>
          <style>
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              
              body {
                font-family: 'Arial', sans-serif;
                font-size: 14px;
                line-height: 1.2;
                margin: 0;
                padding: 5mm;
                width: 70mm;
                color: black;
                background: white;
              }
              
              .cook-order-container {
                width: 100%;
                max-width: 70mm;
              }
              
              .header {
                text-align: center;
                margin-bottom: 3px;
                padding-bottom: 1.5px;
              }
              
              .order-number {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 3px;
                color: black;
                padding: 3px;
                border-radius: 4px;
              }
              
              .date-time {
                font-size: 12px;
                margin-bottom: 1px;
                font-weight: bold;
              }
              
              .order-type {
                font-size: 14px;
                font-weight: bold;
                padding: 4px 8px;
                border: 2px solid #000;
                display: inline-block;
                margin: 5px 0;
              }

              .order-type-takeaway {
                font-size: 14px;
                font-weight: bold;
                padding: 4px 8px;
                border: 2px dashed #000;
                border-radius: 12px;
                display: inline-block;
                margin: 5px 0;
              }

              .order-type-waiting {
                font-size: 14px;
                font-weight: bold;
                padding: 4px 8px;
                border-bottom: 2px dashed #000;
                display: inline-block;
                margin: 5px 0;
              }
              
              .section {
                margin: 3px 0;
              }
              
              .section-title {
                font-weight: bold;
                font-size: 16px;
                margin-bottom: 3px;
                text-decoration: underline;
                text-align: center;
                background: #f0f0f0;
                padding: 1px;
              }
              
              .customer-info {
                font-size: 12px;
                line-height: 1.4;
                margin-bottom: 10px;
                border: 1px solid #000;
                padding: 8px;
              }
              
              .items-section {
                margin: 3px 0;
              }
              
              .item-container {
                background: #f9f9f9;
                padding: 3px;
                margin-bottom: 5px; /* Espacio entre ítems */
                border-bottom: 1px dashed #000; /* Separador de ítems */
              }
              
              .item-header {
                display: flex;
                justify-content: flex-start;
                align-items: center;
                flex-wrap: wrap;
                gap: 5px;
              }
              
              .item-name {
                font-size: 16px;
                font-weight: bold;
                flex-grow: 1;
              }
              
              .item-qty {
                font-size: 16px;
                font-weight: bold;
                color: black;
                border-radius: 4px;
                min-width: 30px;
                text-align: center;
                padding: 2px 5px;
              }
              
              .item-options {
                font-size: 13px;
                margin-top: 1px;
                padding-left: 10px;
              }
              
              .option-item {
                margin-bottom: 1px;
                font-weight: bold;
                color: #333;
              }
              
              .divider {
                border-top: 2px solid #000;
                margin: 3px 0;
              }
              
              .comments {
                font-size: 14px;
                margin: 15px 0;
                padding: 10px;
                background: #ffffcc;
              }
              
              .comments-title {
              font-weight: bold;
                font-size: 16px;
                text-decoration: underline;
                margin-bottom: 5px;
                text-align: center;
              }
              
              .footer {
                text-align: center;
                margin-top: 10px;
                font-size: 12px;
                border-top: 2px solid #000;
                padding-top: 8px;
                font-weight: bold;
              }

              .print-padding-end {
                padding-top: 40px;
              }
            }
            
            /* Ocultar todo excepto el contenido del ticket */
            body * {
              visibility: hidden;
            }
            
            .cook-order-container, .cook-order-container * {
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
      if (order.status === 'PENDIENTE A CONFIRMAR') {
        await onChangeOrderStatus?.('EN PREPARACIÓN');
        showAlert(
          'Estado del pedido actualizado a "EN PREPARACIÓN"',
          'success'
        );
      }

      // Si hay impresora térmica conectada, usar impresión directa
      if (savedPrinters.kitchen) {
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
  //         status: 'EN PREPARACIÓN',
  //       };

  //       await updateOrder(order.id, updatedOrderData);

  //       showAlert(
  //         'Estado del pedido actualizado a "EN PREPARACIÓN"',
  //         'success'
  //       );
  //     } catch (error) {
  //       console.error('Error al actualizar el estado del pedido:', error);
  //       showAlert('Error al actualizar el estado del pedido', 'error');
  //     }
  //     setLoading(false);
  //   }

  //   // Siempre imprimir después de la confirmación
  //   handlePrint();
  //   setShowStatusConfirmDialog(false);
  // };

  const formatDate = (orderDate) => {
    return `${orderDate.day}/${orderDate.month}/${orderDate.year}`;
  };

  const formatTime = (orderDate) => {
    return `${orderDate.hour}:${orderDate.minute}:${orderDate.second}`;
  };

  const formatItemName = (name) => {
    // Para cocina, mostrar el nombre completo pero en mayúsculas
    return name.toUpperCase();
  };

  // Función para aplanar los cartItems según su cantidad
  const getFlattenedCartItems = (cartItems) => {
    const flattenedItems = [];
    cartItems.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        flattenedItems.push({
          ...item,
          displayQuantity: 1,
          originalQuantity: item.quantity,
        });
      }
    });
    return flattenedItems;
  };

  const flattenedCartItems = getFlattenedCartItems(order.cartItems);

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
          startIcon={<RestaurantIcon />}
          onClick={handlePrint}
          disabled={loading || isPrinting}
          sx={{
            fontFamily: 'fontFamily.terciary',
            borderRadius: 2,
            minWidth: 140,
            bgcolor: '#2196f3',
            color: 'white',
            '&:hover': {
              bgcolor: 'info.dark',
            },
          }}
        >
          {loading || isPrinting ? 'Procesando...' : 'Imprimir Cocina'}
        </Button>

        {savedPrinters.kitchen && (
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
            {savedPrinters.kitchen.name
              ? savedPrinters.kitchen.name
              : 'Impresora Térmica'}
          </Typography>
        )}
        {!savedPrinters.kitchen && (
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
            Enviando datos a impresora...
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
        <div className="cook-order-container">
          {/* HEADER */}
          <div className="header">
            <div className="order-number">PEDIDO #{orderIndex}</div>
            <div className="date-time">
              {formatDate(order.orderDate)} - {formatTime(order.orderDate)}
            </div>
            {order.orderType === 'RETIRO EN LOCAL' ? (
              <div className="order-type-takeaway">{order.orderType}</div>
            ) : order.orderType === 'ESPERA EN LOCAL' ? (
              <div className="order-type-waiting">{order.orderType}</div>
            ) : (
              <div className="order-type">{order.orderType}</div>
            )}
          </div>

          {/* INFORMACIÓN BÁSICA DEL CLIENTE */}
          <div className="section">
            <div className="customer-info">
              <div>
                <strong>CLIENTE:</strong> {order.clientName.toUpperCase()}
              </div>
              {order.orderType === 'DELIVERY' && (
                <div>
                  <strong>DIRECCIÓN:</strong>{' '}
                  {order.deliveryAddress.toUpperCase()}
                </div>
              )}
              <div>
                <strong>TIPO:</strong> {order.orderType} |{' '}
              </div>
            </div>
          </div>

          <div className="divider"></div>

          {/* PRODUCTOS PARA COCINA */}
          <div className="section">
            <div className="items-section">
              {flattenedCartItems.map((item, index) => (
                <div key={index} className="item-container">
                  <div className="item-header">
                    {/* Cantidad antes del nombre del item */}
                    {/* <div className="item-qty">{item.displayQuantity}</div> */}
                    <div className="item-name">{formatItemName(item.name)}</div>
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
                              - {formatCustomOptionForKitchenPrint(option)}
                            </div>
                          )
                        )}
                      </div>
                    )}
                  {/* {item.customOptions && item.customOptions.length > 0 && (
                    <div className="item-options">
                      {item.customOptions.map((option, idx) => (
                        <div key={idx} className="option-item">
                          - {option.name.toUpperCase()}
                          {option.quantity > 1 && `  x${option.quantity}`}
                        </div>
                      ))}
                    </div>
                  )} */}
                  {item.productComment && item.productComment.trim() !== '' && (
                    <div
                      style={{
                        display: 'flex',
                        marginTop: '6px',
                        padding: '4px 6px',
                        borderRadius: '4px',
                        border: '1px solid',
                        borderColor: '#000',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '12px',
                          lineHeight: '1.3',
                        }}
                      >
                        📝 <strong>NOTA:</strong>{' '}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          fontStyle: 'italic',
                          lineHeight: '1.3',
                        }}
                      >
                        {item.productComment.toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* COMENTARIOS ESPECIALES */}
          {order.comentary && order.comentary !== 'SIN COMENTARIOS' && (
            <div className="comments">
              <div className="comments-title">COMENTARIOS</div>
              <div>{order.comentary.toUpperCase()}</div>
            </div>
          )}

          {/* FOOTER */}
          <div className="footer">
            <div>{new Date().toLocaleString('es-ES')}</div>
          </div>

          <div className="print-padding-end"></div>
        </div>
      </Box>

      {/* <DialogChangeStatus
        isTicket={false}
        loading={loading}
        showStatusConfirmDialog={showStatusConfirmDialog}
        setShowStatusConfirmDialog={setShowStatusConfirmDialog}
        handleStatusChangeConfirmation={handleStatusChangeConfirmation}
      /> */}
    </>
  );
};
