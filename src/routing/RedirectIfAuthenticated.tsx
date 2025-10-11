import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { Spin } from "antd";
import type { UserRole } from "../types";

// Redirect authenticated users to their dashboard based on role
const getDefaultPath = (role: UserRole): string => {
  switch (role) {
    case "organizer":
      return "/organizer/dashboard";
    case "jury":
      return "/jury/dashboard";
    case "participant":
      return "/participant/dashboard";
    default:
      return "/";
  }
};

const RedirectIfAuthenticated: React.FC = () => {
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // If user is authenticated, redirect to their dashboard
  if (user) {
    const defaultPath = getDefaultPath(user.role);
    return <Navigate to={defaultPath} replace />;
  }

  // If not authenticated, render the auth page
  return <Outlet />;
};

export default RedirectIfAuthenticated;
