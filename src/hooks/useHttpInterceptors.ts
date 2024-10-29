import { useCallback, useEffect, useRef } from "react";
import { axiosClient } from "@/client/axios.client";
import { ROUTES } from "@/constants/routes.constants";
import router from "@/routes/router";
import queryClient from "@/api/query-client";

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
    () => {
      //
    },
  );
};

type ResponseGeneratorProps = {
  logout: () => Promise<void>;
};

const generateResponseInterceptor = async ({
  logout,
}: ResponseGeneratorProps) => {
  /**
   * Axios response middleware
   */
  return axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error?.response?.status === 401) {
        // Handle unauthorized error
        queryClient.clear();
        await logout();
        router.navigate(ROUTES.SIGNIN);
        return Promise.reject(error);
      }

      return error.response;
    },
  );
};

type InterceptorOptions = {
  logout: () => Promise<void>;
};

export const useHttpInterceptors = (
  { logout }: InterceptorOptions,
  deps: Array<unknown>,
) => {
  const requestInterceptorRef = useRef<number>();
  const responseInterceptorRef = useRef<number>();

  const generateInterceptors = useCallback(async () => {
    const requestInterceptor = await generateRequestInterceptor();

    const responseInterceptor = await generateResponseInterceptor({ logout });

    requestInterceptorRef.current = requestInterceptor;
    responseInterceptorRef.current = responseInterceptor;
  }, [logout]);

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
