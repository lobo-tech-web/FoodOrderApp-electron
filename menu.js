const { app, Menu } = require('electron');

const setMainMenu = (
  mainWindow,
  isDevelopment = false,
  onCheckForUpdates = () => { }
) => {
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
