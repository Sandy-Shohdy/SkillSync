import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import SideRail from "../../components/SideRail";
import AccessNotice from "../../components/AccessNotice";
import defaultAvatar from "../../assets/Profile.png";
import { useAuth } from "../../context/AuthContext";
import {
  cancelBooking,
  getMyBookings,
  markAllNotificationsRead,
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
  formatBookingDate,
  formatRequestedAt,
} from "../../lib/bookingDisplay";

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<CustomerBooking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

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
    markAllNotificationsRead(user.token).catch(() => {});
  }, [user]);

  const handleCancel = async (bookingId: string) => {
    if (!user) return;
    if (!window.confirm("Cancel this booking?")) return;
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
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-3">
                    Requested {formatRequestedAt(booking.createdAt)}
                  </p>

                  {(booking.status === "pending" ||
                    booking.status === "accepted") && (
                    <button
                      type="button"
                      disabled={cancellingId === booking.id}
                      onClick={() => handleCancel(booking.id)}
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
    </div>
  );
}
