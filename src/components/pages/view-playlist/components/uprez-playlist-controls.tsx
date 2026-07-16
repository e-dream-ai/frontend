import React, { useMemo } from "react";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import Bugsnag from "@bugsnag/js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGears, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/shared";
import { Playlist, parseUprezPlaylistPrompt } from "@/types/playlist.types";
import { useRunPlaylist } from "@/api/playlist/mutation/useRunPlaylist";
import { useCancelPlaylist } from "@/api/playlist/mutation/useCancelPlaylist";
import { PLAYLIST_QUERY_KEY } from "@/api/playlist/query/usePlaylist";
import { PLAYLIST_ITEMS_QUERY_KEY } from "@/api/playlist/query/usePlaylistItems";
import { PLAYLIST_KEYFRAMES_QUERY_KEY } from "@/api/playlist/query/usePlaylistKeyframes";

interface Props {
  playlist: Playlist;
  isOwner: boolean;
  isUserAdmin: boolean;
  /** Whether any derived uprez dream is currently queued or processing. */
  isRunning: boolean;
}

export const UprezPlaylistControls: React.FC<Props> = ({
  playlist,
  isOwner,
  isUserAdmin,
  isRunning,
}) => {
  const queryClient = useQueryClient();
  const runPlaylist = useRunPlaylist();
  const cancelPlaylist = useCancelPlaylist();

  const uprezPrompt = useMemo(
    () => parseUprezPlaylistPrompt(playlist.prompt),
    [playlist.prompt],
  );

  if (!uprezPrompt || !(isOwner || isUserAdmin)) {
    return null;
  }

  const invalidatePlaylist = async () => {
    await Promise.all([
      queryClient.invalidateQueries([PLAYLIST_QUERY_KEY, playlist.uuid]),
      queryClient.invalidateQueries([PLAYLIST_ITEMS_QUERY_KEY, playlist.uuid]),
      queryClient.invalidateQueries([
        PLAYLIST_KEYFRAMES_QUERY_KEY,
        playlist.uuid,
      ]),
    ]);
  };

  const handleRun = async () => {
    try {
      const { data } = await runPlaylist.mutateAsync(playlist.uuid);
      const result = data?.result;
      if (result) {
        toast.success(
          `Uprez run started: ${result.created} new, ${result.requeued} re-queued, ${result.kept} kept, ${result.removed} removed, ${result.skipped} skipped.`,
        );
      } else {
        toast.success("Uprez run started.");
      }
      await invalidatePlaylist();
    } catch (err) {
      Bugsnag.notify(err as Error);
      toast.error("Failed to run uprez playlist.");
    }
  };

  const handleCancel = async () => {
    try {
      const { data } = await cancelPlaylist.mutateAsync(playlist.uuid);
      const cancelled = data?.result?.cancelled ?? 0;
      toast.success(
        cancelled > 0
          ? `Cancelled ${cancelled} in-flight uprez job${
              cancelled !== 1 ? "s" : ""
            }.`
          : "No in-flight uprez jobs to cancel.",
      );
      await invalidatePlaylist();
    } catch (err) {
      Bugsnag.notify(err as Error);
      toast.error("Failed to cancel uprez jobs.");
    }
  };

  return (
    <>
      {isRunning && (
        <Button
          type="button"
          mr="1rem"
          buttonType="danger"
          after={<FontAwesomeIcon icon={faTimes} />}
          onClick={handleCancel}
          isLoading={cancelPlaylist.isLoading}
          disabled={runPlaylist.isLoading || cancelPlaylist.isLoading}
        >
          Cancel
        </Button>
      )}
      <Button
        type="button"
        mr="1rem"
        after={<FontAwesomeIcon icon={faGears} />}
        onClick={handleRun}
        isLoading={runPlaylist.isLoading}
        disabled={runPlaylist.isLoading || cancelPlaylist.isLoading}
      >
        Run uprez
      </Button>
    </>
  );
};

export default UprezPlaylistControls;
