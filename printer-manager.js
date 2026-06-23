const fs = require('fs');
const path = require('path');

const PRINTER_TYPES = new Set(['ticket', 'kitchen']);
const MAX_PRINT_HTML_LENGTH = 500000;

const createPrinterManager = (app, BrowserWindow) => {
  const configPath = () =>
    path.join(app.getPath('userData'), 'printer-config.json');

  const readConfig = () => {
    try {
      const parsed = JSON.parse(fs.readFileSync(configPath(), 'utf8'));
      return {
        ticket: typeof parsed.ticket === 'string' ? parsed.ticket : '',
        kitchen: typeof parsed.kitchen === 'string' ? parsed.kitchen : '',
      };
    } catch {
      return { ticket: '', kitchen: '' };
    }
  };

  const writeConfig = (config) => {
    const targetPath = configPath();
    const temporaryPath = `${targetPath}.tmp`;
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(temporaryPath, JSON.stringify(config, null, 2), 'utf8');
    fs.renameSync(temporaryPath, targetPath);
  };

  const listPrinters = async (webContents) => {
    const printers = await webContents.getPrintersAsync();
    return printers.map(({ name, displayName, description, isDefault }) => ({
      name,
      displayName: displayName || name,
      description: description || '',
      isDefault: Boolean(isDefault),
    }));
  };

  const savePrinter = async (webContents, type, deviceName) => {
    if (!PRINTER_TYPES.has(type) || typeof deviceName !== 'string') {
      return { saved: false, reason: 'invalid-request' };
    }

    const printers = await listPrinters(webContents);
    if (!printers.some((printer) => printer.name === deviceName)) {
      return { saved: false, reason: 'printer-not-found' };
    }

    const config = { ...readConfig(), [type]: deviceName };
    writeConfig(config);
    return { saved: true, config };
  };

  const resetPrinters = () => {
    writeConfig({ ticket: '', kitchen: '' });
    return { reset: true };
  };

  const printHtml = async ({ type, html }) => {
    if (
      !PRINTER_TYPES.has(type) ||
      typeof html !== 'string' ||
      html.length === 0 ||
      html.length > MAX_PRINT_HTML_LENGTH
    ) {
      return { printed: false, reason: 'invalid-request' };
    }

    const deviceName = readConfig()[type];

    if (
      process.env.ELECTRON_DISABLE_PRINT === '1' ||
      process.argv.includes('--disable-print-test')
    ) {
      return { printed: false, reason: 'printing-disabled' };
    }

    const printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });

    try {
      await printWindow.loadURL(
        `data:text/html;charset=utf-8,${encodeURIComponent(html)}`
      );

      const printers = await listPrinters(printWindow.webContents);
      const printer = printers.find((item) => item.name === deviceName);
      if (!printers.length) {
        return { printed: false, reason: 'no-printer' };
      }

      await new Promise((resolve, reject) => {
        printWindow.webContents.print(
          {
            silent: Boolean(printer),
            printBackground: true,
            ...(printer ? { deviceName: printer.name } : {}),
            margins: { marginType: 'none' },
          },
          (success, failureReason) => {
            if (success) resolve();
            else reject(new Error(failureReason || 'No se pudo imprimir'));
          }
        );
      });

      return {
        printed: true,
        mode: printer ? 'saved' : 'manual',
        printerName: printer
          ? printer.displayName || printer.name
          : 'impresora seleccionada',
      };
    } catch (error) {
      return {
        printed: false,
        reason: 'print-error',
        message: error.message,
      };
    } finally {
      if (!printWindow.isDestroyed()) printWindow.close();
    }
  };

  return {
    listPrinters,
    readConfig,
    savePrinter,
    resetPrinters,
    printHtml,
  };
};

module.exports = { createPrinterManager };
