import useAuth from "hooks/useAuth";
import { Navigate } from "react-router-dom";

export const ProtectedRoute: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
