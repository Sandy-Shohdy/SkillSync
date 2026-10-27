import { useNotifications } from "./useNotifications";

export function useUnreadNotifications() {
  return useNotifications().unreadCount > 0;
}
