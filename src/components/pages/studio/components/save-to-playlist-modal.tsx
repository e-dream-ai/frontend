import React, { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import Bugsnag from "@bugsnag/js";
import { useFlowStore } from "@/stores/flow.store";
import { useShallow } from "zustand/react/shallow";
import { useCreatePlaylist } from "@/api/playlist/mutation/useCreatePlaylist";
import { useAddPlaylistItem } from "@/api/playlist/mutation/useAddPlaylistItem";
import { useUserPlaylists } from "../hooks/useUserPlaylists";
import { ROUTES } from "@/constants/routes.constants";
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
  PlaylistList,
  PlaylistItem,
  Summary,
  ModalFooter,
  CancelButton,
  SaveButton,
  SpinningIcon,
} from "./save-to-playlist-modal.styled";

interface Props {
  onClose: () => void;
}

export const SaveToPlaylistModal: React.FC<Props> = ({ onClose }) => {
  const { transitions } = useFlowStore(
    useShallow((s) => ({ transitions: s.transitions })),
  );

  const completedTransitions = transitions.filter(
    (t) => t.status === "processed" && t.dreamUuid,
  );

  const [mode, setMode] = useState<"new" | "existing">("new");
  const [playlistName, setPlaylistName] = useState(
    `Studio Flow — ${new Date().toISOString().slice(0, 10)}`,
  );
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const { playlists, addPlaylistToCache } = useUserPlaylists();
  const createPlaylist = useCreatePlaylist();
  const addPlaylistItem = useAddPlaylistItem();

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

      toast.success(
        <span>
          Saved {total} transition{total !== 1 ? "s" : ""} to{" "}
          <a
            href={`${ROUTES.VIEW_PLAYLIST}/${playlistUUID}`}
            style={{ color: "inherit", textDecoration: "underline" }}
          >
            {finalName}
          </a>
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
    completedTransitions,
    createPlaylist,
    addPlaylistItem,
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
            <NameInput
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="Playlist name"
              autoFocus
            />
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
