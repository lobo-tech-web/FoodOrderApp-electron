import { useState, useEffect, useCallback, useRef } from "react";

const terminal = (checkout) =>
  ["COMPLETED", "CANCELED", "FAILED", "EXPIRED"].includes(checkout?.status);

export const useTotemPurchase = () => {
  const [phase, setPhase] = useState("recovering");
  const [checkout, setCheckout] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const lock = useRef(false);

  const accept = useCallback((result) => {
    if (!result?.ok) {
      setError(result?.message || "No se pudo verificar la compra");
      if (result?.recoverable === false) setPhase("shopping");
      return false;
    }

    setError("");
    setCheckout(result.checkout);
    setPhase(result.checkout ? "payment" : "shopping");

    return true;
  }, []);

  const run = useCallback(
    async (action, creating = false) => {
      if (lock.current) return;
      lock.current = true;
      setBusy(true);
      setError("");
      try {
        const result = await action();

        if (!accept(result) && creating) {
          setPhase(result.recoverable === false ? "customer" : "payment");
        }

        return result;
      } catch {
        setError(
          "No se pudo confirmar la respuesta. Verificá la compra; no vuelvas a pagar",
        );
        if (creating) setPhase("payment");
      } finally {
        lock.current = false;
        setBusy(false);
      }
    },
    [accept],
  );

  useEffect(() => {
    let active = true;
    window.totemAPI
      .recoverCheckout()
      .then((result) => {
        if (active) accept(result);
      })
      .catch(() => {
        if (active) {
          setError(
            "No se pudo recuperar la compra. Verificá la conexión del local",
          );
        }
      });
    return () => {
      active = false;
    };
  }, [accept]);

  useEffect(() => {
    if (phase !== "payment" || terminal(checkout)) return;

    let active = true;
    let timer;

    const poll = async () => {
      if (!active) return;

      if (!lock.current) {
        await run(() =>
          checkout
            ? window.totemAPI.getCheckout(checkout.id)
            : window.totemAPI.recoverCheckout(),
        );
      }

      if (active) timer = setTimeout(poll, 8000);
    };
    timer = setTimeout(poll, 8000);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [phase, checkout?.id, checkout?.status, run]);

  const finish = useCallback(
    () =>
      run(async () => {
        const result = await window.totemAPI.finishCheckout(checkout.id);
        return result.ok ? { ok: true, checkout: null } : result;
      }),
    [run, checkout?.id],
  );

  return {
    phase,
    setPhase,
    checkout,
    error,
    busy,
    create: (payload) => run(() => window.totemAPI.createCheckout(payload), true),
    recover: () => run(() => window.totemAPI.recoverCheckout()),
    cancel: () => run(() => window.totemAPI.cancelCheckout(checkout.id)),
    finish,
  };
};
