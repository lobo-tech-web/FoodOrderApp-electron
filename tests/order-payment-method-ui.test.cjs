const assert = require("node:assert/strict");
const { test } = require("node:test");

test("quick payment editing restricts methods, protects unpaid orders and preserves failed saves", {
  skip: !process.env.PLAYWRIGHT_MODULE_PATH,
  timeout: 120000,
}, async (t) => {
  const { createServer } = await import("vite");
  const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH);
  const server = await createServer({ server: { host: "127.0.0.1", port: 0 } });
  await server.listen();
  t.after(() => server.close());
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_BROWSER_PATH && { executablePath: process.env.PLAYWRIGHT_BROWSER_PATH }),
  });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const user = {
    id: "admin-test", role: "admin", status: true, businessName: "Local test",
    paymentMethods: ["EFECTIVO", "TRANSFERENCIA", "COMBINADO"],
    enabledOrderTypes: ["DELIVERY", "ESPERA EN LOCAL"],
  };
  const orders = [1, 2, 3].map((id) => ({
    id, dailyOrderNumber: id, clientName: "Cliente " + id,
    clientEmail: "cliente@example.com", contactPhone: "1122334455",
    restaurantId: user.id, orderType: "DELIVERY",
    status: id === 3 ? "CANCELADO" : "EN PREPARACIÓN",
    totalAmount: 1000, totalRewardPoints: 0, totalRedeemPoints: 0,
    paymentMethod: "EFECTIVO", isPaid: id === 2, cartItems: [],
    orderDate: { day: "15", month: "11", year: "2026", hour: "12", minute: "00" },
  }));
  const category = { id: "cat", name: "Comidas", position: 0 };
  const product = {
    id: "product", name: "Producto de prueba", price: 1000, status: true,
    categoryId: category.id, category, customOptions: [], productCustomOptions: [],
    rewardPoints: 0, redeemPoints: 0, allowComment: false,
  };
  const updates = [];
  let failUpdate = true;
  let holdSave = null;
  let resolveSaveStarted;
  const saveStarted = new Promise((resolve) => { resolveSaveStarted = resolve; });
  let created = null;
  const env = server.config.env;
  const matches = (url, key) => Boolean(env[key]) && url.includes(env[key]);
  await page.route("**/*", async (route) => {
    const request = route.request();
    if (!["xhr", "fetch"].includes(request.resourceType())) return route.continue();
    const url = new URL(request.url());
    let body = [], status = 200;
    if (request.method() === "PUT" && matches(request.url(), "VITE_API_ORDERS_PUT_ROUTER")) {
      const changes = request.postDataJSON().updateData;
      updates.push(changes);
      if (failUpdate) {
        status = 409;
        body = { message: "Error de prueba al cambiar el método" };
      } else {
        await new Promise((resolve) => { holdSave = resolve; resolveSaveStarted(); });
        const order = orders.find((item) => String(item.id) === url.searchParams.get("orderId"));
        Object.assign(order, changes);
        body = { order };
      }
    } else if (request.method() === "POST" && matches(request.url(), "VITE_API_ORDERS_POST_ROUTER")) {
      created = request.postDataJSON().orderData;
      status = 400;
      body = { message: "Creación de prueba interceptada" };
    } else if (matches(request.url(), "VITE_API_ORDERS_MAIN_ROUTER")) {
      body = orders;
    } else if (matches(request.url(), "VITE_API_CASH_REGISTER_GET_OPEN_SESSIONS")) {
      body = { id: "session", cashRegisterId: "cash", status: "OPEN" };
    } else if (matches(request.url(), "VITE_API_CASH_REGISTER_MAIN_ROUTER")) {
      body = [{ id: "cash", name: "Caja test", status: true, isDefault: true }];
    } else if (matches(request.url(), "VITE_API_PRODUCTS_MAIN_ROUTER")) {
      body = [product];
    } else if (matches(request.url(), "VITE_API_CATEGORY_MAIN_ROUTER")) {
      body = [category];
    }
    await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
  });
  await page.addInitScript((user) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", `e30.${btoa(JSON.stringify({ ...user, exp: Date.now() / 1000 + 864000 }))}.signature`);
    window.secureStorage = localStorage;
    window.electronAPI = {};
    window.totemAPI = { registerThemes: async () => ({ ok: true }), getRuntime: async () => ({ ok: true, mode: "admin" }) };
  }, user);
  await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/#/control-panel`);
  const panel = page.locator("[data-order-panel]");
  const edit = panel.getByRole("button", { name: "Cambiar método de pago del pedido 1", exact: true });
  await edit.waitFor();
  assert.equal(await panel.getByRole("button", { name: /Cambiar método de pago del pedido/ }).count(), 1);
  await edit.click();
  const popover = page.getByRole("dialog", { name: "Cambiar método de pago", exact: true });
  await popover.waitFor();
  assert.equal(await popover.getByRole("button").count(), 3);
  assert.equal(await popover.getByText("TARJETA", { exact: true }).count(), 0);
  assert.equal(await panel.getByRole("button", { name: "Actualizar pedidos", exact: true, includeHidden: true }).isDisabled(), true);
  await popover.getByRole("button", { name: "TRANSFERENCIA", exact: true }).click();
  await page.getByText("Error de prueba al cambiar el método", { exact: true }).waitFor();
  assert.equal(await popover.isVisible(), true);
  assert.equal(orders[0].paymentMethod, "EFECTIVO");
  failUpdate = false;
  await popover.getByRole("button", { name: "COMBINADO", exact: true }).click();
  await page.waitForFunction(() => [...document.querySelectorAll('[role="dialog"] button')].every((button) => button.disabled));
  await saveStarted;
  await page.keyboard.press("Escape");
  assert.equal(await popover.isVisible(), true);
  holdSave();
  await popover.waitFor({ state: "hidden" });
  const row = edit.locator("xpath=ancestor::tr");
  await row.getByText("COMBINADO", { exact: true }).waitFor();
  assert.equal(orders[0].isPaid, false);
  assert.equal(updates.at(-1).isPaid, undefined);
  assert.equal(updates.length, 2);

  // The creation payload and total must exclude the removed service fee.
  await panel.getByRole("button", { name: "Nuevo Pedido", exact: true }).click();
  const picker = page.getByRole("dialog").filter({ has: page.getByText("SELECCIONAR PRODUCTOS", { exact: true }) });
  await picker.waitFor();
  await picker.getByText("PRODUCTO DE PRUEBA", { exact: true }).first().click();
  await picker.getByRole("button", { name: "Continuar", exact: true }).last().click();
  const modal = page.getByRole("dialog").filter({ has: page.getByRole("button", { name: "CREAR PEDIDO", exact: true }) });
  await modal.locator('[name="clientEmail"]').fill("cliente@example.com");
  await modal.getByRole("button", { name: "DELIVERY", exact: true }).click();
  await modal.locator('[name="deliverycost"]').fill("500");
  await modal.getByRole("button", { name: "PORCENTAJE", exact: true }).click();
  await modal.locator('[name="discount"]').fill("10");
  await modal.getByRole("button", { name: "CREAR PEDIDO", exact: true }).click();
  await page.getByText("Creación de prueba interceptada", { exact: true }).waitFor();
  assert.equal(created.servicetax, undefined);
  assert.equal(Number(created.totalAmount), 1400);
  assert.equal(created.isPaid, false);
  assert.deepEqual(errors, []);
});
