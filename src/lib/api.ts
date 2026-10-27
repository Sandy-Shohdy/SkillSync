const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type UserRole = "customer" | "freelancer";

export interface ApiUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone: string | null;
  bio: string | null;
  avatarUrl: string | null;
  category: string | null;
  pricePerHour: number | null;
  skills: string[] | null;
  location: string | null;
  createdAt: string;
}

export interface AuthResponse {
  user: ApiUser;
  accessToken: string;
}

async function parseJsonOrThrow<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : (body?.message ?? "Something went wrong");
    throw new Error(message);
  }
  return body as T;
}

export interface SignupPayload {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  bio?: string;
  category?: string;
  pricePerHour?: number;
  skills?: string[];
  location?: string;
}

export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow<AuthResponse>(response);
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return parseJsonOrThrow<AuthResponse>(response);
}

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  bio?: string;
  category?: string;
  pricePerHour?: number;
  skills?: string[];
  location?: string;
  avatarFile?: File;
}

export async function updateProfile(
  token: string,
  payload: UpdateProfilePayload,
): Promise<ApiUser> {
  const formData = new FormData();
  if (payload.fullName !== undefined)
    formData.append("fullName", payload.fullName);
  if (payload.phone !== undefined) formData.append("phone", payload.phone);
  if (payload.bio !== undefined) formData.append("bio", payload.bio);
  if (payload.category !== undefined)
    formData.append("category", payload.category);
  if (payload.pricePerHour !== undefined)
    formData.append("pricePerHour", String(payload.pricePerHour));
  if (payload.skills !== undefined)
    formData.append("skills", JSON.stringify(payload.skills));
  if (payload.location !== undefined)
    formData.append("location", payload.location);
  if (payload.avatarFile) formData.append("avatar", payload.avatarFile);

  const response = await fetch(`${API_URL}/users/me`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return parseJsonOrThrow<ApiUser>(response);
}

export function resolveAssetUrl(
  path: string | null | undefined,
): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}

export interface PublicFreelancer {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  category: string | null;
  pricePerHour: number | null;
  bio: string | null;
  skills: string[] | null;
  location: string | null;
  createdAt: string;
}

export async function getFreelancers(): Promise<PublicFreelancer[]> {
  const response = await fetch(`${API_URL}/freelancers`);
  return parseJsonOrThrow<PublicFreelancer[]>(response);
}

export type BookingType = "appointment" | "inquiry";

export interface CreateBookingPayload {
  freelancerId: string;
  type?: BookingType;
  date?: string;
  time?: string;
  hours?: number;
  phone?: string;
  notes?: string;
}

export async function createBooking(
  token: string,
  payload: CreateBookingPayload,
): Promise<void> {
  const response = await fetch(`${API_URL}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  await parseJsonOrThrow(response);
}

export type BookingStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "cancelled"
  | "completed";

export type PaymentStatus = "held" | "disputed" | "released" | "refunded";

// Amounts are in minor units (öre).
export interface PaymentSummary {
  id: string;
  status: PaymentStatus;
  amount: number;
  platformFee: number;
  freelancerAmount: number;
  currency: string;
  cardLast4: string;
  createdAt: string;
  autoReleaseAt: string | null;
  disputedAt: string | null;
  disputeReason: string | null;
  releasedAt: string | null;
  refundedAt: string | null;
}

interface BookingPricing {
  hours: number | null;
  amount: number | null;
  currency: string;
  workCompletedAt: string | null;
  payment: PaymentSummary | null;
}

export interface BookingRequest extends BookingPricing {
  id: string;
  type: BookingType;
  date: string | null;
  time: string | null;
  phone: string | null;
  notes: string | null;
  status: BookingStatus;
  createdAt: string;
  customer: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  };
}

export async function getMyBookingRequests(
  token: string,
): Promise<BookingRequest[]> {
  const response = await fetch(`${API_URL}/bookings/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJsonOrThrow<BookingRequest[]>(response);
}

export interface CustomerBooking extends BookingPricing {
  id: string;
  type: BookingType;
  date: string | null;
  time: string | null;
  phone: string | null;
  notes: string | null;
  status: BookingStatus;
  createdAt: string;
  freelancer: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    category: string | null;
    location: string | null;
    pricePerHour: number | null;
  };
}

export async function getMyBookings(token: string): Promise<CustomerBooking[]> {
  const response = await fetch(`${API_URL}/bookings/mine`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJsonOrThrow<CustomerBooking[]>(response);
}

export async function updateBookingStatus(
  token: string,
  bookingId: string,
  status: "accepted" | "declined",
): Promise<BookingRequest> {
  const response = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  return parseJsonOrThrow<BookingRequest>(response);
}

export async function cancelBooking(
  token: string,
  bookingId: string,
): Promise<CustomerBooking> {
  const response = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJsonOrThrow<CustomerBooking>(response);
}

export async function markBookingCompleted(
  token: string,
  bookingId: string,
): Promise<BookingRequest> {
  const response = await fetch(`${API_URL}/bookings/${bookingId}/complete`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJsonOrThrow<BookingRequest>(response);
}

export interface PayBookingPayload {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}

export async function payForBooking(
  token: string,
  bookingId: string,
  payload: PayBookingPayload,
): Promise<PaymentSummary> {
  const response = await fetch(
    `${API_URL}/payments/bookings/${bookingId}/pay`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );
  return parseJsonOrThrow<PaymentSummary>(response);
}

export async function releasePayment(
  token: string,
  bookingId: string,
): Promise<PaymentSummary> {
  const response = await fetch(
    `${API_URL}/payments/bookings/${bookingId}/release`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return parseJsonOrThrow<PaymentSummary>(response);
}

export async function disputePayment(
  token: string,
  bookingId: string,
  reason: string,
): Promise<PaymentSummary> {
  const response = await fetch(
    `${API_URL}/payments/bookings/${bookingId}/dispute`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    },
  );
  return parseJsonOrThrow<PaymentSummary>(response);
}

export async function refundPayment(
  token: string,
  bookingId: string,
): Promise<PaymentSummary> {
  const response = await fetch(
    `${API_URL}/payments/bookings/${bookingId}/refund`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return parseJsonOrThrow<PaymentSummary>(response);
}

export interface EarningsPayment extends PaymentSummary {
  bookingId: string;
  bookingDate: string | null;
  bookingTime: string | null;
  hours: number | null;
  customerName: string;
}

export interface Earnings {
  currency: string;
  feePercent: number;
  held: number;
  released: number;
  payments: EarningsPayment[];
}

export async function getEarnings(token: string): Promise<Earnings> {
  const response = await fetch(`${API_URL}/payments/earnings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJsonOrThrow<Earnings>(response);
}

export type NotificationType =
  | "booking_created"
  | "booking_accepted"
  | "booking_declined"
  | "booking_cancelled"
  | "payment_received"
  | "work_completed"
  | "payment_released"
  | "payment_disputed"
  | "payment_refunded";

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  bookingId: string | null;
  read: boolean;
  createdAt: string;
}

export async function getNotifications(
  token: string,
): Promise<AppNotification[]> {
  const response = await fetch(`${API_URL}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJsonOrThrow<AppNotification[]>(response);
}

export async function markNotificationRead(
  token: string,
  id: string,
): Promise<AppNotification> {
  const response = await fetch(`${API_URL}/notifications/${id}/read`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJsonOrThrow<AppNotification>(response);
}

export async function markAllNotificationsRead(token: string): Promise<void> {
  const response = await fetch(`${API_URL}/notifications/read-all`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  await parseJsonOrThrow(response);
}
