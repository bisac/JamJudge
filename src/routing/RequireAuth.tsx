import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigationContext } from "../hooks/useNavigationContext";
import { Spin } from "antd";
import PendingActivationPage from "../pages/auth/PendingActivationPage";

const RequireAuth: React.FC = () => {
  const { user, firebaseUser, isLoading } = useAuthContext();
  const { activeRole, getDefaultPath } = useNavigationContext();
  const location = useLocation();

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

  // If no firebase user, redirect to login
  if (!firebaseUser) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If firebase user exists but no profile, show pending activation
  if (!user) {
    return <PendingActivationPage />;
  }

  // Check if user has a valid role
  if (!user.role) {
    return <PendingActivationPage />;
  }

  // Check if user is accessing correct role section
  const currentPath = location.pathname;
  const isOnRolePath = activeRole && currentPath.startsWith(`/${activeRole}`);

  // If on root or wrong role path, redirect to default path for active role
  if (!isOnRolePath && activeRole) {
    const defaultPath = getDefaultPath(activeRole);
    // Only redirect if we're not already trying to go there (avoid infinite loop)
    if (currentPath !== defaultPath) {
      return <Navigate to={defaultPath} replace />;
    }
  }

  return <Outlet />;
};

export default RequireAuth;
