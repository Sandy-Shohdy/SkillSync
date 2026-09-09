import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import SideRail from "../components/SideRail";
import AccessNotice from "../components/AccessNotice";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const cardClass =
  "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5";
const checkboxClass =
  "w-4 h-4 rounded border-gray-300 dark:border-gray-600 accent-amber-500";

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isFreelancer = user?.role === "freelancer";

  const [notifyBookingUpdates, setNotifyBookingUpdates] = useState(true);
  const [notifyNewRequests, setNotifyNewRequests] = useState(true);
  const [notifyProductTips, setNotifyProductTips] = useState(false);
  const [acceptingBookings, setAcceptingBookings] = useState(true);
  const [showPhonePublicly, setShowPhonePublicly] = useState(false);
  const [showExactLocation, setShowExactLocation] = useState(true);

  if (!user) {
    return (
      <AccessNotice
        title="Sign in to view settings"
        message="You need an account to access settings."
        action="auth"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 sm:pl-16">
      <SideRail />
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 space-y-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          Manage how SkillSync looks and behaves for your account.
        </p>

        <div className={cardClass}>
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">
            Appearance
          </h2>
          <label className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
            Dark mode
            <input
              type="checkbox"
              checked={theme === "dark"}
              onChange={toggleTheme}
              className={checkboxClass}
            />
          </label>
        </div>

        <div className={cardClass}>
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">
            Account
          </h2>
          <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
            <p>
              <span className="font-medium text-gray-900 dark:text-white">
                Name:
              </span>{" "}
              {user.name}
            </p>
            <p>
              <span className="font-medium text-gray-900 dark:text-white">
                Email:
              </span>{" "}
              {user.email}
            </p>
            <p>
              <span className="font-medium text-gray-900 dark:text-white">
                Phone:
              </span>{" "}
              {user.phone || "Not set"}
            </p>
          </div>
          <Link
            to="/profile/edit"
            className="inline-block mt-3 text-amber-700 dark:text-amber-400 text-sm font-semibold hover:text-amber-800 dark:hover:text-amber-300 transition"
          >
            Edit profile details →
          </Link>
        </div>

        <div className={cardClass}>
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">
            Notifications{" "}
            <span className="text-xs font-normal text-gray-400">
              (preview)
            </span>
          </h2>
          <div className="space-y-2">
            <label className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
              Booking updates
              <input
                type="checkbox"
                checked={notifyBookingUpdates}
                onChange={() => setNotifyBookingUpdates((v) => !v)}
                className={checkboxClass}
              />
            </label>
            {isFreelancer && (
              <label className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                New booking requests
                <input
                  type="checkbox"
                  checked={notifyNewRequests}
                  onChange={() => setNotifyNewRequests((v) => !v)}
                  className={checkboxClass}
                />
              </label>
            )}
            <label className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
              Product tips & news
              <input
                type="checkbox"
                checked={notifyProductTips}
                onChange={() => setNotifyProductTips((v) => !v)}
                className={checkboxClass}
              />
            </label>
          </div>
        </div>

        {isFreelancer && (
          <div className={cardClass}>
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">
              Availability{" "}
              <span className="text-xs font-normal text-gray-400">
                (preview)
              </span>
            </h2>
            <label className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
              Accepting new bookings
              <input
                type="checkbox"
                checked={acceptingBookings}
                onChange={() => setAcceptingBookings((v) => !v)}
                className={checkboxClass}
              />
            </label>
          </div>
        )}

        {isFreelancer && (
          <div className={cardClass}>
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">
              Privacy{" "}
              <span className="text-xs font-normal text-gray-400">
                (preview)
              </span>
            </h2>
            <div className="space-y-2">
              <label className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                Show phone number on profile
                <input
                  type="checkbox"
                  checked={showPhonePublicly}
                  onChange={() => setShowPhonePublicly((v) => !v)}
                  className={checkboxClass}
                />
              </label>
              <label className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                Show exact location
                <input
                  type="checkbox"
                  checked={showExactLocation}
                  onChange={() => setShowExactLocation((v) => !v)}
                  className={checkboxClass}
                />
              </label>
            </div>
          </div>
        )}

        <div className={cardClass}>
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">
            Account actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={logout}
              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Log Out
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-xl border border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-950/40 transition"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
