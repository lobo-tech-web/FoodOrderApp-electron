// Hook para manejar impresoras térmicas directamente
import { useState, useEffect, useCallback } from "react"

// ---- SERVICES ----
import { postReceiptServices, postKitchenServices } from "@/services/printer.js";
// ------------------

export const useThermalPrinter = () => {
    const [savedPrinters, setSavedPrinters] = useState({});
    const [isPrinting, setIsPrinting] = useState(false);

    // Cargar impresoras guardadas del localStorage
    useEffect(() => {
        const saved = localStorage.getItem("thermalPrinters");
        if (saved) {
            setSavedPrinters(JSON.parse(saved));
        };
    }, []);

    // guardar config de impresora
    const savePrinterConfig = (type, config) => {
        const updated = { ...savedPrinters, [type]: config };
        setSavedPrinters({ ...updated });
        localStorage.setItem("thermalPrinters", JSON.stringify(updated));
    };

    // enviar a imprimir
    const printToThermal = useCallback(async (type, orderData) => {
        const printerConfig = savedPrinters[type];
        if (!printerConfig) {
            alert(`No hay impresora configurada para ${type}`);
            return false;
        }

        setIsPrinting(true);
        try {
            const result = type === 'ticket'
                ? await postReceiptServices(printerConfig, orderData)
                : await postKitchenServices(printerConfig, orderData);
            if (result.success) {
                console.log(`✅ Impreso en impresora ${type}`);
                return true;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            console.error("❌ Error imprimiendo:", err);
            alert("Error al imprimir en la impresora");
            return false;
        } finally {
            setIsPrinting(false);
        }
    }, [savedPrinters]);

    const resetSavedPrinters = () => {
        localStorage.setItem("thermalPrinters", JSON.stringify({}));
        setSavedPrinters({});
    };


    return {
        savedPrinters,
        isPrinting,
        printToThermal,
        savePrinterConfig,
        resetSavedPrinters,
    };
};
