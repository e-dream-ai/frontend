import { useHttpInterceptors } from "@/hooks/useHttpInterceptors";
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { User } from "@/types/auth.types";
import useLogout from "@/api/auth/useLogout";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import router from "@/routes/router";
import { ROUTES } from "@/constants/routes.constants";
import { useAuthenticateUser } from "@/api/user/query/useAuthenticateUser";

type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
  setLoggedUser: (user: User | null) => void;
};

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);

export const AuthProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const authenticateUserQuery = useAuthenticateUser();
  const logoutMutation = useLogout();
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSessionVerified, setIsSessionVerified] = useState<boolean>(false);

  const [user, setUser] = useState<User | null>(null);

  const setLoggedUser = useCallback(
    (user: User | null) => {
      setUser(user);
    },
    [setUser],
  );

  useHttpInterceptors({ handleRefreshUser: setLoggedUser }, [user]);

  const login: (user: User) => void = useCallback(
    (user: User) => {
      setLoggedUser(user);
    },
    [setLoggedUser],
  );

  const fetchLogout = useCallback(async () => {
    try {
      const data = await logoutMutation.mutateAsync();

      if (data.success) {
        toast.success(t("modal.logout.user_logged_out_successfully"));
        router.navigate(ROUTES.ROOT);
      } else {
        toast.error(
          `${t("modal.logout.error_signingout_user")} ${data.message}`,
        );
      }
    } catch (error) {
      toast.error(t("modal.logout.error_signingout_user"));
    }
  }, [t, logoutMutation]);

  const logout = useCallback(async () => {
    await fetchLogout();
    setLoggedUser(null);
  }, [setLoggedUser, fetchLogout]);

  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const authenticateUserRequest = await authenticateUserQuery.refetch();
      const fetchedUser = authenticateUserRequest.data?.data?.user;

      if (fetchedUser) {
        setLoggedUser({ ...fetchedUser } as User);
      }
      setIsLoading(false);
      setIsSessionVerified(true);
    } catch (error) {
      logout();
      setIsLoading(false);
      setIsSessionVerified(true);
    }
  }, [authenticateUserQuery, setLoggedUser, logout]);

  useEffect(() => {
    /**
     * If sesion is not verified, fetchUser
     */

    if (!isSessionVerified) {
      fetchUser();
    }
  }, [isSessionVerified, setIsSessionVerified, fetchUser]);

  const memoedValue = useMemo(
    () => ({
      user,
      login,
      logout,
      isLoading,
      setLoggedUser,
    }),
    [user, login, logout, isLoading, setLoggedUser],
  );

  return (
    <AuthContext.Provider value={memoedValue}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
