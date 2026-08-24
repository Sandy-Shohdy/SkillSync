import { Link } from "react-router-dom";

interface AuthRequiredModalProps {
  onClose: () => void;
}

export default function AuthRequiredModal({ onClose }: AuthRequiredModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none"
        >
          &times;
        </button>

        <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-2">
          Sign in to book
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          You need an account to book a service.
        </p>

        <div className="flex items-center justify-center gap-3 mt-6">
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
