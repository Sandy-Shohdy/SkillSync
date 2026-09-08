import defaultAvatar from "../assets/Profile.png";
import { resolveAssetUrl, type PublicFreelancer } from "../lib/api";
import {
  categoryLabelFromValue,
  resolveAvatarFallback,
} from "../data/categories";

interface FreelancerCardProps {
  freelancer: PublicFreelancer;
  onSelect: (freelancerId: string) => void;
  onRequestCallback: (freelancerId: string) => void;
}

export default function FreelancerCard({
  freelancer,
  onSelect,
  onRequestCallback,
}: FreelancerCardProps) {
  const categoryLabel = categoryLabelFromValue(freelancer.category);

  return (
    <div className="w-full h-full flex flex-col text-left p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md transition duration-300">
      <div className="flex gap-4 flex-1">
        <img
          src={
            resolveAvatarFallback(
              resolveAssetUrl(freelancer.avatarUrl),
              true,
              freelancer.category,
            ) ?? defaultAvatar
          }
          alt=""
          className="w-16 h-16 sm:w-24 sm:h-24 shrink-0 rounded-lg object-cover border border-amber-100 dark:border-amber-800"
        />

        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900 dark:text-white font-semibold wrap-break-word">
            {freelancer.fullName}
          </h3>
          {categoryLabel && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {categoryLabel}
            </p>
          )}
          {freelancer.location && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              📍 {freelancer.location}
            </p>
          )}

          {freelancer.bio && (
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 line-clamp-2">
              {freelancer.bio}
            </p>
          )}

          {freelancer.skills && freelancer.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {freelancer.skills.map((skill) => (
                <span
                  key={skill}
                  className="text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-2 py-0.5"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-end justify-between gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
        {freelancer.pricePerHour != null ? (
          <div className="shrink-0">
            <p className="text-gray-900 dark:text-white font-bold">
              SEK {freelancer.pricePerHour}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-xs">
              per hour
            </p>
          </div>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onRequestCallback(freelancer.id)}
            aria-label={`Request a call back from ${freelancer.fullName}`}
            title="Request a call back"
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-amber-300 dark:hover:border-amber-700 hover:text-amber-700 dark:hover:text-amber-400 transition"
          >
            📞
          </button>
          <button
            type="button"
            onClick={() => onSelect(freelancer.id)}
            className="px-4 py-2 rounded-lg bg-amber-500 text-gray-900 text-sm font-semibold hover:bg-amber-600 transition"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
