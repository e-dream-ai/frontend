import queryClient from "@/api/query-client";
import { ApiResponse } from "@/types/api.types";
import { Dream } from "@/types/dream.types";
import { CURRENT_DREAM_QUERY_KEY } from "../query/useCurrentDream";

export const setCurrentUserDreamOptimistically = (newDream: Dream) => {
  queryClient.setQueryData<ApiResponse<{ dream: Dream }>>(
    [CURRENT_DREAM_QUERY_KEY],
    (old) => ({
      ...old!,
      data: { dream: newDream },
    }),
  );
};
