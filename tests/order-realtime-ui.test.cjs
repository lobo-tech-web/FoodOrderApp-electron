const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createServer: createHttpServer } = require("node:http");
const { createRequire } = require("node:module");
const path = require("node:path");

test("real order notifications refresh idle panels and protect selections, inputs and drafts", {
  skip: !process.env.PLAYWRIGHT_MODULE_PATH, timeout: 120000,
}, async t => {
  const backendRequire = createRequire(path.resolve(__dirname, "../../FoodOrderApp-api/package.json"));
  const { attachOrderRealtime } = backendRequire("./src/realtime/orderRealtime.js");
  const jwt = backendRequire("jsonwebtoken");
  const { createServer } = await import("vite");
  const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH);
  const hooks = new Map();
  const user = { id: "admin-test", role: "admin", status: true, businessName: "Local test",
    enabledOrderTypes: ["ESPERA EN LOCAL"], paymentMethods: ["EFECTIVO"] };
  const secret = "realtime-ui-test-never-a-production-key";
  const http = createHttpServer();
  const realtime = attachOrderRealtime({ httpServer: http, jwtSecret: secret,
    Orders: { addHook: (name, _label, fn) => hooks.set(name, fn), removeHook: name => hooks.delete(name) },
    Users: { findOne: async () => ({ id: user.id }) },
  });
  t.after(() => realtime.close());
  await new Promise(resolve => http.listen(0, "127.0.0.1", resolve));
  const socketUrl = `http://127.0.0.1:${http.address().port}`;
  const server = await createServer({ server: { host: "127.0.0.1", port: 0 },
    define: { "import.meta.env.VITE_ORDERS_SOCKET_URL": JSON.stringify(socketUrl) },
  });
  await server.listen();
  t.after(() => server.close());
  const browser = await chromium.launch({ headless: true,
    ...(process.env.PLAYWRIGHT_BROWSER_PATH && { executablePath: process.env.PLAYWRIGHT_BROWSER_PATH }),
  });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  const makeOrder = (id, clientName) => ({
    id, dailyOrderNumber: id, clientName, restaurantId: user.id, clientEmail: "test@example.com",
    orderType: "ESPERA EN LOCAL", status: "EN PREPARACIÓN", totalAmount: 1000,
    totalRewardPoints: 0, totalRedeemPoints: 0, isPaid: false, paymentMethod: "EFECTIVO", cartItems: [],
    orderDate: { day: "26", month: "10", year: "2026", hour: "12", minute: "00" },
  });
  const orders = [makeOrder(1, "Inicial")];
  let loads = 0, holdNext = false, release;
  await page.route("**/*", async route => {
    const request = route.request();
    if (!["fetch", "xhr"].includes(request.resourceType())) return route.continue();
    let body = [];
    if (request.url().includes(server.config.env.VITE_API_ORDERS_MAIN_ROUTER)) {
      loads++;
      body = JSON.parse(JSON.stringify(orders));
      if (holdNext) {
        holdNext = false;
        await new Promise(resolve => { release = resolve; });
      }
    }
    await route.fulfill({ contentType: "application/json", body: JSON.stringify(body) });
  });
  await page.addInitScript(({ user, token }) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    window.secureStorage = localStorage;
    window.electronAPI = {};
    window.totemAPI = { registerThemes: async () => ({ ok: true }), getRuntime: async () => ({ ok: true, mode: "admin" }) };
  }, { user, token: jwt.sign(user, secret, { expiresIn: "1h" }) });
  await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/#/control-panel`);
  const panel = page.locator("[data-order-panel]");
  const indicator = panel.getByRole("status");
  await panel.getByText("INICIAL", { exact: true }).waitFor();
  await indicator.getByText("En tiempo real", { exact: true }).waitFor();
  const waitRefresh = () => page.waitForFunction(() => !document.querySelector('button[aria-label="Actualizar pedidos"]').disabled);
  await waitRefresh();
  await indicator.getByText("Los pedidos se actualizan automáticamente", { exact: true }).waitFor();
  assert.equal(await indicator.getByRole("button").count(), 0);
  await waitRefresh();
  const navbar = panel.locator(".MuiAppBar-root").first();
  assert.equal(await navbar.getByRole("status").count(), 1);
  assert.equal(await panel.getByRole("status").count(), 1);
  const statusBounds = await indicator.boundingBox();
  for (const name of ["Actualizar pedidos", "Nuevo Pedido", "Modificar Pedidos"]) {
    const bounds = await navbar.getByRole("button", { name, exact: true }).boundingBox();
    assert.ok(statusBounds.y >= bounds.y + bounds.height);
  }
  const connectionBounds = await indicator.getByText("En tiempo real", { exact: true }).boundingBox();
  const refreshBounds = await indicator.getByText(/^Última actualización:/).boundingBox();
  assert.ok(Math.abs(connectionBounds.y + connectionBounds.height / 2 - refreshBounds.y - refreshBounds.height / 2) < 2);
  const beforeEvent = loads;
  orders.push(makeOrder(2, "Pedido web"));
  hooks.get("afterCreate")(orders[1], {});
  await panel.getByText("PEDIDO WEB", { exact: true }).waitFor();
  await waitRefresh();
  assert.ok(loads > beforeEvent);

  const selection = panel.locator('tbody input[type="checkbox"]').first();
  await selection.check();
  const beforeSelectionEvent = loads;
  orders.push(makeOrder(3, "Seleccion protegida"));
  hooks.get("afterCreate")(orders[2], {});
  await indicator.getByText("Hay cambios de pedidos disponibles", { exact: true }).waitFor();
  assert.equal(loads, beforeSelectionEvent);
  assert.equal(await panel.getByText("SELECCION PROTEGIDA", { exact: true }).count(), 0);
  await selection.uncheck();
  await panel.getByText("SELECCION PROTEGIDA", { exact: true }).waitFor();
  await waitRefresh();

  const search = panel.getByRole("textbox", { name: "Nombre o teléfono" });
  await search.fill("Borrador busqueda");
  const beforeInputEvent = loads;
  orders.push(makeOrder(4, "Entrada protegida"));
  hooks.get("afterCreate")(orders[3], {});
  await indicator.getByText("Hay cambios de pedidos disponibles", { exact: true }).waitFor();
  assert.equal(loads, beforeInputEvent);
  assert.equal(await search.inputValue(), "Borrador busqueda");
  await panel.getByRole("button", { name: "Limpiar búsqueda", exact: true }).click();
  await panel.getByText("ENTRADA PROTEGIDA", { exact: true }).waitFor();
  await waitRefresh();
  await panel.getByRole("button", { name: "Nuevo Pedido", exact: true }).click();
  await page.getByRole("dialog").last().getByRole("button", { name: "Cancelar", exact: true }).click();
  const dialog = page.getByRole("dialog").filter({ has: page.getByText("CREAR NUEVO PEDIDO", { exact: true }) });
  const name = dialog.getByPlaceholder("Ingresa el nombre del cliente", { exact: true });
  await name.fill("Borrador intacto");
  orders.push(makeOrder(5, "Pedido totem"));
  const beforeDraftEvent = loads;
  hooks.get("afterCreate")(orders[4], {});
  await panel.locator('[aria-label="Cargar cambios de pedidos"]').waitFor({ state: "attached" });
  assert.equal(loads, beforeDraftEvent);
  assert.equal(await name.inputValue(), "Borrador intacto");
  assert.equal(await panel.locator('button[aria-label="Cargar cambios de pedidos"]').isDisabled(), true);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Descartar cambios", exact: true }).click();
  await dialog.waitFor({ state: "hidden" });
  await waitRefresh();
  await panel.getByText("PEDIDO TOTEM", { exact: true }).waitFor();
  await waitRefresh();

  // The HTTP response is a snapshot from before a second event arrives.
  const beforeRace = loads;
  holdNext = true;
  await panel.getByRole("button", { name: "Actualizar pedidos", exact: true }).click();
  while (!release) await new Promise(resolve => setTimeout(resolve, 10));
  orders[0].clientName = "Inicial actualizada";
  hooks.get("afterUpdate")(orders[0], {});
  await indicator.getByText("Hay cambios de pedidos disponibles", { exact: true }).waitFor();
  release();
  await waitRefresh();
  await panel.getByText("INICIAL ACTUALIZADA", { exact: true }).waitFor();
  await waitRefresh();
  assert.ok(loads >= beforeRace + 2);

  // A transport disconnection/reconnection prompts catch-up even without a replayed event.
  orders.push(makeOrder(6, "Durante desconexion"));
  for (const socket of realtime.io.sockets.sockets.values()) socket.conn.close();
  await indicator.getByText("En tiempo real", { exact: true }).waitFor();
  await panel.getByText("DURANTE DESCONEXION", { exact: true }).waitFor();
  await waitRefresh();
  await page.getByRole("textbox", { name: "Fecha de pedidos" }).fill("26-10-2026");
  await page.getByRole("button", { name: "Filtrar fecha", exact: true }).click();
  await waitRefresh();
  await page.evaluate(async order => {
    const storage = await import("/vendor/client-src/utils/offlineStorage.js");
    storage.setForcedOfflineMode(true);
    storage.createOfflineOrder(order);
  }, makeOrder(null, "Offline local"));
  await indicator.getByText("Modo offline", { exact: true }).waitFor();
  await panel.getByText("OFFLINE LOCAL", { exact: true }).waitFor();
  for (const width of [1440, 1024, 600]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.equal(await indicator.evaluate(el => el.scrollWidth <= el.clientWidth + 1), true);
    await page.screenshot({ path: `test-artifacts/order-realtime-navbar-${width}.png`, fullPage: true });
  }
  assert.deepEqual(errors, []);
});
