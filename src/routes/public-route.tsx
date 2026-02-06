import useAuth from "@/hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants/routes.constants";

export const PublicRoute: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const state = location.state as { isEmailVerification?: boolean } | null;

  if (user && !isLoading) {
    if (location.pathname === ROUTES.MAGIC && state?.isEmailVerification) {
      return <Navigate to={ROUTES.INSTALL} replace />;
    }
    return <Navigate to={ROUTES.PLAYLISTS} replace />;
  }

  if (isLoading) {
    return <></>;
  }

  return <>{children}</>;
};

export default PublicRoute;
