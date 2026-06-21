import { useEffect, useRef, useCallback, useState } from 'react';

export const useAutoRefresh = (
  refreshFunction,
  interval = 30000, // 30 segundos por defecto para el refresh
  options = {}
) => {
  const {
    enabled = true,
    pauseOnHidden = true, // Pausar cuando la pestaña no está visible
    onRefresh = null, // Callback cuando se ejecuta el refresh
  } = options;

  const refreshFunctionRef = useRef(refreshFunction);
  const isEnabledRef = useRef(enabled);
  const [countdown, setCountdown] = useState(interval / 1000);
  const countdownIntervalRef = useRef(null);

  // Actualizar referencias
  useEffect(() => {
    refreshFunctionRef.current = refreshFunction;
    isEnabledRef.current = enabled;
  }, [refreshFunction, enabled]);

  const stopCountdown = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const startCountdown = useCallback(() => {
    if (countdownIntervalRef.current) return;

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          (async () => {
            if (!isEnabledRef.current) return;
            if (pauseOnHidden && document.hidden) return;

            try {
              await refreshFunctionRef.current();
              onRefresh?.();
            } catch (error) {
              console.error('Error en auto-refresh', error);
            }
          })();
          return interval / 1000; // Reset countdown
        }
        return prev - 1;
      });
    }, 1000);
  }, [interval, pauseOnHidden, onRefresh]);

  const startPolling = useCallback(() => {
    stopCountdown(); // Asegúrate de no duplicar timers
    if (enabled) {
      startCountdown();
    }
  }, [enabled, startCountdown, stopCountdown]);

  const stopPolling = useCallback(() => {
    stopCountdown();
  }, [stopCountdown]);

  const restartPolling = useCallback(() => {
    stopPolling();
    if (enabled) {
      startPolling();
    }
  }, [enabled, startPolling, stopPolling]);

  // Manejar visibilidad de la página
  useEffect(() => {
    if (!pauseOnHidden) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else if (enabled) {
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, pauseOnHidden, startPolling, stopPolling]);

  // Iniciar/detener polling basado en enabled
  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return stopPolling;
  }, [enabled, startPolling, stopPolling]);

  return {
    startPolling,
    stopPolling,
    restartPolling,
    isRunning: countdownIntervalRef.current !== null,
    countdown,
  };
};
