import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { ApiUser } from "../lib/api";
import { resolveAssetUrl } from "../lib/api";

export type UserRole = "customer" | "freelancer";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  token: string;
  phone: string | null;
  bio: string | null;
  category: string | null;
  pricePerHour: number | null;
  skills: string[] | null;
}

export function toAuthUser(apiUser: ApiUser, token: string): AuthUser {
  return {
    id: apiUser.id,
    name: apiUser.fullName,
    email: apiUser.email,
    role: apiUser.role,
    avatar: resolveAssetUrl(apiUser.avatarUrl) ?? "",
    token,
    phone: apiUser.phone,
    bio: apiUser.bio,
    category: apiUser.category,
    pricePerHour: apiUser.pricePerHour,
    skills: apiUser.skills,
  };
}

interface AuthContextValue {
  user: AuthUser | null;
  signin: (user: AuthUser) => void;
  updateUser: (apiUser: ApiUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getInitialUser(): AuthUser | null {
  const stored = localStorage.getItem("authUser");
  return stored ? (JSON.parse(stored) as AuthUser) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getInitialUser);

  useEffect(() => {
    if (user) localStorage.setItem("authUser", JSON.stringify(user));
    else localStorage.removeItem("authUser");
  }, [user]);

  const updateUser = (apiUser: ApiUser) => {
    setUser((prev) => (prev ? toAuthUser(apiUser, prev.token) : prev));
  };

  return (
    <AuthContext.Provider
      value={{ user, signin: setUser, updateUser, logout: () => setUser(null) }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
