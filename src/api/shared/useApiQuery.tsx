import axios, { AxiosError, AxiosRequestConfig } from "axios";
import {
  useQuery,
  UseQueryResult,
  QueryKey,
  UseQueryOptions,
} from "@tanstack/react-query";
import useAuth from "@/hooks/useAuth";
import { axiosClient } from "@/client/axios.client";
import { ApiResponse } from "@/types/api.types";

interface HookOptions {
  activeRefetchInterval?: boolean;
  refetchInterval?: number;
  disableRetries?: boolean;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
}

const DEFAULT_REFETCH_INTERVAL = 5000;

function useApiQuery<T>(
  queryKey: QueryKey,
  endpoint: string,
  config: AxiosRequestConfig = {},
  options: HookOptions = {},
  queryOptions: Omit<
    UseQueryOptions<ApiResponse<T>, AxiosError>,
    "queryKey" | "queryFn"
  > = {},
): UseQueryResult<ApiResponse<T>, AxiosError> {
  const { user } = useAuth();

  const fetchData = () =>
    axiosClient
      .get<ApiResponse<T>>(endpoint, {
        ...config,
        validateStatus: (status) => status < 500,
      })
      .then((response) => {
        if (response.status !== 200) {
          throw new axios.AxiosError(
            "Resource not found",
            "404",
            response.config,
            response.request,
            response,
          );
        }
        return response.data;
      })
      .catch((error) => {
        throw error;
      });

  return useQuery<ApiResponse<T>, AxiosError>(queryKey, fetchData, {
    refetchOnMount: options.refetchOnMount ?? false,
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? false,
    enabled: Boolean(user),
    keepPreviousData: true,
    refetchInterval: (_, query) => {
      if (!options.activeRefetchInterval) return false;
      // Don't refetch on 404 errors
      if (
        query.state.error &&
        axios.isAxiosError(query.state.error) &&
        query.state.error.response?.status !== 200
      ) {
        return false;
      }
      return options.refetchInterval || DEFAULT_REFETCH_INTERVAL;
    },
    retry: (failureCount, error) => {
      if (options.disableRetries) return false;

      if (axios.isAxiosError(error) && error.response?.status !== 200) {
        return false;
      }
      const shouldRetry = failureCount < 3;
      return shouldRetry;
    },
    onError: () => {},
    ...queryOptions,
  });
}

export default useApiQuery;
