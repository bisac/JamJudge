import { useContext } from "react";
import { NavigationContext } from "../contexts/NavigationContext";
import type { NavigationContextType } from "../contexts/NavigationContext";

export const useNavigationContext = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error(
      "useNavigationContext must be used within NavigationProvider",
    );
  }
  return context;
};
