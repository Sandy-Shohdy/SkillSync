import { useState } from "react";
import Navbar from "../../components/Navbar";
import SideRail from "../../components/SideRail";
import ServiceCard, { type Service } from "../../components/ServiceCard";
import BookingCard from "../../components/BookingCard";
import AuthRequiredModal from "../../components/AuthRequiredModal";
import { useAuth } from "../../context/AuthContext";
import repairIcon from "../../assets/repair.png";
import tutoringIcon from "../../assets/tutoring.png";
import gardenIcon from "../../assets/garden.png";
import foodIcon from "../../assets/food.png";
import beautyIcon from "../../assets/beauty.png";
import cleaningIcon from "../../assets/clean.png";
import photographyIcon from "../../assets/photographi.png";
import petCareIcon from "../../assets/petCare.png";

const CATEGORIES = [
  { key: "all", label: "All", icon: "✨" },
  { key: "repairs", label: "Repairs", image: repairIcon },
  { key: "tutoring", label: "Tutoring", image: tutoringIcon },
  { key: "food", label: "Food", image: foodIcon },
  { key: "beauty", label: "Beauty", image: beautyIcon },
  { key: "garden", label: "Garden", image: gardenIcon },
  { key: "cleaning", label: "Cleaning", image: cleaningIcon },
  { key: "photography", label: "Photography", image: photographyIcon },
  { key: "pet_care", label: "Pet Care", image: petCareIcon },
];

const SERVICES: Service[] = [
  {
    id: "1",
    name: "Marta's Appliance Repair",
    category: "repairs",
    categoryImage: repairIcon,
    neighbourhood: "Södermalm",
    rating: 4.9,
    reviewCount: 84,
    available: true,
    tags: ["Same-day", "Certified", "Washing machines"],
    price: 45,
    priceUnit: "per hour",
  },
  {
    id: "2",
    name: "Paulo's Guitar Lessons",
    category: "tutoring",
    categoryImage: tutoringIcon,
    neighbourhood: "Östermalm",
    rating: 5,
    reviewCount: 41,
    available: true,
    tags: ["Beginners welcome", "Classical & Rock", "Online available"],
    price: 35,
    priceUnit: "per hour",
  },
  {
    id: "3",
    name: "Green Thumb Garden Co.",
    category: "garden",
    categoryImage: gardenIcon,
    neighbourhood: "Vasastan",
    rating: 4.8,
    reviewCount: 127,
    available: true,
    tags: ["Balconies", "Full gardens", "Seasonal planting"],
    price: 55,
    priceUnit: "per hour",
  },
  {
    id: "4",
    name: "Lena's Home Bakes",
    category: "food",
    categoryImage: foodIcon,
    neighbourhood: "Kungsholmen",
    rating: 4.7,
    reviewCount: 63,
    available: false,
    tags: ["Custom cakes", "Vegan options"],
    price: 30,
    priceUnit: "per hour",
  },
  {
    id: "5",
    name: "Sofia's Nail Studio",
    category: "beauty",
    categoryImage: beautyIcon,
    neighbourhood: "Gamla Stan",
    rating: 4.9,
    reviewCount: 152,
    available: true,
    tags: ["Gel", "Manicure", "Walk-ins"],
    price: 28,
    priceUnit: "per session",
  },
  {
    id: "6",
    name: "Sparkle Clean Stockholm",
    category: "cleaning",
    categoryImage: cleaningIcon,
    neighbourhood: "Norrmalm",
    rating: 4.6,
    reviewCount: 98,
    available: true,
    tags: ["Deep clean", "Eco products", "Insured"],
    price: 22,
    priceUnit: "per hour",
  },
  {
    id: "7",
    name: "Dev's Photo Studio",
    category: "photography",
    categoryImage: photographyIcon,
    neighbourhood: "Djurgården",
    rating: 4.9,
    reviewCount: 76,
    available: false,
    tags: ["Portraits", "Events", "Studio & outdoor"],
    price: 90,
    priceUnit: "per hour",
  },
  {
    id: "8",
    name: "Happy Paws Pet Sitting",
    category: "pet_care",
    categoryImage: petCareIcon,
    neighbourhood: "Hägersten",
    rating: 5,
    reviewCount: 39,
    available: true,
    tags: ["Dog walking", "Overnight stays"],
    price: 18,
    priceUnit: "per hour",
  },
];

const RATING_OPTIONS = [
  { value: 0, label: "Any" },
  { value: 4, label: "4+" },
  { value: 4.5, label: "4.5+" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const query = searchQuery.trim().toLowerCase();

  const filteredServices = SERVICES.filter((service) => {
    if (activeCategory !== "all" && service.category !== activeCategory)
      return false;
    if (service.rating < minRating) return false;
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

  const [selectedService, setSelectedService] = useState<Service | null>(
    null
  );
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
      <Navbar searchValue={searchQuery} onSearchChange={setSearchQuery} />

      {/* Category Pills */}
      <div className="max-w-6xl mx-auto px-4 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((category) => {
            const isActive = category.key === activeCategory;
            return (
              <button
                key={category.key}
                type="button"
                onClick={() => setActiveCategory(category.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
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
                  <span>{category.icon}</span>
                )}
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center gap-4 text-sm border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <span className="text-gray-500 dark:text-gray-400">
          {filteredServices.length} found
        </span>

        <label className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          Min rating
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {RATING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-gray-500 dark:text-gray-400 cursor-pointer ml-auto">
          Available now
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
