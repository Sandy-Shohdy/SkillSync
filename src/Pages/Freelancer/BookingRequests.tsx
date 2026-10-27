import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import SideRail from "../../components/SideRail";
import AccessNotice from "../../components/AccessNotice";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../hooks/useNotifications";
import {
  getMyBookingRequests,
  markBookingCompleted,
  refundPayment,
  updateBookingStatus,
  type BookingRequest,
} from "../../lib/api";
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_STYLES,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_STYLES,
  formatBookingDate,
  formatDeadline,
  formatMoney,
  formatRequestedAt,
} from "../../lib/bookingDisplay";

export default function BookingRequests() {
  const { user } = useAuth();
  const { markAllRead } = useNotifications();
  const [bookings, setBookings] = useState<BookingRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [respondError, setRespondError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== "freelancer") return;
    let cancelled = false;
    getMyBookingRequests(user.token)
      .then((data) => {
        if (!cancelled) setBookings(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load booking requests",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== "freelancer") return;
    markAllRead();
  }, [user, markAllRead]);

  const handleRespond = async (
    bookingId: string,
    status: "accepted" | "declined",
  ) => {
    if (!user) return;
    setRespondError(null);
    setRespondingId(bookingId);
    try {
      const updated = await updateBookingStatus(user.token, bookingId, status);
      setBookings(
        (prev) => prev?.map((b) => (b.id === bookingId ? updated : b)) ?? prev,
      );
    } catch (err) {
      setRespondError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setRespondingId(null);
    }
  };

  const handleComplete = async (bookingId: string) => {
    if (!user) return;
    if (!window.confirm("Mark this job as done? The customer will be asked to release your payment."))
      return;
    setRespondError(null);
    setRespondingId(bookingId);
    try {
      const updated = await markBookingCompleted(user.token, bookingId);
      setBookings(
        (prev) => prev?.map((b) => (b.id === bookingId ? updated : b)) ?? prev,
      );
    } catch (err) {
      setRespondError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setRespondingId(null);
    }
  };

  const handleRefund = async (booking: BookingRequest) => {
    if (!user || !booking.payment) return;
    if (
      !window.confirm(
        `Refund ${formatMoney(booking.payment.amount, booking.currency)} to ${booking.customer.fullName}? This cancels the booking and can't be undone.`,
      )
    )
      return;
    setRespondError(null);
    setRespondingId(booking.id);
    try {
      await refundPayment(user.token, booking.id);
      setBookings(await getMyBookingRequests(user.token));
    } catch (err) {
      setRespondError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setRespondingId(null);
    }
  };

  if (!user) {
    return (
      <AccessNotice
        title="Sign in to view booking requests"
        message="You need a freelancer account to access this page."
        action="auth"
      />
    );
  }

  if (user.role !== "freelancer") {
    return (
      <AccessNotice
        title="This page is for freelancers"
        message="Your account is set up as a customer."
        action="profile"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 sm:pl-16">
      <SideRail />
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Booking Requests
          </h1>
          <Link
            to="/freelancer/earnings"
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Earnings
          </Link>
        </div>

        {respondError && (
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">
            {respondError}
          </p>
        )}

        {error ? (
          <p className="text-center text-red-600 dark:text-red-400 py-16">
            {error}
          </p>
        ) : bookings === null ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-16">
            Loading booking requests...
          </p>
        ) : bookings.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-16">
            No booking requests yet.
          </p>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-gray-900 dark:text-white font-semibold">
                        {booking.customer.fullName}
                      </h3>
                      {booking.type === "inquiry" && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-400">
                          📞 Call back
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${BOOKING_STATUS_STYLES[booking.status]}`}
                      >
                        {BOOKING_STATUS_LABELS[booking.status]}
                      </span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {booking.customer.email}
                      {booking.customer.phone
                        ? ` · ${booking.customer.phone}`
                        : ""}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    {booking.type === "inquiry" ? (
                      <p className="text-gray-900 dark:text-white font-semibold text-sm">
                        Call back: {booking.phone}
                      </p>
                    ) : (
                      <>
                        <p className="text-gray-900 dark:text-white font-semibold">
                          {formatBookingDate(booking.date)}
                        </p>
                        <p className="text-amber-700 dark:text-amber-400 text-sm font-medium">
                          {booking.time}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                {booking.notes && (
                  <p className="text-gray-700 dark:text-gray-300 text-sm mt-3 border-t border-gray-100 dark:border-gray-800 pt-3">
                    {booking.notes}
                  </p>
                )}
                {booking.amount != null && (
                  <div className="flex items-center justify-between gap-2 flex-wrap mt-3 border-t border-gray-100 dark:border-gray-800 pt-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {booking.hours} h ·{" "}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatMoney(booking.amount, booking.currency)}
                      </span>
                      {booking.payment && (
                        <span className="text-gray-500 dark:text-gray-400">
                          {" "}
                          (you receive{" "}
                          {formatMoney(
                            booking.payment.freelancerAmount,
                            booking.currency,
                          )}
                          )
                        </span>
                      )}
                    </p>
                    {booking.payment ? (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PAYMENT_STATUS_STYLES[booking.payment.status]}`}
                      >
                        {PAYMENT_STATUS_LABELS[booking.payment.status]}
                      </span>
                    ) : booking.status === "accepted" ? (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Waiting for the customer to pay
                      </span>
                    ) : null}
                  </div>
                )}
                {booking.payment?.status === "held" &&
                  booking.workCompletedAt && (
                    <p className="text-sm mt-3 text-gray-500 dark:text-gray-400">
                      Marked as done. Waiting for the customer to release the
                      payment.
                      {booking.payment.autoReleaseAt &&
                        ` If they don't respond, it's released to you automatically on ${formatDeadline(booking.payment.autoReleaseAt)}.`}
                    </p>
                  )}
                {booking.status === "accepted" &&
                  booking.payment?.status === "disputed" && (
                    <div className="mt-3">
                      <div className="text-sm rounded-lg px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300">
                        <p>
                          The customer reported a problem: "
                          {booking.payment.disputeReason}"
                        </p>
                        <p className="mt-1">
                          Sort it out with them, or refund them.
                          {booking.payment.autoReleaseAt &&
                            ` If it isn't resolved, the payment is released to you on ${formatDeadline(booking.payment.autoReleaseAt)}.`}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={respondingId === booking.id}
                        onClick={() => handleRefund(booking)}
                        className="w-full mt-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Refund customer
                      </button>
                    </div>
                  )}
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-3">
                  Requested {formatRequestedAt(booking.createdAt)}
                </p>

                {booking.status === "accepted" &&
                  booking.payment?.status === "held" &&
                  !booking.workCompletedAt && (
                    <button
                      type="button"
                      disabled={respondingId === booking.id}
                      onClick={() => handleComplete(booking.id)}
                      className="w-full mt-3 py-2 rounded-lg bg-amber-500 text-gray-900 text-sm font-semibold hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Mark job as done
                    </button>
                  )}

                {booking.status === "pending" && (
                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      disabled={respondingId === booking.id}
                      onClick={() => handleRespond(booking.id, "accepted")}
                      className="flex-1 py-2 rounded-lg bg-amber-500 text-gray-900 text-sm font-semibold hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      disabled={respondingId === booking.id}
                      onClick={() => handleRespond(booking.id, "declined")}
                      className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
