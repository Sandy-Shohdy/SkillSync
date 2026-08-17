import { useState } from 'react';
import FreelancerCard from '../../components/FreelancerCard';

type Occupation = 'tutoring' | 'pet_care' | 'cleaning' | 'photography' | 'fitness' | 'food' | 'garden' | 'home_repair';

interface Freelancer {
  id: string;
  name: string;
  occupation: Occupation;
  price_per_hour: number;
  bio: string;
  rating: number;
}

export default function BrowseFreelancers() {
  // Mock data - we'll replace this with real data from database later
  const [freelancers] = useState<Freelancer[]>([
    {
      id: '1',
      name: 'Maria Garcia',
      occupation: 'tutoring',
      price_per_hour: 35,
      bio: 'Spanish and English teacher with 10 years of experience',
      rating: 4.9,
    },
    {
      id: '2',
      name: 'John Smith',
      occupation: 'fitness',
      price_per_hour: 45,
      bio: 'Personal trainer specializing in weight loss programs',
      rating: 4.8,
    },
    {
      id: '3',
      name: 'Lisa Chen',
      occupation: 'cleaning',
      price_per_hour: 25,
      bio: 'Professional home cleaner, same-day service available',
      rating: 5.0,
    },
  ]);

  const handleBook = (freelancerId: string) => {
    console.log('Book freelancer:', freelancerId);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
          Browse Freelancers
        </h1>

        {/* Grid of freelancer cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {freelancers.map(freelancer => (
            <FreelancerCard
              key={freelancer.id}
              freelancer={freelancer}
              onBook={handleBook}
            />
          ))}
        </div>
      </div>
    </div>
  );
}