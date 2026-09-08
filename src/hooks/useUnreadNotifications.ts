import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getNotifications } from "../lib/api";

export function useUnreadNotifications() {
  const { user } = useAuth();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!user) {
      setHasUnread(false);
      return;
    }
    let cancelled = false;
    getNotifications(user.token)
      .then((data) => {
        if (!cancelled) setHasUnread(data.some((n) => !n.read));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  return hasUnread;
}
