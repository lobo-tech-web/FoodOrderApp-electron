const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onNavigate: (callback) => {
    const listener = (_event, path) => callback(path);
    ipcRenderer.on('navigate', listener);
    return () => ipcRenderer.removeListener('navigate', listener);
  },
  printOrderTicket: (ticketHtml) =>
    ipcRenderer.invoke('print-order-ticket', ticketHtml),
});

contextBridge.exposeInMainWorld('secureStorage', {
  getItem: (key) => ipcRenderer.sendSync('secure-storage:get', key),
  setItem: (key, value) =>
    ipcRenderer.sendSync('secure-storage:set', key, String(value)),
  removeItem: (key) => ipcRenderer.sendSync('secure-storage:remove', key),
});
