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
import ReactGA from "react-ga4";
import Bugsnag from "@bugsnag/js";
import { Dream } from "@/types/dream.types";
import { Playlist } from "@/types/playlist.types";
import useCurrentDream from "@/api/dream/query/useCurrentDream";
import useCurrentPlaylist from "@/api/dream/query/useCurrentPlaylist";

type AuthContextType = {
  user: User | null;
  currentDream?: Dream;
  currentPlaylist?: Playlist;
  isLoading: boolean;
  isLoggingOut: boolean;
  isLoadingCurrentDream: boolean;
  isLoadingCurrentPlaylist: boolean;
  login: (user: User) => void;
  authenticateUser: () => Promise<void>;
  logout: (options?: LogoutOptions) => Promise<void>;
  setLoggedUser: (user: User | null) => void;
  refreshCurrentDream: () => Promise<Dream | undefined>;
  refreshCurrentPlaylist: () => Promise<Playlist | undefined>;
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

  // current dream
  const { data: currentDreamData, refetch: refetchCurrentDream, isLoading: isLoadingCD, isRefetching: isRefetchingCD } = useCurrentDream();
  const currentDream = useMemo(() => currentDreamData?.data?.dream, [currentDreamData]);
  const isLoadingCurrentDream = useMemo(() => isLoadingCD || isRefetchingCD, [isLoadingCD, isRefetchingCD])

  // current playlist
  const { data: currentPlaylistData, refetch: refetchCurrentPlaylist, isLoading: isLoadingCP, isRefetching: isRefetchingCP } = useCurrentPlaylist();
  const currentPlaylist = useMemo(() => currentPlaylistData?.data?.playlist, [currentPlaylistData]);
  const isLoadingCurrentPlaylist = useMemo(() => isLoadingCP || isRefetchingCP, [isLoadingCP, isRefetchingCP])

  const isLoggingOut = useMemo(() => logoutMutation.isLoading, [logoutMutation.isLoading]);

  const setLoggedUser = useCallback(
    (user: User | null) => {
      if (user) {
        /**
         * GA set user id
         */
        ReactGA.set({
          // using userId since is the option on GaOptions
          // https://github.com/react-ga/react-ga/blob/087837dc03d482549ded7669ac559df0c7cc5498/types/index.d.ts#L97
          userId: String(user.uuid),
        });
      }
      setUser(user);
    },
    [setUser],
  );

  const login: (user: User) => void = useCallback(
    (user: User) => {
      setLoggedUser(user);
      Bugsnag.setUser(user.uuid, user.email, user?.name);
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

  const refreshCurrentDream = useCallback(async () => {
    const refetchData = await refetchCurrentDream();
    return refetchData?.data?.data?.dream;
  }, [refetchCurrentDream]);

  const refreshCurrentPlaylist = useCallback(async () => {
    const refetchData = await refetchCurrentPlaylist();
    return refetchData?.data?.data?.playlist;
  }, [refetchCurrentPlaylist]);

  useHttpInterceptors({ logout }, [user]);

  useEffect(() => {
    // If sesion is not verified, authenticateUser
    if (!isSessionVerified) {
      authenticateUser();
    }
  }, [isSessionVerified, setIsSessionVerified, authenticateUser]);

  const memoedValue = useMemo(
    () => ({
      user,
      isLoading,
      isLoggingOut,
      isLoadingCurrentDream,
      isLoadingCurrentPlaylist,
      currentDream,
      currentPlaylist,
      refreshCurrentDream,
      refreshCurrentPlaylist,
      login,
      authenticateUser,
      logout,
      setLoggedUser,
    }),
    [
      user,
      isLoading,
      isLoggingOut,
      isLoadingCurrentDream,
      isLoadingCurrentPlaylist,
      currentDream,
      currentPlaylist,
      refreshCurrentDream,
      refreshCurrentPlaylist,
      login,
      authenticateUser,
      logout,
      setLoggedUser,
    ],
  );

  return (
    <AuthContext.Provider value={memoedValue}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
