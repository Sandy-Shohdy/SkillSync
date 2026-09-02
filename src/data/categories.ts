import repairIcon from "../assets/repair.png";
import tutoringIcon from "../assets/tutoring.png";
import gardenIcon from "../assets/garden.png";
import foodIcon from "../assets/food.png";
import beautyIcon from "../assets/beauty.png";
import cleaningIcon from "../assets/clean.png";
import photographyIcon from "../assets/photographi.png";
import petCareIcon from "../assets/petCare.png";

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
  { key: "other", label: "Other", icon: "🧰" },
];

export const CATEGORY_LABELS: Record<CategoryKey, string> = CATEGORIES.reduce(
  (acc, category) => {
    acc[category.key] = category.label;
    return acc;
  },
  {} as Record<CategoryKey, string>,
);

export const BROWSE_FILTERS = [
  { key: "all", label: "All", icon: "✨" },
  ...CATEGORIES,
];

export function categoryKeyFromValue(
  category: string | null | undefined,
): CategoryKey {
  const match = CATEGORIES.find((c) => c.key === category);
  return match ? match.key : "other";
}

export function categoryLabelFromValue(
  category: string | null | undefined,
): string {
  if (!category) return "";
  const match = CATEGORIES.find((c) => c.key === category);
  return match ? match.label : category;
}
