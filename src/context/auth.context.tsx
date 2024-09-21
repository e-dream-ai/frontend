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
import ReactGA from "react-ga";

type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  authenticateUser: () => Promise<void>;
  logout: (options?: LogoutOptions) => Promise<void>;
  isLoading: boolean;
  setLoggedUser: (user: User | null) => void;
};

type LogoutOptions = {
  callFetchLogout?: boolean;
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
      if (user) {
        /**
         * GA set user id
         */
        ReactGA.set({
          userId: String(user.id),
        });
      }
      setUser(user);
    },
    [setUser],
  );

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

  const logout = useCallback(
    async (options: LogoutOptions = { callFetchLogout: false }) => {
      const { callFetchLogout = true } = options;

      if (callFetchLogout) {
        await fetchLogout();
      }

      setLoggedUser(null);
    },
    [setLoggedUser, fetchLogout],
  );

  const authenticateUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const authenticateUserRequest = await authenticateUserQuery.refetch();
      const fetchedUser = authenticateUserRequest.data?.data?.user;

      if (fetchedUser) {
        login(fetchedUser);
      }
      setIsLoading(false);
      setIsSessionVerified(true);
    } catch (error) {
      logout();
      setIsLoading(false);
      setIsSessionVerified(true);
    }
  }, [authenticateUserQuery, login, logout]);

  useHttpInterceptors({ logout }, [user]);

  useEffect(() => {
    /**
     * If sesion is not verified, authenticateUser
     */
    if (!isSessionVerified) {
      authenticateUser();
    }
  }, [isSessionVerified, setIsSessionVerified, authenticateUser]);

  const memoedValue = useMemo(
    () => ({
      user,
      login,
      authenticateUser,
      logout,
      isLoading,
      setLoggedUser,
    }),
    [user, login, authenticateUser, logout, isLoading, setLoggedUser],
  );

  return (
    <AuthContext.Provider value={memoedValue}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
