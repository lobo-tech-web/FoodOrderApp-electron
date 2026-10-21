const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const vm = require("node:vm");
const { createRequire } = require("node:module");
const { test } = require("node:test");
const { createTotemManager } = require("../totem-manager.js");

const apiRoot =
  process.env.FOODORDERAPP_API_PATH ||
  path.resolve(__dirname, "../../FoodOrderApp-api");
const hasBackend = fs.existsSync(
  path.join(apiRoot, "node_modules/express/package.json"),
);

const fixture = async (t) => {
  const apiRequire = createRequire(path.join(apiRoot, "package.json"));
  const adminId = "11111111-1111-4111-8111-111111111111";
  const registerId = "22222222-2222-4222-8222-222222222222";
  const deviceId = "33333333-3333-4333-8333-333333333333";
  const password = "Test-only-password";
  const admin = {
    id: adminId,
    role: "admin",
    status: true,
    password: await apiRequire("bcrypt").hash(password, 4),
  };
  let device;
  let pendingCheckout = null;
  const registers = [
    { id: registerId, restaurantId: adminId, name: "Caja principal", code: "MAIN", isActive: true },
    { id: "44444444-4444-4444-8444-444444444444", restaurantId: adminId, name: "Caja barra", code: "BARRA", isActive: true },
    { id: "55555555-5555-4555-8555-555555555555", restaurantId: adminId, name: "Caja inactiva", code: "OLD", isActive: false },
    { id: "66666666-6666-4666-8666-666666666666", restaurantId: "other-shop", isActive: true },
  ];
  const users = {
    findByPk: async () => ({
      businessName: "Test shop",
      paymentMethods: ["MERCADO PAGO"],
    }),
    unscoped: () => users,
    findOne: async ({ where }) =>
      where.id === adminId && where.role === "admin" && where.status === true
        ? admin
        : null,
  };
  const devices = {
    unscoped: () => devices,
    create: async (values) => {
      device = {
        id: deviceId,
        tokenVersion: 1,
        ...values,
        update: async (data) => Object.assign(device, data),
      };
      return device;
    },
    findByPk: async (id) => (id === deviceId ? device : null),
    findOne: async ({ where }) =>
      where.id === deviceId && where.restaurantId === adminId ? device : null,
    findAll: async () => (device ? [device] : []),
  };
  const db = {
    TotemDevice: devices,
    Users: users,
    CashRegister: {
      findOne: async ({ where }) =>
        registers.find((register) => Object.entries(where).every(([key, value]) => register[key] === value)) || null,
    },
    TotemCheckout: { findOne: async () => pendingCheckout },
    conn: {
      transaction: async (action) => action({ LOCK: { UPDATE: "UPDATE" } }),
    },
    Category: {
      findAll: async () => [
        { get: () => ({ id: "category-1", name: "Burgers", position: 1 }) },
      ],
    },
    Products: {
      findAll: async () => [
        {
          get: () => ({
            id: "product-1",
            categoryId: "category-1",
            name: "Burger",
            price: "1000.05",
            discount: "10",
            image: "https://example.com/burger.png",
            productOptions: [],
          }),
        },
      ],
    },
    CustomOption: {},
    CustomOptionItem: {},
    ProductCustomOption: {},
  };
  const cache = new Map();
  const env = {
    TOTEM_JWT_SECRET: "test-only-totem-secret-with-more-than-32-chars",
    JWT_SECRET: "test-only-admin-secret",
    JWT_EXPIRATION: "8h",
  };
  const load = (filename) => {
    if (filename === path.join(apiRoot, "src/db.js")) return db;
    if (filename === path.join(apiRoot, "src/controllers/orderController.js"))
      return {};
    if (filename === path.join(apiRoot, "src/utils/orderPaymentUtils.js"))
      return {};
    if (filename === path.join(apiRoot, "src/utils/orderUtils.js")) return {};
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const staged = path.join(
      __dirname,
      "../.totem-backend-stage",
      path.relative(apiRoot, filename),
    );
    vm.runInNewContext(
      fs.readFileSync(fs.existsSync(staged) ? staged : filename, "utf8"),
      {
        module,
        exports: module.exports,
        Buffer,
        URL,
        console,
        process: { env },
        require: (name) =>
          name.startsWith(".")
            ? load(path.resolve(path.dirname(filename), name))
            : apiRequire(name),
      },
      { filename },
    );
    return module.exports;
  };
  const auth = load(path.join(apiRoot, "src/controllers/auth.js"));
  const controllers = load(
    path.join(apiRoot, "src/controllers/totemDeviceController.js"),
  );
  const express = apiRequire("express");
  const app = express();
  app.use(express.json());
  app.use(
    "/main-route-totem",
    load(path.join(apiRoot, "src/routes/totemDeviceRouter.js")),
  );
  const server = await new Promise((resolve) => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
  });
  t.after(
    () =>
      new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections();
      }),
  );
  const storage = fs.mkdtempSync(
    path.join(os.tmpdir(), "lobotech-totem-test-"),
  );
  t.after(() => {
    const credentialFile = path.join(storage, "secure-totem.json");
    if (fs.existsSync(credentialFile)) fs.unlinkSync(credentialFile);
    fs.rmdirSync(storage);
  });
  const baseURL = `http://127.0.0.1:${server.address().port}/main-route-totem`;
  const manager = createTotemManager(
    { getPath: () => storage },
    {
      isEncryptionAvailable: () => true,
      encryptString: (value) => Buffer.from(value),
      decryptString: (value) => value.toString(),
    },
    { apiURL: baseURL, isDevelopment: true },
  );
  const pairing = await controllers.registerTotemDeviceController(
    { name: "Test totem", cashRegisterId: registerId },
    admin,
  );
  return {
    manager,
    controllers,
    auth,
    admin,
    pairing,
    password,
    baseURL,
    device: () => device,
    registers,
    setPendingCheckout: (checkout) => { pendingCheckout = checkout; },
  };
};

test(
  "Electron and the regrouped backend support pairing, authenticated catalog and admin-authorized exit",
  { skip: !hasBackend },
  async (t) => {
    const flow = await fixture(t);
    assert.equal((await flow.manager.getStatus()).linked, false);
    const activation = await flow.manager.activate({
      deviceId: flow.pairing.device.id,
      pairingCode: flow.pairing.pairingCode,
    });
    assert.equal(activation.ok, true);
    assert.equal("deviceSecret" in activation, false);
    assert.equal("token" in activation, false);
    assert.equal((await flow.manager.getStatus()).linked, true);
    const catalog = await flow.manager.getCatalog();
    assert.equal(catalog.ok, true);
    assert.equal(catalog.catalog.products[0].displayPrice, 900.05);
    assert.equal((await flow.manager.authorizeExit("incorrect")).status, 403);
    assert.equal((await flow.manager.authorizeExit(flow.password)).ok, true);
    const reuse = await flow.manager.activate({
      deviceId: flow.pairing.device.id,
      pairingCode: flow.pairing.pairingCode,
    });
    assert.equal(reuse.status, 401);
  },
);

test("admins can reassign a totem only to an active local register without pending purchases", { skip: !hasBackend }, async (t) => {
  const flow = await fixture(t);
  const id = flow.device().id;
  const nextRegister = flow.registers[1];
  const change = (cashRegisterId, user = flow.admin) => flow.controllers.configureTotemCashRegisterController(id, { cashRegisterId }, user);
  await assert.rejects(change(nextRegister.id, { ...flow.admin, role: "staff" }), { status: 403 });
  await assert.rejects(change(nextRegister.id, { ...flow.admin, id: "other-shop" }), { status: 404 });
  await assert.rejects(change(flow.registers[2].id), { status: 400 });
  await assert.rejects(change(flow.registers[3].id), { status: 400 });
  await assert.rejects(change("invalid"), { status: 400 });
  flow.setPendingCheckout({ id: "pending", acknowledgedAt: null });
  await assert.rejects(change(nextRegister.id), { status: 409 });
  assert.equal(flow.device().cashRegisterId, flow.registers[0].id);
  flow.setPendingCheckout(null);
  const endpoint = `${flow.baseURL}/devices/${id}/cash-register`;
  const request = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cashRegisterId: nextRegister.id }) };
  assert.equal((await fetch(endpoint, request)).status, 401);
  const response = await fetch(endpoint, { ...request, headers: { ...request.headers, Authorization: `Bearer ${flow.auth.generateToken({ id: flow.admin.id, role: "admin" })}` } });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).device.cashRegisterId, nextRegister.id);
  assert.equal(flow.device().cashRegisterId, nextRegister.id);
});

test(
  "regenerated pairing invalidates an already linked Electron device",
  { skip: !hasBackend },
  async (t) => {
    const flow = await fixture(t);
    await flow.manager.activate({
      deviceId: flow.pairing.device.id,
      pairingCode: flow.pairing.pairingCode,
    });
    await flow.controllers.changeTotemAccessController(
      flow.pairing.device.id,
      flow.admin,
      "PAIR",
    );
    const response = await flow.manager.getCatalog();
    assert.equal(response.ok, false);
    assert.equal(response.status, 401);
    // El administrador puede cerrar un equipo revocado para volver a configurarlo.
    assert.equal((await flow.manager.authorizeExit(flow.password)).ok, true);
  },
);

test(
  "backend protects admin device routes and limits password attempts",
  { skip: !hasBackend },
  async (t) => {
    const flow = await fixture(t);
    const unauthorized = await fetch(`${flow.baseURL}/devices`);
    assert.equal(unauthorized.status, 401);
    const authorized = await fetch(`${flow.baseURL}/devices`, {
      headers: {
        Authorization: `Bearer ${flow.auth.generateToken({ id: flow.admin.id, role: "admin" })}`,
      },
    });
    assert.equal(authorized.status, 200);
    assert.equal(authorized.headers.get("cache-control"), "no-store");
    assert.equal("pairingCodeHash" in (await authorized.json())[0], false);
    for (let i = 0; i < 5; i += 1) {
      const result = await fetch(`${flow.baseURL}/maintenance/authorize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: flow.pairing.device.id,
          password: "incorrect",
        }),
      });
      assert.equal(result.status, 403);
      await result.arrayBuffer();
    }
    const limited = await fetch(`${flow.baseURL}/maintenance/authorize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId: flow.pairing.device.id,
        password: flow.password,
      }),
    });
    assert.equal(limited.status, 429);
    await limited.arrayBuffer();
  },
);
