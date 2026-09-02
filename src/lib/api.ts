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

export async function getMe(token: string): Promise<ApiUser> {
  const response = await fetch(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJsonOrThrow<ApiUser>(response);
}

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  bio?: string;
  category?: string;
  pricePerHour?: number;
  skills?: string[];
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
  createdAt: string;
}

export async function getFreelancers(): Promise<PublicFreelancer[]> {
  const response = await fetch(`${API_URL}/freelancers`);
  return parseJsonOrThrow<PublicFreelancer[]>(response);
}
