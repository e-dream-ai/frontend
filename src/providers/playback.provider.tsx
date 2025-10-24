import React, { useCallback, useEffect } from "react";
import useSocket from "@/hooks/useSocket";
import { NEW_REMOTE_CONTROL_EVENT } from "@/constants/remote-control.constants";
import { usePlaybackStore } from "@/stores/playback.store";
import useAuth from "@/hooks/useAuth";
import { axiosClient } from "@/client/axios.client";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { Dream } from "@/types/dream.types";

export const PlaybackSyncProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const setCurrentDream = usePlaybackStore((s) => s.setCurrentDream);
  const setIsLoading = usePlaybackStore((s) => s.setIsLoadingCurrentDream);

  const fetchCurrentDream = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const res = await axiosClient.get<{ data: { dream?: Dream } }>(
        `/v2/auth/dream/current`,
        {
          headers: getRequestHeaders({ contentType: ContentType.json }),
        },
      );
      setCurrentDream(res?.data?.data?.dream);
    } catch (_) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [user, setCurrentDream, setIsLoading]);

  useEffect(() => {
    fetchCurrentDream();
  }, [fetchCurrentDream]);

  useEffect(() => {
    if (!socket) return;
    const handler = async (data?: { event?: string }) => {
      if (data?.event === "playing") {
        // refresh on playing events
        fetchCurrentDream();
      }
    };
    socket.on(NEW_REMOTE_CONTROL_EVENT, handler);
    return () => {
      socket.off(NEW_REMOTE_CONTROL_EVENT, handler);
    };
  }, [socket, fetchCurrentDream]);

  return <>{children}</>;
};

export default PlaybackSyncProvider;
