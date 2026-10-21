const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
const { randomUUID } = require("node:crypto");

const createTotemManager = (app, safeStorage, options = {}) => {
  const filePath = () =>
    path.join(app.getPath("userData"), "secure-totem.json");

  let session = null;
  let pending = null;

  const fail = (message, status = 0) => {
    throw Object.assign(new Error(message), { status });
  };

  const request = (endpoint, body = null, token = null) =>
    new Promise((resolve, reject) => {
      let url;

      try {
        const base = new URL(options.apiURL);

        const localHTTP =
          options.isDevelopment &&
          base.protocol === "http:" &&
          ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname);

        if (
          (base.protocol !== "https:" && !localHTTP) ||
          base.username ||
          base.password ||
          base.search ||
          base.hash
        ) {
          fail("Configuración de URL del tótem inválida");
        }

        url = new URL(`${base.toString().replace(/\/$/, "")}/${endpoint}`);
      } catch {
        reject(new Error("Configurá la URL completa del router del tótem"));
        return;
      }

      const data = body === null ? null : JSON.stringify(body);
      const maxResponseBytes =
        endpoint === "catalog" ? 5 * 1024 * 1024 : 512000;
      const transport = url.protocol === "https:" ? https : http;

      const req = transport.request(
        url,
        {
          method: data === null ? "GET" : "POST",
          headers: {
            Accept: "application/json",
            ...(data === null
              ? {}
              : {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(data),
              }),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
        (res) => {
          let raw = "";
          let size = 0;

          res.setEncoding("utf8");
          res.on("error", reject);

          res.on("data", (chunk) => {
            size += Buffer.byteLength(chunk);

            if (size > maxResponseBytes) {
              req.destroy(new Error("Respuesta del tótem demasiado grande"));
            } else {
              raw += chunk;
            }
          });

          res.on("end", () => {
            let result;

            try {
              result = JSON.parse(raw);
            } catch {
              reject(
                new Error("El servidor no devolvió una respuesta JSON válida"),
              );
              return;
            }

            if (res.statusCode < 200 || res.statusCode >= 300) {
              reject(
                Object.assign(
                  new Error(result?.message || "Error al conectar el tótem"),
                  {
                    status: res.statusCode,
                    checkoutStarted: result.checkoutStarted,
                  },
                ),
              );
              return;
            }

            resolve(result);
          });
        },
      );

      const deadline = setTimeout(() => {
        req.destroy(new Error("El servidor del tótem no respondió a tiempo"));
      }, 15000);

      req.on("close", () => clearTimeout(deadline));
      req.on("error", reject);
      req.end(data);
    });

  const validateCredential = (value) => {
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (
      !value ||
      typeof value.deviceId !== "string" ||
      !uuidPattern.test(value.deviceId) ||
      typeof value.deviceSecret !== "string" ||
      !/^[a-f0-9]{64}$/.test(value.deviceSecret)
    ) {
      fail("La credencial del tótem es inválida");
    }
  };

  const assertSecureStorage = () => {
    if (
      !safeStorage.isEncryptionAvailable() ||
      safeStorage.getSelectedStorageBackend?.() === "basic_text"
    ) {
      fail("El almacenamiento seguro del equipo no está disponible");
    }
  };

  const readCredential = () => {
    if (!fs.existsSync(filePath())) return null;

    assertSecureStorage();
    try {
      const stored = JSON.parse(fs.readFileSync(filePath(), "utf8"));
      const decoded = safeStorage.decryptString(
        Buffer.from(stored.encrypted, "base64"),
      );
      const credential = JSON.parse(decoded);

      validateCredential(credential);
      return credential;
    } catch {
      fail("No se pudo leer la vinculación del tótem en este equipo");
    }
  };

  const saveCredential = (credential) => {
    validateCredential(credential);
    assertSecureStorage();

    const target = filePath();

    const encrypted = safeStorage
      .encryptString(JSON.stringify(credential))
      .toString("base64");

    fs.mkdirSync(path.dirname(target), { recursive: true });

    fs.writeFileSync(`${target}.tmp`, JSON.stringify({ encrypted }), {
      encoding: "utf8",
      mode: 0o600,
    });

    fs.renameSync(`${target}.tmp`, target);
  };

  const adoptSession = (response, deviceId) => {
    if (
      !response ||
      typeof response.token !== "string" ||
      !response.token ||
      !Number.isFinite(response.expiresIn) ||
      response.expiresIn <= 0 ||
      response.device?.id !== deviceId ||
      response.device?.status !== "ACTIVE"
    ) {
      fail("El servidor devolvió una sesión del tótem inválida");
    }

    return {
      token: response.token,
      expiresAt: Date.now() + response.expiresIn * 1000,
    };
  };

  const toPublicDevice = (device) => ({
    id: device.id,
    restaurantId: device.restaurantId,
    cashRegisterId: device.cashRegisterId,
    name: device.name,
    status: device.status,
    pointTerminalId: device.pointTerminalId,
    qrExternalPosId: device.qrExternalPosId,
    activatedAt: device.activatedAt,
    lastSeenAt: device.lastSeenAt,
  });

  const run = (kind, action) => {
    if (pending) {
      if (kind === pending.kind && ["status", "catalog"].includes(kind)) {
        return pending.promise;
      }

      return Promise.resolve({
        ok: false,
        status: 409,
        message: "Hay una operación del tótem en curso",
      });
    }

    const promise = Promise.resolve()
      .then(action)
      .catch((error) => ({
        ok: false,
        status: error.status || 0,
        message: error.message,
      }))
      .finally(() => {
        pending = null;
      });

    pending = { kind, promise };
    return promise;
  };

  const activate = (payload = {}) =>
    run("activate", async () => {
      const deviceId =
        typeof payload.deviceId === "string" ? payload.deviceId.trim() : "";

      const pairingCode =
        typeof payload.pairingCode === "string"
          ? payload.pairingCode.trim()
          : "";

      validateCredential({ deviceId, deviceSecret: pairingCode });

      assertSecureStorage();

      const response = await request("activate", {
        deviceId,
        pairingCode,
      });

      const nextSession = adoptSession(response, deviceId);
      saveCredential({ deviceId, deviceSecret: response.deviceSecret });
      session = nextSession;

      return {
        ok: true,
        device: toPublicDevice(response.device),
      };
    });

  const getStatus = () =>
    run("status", async () => {
      const credential = readCredential();

      if (!credential) {
        return {
          ok: true,
          linked: false,
          device: null,
        };
      }

      const renew = async () => {
        const response = await request("session", credential);
        session = adoptSession(response, credential.deviceId);
      };

      if (!session || session.expiresAt <= Date.now() + 30000) {
        await renew();
      }

      let response;

      try {
        response = await request("me", null, session.token);
      } catch (error) {
        if (error.status !== 401) throw error;

        session = null;
        await renew();
        response = await request("me", null, session.token);
      }

      if (
        response.device?.id !== credential.deviceId ||
        response.device?.status !== "ACTIVE"
      ) {
        fail("El servidor devolvió un dispositivo inválido");
      }

      return {
        ok: true,
        linked: true,
        device: toPublicDevice(response.device),
      };
    });

  const getCatalog = async () => {
    while (pending && pending.kind !== "catalog") {
      await pending.promise;
    }

    return run("catalog", async () => {
      const credential = readCredential();

      if (!credential) {
        fail("Este equipo todavía no está vinculado", 401);
      }

      const renew = async () => {
        const response = await request("session", credential);
        session = adoptSession(response, credential.deviceId);
      };

      if (!session || session.expiresAt <= Date.now() + 30000) {
        await renew();
      }

      let catalog;

      try {
        catalog = await request("catalog", null, session.token);
      } catch (error) {
        if (error.status !== 401) throw error;

        session = null;
        await renew();

        catalog = await request("catalog", null, session.token);
      }

      if (
        catalog?.deviceId !== credential.deviceId ||
        !Array.isArray(catalog.categories) ||
        !Array.isArray(catalog.products)
      ) {
        fail("El servidor devolvió un catálogo inválido");
      }

      return { ok: true, catalog };
    });
  };

  const hasCredential = () => fs.existsSync(filePath());

  const authorizeExit = (password) =>
    run("exit", async () => {
      if (
        typeof password !== "string" ||
        !password ||
        Buffer.byteLength(password, "utf8") > 256
      ) {
        fail("Ingresá una contraseña válida", 400);
      }

      const credential = readCredential();

      if (!credential) {
        fail("Este equipo todavía no está vinculado", 400);
      }

      const response = await request("maintenance/authorize", {
        deviceId: credential.deviceId,
        password,
      });

      if (
        response?.authorized !== true ||
        response.deviceId !== credential.deviceId
      ) {
        fail("El servidor no autorizó el cierre", 403);
      }

      return { ok: true };
    });

  const authenticated = async (endpoint, body = null) => {
    const credential = readCredential();
    if (!credential) fail("Este equipo todavía no está vinculado", 401);
    const renew = async () => {
      session = adoptSession(
        await request("session", credential),
        credential.deviceId,
      );
    };
    if (!session || session.expiresAt <= Date.now() + 30000) await renew();
    try {
      return await request(endpoint, body, session.token);
    } catch (error) {
      if (error.status !== 401) throw error;
      await renew();
      return request(endpoint, body, session.token);
    }
  };

  const queued = async (kind, action) => {
    while (pending) await pending.promise;
    return run(kind, action);
  };
  const purchasePath = () =>
    path.join(app.getPath("userData"), "secure-totem-purchase.json");
  const readPurchase = () => {
    if (!fs.existsSync(purchasePath())) return null;
    assertSecureStorage();
    try {
      const stored = JSON.parse(fs.readFileSync(purchasePath(), "utf8"));

      return JSON.parse(
        safeStorage.decryptString(Buffer.from(stored.encrypted, "base64")),
      );
    } catch {
      fail(
        "No se pudo recuperar la compra. Solicitá ayuda al local; no vuelvas a pagar",
      );
    }
  };
  const savePurchase = (purchase) => {
    assertSecureStorage();
    const target = purchasePath();

    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(
      `${target}.tmp`,
      JSON.stringify({
        encrypted: safeStorage
          .encryptString(JSON.stringify(purchase))
          .toString("base64"),
      }),
      { mode: 0o600 },
    );
    fs.renameSync(`${target}.tmp`, target);
  };
  const adoptCheckout = (checkout) => {
    if (checkout) {
      savePurchase({ ...(readPurchase() || {}), checkoutId: checkout.id });
    }

    return { ok: true, checkout };
  };
  const recover = async () => {
    const active = await authenticated("checkouts/active");
    if (active) return adoptCheckout(active);

    const purchase = readPurchase();
    if (purchase?.request) return submitPurchase(purchase);
    if (purchase?.checkoutId) fs.unlinkSync(purchasePath());

    return { ok: true, checkout: null };
  };
  const submitPurchase = async (purchase) => {
    try {
      return adoptCheckout(await authenticated("checkouts", purchase.request));
    } catch (error) {
      // Un error de red no demuestra que el proveedor no recibió el cobro.
      if (
        [400, 403, 409].includes(error.status) ||
        error.checkoutStarted === false
      ) {
        const active = await authenticated("checkouts/active");
        if (active) return adoptCheckout(active);
        fs.unlinkSync(purchasePath());
        return {
          ok: false,
          status: error.status,
          message: error.message,
          recoverable: false,
        };
      }
      throw error;
    }
  };
  const validateCheckoutId = (id) => {
    if (
      typeof id !== "string" ||
      !/^[a-f0-9-]{36}$/i.test(id) ||
      readPurchase()?.checkoutId !== id
    )
      fail("Compra no válida en este equipo", 400);
    return encodeURIComponent(id);
  };
  const findCustomer = (cuit) =>
    queued("customer", async () => {
      if (typeof cuit !== "string" || !/^[0-9]{1,11}$/.test(cuit)) {
        fail("CUIT/CUIL/DNI inválido: ingresá solo números (máximo 11 dígitos)", 400);
      }
      return {
        ok: true,
        ...(await authenticated(`customer?cuit=${encodeURIComponent(cuit)}`)),
      };
    });
  const createCheckout = (payload) =>
    queued("purchase", async () => {
      if (readPurchase()) return recover();

      if (!payload || JSON.stringify(payload).length > 100000) {
        fail("Carrito inválido", 400);
      }

      const purchase = {
        request: { ...payload, clientRequestId: randomUUID() },
      };

      savePurchase(purchase);
      return submitPurchase(purchase);
    });

  const recoverCheckout = () => queued("recover", recover);
  const getCheckout = (id) =>
    queued("checkout", async () =>
      adoptCheckout(await authenticated(`checkouts/${validateCheckoutId(id)}`)),
    );
  const cancelCheckout = (id) =>
    queued("cancel", async () =>
      adoptCheckout(
        await authenticated(`checkouts/${validateCheckoutId(id)}/cancel`, {}),
      ),
    );
  const finishCheckout = (id) =>
    queued("finish", async () => {
      const response = await authenticated(
        `checkouts/${validateCheckoutId(id)}/finish`,
        {},
      );
      if (response.finished !== true) fail("No se pudo finalizar la compra");
      fs.unlinkSync(purchasePath());
      return { ok: true };
    });

  return {
    activate,
    getStatus,
    getCatalog,
    hasCredential,
    authorizeExit,
    findCustomer,
    createCheckout,
    recoverCheckout,
    getCheckout,
    cancelCheckout,
    finishCheckout,
  };
};

module.exports = { createTotemManager };
