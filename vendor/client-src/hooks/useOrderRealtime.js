import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

// ---- Utils ----
import { isForcedOfflineMode, subscribeOfflineOrders, subscribeOfflineStatus } from "@/utils/offlineStorage.js";
// ---------------

// Events are notifications only. The existing HTTP queries remain the source
// of truth and publish snapshots only after the panel's interaction locks clear.
export const useOrderRealtime = ({ restaurantId }) => {
  const [connection, setConnection] = useState("connecting");
  const [changes, setChanges] = useState(new Map());
  const [notificationVersion, setNotificationVersion] = useState(0);
  const seen = useRef(new Set());
  const notify = useCallback((key) => {
    setChanges(current => new Map(current).set(key, Date.now()));
    setNotificationVersion(current => current + 1);
  }, []);
  const acknowledgeUpdates = useCallback((startedAt) => {
    // Preserve events received while the HTTP snapshot was being fetched.
    setChanges(current => new Map([...current].filter(([, time]) => time >= startedAt)));
  }, []);

  useEffect(() => {
    if (!restaurantId) return;

    setChanges(new Map());
    setNotificationVersion(0);
    seen.current.clear();
    let disposed = false;

    const base = import.meta.env.VITE_ORDERS_SOCKET_URL || new URL(import.meta.env.VITE_API_URL, window.location.href).origin;
    const socket = io(base, {
      path: import.meta.env.VITE_ORDERS_SOCKET_PATH || "/socket.io",
      autoConnect: false,
      transports: ["websocket", "polling"],
      tryAllTransports: true,
      auth: callback => callback({ token: (window.secureStorage || window.localStorage).getItem("token") }),
      reconnectionDelay: 1000,
      reconnectionDelayMax: 15000,
    });

    socket.on("orders:ready", data => {
      if (String(data?.restaurantId) !== String(restaurantId)) return;
      setConnection("connected");
      notify("reconnect");
    });

    socket.on("orders:changed", event => {
      if (String(event?.restaurantId) !== String(restaurantId) || !event.eventId || seen.current.has(event.eventId)) return;
      seen.current.add(event.eventId);
      if (seen.current.size > 2000) seen.current.delete(seen.current.values().next().value);
      notify(`order:${event.orderId}`);
    });

    socket.on("connect_error", error => {
      setConnection(error.data?.code === "UNAUTHORIZED" ? "unauthorized" : "disconnected");
    });

    socket.on("disconnect", () => {
      if (!disposed) setConnection("disconnected");
    });

    const updateConnectivity = () => {
      if (isForcedOfflineMode() || !window.navigator.onLine) {
        socket.disconnect();
        setConnection("offline");
      } else if (!socket.connected && !socket.active) {
        setConnection("connecting");
        socket.connect();
      }
    };

    const stopStatus = subscribeOfflineStatus(updateConnectivity);
    const stopOfflineOrders = subscribeOfflineOrders(() => notify("offline-orders"));
    updateConnectivity();

    return () => {
      disposed = true;
      stopStatus();
      stopOfflineOrders();
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [restaurantId, notify]);

  return { connection, hasUpdates: changes.size > 0, notificationVersion, acknowledgeUpdates };
};
