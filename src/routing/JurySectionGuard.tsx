import React from "react";
import { Outlet } from "react-router-dom";
import { Result, Button } from "antd";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigationContext } from "../hooks/useNavigationContext";

/**
 * Guard component for Jury section
 * Ensures:
 * 1. User has "jury" role
 * 2. User profile is complete (displayName required)
 */
const JurySectionGuard: React.FC = () => {
  const { user } = useAuthContext();
  const { availableRoles } = useNavigationContext();

  // Check if user has jury role
  const hasJuryRole = user?.role === "jury" || availableRoles.includes("jury");

  // Check if profile is complete (displayName required for jury)
  const isProfileComplete = !!user?.displayName;

  // If no jury role, redirect to appropriate dashboard
  if (!hasJuryRole) {
    return (
      <Result
        status="403"
        title="Access Denied"
        subTitle="You don't have permission to access the Jury section. Please contact the organizer if you believe this is an error."
        extra={
          <Button type="primary" onClick={() => window.history.back()}>
            Go Back
          </Button>
        }
      />
    );
  }

  // If profile incomplete, show instruction page
  if (!isProfileComplete) {
    return (
      <Result
        status="warning"
        title="Profile Incomplete"
        subTitle="Please complete your profile before accessing the Jury section. Your display name is required for evaluation purposes."
        extra={
          <Button type="primary" href="/jury/settings">
            Complete Profile
          </Button>
        }
      />
    );
  }

  // All checks passed, render child routes
  return <Outlet />;
};

export default JurySectionGuard;
