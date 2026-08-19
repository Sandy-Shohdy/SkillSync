import { useTheme } from "../context/ThemeContext";
import toggleIcon from "../assets/toggle.png";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="flex items-center justify-center w-10 h-10 shrink-0 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
    >
      <img
        src={toggleIcon}
        alt=""
        className={`w-9 h-6 object-contain transition-transform duration-300 ${
          isDark ? "" : "-scale-x-100"
        }`}
      />
    </button>
  );
}
