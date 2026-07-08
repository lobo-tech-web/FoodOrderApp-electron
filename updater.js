const { app, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const { autoUpdater } = require('electron-updater');

const INITIAL_UPDATE_CHECK_DELAY_MS = 1000;
const UPDATE_INTERVAL_MS = 4 * 60 * 60 * 1000;
const UPDATE_FEED = {
  provider: 'github',
  owner: 'lobo-tech-web',
  repo: 'FoodOrderApp-electron',
  releaseType: 'release',
};
let initialized = false;
let checkingForUpdates = false;
let activeCheckMode = 'background';

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

const sendUpdateStatus = (mainWindow, payload) => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send('update-status', payload);
};

const checkForUpdates = async (
  mainWindow,
  { manual = false, mode = manual ? 'manual' : 'background' } = {}
) => {
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

  if (checkingForUpdates) {
    if (manual) {
      sendUpdateStatus(mainWindow, {
        status: 'checking',
        mode,
        message: 'Ya hay una busqueda de actualizaciones en curso.',
      });
    }
    return null;
  }

  activeCheckMode = mode;
  checkingForUpdates = true;
  writeUpdateLog(`checking for updates. mode=${mode}`);

  if (mode === 'startup' || manual) {
    sendUpdateStatus(mainWindow, {
      status: 'checking',
      mode,
      message: 'Buscando actualizaciones...',
    });
  }

  try {
    const result = await autoUpdater.checkForUpdates();
    return result;
  } catch (error) {
    writeUpdateLog('check for updates failed.', error);
    if (manual) {
      sendUpdateStatus(mainWindow, {
        status: 'error',
        mode,
        message: 'No se pudo buscar actualizaciones.',
        detail: error.message,
      });
    }
    return null;
  } finally {
    checkingForUpdates = false;
  }
};

const installDownloadedUpdate = () => {
  writeUpdateLog('install update requested from renderer.');
  if (!app.isPackaged) return { installing: false, reason: 'not-packaged' };

  setTimeout(() => autoUpdater.quitAndInstall(false, true), 250);
  return { installing: true };
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
    const mode = activeCheckMode;
    activeCheckMode = 'background';

    if (mode === 'startup') {
      sendUpdateStatus(mainWindow, { status: 'idle', mode });
      return;
    }

    if (mode !== 'manual') return;

    sendUpdateStatus(mainWindow, {
      status: 'not-available',
      mode,
      message: 'Ya tienes la version mas reciente.',
    });
  });

  autoUpdater.on('update-available', async (updateInfo) => {
    writeUpdateLog(`update available. version=${updateInfo.version}`);
    if (activeCheckMode === 'background') return;

    sendUpdateStatus(mainWindow, {
      status: 'downloading',
      mode: activeCheckMode,
      version: updateInfo.version,
      message: `Descargando FoodOrderApp Admin ${updateInfo.version}...`,
    });
  });

  autoUpdater.on('error', async (error) => {
    writeUpdateLog('updater error.', error);
    const mode = activeCheckMode;
    activeCheckMode = 'background';

    if (mode === 'startup') {
      sendUpdateStatus(mainWindow, { status: 'idle', mode });
      return;
    }

    if (mode !== 'manual') return;

    sendUpdateStatus(mainWindow, {
      status: 'error',
      mode,
      message: 'No se pudo completar la busqueda de actualizaciones.',
      detail: error.message,
    });
  });

  autoUpdater.on('update-downloaded', async (updateInfo) => {
    writeUpdateLog(`update downloaded. version=${updateInfo.version}`);
    const mode = activeCheckMode;
    activeCheckMode = 'background';

    if (mode === 'startup') {
      writeUpdateLog('startup update downloaded. installing now.');
      sendUpdateStatus(mainWindow, {
        status: 'installing',
        mode,
        version: updateInfo.version,
        message:
          'Actualizacion descargada. La aplicacion se reiniciara para instalarla.',
      });
      setTimeout(() => autoUpdater.quitAndInstall(false, true), 1200);
      return;
    }

    sendUpdateStatus(mainWindow, {
      status: 'ready',
      mode,
      version: updateInfo.version,
      message: `FoodOrderApp Admin ${updateInfo.version} esta listo para instalar.`,
      detail: 'Puedes actualizar ahora o seguir trabajando y actualizar mas tarde.',
    });
  });

  setTimeout(
    () => checkForUpdates(mainWindow, { mode: 'startup' }),
    INITIAL_UPDATE_CHECK_DELAY_MS
  );
  setInterval(() => {
    checkForUpdates(mainWindow, { mode: 'background' });
  }, UPDATE_INTERVAL_MS);
};

module.exports = {
  checkForUpdates,
  installDownloadedUpdate,
  setupAutoUpdater,
};
