import { useState } from "react";

// ---- MATERIAL UI ----
import { Box, Button, Typography } from "@mui/material";
// ICONS
import {
  Print as PrintIcon,
  Visibility as PreviewIcon,
} from "@mui/icons-material";
// ---------------------

// ---- COMPONENTS ----
import { PrintPreviewDialog } from "../PrintPreviewDialog.jsx";
// --------------------

// ---- HOOKS ----
import { useAlert } from "@/hooks/Alert.jsx";
import { useThermalPrinter } from "../PrinterConfig/useThermalPrinter.js";
// ---------------

// ---- TEMPLATES ----
import {
  buildOrderTicketHtml,
  buildOrderTicketPrinterHtml,
} from "@/utils/printTemplates/orderTicketTemplate.js";
// -------------------

export const PrintTicket = ({
  order,
  orderIndex,
  restaurantName = "LOCAL",
  onChangeOrderStatus,
}) => {
  const { showAlert } = useAlert();
  const { savedPrinters, isPrinting, printHtml } = useThermalPrinter();

  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const buildPrintOptions = () => ({
    orderIndex,
    restaurantName,
  });

  const buildManualPrintDocument = () =>
    buildOrderTicketHtml(order, buildPrintOptions());

  const buildPrinterDocument = () =>
    buildOrderTicketPrinterHtml(order, buildPrintOptions());

  const handleManualPrint = () => {
    const printWindow = window.open("", "_blank", "width=300,height=600");

    if (printWindow) {
      printWindow.document.write(buildManualPrintDocument());
      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const handleElectronPrint = async () => {
    const result = await printHtml("ticket", buildPrinterDocument());

    if (result?.printed) {
      const message =
        result.mode === "manual"
          ? "Ticket enviado desde la impresora seleccionada"
          : `Ticket enviado a ${result.printerName}`;
      showAlert(message, "success");
    } else if (result?.reason === "no-printer") {
      showAlert("Windows no encontro impresoras disponibles", "error");
    } else {
      showAlert(result?.message || "Error al imprimir el ticket", "error");
    }
  };

  const handlePrint = async () => {
    setLoading(true);
    try {
      if (order.status === "EN PREPARACIÓN") {
        const nextStatus =
          order.orderType === "DELIVERY" ? "EN ENVIO" : "FINALIZADO";
        await onChangeOrderStatus?.(nextStatus);

        showAlert(
          `Estado del pedido actualizado a ${
            order.orderType === "DELIVERY" ? "EN ENVIO" : "FINALIZADO"
          }`,
          "success",
        );
      }

      if (window.electronAPI?.printHtml) {
        await handleElectronPrint();
      } else {
        handleManualPrint();
      }
    } catch (error) {
      console.error(error);
      showAlert("Error al actualizar el estado o imprimir el pedido", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          disabled={loading || isPrinting}
          sx={{
            fontFamily: "fontFamily.terciary",
            borderRadius: 2,
            minWidth: 140,
            bgcolor: "success.main",
            color: "white",
            "&:hover": {
              bgcolor: "success.dark",
            },
          }}
        >
          {loading || isPrinting ? "Procesando..." : "Imprimir Ticket"}
        </Button>

        <Button
          variant="outlined"
          size="small"
          startIcon={<PreviewIcon />}
          onClick={() => setShowPreview(true)}
          disabled={loading || isPrinting}
          sx={{
            fontFamily: "fontFamily.terciary",
            borderRadius: 2,
            minWidth: 140,
          }}
        >
          Vista previa
        </Button>

        {savedPrinters.ticket && (
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.7rem",
              lineHeight: 1,
              color: "inherit",
              opacity: 0.8,
            }}
          >
            {savedPrinters.ticket.name
              ? savedPrinters.ticket.name
              : "Impresora Termica"}
          </Typography>
        )}
        {!savedPrinters.ticket && (
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.7rem",
              lineHeight: 1,
              color: "text.primary",
              opacity: 0.8,
            }}
          >
            Impresora sin configurar
          </Typography>
        )}
        {isPrinting && (
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.7rem",
              lineHeight: 1,
              color: "text.primary",
              opacity: 0.8,
            }}
          >
            Enviando ticket a impresora...
          </Typography>
        )}
      </Box>

      <PrintPreviewDialog
        open={showPreview}
        title={`Vista previa - Ticket #${orderIndex || order?.id || ""}`}
        html={buildManualPrintDocument()}
        onClose={() => setShowPreview(false)}
        onPrint={() => {
          setShowPreview(false);
          handlePrint();
        }}
      />
    </>
  );
};
