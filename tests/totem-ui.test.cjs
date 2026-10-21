const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");

test(
  "totem touch checkout, pending payment, receipt failure and reset work at desktop and mobile widths",
  { skip: !process.env.PLAYWRIGHT_MODULE_PATH, timeout: 120000 },
  async (t) => {
    const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH);
    const { preview } = await import("vite");
    const server = await preview({
      preview: { host: "127.0.0.1", port: 0, strictPort: true },
    });
    t.after(() => new Promise((resolve) => server.httpServer.close(resolve)));
    const browser = await chromium.launch({
      headless: true,
      ...(process.env.PLAYWRIGHT_BROWSER_PATH && {
        executablePath: process.env.PLAYWRIGHT_BROWSER_PATH,
      }),
    });
    t.after(() => browser.close());
    const output = path.join(__dirname, "../test-artifacts");
    fs.mkdirSync(output, { recursive: true });
    const url = `http://127.0.0.1:${server.httpServer.address().port}`;
    for (const viewport of [
      { width: 1366, height: 768 },
      { width: 1024, height: 768 },
      { width: 390, height: 844 },
      { width: 1366, height: 600 },
      { width: 360, height: 640 },
    ]) {
      const page = await browser.newPage({ viewport });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.addInitScript((width) => {
        const device = {
          id: "test-device",
          name: "Local de prueba",
          status: "ACTIVE",
        };
        const product = {
          id: "burger",
          name: "Hamburguesa doble con cheddar y panceta",
          image: "/assets/example2-FDkxgL-2.png",
          description: "Hamburguesa del local",
          categoryId: "burgers",
          displayPrice: 10000,
          rewardPoints: 100,
          redeemPoints: 0,
          allowComment: true,
          customOptions: [
            {
              id: "fries",
              name: "Elegí el acompañamiento",
              type: "unique",
              required: true,
              items: [
                { id: "yes", name: "Con papas fritas", extraCost: 2000 },
                { id: "no", name: "Sin papas", extraCost: 0 },
              ],
            },
            {
              id: "sauces", name: "Salsas extra", type: "extra", maxSelected: 2,
              items: [{ id: "cheddar", name: "Salsa cheddar", extraCost: 500 }],
            },
            { id: "hidden", name: "Opción deshabilitada", type: "unique", required: true, status: false, items: [] },
          ],
        };
        window.__checkoutCalls = 0;
        window.__prints = 0;
        window.__payload = null;
        let checkout = null;
        let exitListener;
        window.totemAPI = {
          getRuntime: () => new Promise((resolve) => {
            window.__releaseRuntime = () => resolve({
              ok: true,
              mode: "totem",
              totemTheme: "light",
            });
          }),
          registerThemes: async () => ({ ok: true }),
          onThemeChanged: () => () => {},
          onRequestExit: (callback) => { exitListener = callback; return () => { exitListener = null; }; },
          requestExit: async () => { exitListener?.(); return { ok: true }; },
          authorizeExit: async () => ({ ok: false, message: "Contraseña incorrecta" }),
          onBackgroundChanged: (callback) => { window.__backgroundChanged = callback; return () => {}; },
          getStatus: async () => ({ ok: true, linked: true, device }),
          getCatalog: async () => ({
            ok: true,
            catalog: {
              restaurant: {
                businessName: "Local de prueba",
                businessLogoUrl: width >= 900
                  ? `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="80"><rect width="160" height="80" fill="orange"/></svg>')}`
                  : null,
              },
              categories: [{ id: "burgers", name: "Hamburguesas especiales" }],
              products: [
                product,
                { ...product, id: "no-photo", name: "Producto sin foto", image: null },
                { ...product, id: "long-name", name: "Producto con un nombre muy largo que ocupa varias líneas en la tarjeta del catálogo de productos", image: null, redeemPoints: 100, displayPrice: 0, customOptions: undefined, productCustomOptions: [] },
              ],
            },
          }),
          recoverCheckout: async () => ({ ok: true, checkout }),
          createCheckout: async (payload) => {
            window.__checkoutCalls++;
            window.__payload = payload;
            checkout = {
              id: "checkout-1",
              status: "PENDING",
              totalAmount: payload.expectedTotal,
            };
            return { ok: true, checkout };
          },
          findCustomer: async (cuit) => {
            if (cuit === "11111111") return { ok: true, found: false, customer: null };
            if (cuit === "22222222") return { ok: false, message: "No se pudo buscar la cuenta" };
            if (cuit !== "20329642330") throw new Error("CUIT incorrecto");
            window.__lookupCuit = cuit;
            await new Promise((resolve) => { window.__releaseLookup = resolve; });
            return {
            ok: true,
            found: true,
            customer: { name: "Cliente Test", cuit: "20329642330", points: window.__customerPoints ?? 1000 },
            };
          },
          printReceipt: async () => {
            window.__prints++;
            return { printed: false, reason: "no-printer" };
          },
          getCheckout: async () => ({ ok: true, checkout }),
          finishCheckout: async () => {
            checkout = null;
            return { ok: true };
          },
          cancelCheckout: async () => ({
            ok: true,
            checkout: { ...checkout, status: "CANCELED" },
          }),
        };
        window.__approve = () => {
          checkout.status = "COMPLETED";
          checkout.order = { isPaid: true, dailyOrderNumber: 53 };
        };
      }, viewport.width);
      await page.goto(url);
      const runtimeMessage = page.getByRole("status");
      await runtimeMessage.getByText("Verificando el modo de la aplicación…").waitFor();
      const loadingBounds = await runtimeMessage.boundingBox();
      assert.ok(Math.abs(loadingBounds.x + loadingBounds.width / 2 - viewport.width / 2) < 2);
      assert.ok(Math.abs(loadingBounds.y + loadingBounds.height / 2 - viewport.height / 2) < 2);
      await page.screenshot({
        path: path.join(output, `desktop-loading-${viewport.width}.png`),
        animations: "disabled",
      });
      await page.waitForFunction(() => typeof window.__releaseRuntime === "function");
      await page.evaluate(() => window.__releaseRuntime());
      const orderTypeStep = page.getByRole("region", {
        name: "¡Hola!",
      });
      await orderTypeStep.waitFor();
      const section = await orderTypeStep.boundingBox();
      const content = await orderTypeStep.locator(":scope > div").boundingBox();
      assert.ok(Math.abs(content.x + content.width / 2 - viewport.width / 2) < 2);
      assert.ok(Math.abs(content.y + content.height / 2 - section.y - section.height / 2) < 2);
      const checkOrderTypeLayout = async () => {
        const panel = await page.locator('[aria-labelledby="totem-order-type-title"] > div').boundingBox();
        assert.ok(panel.y >= 44 && panel.y + panel.height <= viewport.height + 1, `Order type panel exceeds ${viewport.width}x${viewport.height}: ${JSON.stringify(panel)}`);
        const overflow = await page.locator('[aria-labelledby="totem-order-type-title"]').evaluate((element) => {
          const root = element.parentElement;
          return { scrollHeight: root.scrollHeight, height: root.clientHeight, scrollWidth: root.scrollWidth, width: root.clientWidth };
        });
        assert.ok(overflow.scrollHeight <= overflow.height + 1 && overflow.scrollWidth <= overflow.width + 1, `${viewport.width}x${viewport.height}: ${JSON.stringify(overflow)}`);
      };
      await checkOrderTypeLayout();
      assert.equal(await orderTypeStep.locator("img").evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0)), true);
      await page.emulateMedia({ reducedMotion: "reduce" });
      const takeAway = page.getByRole("button", { name: "Para llevar", exact: true });
      await takeAway.hover();
      assert.equal(await takeAway.locator("img").evaluate((element) => getComputedStyle(element).transform), "none");
      await page.emulateMedia({ reducedMotion: "no-preference" });
      const dineIn = page.getByRole("button", { name: /^(Comer aquí|Consumir en el local)$/ });
      await dineIn.locator("img").dispatchEvent("error");
      assert.equal(await dineIn.locator("img").count(), 0);
      assert.notEqual(await dineIn.locator(":scope > div").first().locator("div").evaluate((element) => getComputedStyle(element).backgroundImage), "none");
      await page.getByRole("button", { name: "Seleccionar idioma" }).click();
      await page.getByRole("menuitem", { name: "English", exact: true }).click();
      await page.getByText("Electronic payments only", { exact: true }).waitFor();
      assert.equal(await page.locator('[aria-labelledby="totem-order-type-title"]').getAttribute("lang"), "en");
      await checkOrderTypeLayout();
      const largeText = page.getByRole("button", { name: "Large text", exact: true });
      await largeText.click();
      assert.equal(await largeText.getAttribute("aria-pressed"), "true");
      await checkOrderTypeLayout();
      await largeText.click();
      await page.getByRole("button", { name: "Eat here", exact: true }).click();
      const dineInHeader = page.getByRole("button", { name: "CONSUMIR EN EL LOCAL", exact: true });
      await dineInHeader.locator('[data-testid="RestaurantRoundedIcon"]').waitFor();
      await dineInHeader.click();
      await orderTypeStep.waitFor();
      await page.getByRole("button", { name: "Cerrar tótem", exact: true }).click();
      const exitDialog = page.getByRole("dialog");
      await exitDialog.getByLabel("Contraseña del administrador").fill("wrong-test-password");
      await exitDialog.getByRole("button", { name: "Cerrar aplicación", exact: true }).click();
      await exitDialog.getByText("Contraseña incorrecta").waitFor();
      await exitDialog.getByRole("button", { name: "Volver", exact: true }).click();
      await exitDialog.waitFor({ state: "hidden" });
      await page.evaluate(() => window.__backgroundChanged({ mode: "image", imageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a34QAAAAASUVORK5CYII=" }));
      await page.waitForFunction(() => getComputedStyle(document.querySelector("header").parentElement).backgroundColor === "rgba(0, 0, 0, 0)");
      await page.evaluate(() => window.__backgroundChanged({ mode: "theme", imageUrl: "" }));
      await page.waitForFunction(() => getComputedStyle(document.querySelector("header").parentElement).backgroundColor !== "rgba(0, 0, 0, 0)");
      await page.screenshot({
        path: path.join(output, `totem-order-type-${viewport.width}x${viewport.height}.png`),
        animations: "disabled",
      });
      await page
        .getByRole("button", { name: "Para llevar", exact: true })
        .click();
      const orderTypeButton = page.getByRole("button", { name: "PARA LLEVAR", exact: true });
      await orderTypeButton.locator('[data-testid="ShoppingBagOutlinedIcon"]').waitFor();
      const orderTypeBounds = await orderTypeButton.boundingBox();
      assert.ok(orderTypeBounds.x >= 0 && orderTypeBounds.x + orderTypeBounds.width <= viewport.width - 15);
      assert.ok(orderTypeBounds.height >= 44);
      if (viewport.height <= 640) {
        assert.deepEqual(errors, []);
        await page.close();
        continue;
      }
      const photoCard = page.getByRole("button", { name: /Hamburguesa doble/ });
      const noPhotoCard = page.getByRole("button", { name: /Producto sin foto/ });
      const longNameCard = page.getByRole("button", { name: /Producto con un nombre muy largo/ });
      await photoCard.waitFor();
      const cardBounds = await Promise.all([photoCard, noPhotoCard, longNameCard].map((card) => card.boundingBox()));
      for (const bounds of cardBounds.slice(1)) {
        assert.ok(Math.abs(bounds.width - cardBounds[0].width) < 2);
        assert.ok(Math.abs(bounds.height - cardBounds[0].height) < 2);
      }
      const photoSizing = await photoCard.locator("img").evaluate((img) => {
        const bounds = img.getBoundingClientRect();
        return { width: bounds.width, height: bounds.height, objectFit: getComputedStyle(img).objectFit };
      });
      assert.equal(photoSizing.objectFit, "cover");
      await longNameCard.getByText("Canje por puntos").waitFor();
      await longNameCard.getByText("100 puntos", { exact: true }).waitFor();
      assert.ok(Math.abs(photoSizing.width / photoSizing.height - 4 / 3) < 0.02);
      if (viewport.width >= 900) {
        await noPhotoCard.getByRole("img", { name: "Logo de Local de prueba" }).waitFor();
      } else {
        assert.equal(await noPhotoCard.locator("img").count(), 0);
        assert.equal(await noPhotoCard.locator('[data-testid="RestaurantIcon"]').count(), 1);
      }
      await page.screenshot({ path: path.join(output, `totem-catalog-${viewport.width}.png`), fullPage: true });
      const sortSelect = page.getByRole("combobox", { name: "Ordenar por" });
      await sortSelect.click();
      await page.getByRole("option", { name: "Nombre: Z a A", exact: true }).click();
      assert.match(await page.locator(".MuiCardActionArea-root").first().getAttribute("aria-label"), /Producto sin foto/);
      await sortSelect.click();
      await page.getByRole("option", { name: "Puntos: menor a mayor", exact: true }).click();
      assert.match(await page.locator(".MuiCardActionArea-root").first().getAttribute("aria-label"), /Producto con un nombre muy largo/);
      await sortSelect.click();
      await page.getByRole("option", { name: "Precio: mayor a menor", exact: true }).click();
      assert.match(await page.locator(".MuiCardActionArea-root").first().getAttribute("aria-label"), /Hamburguesa doble/);
      await page.getByRole("textbox", { name: "Buscar productos" }).fill("sin foto");
      assert.equal(await page.locator(".MuiCardActionArea-root").count(), 1);
      await page.getByRole("textbox", { name: "Buscar productos" }).fill("");
      await page.getByRole("navigation", { name: "Categorías de productos" }).getByRole("button", { name: "Hamburguesas especiales" }).click();
      await page.getByRole("button", { name: /Hamburguesa doble/ }).click();
      await page.getByRole("button", { name: "Agregar al pedido", exact: true }).click();
      await page.getByText("Completá Elegí el acompañamiento").waitFor();
      await page.getByRole("button", { name: /Con papas fritas/ }).click();
      await page.getByRole("button", { name: /Sin papas/ }).click();
      assert.equal(await page.getByRole("button", { name: /Sin papas/ }).getAttribute("aria-pressed"), "true");
      await page.getByRole("button", { name: /Con papas fritas/ }).click();
      assert.equal(await page.getByText("Opción deshabilitada", { exact: true }).count(), 0);
      assert.equal(await page.getByRole("textbox", { name: "Comentarios del producto" }).count(), 1);
      const increaseExtra = page.getByRole("button", { name: "Agregar Salsa cheddar", exact: true });
      await increaseExtra.click();
      await increaseExtra.click();
      assert.equal(await increaseExtra.isDisabled(), true);
      await page.getByRole("button", { name: "Quitar Salsa cheddar", exact: true }).click();
      await page.getByRole("button", { name: "Quitar Salsa cheddar", exact: true }).click();
      await page
        .getByRole("textbox", { name: "Comentarios del producto" })
        .fill("Sin sal");
      await page.screenshot({
        path: path.join(output, `totem-product-${viewport.width}.png`),
        fullPage: true,
        animations: "disabled",
      });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      await page.getByRole("button", { name: "Agregar al pedido", exact: true }).click();
      const cartNavbar = page.getByRole("navigation", { name: "Mi pedido" });
      await cartNavbar.getByText("1 producto", { exact: true }).waitFor();
      const navbarBounds = await cartNavbar.boundingBox();
      assert.ok(navbarBounds.y + navbarBounds.height <= viewport.height);
      await page.getByRole("button", { name: "Ver carrito", exact: true }).click();
      await page.getByText(/1 × Con papas fritas/).waitFor();
      await page.getByText(/\(\+ \$\s?2\.000,00(?: extra)?\s*\)/).waitFor();
      await page.getByText("Comentario:", { exact: true }).waitFor();
      await page.getByText("Sin sal", { exact: true }).waitFor();
      await page.getByRole("button", { name: "Agregar unidad" }).click();
      await page.getByRole("button", { name: "Seguir eligiendo" }).click();
      await cartNavbar.getByText("2 productos", { exact: true }).waitFor();
      await cartNavbar.getByText(/24\.000,00/).waitFor();
      await page.screenshot({ path: path.join(output, `totem-navbar-cart-${viewport.width}.png`), fullPage: true });
      await page.getByRole("button", { name: "Ver carrito", exact: true }).click();
      await page.getByRole("button", { name: "Quitar unidad" }).click();
      await page.screenshot({
        path: path.join(output, `totem-cart-${viewport.width}.png`),
        fullPage: true,
        animations: "disabled",
      });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      await page.getByRole("button", { name: "Confirmar mi pedido" }).click();
      const identifySection = page.getByRole("region", { name: "Identificate y sumá puntos para canjear por beneficios exclusivos en la app" });
      await identifySection.waitFor();
      assert.equal(await identifySection.locator("img").count(), viewport.width >= 900 ? 1 : 0);
      await page.screenshot({ path: path.join(output, `totem-identify-${viewport.width}.png`), fullPage: true });
      if (viewport.width >= 900) {
        assert.equal(await identifySection.locator("img").getAttribute("src"), await page.locator("header img").getAttribute("src"));
        await identifySection.locator("img").dispatchEvent("error");
        assert.equal(await identifySection.locator("img").count(), 0);
      }
      await page.getByRole("button", { name: "¡Identificate y sumá puntos!", exact: true }).click();
      const documentInput = page.getByRole("textbox", { name: "DNI / CUIT / CUIL", exact: true });
      await documentInput.fill("11111111");
      await page.getByRole("button", { name: "Buscar", exact: true }).click();
      await page.getByText(/No encontramos una cuenta con ese documento/).waitFor();
      assert.equal(await page.getByRole("heading", { name: "CONFIRMÁ TU PEDIDO" }).count(), 0);
      await documentInput.fill("22222222");
      await page.getByRole("button", { name: "Buscar", exact: true }).click();
      await page.getByText("No se pudo buscar la cuenta", { exact: true }).waitFor();
      await documentInput.fill("12ab");
      assert.equal(await documentInput.inputValue(), "12");
      await documentInput.fill("20329642330");
      assert.equal(await documentInput.inputValue(), "20329642330");
      const searchButton = page.getByRole("button", { name: "Buscar", exact: true });
      const searchBounds = await searchButton.boundingBox();
      const cuitBounds = await documentInput.locator("..").boundingBox();
      assert.ok(Math.abs(searchBounds.height - cuitBounds.height) < 2);
      assert.ok(searchBounds.y >= cuitBounds.y + cuitBounds.height);
      if (viewport.width >= 600) {
        assert.ok(Math.abs(searchBounds.x + searchBounds.width / 2 - cuitBounds.x - cuitBounds.width / 2) < 2);
        assert.ok(searchBounds.width >= 200);
      }
      await searchButton.click();
      assert.equal(await page.getByRole("button", { name: "Buscando...", exact: true }).isDisabled(), true);
      await page.getByRole("button", { name: "Volver a las opciones", exact: true }).click();
      await page.evaluate(() => window.__releaseLookup());
      await identifySection.waitFor();
      assert.equal(await page.getByRole("heading", { name: "CONFIRMÁ TU PEDIDO" }).count(), 0);
      await page.getByRole("button", { name: "¡Identificate y sumá puntos!", exact: true }).click();
      await searchButton.click();
      await page.evaluate(() => window.__releaseLookup());
      const customerSection = page.getByRole("region", { name: "CONFIRMÁ TU PEDIDO" });
      await customerSection.waitFor();
      const customerBounds = await customerSection.boundingBox();
      const customerContent = await customerSection.locator(":scope > div").boundingBox();
      assert.ok(Math.abs(customerContent.x + customerContent.width / 2 - viewport.width / 2) < 2);
      assert.ok(Math.abs(customerContent.y + customerContent.height / 2 - customerBounds.y - customerBounds.height / 2) < 2);
      assert.equal(await page.getByRole("textbox", { name: "Tu nombre", exact: true }).inputValue(), "Cliente Test");
      assert.equal(await page.getByRole("textbox", { name: "Tu nombre", exact: true }).getAttribute("readonly"), "");
      assert.equal(await documentInput.inputValue(), "20329642330");
      assert.equal(await documentInput.getAttribute("readonly"), "");
      await page.screenshot({ path: path.join(output, `totem-customer-${viewport.width}.png`), fullPage: true });
      // Changing the order type from customer confirmation returns to its selection,
      // preserves the cart and never submits an empty order type.
      await orderTypeButton.click();
      await orderTypeStep.waitFor();
      assert.equal(await customerSection.count(), 0);
      await page.getByRole("button", { name: "Para llevar", exact: true }).click();
      await page.getByRole("button", { name: "Ver carrito", exact: true }).click();
      await orderTypeButton.click();
      await orderTypeStep.waitFor();
      await page.getByRole("button", { name: "Para llevar", exact: true }).click();
      await page.getByRole("button", { name: "Ver carrito", exact: true }).click();
      await page.getByRole("button", { name: "Confirmar mi pedido" }).click();
      await page.getByRole("button", { name: "Continuar sin identificarme", exact: true }).click();
      assert.equal(await documentInput.count(), 0);
      assert.equal(await page.getByRole("textbox", { name: "Tu nombre", exact: true }).inputValue(), "");
      await page
        .getByRole("textbox", { name: "Tu nombre", exact: true })
        .fill("Cliente invitado");
      await page
        .getByRole("button", { name: "Proceder a Pagar" })
        .click();
      await page.getByText("Estamos verificando tu pago").waitFor();
      assert.equal(await orderTypeButton.isDisabled(), true);
      assert.equal(await page.evaluate(() => window.__checkoutCalls), 1);
      assert.equal(
        await page.evaluate(() => window.__payload.expectedTotal),
        12000,
      );
      assert.equal(
        await page.evaluate(() => window.__payload.cartItems[0].productComment),
        "Sin sal",
      );
      assert.equal(
        await page.evaluate(() => "discount" in window.__payload),
        false,
      );
      assert.equal(await page.evaluate(() => "userNumber" in window.__payload), false);
      assert.equal(await page.evaluate(() => window.__payload.orderType), "ESPERA EN LOCAL");
      assert.equal(await page.evaluate(() => window.__payload.clientName), "Cliente invitado");
      assert.equal(await page.evaluate(() => window.__payload.cuit), "");
      await page.evaluate(() => window.__approve());
      await page.getByRole("button", { name: "Verificar estado" }).click();
      await page.getByText("Pedido #53", { exact: true }).waitFor();
      await page.getByText(/No pudimos imprimir el ticket/).waitFor();
      assert.equal(await page.evaluate(() => window.__prints), 1);
      await page.screenshot({
        path: path.join(output, `totem-success-${viewport.width}.png`),
        fullPage: true,
      });
      await page
        .getByRole("button", { name: "Finalizar", exact: true })
        .click();
      await page.getByRole("heading", { name: "¡Hola!", exact: true }).waitFor();
      await page.getByRole("button", { name: "Para llevar", exact: true }).click();
      await longNameCard.click();
      await page.getByRole("button", { name: "Agregar al pedido", exact: true }).click();
      await cartNavbar.getByText("+ 100 puntos", { exact: true }).waitFor();
      await page.getByRole("button", { name: "Ver carrito", exact: true }).click();
      await page.getByText("Canje: 100 puntos", { exact: true }).waitFor();
      await page.getByRole("button", { name: "Confirmar mi pedido" }).click();
      assert.equal(await page.getByRole("button", { name: "Continuar sin identificarme", exact: true }).isDisabled(), true);
      await page.getByRole("button", { name: "¡Identificate y sumá puntos!", exact: true }).click();
      await documentInput.fill("20329642330");
      await page.evaluate(() => { window.__customerPoints = 50; });
      await page.getByRole("button", { name: "Buscar", exact: true }).click();
      assert.equal(await page.getByRole("button", { name: "Buscando...", exact: true }).isDisabled(), true);
      await page.evaluate(() => window.__releaseLookup());
      await customerSection.waitFor();
      assert.equal(await page.getByRole("button", { name: "Confirmar canje" }).isDisabled(), true);
      await page.getByRole("button", { name: "Cambiar identificación", exact: true }).click();
      await page.getByRole("button", { name: "¡Identificate y sumá puntos!", exact: true }).click();
      await documentInput.fill("20329642330");
      await page.evaluate(() => { window.__customerPoints = 1000; });
      await page.getByRole("button", { name: "Buscar", exact: true }).click();
      await page.evaluate(() => window.__releaseLookup());
      await page.getByText(/1000 puntos disponibles/).waitFor();
      assert.equal(await page.evaluate(() => window.__lookupCuit), "20329642330");
      assert.equal(await page.getByRole("button", { name: "Confirmar canje" }).isEnabled(), true);
      await page.getByRole("button", { name: "Confirmar canje" }).click();
      await page.getByText("Estamos verificando tu pago").waitFor();
      assert.equal(await page.evaluate(() => window.__payload.clientName), "Cliente Test");
      assert.equal(await page.evaluate(() => window.__payload.cuit), "20329642330");
      assert.equal(errors.length, 0, errors.join("\n"));
      await page.close();
    }
  },
);
