import { useState } from "react";
import Navbar from "../../components/Navbar";
import SideRail from "../../components/SideRail";
import ServiceCard, { type Service } from "../../components/ServiceCard";
import BookingCard from "../../components/BookingCard";
import AuthRequiredModal from "../../components/AuthRequiredModal";
import { useAuth } from "../../context/AuthContext";
import { CATEGORIES, SERVICES } from "../../data/services";

export default function BrowseFreelancers() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const query = searchQuery.trim().toLowerCase();

  const filteredServices = SERVICES.filter((service) => {
    if (activeCategory !== "all" && service.category !== activeCategory)
      return false;
    if (availableOnly && !service.available) return false;
    if (query) {
      const occupation =
        CATEGORIES.find((c) => c.key === service.category)?.label ??
        service.category;
      const matchesName = service.name.toLowerCase().includes(query);
      const matchesOccupation = occupation.toLowerCase().includes(query);
      if (!matchesName && !matchesOccupation) return false;
    }
    return true;
  });

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const handleSelect = (serviceId: string) => {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    const service = SERVICES.find((s) => s.id === serviceId) ?? null;
    setSelectedService(service);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 sm:pl-16">
      <SideRail />

      {/* Sticky header group: navbar + category pills + filters stack with zero gap,
          since they're plain children of one sticky container rather than three
          independently-positioned elements. */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <Navbar searchValue={searchQuery} onSearchChange={setSearchQuery} />

        {/* Category Pills */}
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((category) => {
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

          <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 cursor-pointer shrink-0">
            <span className="hidden sm:inline">Available</span>
            <button
              type="button"
              role="switch"
              aria-checked={availableOnly}
              onClick={() => setAvailableOnly((prev) => !prev)}
              className={`relative w-10 h-6 rounded-full transition ${
                availableOnly ? "bg-amber-500" : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  availableOnly ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </label>
        </div>
      </div>

      {/* Listings */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {filteredServices.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-16">
            No services match your filters.
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}
      </div>

      {selectedService && (
        <BookingCard
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onConfirm={({ date, time }) => {
            console.log("Booking confirmed:", {
              serviceId: selectedService.id,
              date,
              time,
            });
          }}
        />
      )}

      {showAuthPrompt && (
        <AuthRequiredModal onClose={() => setShowAuthPrompt(false)} />
      )}
    </div>
  );
}
