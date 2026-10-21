const { contextBridge, ipcRenderer } = require('electron');
const isTotemRenderer = process.argv.includes("--lobotech-totem");

if (!isTotemRenderer) {
  contextBridge.exposeInMainWorld('electronAPI', {
    onNavigate: (callback) => {
      const listener = (_event, path) => callback(path);
      ipcRenderer.on('navigate', listener);
      return () => ipcRenderer.removeListener('navigate', listener);
    },
    onOpenPrinterConfig: (callback) => {
      const listener = () => callback();
      ipcRenderer.on('open-printer-config', listener);
      return () => ipcRenderer.removeListener('open-printer-config', listener);
    },
    onUpdateStatus: (callback) => {
      const listener = (_event, payload) => callback(payload);
      ipcRenderer.on('update-status', listener);
      return () => ipcRenderer.removeListener('update-status', listener);
    },
    onToggleOfflineMode: (callback) => {
      const listener = (_event, enabled) => callback(Boolean(enabled));
      ipcRenderer.on('offline-mode:toggle', listener);
      return () => ipcRenderer.removeListener('offline-mode:toggle', listener);
    },
    setOfflineStatus: (status) => ipcRenderer.invoke('offline-mode:set-status', status),
    setWindowMode: (mode) => ipcRenderer.invoke('window:set-mode', mode),
    installUpdate: () => ipcRenderer.invoke('updates:install'),
    listPrinters: () => ipcRenderer.invoke('printers:list'),
    getPrinterConfig: () => ipcRenderer.invoke('printers:get-config'),
    savePrinterConfig: (type, deviceName) => ipcRenderer.invoke('printers:save-config', { type, deviceName }),
    resetPrinterConfig: () => ipcRenderer.invoke('printers:reset-config'),
    printHtml: (type, html) => ipcRenderer.invoke('printers:print-html', { type, html }),
    openExternal: (url) => ipcRenderer.invoke('shell:open-external', url),
    writeClipboardText: (text) => ipcRenderer.invoke('clipboard:write-text', text),
  });

  contextBridge.exposeInMainWorld('secureStorage', {
    getItem: (key) => ipcRenderer.sendSync('secure-storage:get', key),
    setItem: (key, value) => ipcRenderer.sendSync('secure-storage:set', key, String(value)),
    removeItem: (key) => ipcRenderer.sendSync('secure-storage:remove', key),
  });
};

contextBridge.exposeInMainWorld("totemAPI", {
  getRuntime: () => ipcRenderer.invoke("totem:get-runtime"),
  getStatus: () => ipcRenderer.invoke("totem:get-status"),
  getCatalog: () => ipcRenderer.invoke("totem:get-catalog"),
  findCustomer: (cuit) => ipcRenderer.invoke("totem:find-customer", cuit),
  createCheckout: (data) => ipcRenderer.invoke("totem:create-checkout", data),
  recoverCheckout: () => ipcRenderer.invoke("totem:recover-checkout"),
  getCheckout: (id) => ipcRenderer.invoke("totem:get-checkout", id),
  cancelCheckout: (id) => ipcRenderer.invoke("totem:cancel-checkout", id),
  finishCheckout: (id) => ipcRenderer.invoke("totem:finish-checkout", id),
  printReceipt: (id) => ipcRenderer.invoke("totem:print-receipt", id),
  activate: ({ deviceId, pairingCode } = {}) => ipcRenderer.invoke("totem:activate", { deviceId, pairingCode }),
  registerThemes: (themes) => ipcRenderer.invoke("totem:register-themes", themes),
  onThemeChanged: (callback) => {
    const listener = (_event, themeName) => callback(themeName);
    ipcRenderer.on("totem:theme-changed", listener);
    return () => ipcRenderer.removeListener("totem:theme-changed", listener);
  },
  onRequestExit: (callback) => {
    const listener = () => callback();
    ipcRenderer.on("totem:request-exit", listener);
    return () => ipcRenderer.removeListener("totem:request-exit", listener);
  },
  authorizeExit: (password) => ipcRenderer.invoke("totem:authorize-exit", { password }),
  requestExit: () => ipcRenderer.invoke("totem:request-exit"),
  onBackgroundChanged: (callback) => {
    const listener = (_event, background) => callback(background);
    ipcRenderer.on("totem:background-changed", listener);
    return () => ipcRenderer.removeListener("totem:background-changed", listener);
  },
});
