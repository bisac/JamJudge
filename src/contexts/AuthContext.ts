import { createContext } from "react";
import type { User } from "firebase/auth";
import type { UserProfileDTO } from "../types";

export interface AuthContextType {
  user: UserProfileDTO | null;
  firebaseUser: User | null;
  isLoading: boolean;
  hasMultipleRoles: boolean; // This can be expanded later
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
