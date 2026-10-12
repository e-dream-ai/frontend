import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import Bugsnag from "@bugsnag/js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGears, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/shared";
import { ConfirmModal } from "@/components/modals/confirm.modal";
import { Playlist, parseEnhancePlaylistPrompt } from "@/types/playlist.types";
import { useRunPlaylist } from "@/api/playlist/mutation/useRunPlaylist";
import { useCancelPlaylist } from "@/api/playlist/mutation/useCancelPlaylist";
import { PLAYLIST_QUERY_KEY } from "@/api/playlist/query/usePlaylist";
import { PLAYLIST_ITEMS_QUERY_KEY } from "@/api/playlist/query/usePlaylistItems";
import { PLAYLIST_KEYFRAMES_QUERY_KEY } from "@/api/playlist/query/usePlaylistKeyframes";
import {
  ENHANCE_RUN_PREVIEW_QUERY_KEY,
  useEnhanceRunPreview,
} from "@/api/playlist/query/useEnhanceRunPreview";
import { formatEnhanceRunSummary } from "@/utils/enhance-run-summary";

interface Props {
  playlist: Playlist;
  isOwner: boolean;
  isUserAdmin: boolean;
  /** Whether any derived enhance dream is currently queued or processing. */
  isRunning: boolean;
}

export const EnhancePlaylistControls: React.FC<Props> = ({
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

  const enhancePrompt = useMemo(
    () => parseEnhancePlaylistPrompt(playlist.prompt),
    [playlist.prompt],
  );

  // Fetched when the dialog opens, against the saved settings.
  const preview = useEnhanceRunPreview(playlist.uuid, {
    enabled: confirmRunOpen && Boolean(enhancePrompt),
  });
  const planned = preview.data;

  if (!enhancePrompt || !(isOwner || isUserAdmin)) {
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
        ENHANCE_RUN_PREVIEW_QUERY_KEY,
        playlist.uuid,
      ]),
    ]);
  };

  const runDialogText = planned
    ? formatEnhanceRunSummary(t, planned, "preview", isRunning)
    : preview.isFetching
      ? "Checking what a run would do…"
      : "This will queue enhance jobs for the dreams in this playlist. New or changed source dreams get enhanced and any obsolete ones are removed. Continue?";

  const handleRun = async () => {
    setConfirmRunOpen(false);
    try {
      const { data } = await runPlaylist.mutateAsync(playlist.uuid);
      const result = data?.result;
      toast.success(
        result
          ? formatEnhanceRunSummary(t, result, "started", isRunning)
          : "Enhance run started.",
      );
      await invalidatePlaylist();
    } catch (err) {
      Bugsnag.notify(err as Error);
      toast.error("Failed to run enhance playlist.");
    }
  };

  const handleCancel = async () => {
    try {
      const { data } = await cancelPlaylist.mutateAsync(playlist.uuid);
      const cancelled = data?.result?.cancelled ?? 0;
      toast.success(
        cancelled > 0
          ? `Cancelled ${cancelled} in-flight enhance job${
              cancelled !== 1 ? "s" : ""
            }.`
          : "No in-flight enhance jobs to cancel.",
      );
      await invalidatePlaylist();
    } catch (err) {
      Bugsnag.notify(err as Error);
      toast.error("Failed to cancel enhance jobs.");
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
        Run enhance
      </Button>

      <ConfirmModal
        isOpen={confirmRunOpen}
        onCancel={() => setConfirmRunOpen(false)}
        onConfirm={handleRun}
        isConfirming={runPlaylist.isLoading}
        title="Run enhance playlist"
        confirmText="Run enhance"
        confirmDisabled={planned !== undefined && !planned.hasWork}
        text={runDialogText}
      />
    </>
  );
};

export default EnhancePlaylistControls;
