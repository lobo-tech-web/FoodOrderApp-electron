const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('LocalOrders y ModalCreateOrder editan opciones/comentarios sin duplicar líneas', {
  skip: !process.env.PLAYWRIGHT_MODULE_PATH,
  timeout: 180000,
}, async t => {
  const { createServer } = await import('vite');
  const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH);
  const server = await createServer({ server: { host: '127.0.0.1', port: 0 } });
  await server.listen();
  t.after(() => server.close());
  const browser = await chromium.launch({ headless: true,
    ...(process.env.PLAYWRIGHT_BROWSER_PATH && { executablePath: process.env.PLAYWRIGHT_BROWSER_PATH }),
  });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
  page.setDefaultTimeout(15000);
  const errors = [];
  let orderWrites = 0;
  page.on('pageerror', error => errors.push(error.message));
  const user = { id: 'admin-test', role: 'admin', status: true, businessName: 'Local test', paymentMethods: ['EFECTIVO'], enabledOrderTypes: ['ESPERA EN LOCAL'] };
  const category = { id: 'cat', name: 'Comidas', position: 0 };
  const group = { id: 'extras', name: 'Agregados', type: 'checkbox', status: true,
    items: [{ id: 'cheese', name: 'Queso', extraCost: 200, status: true }, { id: 'bacon', name: 'Bacon', extraCost: 300, status: true }] };
  const products = [
    { id: 'legacy', name: 'Combo clásico', price: 1000, status: true, category, categoryId: 'cat', allowComment: true, customOptions: [group], productCustomOptions: [], rewardPoints: 0, redeemPoints: 0 },
    { id: 'modern', name: 'Combo nuevo', price: 1000, status: true, category, categoryId: 'cat', allowComment: true, customOptions: [], productCustomOptions: [{ ...group, ProductCustomOption: { minSelected: 0, maxSelected: 3 } }], rewardPoints: 0, redeemPoints: 0 },
  ];
  const env = server.config.env;
  const matches = (url, key) => Boolean(env[key]) && url.includes(env[key]);
  await page.route('**/*', async route => {
    const request = route.request();
    if (!['xhr', 'fetch'].includes(request.resourceType())) return route.continue();
    const url = request.url();
    if (request.method() !== 'GET') {
      let payload;
      try { payload = request.postDataJSON(); } catch { /* Socket.IO utiliza texto. */ }
      if (payload?.orderData) orderWrites++;
      return route.fulfill({ status: 400, contentType: 'application/json', body: '{}' });
    }
    let body = [];
    if (matches(url, 'VITE_API_CASH_REGISTER_GET_OPEN_SESSIONS')) body = { id: 'session', cashRegisterId: 'cash', status: 'OPEN' };
    else if (matches(url, 'VITE_API_CASH_REGISTER_MAIN_ROUTER')) body = [{ id: 'cash', name: 'Caja test', status: true, isDefault: true }];
    else if (matches(url, 'VITE_API_PRODUCTS_MAIN_ROUTER')) body = products;
    else if (matches(url, 'VITE_API_CATEGORY_MAIN_ROUTER')) body = [category];
    else if (matches(url, 'VITE_API_USERS_MAIN_ROUTER')) body = user;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.addInitScript(user => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', `e30.${btoa(JSON.stringify({ ...user, exp: Date.now() / 1000 + 864000 }))}.signature`);
    window.secureStorage = localStorage;
    window.electronAPI = {};
    window.totemAPI = { registerThemes: async () => ({ ok: true }), getRuntime: async () => ({ ok: true, mode: 'admin' }) };
  }, user);
  const base = `http://127.0.0.1:${server.httpServer.address().port}`;
  const choice = (modal, name) => modal.getByRole('button', { name: new RegExp(name, 'i') });
  const isChosen = async (modal, name) => await choice(modal, name).getAttribute('aria-pressed') === 'true';
  const choose = async (modal, name, selected) => {
    if (await isChosen(modal, name) !== selected) await choice(modal, name).click();
  };
  const openProduct = async (name) => {
    await page.getByText(name.toUpperCase(), { exact: true }).first().click();
    const modal = page.getByRole('dialog').last();
    await choose(modal, 'Queso', true);
    await modal.getByPlaceholder('Comentarios para este producto...').filter({ visible: true }).fill('Sin cebolla');
    await modal.getByRole('button', { name: /AGREGAR AL PEDIDO/ }).click();
    await page.getByRole('button', { name: `Editar ${name}`, exact: true }).first().waitFor();
  };
  const row = name => page.getByRole('button', { name: `Editar ${name}`, exact: true }).first().locator('xpath=ancestor::*[contains(@class,"MuiPaper-root")][1]');
  const edit = async (name) => {
    await page.getByRole('button', { name: `Editar ${name}`, exact: true }).first().click();
    const modal = page.getByRole('dialog').last();
    assert.equal(await isChosen(modal, 'Queso'), true);
    assert.equal(await isChosen(modal, 'Bacon'), false);
    const comment = modal.getByPlaceholder('Comentarios para este producto...').filter({ visible: true });
    assert.equal(await comment.inputValue(), 'Sin cebolla');
    await choose(modal, 'Queso', false);
    await choose(modal, 'Bacon', true);
    await comment.fill('Bien cocida');
    await modal.getByRole('button', { name: /Guardar cambios/i }).click();
    await row(name).getByText(/Bien cocida/i).waitFor();
    assert.equal(await page.getByRole('button', { name: `Editar ${name}`, exact: true }).count(), 1);
    await row(name).getByText(/2\.600/).waitFor();
    // Reabrir y cancelar debe conservar el último guardado.
    await page.getByRole('button', { name: `Editar ${name}`, exact: true }).click();
    const reopened = page.getByRole('dialog').last();
    assert.equal(await isChosen(reopened, 'Bacon'), true);
    assert.equal(await isChosen(reopened, 'Queso'), false);
    const textarea = reopened.getByPlaceholder('Comentarios para este producto...').filter({ visible: true });
    assert.equal(await textarea.inputValue(), 'Bien cocida');
    await textarea.fill('Cambio descartado');
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Descartar cambios', exact: true }).click();
    await page.getByRole('button', { name: `Editar ${name}`, exact: true }).waitFor();
    await row(name).getByText(/Bien cocida/i).waitFor();
  };
  await page.goto(`${base}/#/local-orders`);
  console.log('UI: LocalOrders abierto');
  await page.getByText('Para llevar', { exact: true }).click();
  console.log('UI: selección de productos local');
  await openProduct('Combo clásico');
  await row('Combo clásico').getByRole('button', { name: 'Sumar uno' }).click();
  await edit('Combo clásico');
  console.log('UI: edición local verificada');
  await page.goto(`${base}/#/control-panel`);
  await page.getByRole('button', { name: /NUEVO PEDIDO/i }).click();
  await page.getByText('SELECCIONAR PRODUCTOS', { exact: true }).waitFor();
  console.log('UI: selector de ModalCreateOrder abierto');
  await openProduct('Combo nuevo');
  // Selector inicial: botones de cantidad en el carrito lateral.
  await row('Combo nuevo').getByRole('button').last().click();
  await edit('Combo nuevo');
  await page.getByText('SELECCIONAR PRODUCTOS', { exact: true }).waitFor();
  await page.getByRole('dialog').filter({ has: page.getByText('SELECCIONAR PRODUCTOS', { exact: true }) }).getByRole('button', { name: 'Continuar', exact: true }).last().click();
  // El resumen del pedido también permite editar cuando ya se salió del selector.
  await page.getByRole('button', { name: 'Editar Combo nuevo', exact: true }).click();
  await choice(page.getByRole('dialog').last(), 'Bacon').waitFor();
  assert.equal(await isChosen(page.getByRole('dialog').last(), 'Bacon'), true);
  fs.mkdirSync(path.resolve('test-artifacts/cart-product-editing'), { recursive: true });
  await page.screenshot({ path: path.resolve('test-artifacts/cart-product-editing/edit-modal.png'), fullPage: true, animations: 'disabled' });
  assert.deepEqual(errors, []);
  assert.equal(orderWrites, 0);
});
