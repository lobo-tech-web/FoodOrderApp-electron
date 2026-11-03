const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

test('Staff muestra encabezado, resumen de estados y filtra entregas con iconos', {
  skip: !process.env.PLAYWRIGHT_MODULE_PATH,
  timeout: 120000,
}, async t => {
  const { createServer } = await import('vite');
  const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH);
  const harness = `
    import React, { useState } from 'react';
    import { createRoot } from 'react-dom/client';
    import { MemoryRouter } from 'react-router-dom';
    import { ThemeProvider } from '@mui/material';
    import { AdminDesktopProviders } from '/src/providers/AdminDesktopProviders.jsx';
    import { useLobotechThemeContext } from '/vendor/client-src/context/lobotechThemeContext.js';
    import { StaffOrderPanel } from '/vendor/client-src/views/ControlPanel/StaffPanel/StaffOrderPanel/StaffOrderPanel.jsx';
    import { OrderTableFilters } from '/vendor/client-src/views/ControlPanel/AdminPanel/OrderPanel/OrderTableFilters/OrderTableFilters.jsx';
    function App() {
      const [status, setStatus] = useState('TODOS');
      const [type, setType] = useState('TODOS');
      const { lobotechTheme } = useLobotechThemeContext();
      const user = JSON.parse(localStorage.getItem('user'));
      return <ThemeProvider theme={lobotechTheme}>
        {location.pathname.includes('admin')
          ? <OrderTableFilters statusFilter={status} orderTypeFilter={type} statusCounts={{}} orderTypeCounts={{}}
              totalFilteredOrders={0} onStatusChange={setStatus} onOrderTypeChange={setType}
              onClearFilters={() => {setStatus('TODOS');setType('TODOS');}} />
          : <StaffOrderPanel user={user} cashRegisterId="cash"
              cashSession={{id:'session',cashRegisterId:'cash',status:'OPEN'}} showAlert={() => {}} />}
      </ThemeProvider>;
    }
    createRoot(document.getElementById('root')).render(<MemoryRouter><AdminDesktopProviders><App /></AdminDesktopProviders></MemoryRouter>);
  `;
  const virtual = path.resolve(__dirname, '__virtual_staff_filters.jsx').replaceAll('\\', '/');
  const server = await createServer({ server: { host: '127.0.0.1', port: 0 }, plugins: [{
    name: 'staff-filters-test',
    resolveId(id) { if (id === '/__staff-filters.jsx') return virtual; },
    load(id) { if (id === virtual) return harness; },
    configureServer(vite) {
      for (const endpoint of ['/__staff-filters-test', '/__admin-filters-test']) vite.middlewares.use(endpoint, async (_req, res) => {
        res.setHeader('Content-Type', 'text/html');
        res.end(await vite.transformIndexHtml(endpoint, '<div id="root"></div><script type="module" src="/__staff-filters.jsx"></script>'));
      });
    },
  }] });
  await server.listen(); t.after(() => server.close());
  const browser = await chromium.launch({ headless: true,
    ...(process.env.PLAYWRIGHT_BROWSER_PATH && { executablePath: process.env.PLAYWRIGHT_BROWSER_PATH }),
  });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1280, height: 960 } });
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const user = { id: 'staff', restaurantId: 'restaurant', role: 'staff', permissions: { orders: { read: true, updateStatus: true } } };
  const orders = [
    ['DELIVERY', 'PENDIENTE A CONFIRMAR'], ['DELIVERY', 'FINALIZADO'], ['RETIRO EN LOCAL', 'EN PREPARACIÓN'],
    ['ESPERA EN LOCAL', 'EN PREPARACIÓN'], ['CONSUMIR EN LOCAL', 'CANCELADO'], ['RETIRO EN LOCAL', 'EN PREPARACIÓN'],
  ].map(([orderType, status], index) => ({ id: String(index + 1), dailyOrderNumber: index + 1, restaurantId: 'restaurant',
    clientName: `Cliente ${index + 1}`, orderType, status, totalAmount: 1000, paymentMethod: 'EFECTIVO', cartItems: [], isPaid: false,
    orderDate: { day: '01', month: '11', year: '2026', hour: '12', minute: '00' } }));
  await page.addInitScript(user => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', `e30.${btoa(JSON.stringify({...user,exp:Date.now()/1000+864000}))}.signature`);
    window.secureStorage = localStorage; window.electronAPI = {};
  }, user);
  await page.route('**/*', async route => {
    const request = route.request();
    if (!['fetch', 'xhr'].includes(request.resourceType())) return route.continue();
    const ordersURL = server.config.env.VITE_API_ORDERS_MAIN_ROUTER;
    const body = request.method() === 'GET' && ordersURL && request.url().includes(ordersURL) ? orders : [];
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  const base = `http://127.0.0.1:${server.httpServer.address().port}`;
  await page.goto(`${base}/__staff-filters-test`);
  const panel = page.locator('[data-staff-order-panel]');
  await panel.getByText('Mostrando 6 pedidos', { exact: true }).waitFor();
  await panel.getByText('FILTROS DE PEDIDOS', { exact: true }).waitFor();
  await panel.getByText('ESTADOS DE PEDIDOS', { exact: true }).waitFor();
  const select = panel.getByRole('combobox', { name: 'Tipo de entrega' });
  const clear = panel.getByRole('button', { name: 'Limpiar filtros' });
  const checkFilterRow = async (scope) => {
    const reset = await scope.getByRole('button', { name: 'Limpiar filtros' }).boundingBox();
    const tabs = await scope.getByRole('tablist').boundingBox();
    const delivery = await scope.getByRole('combobox', { name: 'Tipo de entrega' }).boundingBox();
    assert.ok(reset.y + reset.height <= tabs.y);
    assert.ok(delivery.y + delivery.height <= tabs.y);
  };
  assert.equal(await clear.isVisible(), true);
  await clear.click();
  await checkFilterRow(panel);
  await select.click();
  assert.equal(await page.getByRole('option').count(), 5);
  for (const option of await page.getByRole('option').all()) assert.equal(await option.locator('svg').count(), 1);
  await page.getByRole('option', { name: /^Delivery/ }).click();
  await panel.getByText('Mostrando 2 pedidos', { exact: true }).waitFor();
  assert.equal(await select.locator('[data-testid="DeliveryDiningIcon"]').count(), 1);
  assert.equal(await panel.locator('tbody tr').count(), 2);
  await panel.getByRole('tab', { name: /^Pendientes/ }).click();
  await panel.getByText('Mostrando 1 pedido', { exact: true }).waitFor();
  await panel.getByText('CLIENTE 1', { exact: true }).waitFor();
  assert.equal(await panel.getByText('CLIENTE 2', { exact: true }).count(), 0);
  await panel.getByRole('button', { name: 'Limpiar filtros' }).click();
  await panel.getByText('Mostrando 6 pedidos', { exact: true }).waitFor();
  await panel.locator('tbody input[type="checkbox"]').first().check();
  assert.equal(await panel.getByRole('button', { name: 'Modificar seleccionados' }).isEnabled(), true);
  await select.click();
  await page.getByRole('option', { name: /^Retiro en local/ }).click();
  await panel.getByText('Mostrando 2 pedidos', { exact: true }).waitFor();
  assert.equal(await panel.getByRole('button', { name: 'Modificar seleccionados' }).isDisabled(), true);
  assert.equal(await panel.locator('tbody input[type="checkbox"]:checked').count(), 0);
  await panel.getByRole('tab', { name: /^Cancelados/ }).click();
  await panel.getByText('Mostrando 0 pedidos', { exact: true }).waitFor();
  await panel.getByText('NO HAY PEDIDOS CON LOS FILTROS SELECCIONADOS', { exact: true }).waitFor();
  await panel.getByRole('button', { name: 'Limpiar filtros' }).click();
  const period = panel.getByRole("combobox", { name: "Período" });
  assert.equal(await period.innerText(), "Hoy");
  await period.click();
  assert.equal(await page.getByRole("option", { name: "Historial" }).count(), 0);
  await page.getByRole("option", { name: "Este mes" }).click();
  await panel.getByText('PEDIDOS DEL MES', { exact: true }).waitFor();
  await panel.getByText('Mostrando 6 pedidos', { exact: true }).waitFor();
  await page.setViewportSize({ width: 600, height: 900 });
  await select.scrollIntoViewIfNeeded();
  const bounds = await select.boundingBox();
  assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= 601);
  await checkFilterRow(panel);
  await page.setViewportSize({ width: 390, height: 844 });
  await checkFilterRow(panel);
  assert.equal(await clear.isVisible(), true);
  fs.mkdirSync('test-artifacts/staff-order-filters', { recursive: true });
  await page.screenshot({ path: 'test-artifacts/staff-order-filters/staff-filters.png', fullPage: true, animations: 'disabled' });
  await page.goto(`${base}/__admin-filters-test`);
  await page.getByText('FILTROS DE PEDIDOS', { exact: true }).waitFor();
  assert.equal(await page.getByRole('combobox', { name: 'Tipo de entrega' }).count(), 1);
  assert.equal(await page.getByRole('button', { name: /Retiro/ }).count(), 0);
  await checkFilterRow(page);
  await page.getByRole('combobox', { name: 'Tipo de entrega' }).click();
  await page.getByRole('option', { name: /^Delivery/ }).click();
  await page.getByRole('button', { name: 'Limpiar filtros' }).click();
  assert.ok((await page.getByRole('combobox', { name: 'Tipo de entrega' }).textContent()).includes('Todas las entregas'));
  assert.deepEqual(errors, []);
});
