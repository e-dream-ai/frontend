import useAuth from "hooks/useAuth";
import { Navigate } from "react-router-dom";

export const ProtectedRoute: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (!user && !isLoading) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
