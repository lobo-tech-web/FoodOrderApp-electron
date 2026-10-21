const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const { test } = require("node:test");
const { createTotemManager } = require("../totem-manager.js");

const fixture = async (t) => {
  const device = { id: randomUUID(), status: "ACTIVE" };
  const calls = [];
  const gates = new Map();
  const hold = (endpoint, status = 200) => {
    let arrived;
    const started = new Promise((resolve) => { arrived = resolve; });
    let release;
    const finished = new Promise((resolve) => { release = resolve; });
    gates.set(endpoint, { arrived, finished, status });
    return { started, release };
  };
  const server = http.createServer(async (req, res) => {
    calls.push(req.url);
    const gate = gates.get(req.url);
    if (gate) {
      gate.arrived();
      await gate.finished;
      res.statusCode = gate.status;
    }
    const responses = {
      "/activate": { device, deviceSecret: "a".repeat(64), token: "test-token", expiresIn: 900 },
      "/me": { device },
      "/checkouts/active": null,
      "/catalog": { deviceId: device.id, categories: [], products: [{ id: "burger" }] },
    };
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(res.statusCode === 200 ? responses[req.url] : { message: "Recovery unavailable" }));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => {
    server.close(resolve);
    server.closeAllConnections();
  }));
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "totem-catalog-test-"));
  t.after(() => {
    for (const file of fs.readdirSync(directory)) fs.unlinkSync(path.join(directory, file));
    fs.rmdirSync(directory);
  });
  const manager = createTotemManager(
    { getPath: () => directory },
    {
      isEncryptionAvailable: () => true,
      encryptString: (value) => Buffer.from(value),
      decryptString: (value) => value.toString(),
    },
    { isDevelopment: true, apiURL: `http://127.0.0.1:${server.address().port}` },
  );
  assert.equal((await manager.activate({ deviceId: device.id, pairingCode: "a".repeat(64) })).ok, true);
  return { manager, calls, hold };
};

test("catalog waits for startup recovery and shares duplicate catalog requests", { timeout: 10000 }, async (t) => {
  const { manager, calls, hold } = await fixture(t);
  const recoveryGate = hold("/checkouts/active");
  const recovery = manager.recoverCheckout();
  await recoveryGate.started;
  const catalog = manager.getCatalog();
  const duplicateCatalog = manager.getCatalog();
  assert.equal(calls.includes("/catalog"), false);
  recoveryGate.release();
  assert.equal((await recovery).ok, true);
  const results = await Promise.all([catalog, duplicateCatalog]);
  assert.equal(results[0].ok, true);
  assert.strictEqual(results[0], results[1]);
  assert.equal(results[0].catalog.products[0].id, "burger");
  assert.equal(calls.filter((endpoint) => endpoint === "/catalog").length, 1);
});

test("catalog waits again when recovery starts after a status check", { timeout: 10000 }, async (t) => {
  const { manager, calls, hold } = await fixture(t);
  const statusGate = hold("/me");
  const recoveryGate = hold("/checkouts/active");
  const status = manager.getStatus();
  await statusGate.started;
  const recovery = manager.recoverCheckout();
  const catalog = manager.getCatalog();
  statusGate.release();
  assert.equal((await status).ok, true);
  await recoveryGate.started;
  assert.equal(calls.includes("/catalog"), false);
  recoveryGate.release();
  assert.equal((await recovery).ok, true);
  assert.equal((await catalog).ok, true);
});

test("a failed recovery releases the catalog without a manual refresh", { timeout: 10000 }, async (t) => {
  const { manager, hold } = await fixture(t);
  const recoveryGate = hold("/checkouts/active", 503);
  const recovery = manager.recoverCheckout();
  await recoveryGate.started;
  const catalog = manager.getCatalog();
  recoveryGate.release();
  assert.equal((await recovery).ok, false);
  assert.equal((await catalog).ok, true);
});
