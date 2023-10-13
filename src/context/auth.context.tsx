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
import { User } from "types/auth.types";

type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
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
  const [user, setUser] = useState<User | null>(null);

  const setLoggedUser = useCallback(
    (user: User | null) => {
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

    const user: User = JSON.parse(storagedUser);
    setLoggedUser(user);
    setIsLoading(false);
  }, [getItem, setLoggedUser]);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  const login: (user: User) => void = useCallback(
    (user: User) => {
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
