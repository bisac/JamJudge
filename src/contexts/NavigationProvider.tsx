import React, { useState, useEffect, useMemo, useCallback } from "react";
import type { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { NavigationContext } from "./NavigationContext";
import type { UserRole } from "../types";

const NAVIGATION_STATE_KEY = "jamjudge_navigation_state";

interface NavigationState {
  activeRole: UserRole | null;
  lastVisitedPaths: Record<UserRole, string>;
}

const getDefaultPath = (role: UserRole): string => {
  switch (role) {
    case "participant":
      return "/participant/dashboard";
    case "jury":
      return "/jury/dashboard";
    case "organizer":
      return "/organizer/dashboard";
    default:
      return "/";
  }
};

const loadNavigationState = (): NavigationState => {
  try {
    const stored = localStorage.getItem(NAVIGATION_STATE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load navigation state:", error);
  }

  return {
    activeRole: null,
    lastVisitedPaths: {
      participant: "/participant/dashboard",
      jury: "/jury/dashboard",
      organizer: "/organizer/dashboard",
    },
  };
};

const saveNavigationState = (state: NavigationState) => {
  try {
    localStorage.setItem(NAVIGATION_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save navigation state:", error);
  }
};

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [navState, setNavState] =
    useState<NavigationState>(loadNavigationState);

  // Determine available roles
  const availableRoles = useMemo((): UserRole[] => {
    if (!user) return [];

    // If user has roles array, use it
    if (user.roles && user.roles.length > 0) {
      return user.roles;
    }

    // Otherwise, use primary role
    return user.role ? [user.role] : [];
  }, [user]);

  // Determine active role
  const activeRole = useMemo(() => {
    if (!user) return null;

    // If we have a stored active role and it's in available roles, use it
    if (navState.activeRole && availableRoles.includes(navState.activeRole)) {
      return navState.activeRole;
    }

    // Otherwise, use primary role or first available
    return user.role || availableRoles[0] || null;
  }, [user, availableRoles, navState.activeRole]);

  // Update active role when user changes
  useEffect(() => {
    if (activeRole && activeRole !== navState.activeRole) {
      setNavState((prev) => {
        const newState = { ...prev, activeRole };
        saveNavigationState(newState);
        return newState;
      });
    }
  }, [activeRole, navState.activeRole]);

  // Switch role handler
  const switchRole = useCallback(
    (role: UserRole) => {
      if (!availableRoles.includes(role)) {
        console.warn(`Role ${role} not available for user`);
        return;
      }

      // Get target path (last visited or default)
      const targetPath =
        navState.lastVisitedPaths[role] || getDefaultPath(role);

      // Update state
      const newState: NavigationState = {
        ...navState,
        activeRole: role,
      };
      setNavState(newState);
      saveNavigationState(newState);

      // Navigate to target path
      navigate(targetPath);
    },
    [availableRoles, navState, navigate],
  );

  // Track current path for active role
  useEffect(() => {
    if (activeRole && location.pathname.startsWith(`/${activeRole}`)) {
      setNavState((prev) => {
        const newState = {
          ...prev,
          lastVisitedPaths: {
            ...prev.lastVisitedPaths,
            [activeRole]: location.pathname,
          },
        };
        saveNavigationState(newState);
        return newState;
      });
    }
  }, [activeRole, location.pathname]);

  const value = {
    activeRole,
    availableRoles,
    switchRole,
    getDefaultPath,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
