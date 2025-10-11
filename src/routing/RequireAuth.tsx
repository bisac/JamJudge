import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { Spin } from "antd";
import PendingActivationPage from "../pages/auth/PendingActivationPage";

const RequireAuth: React.FC = () => {
  const { user, firebaseUser, isLoading } = useAuthContext();
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

  return <Outlet />;
};

export default RequireAuth;
