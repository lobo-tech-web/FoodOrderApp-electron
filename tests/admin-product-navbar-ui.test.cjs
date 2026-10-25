const assert = require("node:assert/strict");
const { test } = require("node:test");

test("product navbar combines search, category and status without overflow and follows theme", {
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
    await route.fulfill({ contentType: "application/json", body: JSON.stringify(route.request().url().includes(server.config.env.VITE_API_PRODUCTS_MAIN_ROUTER) ? [
      { id: 1, name: "Café doble", status: true, categoryId: 1, category: {name: "Cafetería"}, price: 2000, discount: 10, rewardPoints: 25, redeemPoints: 100, image: "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="80"><rect width="100" height="80" fill="orange"/></svg>') },
      { id: 2, name: "Café frío", status: false, categoryId: 2, category: {name: "Bebidas"}, price: 1500, image: "data:image/png;base64,broken" },
      { id: 3, name: "Té", status: true, categoryId: 1, category: {name: "Cafetería"}, price: 1000 }
    ] : route.request().url().includes(server.config.env.VITE_API_CATEGORY_MAIN_ROUTER) ? [{id: 1, name: "Cafetería"}, {id: 2, name: "Bebidas"}] : []) });
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

  await page.getByRole("button", { name: "Carta Digital", exact: true }).click();
  await page.getByRole("button", { name: "Productos", exact: true }).click();
  const navbar = page.getByRole("region", { name: "Herramientas de productos" });
  const table = page.getByRole("table");
  await table.getByRole("rowheader", { name: "Café doble", exact: true }).waitFor();
  const rowCount = () => table.locator("tbody tr").count();
  assert.equal(await rowCount(), 3);
  const firstRow = table.locator("tbody tr").first();
  const image = firstRow.getByRole("img", { name: "Café doble", exact: true });
  await image.waitFor();
  assert.equal(await image.evaluate(el => el.complete && el.naturalWidth > 0), true);
  assert.equal(await image.evaluate(el => getComputedStyle(el).objectFit), "cover");
  assert.equal(await table.locator("tbody tr").nth(1).locator("td").first().getByTestId("FastfoodIcon").count(), 1);
  assert.equal(await table.locator("tbody tr").nth(2).locator("td").first().getByTestId("FastfoodIcon").count(), 1);
  for (const column of [4, 5, 6, 7]) {
    const heading = await table.locator("thead th").nth(column).boundingBox();
    const value = firstRow.locator("td, th").nth(column).locator("p");
    const before = await value.boundingBox();
    assert.ok(Math.abs(before.x + before.width / 2 - heading.x - heading.width / 2) < 1);
    await firstRow.locator("td, th").nth(column).hover();
    const after = await value.boundingBox();
    assert.ok(Math.abs(after.x + after.width / 2 - before.x - before.width / 2) < 1);
  }
  await navbar.getByRole("textbox", { name: "Nombre del producto" }).fill("cafe");
  await navbar.getByRole("button", { name: "Buscar productos", exact: true }).click();
  assert.equal(await rowCount(), 2);
  await navbar.getByRole("combobox", { name: /^Categoría/ }).click();
  await page.getByRole("option", { name: "Cafetería", exact: true }).click();
  assert.equal(await rowCount(), 1);
  await navbar.getByRole("combobox", { name: /^Estado/ }).click();
  await page.getByRole("option", { name: "Desactivados", exact: true }).click();
  await page.getByText("NO SE ENCONTRARON PRODUCTOS CON ESTOS FILTROS.", {exact:true}).waitFor();
  await navbar.getByRole("button", { name: "Limpiar búsqueda de productos" }).click();
  await navbar.getByRole("combobox", { name: /^Estado/ }).click();
  await page.getByRole("option", { name: "Activos", exact: true }).click();
  assert.equal(await rowCount(), 2);
  await navbar.getByRole("button", { name: "Actualizar productos" }).click();
  await navbar.waitFor();
  assert.equal(await navbar.getByRole("combobox", { name: /^Categoría/ }).innerText(), "Cafetería");
  assert.equal(await rowCount(), 2);
  const catalogButton = navbar.getByRole("button", { name: "Generar catálogo PDF", exact: true });
  assert.equal(await page.getByRole("button", { name: "Generar catálogo PDF", exact: true }).count(), 1);
  await catalogButton.click();
  await page.getByRole("dialog").getByText("GENERAR CATÁLOGO PDF", { exact: true }).waitFor();
  await page.keyboard.press("Escape");
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  const selector = page.getByRole("combobox", { name: "Tema de la aplicación" }).filter({ visible: true });
  const colors = [];
  for (const theme of ["Claro", "Oscuro", "Azul Oscuro"]) {
    await selector.click();
    await page.getByRole("option", { name: theme, exact: true }).click();
    colors.push(await navbar.evaluate(el => getComputedStyle(el).backgroundColor));
    assert.equal(await navbar.evaluate(el => getComputedStyle(el).backgroundImage), "none");
  }
  assert.equal(new Set(colors).size, 3);
  for (const width of [1440, 1024, 600]) {
    await page.setViewportSize({width, height: 1000});
    assert.equal(await navbar.evaluate(el => el.scrollWidth <= el.clientWidth + 1), true);
    if (width >= 1024) {
      const search = await navbar.getByRole("textbox", { name: "Nombre del producto" }).boundingBox();
      for (const name of [/^Categoría/, /^Estado/]) {
        const filter = await navbar.getByRole("combobox", { name }).boundingBox();
        assert.ok(Math.abs(filter.y - search.y) < 2);
      }
      const createButton = await navbar.getByRole("button", { name: "Nuevo producto", exact: true }).boundingBox();
      const pricesButton = await navbar.getByRole("button", { name: "Modificar precios", exact: true }).boundingBox();
      assert.ok(createButton.y >= search.y + search.height);
      assert.ok(Math.abs(createButton.y - pricesButton.y) < 2);
    }
    await page.screenshot({ path: "test-artifacts/product-navbar-" + width + ".png", fullPage: true });
  }
  await navbar.getByRole("button", {name: "Nuevo producto", exact: true}).click();
  await page.getByRole("dialog").waitFor();
  assert.deepEqual(errors, []);
});
