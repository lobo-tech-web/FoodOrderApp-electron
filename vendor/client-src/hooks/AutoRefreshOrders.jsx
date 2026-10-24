import { useCallback, useEffect, useRef, useState } from "react";

export const useAutoRefresh = (
  refreshFunction,
  interval = 30000,
  options = {},
) => {
  const { enabled = true, pauseOnHidden = true, onRefresh = null } = options;

  const latest = useRef();
  latest.current = { refreshFunction, enabled, pauseOnHidden, onRefresh };

  const timer = useRef(null);
  const inFlight = useRef(false);
  const mounted = useRef(false);
  const deadline = useRef(0);

  const [countdown, setCountdown] = useState(Math.ceil(interval / 1000));
  const [isRunning, setIsRunning] = useState(false);

  const stopPolling = useCallback(() => {
    clearInterval(timer.current);
    timer.current = null;
    if (mounted.current) setIsRunning(false);
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();
    const current = latest.current;
    if (!current.enabled || (current.pauseOnHidden && document.hidden)) return;

    deadline.current = Date.now() + interval;
    setCountdown(Math.ceil(interval / 1000));
    setIsRunning(true);

    timer.current = setInterval(async () => {
      if (inFlight.current) return;

      const remaining = Math.max(
        0,
        Math.ceil((deadline.current - Date.now()) / 1000),
      );
      setCountdown(remaining);

      if (
        remaining > 0 ||
        !latest.current.enabled ||
        (latest.current.pauseOnHidden && document.hidden)
      ) {
        return;
      }

      inFlight.current = true;
      try {
        const refreshed = await latest.current.refreshFunction();
        if (mounted.current && latest.current.enabled && refreshed !== false) {
          latest.current.onRefresh?.();
        }
      } catch (error) {
        console.error("Error en auto-refresh", error);
      } finally {
        inFlight.current = false;
        deadline.current = Date.now() + interval;
        if (mounted.current) setCountdown(Math.ceil(interval / 1000));
      }
    }, 1000);
  }, [interval, stopPolling]);

  useEffect(() => {
    mounted.current = true;
    startPolling();

    const onVisibility = () => {
      if (pauseOnHidden) document.hidden ? stopPolling() : startPolling();
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      mounted.current = false;
      stopPolling();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled, pauseOnHidden, startPolling, stopPolling]);

  return {
    startPolling,
    stopPolling,
    restartPolling: startPolling,
    isRunning,
    countdown,
  };
};
