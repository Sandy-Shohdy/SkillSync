export interface Service {
  id: string;
  name: string;
  category: string;
  neighbourhood: string;
  rating: number;
  reviewCount: number;
  available: boolean;
  tags: string[];
  price: number;
  priceUnit: string;
}
