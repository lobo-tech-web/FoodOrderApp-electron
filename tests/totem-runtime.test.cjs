const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const { buildSync } = require("esbuild");

const root = path.resolve(__dirname, "..");

const loadRendererModule = (file) => {
  const result = buildSync({
    entryPoints: [path.join(root, file)],
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
    packages: "external",
    alias: { "@": path.join(root, "vendor", "client-src") },
    jsx: "automatic",
  });
  const module = { exports: {} };
  vm.runInNewContext(result.outputFiles[0].text, {
    module,
    exports: module.exports,
    require,
  });
  return module.exports;
};

const loadMain = async ({ production = false, totem = false } = {}) => {
  const windows = [];
  const handlers = new Map();
  const errors = [];
  let failNextLoad = false;
  let startup;
  let startTotem;
  let quitCalls = 0;
  const sent = [];

  class FakeWindow extends EventEmitter {
    constructor(options) {
      super();
      this.options = options;
      this.destroyed = false;
      this.webContents = new EventEmitter();
      this.webContents.id = windows.length + 1;
      this.webContents.mainFrame = {};
      this.webContents.setWindowOpenHandler = () => {};
      this.webContents.send = (...args) => sent.push(args);
      windows.push(this);
    }
    isDestroyed() {
      return this.destroyed;
    }
    destroy() {
      this.destroyed = true;
    }
    isMaximized() {
      return false;
    }
    unmaximize() {}
    maximize() {}
    setMinimumSize() {}
    setResizable() {}
    setSize() {}
    setKiosk() {}
    setMenuBarVisibility() {}
    center() {}
    show() {}
    focus() {}
    async loadURL() {
      if (failNextLoad) {
        failNextLoad = false;
        throw new Error("Renderer unavailable");
      }
      this.emit("ready-to-show");
    }
    async loadFile() { this.emit("ready-to-show"); }
  }

  const rendererSession = {
    setPermissionRequestHandler() {},
    setPermissionCheckHandler() {},
    webRequest: { onHeadersReceived() {} },
  };
  const app = new EventEmitter();
  app.setAppUserModelId = () => {};
  app.whenReady = () => ({
    then(callback) {
      startup = Promise.resolve().then(callback);
    },
  });
  app.getPath = () => root;
  app.quit = () => { quitCalls++; };

  const electron = {
    app,
    BrowserWindow: FakeWindow,
    clipboard: {},
    ipcMain: {
      on() {},
      handle: (name, callback) => handlers.set(name, callback),
    },
    Menu: {
      setApplicationMenu() {},
      buildFromTemplate: (template) => template,
    },
    dialog: {
      showErrorBox: (title, message) => errors.push({ title, message }),
    },
    safeStorage: {},
    screen: {
      getPrimaryDisplay: () => ({ workAreaSize: { width: 1366, height: 768 } }),
    },
    session: {
      defaultSession: rendererSession,
      fromPartition: () => rendererSession,
    },
    shell: {},
  };
  const mockModules = {
    electron,
    "./menu.js": {
      setMainMenu: (_window, _dev, _updates, _offline, start) => {
        startTotem = start;
      },
    },
    "./updater.js": { setupAutoUpdater() {} },
    "./printer-manager.js": { createPrinterManager: () => ({}) },
    "./totem-manager.js": { createTotemManager: () => ({ hasCredential: () => true, authorizeExit: async (password) => ({ ok: password === "admin-secret" }) }) },
    "./totem-appearance.js": require("../totem-appearance.js"),
  };
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, "main.js"), "utf8"), {
    require: (name) =>
      Object.hasOwn(mockModules, name) ? mockModules[name] : require(name),
    module,
    __dirname: root,
    process: {
      argv: ["electron", ".", ...(totem ? ["--totem"] : [])],
      env: production ? {} : { ELECTRON_RENDERER_URL: "http://localhost:5173" },
      platform: "win32",
    },
    console: { error: (...args) => errors.push(args) },
    setImmediate,
  });
  await startup;
  const eventFor = (window) => ({
    sender: window.webContents,
    senderFrame: window.webContents.mainFrame,
  });
  return {
    windows,
    handlers,
    errors,
    sent,
    quitCalls: () => quitCalls,
    startTotem: () => startTotem(),
    eventFor,
    failLoad: () => {
      failNextLoad = true;
    },
  };
};

test("entering totem in development replaces the admin window and isolates its IPC", async () => {
  const runtime = await loadMain();
  const adminWindow = runtime.windows[0];
  await runtime.startTotem();
  const totemWindow = runtime.windows[1];
  assert.equal(adminWindow.destroyed, true);
  assert.equal(
    totemWindow.options.webPreferences.partition,
    "persist:lobotech-totem",
  );
  assert.deepEqual(
    Array.from(totemWindow.options.webPreferences.additionalArguments),
    ["--lobotech-totem"],
  );
  assert.equal(
    runtime.handlers.get("totem:get-runtime")(runtime.eventFor(totemWindow))
      .mode,
    "totem",
  );
  assert.equal(
    runtime.handlers.get("totem:get-runtime")(runtime.eventFor(adminWindow)).ok,
    false,
  );
  assert.equal(
    runtime.handlers.get("window:set-mode")(
      runtime.eventFor(totemWindow),
      "app",
    ).reason,
    "unauthorized",
  );
  assert.equal(runtime.errors.length, 0);
  for (const channel of [
    "find-customer",
    "create-checkout",
    "recover-checkout",
    "get-checkout",
    "cancel-checkout",
    "finish-checkout",
  ]) {
    assert.equal(
      runtime.handlers.get(`totem:${channel}`)(runtime.eventFor(adminWindow))
        .ok,
      false,
    );
  }
});

test("production exit button requests the existing password flow and cannot quit without authorization", async () => {
  const runtime = await loadMain({ production: true, totem: true });
  const window = runtime.windows[0];
  const event = runtime.eventFor(window);
  assert.equal(window.options.kiosk, true);
  assert.equal((await runtime.handlers.get("totem:request-exit")({ ...event, senderFrame: {} })).ok, false);
  assert.equal((await runtime.handlers.get("totem:request-exit")(event)).ok, true);
  assert.ok(runtime.sent.some(([channel]) => channel === "totem:request-exit"));
  assert.equal(runtime.quitCalls(), 0);
  assert.equal((await runtime.handlers.get("totem:authorize-exit")(event, { password: "wrong" })).ok, false);
  assert.equal(runtime.quitCalls(), 0);
  assert.equal((await runtime.handlers.get("totem:authorize-exit")(event, { password: "admin-secret" })).ok, true);
  await new Promise(setImmediate);
  assert.equal(runtime.quitCalls(), 1);
});

test("a failed totem load keeps the original admin window usable and allows retry", async () => {
  const runtime = await loadMain();
  runtime.failLoad();
  await runtime.startTotem();
  assert.equal(runtime.windows[0].destroyed, false);
  assert.equal(runtime.windows[1].destroyed, true);
  assert.equal(
    runtime.handlers.get("totem:get-runtime")(
      runtime.eventFor(runtime.windows[0]),
    ).mode,
    "admin",
  );
  assert.equal(runtime.errors[0].message, "Renderer unavailable");
  await runtime.startTotem();
  assert.equal(runtime.windows[0].destroyed, true);
  assert.equal(
    runtime.handlers.get("totem:get-runtime")(
      runtime.eventFor(runtime.windows[2]),
    ).mode,
    "totem",
  );
});

test("console and navigation handlers accept the Electron event object", async () => {
  const runtime = await loadMain();
  const contents = runtime.windows[0].webContents;
  assert.equal(contents.listeners("console-message")[0].length, 1);
  contents.emit("console-message", {
    level: "error",
    message: "Example error",
    sourceId: "test.jsx",
    lineNumber: 12,
  });
  assert.deepEqual(runtime.errors[0], [
    "[Renderer]",
    "Example error",
    "test.jsx",
    12,
  ]);
  let prevented = false;
  contents.emit("will-navigate", {
    url: "https://example.com",
    preventDefault: () => {
      prevented = true;
    },
  });
  assert.equal(prevented, true);
});

test("totem themes retain existing font aliases, colors, responsive values and literal fonts", () => {
  const { createTotemTheme } = loadRendererModule(
    "src/providers/totemTheme.js",
  );
  const { lobotechAppTheme, lobotechAppThemeLight } = loadRendererModule(
    "vendor/client-src/theme/main-theme.js",
  );
  for (const appTheme of [lobotechAppTheme, lobotechAppThemeLight]) {
    const theme = createTotemTheme(appTheme);
    const fonts = appTheme.typography.fontFamily;
    for (const key of ["primary", "secondary", "terciary"]) {
      assert.equal(
        theme.unstable_sx({ fontFamily: `fontFamily.${key}` }).fontFamily,
        fonts[key],
      );
    }
    assert.equal(theme.typography.fontFamily, fonts.secondary);
    assert.equal(theme.typography.h4.fontFamily, fonts.primary);
    assert.equal(theme.typography.body1.fontFamily, fonts.secondary);
    assert.equal(
      theme.unstable_sx({ color: "primary.main" }).color,
      appTheme.palette.primary.main,
    );
    assert.equal(
      theme.unstable_sx({ bgcolor: "background.main" }).backgroundColor,
      appTheme.palette.background.main,
    );
    assert.equal(
      theme.unstable_sx({ fontFamily: "Arial, sans-serif" }).fontFamily,
      "Arial, sans-serif",
    );
    const responsive = theme.unstable_sx({
      fontFamily: { xs: "fontFamily.primary", md: "fontFamily.secondary" },
    });
    assert.equal(
      responsive["@media (min-width:0px)"].fontFamily,
      fonts.primary,
    );
    assert.equal(
      responsive["@media (min-width:900px)"].fontFamily,
      fonts.secondary,
    );
    assert.equal(appTheme.typography.fontFamily, fonts);
  }
});

test("the totem provider renders with the existing font tokens without React hook warnings", () => {
  const React = require("react");
  const { renderToString } = require("react-dom/server");
  const { Typography } = require("@mui/material");
  const { TotemProviders } = loadRendererModule(
    "src/providers/TotemProviders.jsx",
  );
  const errors = [];
  const originalError = console.error;
  console.error = (...args) => errors.push(args);
  try {
    const html = renderToString(
      React.createElement(
        TotemProviders,
        { initialTheme: "dark" },
        React.createElement(
          Typography,
          { sx: { fontFamily: "fontFamily.primary" } },
          "Test",
        ),
      ),
    );
    assert.ok(html.includes("font-family:main-app-oswald"));
    assert.ok(!html.includes("[object Object]"));
    assert.equal(errors.length, 0);
  } finally {
    console.error = originalError;
  }
});
