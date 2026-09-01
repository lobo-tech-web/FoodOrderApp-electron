const { app, Menu } = require('electron');

const setMainMenu = (
  mainWindow,
  isDevelopment = false,
  onCheckForUpdates = () => { },
  offlineState = {}
) => {
  const forcedOffline = Boolean(offlineState.forcedOffline);
  const backendReachable = offlineState.backendReachable !== false;
  const pendingOrders = Number(offlineState.pendingOrders || 0);
  const statusLabel = forcedOffline
    ? `Estado: sin conexion manual${pendingOrders ? ` (${pendingOrders} pendientes)` : ''}`
    : backendReachable
      ? `Estado: conectado${pendingOrders ? ` (${pendingOrders} pendientes)` : ''}`
      : `Estado: backend sin conexion${pendingOrders ? ` (${pendingOrders} pendientes)` : ''}`;

  const template = [
    {
      label: 'Pedidos',
      submenu: [
        {
          label: 'Pedidos Local',
          accelerator: 'CmdOrCtrl+Shift+L',
          click: () => mainWindow.webContents.send('navigate', '/local-orders'),
        },
        {
          label: 'Panel de control',
          accelerator: 'CmdOrCtrl+Shift+A',
          click: () =>
            mainWindow.webContents.send('navigate', '/control-panel'),
        },
      ],
    },
    {
      label: 'Configuracion',
      submenu: [
        {
          label: 'Impresoras',
          accelerator: 'CmdOrCtrl+Shift+P',
          click: () => mainWindow.webContents.send('open-printer-config'),
        },
        { type: 'separator' },
        {
          label: 'Trabajar sin conexion',
          type: 'checkbox',
          checked: forcedOffline,
          accelerator: 'CmdOrCtrl+Shift+O',
          click: (menuItem) =>
            mainWindow.webContents.send('offline-mode:toggle', menuItem.checked),
        },
      ],
    },
    {
      label: 'Vista',
      submenu: [
        { role: 'reload', label: 'Recargar' },
        { role: 'forceReload', label: 'Forzar recarga' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Restablecer zoom' },
        { role: 'zoomIn', label: 'Acercar' },
        { role: 'zoomOut', label: 'Alejar' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Pantalla completa' },
        ...(isDevelopment
          ? [
            {
              role: 'toggleDevTools',
              label: 'Herramientas de desarrollo',
            },
          ]
          : []),
      ],
    },
    {
      label: 'Aplicacion',
      submenu: [
        {
          label: `Version ${app.getVersion()}`,
          enabled: false,
        },
        {
          label: statusLabel,
          enabled: false,
        },
        { type: 'separator' },
        {
          label: 'Buscar actualizaciones',
          click: onCheckForUpdates,
        },
        { type: 'separator' },
        {
          label: 'Cerrar',
          click: () => app.quit(),
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};

module.exports = {
  setMainMenu,
};
