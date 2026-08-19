import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import SideRail from "../../components/SideRail";
import emailIcon from "../../assets/Email.png";
import hiddenPassIcon from "../../assets/HiddenPass.png";
import showPassIcon from "../../assets/ShowPass.png";
import profileIcon from "../../assets/Profile.png";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { signin } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signin({
      name: formData.email.split("@")[0],
      email: formData.email,
      role: "customer",
      avatar: profileIcon,
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 sm:pl-16 transition-colors">
      <SideRail />
      <Navbar />

      <div className="flex items-center justify-center py-8 px-4 sm:py-12">
        {/* Main Container */}
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  SkillSync
                </h1>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Connect with skilled professionals around you. Sign in to
                explore opportunities.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="alex@example.com"
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-300"
                  />
                  <img
                    src={emailIcon}
                    alt=""
                    className="absolute right-3 top-3.5 w-5 h-5 opacity-40 dark:invert dark:opacity-50"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-emerald-600 transition"
                  >
                    {showPassword ? (
                      <img
                        src={showPassIcon}
                        alt="Hide password"
                        className="w-5 h-5 dark:invert"
                      />
                    ) : (
                      <img
                        src={hiddenPassIcon}
                        alt="Show password"
                        className="w-5 h-5 dark:invert"
                      />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-sm pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 accent-emerald-600"
                  />
                  <span className="text-gray-600 dark:text-gray-300">
                    Remember me
                  </span>
                </label>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 mt-6 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition duration-300 uppercase tracking-wider text-sm"
              >
                Sign In
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="text-center text-gray-500 dark:text-gray-400 mt-6 text-sm">
              New to SkillSync?{" "}
              <a
                href="/signup"
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:text-emerald-700 dark:hover:text-emerald-300 transition"
              >
                Create an account
              </a>
            </p>
          </div>

          {/* Footer Text */}
          <p className="text-center text-gray-400 dark:text-gray-600 text-xs mt-6">
            🔒 Your data is encrypted and secure
          </p>
        </div>
      </div>
    </div>
  );
}
