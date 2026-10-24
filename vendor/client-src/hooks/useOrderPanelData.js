import { useCallback, useEffect, useRef, useState } from "react";

// ---- Utils ----
import { getTimeNowDayjs } from "@/utils/clientWorking.js";
// ---------------

// Only this hook publishes list snapshots. Context queries used by forms cannot
// overwrite the visible list, and responses from an older query are discarded.
export const useOrderPanelData = ({ query, loadOrders, loadRiders, autoRefreshEnabled, onError }) => {
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [isProtected, setIsProtected] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState(false);
  const [pump, setPump] = useState(0);

  const locks = useRef(new Set());
  const pending = useRef(null);
  const flight = useRef(null);
  const generation = useRef(0);
  const currentKey = useRef(null);
  const mounted = useRef(false);

  const queryKey = JSON.stringify(query);
  const latest = useRef();
  latest.current = { query, loadOrders, loadRiders, autoRefreshEnabled, onError };

  const enqueue = useCallback((automatic) => {
    pending.current = { automatic: (pending.current?.automatic ?? true) && automatic };
    setPendingUpdates(true);
    setPump((value) => value + 1);
  }, []);

  const refresh = useCallback(({ automatic = false } = {}) => {
    enqueue(automatic);
    // Form saves may await this callback while their interaction lock is held.
    // Publication happens after the last form closes; never wait on that lock.
    return Promise.resolve(false);
  }, [enqueue]);

  const setInteractionBlocked = useCallback((reason, blocked) => {
    const wasLocked = locks.current.has(reason);

    if (blocked) locks.current.add(reason);
    else locks.current.delete(reason);

    if (blocked && !wasLocked) {
      generation.current++;
      enqueue(flight.current?.automatic ?? true);
    }

    setIsProtected(locks.current.size > 0);
    setPump((value) => value + 1);
  }, [enqueue]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      generation.current++;
      if (flight.current) pending.current = { automatic: flight.current.automatic };
    };
  }, []);

  useEffect(() => {
    if (currentKey.current !== queryKey) {
      currentKey.current = queryKey;
      generation.current++;
      pending.current = { automatic: false };
      setPendingUpdates(true);
      setOrders([]);
      setRiders([]);
      setLastRefresh(null);
    }

    if (!query.restaurantId || locks.current.size || flight.current || !pending.current) return;
    if (pending.current.automatic && !autoRefreshEnabled) return;

    const request = { generation: generation.current, automatic: pending.current.automatic };
    const { query: requestedQuery, loadOrders: getOrders, loadRiders: getRiders } = latest.current;

    pending.current = null;
    flight.current = request;
    setPendingUpdates(false);
    setIsRefreshing(true);

    (async () => {
      try {
        const [orderResult, riderResult] = await Promise.allSettled([
          getOrders(requestedQuery),
          requestedQuery.period === "day" && requestedQuery.mode !== "search"
            ? getRiders(requestedQuery.restaurantId)
            : Promise.resolve([]),
        ]);

        if (!mounted.current || generation.current !== request.generation || locks.current.size) return;
        if (orderResult.status === "rejected") throw orderResult.reason;

        setOrders(Array.isArray(orderResult.value) ? orderResult.value : []);

        if (riderResult.status === "fulfilled") setRiders(riderResult.value || []);

        setLastRefresh(getTimeNowDayjs());
      } catch (error) {
        if (mounted.current && generation.current === request.generation && !locks.current.size) {
          latest.current.onError(error);
        }
      } finally {
        flight.current = null;
        if (mounted.current) {
          setIsRefreshing(false);
          setPump((value) => value + 1);
        }
      }
    })();
  }, [queryKey, query.restaurantId, pump, isProtected, autoRefreshEnabled]);

  return { orders, riders, isRefreshing, lastRefresh, isProtected, pendingUpdates, refresh, setInteractionBlocked };
};
