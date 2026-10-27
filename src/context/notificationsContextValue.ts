import { createContext } from "react";
import type { AppNotification } from "../lib/api";

export interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  refresh: () => Promise<void>;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export const NotificationsContext = createContext<
  NotificationsContextValue | undefined
>(undefined);
