import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Check if the error is an AxiosError
        if (axios.isAxiosError(error)) {
          console.log({ error });
          if (error.response) {
            // Don't retry on 401 errors
            if (error.response.status === 401) {
              console.log("401 not retry");
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
