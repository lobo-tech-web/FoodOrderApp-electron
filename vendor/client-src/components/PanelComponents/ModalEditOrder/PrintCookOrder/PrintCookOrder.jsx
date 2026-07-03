import { useState } from "react";

// ---- MATERIAL UI ----
import { Box, Button, Typography } from "@mui/material";
// ICONS
import {
  Restaurant as RestaurantIcon,
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
  buildOrderKitchenHtml,
  buildOrderKitchenPrinterHtml,
} from "@/utils/printTemplates/orderKitchenTemplate.js";
// -------------------

export const PrintCookOrder = ({ order, orderIndex, onChangeOrderStatus }) => {
  const { showAlert } = useAlert();
  const { savedPrinters, isPrinting, printHtml } = useThermalPrinter();

  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const buildPrintOptions = () => ({
    orderIndex,
  });

  const buildManualPrintDocument = () =>
    buildOrderKitchenHtml(order, buildPrintOptions());

  const buildPrinterDocument = () =>
    buildOrderKitchenPrinterHtml(order, buildPrintOptions());

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
    const result = await printHtml("kitchen", buildPrinterDocument());

    if (result?.printed) {
      const message =
        result.mode === "manual"
          ? "Comanda enviada desde la impresora seleccionada"
          : `Comanda enviada a ${result.printerName}`;
      showAlert(message, "success");
    } else if (result?.reason === "no-printer") {
      showAlert("Windows no encontro impresoras disponibles", "error");
    } else {
      showAlert(result?.message || "Error al imprimir la comanda", "error");
    }
  };

  const handlePrint = async () => {
    setLoading(true);
    try {
      if (order.status === "PENDIENTE A CONFIRMAR") {
        await onChangeOrderStatus?.("EN PREPARACIÓN");
        showAlert(
          'Estado del pedido actualizado a "EN PREPARACIÓN"',
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
          startIcon={<RestaurantIcon />}
          onClick={handlePrint}
          disabled={loading || isPrinting}
          sx={{
            fontFamily: "fontFamily.terciary",
            borderRadius: 2,
            minWidth: 140,
            bgcolor: "#2196f3",
            color: "white",
            "&:hover": {
              bgcolor: "info.dark",
            },
          }}
        >
          {loading || isPrinting ? "Procesando..." : "Imprimir Cocina"}
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

        {savedPrinters.kitchen && (
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.7rem",
              lineHeight: 1,
              color: "inherit",
              opacity: 0.8,
            }}
          >
            {savedPrinters.kitchen.name
              ? savedPrinters.kitchen.name
              : "Impresora Termica"}
          </Typography>
        )}
        {!savedPrinters.kitchen && (
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
            Enviando datos a impresora...
          </Typography>
        )}
      </Box>

      <PrintPreviewDialog
        open={showPreview}
        title={`Vista previa - Cocina #${orderIndex || order?.id || ""}`}
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
