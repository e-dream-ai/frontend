import React, { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import Bugsnag from "@bugsnag/js";
import { useFlowStore } from "@/stores/flow.store";
import { useShallow } from "zustand/react/shallow";
import { useCreatePlaylist } from "@/api/playlist/mutation/useCreatePlaylist";
import { useAddPlaylistItem } from "@/api/playlist/mutation/useAddPlaylistItem";
import { useUserPlaylists } from "../hooks/useUserPlaylists";
import { useCreateUprezPlaylist } from "../hooks/useCreateUprezPlaylist";
import { ROUTES } from "@/constants/routes.constants";
import {
  UprezFactorFields,
  type InterpolationFactor,
  type UpscaleFactor,
} from "./uprez-factor-row";
import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalBody,
  ModeToggleRow,
  ModeTab,
  NameInput,
  CheckboxLabel,
  UprezParams,
  PlaylistList,
  PlaylistItem,
  Summary,
  ModalFooter,
  CancelButton,
  SaveButton,
  SpinningIcon,
} from "./save-to-playlist-modal.styled";
import { syncFlowPlaylistKeyframes } from "@/components/pages/studio/utils/flow-keyframes";

interface Props {
  onClose: () => void;
}

export const SaveToPlaylistModal: React.FC<Props> = ({ onClose }) => {
  const { referenceFrames, transitions, linkSavedPlaylist } = useFlowStore(
    useShallow((s) => ({
      referenceFrames: s.referenceFrames,
      transitions: s.transitions,
      linkSavedPlaylist: s.linkSavedPlaylist,
    })),
  );

  const completedTransitions = transitions.filter(
    (t) => t.status === "processed" && t.dreamUuid,
  );

  const [mode, setMode] = useState<"new" | "existing">("new");
  const [playlistName, setPlaylistName] = useState(
    `Studio Flow — ${new Date().toISOString().slice(0, 10)}`,
  );
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
  const [createUprez, setCreateUprez] = useState(false);
  const [upscaleFactor, setUpscaleFactor] = useState<UpscaleFactor>(2);
  const [interpolationFactor, setInterpolationFactor] =
    useState<InterpolationFactor>(2);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const { playlists, addPlaylistToCache } = useUserPlaylists();
  const createPlaylist = useCreatePlaylist();
  const addPlaylistItem = useAddPlaylistItem();
  const { createAndRun: createUprezPlaylist } = useCreateUprezPlaylist();

  const canSave =
    completedTransitions.length > 0 &&
    (mode === "new"
      ? playlistName.trim().length > 0
      : selectedPlaylistId !== "");

  const handleSave = useCallback(async () => {
    if (!canSave) return;
    setIsSaving(true);
    const total = completedTransitions.length;
    setProgress({ current: 0, total });

    try {
      let playlistUUID: string;
      let finalName: string;
      let createdUprez: { uuid: string; name: string } | null = null;

      if (mode === "new") {
        const result = await createPlaylist.mutateAsync({
          name: playlistName.trim(),
        });
        const playlist = result.data?.playlist;
        if (!playlist) throw new Error("No playlist in response");
        playlistUUID = playlist.uuid;
        finalName = playlist.name;
        addPlaylistToCache({ uuid: playlist.uuid, name: playlist.name });
      } else {
        playlistUUID = selectedPlaylistId;
        finalName =
          playlists.find((p) => p.uuid === selectedPlaylistId)?.name ??
          "playlist";
      }

      for (let i = 0; i < completedTransitions.length; i++) {
        setProgress({ current: i + 1, total });
        await addPlaylistItem.mutateAsync({
          playlistUUID,
          values: {
            type: "dream",
            uuid: completedTransitions[i].dreamUuid!,
          },
        });
      }

      await syncFlowPlaylistKeyframes({
        playlistUuid: playlistUUID,
        referenceFrames,
        transitions: completedTransitions,
      });

      // Link this flow to the playlist so newly rendered dreams keep it in sync.
      linkSavedPlaylist(
        playlistUUID,
        completedTransitions.map((t) => t.dreamUuid!),
      );

      if (mode === "new" && createUprez) {
        try {
          const uprezPlaylist = await createUprezPlaylist({
            name: `${finalName} (uprez)`,
            sourcePlaylistUuid: playlistUUID,
            upscaleFactor,
            interpolationFactor,
          });
          addPlaylistToCache({
            uuid: uprezPlaylist.uuid,
            name: uprezPlaylist.name,
          });
          createdUprez = {
            uuid: uprezPlaylist.uuid,
            name: uprezPlaylist.name,
          };
          if (uprezPlaylist.runError) {
            toast.error(
              `${uprezPlaylist.name} was created but didn't start — run it from its playlist page.`,
            );
          }
        } catch (uprezErr) {
          Bugsnag.notify(uprezErr as Error);
          toast.error(
            "Playlist saved, but creating the uprez playlist failed.",
          );
        }
      }

      toast.success(
        <span>
          Saved {total} transition{total !== 1 ? "s" : ""} to{" "}
          <a
            href={`${ROUTES.VIEW_PLAYLIST}/${playlistUUID}`}
            style={{ color: "inherit", textDecoration: "underline" }}
          >
            {finalName}
          </a>
          {createdUprez && (
            <>
              {". "}Uprezing in{" "}
              <a
                href={`${ROUTES.VIEW_PLAYLIST}/${createdUprez.uuid}`}
                style={{ color: "inherit", textDecoration: "underline" }}
              >
                {createdUprez.name}
              </a>
            </>
          )}
        </span>,
      );
      onClose();
    } catch (err) {
      Bugsnag.notify(err as Error);
      toast.error("Failed to save — please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [
    canSave,
    mode,
    playlistName,
    selectedPlaylistId,
    referenceFrames,
    completedTransitions,
    createPlaylist,
    addPlaylistItem,
    createUprezPlaylist,
    createUprez,
    upscaleFactor,
    interpolationFactor,
    linkSavedPlaylist,
    addPlaylistToCache,
    playlists,
    onClose,
  ]);

  return (
    <ModalOverlay onClick={isSaving ? undefined : onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Save to Playlist</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <ModalBody>
          <ModeToggleRow>
            <ModeTab $active={mode === "new"} onClick={() => setMode("new")}>
              New Playlist
            </ModeTab>
            <ModeTab
              $active={mode === "existing"}
              onClick={() => setMode("existing")}
            >
              Existing Playlist
            </ModeTab>
          </ModeToggleRow>

          {mode === "new" ? (
            <>
              <NameInput
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                placeholder="Playlist name"
                autoFocus
              />
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={createUprez}
                  onChange={(e) => setCreateUprez(e.target.checked)}
                />
                Also create an uprez playlist (tracks this flow and uprezes new
                dreams on demand)
              </CheckboxLabel>

              {createUprez && (
                <UprezParams>
                  <UprezFactorFields
                    upscaleFactor={upscaleFactor}
                    interpolationFactor={interpolationFactor}
                    onUpscaleChange={setUpscaleFactor}
                    onInterpolationChange={setInterpolationFactor}
                  />
                </UprezParams>
              )}
            </>
          ) : (
            <PlaylistList>
              {playlists.length === 0 && (
                <Summary>No playlists found. Create a new one instead.</Summary>
              )}
              {playlists.map((pl) => (
                <PlaylistItem
                  key={pl.uuid}
                  $selected={selectedPlaylistId === pl.uuid}
                  onClick={() => setSelectedPlaylistId(pl.uuid)}
                >
                  {pl.name}
                </PlaylistItem>
              ))}
            </PlaylistList>
          )}

          <Summary>
            {isSaving
              ? `Adding ${progress.current} of ${progress.total}...`
              : `Adding ${completedTransitions.length} transition${
                  completedTransitions.length !== 1 ? "s" : ""
                }`}
          </Summary>
        </ModalBody>

        <ModalFooter>
          <CancelButton onClick={onClose} disabled={isSaving}>
            Cancel
          </CancelButton>
          <SaveButton onClick={handleSave} disabled={!canSave || isSaving}>
            {isSaving ? (
              <SpinningIcon>
                <Loader2 size={14} strokeWidth={2.4} />
              </SpinningIcon>
            ) : (
              "Save"
            )}
          </SaveButton>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};
