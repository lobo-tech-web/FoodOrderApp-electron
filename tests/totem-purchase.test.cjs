const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");
const { test } = require("node:test");
const { createTotemManager } = require("../totem-manager.js");

test("an uncertain payment survives restart, is recovered without paying twice and clears only on finish", async (t) => {
  const device = { id: crypto.randomUUID(), status: "ACTIVE" };
  let checkout = null;
  let posts = 0;
  let key;
  const server = http.createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks)) : null;
    res.setHeader("Content-Type", "application/json");
    const reply = (data, status = 200) => {
      res.statusCode = status;
      res.end(JSON.stringify(data));
    };
    if (req.url === "/activate")
      return reply({
        device,
        deviceSecret: "a".repeat(64),
        token: "test-token",
        expiresIn: 900,
      });
    if (req.url === "/session")
      return reply({ device, token: "test-token", expiresIn: 900 });
    assert.equal(req.headers.authorization, "Bearer test-token");
    if (req.url === "/checkouts" && req.method === "POST") {
      posts++;
      key = body.clientRequestId;
      checkout = {
        id: crypto.randomUUID(),
        status: "PENDING",
        totalAmount: 100,
      };
      return reply({ message: "Respuesta del proveedor incierta" }, 503);
    }
    if (req.url === "/checkouts/active") return reply(checkout);
    if (req.url === `/checkouts/${checkout?.id}/finish`) {
      checkout = null;
      return reply({ finished: true });
    }
    return reply(checkout);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(
    () =>
      new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections();
      }),
  );
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "totem-purchase-test-"),
  );
  t.after(() => {
    for (const file of fs.readdirSync(directory))
      fs.unlinkSync(path.join(directory, file));
    fs.rmdirSync(directory);
  });
  const storageKey = crypto.randomBytes(32);
  const safeStorage = {
    isEncryptionAvailable: () => true,
    encryptString: (value) => {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv("aes-256-cbc", storageKey, iv);
      return Buffer.concat([iv, cipher.update(value), cipher.final()]);
    },
    decryptString: (data) => {
      const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        storageKey,
        data.subarray(0, 16),
      );
      return Buffer.concat([
        decipher.update(data.subarray(16)),
        decipher.final(),
      ]).toString();
    },
  };
  const manager = () =>
    createTotemManager({ getPath: () => directory }, safeStorage, {
      isDevelopment: true,
      apiURL: `http://127.0.0.1:${server.address().port}`,
    });
  const first = manager();
  await first.activate({ deviceId: device.id, pairingCode: "a".repeat(64) });
  const response = await first.createCheckout({
    clientName: "Confidential Name",
    cartItems: [],
    expectedTotal: 100,
  });
  assert.equal(response.ok, false);
  assert.match(key, /^[a-f0-9-]{36}$/);
  assert.ok(fs.existsSync(path.join(directory, "secure-totem-purchase.json")));
  assert.ok(
    !fs
      .readFileSync(path.join(directory, "secure-totem-purchase.json"), "utf8")
      .includes("Confidential Name"),
  );
  const restarted = manager();
  const recovered = await restarted.recoverCheckout();
  assert.equal(recovered.checkout.id, checkout.id);
  assert.equal(posts, 1);
  await restarted.createCheckout({ clientName: "Another customer" });
  assert.equal(posts, 1);
  checkout.status = "COMPLETED";
  assert.equal((await restarted.finishCheckout(checkout.id)).ok, true);
  assert.equal(
    fs.existsSync(path.join(directory, "secure-totem-purchase.json")),
    false,
  );
});
