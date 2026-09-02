import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import SideRail from "../../components/SideRail";
import defaultAvatar from "../../assets/Profile.png";
import { useAuth } from "../../context/AuthContext";
import { categoryLabelFromValue } from "../../data/categories";

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 sm:pl-16">
        <SideRail />
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            You don't have a profile yet
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Sign up or log in to see your profile.
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 sm:pl-16">
      <SideRail />
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm text-center">
          <img
            src={user.avatar || defaultAvatar}
            alt={`${user.name}'s profile`}
            className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border border-gray-300 dark:border-gray-700"
          />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {user.name}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {user.email}
          </p>
          {user.phone && (
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {user.phone}
            </p>
          )}
          <span className="inline-block mt-3 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 text-xs font-semibold capitalize">
            {user.role}
          </span>

          {user.role === "freelancer" && (
            <div className="mt-6 text-left space-y-3">
              {user.category && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Occupation:</span>{" "}
                  {categoryLabelFromValue(user.category)}
                </p>
              )}
              {user.pricePerHour != null && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Price:</span>{" "}
                  {user.pricePerHour} SEK/hour
                </p>
              )}
              {user.bio && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Bio:</span> {user.bio}
                </p>
              )}
              {user.skills && user.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {user.role === "freelancer" && (
            <Link
              to="/freelancer/bookings"
              className="block w-full mt-8 py-2.5 rounded-xl bg-amber-500 text-gray-900 font-semibold text-center hover:bg-amber-600 transition"
            >
              Booking Requests
            </Link>
          )}

          <Link
            to="/profile/edit"
            className={`block w-full py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-center hover:bg-gray-100 dark:hover:bg-gray-800 transition ${
              user.role === "freelancer" ? "mt-3" : "mt-8"
            }`}
          >
            Edit Profile
          </Link>

          <button
            type="button"
            onClick={logout}
            className="w-full mt-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
