const assert = require("node:assert/strict");
const { test } = require("node:test");

test("bulk saves clear selection only on success and local settings retain save feedback", {
  skip: !process.env.PLAYWRIGHT_MODULE_PATH,
  timeout: 120000,
}, async (t) => {
  const { createServer } = await import("vite");
  const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH);
  const server = await createServer({ server: { host: "127.0.0.1", port: 0 } });
  await server.listen();
  t.after(() => server.close());
  const browser = await chromium.launch({ headless: true,
    ...(process.env.PLAYWRIGHT_BROWSER_PATH && { executablePath: process.env.PLAYWRIGHT_BROWSER_PATH }),
  });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  const user = {
    id: "admin-test", role: "admin", status: true, businessName: "Local test",
    paymentMethods: ["EFECTIVO"], enabledOrderTypes: ["ESPERA EN LOCAL"],
  };
  const orders = [1, 2].map(id => ({
    id, dailyOrderNumber: id, clientName: `Cliente ${id}`, clientEmail: "test@example.com",
    contactPhone: "1122334455", restaurantId: user.id, orderType: "ESPERA EN LOCAL",
    status: "EN PREPARACIÓN", totalAmount: 1000, totalRewardPoints: 0, totalRedeemPoints: 0,
    paymentMethod: "EFECTIVO", isPaid: false, cartItems: [],
    orderDate: { day: "26", month: "10", year: "2026", hour: "12", minute: "00" },
  }));
  let bulkRequests = 0;
  let failBulk = true;
  let failLocal = false;
  let initialProductLoads = 0;
  await page.route("**/*", async route => {
    const request = route.request();
    if (!["fetch", "xhr"].includes(request.resourceType())) return route.continue();
    const url = request.url();
    const env = server.config.env;
    let body = [], status = 200;
    if (request.method() === "PUT" && url.includes(env.VITE_API_ORDERS_PUT_ARRAY_ROUTER)) {
      bulkRequests++;
      if (failBulk) {
        status = 409;
        body = { message: "Error de prueba al guardar pedidos" };
      } else {
        const changes = request.postDataJSON().ordersData;
        for (const order of orders) {
          if (changes.orderList.some(item => item.id === order.id)) order.status = changes.status;
        }
        body = { ok: true };
      }
    } else if (request.method() === "PUT" && url.includes(env.VITE_API_USERS_PUT_ROUTER)) {
      if (failLocal) {
        status = 409;
        body = { message: "Error de prueba al guardar el local" };
      } else {
        Object.assign(user, request.postDataJSON().userData);
        body = user;
      }
    } else if (url.includes(env.VITE_API_ORDERS_MAIN_ROUTER)) {
      body = orders;
    } else if (url.includes(env.VITE_API_PRODUCTS_MAIN_ROUTER)) {
      initialProductLoads++;
    }
    await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
  });
  await page.addInitScript(user => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", `e30.${btoa(JSON.stringify({ ...user, exp: Date.now() / 1000 + 864000 }))}.signature`);
    window.secureStorage = localStorage;
    window.electronAPI = {};
    window.totemAPI = {
      registerThemes: async () => ({ ok: true }),
      getRuntime: async () => ({ ok: true, mode: "admin" }),
    };
  }, user);
  await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/#/control-panel`);
  const panel = page.locator("[data-order-panel]");
  await panel.getByText("CLIENTE 1", { exact: true }).waitFor();
  const checkboxes = panel.locator('tbody input[type="checkbox"]');
  await checkboxes.nth(0).check();
  await checkboxes.nth(1).check();
  const modify = panel.getByRole("button", { name: "Modificar Pedidos", exact: true });
  await modify.click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Cancelar", exact: true }).click();
  assert.equal(bulkRequests, 0);
  assert.equal(await checkboxes.nth(0).isChecked(), true);
  assert.equal(await checkboxes.nth(1).isChecked(), true);
  await modify.click();
  await dialog.getByRole("button", { name: /^FINALIZADO/ }).click();
  await dialog.getByRole("button", { name: "Guardar Cambios", exact: true }).click();
  await page.getByText("Error de prueba al guardar pedidos", { exact: true }).waitFor();
  assert.equal(await dialog.isVisible(), true);
  assert.equal(await checkboxes.nth(0).isChecked(), true);
  failBulk = false;
  await dialog.getByRole("button", { name: "Guardar Cambios", exact: true }).click();
  await dialog.waitFor({ state: "hidden" });
  assert.equal(await checkboxes.nth(0).isChecked(), false);
  assert.equal(await checkboxes.nth(1).isChecked(), false);
  assert.equal(await modify.isDisabled(), true);
  await panel.getByText("FINALIZADO", { exact: true }).first().waitFor();
  await checkboxes.nth(1).check();
  await modify.click();
  await dialog.getByText("1 PEDIDO", { exact: true }).waitFor();
  await dialog.getByRole("button", { name: "Cancelar", exact: true }).click();

  await page.getByRole("button", { name: "Mi Negocio", exact: true }).click();
  const localField = page.getByRole("textbox", { name: "Alias transferencia", exact: true });
  await localField.fill("local.actualizado");
  const loadsBeforeSave = initialProductLoads;
  await page.getByRole("button", { name: "Guardar cambios", exact: true }).click();
  await page.getByText("Datos del local actualizados correctamente", { exact: true }).waitFor();
  assert.equal(await localField.inputValue(), "local.actualizado");
  assert.equal(initialProductLoads, loadsBeforeSave);
  failLocal = true;
  await localField.fill("borrador.conservado");
  await page.getByRole("button", { name: "Guardar cambios", exact: true }).click();
  await page.getByText("Error de prueba al guardar el local", { exact: true }).waitFor();
  assert.equal(await localField.inputValue(), "borrador.conservado");
  assert.deepEqual(errors, []);
});
