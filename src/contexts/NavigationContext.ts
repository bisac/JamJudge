import { createContext } from "react";
import type { UserRole } from "../types";

export interface NavigationContextType {
  activeRole: UserRole | null;
  availableRoles: UserRole[];
  switchRole: (role: UserRole) => void;
  getDefaultPath: (role: UserRole) => string;
}

export const NavigationContext = createContext<
  NavigationContextType | undefined
>(undefined);
