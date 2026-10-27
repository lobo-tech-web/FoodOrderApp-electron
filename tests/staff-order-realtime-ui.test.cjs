const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createServer: httpServer } = require("node:http");
const { createRequire } = require("node:module");
const path = require("node:path");

test("staff receives live orders and protects creation, selection, payment and bulk saves", {
  skip: !process.env.PLAYWRIGHT_MODULE_PATH, timeout: 120000,
}, async t => {
  const backend = createRequire(path.resolve(__dirname, "../../FoodOrderApp-api/package.json"));
  const { attachOrderRealtime } = backend("./src/realtime/orderRealtime.js");
  const jwt = backend("jsonwebtoken");
  const { createServer } = await import("vite");
  const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH);
  const user = { id: "staff-test", restaurantId: "restaurant-test", role: "staff", staffRole: "cashier",
    status: true, businessName: "Local test", paymentMethods: ["EFECTIVO"], enabledOrderTypes: ["ESPERA EN LOCAL"],
    permissions: { orders: { read: true, create: true, updateStatus: true, edit: true, markPaid: true } } };
  const hooks = new Map();
  const secret = "staff-realtime-ui-test-not-production";
  const http = httpServer();
  const realtime = attachOrderRealtime({ httpServer: http, jwtSecret: secret,
    Orders: { addHook: (name, _label, fn) => hooks.set(name, fn), removeHook: name => hooks.delete(name) },
    Users: { findOne: async () => ({ id: user.restaurantId }) },
    RestaurantStaff: { findOne: async () => user },
  });
  t.after(() => realtime.close());
  await new Promise(resolve => http.listen(0, "127.0.0.1", resolve));
  const harness = `
    import React, { useState } from "react";
    import { createRoot } from "react-dom/client";
    import { MemoryRouter } from "react-router-dom";
    import { ThemeProvider } from "@mui/material";
    import { AdminDesktopProviders } from "/src/providers/AdminDesktopProviders.jsx";
    import { useLobotechThemeContext } from "/vendor/client-src/context/lobotechThemeContext.js";
    import { useAlert } from "/vendor/client-src/hooks/Alert.jsx";
    import { StaffOrderPanel } from "/vendor/client-src/views/ControlPanel/StaffPanel/StaffOrderPanel/StaffOrderPanel.jsx";
    function App() {
      const user = JSON.parse(localStorage.getItem("user"));
      const [view, setView] = useState(1);
      const [cashOpen, setCashOpen] = useState(true);
      window.staffControls = { setView, setCashOpen };
      const { lobotechTheme } = useLobotechThemeContext();
      const { showAlert, AlertComponent } = useAlert();
      return <ThemeProvider theme={lobotechTheme}><StaffOrderPanel user={user} externalView={view}
        cashRegisterId="cash-test" cashSession={cashOpen ? {id: "session-test", cashRegisterId: "cash-test", status: "OPEN"} : null}
        showAlert={showAlert} />{AlertComponent}</ThemeProvider>;
    }
    createRoot(document.getElementById("root")).render(<MemoryRouter><AdminDesktopProviders><App /></AdminDesktopProviders></MemoryRouter>);
  `;
  const virtual = path.resolve(__dirname, "__virtual_staff.jsx").replaceAll("\\", "/");
  const server = await createServer({ server: { host: "127.0.0.1", port: 0 },
    define: { "import.meta.env.VITE_ORDERS_SOCKET_URL": JSON.stringify(`http://127.0.0.1:${http.address().port}`) },
    plugins: [{ name: "staff-live-test", resolveId(id) { if (id === "/__staff.jsx") return virtual; },
      load(id) { if (id === virtual) return harness; },
      configureServer(vite) {
        vite.middlewares.use("/__staff-test", async (_req, res) => {
          res.setHeader("Content-Type", "text/html");
          res.end(await vite.transformIndexHtml("/__staff-test", '<div id="root"></div><script type="module" src="/__staff.jsx"></script>'));
        });
      },
    }],
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
  const orders = [];
  const addOrder = (id, clientName) => {
    const order = { id, dailyOrderNumber: id, clientName, restaurantId: user.restaurantId,
      status: "EN PREPARACIÓN", orderType: "ESPERA EN LOCAL", totalAmount: 1000, paymentMethod: "EFECTIVO",
      isPaid: false, totalRewardPoints: 0, totalRedeemPoints: 0, cartItems: [],
      orderDate: { day: "26", month: "10", year: "2026", hour: "12", minute: "00" } };
    orders.push(order);
    hooks.get("afterCreate")(order, {});
  };
  addOrder(1, "Inicial staff");
  let loads = 0, failBulk = true;
  const queries = [];
  await page.route("**/*", async route => {
    const request = route.request();
    if (!["fetch", "xhr"].includes(request.resourceType())) return route.continue();
    let body = [], status = 200;
    if (request.method() === "PUT" && request.url().includes(server.config.env.VITE_API_ORDERS_PUT_ARRAY_ROUTER)) {
      if (failBulk) { status = 409; body = {message: "Error masivo de prueba"}; }
      else {
        const data = request.postDataJSON().ordersData;
        assert.equal(data.cashRegisterId, "cash-test");
        orders.forEach(order => { if (data.orderList.some(item => item.id === order.id)) order.status = data.status; });
        body = {ok:true};
      }
    } else if (request.method() === "PUT" && request.url().includes(server.config.env.VITE_API_ORDERS_PUT_ROUTER)) {
      status = 409;
      body = { message: "Error de cobro staff" };
    } else if (request.url().includes(server.config.env.VITE_API_ORDERS_MAIN_ROUTER)) {
      loads++;
      queries.push(new URL(request.url()));
      body = orders;
    }
    await route.fulfill({status, contentType: "application/json", body: JSON.stringify(body)});
  });
  await page.addInitScript(({user, token}) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    window.secureStorage = localStorage;
    window.electronAPI = {};
  }, {user, token: jwt.sign(user, secret, {expiresIn: "1h"})});
  await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/__staff-test`);
  const panel = page.locator("[data-staff-order-panel]");
  const indicator = panel.getByRole("status");
  await panel.getByText("INICIAL STAFF", {exact:true}).waitFor();
  await indicator.getByText("Los pedidos se actualizan automáticamente", {exact:true}).waitFor();
  assert.equal(await indicator.getByRole("button").count(), 0);
  addOrder(2, "Web staff");
  await panel.getByText("WEB STAFF", {exact:true}).waitFor();

  const selected = panel.locator('tbody input[type="checkbox"]').first();
  await selected.check();
  const beforeSelection = loads;
  addOrder(3, "Totem staff");
  await indicator.getByRole("button", {name: "Cargar cambios de pedidos"}).waitFor();
  assert.equal(loads, beforeSelection);
  assert.equal(await selected.isChecked(), true);
  await panel.getByRole("button", {name: "Modificar seleccionados"}).click();
  let dialog = page.getByRole("dialog");
  await dialog.getByRole("button", {name: /^FINALIZADO/}).click();
  await dialog.getByRole("button", {name: "Guardar Cambios", exact:true}).click();
  await page.getByText("Error masivo de prueba", {exact:true}).waitFor();
  assert.equal(await selected.isChecked(), true);
  failBulk = false;
  await dialog.getByRole("button", {name: "Guardar Cambios", exact:true}).click();
  await dialog.waitFor({state: "hidden"});
  await panel.getByText("TOTEM STAFF", {exact:true}).waitFor();
  assert.equal(await panel.getByRole("button", {name: "Modificar seleccionados"}).isDisabled(), true);

  await panel.getByRole("button", {name: "Nuevo pedido", exact:true}).click();
  await page.getByRole("dialog").last().getByRole("button", {name: "Cancelar", exact:true}).click();
  dialog = page.getByRole("dialog").filter({has:page.getByText("CREAR NUEVO PEDIDO", {exact:true})});
  const draft = dialog.getByPlaceholder("Ingresa el nombre del cliente", {exact:true});
  await draft.fill("Borrador staff protegido");
  const beforeDraft = loads;
  addOrder(4, "Electron staff");
  await panel.locator('[aria-label="Cargar cambios de pedidos"]').waitFor({state: "attached"});
  assert.equal(loads, beforeDraft);
  assert.equal(await draft.inputValue(), "Borrador staff protegido");
  await page.keyboard.press("Escape");
  await page.getByRole("button", {name: "Descartar cambios", exact:true}).click();
  await panel.getByText("ELECTRON STAFF", {exact:true}).waitFor();

  await panel.locator('[aria-label="Marcar pedido como pagado"] button').first().click();
  dialog = page.getByRole("dialog");
  await dialog.waitFor();
  const beforePayment = loads;
  addOrder(5, "Durante pago staff");
  await panel.locator('[aria-label="Cargar cambios de pedidos"]').waitFor({state: "attached"});
  assert.equal(loads, beforePayment);
  await dialog.getByRole("button", { name: "MARCAR PAGADO", exact: true }).click();
  await page.getByText("Error de cobro staff", { exact: true }).waitFor();
  assert.equal(await dialog.isVisible(), true);
  assert.equal(loads, beforePayment);
  await dialog.getByRole("button", {name: "Cancelar", exact:true}).click();
  await panel.getByText("DURANTE PAGO STAFF", {exact:true}).waitFor();
  const monthResponse = page.waitForResponse(response => {
    const url = new URL(response.url());
    return url.pathname.includes(server.config.env.VITE_API_ORDERS_MAIN_ROUTER) && url.searchParams.get("day") === "";
  });
  await page.evaluate(() => window.staffControls.setView(11));
  await monthResponse;
  await panel.getByText("PEDIDOS DEL MES", {exact:true}).waitFor();
  assert.equal(queries.at(-1).searchParams.get("day"), "");
  assert.equal(queries.at(-1).searchParams.get("restaurantId"), user.restaurantId);
  await page.evaluate(() => window.staffControls.setCashOpen(false));
  assert.equal(await panel.getByRole("button", {name: "Nuevo pedido", exact:true}).isDisabled(), true);
  addOrder(6, "Consulta caja cerrada");
  await panel.getByText("CONSULTA CAJA CERRADA", {exact:true}).waitFor();
  await panel.evaluate(element => { element.scrollTop = 0; });
  await page.screenshot({path:"test-artifacts/staff-order-realtime.png", fullPage:true});
  assert.deepEqual(errors, []);
});
