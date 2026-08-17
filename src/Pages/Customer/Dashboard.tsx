import { useState } from "react";
import Navbar from "../../components/Navbar";
import ServiceCard, { type Service } from "../../components/ServiceCard";

const CATEGORIES = [
  { key: "all", label: "All", icon: "✨" },
  { key: "repairs", label: "Repairs", icon: "🔧" },
  { key: "tutoring", label: "Tutoring", icon: "📚" },
  { key: "food", label: "Food", icon: "🧁" },
  { key: "beauty", label: "Beauty", icon: "✂️" },
  { key: "garden", label: "Garden", icon: "🌿" },
  { key: "cleaning", label: "Cleaning", icon: "🧹" },
  { key: "photography", label: "Photography", icon: "📷" },
  { key: "pet_care", label: "Pet Care", icon: "🐾" },
];

const SERVICES: Service[] = [
  {
    id: "1",
    name: "Marta's Appliance Repair",
    category: "repairs",
    categoryIcon: "🔧",
    neighbourhood: "Södermalm",
    distanceKm: 0.4,
    rating: 4.9,
    reviewCount: 84,
    available: true,
    tags: ["Same-day", "Certified", "Washing machines"],
    price: 45,
    priceUnit: "per visit",
  },
  {
    id: "2",
    name: "Paulo's Guitar Lessons",
    category: "tutoring",
    categoryIcon: "📚",
    neighbourhood: "Östermalm",
    distanceKm: 0.7,
    rating: 5,
    reviewCount: 41,
    available: true,
    tags: ["Beginners welcome", "Classical & Rock", "Online available"],
    price: 35,
    priceUnit: "per 60 min",
  },
  {
    id: "3",
    name: "Green Thumb Garden Co.",
    category: "garden",
    categoryIcon: "🌿",
    neighbourhood: "Vasastan",
    distanceKm: 1.1,
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
    categoryIcon: "🧁",
    neighbourhood: "Kungsholmen",
    distanceKm: 1.6,
    rating: 4.7,
    reviewCount: 63,
    available: false,
    tags: ["Custom cakes", "Vegan options"],
    price: 30,
    priceUnit: "starting price",
  },
  {
    id: "5",
    name: "Sofia's Nail Studio",
    category: "beauty",
    categoryIcon: "✂️",
    neighbourhood: "Gamla Stan",
    distanceKm: 0.3,
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
    categoryIcon: "🧹",
    neighbourhood: "Norrmalm",
    distanceKm: 2.3,
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
    categoryIcon: "📷",
    neighbourhood: "Djurgården",
    distanceKm: 3.1,
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
    categoryIcon: "🐾",
    neighbourhood: "Hägersten",
    distanceKm: 0.9,
    rating: 5,
    reviewCount: 39,
    available: true,
    tags: ["Dog walking", "Overnight stays"],
    price: 18,
    priceUnit: "per visit",
  },
];

const RADIUS_OPTIONS = [1, 2, 5, 10, 20];
const RATING_OPTIONS = [
  { value: 0, label: "Any" },
  { value: 4, label: "4+" },
  { value: 4.5, label: "4.5+" },
];

export default function Dashboard() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [radiusKm, setRadiusKm] = useState(5);
  const [minRating, setMinRating] = useState(0);
  const [availableOnly, setAvailableOnly] = useState(false);

  const filteredServices = SERVICES.filter((service) => {
    if (activeCategory !== "all" && service.category !== activeCategory)
      return false;
    if (service.distanceKm > radiusKm) return false;
    if (service.rating < minRating) return false;
    if (availableOnly && !service.available) return false;
    return true;
  });

  const handleSelect = (serviceId: string) => {
    console.log("Selected service:", serviceId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

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
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <span>{category.icon}</span>
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
          Within
          <select
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {RADIUS_OPTIONS.map((km) => (
              <option key={km} value={km}>
                {km} km
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          Min rating
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              availableOnly ? "bg-emerald-600" : "bg-gray-300 dark:bg-gray-700"
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
    </div>
  );
}
