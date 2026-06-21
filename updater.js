const { app, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');

const UPDATE_INTERVAL_MS = 4 * 60 * 60 * 1000;
let initialized = false;
let manualCheck = false;

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

const showMessage = (mainWindow, options) => {
  if (!mainWindow || mainWindow.isDestroyed()) return Promise.resolve();
  return dialog.showMessageBox(mainWindow, options);
};

const checkForUpdates = async (mainWindow, { manual = false } = {}) => {
  if (!app.isPackaged) {
    if (manual) {
      await showMessage(mainWindow, {
        type: 'info',
        title: 'Actualizaciones',
        message: 'Las actualizaciones se comprueban en la aplicacion instalada.',
        detail: 'El modo de desarrollo no descarga actualizaciones.',
      });
    }
    return null;
  }

  manualCheck = manual;

  try {
    return await autoUpdater.checkForUpdates();
  } catch (error) {
    if (manual) {
      await showMessage(mainWindow, {
        type: 'error',
        title: 'No se pudo buscar actualizaciones',
        message: 'Revisa tu conexion a Internet e intenta nuevamente.',
        detail: error.message,
      });
    }
    manualCheck = false;
    return null;
  }
};

const setupAutoUpdater = (mainWindow) => {
  if (initialized || !app.isPackaged) return;
  initialized = true;

  autoUpdater.on('update-not-available', async () => {
    if (!manualCheck) return;
    manualCheck = false;
    await showMessage(mainWindow, {
      type: 'info',
      title: 'FoodOrderApp Admin',
      message: 'Ya tienes la version mas reciente.',
    });
  });

  autoUpdater.on('update-available', () => {
    manualCheck = false;
  });

  autoUpdater.on('error', async (error) => {
    if (!manualCheck) return;
    manualCheck = false;
    await showMessage(mainWindow, {
      type: 'error',
      title: 'Error de actualizacion',
      message: 'No se pudo completar la busqueda de actualizaciones.',
      detail: error.message,
    });
  });

  autoUpdater.on('update-downloaded', async (updateInfo) => {
    const result = await showMessage(mainWindow, {
      type: 'info',
      title: 'Actualizacion lista',
      message: `FoodOrderApp Admin ${updateInfo.version} esta listo para instalar.`,
      detail:
        'La aplicacion se cerrara y volvera a abrir con la nueva version.',
      buttons: ['Actualizar ahora', 'Mas tarde'],
      defaultId: 0,
      cancelId: 1,
      noLink: true,
    });

    if (result?.response === 0) {
      autoUpdater.quitAndInstall(false, true);
    }
  });

  setTimeout(() => checkForUpdates(mainWindow), 10000);
  setInterval(() => checkForUpdates(mainWindow), UPDATE_INTERVAL_MS);
};

module.exports = {
  checkForUpdates,
  setupAutoUpdater,
};
