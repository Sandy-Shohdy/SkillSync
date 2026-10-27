import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../hooks/useNotifications";
import type { AppNotification, NotificationType } from "../lib/api";

const TYPE_ICONS: Record<NotificationType, string> = {
  booking_created: "📅",
  booking_accepted: "✅",
  booking_declined: "❌",
  booking_cancelled: "🚫",
  payment_received: "💳",
  work_completed: "🛠️",
  payment_released: "💰",
  payment_disputed: "⚠️",
  payment_refunded: "↩️",
};

const relativeTime = new Intl.RelativeTimeFormat(undefined, {
  numeric: "auto",
});

function timeAgo(iso: string) {
  const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) {
      return relativeTime.format(Math.round(seconds / size), unit);
    }
  }
  return "just now";
}

export default function NotificationBell() {
  const { user } = useAuth();
  const { notifications, unreadCount, refresh, markRead, markAllRead } =
    useNotifications();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  if (!user) return null;

  const handleToggle = () => {
    if (!open) refresh().catch(() => {});
    setOpen(!open);
  };

  const handleSelect = (notification: AppNotification) => {
    if (!notification.read) markRead(notification.id);
    setOpen(false);
    if (user.role === "freelancer") {
      navigate(
        notification.type === "payment_released"
          ? "/freelancer/earnings"
          : "/freelancer/bookings",
      );
    } else {
      navigate("/bookings");
    }
  };

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={handleToggle}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={open}
        aria-haspopup="true"
        className="relative flex items-center justify-center w-10 h-10 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold leading-5 text-center border-2 border-white dark:border-gray-900">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-4 top-20 sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 z-50 sm:w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              You have no notifications yet.
            </p>
          ) : (
            <ul className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(notification)}
                    className={`w-full flex gap-3 px-4 py-3 text-left transition hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      notification.read
                        ? ""
                        : "bg-amber-50/60 dark:bg-amber-900/10"
                    }`}
                  >
                    <span className="text-lg leading-6 shrink-0" aria-hidden="true">
                      {TYPE_ICONS[notification.type] ?? "🔔"}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span
                        className={`block text-sm ${
                          notification.read
                            ? "text-gray-600 dark:text-gray-400"
                            : "text-gray-900 dark:text-white font-medium"
                        }`}
                      >
                        {notification.message}
                      </span>
                      <span className="block text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {timeAgo(notification.createdAt)}
                      </span>
                    </span>
                    {!notification.read && (
                      <span
                        className="w-2 h-2 mt-2 rounded-full bg-amber-500 shrink-0"
                        aria-label="Unread"
                      />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
