type Occupation =
  | "tutoring"
  | "pet_care"
  | "cleaning"
  | "photography"
  | "fitness"
  | "food"
  | "garden"
  | "home_repair";

interface Freelancer {
  id: string;
  name: string;
  occupation: Occupation;
  price_per_hour: number;
  bio: string;
  rating: number;
}

interface FreelancerCardProps {
  freelancer: Freelancer;
  onBook: (freelancerId: string) => void;
}

export default function FreelancerCard({
  freelancer,
  onBook,
}: FreelancerCardProps) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-md hover:shadow-lg transition">
      {/* Freelancer Info */}
      <h3 className="text-lg font-bold">{freelancer.name}</h3>
      <p className="text-sm text-gray-600">{freelancer.occupation}</p>

      {/* Price */}
      <p className="text-2xl font-bold text-amber-700 my-2">
        €{freelancer.price_per_hour}/hour
      </p>

      {/* Rating */}
      <p className="text-sm text-yellow-500 mb-3">⭐ {freelancer.rating}/5</p>

      {/* Bio */}
      <p className="text-sm text-gray-700 mb-4">{freelancer.bio}</p>

      {/* Book Button */}
      <button
        onClick={() => onBook(freelancer.id)}
        className="w-full bg-amber-500 text-gray-900 py-2 rounded-lg font-medium hover:bg-amber-600 transition"
      >
        Book Now
      </button>
    </div>
  );
}
