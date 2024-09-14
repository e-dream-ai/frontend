import { URL } from "@/constants/api.constants";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { useCallback, useEffect, useRef } from "react";
import { ApiResponse } from "@/types/api.types";
import { Token, UserWithToken } from "@/types/auth.types";
import { axiosClient } from "@/client/axios.client";

export const refreshAccessToken = async ({
  user,
  handleRefreshUser,
}: {
  user: UserWithToken;
  handleRefreshUser: (user: UserWithToken | null) => void;
}) => {
  const refreshToken = user?.token?.RefreshToken;
  const values = { refreshToken };
  try {
    const response = await axiosClient
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

const generateRequestInterceptor = async () => {
  /**
   * Axios request middleware
   */
  return axiosClient.interceptors.request.use(
    async (config) => {
      /**
       * No needs extra config since auth changed to cookies
       */
      return config;
    },
    (error) => {
      console.error(error);
    },
  );
};

const generateResponseInterceptor = async () => {
  /**
   * Axios response middleware
   */
  return axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response.status === 401) {
        // Handle unauthorized error
        // console.log("401 unauthorized");
      }

      return error.response;
    },
  );
};

type UseHttpInterceptorsProps = {
  handleRefreshUser: (user: UserWithToken | null) => void;
};

export const useHttpInterceptors = (
  _: UseHttpInterceptorsProps,
  deps: Array<unknown>,
) => {
  const requestInterceptorRef = useRef<number>();
  const responseInterceptorRef = useRef<number>();

  const generateInterceptors = useCallback(async () => {
    const requestInterceptor = await generateRequestInterceptor();

    const responseInterceptor = await generateResponseInterceptor();

    requestInterceptorRef.current = requestInterceptor;
    responseInterceptorRef.current = responseInterceptor;
  }, []);

  const cleanInterceptors = () => {
    if (requestInterceptorRef.current) {
      axiosClient.interceptors.request.eject(requestInterceptorRef.current);
    }
    if (responseInterceptorRef.current) {
      axiosClient.interceptors.response.eject(responseInterceptorRef.current);
    }
  };

  useEffect(() => {
    generateInterceptors();
    return () => {
      cleanInterceptors();
    };
  }, [generateInterceptors, deps]);

  return [];
};
