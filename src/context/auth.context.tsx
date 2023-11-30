import { AUTH_LOCAL_STORAGE_KEY } from "constants/auth.constants";
import { useHttpInterceptors } from "hooks/useHttpInterceptors";
import { useLocalStorage } from "hooks/useLocalStorage";
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { UserWithToken } from "types/auth.types";

type AuthContextType = {
  user: UserWithToken | null;
  login: (user: UserWithToken) => void;
  logout: () => void;
  isLoading: boolean;
};

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);

export const AuthProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { setItem, getItem, removeItem } = useLocalStorage(
    AUTH_LOCAL_STORAGE_KEY,
  );
  const [user, setUser] = useState<UserWithToken | null>(null);

  const setLoggedUser = useCallback(
    (user: UserWithToken | null) => {
      setUser(user);
      if (user) {
        setItem(JSON.stringify(user));
      } else {
        removeItem();
      }
    },
    [setUser, setItem, removeItem],
  );

  useHttpInterceptors({ handleRefreshUser: setLoggedUser }, [user]);

  const verifySession = useCallback(() => {
    const storagedUser = getItem();

    if (!storagedUser) {
      setIsLoading(false);
      return;
    }

    const user: UserWithToken = JSON.parse(storagedUser);
    setLoggedUser(user);
    setIsLoading(false);
  }, [getItem, setLoggedUser]);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  const login: (user: UserWithToken) => void = useCallback(
    (user: UserWithToken) => {
      setLoggedUser(user);
    },
    [setLoggedUser],
  );

  const logout = useCallback(() => {
    setLoggedUser(null);
  }, [setLoggedUser]);

  const memoedValue = useMemo(
    () => ({
      user,
      login,
      logout,
      isLoading,
    }),
    [user, login, logout, isLoading],
  );

  return (
    <AuthContext.Provider value={memoedValue}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
