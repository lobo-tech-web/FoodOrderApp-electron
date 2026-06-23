import { useCallback, useEffect, useState } from 'react';

const CONFIG_CHANGED_EVENT = 'electron-printer-config-changed';
const EMPTY_CONFIG = { ticket: '', kitchen: '' };

const toSavedPrinters = (config, printers) =>
  Object.fromEntries(
    Object.entries(config || {})
      .filter(([, deviceName]) => Boolean(deviceName))
      .map(([type, deviceName]) => {
        const printer = printers.find((item) => item.name === deviceName);
        return [
          type,
          {
            deviceName,
            name: printer?.displayName || deviceName,
            displayName: printer?.displayName || deviceName,
          },
        ];
      })
  );

export const useThermalPrinter = () => {
  const [availablePrinters, setAvailablePrinters] = useState([]);
  const [savedPrinters, setSavedPrinters] = useState({});
  const [isLoadingPrinters, setIsLoadingPrinters] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const refreshPrinters = useCallback(async () => {
    if (!window.electronAPI?.listPrinters) {
      setAvailablePrinters([]);
      setSavedPrinters({});
      return;
    }

    setIsLoadingPrinters(true);
    try {
      const [printers, config] = await Promise.all([
        window.electronAPI.listPrinters(),
        window.electronAPI.getPrinterConfig(),
      ]);
      const safePrinters = Array.isArray(printers) ? printers : [];
      setAvailablePrinters(safePrinters);
      setSavedPrinters(toSavedPrinters(config || EMPTY_CONFIG, safePrinters));
    } catch (error) {
      console.error('No se pudieron cargar las impresoras de Windows:', error);
      setAvailablePrinters([]);
      setSavedPrinters({});
    } finally {
      setIsLoadingPrinters(false);
    }
  }, []);

  useEffect(() => {
    refreshPrinters();
    window.addEventListener(CONFIG_CHANGED_EVENT, refreshPrinters);
    return () =>
      window.removeEventListener(CONFIG_CHANGED_EVENT, refreshPrinters);
  }, [refreshPrinters]);

  const savePrinterConfig = useCallback(async (type, deviceName) => {
    try {
      const result = await window.electronAPI?.savePrinterConfig?.(
        type,
        deviceName
      );
      if (!result?.saved) return result;

      window.dispatchEvent(new Event(CONFIG_CHANGED_EVENT));
      return result;
    } catch (error) {
      return { saved: false, reason: 'save-error', message: error.message };
    }
  }, []);

  const resetSavedPrinters = useCallback(async () => {
    try {
      const result = await window.electronAPI?.resetPrinterConfig?.();
      if (result?.reset) {
        window.dispatchEvent(new Event(CONFIG_CHANGED_EVENT));
      }
      return result;
    } catch (error) {
      return { reset: false, reason: 'reset-error', message: error.message };
    }
  }, []);

  const printHtml = useCallback(async (type, html) => {
    if (!window.electronAPI?.printHtml) {
      return { printed: false, reason: 'electron-unavailable' };
    }

    setIsPrinting(true);
    try {
      return await window.electronAPI.printHtml(type, html);
    } catch (error) {
      return { printed: false, reason: 'print-error', message: error.message };
    } finally {
      setIsPrinting(false);
    }
  }, []);

  return {
    availablePrinters,
    savedPrinters,
    isLoadingPrinters,
    isPrinting,
    printHtml,
    refreshPrinters,
    savePrinterConfig,
    resetSavedPrinters,
  };
};
