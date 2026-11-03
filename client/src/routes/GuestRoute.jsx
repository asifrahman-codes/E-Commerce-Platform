import { Navigate, Outlet } from "react-router-dom";

import useAuth from "../hooks/useAuth";
import LoadingScreen from "../components/common/LoadingScreen";

const GuestRoute = () => {
  const {
    isAuthenticated,
    loading,
    user,
  } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    const destination =
      user?.role?.toLowerCase() === "admin"
        ? "/admin"
        : "/account";

    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
};

export default GuestRoute;