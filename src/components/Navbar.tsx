import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";
import defaultAvatar from "../assets/Profile.png";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-gray-900 dark:text-white font-bold text-lg hidden sm:inline">
            SkillSync
          </span>
        </a>

        {/* Search */}
        <div className="relative flex-1 min-w-[180px] order-3 sm:order-none w-full sm:w-auto">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search services, skills, or neighbourhoods..."
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-800 transition"
          />
        </div>

        {/* Location */}
        <button
          type="button"
          className="flex items-center justify-center gap-1.5 w-10 h-10 md:w-auto md:px-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition shrink-0"
        >
          <span>📍</span>
          <span className="hidden md:inline">Stockholm, Sweden</span>
        </button>

        {/* Theme toggle & profile move to the side rail on sm+ screens */}
        <div className="sm:hidden shrink-0">
          <ThemeToggle />
        </div>

        <Link
          to={user ? "/profile" : "/login"}
          className="sm:hidden shrink-0"
          aria-label={user ? "View profile" : "Log in"}
        >
          <img
            src={user?.avatar || defaultAvatar}
            alt={user ? `${user.name}'s profile` : "Log in"}
            className="w-10 h-10 rounded-full object-cover border border-gray-300 dark:border-gray-700"
          />
        </Link>
      </div>
    </header>
  );
}
