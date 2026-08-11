const RUNTIME_STORAGE_KEYS = new Set([
  "token",
  "user",
  "last_client_id",
]);

const RUNTIME_STORAGE_PREFIXES = [
  "cart_",
  "products",
  "productState",
  "category",
  "categories",
  "categorys",
  "orders",
  "orderState",
  "riders",
  "users",
  "userState",
  "userPoints",
  "clientUserInfo",
  "cashSession",
  "cashRegister",
];

const shouldRemoveLocalStorageKey = (key) => {
  if (RUNTIME_STORAGE_KEYS.has(key)) return true;

  return RUNTIME_STORAGE_PREFIXES.some((prefix) =>
    key.toLowerCase().startsWith(prefix.toLowerCase()),
  );
};

export const clearDesktopRuntimeSession = () => {
  try {
    const keys = [];

    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key) keys.push(key);
    }

    keys.forEach((key) => {
      if (shouldRemoveLocalStorageKey(key)) {
        window.localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn("No se pudo limpiar localStorage de sesion:", error);
  }

  try {
    window.secureStorage?.removeItem("token");
    window.secureStorage?.removeItem("user");
  } catch (error) {
    console.warn("No se pudo limpiar secureStorage de sesion:", error);
  }
};
