const assert = require("node:assert/strict");
const { test } = require("node:test");

test("totem management modals open once, save, retain errors and copy pairing values", {
  skip: !process.env.PLAYWRIGHT_MODULE_PATH,
  timeout: 120000,
}, async (t) => {
  const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH);
  const { preview } = await import("vite");
  const server = await preview({ preview: { host: "127.0.0.1", port: 0 } });
  t.after(() => new Promise((resolve) => server.httpServer.close(resolve)));
  const browser = await chromium.launch({ headless: true,
    ...(process.env.PLAYWRIGHT_BROWSER_PATH && { executablePath: process.env.PLAYWRIGHT_BROWSER_PATH }),
  });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const device = { id: "device-1", name: "Tótem de prueba", cashRegisterId: "register-1", pointTerminalId: "POINT_OLD", status: "ACTIVE" };
  const registers = [
    { id: "register-1", name: "Caja principal", code: "MAIN", isActive: true },
    { id: "register-2", name: "Caja barra", code: "BARRA", isActive: true },
    { id: "register-3", name: "Caja inactiva", code: "OLD", isActive: false },
  ];
  const pairing = { device, pairingCode: "test-pairing-code", pairingCodeExpiresAt: "2026-12-01T15:30:00Z" };
  const mutations = [];
  let failNext = false;
  let gate;
  await page.route("**/*", async (route) => {
    const request = route.request();
    if (!["fetch", "xhr"].includes(request.resourceType())) return route.continue();
    const path = new URL(request.url()).pathname;
    let body = [];
    let status = 200;
    if (path.includes("/main-route-cashregister")) body = registers;
    if (path.endsWith("/main-route-totem/devices")) body = [device];
    if (request.method() === "POST" && path.includes("/main-route-totem/devices")) {
      const payload = request.postDataJSON();
      mutations.push({ path, payload });
      if (gate) await gate;
      if (failNext) {
        failNext = false;
        status = 409;
        body = { message: "Hay una compra pendiente" };
      } else if (path.endsWith("/point")) {
        device.pointTerminalId = payload.pointTerminalId;
        body = { device };
      } else if (path.endsWith("/cash-register")) {
        device.cashRegisterId = payload.cashRegisterId;
        body = { device };
      } else if (path.endsWith("/disable")) {
        device.status = "DISABLED";
        body = { device };
      } else body = pairing;
    }
    await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
  });
  await page.addInitScript(() => {
    const user = { id: "admin-test", role: "admin" };
    const token = `e30.${btoa(JSON.stringify({ ...user, exp: Date.now() / 1000 + 864000 }))}.signature`;
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    window.secureStorage = localStorage;
    window.__copied = [];
    window.electronAPI = { writeClipboardText: async (value) => {
      if (window.__copyFails) throw new Error("Clipboard unavailable");
      window.__copied.push(value);
      return { copied: true };
    } };
    window.totemAPI = {
      registerThemes: async () => ({ ok: true }),
      getRuntime: async () => ({ ok: true, mode: "admin" }),
    };
  });
  const url = `http://127.0.0.1:${server.httpServer.address().port}/#/totem-devices`;
  await page.goto(url);
  await page.getByText(device.name, { exact: true }).waitFor();
  const dialog = page.getByRole("dialog");

  // Point: initial values, cancellation, API error, locking while saving and retry.
  await page.getByRole("button", { name: "Configurar terminal Point" }).click();
  assert.equal(await dialog.count(), 1);
  assert.equal(await dialog.getByRole("textbox").inputValue(), "POINT_OLD");
  await dialog.getByRole("button", { name: "Cancelar" }).click();
  await dialog.waitFor({ state: "hidden" });
  await page.getByRole("button", { name: "Configurar terminal Point" }).click();
  await dialog.getByRole("textbox").fill("POINT_NEW");
  failNext = true;
  await dialog.getByRole("button", { name: "Guardar", exact: true }).click();
  await dialog.getByText("Hay una compra pendiente").waitFor();
  let release;
  gate = new Promise((resolve) => { release = resolve; });
  await dialog.getByRole("button", { name: "Guardar", exact: true }).click();
  assert.equal(await dialog.getByRole("button", { name: "Cancelar" }).isDisabled(), true);
  await page.keyboard.press("Escape");
  assert.equal(await dialog.count(), 1);
  release();
  gate = null;
  await dialog.waitFor({ state: "hidden" });
  await page.getByText("POINT_NEW", { exact: true }).waitFor();

  // Cash register: only active registers, no-op disabled, successful save and refresh.
  await page.getByRole("button", { name: "Cambiar caja" }).click();
  assert.equal(await dialog.getByRole("button", { name: "Guardar caja" }).isDisabled(), true);
  await dialog.getByRole("combobox").click();
  assert.equal(await page.getByRole("option", { name: /Caja inactiva/ }).count(), 0);
  await page.getByRole("option", { name: /Caja barra/ }).click();
  await dialog.getByRole("button", { name: "Guardar caja" }).click();
  await dialog.waitFor({ state: "hidden" });
  assert.equal(device.cashRegisterId, "register-2");

  // Confirmation cancel, error retention, then transition to a single pairing modal.
  await page.getByRole("button", { name: "Generar nueva vinculación" }).click();
  await dialog.getByRole("button", { name: "Volver" }).click();
  await dialog.waitFor({ state: "hidden" });
  await page.getByRole("button", { name: "Generar nueva vinculación" }).click();
  failNext = true;
  await dialog.getByRole("button", { name: "Confirmar", exact: true }).click();
  await dialog.getByText("Hay una compra pendiente").waitFor();
  await dialog.getByRole("button", { name: "Confirmar", exact: true }).click();
  await dialog.getByText("VINCULAR ESTE TOTEM", { exact: true }).waitFor();
  await page.waitForFunction(() => document.querySelectorAll('[role="dialog"]').length === 1);
  await dialog.getByText(/Fecha: 01-12-2026/).waitFor();
  await dialog.getByRole("button", { name: "Copiar ID del dispositivo" }).click();
  await dialog.getByText("ID del dispositivo copiado", { exact: true }).waitFor();
  await dialog.getByRole("button", { name: "Copiar código de vinculación" }).click();
  await dialog.getByText("Código de vinculación copiado", { exact: true }).waitFor();
  assert.deepEqual(await page.evaluate(() => window.__copied), [device.id, pairing.pairingCode]);
  await page.evaluate(() => { window.__copyFails = true; });
  await dialog.getByRole("button", { name: "Copiar código de vinculación" }).click();
  await dialog.getByText(/No se pudo copiar/).waitFor();
  await dialog.getByRole("button", { name: "Cerrar" }).click();
  await dialog.waitFor({ state: "hidden" });

  await page.getByRole("button", { name: "Desactivar", exact: true }).click();
  await dialog.getByText("DESACTIVAR TÓTEM", { exact: true }).waitFor();
  await dialog.getByRole("button", { name: "Confirmar", exact: true }).click();
  await dialog.waitFor({ state: "hidden" });
  assert.equal(await page.getByRole("button", { name: "Desactivar", exact: true }).isDisabled(), true);

  // Registering a new device also opens the extracted pairing modal.
  await page.getByRole("textbox", { name: "Nombre del Tótem" }).fill("Nuevo tótem");
  await page.getByRole("combobox", { name: "Caja asociada" }).click();
  await page.getByRole("option", { name: /Caja principal/ }).click();
  await page.getByRole("button", { name: "REGISTRAR TÓTEM", exact: true }).click();
  await dialog.getByText("VINCULAR ESTE TOTEM", { exact: true }).waitFor();
  assert.equal(mutations.filter((entry) => entry.path.endsWith("/pairing")).length, 2);
  assert.equal(errors.length, 0, errors.join("\n"));
});
