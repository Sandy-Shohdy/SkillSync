import repairIcon from "../assets/repair.png";
import tutoringIcon from "../assets/tutoring.png";
import gardenIcon from "../assets/garden.png";
import foodIcon from "../assets/food.png";
import beautyIcon from "../assets/beauty.png";
import cleaningIcon from "../assets/clean.png";
import photographyIcon from "../assets/photographi.png";
import petCareIcon from "../assets/petCare.png";
import otherIcon from "../assets/other.png";

export type CategoryKey =
  | "repairs"
  | "tutoring"
  | "food"
  | "beauty"
  | "garden"
  | "cleaning"
  | "photography"
  | "pet_care"
  | "other";

interface CategoryDef {
  key: CategoryKey;
  label: string;
  image?: string;
  icon?: string;
}

export const CATEGORIES: CategoryDef[] = [
  { key: "repairs", label: "Repairs", image: repairIcon },
  { key: "tutoring", label: "Tutoring", image: tutoringIcon },
  { key: "food", label: "Food", image: foodIcon },
  { key: "beauty", label: "Beauty", image: beautyIcon },
  { key: "garden", label: "Garden", image: gardenIcon },
  { key: "cleaning", label: "Cleaning", image: cleaningIcon },
  { key: "photography", label: "Photography", image: photographyIcon },
  { key: "pet_care", label: "Pet Care", image: petCareIcon },
  { key: "other", label: "Other", image: otherIcon },
];

export const BROWSE_FILTERS = [
  { key: "all", label: "All", icon: "✨" },
  ...CATEGORIES,
];

export function categoryKeyFromValue(
  category: string | null | undefined,
): CategoryKey {
  if (!category) return "other";
  const normalized = category.trim().toLowerCase();
  const match = CATEGORIES.find(
    (c) =>
      c.key.toLowerCase() === normalized ||
      c.label.toLowerCase() === normalized,
  );
  if (match) return match.key;
  if (normalized === "plumbing") return "repairs";
  if (normalized === "makeup artist" || normalized === "makeup") return "beauty";
  return "other";
}

export function categoryLabelFromValue(
  category: string | null | undefined,
): string {
  if (!category) return "";
  const normalized = category.trim().toLowerCase();
  const match = CATEGORIES.find(
    (c) =>
      c.key.toLowerCase() === normalized ||
      c.label.toLowerCase() === normalized,
  );
  return match ? match.label : category;
}

export function categoryIconFromValue(
  category: string | null | undefined,
): string | undefined {
  const key = categoryKeyFromValue(category);
  return CATEGORIES.find((c) => c.key === key)?.image;
}

export function resolveAvatarFallback(
  avatarUrl: string | null | undefined,
  isFreelancer: boolean,
  category: string | null | undefined,
): string | undefined {
  if (avatarUrl) return avatarUrl;
  return isFreelancer ? categoryIconFromValue(category) : undefined;
}
