import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import Bugsnag from "@bugsnag/js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGears, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/shared";
import { ConfirmModal } from "@/components/modals/confirm.modal";
import { Playlist, parseUprezPlaylistPrompt } from "@/types/playlist.types";
import { useRunPlaylist } from "@/api/playlist/mutation/useRunPlaylist";
import { useCancelPlaylist } from "@/api/playlist/mutation/useCancelPlaylist";
import { PLAYLIST_QUERY_KEY } from "@/api/playlist/query/usePlaylist";
import { PLAYLIST_ITEMS_QUERY_KEY } from "@/api/playlist/query/usePlaylistItems";
import { PLAYLIST_KEYFRAMES_QUERY_KEY } from "@/api/playlist/query/usePlaylistKeyframes";
import {
  UPREZ_RUN_PREVIEW_QUERY_KEY,
  useUprezRunPreview,
} from "@/api/playlist/query/useUprezRunPreview";
import { formatUprezRunSummary } from "@/utils/uprez-run-summary";

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
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const runPlaylist = useRunPlaylist();
  const cancelPlaylist = useCancelPlaylist();
  const [confirmRunOpen, setConfirmRunOpen] = useState(false);

  const uprezPrompt = useMemo(
    () => parseUprezPlaylistPrompt(playlist.prompt),
    [playlist.prompt],
  );

  // Fetched when the dialog opens, against the saved settings.
  const preview = useUprezRunPreview(playlist.uuid, {
    enabled: confirmRunOpen && Boolean(uprezPrompt),
  });
  const planned = preview.data;

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
      queryClient.invalidateQueries([
        UPREZ_RUN_PREVIEW_QUERY_KEY,
        playlist.uuid,
      ]),
    ]);
  };

  const runDialogText = planned
    ? formatUprezRunSummary(t, planned, "preview")
    : preview.isFetching
      ? "Checking what a run would do…"
      : "This will queue uprez jobs for the dreams in this playlist. New or changed source dreams get uprezed and any obsolete ones are removed. Continue?";

  const handleRun = async () => {
    setConfirmRunOpen(false);
    try {
      const { data } = await runPlaylist.mutateAsync(playlist.uuid);
      const result = data?.result;
      toast.success(
        result ? formatUprezRunSummary(t, result) : "Uprez run started.",
      );
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
        onClick={() => setConfirmRunOpen(true)}
        isLoading={runPlaylist.isLoading}
        disabled={runPlaylist.isLoading || cancelPlaylist.isLoading}
      >
        Run uprez
      </Button>

      <ConfirmModal
        isOpen={confirmRunOpen}
        onCancel={() => setConfirmRunOpen(false)}
        onConfirm={handleRun}
        isConfirming={runPlaylist.isLoading}
        title="Run uprez playlist"
        confirmText="Run uprez"
        confirmDisabled={planned !== undefined && !planned.hasWork}
        text={runDialogText}
      />
    </>
  );
};

export default UprezPlaylistControls;
