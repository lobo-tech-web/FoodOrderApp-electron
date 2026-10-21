const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

test("shared order creation permits the trusted totem transaction but retains normal admin transaction ownership", async () => {
  let commits = 0;
  let rollbacks = 0;
  let permissions = 0;
  const transaction = {
    commit: async () => {
      commits++;
    },
    rollback: async () => {
      rollbacks++;
    },
  };
  const Orders = {
    sequelize: { transaction: async () => transaction, query: async () => {} },
    findOne: async () => null,
    create: async (data) => ({ ...data, id: 1, toJSON: () => data }),
  };
  const modules = {
    "../db.js": {
      Orders,
      Users: { findByPk: async () => ({ paymentMethods: ["MERCADO PAGO"] }) },
    },
    "../controllers/dateController.js": {
      getDateFormat: () => ({ year: 2026, month: 10, day: 10 }),
    },
    "../utils/parseJson.js": {
      parseJSONField: (value, fallback) => value ?? fallback,
    },
    "../utils/userPoints.js": { getOrderClientUser: async () => null },
    "../utils/orderUtils.js": {
      getAuthRestaurantId: (actor, id) =>
        actor?.role === "admin" ? actor.id : id,
      parseBooleanValue: (value, fallback) => value ?? fallback,
      getOrderSource: (_data, actor) =>
        actor.role === "totem" ? "TOTEM" : "ADMIN_PANEL",
      getOrderActorData: () => ({ type: "CLIENT", name: "Test" }),
      createOrderAuditLog: async () => {},
    },
    "../utils/orderUpdatePermissionsUtils.js": {
      validateOrderCreatePermissions: async () => {
        permissions++;
        return { cashSession: null };
      },
    },
  };
  const filename = path.join(
    __dirname,
    "../.totem-backend-stage/src/controllers/orderController.js",
  );
  const source = fs.readFileSync(
    fs.existsSync(filename)
      ? filename
      : path.resolve(
          __dirname,
          "../../FoodOrderApp-api/src/controllers/orderController.js",
        ),
    "utf8",
  );
  const module = { exports: {} };
  vm.runInNewContext(source, {
    module,
    require: (name) => modules[name] || {},
    console,
  });
  const input = {
    restaurantId: "shop",
    cartItems: [{ productId: "burger", quantity: 1 }],
    paymentMethod: "MERCADO PAGO",
    orderType: "ESPERA EN LOCAL",
    status: "FINALIZADO",
    isPaid: false,
  };
  const create = module.exports.createOrderController;
  const order = await create(
    input,
    { role: "totem", restaurantId: "shop" },
    { transaction },
  );
  assert.equal(order.orderSource, "TOTEM");
  assert.equal(order.isPaid, false);
  assert.equal(order.dailyOrderNumber, 1);
  assert.equal(commits, 0);
  assert.equal(rollbacks, 0);
  assert.equal(permissions, 0);
  await assert.rejects(
    create(input, { role: "totem", restaurantId: "shop" }),
    (error) => error.status === 403 && /verificado/.test(error.message),
  );
  await create(
    { ...input, status: "EN PREPARACIÓN" },
    { role: "admin", id: "shop" },
  );
  assert.equal(commits, 1);
  assert.equal(permissions, 1);
});
