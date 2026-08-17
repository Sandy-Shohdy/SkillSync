import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
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
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
            >
              Sign Up
            </Link>
            <Link
              to="/signin"
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm text-center">
          <img
            src={user.avatar}
            alt={`${user.name}'s profile`}
            className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border border-gray-300 dark:border-gray-700"
          />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {user.name}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {user.email}
          </p>
          <span className="inline-block mt-3 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold capitalize">
            {user.role}
          </span>

          <button
            type="button"
            onClick={logout}
            className="w-full mt-8 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
