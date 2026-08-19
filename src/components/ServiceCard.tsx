export interface Service {
  id: string;
  name: string;
  category: string;
  categoryIcon: string;
  neighbourhood: string;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  available: boolean;
  tags: string[];
  price: number;
  priceUnit: string;
}

interface ServiceCardProps {
  service: Service;
  onSelect: (serviceId: string) => void;
}

export default function ServiceCard({ service, onSelect }: ServiceCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(service.id)}
      className="w-full text-left flex gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md transition duration-300"
    >
      {/* Thumbnail */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg flex items-center justify-center text-3xl">
        {service.categoryIcon}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-gray-900 dark:text-white font-semibold truncate">
              {service.name}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {service.neighbourhood} · {service.distanceKm} km
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-gray-900 dark:text-white font-bold">
              SEK {service.price}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-xs">
              {service.priceUnit}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className="flex items-center gap-1 text-sm text-amber-500">
            ⭐ {service.rating}
            <span className="text-gray-500 dark:text-gray-400">
              ({service.reviewCount})
            </span>
          </span>
          {service.available && (
            <span className="flex items-center gap-1 text-xs text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-full px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Available
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mt-2">
          {service.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-2 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
