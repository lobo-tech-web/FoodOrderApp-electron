const {
  app,
  BrowserWindow,
  clipboard,
  ipcMain,
  Menu,
  dialog,
  safeStorage,
  screen,
  session,
  shell,
  nativeImage,
} = require('electron');

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { setMainMenu } = require('./menu.js');
const {
  setupAutoUpdater,
  checkForUpdates,
  installDownloadedUpdate,
} = require('./updater.js');

const { createPrinterManager } = require('./printer-manager.js');
const { createTotemManager } = require('./totem-manager.js');
const { createTotemAppearance } = require('./totem-appearance.js');
const totemAppearance = createTotemAppearance(app, nativeImage);

const devServerUrl = process.env.ELECTRON_RENDERER_URL;
const isDevelopment = Boolean(devServerUrl);
let isTotemMode = process.argv.includes("--totem");

let switchingMode = false;
let authorizedTotemQuit = false;
let exitPromptOpen = false;
let totemThemeOptions = [];

const totemManager = createTotemManager(app, safeStorage,
  {
    apiURL: process.env.ELECTRON_TOTEM_API_URL || "https://foodorderapp-api-production.up.railway.app/main-route-totem",
    isDevelopment,
  }
);

const SECURE_STORAGE_KEYS = new Set(['token', 'user', 'loginCredentials']);
let mainWindow;
let offlineMenuState = {
  forcedOffline: false,
  backendReachable: true,
  pendingOrders: 0,
};
const printerManager = createPrinterManager(app, BrowserWindow, {
  onKitchenPrint: () => shell.beep(),
  requireConfiguredPrinter: () => isTotemMode,
});

const LOGIN_WINDOW_SIZE = {
  width: 1024,
  height: 768,
};

const APP_WINDOW_MIN_SIZE = {
  width: 1024,
  height: 700,
};

const getCenteredWindowSize = ({ width, height }) => {
  const { workAreaSize } = screen.getPrimaryDisplay();
  return {
    width: Math.min(width, Math.max(480, workAreaSize.width - 48)),
    height: Math.min(height, Math.max(620, workAreaSize.height - 48)),
  };
};

const applyWindowMode = (mode) => {
  if (!mainWindow || mainWindow.isDestroyed()) return false;

  if (isTotemMode) {
    mainWindow.setKiosk(!isDevelopment);
    mainWindow.setResizable(isDevelopment);
    mainWindow.setMenuBarVisibility(isDevelopment);

    if (isDevelopment) {
      mainWindow.maximize();
    }

    return true;
  }

  if (mode === 'login') {
    const size = getCenteredWindowSize(LOGIN_WINDOW_SIZE);

    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    mainWindow.setMinimumSize(480, 620);
    mainWindow.setResizable(true);
    mainWindow.setSize(size.width, size.height, false);
    mainWindow.center();
    return true;
  }

  if (mode === 'app') {
    mainWindow.setMinimumSize(APP_WINDOW_MIN_SIZE.width, APP_WINDOW_MIN_SIZE.height);

    if (!mainWindow.isMaximized()) {
      mainWindow.maximize();
    }

    mainWindow.focus();
    return true;
  }

  return false;
};

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

const isAuthorizedTotemEvent = (event) =>
  isAuthorizedRenderer(event.sender) &&
  event.senderFrame === event.sender.mainFrame;

const isAuthorizedAdminEvent = (event) => !isTotemMode && isAuthorizedTotemEvent(event);

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

const getTotemThemePath = () => path.join(app.getPath("userData"), "totem-theme.json");

const getTotemTheme = () => {
  let savedTheme = "dark";

  try {
    const config = JSON.parse(fs.readFileSync(getTotemThemePath(), "utf8"));
    savedTheme = config.theme;
  } catch {
    // Usamos el tema predeterminado.
  }

  return totemThemeOptions.some((option) => option.value === savedTheme)
    ? savedTheme
    : totemThemeOptions[0]?.value || "dark";
};

const saveTotemTheme = (themeName) => {
  if (!totemThemeOptions.some((option) => option.value === themeName)) {
    throw new Error("Tema del tótem inválido");
  }

  const target = getTotemThemePath();
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(
    `${target}.tmp`,
    JSON.stringify({ theme: themeName }),
    "utf8",
  );
  fs.renameSync(`${target}.tmp`, target);
};

const buildTotemThemeMenu = () => {
  if (!totemThemeOptions.length) {
    return [{ label: "Cargando temas…", enabled: false }];
  }

  const selectedTheme = getTotemTheme();

  return totemThemeOptions.map((option) => ({
    label: option.label,
    type: "radio",
    checked: option.value === selectedTheme,

    click: () => {
      try {
        saveTotemTheme(option.value);
        mainWindow.webContents.send("totem:theme-changed", option.value);
        refreshMainMenu();
      } catch (error) {
        dialog.showErrorBox("No se pudo guardar el tema", error.message);
      }
    },
  }));
};

let choosingTotemBackground = false;
const requireBackgroundAdmin = () => {
  let user;
  try { user = JSON.parse(getSecureValue("user") || "null"); } catch { /* Sin sesión válida. */ }
  if (isTotemMode || user?.role !== "admin") throw new Error("Iniciá sesión como administrador para cambiar el fondo del tótem");
};
const notifyTotemBackground = () => {
  mainWindow.webContents.send("totem:background-changed", totemAppearance.getBackground());
  refreshMainMenu();
};
const changeTotemBackgroundMode = (mode) => {
  try {
    requireBackgroundAdmin();
    totemAppearance.setMode(mode);
    notifyTotemBackground();
  } catch (error) { dialog.showErrorBox("No se pudo cambiar el fondo", error.message); }
};
const chooseTotemBackground = async () => {
  if (choosingTotemBackground) return;
  choosingTotemBackground = true;
  const window = mainWindow;
  try {
    requireBackgroundAdmin();
    const result = await dialog.showOpenDialog(window, {
      title: "Elegir fondo del tótem (solo se guarda en esta PC)",
      properties: ["openFile"],
      filters: [{ name: "Imágenes PNG o JPG (hasta 10 MB)", extensions: ["png", "jpg", "jpeg"] }],
    });
    if (result.canceled || !result.filePaths?.[0]) return;
    if (window !== mainWindow || window.isDestroyed()) return;
    requireBackgroundAdmin();
    totemAppearance.importImage(result.filePaths[0]);
    notifyTotemBackground();
  } catch (error) { dialog.showErrorBox("No se pudo cargar el fondo", error.message); }
  finally { choosingTotemBackground = false; }
};
const buildTotemBackgroundMenu = () => {
  const background = totemAppearance.getBackground();
  return [
    { label: "Colores del tema", type: "radio", checked: background.mode === "theme", click: () => changeTotemBackgroundMode("theme") },
    { label: "Imagen guardada en esta PC", type: "radio", checked: background.mode === "image", enabled: background.hasImage, click: () => changeTotemBackgroundMode("image") },
    { type: "separator" },
    { label: "Cargar imagen de fondo…", click: chooseTotemBackground },
  ];
};

const startTotemMode = async () => {
  if (
    isTotemMode ||
    switchingMode ||
    !mainWindow ||
    mainWindow.isDestroyed()
  ) {
    return;
  }

  if (!isDevelopment) {
    const args = process.argv.slice(1).filter((arg) => arg !== "--totem");
    app.relaunch({ args: [...args, "--totem"] });
    app.quit();
    return;
  }

  // En desarrollo mantenemos el proceso y el servidor de Vite.
  switchingMode = true;

  const previousWindow = mainWindow;
  try {
    isTotemMode = true;
    await createWindow();

    if (!previousWindow.isDestroyed()) previousWindow.destroy();
  } catch (error) {
    const failedWindow = mainWindow;

    isTotemMode = false;
    mainWindow = previousWindow;

    if (
      failedWindow &&
      failedWindow !== previousWindow &&
      !failedWindow.isDestroyed()
    ) {
      failedWindow.destroy();
    }

    refreshMainMenu();

    dialog.showErrorBox("No se pudo iniciar el tótem", error.message);
  } finally {
    switchingMode = false;
  }
};

const refreshMainMenu = () => {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  if (isTotemMode) {
    if (!isDevelopment) {
      Menu.setApplicationMenu(null);
      mainWindow.setMenuBarVisibility(false);
      return;
    }

    Menu.setApplicationMenu(
      Menu.buildFromTemplate([
        {
          label: "Tótem — desarrollo",
          submenu: [
            {
              label: "Tema del tótem",
              submenu: buildTotemThemeMenu(),
            },
            { type: "separator" },
            { role: "reload", label: "Recargar" },
            {
              role: "toggleDevTools",
              label: "Herramientas de desarrollo",
            },
            { type: "separator" },
            {
              label: "Cerrar aplicación",
              click: () => app.quit(),
            },
          ],
        },
      ]),
    );

    mainWindow.setMenuBarVisibility(true);
    return;
  }

  setMainMenu(
    mainWindow,
    isDevelopment,
    () => checkForUpdates(mainWindow, { manual: true }),
    offlineMenuState,
    startTotemMode,
    buildTotemThemeMenu(),
    buildTotemBackgroundMenu(),
  );
};

const quitAuthorizedTotem = () => {
  authorizedTotemQuit = true;
  app.quit();
};

const requestTotemExit = async () => {
  if (
    !isTotemMode ||
    isDevelopment ||
    exitPromptOpen ||
    !mainWindow ||
    mainWindow.isDestroyed()
  ) {
    return;
  }

  if (totemManager.hasCredential()) {
    mainWindow.webContents.send("totem:request-exit");
    return;
  }

  // Antes de vincularlo no existe un local al que autenticar.
  exitPromptOpen = true;

  try {
    const result = await dialog.showMessageBox(mainWindow, {
      type: "question",
      title: "Cerrar tótem",
      message: "Este equipo todavía no está vinculado.",
      detail: "¿Querés cerrar la aplicación?",
      buttons: ["Continuar configuración", "Cerrar aplicación"],
      defaultId: 0,
      cancelId: 0,
      noLink: true,
    });

    if (result.response === 1) {
      quitAuthorizedTotem();
    }
  } finally {
    exitPromptOpen = false;
  }
};

ipcMain.on('secure-storage:get', (event, key) => {
  event.returnValue = isAuthorizedAdminEvent(event)
    ? getSecureValue(key)
    : null;
});

ipcMain.on('secure-storage:set', (event, key, value) => {
  event.returnValue = isAuthorizedAdminEvent(event)
    ? setSecureValue(key, value)
    : false;
});

ipcMain.on('secure-storage:remove', (event, key) => {
  event.returnValue = isAuthorizedAdminEvent(event)
    ? removeSecureValue(key)
    : false;
});

ipcMain.handle('printers:list', async (event) => {
  if (!isAuthorizedTotemEvent(event)) return [];
  return printerManager.listPrinters(event.sender);
});

ipcMain.handle('printers:get-config', (event) => {
  if (!isAuthorizedTotemEvent(event)) {
    return { ticket: '', kitchen: '' };
  }
  return printerManager.readConfig();
});

ipcMain.handle('printers:save-config', async (event, payload) => {
  if (!isAuthorizedAdminEvent(event)) {
    return { saved: false, reason: 'unauthorized' };
  }
  return printerManager.savePrinter(
    event.sender,
    payload?.type,
    payload?.deviceName
  );
});

ipcMain.handle('printers:reset-config', (event) => {
  if (!isAuthorizedAdminEvent(event)) {
    return { reset: false, reason: 'unauthorized' };
  }
  return printerManager.resetPrinters();
});

ipcMain.handle('printers:print-html', async (event, payload) => {
  if (!isAuthorizedTotemEvent(event)) {
    return { printed: false, reason: 'unauthorized' };
  }
  return printerManager.printHtml(payload || {});
});

ipcMain.handle('shell:open-external', async (event, rawUrl) => {
  if (!isAuthorizedAdminEvent(event)) {
    return { opened: false, reason: 'unauthorized' };
  }

  try {
    const url = new URL(String(rawUrl || '').trim());

    if (!['http:', 'https:'].includes(url.protocol)) {
      return { opened: false, reason: 'unsupported-protocol' };
    }

    await shell.openExternal(url.toString());
    return { opened: true };
  } catch (error) {
    return {
      opened: false,
      reason: 'invalid-url',
      message: error.message,
    };
  }
});

ipcMain.handle('clipboard:write-text', async (event, text) => {
  if (!isAuthorizedAdminEvent(event)) {
    return { copied: false, reason: 'unauthorized' };
  }

  const value = String(text ?? '').trim();

  if (!value) {
    return { copied: false, reason: 'empty-text' };
  }

  clipboard.writeText(value);
  return { copied: true };
});

ipcMain.handle('updates:install', (event) => {
  if (!isAuthorizedAdminEvent(event)) {
    return { installing: false, reason: 'unauthorized' };
  }

  return installDownloadedUpdate();
});

ipcMain.handle('offline-mode:set-status', (event, payload = {}) => {
  if (!isAuthorizedAdminEvent(event)) {
    return { updated: false, reason: 'unauthorized' };
  }

  offlineMenuState = {
    ...offlineMenuState,
    forcedOffline: Boolean(payload.forcedOffline),
    backendReachable: payload.backendReachable !== false,
    pendingOrders: Number(payload.pendingOrders || 0),
  };

  refreshMainMenu();
  return { updated: true };
});

ipcMain.handle('window:set-mode', (event, mode) => {
  if (!isAuthorizedAdminEvent(event)) {
    return { updated: false, reason: 'unauthorized' };
  }

  return {
    updated: applyWindowMode(mode),
  };
});

ipcMain.handle("totem:get-runtime", (event) => {
  if (!isAuthorizedTotemEvent(event)) {
    return {
      ok: false,
      message: "Solicitud no autorizada",
    };
  }

  return {
    ok: true,
    mode: isTotemMode ? "totem" : "admin",
    isDevelopment,
    totemTheme: getTotemTheme(),
    totemBackground: totemAppearance.getBackground(),
  };
});

ipcMain.handle("totem:request-exit", async (event) => {
  if (!isTotemMode || !isAuthorizedTotemEvent(event)) return { ok: false, message: "Solicitud no autorizada" };
  if (isDevelopment) {
    mainWindow.webContents.send("totem:request-exit");
  } else {
    await requestTotemExit();
  }
  return { ok: true };
});

ipcMain.handle("totem:get-status", async (event) => {
  if (!isAuthorizedTotemEvent(event)) {
    return {
      ok: false,
      message: "Solicitud no autorizada",
    };
  }

  return totemManager.getStatus();
});

ipcMain.handle("totem:register-themes", (event, options) => {
  if (!isAuthorizedTotemEvent(event)) {
    return { ok: false, message: "Solicitud no autorizada" };
  }

  const valid =
    Array.isArray(options) &&
    options.length > 0 &&
    options.length <= 32 &&
    options.every(
      (option) =>
        option &&
        typeof option.value === "string" &&
        /^[a-zA-Z0-9_-]{1,64}$/.test(option.value) &&
        typeof option.label === "string" &&
        option.label.trim().length > 0 &&
        option.label.length <= 80,
    ) &&
    new Set(options.map((option) => option.value)).size === options.length;

  if (!valid) {
    return { ok: false, message: "Listado de temas inválido" };
  }

  totemThemeOptions = options.map(({ value, label }) => ({
    value,
    label: label.trim(),
  }));

  refreshMainMenu();

  return { ok: true };
});

ipcMain.handle("totem:get-catalog", async (event) => {
  if (!isTotemMode || !isAuthorizedTotemEvent(event)) {
    return {
      ok: false,
      message: "Solicitud no autorizada",
    };
  }

  return totemManager.getCatalog();
});

ipcMain.handle("totem:activate", async (event, payload) => {
  if (!isAuthorizedTotemEvent(event)) {
    return {
      ok: false,
      message: "Solicitud no autorizada",
    };
  }

  return totemManager.activate(payload || {});
});

ipcMain.handle("totem:authorize-exit", async (event, payload) => {
  if (!isTotemMode || !isAuthorizedTotemEvent(event)) {
    return { ok: false, message: "Solicitud no autorizada" };
  }

  const result = await totemManager.authorizeExit(payload?.password);

  if (result.ok === true) {
    setImmediate(quitAuthorizedTotem);
  }

  return result;
});

for (const [channel, method] of Object.entries({
  "find-customer": "findCustomer", "create-checkout": "createCheckout",
  "recover-checkout": "recoverCheckout", "get-checkout": "getCheckout",
  "cancel-checkout": "cancelCheckout", "finish-checkout": "finishCheckout",
})) {
  ipcMain.handle(`totem:${channel}`, (event, payload) => {
    if (!isTotemMode || !isAuthorizedTotemEvent(event)) return { ok: false, message: "Solicitud no autorizada" };
    return totemManager[method](payload);
  });
}

let printingTotemReceipt = false;
ipcMain.handle("totem:print-receipt", async (event, id) => {
  if (!isTotemMode || !isAuthorizedTotemEvent(event) || printingTotemReceipt) return { printed: false, message: "Impresión no disponible" };
  printingTotemReceipt = true;
  try {
    const result = await totemManager.getCheckout(id);
    if (!result.ok || result.checkout?.status !== "COMPLETED" || result.checkout.order?.isPaid !== true) return { printed: false, message: result.message || "El pago todavía no está confirmado" };
    const { buildOrderTicketPrinterHtml } = require("./dist-main/totem-ticket.cjs");
    const html = buildOrderTicketPrinterHtml(result.checkout.order, { variant: "local-order", hideEmptyClientContact: true });
    return await printerManager.printHtml({ type: "ticket", html });
  } catch {
    return { printed: false, message: "El pedido está confirmado, pero no se pudo imprimir. Solicitá el ticket al local" };
  } finally { printingTotemReceipt = false; }
});

const createWindow = async () => {
  const loginWindowSize = getCenteredWindowSize(LOGIN_WINDOW_SIZE);

  mainWindow = new BrowserWindow({
    width: loginWindowSize.width,
    height: loginWindowSize.height,
    minWidth: 480,
    minHeight: 620,
    center: true,
    show: false,
    title: isTotemMode ? 'LoboTech Tótem' : 'LoboTech Admin Panel',
    kiosk: isTotemMode && !isDevelopment,
    autoHideMenuBar: isTotemMode && !isDevelopment,
    backgroundColor: '#0f1115',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      partition: isTotemMode ? "persist:lobotech-totem" : undefined,
      additionalArguments: isTotemMode ? ["--lobotech-totem"] : [],
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  const createdWindow = mainWindow;

  createdWindow.webContents.on("before-input-event", (event, input) => {
    const exitShortcut =
      input.type === "keyDown" &&
      input.control &&
      input.alt &&
      input.shift &&
      String(input.key).toLowerCase() === "q";

    if (isTotemMode && !isDevelopment && exitShortcut) {
      event.preventDefault();
      void requestTotemExit();
    }
  });

  createdWindow.on("close", (event) => {
    if (isTotemMode && !isDevelopment && !authorizedTotemQuit) {
      event.preventDefault();
      void requestTotemExit();
    }
  });

  mainWindow.webContents.on("preload-error",
    (_event, preloadPath, error) => {
      console.error("[Electron] Error en preload:", preloadPath, error);
    }
  );

  mainWindow.webContents.on("console-message",
    (details) => {
      if (details?.level === "error") {
        console.error("[Renderer]", details.message, details.sourceId, details.lineNumber);
      }
    }
  );

  mainWindow.webContents.on("did-fail-load",
    (_event, errorCode, errorDescription, validatedURL, isMainFrame) => {
      if (isMainFrame) {
        console.error("[Electron] No se pudo cargar la página:", errorCode, errorDescription, validatedURL);
      }
    }
  );

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isTotemMode) {
      return { action: "deny" };
    }

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

  mainWindow.webContents.on('will-navigate', (event) => {
    const allowedBase = isDevelopment
      ? devServerUrl
      : pathToFileURL(path.join(__dirname, 'dist', 'index.html')).href;

    if (!event.url.startsWith(allowedBase)) event.preventDefault();
  });

  applyWindowMode('login');
  mainWindow.once('ready-to-show', () => {
    if (createdWindow.isDestroyed()) return;
    createdWindow.show();
    createdWindow.focus();

    if (isDevelopment && process.argv.includes("--debug-renderer")) {
      createdWindow.webContents.openDevTools({ mode: "detach" });
    }
  });

  if (devServerUrl) {
    await mainWindow.loadURL(devServerUrl);
  } else {
    await mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  refreshMainMenu();

  if (!isTotemMode) {
    setupAutoUpdater(mainWindow);
  }
};

app.whenReady().then(async () => {
  const rendererSessions = [
    session.defaultSession,
    session.fromPartition("persist:lobotech-totem"),
  ];

  for (const rendererSession of rendererSessions) {
    rendererSession.setPermissionRequestHandler(
      (_webContents, _permission, callback) => callback(false),
    );

    rendererSession.setPermissionCheckHandler(() => false);

    if (!isDevelopment) {
      rendererSession.webRequest.onHeadersReceived(
        (details, callback) => {
          const responseHeaders = { ...details.responseHeaders };

          if (details.url.startsWith("file:")) {
            responseHeaders["Content-Security-Policy"] = [
              "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src https://foodorderapp-api-production.up.railway.app; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
            ];
          }

          callback({ responseHeaders });
        },
      );
    }
  }

  await createWindow();
});

app.on("before-quit", (event) => {
  if (isTotemMode && !isDevelopment && !authorizedTotemQuit) {
    event.preventDefault();
    void requestTotemExit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
