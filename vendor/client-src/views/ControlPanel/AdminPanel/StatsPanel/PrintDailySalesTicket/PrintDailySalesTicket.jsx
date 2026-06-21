import { useRef } from 'react';
// ---- MATERIAL UI ----
import {
  Button,
  Box,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
// ICONS
import {
  Print as PrintIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
// ---------------------

// ---- STYLES ----
const tableHeadStyle = {
  color: 'primary.main',
  fontFamily: 'fontFamily.primary',
};

const tableBodyStyle = {
  color: 'text.primary',
  fontFamily: 'fontFamily.secondary',
};
// ----------------

// Helper function to clean money values from DB (e.g., "$10.50" -> 10.50)
const cleanMoneyValue = (money) => {
  if (money === null || money === undefined) return 0;
  // Replace all occurrences of '$', spaces, and commas (for thousands separator)
  return Number.parseFloat(money.toString().replace(/[$,\s]/g, '')) || 0;
};

// Helper function to format numbers as currency for display
const formatCurrency = (value) => {
  const numericValue = Number(value || 0);

  return numericValue.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS', // Assuming ARS for Argentina
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const buildCustomOptionReportRows = (dayStats) => {
  if (Array.isArray(dayStats?.groupedCustomOptionsNormalized)) {
    return dayStats.groupedCustomOptionsNormalized
      .flatMap((group) =>
        (group.rows || []).map((row) => ({
          key: `${group.key}-${row.itemId || row.name}`,
          groupLabel: group.label,
          label: row.name || 'Sin nombre',
          optionName: row.optionName || '',
          quantity: Number(row.effectiveQuantity ?? row.quantity ?? 0),
          totalCost: Number(row.totalCost || 0),
        }))
      )
      .sort((a, b) => {
        if (b.quantity !== a.quantity) return b.quantity - a.quantity;
        return b.totalCost - a.totalCost;
      });
  }

  if (Array.isArray(dayStats?.groupedCustomOptions)) {
    return dayStats.groupedCustomOptions
      .map((option) => ({
        key: option.itemId || option.name,
        groupLabel: 'Extras',
        label: option.name || 'Sin nombre',
        optionName: option.optionNames?.join(', ') || '',
        quantity: Number(option.effectiveQuantity ?? option.quantity ?? 0),
        totalCost: Number(option.totalCost || 0),
      }))
      .sort((a, b) => b.quantity - a.quantity);
  }

  return [];
};

const buildCustomOptionReportGroups = (dayStats) => {
  if (!Array.isArray(dayStats?.groupedCustomOptionsNormalized)) return [];

  return dayStats.groupedCustomOptionsNormalized
    .filter((group) => Array.isArray(group.rows) && group.rows.length > 0)
    .map((group) => ({
      key: group.key,
      label: group.label,
      quantity: Number(group.effectiveQuantity ?? group.quantity ?? 0),
      totalCost: Number(group.totalCost || 0),
      rows: group.rows
        .map((row) => ({
          key: `${group.key}-${row.itemId || row.name}`,
          label: row.name || 'Sin nombre',
          optionName: row.optionName || '',
          quantity: Number(row.effectiveQuantity ?? row.quantity ?? 0),
          totalCost: Number(row.totalCost || 0),
          varieties: row.varieties || [],
        }))
        .sort((a, b) => {
          if (b.quantity !== a.quantity) return b.quantity - a.quantity;
          return b.totalCost - a.totalCost;
        }),
    }))
    .sort((a, b) => {
      if (b.quantity !== a.quantity) return b.quantity - a.quantity;
      return b.totalCost - a.totalCost;
    });
};

export const PrintDailySalesTicket = ({ open, onClose, dayStats }) => {
  const printRef = useRef();
  const customOptionReportRows = buildCustomOptionReportRows(dayStats);
  const customOptionReportGroups = buildCustomOptionReportGroups(dayStats);

  const handlePrint = () => {
    if (!dayStats || dayStats.totalOrders === 0) {
      console.warn('No hay datos para imprimir el reporte diario.');
      return;
    }

    const printContent = printRef.current;
    const printWindow = window.open('', '_blank', 'width=300,height=800');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>
          ${
            dayStats?.date?.day
              ? `Reporte Diario - ${dayStats.date.day}/${dayStats.date.month}/${dayStats.date.year}`
              : `Reporte Mensual - ${dayStats.date.month}/${dayStats.date.year}`
          }
            </title>
          <style>
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              body {
                font-family: 'Courier New', monospace;
                font-size: 11px;
                line-height: 1.3;
                margin: 0;
                padding: 5mm;
                width: 70mm;
                color: black;
                background: white;
              }
              .sales-ticket-container {
                width: 100%;
                max-width: 70mm;
              }
              .header {
                text-align: center;
                margin-bottom: 12px;
                border-bottom: 2px solid #000;
                padding-bottom: 8px;
              }
              .report-title {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 4px;
              }
              .date-info {
                font-size: 12px;
                margin-bottom: 4px;
              }
              .summary-section {
                margin: 10px 0;
                padding: 8px;
                border: 1px solid #000;
                background: #f0f0f0;
              }
              .summary-title {
                font-weight: bold;
                font-size: 12px;
                text-align: center;
                margin-bottom: 6px;
                text-decoration: underline;
              }
              .summary-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 3px;
                font-size: 11px;
              }
              .category-section {
                margin: 12px 0;
              }
              .category-title {
                font-weight: bold;
                font-size: 13px;
                margin-bottom: 4px;
                text-decoration: underline;
                text-align: center;
                background: #e0e0e0;
                padding: 6px;
              }
              .products-section {
                margin: 12px 0;
              }
              .section-title {
                font-weight: bold;
                font-size: 12px;
                margin-bottom: 8px;
                text-decoration: underline;
                text-align: center;
                background: #e0e0e0;
                padding: 4px;
              }
              .product-item {
                margin-bottom: 2px;
                padding: 1px;
                background: #f9f9f9;
              }
              .product-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 4px;
                font-weight: bold;
              }
              .product-name {
                flex: 1;
                font-size: 11px;
              }
              .product-qty {
                color: black;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 10px;
                min-width: 25px;
                text-align: center;
              }
              .product-details {
                display: flex;
                justify-content: space-between;
                font-size: 10px;
                color: #333;
              }
              .custom-options-section {
                margin: 10px 0;
                padding: 0px;
                border-top: 1px dashed #000;
                border-bottom: 1px dashed #000;
              }
              .custom-options-title {
                font-weight: bold;
                font-size: 12px;
                text-align: center;
                padding: 5px 0;
                text-decoration: underline;
              }

              .custom-option-group {
                  margin: 6px 0;
                  padding-bottom: 5px;
                  border-bottom: 1px dotted #999;
              }

              .custom-option-group-title {
                font-weight: bold;
                font-size: 11px;
                text-align: center;
                background: #e8e8e8;
                padding: 3px;
                margin-bottom: 4px;
              }

              .custom-option-row {
                margin-bottom: 5px;
                padding: 2px 0;
              }

              .custom-option-name {
                font-weight: bold;
                font-size: 10px;
                text-transform: uppercase;
                word-break: break-word;
              }

              .custom-option-meta {
                display: flex;
                justify-content: space-between;
                font-size: 10px;
                margin-top: 1px;
              }

              .custom-option-varieties {
                font-size: 8px;
                margin-top: 2px;
                color: #333;
                word-break: break-word;
              }

              .custom-option-item {
                display: flex;
                justify-content: space-between;
                font-size: 10px;
                margin-bottom: 2px;
                padding: 1px 3px;
                color: black;
              }
              .custom-option-contain {
                font-weight: bold;
                font-size: 8px;
                color: black;
              }
              .totals-section {
                margin-top: 15px;
                border-top: 2px solid #000;
                padding-top: 8px;
              }
              .total-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 4px;
                font-size: 11px;
              }
              .final-total {
                display: flex;
                justify-content: space-between;
                font-weight: bold;
                font-size: 14px;
                border-top: 1px solid #000;
                padding-top: 6px;
                margin-top: 6px;
              }
              .footer {
                text-align: center;
                margin-top: 15px;
                font-size: 9px;
                border-top: 1px dashed #000;
                padding-top: 8px;
              }
              .divider {
                border-top: 1px dashed #000;
                margin: 10px 0;
              }
            }
            body * {
              visibility: hidden;
            }
            .sales-ticket-container, .sales-ticket-container * {
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
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      onClose(); // Cerrar el modal después de imprimir
    }, 250);
  };

  const cleanedTotalAmount = cleanMoneyValue(
    dayStats?.financialSummary.totalAmount
  );

  const cleanedServiceTax = cleanMoneyValue(
    dayStats?.financialSummary.totalServiceTax || 0
  );
  const cleanedDeliveryCost = cleanMoneyValue(
    dayStats?.financialSummary.totalDelivery || 0
  );

  const cleanedDiscountAmount = cleanMoneyValue(
    dayStats?.financialSummary.totalDiscount || 0
  );

  // ✅ CALCULAR TOTALES AUTOMÁTICAMENTE
  const calculatedProductTotals = cleanMoneyValue(
    dayStats?.financialSummary.subtotalProducts || 0
  );

  // El total final para mostrar es el totalAmount que ya viene calculado
  const finalTotalForDisplay = cleanedTotalAmount;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: 'background.main',
          color: 'text.primary',
          padding: { xs: 2, sm: 3, md: 3 },
          borderBottom: '2px solid #f5a623',
          position: { xs: 'sticky', sm: 'static' },
          top: 0,
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontFamily: 'fontFamily.primary',
              color: 'primary.main',
              fontSize: { xs: '18px', sm: '24px', md: '20px' },
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 0.5, sm: 1, md: 1.5 },
              fontWeight: 'bold',
            }}
          >
            {dayStats?.date?.day
              ? 'REPORTE DIARIO DE VENTAS'
              : 'REPORTE MENSUAL DE VENTAS'}
          </Typography>

          <IconButton
            aria-label="close"
            onClick={onClose}
            size="small"
            sx={{
              color: 'primary.main',
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          bgcolor: 'background.default',
          p: { xs: 1.5, sm: 3, md: 4 },
          overflow: 'auto',
          maxHeight: { xs: 'calc(100vh - 120px)', sm: 'none' },
        }}
      >
        {/* Contenido visible en el modal antes de imprimir */}
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'fontFamily.primary',
              color: 'primary.main',
              mb: 2,
              textAlign: 'center',
              borderBottom: '2px solid',
              borderColor: 'primary.main',
            }}
          >
            DETALLES DEL REPORTE
          </Typography>
          {dayStats ? (
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'fontFamily.primary',
                    color: 'primary.main',
                  }}
                >
                  {dayStats?.date?.day ? 'Fecha:' : 'Periodo:'}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'fontFamily.secondary',
                    color: 'text.primary',
                  }}
                >
                  {dayStats?.date?.day
                    ? `${dayStats.date.day}/${dayStats.date.month}/${dayStats.date.year}`
                    : `${dayStats.date.monthName} - ${dayStats.date.year}`}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'fontFamily.primary',
                    color: 'primary.main',
                  }}
                >
                  Pedidos Finalizados:
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'fontFamily.secondary',
                    color: 'text.primary',
                  }}
                >
                  {dayStats.totalOrders}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 2,
                  mb: 3,
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'fontFamily.primary',
                    color: 'primary.main',
                  }}
                >
                  {dayStats?.date?.day
                    ? 'Monto total del día:'
                    : 'Monto total del mes'}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'fontFamily.secondary',
                    color: 'text.primary',
                  }}
                >
                  {formatCurrency(dayStats?.totalAmount)}
                </Typography>
              </Box>

              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'fontFamily.primary',
                  color: 'primary.main',
                  mb: 2,
                  fontWeight: 'bold',
                  borderBottom: '2px solid',
                  borderColor: 'primary.main',
                }}
              >
                DETALLE DE PRODUCTOS
              </Typography>

              {dayStats.productsByCategory &&
              Object.keys(dayStats.productsByCategory).length > 0 ? (
                Object.entries(dayStats.productsByCategory).map(
                  ([categoryName, products]) => {
                    const totalProductsSelled = products.reduce(
                      (acc, product) => acc + Number(product.quantity),
                      0
                    );
                    return (
                      <Accordion key={categoryName} sx={{ mb: 2 }}>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            '& .MuiAccordionSummary-content': {
                              alignItems: 'center',
                            },
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontFamily: 'fontFamily.primary',
                              fontWeight: 'bold',
                            }}
                          >
                            {categoryName.toUpperCase()} ({totalProductsSelled}{' '}
                            U. VENDIDAS)
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ bgcolor: 'background.paper' }}>
                          <TableContainer component={Paper}>
                            <Table size="small">
                              <TableHead sx={{ bgcolor: 'background.main' }}>
                                <TableRow>
                                  <TableCell sx={tableHeadStyle}>
                                    PRODUCTO
                                  </TableCell>
                                  <TableCell sx={tableHeadStyle} align="center">
                                    CANT.
                                  </TableCell>
                                  <TableCell sx={tableHeadStyle} align="right">
                                    TOTAL
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {products.map((product, index) => (
                                  <TableRow key={index}>
                                    <TableCell sx={tableBodyStyle}>
                                      {product.name}
                                    </TableCell>
                                    <TableCell
                                      align="center"
                                      sx={tableBodyStyle}
                                    >
                                      {product.quantity}
                                    </TableCell>
                                    <TableCell
                                      align="right"
                                      sx={tableBodyStyle}
                                    >
                                      {formatCurrency(product.totalPrice)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </AccordionDetails>
                      </Accordion>
                    );
                  }
                )
              ) : (
                <Typography>No hay productos vendidos.</Typography>
              )}

              {/* ✅ CUSTOM OPTIONS AGRUPADAS */}
              {customOptionReportGroups.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'fontFamily.primary',
                      color: 'primary.main',
                      mb: 2,
                      fontWeight: 'bold',
                      borderBottom: '2px solid',
                      borderColor: 'primary.main',
                    }}
                  >
                    EXTRAS / OPCIONES
                  </Typography>

                  {customOptionReportGroups.map((group) => (
                    <Accordion key={group.key} sx={{ mb: 1.5 }}>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: 'fontFamily.primary',
                            color: 'text.primary',
                            fontWeight: 'bold',
                          }}
                        >
                          {group.label} - {group.quantity} u.
                        </Typography>
                      </AccordionSummary>

                      <AccordionDetails
                        sx={{ bgcolor: 'background.default', p: 1 }}
                      >
                        <TableContainer
                          component={Paper}
                          sx={{ overflowX: 'auto' }}
                        >
                          <Table size="small" sx={{ minWidth: 420 }}>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={tableHeadStyle}>ITEM</TableCell>
                                <TableCell sx={tableHeadStyle}>CANT.</TableCell>
                                <TableCell sx={tableHeadStyle}>TOTAL</TableCell>
                              </TableRow>
                            </TableHead>

                            <TableBody>
                              {group.rows.map((row) => (
                                <TableRow key={row.key}>
                                  <TableCell sx={tableBodyStyle}>
                                    {row.label}

                                    {row.varieties?.length > 0 && (
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          display: 'block',
                                          color: 'text.secondary',
                                          fontFamily: 'fontFamily.secondary',
                                        }}
                                      >
                                        Incluye: {row.varieties.join(', ')}
                                      </Typography>
                                    )}
                                  </TableCell>

                                  <TableCell sx={tableBodyStyle}>
                                    {row.quantity}
                                  </TableCell>

                                  <TableCell sx={tableBodyStyle}>
                                    {formatCurrency(row.totalCost)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  color="primary"
                  variant="contained"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                  size="large"
                  sx={{ fontFamily: 'fontFamily.primary' }}
                >
                  Imprimir Reporte
                </Button>
              </Box>
            </Box>
          ) : (
            <Typography>Cargando datos o no hay datos para mostrar.</Typography>
          )}
        </Box>

        {/* CONTENIDO OCULTO PARA IMPRESIÓN - ESTO ES LO QUE SE IMPRIME */}
        <Box
          ref={printRef}
          sx={{
            display: 'none',
            '@media print': {
              display: 'block',
            },
          }}
        >
          <div className="sales-ticket-container">
            {/* HEADER */}
            <div className="header">
              <div className="report-title">
                {dayStats?.date?.day
                  ? 'REPORTE DIARIO DE VENTAS'
                  : 'REPORTE MENSUAL DE VENTAS'}
              </div>
              <div className="date-info">
                {dayStats?.date?.day
                  ? `${dayStats.date.day} de ${dayStats?.date?.monthName} de ${dayStats?.date?.year}`
                  : `Periodo ${dayStats?.date?.monthName} de ${dayStats?.date?.year}`}
              </div>
              <div className="date-info">
                Generado: {new Date().toLocaleString('es-ES')}
              </div>
            </div>
            {/* RESUMEN */}
            <div className="summary-section">
              <div className="summary-title">
                {dayStats?.date?.day ? 'RESUMEN DEL DÍA' : 'RESUMEN DEL MES'}
              </div>
              <div className="summary-item">
                <span>Total de pedidos:</span>
                <span>{dayStats?.totalOrders}</span>
              </div>
              <div className="summary-item">
                <span>Variedad de productos:</span>
                <span>{dayStats?.productsSales?.length || 0}</span>
              </div>
              <div className="summary-item">
                <span>Unidades vendidas:</span>
                <span>{dayStats?.totalProductsSold || 0}</span>
              </div>
            </div>

            {/* PRODUCTOS POR CATEGORÍA */}
            {dayStats?.productsByCategory &&
              Object.keys(dayStats.productsByCategory).length > 0 &&
              Object.entries(dayStats.productsByCategory).map(
                ([categoryName, products]) => (
                  <div key={categoryName} className="category-section">
                    <div className="category-title">
                      {categoryName.toUpperCase()}
                    </div>
                    {products.map((product, index) => (
                      <div key={index} className="product-item">
                        <div className="product-header">
                          <div className="product-name">
                            {product.name.toUpperCase()}
                          </div>
                          <div className="product-qty">x{product.quantity}</div>
                        </div>
                        <div className="product-details">
                          <span>
                            Total: {formatCurrency(product.totalPrice)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

            {/* CUSTOM OPTIONS AGRUPADAS */}
            {customOptionReportGroups.length > 0 && (
              <div className="custom-options-section">
                <div className="custom-options-title">
                  EXTRAS Y PERSONALIZACIONES
                </div>
                {customOptionReportGroups.map((group) => (
                  <div key={group.key} className="custom-option-group">
                    <div className="custom-option-group-title">
                      {group.label.toUpperCase()} - x{group.quantity}
                    </div>
                    {group.rows.map((row) => (
                      <div key={row.key} className="custom-option-row">
                        <div className="custom-option-name">
                          {row.label.toUpperCase()}
                        </div>

                        <div className="custom-option-meta">
                          <span>x{row.quantity}</span>
                          <span>{formatCurrency(row.totalCost)}</span>
                        </div>

                        {row.varieties?.length > 0 && (
                          <div className="custom-option-varieties">
                            Incluye: {row.varieties.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* TOTALES */}
            <div className="totals-section">
              {/* SUBTOTAL DE PRODUCTOS */}
              <div className="total-item">
                <span>SUBTOTAL PRODUCTOS:</span>
                <span>{formatCurrency(calculatedProductTotals)}</span>
              </div>
              {/* TARIFA DE SERVICIO */}
              {cleanedServiceTax > 0 && (
                <div className="total-item">
                  <span>TARIFA DE SERVICIO:</span>
                  <span>{formatCurrency(cleanedServiceTax)}</span>
                </div>
              )}
              {/* COSTO DE ENVÍO */}
              {cleanedDeliveryCost > 0 && (
                <div className="total-item">
                  <span>COSTO DE ENVÍO:</span>
                  <span>{formatCurrency(cleanedDeliveryCost)}</span>
                </div>
              )}

              {/* DESCUENTOS */}
              {cleanedDiscountAmount > 0 && (
                <div className="total-item">
                  <span>DESCUENTOS:</span>
                  <span>-{formatCurrency(cleanedDiscountAmount)}</span>
                </div>
              )}
              <div className="final-total">
                <span>TOTAL FINAL:</span>
                <span>{formatCurrency(finalTotalForDisplay)}</span>
              </div>
            </div>
            {/* FOOTER */}
            <div className="footer">
              <div>REPORTE AUTOMÁTICO</div>
              <div>Sistema de gestión gastronómica</div>
              <div>Datos de pedidos finalizados únicamente</div>
            </div>
          </div>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
