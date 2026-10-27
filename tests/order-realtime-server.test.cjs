const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createServer } = require("node:http");
const { createRequire } = require("node:module");
const path = require("node:path");
const { once } = require("node:events");
const backendRequire = createRequire(path.resolve(__dirname, "../../FoodOrderApp-api/package.json"));
const jwt = backendRequire("jsonwebtoken");
const { io } = require("socket.io-client");
const { attachOrderRealtime } = backendRequire("./src/realtime/orderRealtime.js");
const { registerOrderEvents } = backendRequire("./src/realtime/orderEvents.js");

const model = () => {
  const hooks = new Map();
  return { hooks, addHook: (event, _name, fn) => hooks.set(event, fn),
    removeHook: event => hooks.delete(event), findAll: async () => [{ id: 2, restaurantId: "a" }] };
};

test("order events wait for commit, coalesce create/update, cover bulk writes and skip rollback", async () => {
  const Orders = model(), events = [];
  const remove = registerOrderEvents(Orders, event => events.push(event));
  const commitCallbacks = [];
  const transaction = { afterCommit: fn => commitCallbacks.push(fn) };
  const order = { id: 1, restaurantId: "a" };
  Orders.hooks.get("afterCreate")(order, { transaction });
  Orders.hooks.get("afterUpdate")(order, { transaction });
  assert.equal(events.length, 0);
  assert.equal(commitCallbacks.length, 1);
  commitCallbacks[0]();
  assert.equal(events.length, 1);
  assert.equal(events[0].kind, "created");
  // A rollback never runs afterCommit (same contract as Sequelize).
  Orders.hooks.get("afterCreate")({ id: 3, restaurantId: "a" }, { transaction: { afterCommit() {} } });
  assert.equal(events.length, 1);
  for (const operation of ["Update", "Destroy"]) {
    const options = { where: { status: "old" } };
    await Orders.hooks.get(`beforeBulk${operation}`)(options);
    await Orders.hooks.get(`afterBulk${operation}`)(options);
  }
  assert.deepEqual(events.map(event => event.kind), ["created", "updated", "deleted"]);
  Orders.hooks.get("afterBulkCreate")([{ id: 4, restaurantId: "a" }], {});
  assert.equal(events.at(-1).kind, "created");
  remove();
  assert.equal(Orders.hooks.size, 0);
});

test("real Socket.IO connections authenticate, isolate restaurants and disconnect expired sessions", { timeout: 15000 }, async t => {
  const httpServer = createServer((_req, res) => res.end("ok"));
  const Orders = model();
  const secret = "order-realtime-test-secret-never-production";
  const realtime = attachOrderRealtime({ httpServer, Orders, jwtSecret: secret,
    RestaurantStaff: { findOne: async ({ where }) => {
      if (where.id === "staff-disabled") return null;
      if (!where.id.startsWith("staff-")) return null;
      return { id: where.id, restaurantId: where.id === "staff-orphan" ? "missing" : "a",
        permissions: { orders: { read: where.id !== "staff-no-read" } } };
    } },
    Users: { findOne: async ({ where }) => ["a", "b"].includes(where.id) ? { id: where.id } : null } });
  t.after(() => realtime.close());
  await new Promise(resolve => httpServer.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${httpServer.address().port}`;
  const token = (id, role = "admin", expiresIn = "10m") => jwt.sign({ id, role }, secret, { expiresIn });
  const connect = credentials => {
    const socket = io(url, { transports: ["websocket"], reconnection: false, auth: credentials });
    t.after(() => socket.disconnect());
    return socket;
  };
  const a = connect({ token: token("a"), restaurantId: "b" });
  const b = connect({ token: token("b") });
  const bReady = once(b, "orders:ready");
  assert.equal((await once(a, "orders:ready"))[0].restaurantId, "a");
  await bReady;
  const staff = connect({ token: token("staff-a", "staff"), restaurantId: "b" });
  assert.equal((await once(staff, "orders:ready"))[0].restaurantId, "a");
  const receivedByB = [];
  b.on("orders:changed", event => receivedByB.push(event));
  const delivered = once(a, "orders:changed");
  const staffDelivered = once(staff, "orders:changed");
  Orders.hooks.get("afterCreate")({ id: 10, restaurantId: "a", clientName: "private" }, {});
  const event = (await delivered)[0];
  assert.equal(event.orderId, 10);
  assert.equal((await staffDelivered)[0].orderId, 10);
  assert.equal(event.clientName, undefined);
  // Use an acknowledgement on b as a transport barrier, not a timing sleep.
  const bDelivered = once(b, "orders:changed");
  Orders.hooks.get("afterUpdate")({ id: 20, restaurantId: "b" }, {});
  await bDelivered;
  assert.deepEqual(receivedByB.map(event => event.orderId), [20]);
  for (const credentials of [{}, { token: "invalid" }, { token: token("a", "user") }, { token: token("inactive") },
    ...["staff-disabled", "staff-no-read", "staff-orphan"].map(id => ({ token: token(id, "staff") }))]) {
    const rejected = connect(credentials);
    assert.equal((await once(rejected, "connect_error"))[0].data.code, "UNAUTHORIZED");
  }
  const expiring = connect({ token: token("a", "admin", 2) });
  await once(expiring, "orders:ready");
  assert.equal((await once(expiring, "disconnect"))[0], "io server disconnect");
});
