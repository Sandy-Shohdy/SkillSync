import type { BookingStatus, PaymentStatus } from "./api";

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
  completed: "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-400",
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
  cancelled: "Cancelled",
  completed: "Completed",
};

export const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  held: "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-400",
  disputed: "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400",
  released:
    "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400",
  refunded: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  held: "Paid · held",
  disputed: "Problem reported",
  released: "Paid out",
  refunded: "Refunded",
};

export function formatDeadline(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// Amounts from the API are in minor units (öre).
export function formatMoney(minor: number, currency = "SEK") {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency,
    maximumFractionDigits: minor % 100 === 0 ? 0 : 2,
  }).format(minor / 100);
}
