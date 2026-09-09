import type { BookingStatus } from "./api";

export function formatBookingDate(date: string | null) {
  if (!date) return null;
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRequestedAt(createdAt: string) {
  return new Date(createdAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export const BOOKING_STATUS_STYLES: Record<BookingStatus, string> = {
  pending:
    "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400",
  accepted:
    "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400",
  declined: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
  cancelled: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
  cancelled: "Cancelled",
};
