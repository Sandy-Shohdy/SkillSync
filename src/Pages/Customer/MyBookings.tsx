import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import SideRail from "../../components/SideRail";
import defaultAvatar from "../../assets/Profile.png";
import { useAuth } from "../../context/AuthContext";
import {
  getMyBookings,
  resolveAssetUrl,
  type CustomerBooking,
} from "../../lib/api";
import {
  categoryLabelFromValue,
  resolveAvatarFallback,
} from "../../data/categories";

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatRequestedAt(createdAt: string) {
  return new Date(createdAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const STATUS_STYLES: Record<CustomerBooking["status"], string> = {
  pending:
    "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400",
  accepted:
    "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400",
  declined: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
};

const STATUS_LABELS: Record<CustomerBooking["status"], string> = {
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
};

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<CustomerBooking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 sm:pl-16">
        <SideRail />
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Sign in to view your bookings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            You need a customer account to access this page.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/signup"
              className="px-5 py-2.5 rounded-xl bg-amber-500 text-gray-900 font-semibold hover:bg-amber-600 transition"
            >
              Sign Up
            </Link>
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (user.role !== "customer") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 sm:pl-16">
        <SideRail />
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            This page is for customers
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Your account is set up as a freelancer.
          </p>
          <Link
            to="/profile"
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-gray-900 font-semibold hover:bg-amber-600 transition inline-block"
          >
            Back to Profile
          </Link>
        </div>
      </div>
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
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[booking.status]}`}
                          >
                            {STATUS_LABELS[booking.status]}
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
                      <p className="text-gray-900 dark:text-white font-semibold">
                        {formatDate(booking.date)}
                      </p>
                      <p className="text-amber-700 dark:text-amber-400 text-sm font-medium">
                        {booking.time}
                      </p>
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
