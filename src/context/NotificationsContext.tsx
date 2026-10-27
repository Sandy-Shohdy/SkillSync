import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from "../lib/api";
import { NotificationsContext } from "./notificationsContextValue";

const POLL_INTERVAL_MS = 30_000;

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  // Tagged with the owner so a previous user's list is never shown.
  const [state, setState] = useState<{
    userId: string | null;
    items: AppNotification[];
  }>({ userId: null, items: [] });

  const token = user?.token;
  const userId = user?.id;

  const refresh = useCallback(async () => {
    if (!token || !userId) return;
    const items = await getNotifications(token);
    setState({ userId, items });
  }, [token, userId]);

  useEffect(() => {
    if (!token) return;
    const load = () => {
      refresh().catch(() => {});
    };
    load();
    const interval = window.setInterval(load, POLL_INTERVAL_MS);
    window.addEventListener("focus", load);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", load);
    };
  }, [token, refresh]);

  const notifications = state.userId === userId ? state.items : [];

  const markRead = useCallback(
    (id: string) => {
      if (!token) return;
      setState((prev) => ({
        ...prev,
        items: prev.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
      }));
      markNotificationRead(token, id).catch(() => {});
    },
    [token],
  );

  const markAllRead = useCallback(() => {
    if (!token) return;
    setState((prev) => ({
      ...prev,
      items: prev.items.map((n) => ({ ...n, read: true })),
    }));
    markAllNotificationsRead(token).catch(() => {});
  }, [token]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
        refresh,
        markRead,
        markAllRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
