import { useEffect, type ReactNode } from "react";
import {
  focusManager,
  onlineManager,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import type { Socket } from "socket.io-client";
import useSocket from "@/hooks/useSocket";
import {
  DREAM_PROGRESS_QUERY_KEY,
  getDreamProgressQueryKey,
} from "@/hooks/useDreamProgress";
import { JOB_PROGRESS_EVENT } from "@/constants/remote-control.constants";
import { DREAM_QUERY_KEY } from "@/api/dream/query/useDream";
import { MY_DREAMS_QUERY_KEY } from "@/api/dream/query/useMyDreams";
import { MY_IMAGE_DREAMS_QUERY_KEY } from "@/api/dream/query/useMyImageDreams";
import { PLAYLIST_QUERY_KEY } from "@/api/playlist/query/usePlaylist";
import { PLAYLIST_ITEMS_QUERY_KEY } from "@/api/playlist/query/usePlaylistItems";
import type { DreamJobProgress } from "@/types/job-progress.types";
import { isActiveProgress, latestProgress } from "@/utils/job-progress.util";

const REFRESH_DELAY_MS = 300;
const RECONCILE_QUERY_KEYS = [
  DREAM_QUERY_KEY,
  DREAM_PROGRESS_QUERY_KEY,
  MY_DREAMS_QUERY_KEY,
  MY_IMAGE_DREAMS_QUERY_KEY,
  PLAYLIST_QUERY_KEY,
  PLAYLIST_ITEMS_QUERY_KEY,
];
const COMPLETION_QUERY_KEYS = [
  MY_DREAMS_QUERY_KEY,
  MY_IMAGE_DREAMS_QUERY_KEY,
  PLAYLIST_ITEMS_QUERY_KEY,
];

function invalidateQueries(queryClient: QueryClient, keys: readonly string[]) {
  keys.forEach((key) => {
    void queryClient.invalidateQueries(
      { queryKey: [key] },
      { cancelRefetch: false },
    );
  });
}

function cacheProgress(queryClient: QueryClient, incoming: DreamJobProgress) {
  if (!incoming?.dream_uuid || !incoming.stage) return;

  const queryKey = getDreamProgressQueryKey(incoming.dream_uuid);
  const current = queryClient.getQueryData<DreamJobProgress>(queryKey);
  const progress = latestProgress(current, incoming);
  if (progress !== current) queryClient.setQueryData(queryKey, progress);
}

function getProgressVersion(progress: DreamJobProgress) {
  return `${progress.run_id}:${progress.stage}:${progress.status}`;
}

function useJobProgressSync(socket: Socket | null | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const completed = new Set<string>();
    const versions = new Map<string, string>();
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;

    const reconcile = () => {
      if (!focusManager.isFocused() || !onlineManager.isOnline()) return;
      invalidateQueries(queryClient, RECONCILE_QUERY_KEYS);
    };

    const refresh = () => {
      refreshTimer = undefined;
      const keys = [PLAYLIST_QUERY_KEY];

      if (completed.size > 0) {
        completed.forEach((uuid) => {
          void queryClient.invalidateQueries([DREAM_QUERY_KEY, uuid]);
        });
        completed.clear();
        keys.push(...COMPLETION_QUERY_KEYS);
      }

      invalidateQueries(queryClient, keys);
    };

    const onProgress = (progress: DreamJobProgress) =>
      cacheProgress(queryClient, progress);

    const unsubscribeCache = queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== "updated" || event.action.type !== "success") return;
      if (event.query.queryKey[0] !== DREAM_PROGRESS_QUERY_KEY) return;

      const progress = event.query.state.data as DreamJobProgress | undefined;
      if (!progress) return;

      const version = getProgressVersion(progress);
      if (versions.get(progress.dream_uuid) === version) return;

      versions.set(progress.dream_uuid, version);
      if (!isActiveProgress(progress)) completed.add(progress.dream_uuid);
      refreshTimer ??= setTimeout(refresh, REFRESH_DELAY_MS);
    });

    socket?.on(JOB_PROGRESS_EVENT, onProgress);
    socket?.on("connect", reconcile);
    const unsubscribeFocus = focusManager.subscribe(reconcile);
    const unsubscribeOnline = onlineManager.subscribe(reconcile);
    if (socket?.connected) reconcile();

    return () => {
      socket?.off(JOB_PROGRESS_EVENT, onProgress);
      socket?.off("connect", reconcile);
      unsubscribeFocus();
      unsubscribeOnline();
      unsubscribeCache();
      clearTimeout(refreshTimer);
      queryClient.removeQueries([DREAM_PROGRESS_QUERY_KEY]);
    };
  }, [socket, queryClient]);
}

export function JobProgressProvider({ children }: { children?: ReactNode }) {
  const { socket } = useSocket();
  useJobProgressSync(socket);
  return <>{children}</>;
}
