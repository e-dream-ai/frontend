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

function getPollInterval(
  progress: DreamJobProgress | undefined,
  pending: boolean,
  connected: boolean,
) {
  if (!pending || (progress && !isActiveProgress(progress))) return false;
  return connected ? CONNECTED_POLL_INTERVAL_MS : DISCONNECTED_POLL_INTERVAL_MS;
}

export function useDreamProgress(dream?: DreamProgressSource) {
  const queryClient = useQueryClient();
  const { isConnected } = useSocket();
  const uuid = dream?.uuid;
  const queryKey = getDreamProgressQueryKey(uuid);
  const cachedProgress = queryClient.getQueryData<DreamJobProgress>(queryKey);
  const pending =
    dream?.status === "queue" ||
    dream?.status === "processing" ||
    isActiveProgress(cachedProgress);

  useDreamRooms(pending && uuid ? [uuid] : []);

  const { data: progress } = useQuery<DreamJobProgress>({
    queryKey,
    queryFn: () => fetchDreamProgress(queryClient, uuid),
    enabled: Boolean(uuid) && pending,
    staleTime: PROGRESS_STALE_TIME_MS,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: (current) =>
      getPollInterval(current, pending, isConnected),
    structuralSharing: (current, next) =>
      latestProgress(current as DreamJobProgress | undefined, next),
  });

  return dream ? latestProgress(progress, progressFromDream(dream)) : undefined;
}
