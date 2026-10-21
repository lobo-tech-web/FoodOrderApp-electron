const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const { test } = require("node:test");
const { createRequire } = require("node:module");
const apiRoot = path.resolve(__dirname, "../../FoodOrderApp-api");
const apiRequire = createRequire(path.join(apiRoot, "package.json"));
const fail = (status, message) => {
  throw Object.assign(new Error(message), { status });
};
const uuid = () => crypto.randomUUID();

const fixture = () => {
  const restaurantId = uuid();
  const device = {
    id: uuid(),
    restaurantId,
    cashRegisterId: uuid(),
    pointTerminalId: "POINT_TEST",
  };
  const customer = {
    id: uuid(),
    role: "user",
    cuit: "20329642330",
    name: "Cliente",
    email: "test@example.com",
    address: "Dirección larga",
    phone: "123",
  };
  const row = (data) =>
    Object.assign(data, {
      async update(values) {
        Object.assign(this, values);
        return this;
      },
      toJSON() {
        const { update, toJSON, ...values } = this;
        return values;
      },
    });
  const balance = row({ points: 200 });
  const checkouts = [];
  const orders = [];
  const payments = [];
  let providerStatus = "created";
  let providerAmount = "10.10";
  let createCalls = 0;
  let missingCash = false;
  let providerError = false;
  let requestedRegisterId;
  const session = { id: uuid(), restaurantId, status: "OPEN" };
  const catalog = {
    restaurant: { businessName: "Local", paymentMethods: ["MERCADO PAGO"] },
    products: [
      {
        id: "burger",
        name: "Burger",
        displayPrice: 10.1,
        rewardPoints: 5,
        redeemPoints: 0,
        allowComment: true,
        customOptions: [
          {
            id: "size",
            name: "Tamaño",
            type: "unique",
            required: true,
            items: [{ id: "simple", name: "Simple", extraCost: 0 }],
          },
        ],
      },
    ],
  };
  const match = (entry, where) =>
    Object.entries(where).every(([key, value]) => entry[key] === value);
  const db = {
    conn: {
      transaction: async (action) => action({ LOCK: { UPDATE: "UPDATE" } }),
    },
    TotemCheckout: {
      findOne: async ({ where }) =>
        checkouts.find((entry) => match(entry, where)) || null,
      findByPk: async (id) => checkouts.find((entry) => entry.id === id),
      create: async (values) => {
        const entry = row({ id: uuid(), acknowledgedAt: null, ...values });
        checkouts.push(entry);
        return entry;
      },
    },
    Users: {
      findOne: async ({ where }) =>
        where.cuit === customer.cuit && where.role === "user" && where.status === true ? customer : null,
    },
    UserPoints: { findOne: async () => balance },
    Orders: {
      sequelize: { query: async () => {} },
      findByPk: async (id) => orders.find((entry) => entry.id === id),
    },
    CashRegisterSession: {
      findOne: async ({ where }) => {
        requestedRegisterId = where.cashRegisterId;
        return missingCash ? null : session;
      },
    },
  };
  const auth = {
    fail,
    validateDeviceId: (id) => {
      if (!/^[0-9a-f-]{36}$/i.test(id)) fail(400, "Invalid id");
    },
    getActiveDevice: async () => device,
  };
  const point = {
    getPointAccount: () => ({ accessToken: "test-token" }),
    createPointOrder: async (checkout) => {
      createCalls++;
      if (providerError) fail(503, "Provider unavailable");
      return { id: `provider_${checkout.id}` };
    },
    getPointOrder: async (checkout) => ({
      id: checkout.providerOrderId,
      type: "point",
      external_reference: checkout.id,
      config: { point: { terminal_id: "POINT_TEST" } },
      status: providerStatus,
      transactions: {
        payments: [
          {
            id: "payment_123",
            status: providerStatus,
            status_detail: "accredited",
            amount: providerAmount,
          },
        ],
      },
    }),
    cancelPointOrder: async () => {
      providerStatus = "canceled";
    },
    verifyPointWebhook() {},
  };
  const cache = new Map();
  const mocks = {
    "src/db.js": db,
    "src/utils/totemAuthUtils.js": auth,
    "src/utils/mercadoPagoPoint.js": point,
    "src/controllers/totemCatalogController.js": {
      getTotemCatalogController: async () => catalog,
    },
    "src/controllers/orderController.js": {
      createOrderController: async (data, actor, options) => {
        assert.equal(actor.role, "totem");
        assert.ok(options.transaction);
        assert.equal(data.isPaid, false);
        const order = row({
          ...data,
          id: orders.length + 1,
          dailyOrderNumber: orders.length + 1,
        });
        balance.points += data.totalRewardPoints - data.totalRedeemPoints;
        orders.push(order);
        return order;
      },
    },
    "src/utils/orderPaymentUtils.js": {
      registerSingleOrderPayment: async (data) => {
        const payment = row(data);
        payments.push(payment);
        return { payment };
      },
    },
    "src/utils/orderUtils.js": { createOrderAuditLog: async () => {} },
  };
  const load = (relative) => {
    if (mocks[relative]) return mocks[relative];
    if (cache.has(relative)) return cache.get(relative);
    const staged = path.join(__dirname, "../.totem-backend-stage", relative);
    const filename = fs.existsSync(staged)
      ? staged
      : path.join(apiRoot, relative);
    const module = { exports: {} };
    vm.runInNewContext(
      fs.readFileSync(filename, "utf8"),
      {
        module,
        exports: module.exports,
        Buffer,
        URL,
        process,
        require: (name) =>
          name.startsWith(".")
            ? load(
                path
                  .relative(
                    apiRoot,
                    path.resolve(apiRoot, path.dirname(relative), name),
                  )
                  .replaceAll("\\", "/"),
              )
            : apiRequire(name),
      },
      { filename },
    );
    cache.set(relative, module.exports);
    return module.exports;
  };
  const controller = load("src/controllers/totemCheckoutController.js");
  const input = {
    clientRequestId: uuid(),
    clientName: "Cliente invitado",
    expectedTotal: 10.1,
    orderType: "ESPERA EN LOCAL",
    cartItems: [
      {
        productId: "burger",
        quantity: 1,
        customOptions: [{ optionId: "size", itemId: "simple", quantity: 1 }],
        productComment: "Sin sal",
      },
    ],
  };
  return {
    controller,
    device,
    input,
    orders,
    payments,
    checkouts,
    balance,
    catalog,
    customer,
    normalize: load("src/utils/totemCart.js").normalizeTotemCart,
    paid: () => {
      providerStatus = "processed";
      checkouts.forEach((entry) => {
        entry.lastProviderCheckAt = null;
      });
    },
    wrongAmount: () => {
      providerAmount = "0.01";
    },
    providerError: () => {
      providerError = true;
    },
    missingCash: () => {
      missingCash = true;
    },
    openCash: () => {
      missingCash = false;
    },
    createCalls: () => createCalls,
    requestedRegisterId: () => requestedRegisterId,
  };
};

test("customer lookup and checkout require a numeric CUIT string and do not accept account numbers", async () => {
  const f = fixture();
  const found = await f.controller.findTotemCustomerController(f.device, f.customer.cuit);
  assert.equal(found.found, true);
  assert.equal(found.customer.cuit, f.customer.cuit);
  assert.equal(found.customer.userNumber, undefined);
  assert.equal((await f.controller.findTotemCustomerController(f.device, "99999999999")).found, false);
  for (const invalid of ["20-32964233-0", "20.32964233.0", "203abc", " 20329642330", "20329642330 ", "１２３", "123456789012", 20329642330, {}, ["20329642330"]]) {
    await assert.rejects(f.controller.findTotemCustomerController(f.device, invalid), { status: 400 });
    await assert.rejects(f.controller.createTotemCheckoutController(f.device, { ...f.input, cuit: invalid }), { status: 400 });
  }
  await assert.rejects(f.controller.findTotemCustomerController(f.device, undefined), { status: 400 });
  await assert.rejects(f.controller.createTotemCheckoutController(f.device, { ...f.input, userNumber: 123 }), { status: 400 });
  f.customer.cuit = "00123456";
  assert.equal((await f.controller.findTotemCustomerController(f.device, "00123456")).found, true);
  assert.equal((await f.controller.findTotemCustomerController(f.device, "123456")).found, false);
  assert.equal(f.createCalls(), 0);
});

test("checkout uses the current register even when authentication saw the previous assignment", async () => {
  const f = fixture();
  const authenticatedDevice = { ...f.device };
  f.device.cashRegisterId = uuid();
  await f.controller.createTotemCheckoutController(authenticatedDevice, f.input);
  assert.equal(f.requestedRegisterId(), f.device.cashRegisterId);
  assert.equal(f.checkouts[0].orderData.cashRegisterId, f.device.cashRegisterId);
});

test("Point checkout creates no order until verified, then records TOTEM paid sale once", async () => {
  const f = fixture();
  const pending = await f.controller.createTotemCheckoutController(
    f.device,
    f.input,
  );
  assert.equal(pending.status, "PENDING");
  assert.equal(f.orders.length, 0);
  f.paid();
  const result = await f.controller.getTotemCheckoutController(
    f.device,
    pending.id,
  );
  assert.equal(result.status, "COMPLETED");
  assert.equal(result.order.isPaid, true);
  assert.equal(result.order.dailyOrderNumber, 1);
  assert.equal(result.order.orderSource, "TOTEM");
  assert.equal(result.order.status, "FINALIZADO");
  assert.equal(f.orders[0].clientEmail, "lobotech.bb@gmail.com");
  assert.equal(f.orders[0].clientName, "Cliente invitado");
  assert.equal(result.order.totalRewardPoints, 0);
  assert.equal(result.order.contactPhone, "");
  await f.controller.createTotemCheckoutController(f.device, f.input);
  assert.equal(f.orders.length, 1);
  assert.equal(f.payments.length, 1);
  assert.equal(f.createCalls(), 1);
});

test("identified checkout resolves the customer's ID, email and contact details from the database", async () => {
  const f = fixture();
  const pending = await f.controller.createTotemCheckoutController(f.device, {
    ...f.input, clientName: f.customer.name, cuit: f.customer.cuit,
  });
  f.paid();
  await f.controller.getTotemCheckoutController(f.device, pending.id);
  assert.equal(f.orders[0].userId, f.customer.id);
  assert.equal(f.orders[0].clientName, f.customer.name);
  assert.equal(f.orders[0].clientEmail, f.customer.email);
  assert.equal(f.orders[0].contactPhone, f.customer.phone);
});

test("canonical cart refuses forged product options, quantities and changed prices before charging", async () => {
  const f = fixture();
  assert.throws(
    () =>
      f.normalize([{ ...f.input.cartItems[0], customOptions: [] }], f.catalog),
    /opciones/,
  );
  assert.throws(
    () => f.normalize([{ ...f.input.cartItems[0], quantity: -1 }], f.catalog),
    /Cantidad/,
  );
  await assert.rejects(
    f.controller.createTotemCheckoutController(f.device, {
      ...f.input,
      expectedTotal: 0.01,
    }),
    /precios/,
  );
  assert.equal(f.checkouts.length, 0);
  assert.equal(f.createCalls(), 0);
});

test("paid amount mismatch is not accepted as a completed order", async () => {
  const f = fixture();
  const checkout = await f.controller.createTotemCheckoutController(
    f.device,
    f.input,
  );
  f.paid();
  f.wrongAmount();
  await assert.rejects(
    f.controller.getTotemCheckoutController(f.device, checkout.id),
    /importe/,
  );
  assert.equal(f.orders.length, 0);
  assert.equal(f.payments.length, 0);
});

test("redemption reserves points, cancellation restores them and free redemption creates no provider charge", async () => {
  const f = fixture();
  f.catalog.products[0].redeemPoints = 100;
  const withUser = { ...f.input, cuit: "20329642330" };
  const pending = await f.controller.createTotemCheckoutController(
    f.device,
    withUser,
  );
  assert.equal(f.balance.points, 100);
  await f.controller.cancelTotemCheckoutController(f.device, pending.id);
  assert.equal(f.balance.points, 200);
  assert.equal(f.orders.length, 0);
  await f.controller.finishTotemCheckoutController(f.device, pending.id);
  f.catalog.products[0].displayPrice = 0;
  const result = await f.controller.createTotemCheckoutController(f.device, {
    ...withUser,
    clientRequestId: uuid(),
    expectedTotal: 0,
  });
  assert.equal(result.status, "COMPLETED");
  assert.equal(f.balance.points, 105);
  assert.equal(f.payments.length, 0);
  assert.equal(f.createCalls(), 1);
});

test("missing cash session and insufficient points stop checkout before contacting Point", async () => {
  const f = fixture();
  f.catalog.products[0].redeemPoints = 500;
  await assert.rejects(
    f.controller.createTotemCheckoutController(f.device, {
      ...f.input,
      cuit: "20329642330",
    }),
    /suficientes/,
  );
  f.missingCash();
  await assert.rejects(
    f.controller.createTotemCheckoutController(f.device, f.input),
    /abrir la caja/,
  );
  assert.equal(f.createCalls(), 0);
});

test("provider timeouts retain a pending checkout and another purchase cannot bypass it", async () => {
  const f = fixture();
  f.providerError();
  await assert.rejects(
    f.controller.createTotemCheckoutController(f.device, f.input),
    /Provider/,
  );
  assert.equal(f.checkouts.length, 1);
  await assert.rejects(
    f.controller.createTotemCheckoutController(f.device, {
      ...f.input,
      clientRequestId: uuid(),
    }),
    /pendiente/,
  );
  assert.equal(f.checkouts.length, 1);
});

test("approved payments wait for the shop cash session without initiating another charge", async () => {
  const f = fixture();
  const pending = await f.controller.createTotemCheckoutController(
    f.device,
    f.input,
  );
  f.paid();
  f.missingCash();
  await assert.rejects(
    f.controller.getTotemCheckoutController(f.device, pending.id),
    /aprobado/,
  );
  assert.equal(f.orders.length, 0);
  assert.equal(f.checkouts[0].status, "APPROVED");
  f.openCash();
  const result = await f.controller.getTotemCheckoutController(
    f.device,
    pending.id,
  );
  assert.equal(result.status, "COMPLETED");
  assert.equal(f.createCalls(), 1);
});

test("checkouts are device scoped and ignore forged source, totals, identity and points", async () => {
  const f = fixture();
  const pending = await f.controller.createTotemCheckoutController(f.device, {
    ...f.input,
    restaurantId: uuid(),
    userId: f.customer.id,
    orderSource: "ADMIN_PANEL",
    isPaid: true,
    totalAmount: 0,
    totalRewardPoints: 99999,
  });
  await assert.rejects(
    f.controller.getTotemCheckoutController(
      { ...f.device, id: uuid() },
      pending.id,
    ),
    /no encontrada/,
  );
  f.paid();
  const result = await f.controller.getTotemCheckoutController(
    f.device,
    pending.id,
  );
  assert.equal(result.order.restaurantId, f.device.restaurantId);
  assert.equal(result.order.orderSource, "TOTEM");
  assert.equal(result.order.totalAmount, 10.1);
  assert.equal(result.order.totalRewardPoints, 0);
});

test("webhook HMAC requires the configured shop secret and signed provider ID", () => {
  const staged = path.join(
    __dirname,
    "../.totem-backend-stage/src/utils/mercadoPagoPoint.js",
  );
  const code = fs.readFileSync(
    fs.existsSync(staged)
      ? staged
      : path.join(apiRoot, "src/utils/mercadoPagoPoint.js"),
    "utf8",
  );
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module,
    Buffer,
    process: {
      env: {
        MP_POINT_ACCOUNTS: JSON.stringify({
          shop: { accessToken: "TEST", webhookSecret: "SECRET" },
        }),
      },
    },
    require: (name) =>
      name === "./totemAuthUtils.js" ? { fail } : apiRequire(name),
  });
  const id = "ord_TEST";
  const manifest = "id:ord_test;request-id:req-1;ts:123;";
  const signature = crypto
    .createHmac("sha256", "SECRET")
    .update(manifest)
    .digest("hex");
  const req = {
    query: { "data.id": id },
    headers: {
      "x-request-id": "req-1",
      "x-signature": `ts=123,v1=${signature}`,
    },
  };
  assert.doesNotThrow(() => module.exports.verifyPointWebhook(req, "shop", id));
  req.query["data.id"] = "another";
  assert.throws(
    () => module.exports.verifyPointWebhook(req, "shop", id),
    /autorizada/,
  );
});
