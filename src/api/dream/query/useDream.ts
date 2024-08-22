import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { Dream } from "@/types/dream.types";
import useApiQuery from "@/api/shared/useApiQuery";

export const DREAM_QUERY_KEY = "getDream";

type HookOptions = {
  activeRefetchInterval?: boolean;
};

/**
 * Refetch dream info every 5 seconds
 */

type DreamResponse = {
  dream?: Dream;
};

export const useDream = (uuid?: string, options?: HookOptions) => {
  return useApiQuery<DreamResponse>(
    [DREAM_QUERY_KEY, { uuid }],
    `/dream/${uuid ?? ""}`,
    {
      headers: getRequestHeaders({
        contentType: ContentType.json,
      }),
    },
    {
      activeRefetchInterval: options?.activeRefetchInterval,
    },
  );
};
