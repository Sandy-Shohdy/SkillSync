import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import SideRail from "../../components/SideRail";
import AccessNotice from "../../components/AccessNotice";
import PaymentModal from "../../components/PaymentModal";
import ReportProblemModal from "../../components/ReportProblemModal";
import defaultAvatar from "../../assets/Profile.png";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../hooks/useNotifications";
import {
  cancelBooking,
  disputePayment,
  getMyBookings,
  payForBooking,
  releasePayment,
  resolveAssetUrl,
  type CustomerBooking,
} from "../../lib/api";
import {
  categoryLabelFromValue,
  resolveAvatarFallback,
} from "../../data/categories";
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

export default function MyBookings() {
  const { user } = useAuth();
  const { markAllRead } = useNotifications();
  const [bookings, setBookings] = useState<CustomerBooking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [payingBooking, setPayingBooking] = useState<CustomerBooking | null>(
    null,
  );
  const [releasingId, setReleasingId] = useState<string | null>(null);
  const [reportingBooking, setReportingBooking] =
    useState<CustomerBooking | null>(null);

  const refreshBookings = async () => {
    if (!user) return;
    setBookings(await getMyBookings(user.token));
  };

  useEffect(() => {
    if (!user || user.role !== "customer") return;
    let cancelled = false;
    getMyBookings(user.token)
      .then((data) => {
        if (!cancelled) setBookings(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load bookings",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== "customer") return;
    markAllRead();
  }, [user, markAllRead]);

  const handleRelease = async (booking: CustomerBooking) => {
    if (!user || !booking.payment) return;
    if (
      !window.confirm(
        `Release ${formatMoney(booking.payment.amount, booking.currency)} to ${booking.freelancer.fullName}? Only do this once the job is done. It can't be undone.`,
      )
    )
      return;
    setCancelError(null);
    setReleasingId(booking.id);
    try {
      await releasePayment(user.token, booking.id);
      await refreshBookings();
    } catch (err) {
      setCancelError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setReleasingId(null);
    }
  };

  const handleCancel = async (booking: CustomerBooking) => {
    if (!user) return;
    const bookingId = booking.id;
    const message =
      booking.payment?.status === "held"
        ? `Cancel this booking? You'll be refunded ${formatMoney(booking.payment.amount, booking.currency)}.`
        : "Cancel this booking?";
    if (!window.confirm(message)) return;
    setCancelError(null);
    setCancellingId(bookingId);
    try {
      const updated = await cancelBooking(user.token, bookingId);
      setBookings(
        (prev) => prev?.map((b) => (b.id === bookingId ? updated : b)) ?? prev,
      );
    } catch (err) {
      setCancelError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setCancellingId(null);
    }
  };

  if (!user) {
    return (
      <AccessNotice
        title="Sign in to view your bookings"
        message="You need a customer account to access this page."
        action="auth"
      />
    );
  }

  if (user.role !== "customer") {
    return (
      <AccessNotice
        title="This page is for customers"
        message="Your account is set up as a freelancer."
        action="profile"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 sm:pl-16">
      <SideRail />
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
          My Bookings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          Services you've requested.
        </p>

        {cancelError && (
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">
            {cancelError}
          </p>
        )}

        {error ? (
          <p className="text-center text-red-600 dark:text-red-400 py-16">
            {error}
          </p>
        ) : bookings === null ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-16">
            Loading your bookings...
          </p>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              You haven't booked anyone yet.
            </p>
            <Link
              to="/services"
              className="px-5 py-2.5 rounded-xl bg-amber-500 text-gray-900 font-semibold hover:bg-amber-600 transition inline-block"
            >
              Browse Services
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => {
              const avatarSrc =
                resolveAvatarFallback(
                  resolveAssetUrl(booking.freelancer.avatarUrl),
                  true,
                  booking.freelancer.category,
                ) ?? defaultAvatar;

              return (
                <div
                  key={booking.id}
                  className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={avatarSrc}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover border border-amber-100 dark:border-amber-800 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-gray-900 dark:text-white font-semibold">
                            {booking.freelancer.fullName}
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
                          {[
                            categoryLabelFromValue(booking.freelancer.category),
                            booking.freelancer.location,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                    </div>
                    <div className="sm:text-right shrink-0">
                      {booking.type === "inquiry" ? (
                        <p className="text-gray-900 dark:text-white font-semibold text-sm">
                          They'll call {booking.phone}
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
                      </p>
                      {booking.payment ? (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PAYMENT_STATUS_STYLES[booking.payment.status]}`}
                        >
                          {PAYMENT_STATUS_LABELS[booking.payment.status]} ·
                          card •••• {booking.payment.cardLast4}
                        </span>
                      ) : booking.status === "pending" ? (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Pay after the freelancer accepts
                        </span>
                      ) : null}
                    </div>
                  )}

                  {booking.payment?.status === "held" &&
                    booking.workCompletedAt && (
                      <p className="text-sm mt-3 rounded-lg px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                        {booking.freelancer.fullName} marked this job as done.
                        Release the payment if you're happy, or report a
                        problem.
                        {booking.payment.autoReleaseAt &&
                          ` If you do neither, it's released automatically on ${formatDeadline(booking.payment.autoReleaseAt)}.`}
                      </p>
                    )}

                  {booking.payment?.status === "disputed" && (
                    <div className="text-sm mt-3 rounded-lg px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300">
                      <p>
                        You reported a problem: "{booking.payment.disputeReason}"
                      </p>
                      <p className="mt-1">
                        {booking.freelancer.fullName} can fix it or refund you.
                        {booking.payment.autoReleaseAt &&
                          ` If it isn't resolved, the payment is released to them on ${formatDeadline(booking.payment.autoReleaseAt)}.`}
                      </p>
                    </div>
                  )}

                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-3">
                    Requested {formatRequestedAt(booking.createdAt)}
                  </p>

                  {booking.status === "accepted" &&
                    booking.amount != null &&
                    !booking.payment && (
                      <button
                        type="button"
                        onClick={() => setPayingBooking(booking)}
                        className="w-full mt-3 py-2 rounded-lg bg-amber-500 text-gray-900 text-sm font-semibold hover:bg-amber-600 transition"
                      >
                        Pay {formatMoney(booking.amount, booking.currency)}
                      </button>
                    )}

                  {booking.status === "accepted" &&
                    (booking.payment?.status === "held" ||
                      booking.payment?.status === "disputed") && (
                      <button
                        type="button"
                        disabled={releasingId === booking.id}
                        onClick={() => handleRelease(booking)}
                        className="w-full mt-3 py-2 rounded-lg bg-amber-500 text-gray-900 text-sm font-semibold hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {releasingId === booking.id
                          ? "Releasing..."
                          : "Job done: release payment"}
                      </button>
                    )}

                  {booking.status === "accepted" &&
                    booking.payment?.status === "held" &&
                    booking.workCompletedAt && (
                      <button
                        type="button"
                        onClick={() => setReportingBooking(booking)}
                        className="w-full mt-3 py-2 rounded-lg border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                      >
                        Report a problem
                      </button>
                    )}

                  {(booking.status === "pending" ||
                    booking.status === "accepted") &&
                    !booking.workCompletedAt && (
                    <button
                      type="button"
                      disabled={cancellingId === booking.id}
                      onClick={() => handleCancel(booking)}
                      className="w-full mt-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancellingId === booking.id
                        ? "Cancelling..."
                        : "Cancel Booking"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {payingBooking && payingBooking.amount != null && (
        <PaymentModal
          amount={payingBooking.amount}
          currency={payingBooking.currency}
          freelancerName={payingBooking.freelancer.fullName}
          onClose={() => setPayingBooking(null)}
          onPay={async (payload) => {
            await payForBooking(user.token, payingBooking.id, payload);
            await refreshBookings().catch(() => {});
          }}
        />
      )}

      {reportingBooking && (
        <ReportProblemModal
          freelancerName={reportingBooking.freelancer.fullName}
          onClose={() => setReportingBooking(null)}
          onSubmit={async (reason) => {
            await disputePayment(user.token, reportingBooking.id, reason);
            await refreshBookings().catch(() => {});
          }}
        />
      )}
    </div>
  );
}
