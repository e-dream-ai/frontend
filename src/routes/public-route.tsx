import useAuth from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes.constants";

export const PublicRoute: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (user && !isLoading) {
    return <Navigate to={ROUTES.FEED} replace />;
  }

  if (isLoading) {
    return <></>;
  }

  return <>{children}</>;
};

export default PublicRoute;
