const { app, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const { autoUpdater } = require('electron-updater');

const INITIAL_UPDATE_CHECK_DELAY_MS = 3000;
const UPDATE_INTERVAL_MS = 4 * 60 * 60 * 1000;
const UPDATE_FEED = {
  provider: 'github',
  owner: 'lobo-tech-web',
  repo: 'FoodOrderApp-electron',
  releaseType: 'release',
};
let initialized = false;
let manualCheck = false;
let checkingForUpdates = false;

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

const writeUpdateLog = (message, error) => {
  try {
    const logPath = path.join(app.getPath('userData'), 'update.log');
    const detail = error ? ` ${error.stack || error.message || error}` : '';
    fs.appendFileSync(
      logPath,
      `[${new Date().toISOString()}] ${message}${detail}\n`,
      'utf8'
    );
  } catch {
    // Logging must never interrupt update checks.
  }
};

autoUpdater.logger = {
  info: (message) => writeUpdateLog(`info: ${message}`),
  warn: (message) => writeUpdateLog(`warn: ${message}`),
  error: (message) => writeUpdateLog(`error: ${message}`),
  debug: (message) => writeUpdateLog(`debug: ${message}`),
};

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

  if (checkingForUpdates) {
    if (manual) {
      await showMessage(mainWindow, {
        type: 'info',
        title: 'Actualizaciones',
        message: 'Ya hay una busqueda de actualizaciones en curso.',
      });
    }
    return null;
  }

  checkingForUpdates = true;
  writeUpdateLog(`checking for updates. manual=${manual}`);

  try {
    const result = await autoUpdater.checkForUpdates();
    return result;
  } catch (error) {
    writeUpdateLog('check for updates failed.', error);
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
  } finally {
    checkingForUpdates = false;
  }
};

const setupAutoUpdater = (mainWindow) => {
  if (initialized || !app.isPackaged) return;
  initialized = true;
  autoUpdater.setFeedURL(UPDATE_FEED);
  writeUpdateLog(
    `updater initialized. version=${app.getVersion()} feed=${UPDATE_FEED.owner}/${UPDATE_FEED.repo}`
  );

  autoUpdater.on('update-not-available', async () => {
    writeUpdateLog('update not available.');
    if (!manualCheck) return;
    manualCheck = false;
    await showMessage(mainWindow, {
      type: 'info',
      title: 'FoodOrderApp Admin',
      message: 'Ya tienes la version mas reciente.',
    });
  });

  autoUpdater.on('update-available', async (updateInfo) => {
    writeUpdateLog(`update available. version=${updateInfo.version}`);
    if (manualCheck) {
      await showMessage(mainWindow, {
        type: 'info',
        title: 'Actualizacion encontrada',
        message: `Se encontro FoodOrderApp Admin ${updateInfo.version}.`,
        detail: 'La descarga comenzara automaticamente.',
      });
    }
  });

  autoUpdater.on('error', async (error) => {
    writeUpdateLog('updater error.', error);
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
    writeUpdateLog(`update downloaded. version=${updateInfo.version}`);
    const wasManualCheck = manualCheck;
    manualCheck = false;

    if (!wasManualCheck) {
      writeUpdateLog('automatic update downloaded. installing now.');
      autoUpdater.quitAndInstall(false, true);
      return;
    }

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

  setTimeout(() => checkForUpdates(mainWindow), INITIAL_UPDATE_CHECK_DELAY_MS);
  setInterval(() => checkForUpdates(mainWindow), UPDATE_INTERVAL_MS);
};

module.exports = {
  checkForUpdates,
  setupAutoUpdater,
};
