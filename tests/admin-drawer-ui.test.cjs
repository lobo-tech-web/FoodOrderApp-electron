const assert = require("node:assert/strict");
const { test } = require("node:test");

test("admin drawer opens only one group, outlines its submenus and toggles closed", {
  skip: !process.env.PLAYWRIGHT_MODULE_PATH, timeout: 120000,
}, async (t) => {
  const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH);
  const { createServer } = await import("vite");
  const server = await createServer({ server: { host: "127.0.0.1", port: 0 } });
  await server.listen();
  t.after(() => server.close());
  const browser = await chromium.launch({ headless: true,
    ...(process.env.PLAYWRIGHT_BROWSER_PATH && { executablePath: process.env.PLAYWRIGHT_BROWSER_PATH }),
  });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  const errors = [];
  const refreshMessages = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => refreshMessages.push(message.text()));
  await page.route("**/*", async (route) => {
    if (!["fetch", "xhr"].includes(route.request().resourceType())) return route.continue();
    await route.fulfill({ contentType: "application/json", body: "[]" });
  });
  await page.addInitScript(() => {
    const user = { id: "admin-test", role: "admin" };
    const token = `e30.${btoa(JSON.stringify({ ...user, exp: Date.now() / 1000 + 864000 }))}.signature`;
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    if (!localStorage.getItem("lobotechAppTheme")) localStorage.setItem("lobotechAppTheme", "darkBlue");
    localStorage.setItem("lobotechTotemTheme", "light");
    window.secureStorage = localStorage;
    window.totemAPI = {
      registerThemes: async () => ({ ok: true }),
      getRuntime: async () => ({ ok: true, mode: "admin" }),
    };
  });
  await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/#/control-panel`);
  const menuNames = ["Caja", "Pedidos", "Carta Digital", "Estadísticas", "Cadetes"];
  for (const name of menuNames) {
    const menu = page.getByRole("button", { name, exact: true });
    await menu.click();
    for (const otherName of menuNames) {
      assert.equal(await page.getByRole("button", { name: otherName, exact: true }).getAttribute("aria-expanded"), String(otherName === name));
    }
    const group = menu.locator("..");
    const collapseId = await menu.getAttribute("aria-controls");
    assert.equal(await group.locator(`[id="${collapseId}"]`).count(), 1);
    assert.equal(await page.locator(`[id="${collapseId}"]`).count(), 1);
    assert.equal(await group.evaluate((element) => getComputedStyle(element).borderTopWidth), "1px");
    assert.notEqual(await group.evaluate((element) => getComputedStyle(element).borderTopColor), "rgba(0, 0, 0, 0)");
  }
  await page.getByRole("button", { name: "Cadetes", exact: true }).click();
  for (const name of menuNames) {
    assert.equal(await page.getByRole("button", { name, exact: true }).getAttribute("aria-expanded"), "false");
  }
  await page.getByRole("button", { name: "Pedidos", exact: true }).click();
  await page.getByRole("button", { name: "Hoy", exact: true }).click();
  assert.equal(await page.getByRole("button", { name: "Hoy", exact: true }).evaluate((el) => el.classList.contains("Mui-selected")), true);
  assert.equal(await page.getByRole("button", { name: "Pedidos", exact: true }).getAttribute("aria-expanded"), "true");
  assert.deepEqual(errors, []);
});
