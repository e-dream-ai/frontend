import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /**
       * Disables refetch on focus
       * This refetch affects authentication after socket reconnection and is not needed
       */
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: (failureCount, error) => {
        // Check if the error is an AxiosError
        if (axios.isAxiosError(error)) {
          if (error.response) {
            // Don't retry on 401 errors
            if (error.response.status === 401) {
              return false;
            }
            // Retry on 5xx errors
            if (error.response.status >= 500) {
              return failureCount < 3;
            }
          }
          // Retry on network errors
          if (!error.response) {
            return failureCount < 3;
          }
        }
        // For non-Axios errors, retry up to 3 times
        return failureCount < 3;
      },
      onError: () => {
        //
      },
    },
  },
});

export default queryClient;
