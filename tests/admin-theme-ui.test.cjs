const assert = require("node:assert/strict");
const { test } = require("node:test");

test("admin theme selector chooses all three themes explicitly and persists independently of the totem", {
  skip: !process.env.PLAYWRIGHT_MODULE_PATH,
  timeout: 120000,
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
  const selector = page.getByRole("combobox", { name: "Tema de la aplicación" }).filter({ visible: true });
  await selector.getByText("Azul Oscuro", { exact: true }).waitFor();
  for (const [label, value, background] of [
    ["Claro", "light", "rgb(251, 251, 252)"],
    ["Oscuro", "dark", "rgb(52, 58, 64)"],
    ["Azul Oscuro", "darkBlue", "rgb(43, 55, 69)"],
    ["Oscuro", "dark", "rgb(52, 58, 64)"],
    ["Claro", "light", "rgb(251, 251, 252)"],
    ["Azul Oscuro", "darkBlue", "rgb(43, 55, 69)"],
  ]) {
    await selector.click();
    assert.equal(await page.getByRole("option").count(), 3);
    await page.getByRole("option", { name: label, exact: true }).click();
    await selector.getByText(label, { exact: true }).waitFor();
    await page.waitForFunction((expected) => getComputedStyle(document.body).backgroundColor === expected, background);
    assert.equal(await page.evaluate(() => localStorage.getItem("lobotechAppTheme")), value);
    assert.equal(await page.evaluate(() => localStorage.getItem("lobotechTotemTheme")), "light");
  }
  await page.reload();
  await selector.getByText("Azul Oscuro", { exact: true }).waitFor();
  // Reevaluate the provider through Vite's real HMR client without editing source files.
  const providerPath = "/vendor/client-src/context/ThemeContext.jsx";
  await page.evaluate(() => { window.__themeRefreshMarker = "preserved"; });
  server.moduleGraph.invalidateModule(await server.moduleGraph.getModuleByUrl(providerPath));
  const refreshed = page.waitForEvent("console", {
    predicate: (message) => message.text().includes(`hot updated: ${providerPath}`),
  });
  server.ws.send({ type: "update", updates: [{
    type: "js-update", path: providerPath, acceptedPath: providerPath, timestamp: Date.now(),
  }] });
  await refreshed;
  await selector.getByText("Azul Oscuro", { exact: true }).waitFor();
  assert.equal(await page.evaluate(() => window.__themeRefreshMarker), "preserved");
  assert.equal(refreshMessages.some((message) => /Could not Fast Refresh|hmr invalidate/.test(message)), false);
  assert.deepEqual(errors, []);
});
