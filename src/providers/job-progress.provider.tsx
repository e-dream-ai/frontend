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
  applyProgress,
} from "@/hooks/useDreamProgress";
import { JOB_PROGRESS_EVENT } from "@/constants/remote-control.constants";
import { DREAM_QUERY_KEY } from "@/api/dream/query/useDream";
import { MY_DREAMS_QUERY_KEY } from "@/api/dream/query/useMyDreams";
import { DREAMS_QUERY_KEY } from "@/api/dream/query/useDreams";
import { MY_IMAGE_DREAMS_QUERY_KEY } from "@/api/dream/query/useMyImageDreams";
import { PLAYLIST_QUERY_KEY } from "@/api/playlist/query/usePlaylist";
import { PLAYLIST_ITEMS_QUERY_KEY } from "@/api/playlist/query/usePlaylistItems";
import { PLAYLISTS_QUERY_KEY } from "@/api/playlist/query/usePlaylists";
import { MY_PLAYLISTS_QUERY_KEY } from "@/api/playlist/query/useMyPlaylists";
import { FEED_QUERY_KEY } from "@/api/feed/query/useFeed";
import { FEED_MY_DREAMS_QUERY_KEY } from "@/api/feed/query/useFeedMyDreams";
import { RANKED_FEED_QUERY_KEY } from "@/api/feed/query/useRankedFeed";
import { GROUPED_FEED_QUERY_KEY } from "@/api/feed/query/useGroupedFeed";
import type { DreamJobProgress } from "@/types/job-progress.types";
import { isActiveProgress } from "@/utils/job-progress.util";

const REFRESH_DELAY_MS = 300;
const LIST_QUERY_KEYS = [
  DREAMS_QUERY_KEY,
  MY_DREAMS_QUERY_KEY,
  MY_IMAGE_DREAMS_QUERY_KEY,
  PLAYLIST_QUERY_KEY,
  PLAYLIST_ITEMS_QUERY_KEY,
  PLAYLISTS_QUERY_KEY,
  MY_PLAYLISTS_QUERY_KEY,
  FEED_QUERY_KEY,
  FEED_MY_DREAMS_QUERY_KEY,
  RANKED_FEED_QUERY_KEY,
  GROUPED_FEED_QUERY_KEY,
];
const RECONCILE_QUERY_KEYS = [
  DREAM_QUERY_KEY,
  DREAM_PROGRESS_QUERY_KEY,
  ...LIST_QUERY_KEYS,
];
const COMPLETION_QUERY_KEYS = LIST_QUERY_KEYS;
const SUMMARY_QUERY_KEYS = [PLAYLIST_QUERY_KEY];

function invalidateQueries(queryClient: QueryClient, keys: readonly string[]) {
  keys.forEach((key) => {
    void queryClient.invalidateQueries(
      { queryKey: [key] },
      { cancelRefetch: false },
    );
  });
}

function getProgressVersion(progress: DreamJobProgress) {
  return `${progress.run_id}:${progress.stage}:${progress.status}`;
}

function useJobProgressSync(socket: Socket | null | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const active = new Set<string>();
    const completed = new Set<string>();
    const versions = new Map<string, string>();
    let summaryStale = false;
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;

    const reconcile = (force = false) => {
      if (!focusManager.isFocused() || !onlineManager.isOnline()) return;
      if (!force && active.size === 0) return;
      invalidateQueries(queryClient, RECONCILE_QUERY_KEYS);
    };

    const refresh = () => {
      refreshTimer = undefined;
      const keys = summaryStale ? SUMMARY_QUERY_KEYS : [];
      summaryStale = false;

      if (completed.size === 0) {
        invalidateQueries(queryClient, keys);
        return;
      }

      completed.forEach((uuid) => {
        void queryClient.invalidateQueries([DREAM_QUERY_KEY, uuid]);
      });
      completed.clear();
      invalidateQueries(queryClient, COMPLETION_QUERY_KEYS);
    };

    const track = (progress: DreamJobProgress) => {
      const version = getProgressVersion(progress);
      if (versions.get(progress.dream_uuid) === version) return;
      versions.set(progress.dream_uuid, version);
      summaryStale = true;

      if (isActiveProgress(progress)) {
        active.add(progress.dream_uuid);
      } else {
        active.delete(progress.dream_uuid);
        completed.add(progress.dream_uuid);
      }

      refreshTimer ??= setTimeout(refresh, REFRESH_DELAY_MS);
    };

    const onProgress = (progress: DreamJobProgress) => {
      const merged = applyProgress(queryClient, progress);
      if (merged) track(merged);
    };

    const unsubscribeCache = queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== "updated" || event.action.type !== "success") return;
      if (event.query.queryKey[0] !== DREAM_PROGRESS_QUERY_KEY) return;

      const progress = event.query.state.data as DreamJobProgress | undefined;
      if (progress) track(progress);
    });

    let wasDisconnected = false;
    const onDisconnect = () => {
      wasDisconnected = true;
    };
    const onConnect = () => {
      if (!wasDisconnected) return;
      wasDisconnected = false;
      reconcile(true);
    };
    const onFocusOrOnline = () => reconcile();

    socket?.on(JOB_PROGRESS_EVENT, onProgress);
    socket?.on("connect", onConnect);
    socket?.on("disconnect", onDisconnect);
    const unsubscribeFocus = focusManager.subscribe(onFocusOrOnline);
    const unsubscribeOnline = onlineManager.subscribe(onFocusOrOnline);

    return () => {
      socket?.off(JOB_PROGRESS_EVENT, onProgress);
      socket?.off("connect", onConnect);
      socket?.off("disconnect", onDisconnect);
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
