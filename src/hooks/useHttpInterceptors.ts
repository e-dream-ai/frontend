import axios from "axios";
import { URL } from "constants/api.constants";
import {
  AUTH_LOCAL_STORAGE_KEY,
  ContentType,
  getRequestHeaders,
} from "constants/auth.constants";
import { useLocalStorage } from "hooks/useLocalStorage";
import { useCallback, useEffect, useRef } from "react";
import { ApiResponse } from "types/api.types";
import { Token, User } from "types/auth.types";

type InterceptorGenerator = {
  getItem: () => string | null;
  handleRefreshUser: (user: User | null) => void;
};

const generateRequestInterceptor = async ({
  getItem,
  handleRefreshUser,
}: InterceptorGenerator) => {
  /**
   * Axios request middleware
   */
  return axios.interceptors.request.use(
    async (config) => {
      const storagedUser = getItem();
      if (!storagedUser) {
        return config;
      }
      const user: User = JSON.parse(storagedUser);
      const accessToken: string = user.token?.AccessToken ?? "";

      /**
       * refresh token before request
       */
      /*
        const decoded = jwt_decode<{ exp?: number }>(accessToken ?? "");
        const exp = decoded?.exp;
        if (Boolean(exp) && Date.now() >= (exp || 0) * 1000) {
          accessToken = await refreshAccessToken({ user, handleRefreshUser });
        }
      */

      /**
       * Config headers
       */
      config.headers.set("Access-Control-Allow-Origin", "*");
      config.headers.set("Authorization", `Bearer ${accessToken}`);
      return config;
    },
    (error) => {
      console.error(error);
    },
  );
};

const generateResponseInterceptor = async ({
  getItem,
  handleRefreshUser,
}: InterceptorGenerator) => {
  /**
   * Axios response middleware
   */
  return axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const storagedUser = getItem();
      if (error.response.status === 401 && storagedUser) {
        const user: User = JSON.parse(storagedUser);
        refreshAccessToken({ user, handleRefreshUser });
        return;
      }

      return error.response;
    },
  );
};

const refreshAccessToken = async ({
  user,
  handleRefreshUser,
}: {
  user: User;
  handleRefreshUser: (user: User | null) => void;
}) => {
  const refreshToken = user?.token?.RefreshToken;
  const values = { refreshToken };
  try {
    const response = await axios
      .post<ApiResponse<Token>>(`${URL}/auth/refresh`, values, {
        transformRequest: (data, headers) => {
          delete headers["Authorization"];
          return JSON.stringify(data);
        },
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => {
        if (!res) {
          throw new Error("Refresh token failed.");
        }
        return res.data;
      });

    const token = response?.data;
    if (token) {
      token.RefreshToken = refreshToken ?? "";
    }
    user.token = token;
    handleRefreshUser(user);
    return token?.AccessToken ?? "";
  } catch (error) {
    handleRefreshUser(null);
  }
};

type UseHttpInterceptorsProps = {
  handleRefreshUser: (user: User | null) => void;
};

export const useHttpInterceptors = (
  { handleRefreshUser }: UseHttpInterceptorsProps,
  deps: Array<unknown>,
) => {
  const { getItem } = useLocalStorage(AUTH_LOCAL_STORAGE_KEY);
  const requestInterceptorRef = useRef<number>();
  const responseInterceptorRef = useRef<number>();

  const generateInterceptors = useCallback(async () => {
    const requestInterceptor = await generateRequestInterceptor({
      getItem,
      handleRefreshUser,
    });

    const responseInterceptor = await generateResponseInterceptor({
      getItem,
      handleRefreshUser,
    });

    requestInterceptorRef.current = requestInterceptor;
    responseInterceptorRef.current = responseInterceptor;
  }, [getItem, handleRefreshUser]);

  const cleanInterceptors = () => {
    if (requestInterceptorRef.current) {
      axios.interceptors.request.eject(requestInterceptorRef.current);
    }
    if (responseInterceptorRef.current) {
      axios.interceptors.response.eject(responseInterceptorRef.current);
    }
  };

  useEffect(() => {
    generateInterceptors();
    return () => {
      cleanInterceptors();
    };
  }, [getItem, handleRefreshUser, generateInterceptors, deps]);

  return [];
};
