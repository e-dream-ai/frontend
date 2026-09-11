import {
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { DREAM_QUERY_KEY, getDreamResponse } from "@/api/dream/query/useDream";
import useSocket from "@/hooks/useSocket";
import { useDreamRooms } from "@/hooks/useDreamRooms";
import {
  isActiveProgress,
  latestProgress,
  progressFromDream,
  type DreamProgressSource,
} from "@/utils/job-progress.util";
import type { DreamJobProgress } from "@/types/job-progress.types";

export const DREAM_PROGRESS_QUERY_KEY = "dreamProgress";

const DREAM_STALE_TIME_MS = 1000;
const PROGRESS_STALE_TIME_MS = 5000;
const CONNECTED_POLL_INTERVAL_MS = 30_000;
const DISCONNECTED_POLL_INTERVAL_MS = 5000;

export const getDreamProgressQueryKey = (uuid?: string) =>
  [DREAM_PROGRESS_QUERY_KEY, uuid] as const;

export function applyProgress(
  queryClient: QueryClient,
  incoming: DreamJobProgress,
): DreamJobProgress | undefined {
  if (!incoming?.dream_uuid || !incoming.stage) return;

  const queryKey = getDreamProgressQueryKey(incoming.dream_uuid);
  const current = queryClient.getQueryData<DreamJobProgress>(queryKey);
  const merged = latestProgress(current, incoming);
  if (merged !== current) queryClient.setQueryData(queryKey, merged);
  return merged;
}

async function fetchDreamProgress(
  queryClient: QueryClient,
  uuid?: string,
): Promise<DreamJobProgress> {
  if (!uuid) throw new Error("Dream UUID is required");

  const response = await queryClient.fetchQuery({
    queryKey: [DREAM_QUERY_KEY, uuid],
    queryFn: ({ signal }) => getDreamResponse(uuid, signal),
    staleTime: DREAM_STALE_TIME_MS,
  });
  const dream = response.data?.dream;
  if (!dream) throw new Error("Dream not found");

  return progressFromDream(dream);
}

export function useDreamProgress(
  dream?: DreamProgressSource,
  { poll = false }: { poll?: boolean } = {},
) {
  const queryClient = useQueryClient();
  const { isConnected } = useSocket();
  const uuid = dream?.uuid;
  const derived = dream ? progressFromDream(dream) : undefined;
  const pending = isActiveProgress(derived);

  useDreamRooms(pending && uuid ? [uuid] : []);

  const { data: live } = useQuery<DreamJobProgress>({
    queryKey: getDreamProgressQueryKey(uuid),
    queryFn: () => fetchDreamProgress(queryClient, uuid),
    enabled: Boolean(uuid) && pending && poll,
    staleTime: PROGRESS_STALE_TIME_MS,
    refetchOnWindowFocus: poll,
    refetchOnReconnect: poll,
    refetchInterval:
      poll && pending
        ? isConnected
          ? CONNECTED_POLL_INTERVAL_MS
          : DISCONNECTED_POLL_INTERVAL_MS
        : false,
  });

  if (!derived) return undefined;
  return live ? latestProgress(live, derived) : derived;
}
