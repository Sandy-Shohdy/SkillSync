import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import SideRail from "../../components/SideRail";
import { useAuth } from "../../context/AuthContext";
import { CATEGORIES } from "../../data/categories";

const STATS = [
  { value: "500+", label: "Verified pros" },
  { value: "8", label: "Service categories" },
  { value: "4.9★", label: "Average rating" },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 sm:pl-16">
      <SideRail />
      <Navbar />

      {/* Intro */}
      <div className="relative overflow-hidden bg-gradient-to-b from-amber-50 via-amber-50 to-gray-50 dark:from-amber-900/10 dark:via-gray-950 dark:to-gray-950 border-b border-amber-100 dark:border-amber-900/40">
        {/* Decorative glow blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-amber-300/40 dark:bg-amber-500/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 -right-24 w-96 h-96 bg-orange-300/30 dark:bg-orange-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-14 sm:pt-24 sm:pb-20 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-white/5 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-semibold">
              ✨ Now booking across Stockholm
            </span>

            <h1 className="mt-5 text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-gray-900 dark:text-white">
              Skilled help,{" "}
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                minutes away.
              </span>
            </h1>

            <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg mt-6 max-w-xl mx-auto lg:mx-0">
              SkillSync connects you with vetted local pros — repair techs,
              tutors, cleaners, and more. Browse services, compare ratings, and
              book a time that works for you.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mt-8">
              <Link
                to={user ? "/profile" : "/signup"}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-amber-500 text-gray-900 font-bold shadow-lg shadow-amber-500/30 hover:bg-amber-600 hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-0.5 transition"
              >
                Get Started
              </Link>
              <Link
                to="/services"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 hover:-translate-y-0.5 transition text-center"
              >
                Browse Services →
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center lg:justify-start gap-8 mt-10">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Category showcase */}
          <div className="flex-1 grid grid-cols-4 gap-3 sm:gap-4 max-w-sm w-full">
            {CATEGORIES.filter((c) => "image" in c).map((category, i) => (
              <div
                key={category.key}
                className={`aspect-square bg-white dark:bg-gray-900 border border-amber-100 dark:border-amber-800 rounded-2xl flex items-center justify-center shadow-md hover:shadow-xl hover:-translate-y-1 hover:rotate-3 transition duration-300 ${
                  i % 2 === 0 ? "hover:-rotate-3" : ""
                }`}
              >
                <img
                  src={category.image}
                  alt=""
                  className="w-9 h-9 sm:w-11 sm:h-11 object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Feature highlights */}
        <div className="relative border-t border-amber-100 dark:border-amber-900/40">
          <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { icon: "⚡", label: "Fast booking" },
              { icon: "💰", label: "Fair prices" },
              { icon: "🔒", label: "Secure payments" },
              { icon: "⭐", label: "Top rated pros" },
            ].map((feature) => (
              <div
                key={feature.label}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-xl">
                  {feature.icon}
                </div>
                <span className="text-gray-900 dark:text-white font-semibold text-sm">
                  {feature.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
