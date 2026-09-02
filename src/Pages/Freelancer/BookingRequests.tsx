import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import SideRail from "../../components/SideRail";
import { useAuth } from "../../context/AuthContext";
import { getMyBookingRequests, type BookingRequest } from "../../lib/api";

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

export default function BookingRequests() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 sm:pl-16">
        <SideRail />
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Sign in to view booking requests
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            You need a freelancer account to access this page.
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

  if (user.role !== "freelancer") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 sm:pl-16">
        <SideRail />
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            This page is for freelancers
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Your account is set up as a customer.
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
          Booking Requests
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          Customers who want to book you.
        </p>

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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-gray-900 dark:text-white font-semibold">
                      {booking.customer.fullName}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {booking.customer.email}
                      {booking.customer.phone
                        ? ` · ${booking.customer.phone}`
                        : ""}
                    </p>
                  </div>
                  <div className="sm:text-right">
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
