import useAuth from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { RoleType } from "@/types/role.types";
import { ROUTES } from "@/constants/routes.constants";

export const ProtectedRoute: React.FC<{
  children?: React.ReactNode;
  allowedRoles?: Array<RoleType>;
}> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (!user && !isLoading) {
    return <Navigate to={ROUTES.ABOUT} replace />;
  }

  if (isLoading) {
    return <></>;
  }

  if (allowedRoles && allowedRoles.indexOf(user?.role?.name as RoleType) < 0) {
    return <Navigate to={ROUTES.ROOT} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
