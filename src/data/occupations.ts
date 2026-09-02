export type Occupation =
  | "tutoring"
  | "pet_care"
  | "cleaning"
  | "photography"
  | "fitness"
  | "food"
  | "garden"
  | "home_repair"
  | "other";

export const occupationLabels: Record<Occupation, string> = {
  tutoring: "Tutoring",
  pet_care: "Pet Care",
  cleaning: "Cleaning",
  photography: "Photography",
  fitness: "Fitness Coaching",
  food: "Food",
  garden: "Garden",
  home_repair: "Home Repair",
  other: "Other",
};

export function occupationKeyFromCategory(
  category: string | null | undefined,
): Occupation {
  const match = (Object.keys(occupationLabels) as Occupation[]).find(
    (key) => occupationLabels[key] === category,
  );
  return match ?? "other";
}
