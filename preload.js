const { contextBridge, ipcRenderer } = require('electron');

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
  listPrinters: () => ipcRenderer.invoke('printers:list'),
  getPrinterConfig: () => ipcRenderer.invoke('printers:get-config'),
  savePrinterConfig: (type, deviceName) =>
    ipcRenderer.invoke('printers:save-config', { type, deviceName }),
  resetPrinterConfig: () => ipcRenderer.invoke('printers:reset-config'),
  printHtml: (type, html) =>
    ipcRenderer.invoke('printers:print-html', { type, html }),
  openExternal: (url) => ipcRenderer.invoke('shell:open-external', url),
});

contextBridge.exposeInMainWorld('secureStorage', {
  getItem: (key) => ipcRenderer.sendSync('secure-storage:get', key),
  setItem: (key, value) =>
    ipcRenderer.sendSync('secure-storage:set', key, String(value)),
  removeItem: (key) => ipcRenderer.sendSync('secure-storage:remove', key),
});
