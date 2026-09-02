import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import SideRail from "../../components/SideRail";
import FreelancerCard from "../../components/FreelancerCard";
import BookingCard from "../../components/BookingCard";
import AuthRequiredModal from "../../components/AuthRequiredModal";
import FreelancerBookingBlockedModal from "../../components/FreelancerBookingBlockedModal";
import { useAuth } from "../../context/AuthContext";
import {
  createBooking,
  getFreelancers,
  type PublicFreelancer,
} from "../../lib/api";
import { BROWSE_FILTERS, categoryLabelFromValue } from "../../data/categories";

export default function BrowseFreelancers() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [freelancers, setFreelancers] = useState<PublicFreelancer[] | null>(
    null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getFreelancers()
      .then((data) => {
        if (!cancelled) setFreelancers(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : "Failed to load freelancers",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const query = searchQuery.trim().toLowerCase();

  const filteredFreelancers = (freelancers ?? []).filter((freelancer) => {
    if (activeCategory !== "all" && freelancer.category !== activeCategory)
      return false;
    if (query) {
      const categoryLabel = categoryLabelFromValue(freelancer.category);
      const matchesName = freelancer.fullName.toLowerCase().includes(query);
      const matchesCategory = categoryLabel.toLowerCase().includes(query);
      if (!matchesName && !matchesCategory) return false;
    }
    return true;
  });

  const [selectedFreelancer, setSelectedFreelancer] =
    useState<PublicFreelancer | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showFreelancerBlocked, setShowFreelancerBlocked] = useState(false);

  const handleSelect = (freelancerId: string) => {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    if (user.role === "freelancer") {
      setShowFreelancerBlocked(true);
      return;
    }
    const freelancer =
      (freelancers ?? []).find((f) => f.id === freelancerId) ?? null;
    setSelectedFreelancer(freelancer);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 sm:pl-16">
      <SideRail />

      {/* Sticky header group: navbar + category pills stack with zero gap,
          since they're plain children of one sticky container rather than
          independently-positioned elements. */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <Navbar searchValue={searchQuery} onSearchChange={setSearchQuery} />

        {/* Category Pills */}
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-2 overflow-x-auto border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          {BROWSE_FILTERS.map((category) => {
            const isActive = category.key === activeCategory;
            return (
              <button
                key={category.key}
                type="button"
                onClick={() => setActiveCategory(category.key)}
                className={`flex items-center gap-1.5 pl-3 pr-5 py-1.5  sm:pl-4 sm:pr-7 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition  ${
                  isActive
                    ? "bg-amber-500 text-gray-900"
                    : "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {"image" in category ? (
                  <img
                    src={category.image}
                    alt=""
                    className="w-4 h-4 object-contain"
                  />
                ) : (
                  <span className="w-4 h-4 flex items-center justify-center text-sm leading-none">
                    {category.icon}
                  </span>
                )}
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Listings */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {loadError ? (
          <p className="text-center text-red-600 dark:text-red-400 py-16">
            {loadError}
          </p>
        ) : freelancers === null ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-16">
            Loading freelancers...
          </p>
        ) : filteredFreelancers.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-16">
            {freelancers.length === 0
              ? "No freelancers have joined yet."
              : "No freelancers match your filters."}
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredFreelancers.map((freelancer) => (
              <FreelancerCard
                key={freelancer.id}
                freelancer={freelancer}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}
      </div>

      {selectedFreelancer && user && (
        <BookingCard
          freelancer={selectedFreelancer}
          onClose={() => setSelectedFreelancer(null)}
          onConfirm={({ date, time, notes }) =>
            createBooking(user.token, {
              freelancerId: selectedFreelancer.id,
              date,
              time,
              notes: notes || undefined,
            })
          }
        />
      )}

      {showAuthPrompt && (
        <AuthRequiredModal onClose={() => setShowAuthPrompt(false)} />
      )}

      {showFreelancerBlocked && (
        <FreelancerBookingBlockedModal
          onClose={() => setShowFreelancerBlocked(false)}
        />
      )}
    </div>
  );
}
