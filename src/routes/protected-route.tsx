import useAuth from "hooks/useAuth";
import { Navigate } from "react-router-dom";
import { RoleType } from "types/role.types";

export const ProtectedRoute: React.FC<{
  children?: React.ReactNode;
  allowedRoles?: Array<RoleType>;
}> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (!user && !isLoading) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && allowedRoles.indexOf(user?.role?.name as RoleType) < 0) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
