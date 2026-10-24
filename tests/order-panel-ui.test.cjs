const assert = require("node:assert/strict");
const path = require("node:path");
const { test, before, after } = require("node:test");
const enabled = Boolean(process.env.PLAYWRIGHT_MODULE_PATH);
let server, browser, base;
const harness = `
import React, { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { useOrderPanelData } from "/vendor/client-src/hooks/useOrderPanelData.js";
import { useAutoRefresh } from "/vendor/client-src/hooks/AutoRefreshOrders.jsx";
window.loads = [];
window.polls = [];
const loadOrders = (query) => new Promise((resolve) => window.loads.push({ query, resolve }));
const loadRiders = async () => [];
function App() {
  const [query, setQuery] = useState({ restaurantId: "local", mode: "date", period: "day", date: "2026-10-20" });
  const [autoRefreshEnabled, setAuto] = useState(true);
  const [pollEnabled, setPoll] = useState(false);
  const data = useOrderPanelData({ query, loadOrders, loadRiders, autoRefreshEnabled, onError: (error) => { throw error; } });
  useAutoRefresh(() => new Promise((resolve) => window.polls.push(resolve)), 1000, { enabled: pollEnabled });
  window.control = { ...data, setQuery, setAuto, setPoll };
  return React.createElement("pre", { id: "state" }, JSON.stringify({ orders: data.orders, protected: data.isProtected, pending: data.pendingUpdates }));
}
createRoot(document.getElementById("root")).render(React.createElement(StrictMode, null, React.createElement(App)));
`;

before(async () => {
  if (!enabled) return;
  const { createServer } = await import("vite");
  const virtual = path.resolve(__dirname, "__virtual_orders.jsx").replaceAll("\\", "/");
  server = await createServer({ server: { host: "127.0.0.1", port: 0 }, plugins: [{
    name: "orders-test-harness",
    resolveId(id) { if (id === "/__orders_harness.jsx") return virtual; },
    load(id) { if (id === virtual) return harness; },
    configureServer(vite) {
      vite.middlewares.use("/__order-test-page", async (_req, res) => {
        res.setHeader("Content-Type", "text/html");
        res.end(await vite.transformIndexHtml("/__order-test-page", '<div id="root"></div><script type="module" src="/__orders_harness.jsx"></script>'));
      });
    },
  }] });
  await server.listen();
  base = `http://127.0.0.1:${server.httpServer.address().port}`;
  const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH);
  browser = await chromium.launch({ headless: true,
    ...(process.env.PLAYWRIGHT_BROWSER_PATH && { executablePath: process.env.PLAYWRIGHT_BROWSER_PATH }),
  });
});
after(async () => { await browser?.close(); await server?.close(); });

const waitLoads = (page, count) => page.waitForFunction((count) => window.loads?.length === count, count);
const resolveLoad = (page, index, name) => page.evaluate(({ index, name }) => window.loads[index].resolve([{ id: name }]), { index, name });

test("order list serializes requests, protects forms, preserves manual pause and rejects stale responses in StrictMode", { skip: !enabled, timeout: 120000 }, async (t) => {
  const page = await browser.newPage();
  t.after(() => page.close());
  await page.goto(`${base}/__order-test-page`);
  await waitLoads(page, 1);
  await resolveLoad(page, 0, "strict-discard");
  await waitLoads(page, 2);
  await resolveLoad(page, 1, "initial");
  await page.waitForFunction(() => window.control.orders[0]?.id === "initial");

  await page.evaluate(() => window.control.refresh());
  await waitLoads(page, 3);
  await page.evaluate(() => {
    window.control.setInteractionBlocked("create", true);
    window.control.setInteractionBlocked("payment", true);
    window.control.setAuto(false);
  });
  await resolveLoad(page, 2, "late");
  await page.waitForFunction(() => !window.control.isRefreshing);
  assert.equal(await page.evaluate(() => window.control.orders[0].id), "initial");
  await page.evaluate(() => window.control.setInteractionBlocked("create", false));
  assert.equal(await page.evaluate(() => window.loads.length), 3);
  await page.evaluate(() => window.control.setInteractionBlocked("payment", false));
  await waitLoads(page, 4); // An explicitly requested refresh runs even with automatic updates paused.
  await resolveLoad(page, 3, "saved");
  await page.waitForFunction(() => window.control.orders[0]?.id === "saved");

  await page.evaluate(() => {
    window.control.setInteractionBlocked("edit", true);
    window.control.refresh({ automatic: true });
    window.control.setInteractionBlocked("edit", false);
  });
  await page.waitForFunction(() => !window.control.isProtected);
  assert.equal(await page.evaluate(() => window.loads.length), 4);
  await page.evaluate(() => window.control.setAuto(true));
  await waitLoads(page, 5);
  await page.evaluate(() => window.control.setQuery({ restaurantId: "local", mode: "date", period: "month", date: "2026-09-01" }));
  await resolveLoad(page, 4, "wrong-period");
  await waitLoads(page, 6);
  assert.equal(await page.evaluate(() => window.control.orders.length), 0);
  assert.equal(await page.evaluate(() => window.loads[5].query.date), "2026-09-01");
  await resolveLoad(page, 5, "september");
  await page.waitForFunction(() => window.control.orders[0]?.id === "september");

  await page.clock.install();
  await page.evaluate(() => window.control.setPoll(true));
  await page.clock.runFor(1100);
  assert.equal(await page.evaluate(() => window.polls.length), 1);
  await page.clock.runFor(5000);
  assert.equal(await page.evaluate(() => window.polls.length), 1);
  await page.evaluate(() => window.polls[0](true));
  await page.clock.runFor(2500);
  assert.equal(await page.evaluate(() => window.polls.length), 2);
});

test("admin date picker and independent name search preserve filters and open forms during refresh", { skip: !enabled, timeout: 120000 }, async (t) => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  t.after(() => page.close());
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const requests = [];
  let held = null;
  let holdNext = false;
  let failUpdates = false;
  const order = {
    id: 123, dailyOrderNumber: 1, clientName: "Ana de prueba", clientEmail: "ana@example.com", contactPhone: "11223344",
    restaurantId: "admin-test", orderType: "ESPERA EN LOCAL", status: "EN PREPARACIÓN", totalAmount: 1000,
    totalRewardPoints: 0, totalRedeemPoints: 0, paymentMethod: "EFECTIVO", isPaid: false,
    cartItems: [], orderDate: { day: "20", month: "10", year: "2026", hour: "12", minute: "00" },
  };
  await page.route("**/*", async (route) => {
    if (!["fetch", "xhr"].includes(route.request().resourceType())) return route.continue();
    const url = new URL(route.request().url());
    let body = [];
    let status = 200;
    if (url.pathname.includes("main-route-orders")) {
      requests.push(url);
      if (holdNext) { holdNext = false; await new Promise((resolve) => { held = resolve; }); }
      body = [order];
      if (route.request().method() === "PUT" && failUpdates) {
        status = 409;
        body = { message: "No se pudo registrar el pago de prueba" };
      }
    }
    await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
  });
  await page.addInitScript(() => {
    const user = { id: "admin-test", role: "admin", status: true, businessName: "Local test", enabledOrderTypes: ["ESPERA EN LOCAL"], paymentMethods: ["EFECTIVO"] };
    const token = `e30.${btoa(JSON.stringify({ ...user, exp: Date.now() / 1000 + 864000 }))}.signature`;
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    window.secureStorage = localStorage;
    window.electronAPI = {};
    window.totemAPI = { registerThemes: async () => ({ ok: true }), getRuntime: async () => ({ ok: true, mode: "admin" }) };
  });
  await page.goto(`${base}/#/control-panel`);
  const panel = page.locator("[data-order-panel]");
  try {
    await panel.getByText("ANA DE PRUEBA", { exact: true }).waitFor({ timeout: 10000 });
  } catch (error) {
    console.log({ errors, requests: requests.map(String), body: (await page.locator("body").innerText()).slice(-2500) });
    throw error;
  }
  const date = panel.getByRole("textbox", { name: "Fecha de pedidos" });
  await date.fill("31-02-2026");
  assert.equal(await panel.getByRole("button", { name: "Filtrar fecha", exact: true }).isDisabled(), true);
  await date.fill("20-10-2026");
  await panel.getByRole("button", { name: "Filtrar fecha", exact: true }).click();
  await page.waitForFunction(() => !document.querySelector('button[aria-label="Actualizar pedidos"]').disabled);
  assert.equal(requests.at(-1).searchParams.get("day"), "20");
  await panel.getByRole("button", { name: "Actualizar pedidos", exact: true }).click();
  await page.waitForFunction(() => !document.querySelector('button[aria-label="Actualizar pedidos"]').disabled);
  assert.equal(requests.at(-1).searchParams.get("day"), "20");

  await panel.getByRole("textbox", { name: "Nombre o teléfono" }).fill("Ana");
  await panel.getByRole("button", { name: "Buscar pedidos", exact: true }).click();
  await panel.getByText("Búsqueda por nombre o teléfono en todo el historial, sin filtro de fecha.").waitFor();
  await page.waitForFunction(() => !document.querySelector('button[aria-label="Actualizar pedidos"]').disabled);
  assert.equal(requests.at(-1).searchParams.get("clientName"), "Ana");
  await panel.getByRole("textbox", { name: "Nombre o teléfono" }).fill("11223344");
  await panel.getByRole("button", { name: "Buscar pedidos", exact: true }).click();
  await page.waitForFunction(() => !document.querySelector('button[aria-label="Actualizar pedidos"]').disabled);
  assert.equal(requests.at(-1).searchParams.get("contactPhone"), "11223344");
  assert.equal(requests.at(-1).searchParams.has("day"), false);
  await panel.getByRole("button", { name: "Actualizar pedidos", exact: true }).click();
  await page.waitForFunction(() => !document.querySelector('button[aria-label="Actualizar pedidos"]').disabled);
  assert.equal(requests.at(-1).searchParams.get("contactPhone"), "11223344");
  await panel.getByRole("button", { name: "Limpiar búsqueda", exact: true }).click();
  await panel.getByText("ANA DE PRUEBA", { exact: true }).waitFor();
  await page.waitForFunction(() => !document.querySelector('button[aria-label="Actualizar pedidos"]').disabled);
  assert.equal(requests.at(-1).searchParams.get("day"), "20");

  assert.equal(await panel.getByRole("combobox", { name: "Período" }).count(), 0);
  assert.equal(await panel.getByRole("button", { name: "Buscar pedidos", exact: true }).innerText(), "");
  assert.equal(await panel.getByRole("button", { name: "Filtrar fecha", exact: true }).innerText(), "");
  assert.equal(await panel.locator(".MuiInputAdornment-positionEnd").getByRole("button", { name: "Buscar pedidos", exact: true }).count(), 1);
  const filterBounds = await panel.getByRole("button", { name: "Filtrar fecha", exact: true }).boundingBox();
  const toolbarBounds = await panel.locator(".MuiToolbar-root").first().boundingBox();
  assert.ok(Math.abs(filterBounds.x + filterBounds.width - toolbarBounds.x - toolbarBounds.width + 16) < 2);
  await page.getByRole("button", { name: "Pedidos", exact: true }).click();
  await page.getByRole("button", { name: "Este Mes", exact: true }).click();
  await page.waitForFunction(() => !document.querySelector('button[aria-label="Actualizar pedidos"]').disabled);
  assert.equal(requests.at(-1).searchParams.get("day"), "");
  assert.equal(requests.at(-1).searchParams.get("month"), "10");
  await panel.getByRole("textbox", { name: "Mes de pedidos" }).waitFor();
  await page.getByRole("button", { name: "Historial", exact: true }).click();
  await page.waitForFunction(() => !document.querySelector('button[aria-label="Actualizar pedidos"]').disabled);
  assert.equal(await panel.getByRole("button", { name: "Filtrar fecha", exact: true }).count(), 0);
  assert.equal(requests.at(-1).searchParams.has("day"), false);
  await page.getByRole("button", { name: "Hoy", exact: true }).click();
  await page.waitForFunction(() => !document.querySelector('button[aria-label="Actualizar pedidos"]').disabled);
  await panel.getByRole("button", { name: "Pausar auto-actualización", exact: true }).click();
  await panel.getByRole("checkbox").nth(1).check();

  holdNext = true;
  await panel.getByRole("button", { name: "Actualizar pedidos", exact: true }).click();
  try {
    await page.waitForFunction(() => document.querySelector('button[aria-label="Actualizar pedidos"]').disabled, null, { timeout: 5000 });
  } catch (error) {
    console.log({ holdNext, held: Boolean(held), requests: requests.map(String), errors, body: (await panel.innerText()).slice(0, 800) });
    throw error;
  }
  await panel.getByRole("button", { name: "Nuevo Pedido", exact: true }).click();
  await page.getByRole("dialog").last().getByRole("button", { name: "Cancelar", exact: true }).click();
  const dialog = page.getByRole("dialog").filter({ has: page.getByText("CREAR NUEVO PEDIDO", { exact: true }) });
  await dialog.waitFor();
  const draftName = dialog.getByPlaceholder("Ingresa el nombre del cliente", { exact: true });
  await draftName.fill("Borrador protegido");
  held();
  await page.waitForFunction(() => !document.querySelector('[aria-label="Actualizando pedidos"]') || getComputedStyle(document.querySelector('[aria-label="Actualizando pedidos"]')).visibility === "hidden");
  assert.equal(await dialog.isVisible(), true);
  assert.equal(await draftName.inputValue(), "Borrador protegido");
  await page.screenshot({ path: "test-artifacts/order-panel-protected.png", fullPage: true });
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Descartar cambios", exact: true }).click();
  await dialog.waitFor({ state: "hidden" });
  await page.waitForFunction(() => !document.querySelector('button[aria-label="Actualizar pedidos"]').disabled);
  assert.equal(await panel.getByRole("button", { name: "Activar auto-actualización", exact: true }).count(), 1);
  assert.equal(await panel.getByRole("checkbox").nth(1).isChecked(), true);
  // A failed payment keeps its dialog protected and does not resume a manual pause.
  failUpdates = true;
  await panel.locator('[aria-label="Marcar pedido como pagado"] button').click();
  const paymentDialog = page.getByRole("dialog");
  await paymentDialog.getByRole("button", { name: "MARCAR PAGADO", exact: true }).click();
  await page.getByText("No se pudo registrar el pago de prueba", { exact: true }).waitFor();
  assert.equal(await paymentDialog.isVisible(), true);
  await paymentDialog.getByRole("button", { name: "Cancelar", exact: true }).click();
  await paymentDialog.waitFor({ state: "hidden" });
  assert.equal(await panel.getByRole("button", { name: "Activar auto-actualización", exact: true }).count(), 1);
  assert.deepEqual(errors, []);
});
