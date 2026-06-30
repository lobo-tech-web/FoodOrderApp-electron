const {
  app,
  BrowserWindow,
  ipcMain,
  safeStorage,
  session,
} = require('electron');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { setMainMenu } = require('./menu.js');
const { setupAutoUpdater, checkForUpdates } = require('./updater.js');
const { createPrinterManager } = require('./printer-manager.js');

const devServerUrl = process.env.ELECTRON_RENDERER_URL;
const isDevelopment = Boolean(devServerUrl);
const SECURE_STORAGE_KEYS = new Set(['token', 'user', 'loginCredentials']);
let mainWindow;
const printerManager = createPrinterManager(app, BrowserWindow);

app.setAppUserModelId('com.lobotech.foodorderapp.admin');

const getSecureStoragePath = () =>
  path.join(app.getPath('userData'), 'secure-session.json');

const readSecureStorage = () => {
  try {
    return JSON.parse(fs.readFileSync(getSecureStoragePath(), 'utf8'));
  } catch {
    return {};
  }
};

const writeSecureStorage = (storage) => {
  const storagePath = getSecureStoragePath();
  const temporaryPath = `${storagePath}.tmp`;
  fs.mkdirSync(path.dirname(storagePath), { recursive: true });
  fs.writeFileSync(temporaryPath, JSON.stringify(storage), {
    encoding: 'utf8',
    mode: 0o600,
  });
  fs.renameSync(temporaryPath, storagePath);
};

const isAuthorizedRenderer = (sender) =>
  mainWindow &&
  !mainWindow.isDestroyed() &&
  sender.id === mainWindow.webContents.id;

const getSecureValue = (key) => {
  if (!SECURE_STORAGE_KEYS.has(key) || !safeStorage.isEncryptionAvailable()) {
    return null;
  }

  const encryptedValue = readSecureStorage()[key];
  if (!encryptedValue) return null;

  try {
    return safeStorage.decryptString(Buffer.from(encryptedValue, 'base64'));
  } catch {
    return null;
  }
};

const setSecureValue = (key, value) => {
  if (
    !SECURE_STORAGE_KEYS.has(key) ||
    typeof value !== 'string' ||
    !safeStorage.isEncryptionAvailable()
  ) {
    return false;
  }

  const storage = readSecureStorage();
  storage[key] = safeStorage.encryptString(value).toString('base64');
  writeSecureStorage(storage);
  return true;
};

const removeSecureValue = (key) => {
  if (!SECURE_STORAGE_KEYS.has(key)) return false;
  const storage = readSecureStorage();
  delete storage[key];
  writeSecureStorage(storage);
  return true;
};

ipcMain.on('secure-storage:get', (event, key) => {
  event.returnValue = isAuthorizedRenderer(event.sender)
    ? getSecureValue(key)
    : null;
});

ipcMain.on('secure-storage:set', (event, key, value) => {
  event.returnValue = isAuthorizedRenderer(event.sender)
    ? setSecureValue(key, value)
    : false;
});

ipcMain.on('secure-storage:remove', (event, key) => {
  event.returnValue = isAuthorizedRenderer(event.sender)
    ? removeSecureValue(key)
    : false;
});

ipcMain.handle('printers:list', async (event) => {
  if (!isAuthorizedRenderer(event.sender)) return [];
  return printerManager.listPrinters(event.sender);
});

ipcMain.handle('printers:get-config', (event) => {
  if (!isAuthorizedRenderer(event.sender)) {
    return { ticket: '', kitchen: '' };
  }
  return printerManager.readConfig();
});

ipcMain.handle('printers:save-config', async (event, payload) => {
  if (!isAuthorizedRenderer(event.sender)) {
    return { saved: false, reason: 'unauthorized' };
  }
  return printerManager.savePrinter(
    event.sender,
    payload?.type,
    payload?.deviceName
  );
});

ipcMain.handle('printers:reset-config', (event) => {
  if (!isAuthorizedRenderer(event.sender)) {
    return { reset: false, reason: 'unauthorized' };
  }
  return printerManager.resetPrinters();
});

ipcMain.handle('printers:print-html', async (event, payload) => {
  if (!isAuthorizedRenderer(event.sender)) {
    return { printed: false, reason: 'unauthorized' };
  }
  return printerManager.printHtml(payload || {});
});

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 700,
    title: 'FoodOrderApp Admin',
    backgroundColor: '#343a40',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url === 'about:blank') {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
          },
        },
      };
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const allowedBase = isDevelopment
      ? devServerUrl
      : pathToFileURL(path.join(__dirname, 'dist', 'index.html')).href;

    if (!url.startsWith(allowedBase)) event.preventDefault();
  });

  if (devServerUrl) {
    await mainWindow.loadURL(devServerUrl);
  } else {
    await mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  setMainMenu(mainWindow, isDevelopment, () =>
    checkForUpdates(mainWindow, { manual: true })
  );

  setupAutoUpdater(mainWindow);
};

app.whenReady().then(async () => {
  session.defaultSession.setPermissionRequestHandler(
    (_webContents, _permission, callback) => callback(false)
  );
  session.defaultSession.setPermissionCheckHandler(() => false);

  if (!isDevelopment) {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      const responseHeaders = { ...details.responseHeaders };

      if (details.url.startsWith('file:')) {
        responseHeaders['Content-Security-Policy'] = [
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src https://foodorderapp-api-production.up.railway.app; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
        ];
      }

      callback({ responseHeaders });
    });
  }

  await createWindow();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
