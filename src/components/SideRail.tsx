import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import defaultAvatar from "../assets/Profile.png";
import settingIcon from "../assets/setting.png";
import toggleIcon from "../assets/toggle.png";

export default function SideRail() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <aside className="hidden sm:flex fixed inset-y-0 left-0 z-30 w-16 flex-col items-center justify-between py-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800">
      <div className="flex flex-col items-center gap-3">
        <Link
          to="/"
          aria-label="SkillSync home"
          className="w-10 h-10 bg-[#1e88e5]/10 backdrop-blur-sm border border-[#1e88e5]/20 rounded-xl flex items-center justify-center shrink-0 transition hover:bg-[#1e88e5]/20"
        >
          <span className="text-[#1e88e5] font-bold text-sm">S</span>
        </Link>

        <Link
          to={user ? "/profile" : "/login"}
          aria-label={user ? "View profile" : "Log in"}
        >
          <img
            src={user?.avatar || defaultAvatar}
            alt={user ? `${user.name}'s profile` : "Log in"}
            className="w-10 h-10 rounded-full object-cover border border-gray-300 dark:border-gray-700"
          />
        </Link>
      </div>

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          className="flex items-center justify-center w-12 h-12 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <img
            src={toggleIcon}
            alt=""
            className={`w-12 h-8 object-contain transition-transform duration-300 ${
              isDark ? "" : "-scale-x-100"
            }`}
          />
        </button>

        <button
          type="button"
          aria-label="Settings"
          className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <img
            src={settingIcon}
            alt=""
            className="w-7 h-7 opacity-60 dark:invert dark:opacity-70"
          />
        </button>
      </div>
    </aside>
  );
}
