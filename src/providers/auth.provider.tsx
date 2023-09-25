import { AuthProvider as AP } from "context/auth.context";

export const AuthProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => <AP>{children}</AP>;

export default AuthProvider;
