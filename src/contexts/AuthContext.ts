import { createContext } from "react";
import type { User } from "firebase/auth";
import type { UserProfileDTO } from "../types";

export interface LoginFormViewModel {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpFormViewModel {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordFormViewModel {
  email: string;
}

export interface AuthContextType {
  user: UserProfileDTO | null;
  firebaseUser: User | null;
  isLoading: boolean;
  hasMultipleRoles: boolean; // This can be expanded later
  login: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
