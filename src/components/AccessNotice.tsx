import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import SideRail from "./SideRail";

interface AccessNoticeProps {
  title: string;
  message: string;
  action: "auth" | "profile";
}

export default function AccessNotice({
  title,
  message,
  action,
}: AccessNoticeProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 sm:pl-16">
      <SideRail />
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{message}</p>
        {action === "auth" ? (
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
        ) : (
          <Link
            to="/profile"
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-gray-900 font-semibold hover:bg-amber-600 transition inline-block"
          >
            Back to Profile
          </Link>
        )}
      </div>
    </div>
  );
}
