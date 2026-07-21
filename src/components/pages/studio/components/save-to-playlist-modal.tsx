import React, { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import Bugsnag from "@bugsnag/js";
import { useFlowStore } from "@/stores/flow.store";
import { useShallow } from "zustand/react/shallow";
import { useCreatePlaylist } from "@/api/playlist/mutation/useCreatePlaylist";
import { useAddPlaylistItem } from "@/api/playlist/mutation/useAddPlaylistItem";
import { useRunPlaylist } from "@/api/playlist/mutation/useRunPlaylist";
import { useUserPlaylists } from "../hooks/useUserPlaylists";
import { ROUTES } from "@/constants/routes.constants";
import {
  INTERPOLATION_FACTOR_OPTIONS,
  UPSCALE_FACTOR_OPTIONS,
} from "@/components/pages/studio/constants/uprez-factor-options";
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
  UprezParamRow,
  UprezParamLabel,
  FactorToggleGroup,
  FactorToggle,
  PlaylistList,
  PlaylistItem,
  Summary,
  ModalFooter,
  CancelButton,
  SaveButton,
  SpinningIcon,
} from "./save-to-playlist-modal.styled";
import { syncFlowPlaylistKeyframes } from "@/components/pages/studio/utils/flow-keyframes";

type UpscaleFactor = (typeof UPSCALE_FACTOR_OPTIONS)[number];
type InterpolationFactor = (typeof INTERPOLATION_FACTOR_OPTIONS)[number];
type Factor = UpscaleFactor | InterpolationFactor;

function FactorRow<T extends Factor>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (factor: T) => void;
}) {
  return (
    <UprezParamRow>
      <UprezParamLabel>{label}</UprezParamLabel>
      <FactorToggleGroup>
        {options.map((factor) => (
          <FactorToggle
            key={factor}
            type="button"
            $active={value === factor}
            onClick={() => onChange(factor)}
          >
            {factor}×
          </FactorToggle>
        ))}
      </FactorToggleGroup>
    </UprezParamRow>
  );
}

interface Props {
  onClose: () => void;
}

export const SaveToPlaylistModal: React.FC<Props> = ({ onClose }) => {
  const { keyframes, transitions, linkSavedPlaylist } = useFlowStore(
    useShallow((s) => ({
      keyframes: s.keyframes,
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
  const runPlaylist = useRunPlaylist();

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
        keyframes,
        transitions: completedTransitions,
      });

      // Link this flow to the playlist so newly rendered dreams keep it in sync.
      linkSavedPlaylist(
        playlistUUID,
        completedTransitions.map((t) => t.dreamUuid!),
      );

      if (mode === "new" && createUprez) {
        try {
          const uprezResult = await createPlaylist.mutateAsync({
            name: `${finalName} (uprez)`,
            prompt: {
              infinidream_algorithm: "uprez_playlist",
              source_playlist_uuid: playlistUUID,
              dream_algorithm: "uprez",
              params: {
                upscale_factor: upscaleFactor,
                interpolation_factor: interpolationFactor,
              },
            },
          });
          const uprezPlaylist = uprezResult.data?.playlist;
          if (uprezPlaylist) {
            addPlaylistToCache({
              uuid: uprezPlaylist.uuid,
              name: uprezPlaylist.name,
            });
            await runPlaylist.mutateAsync(uprezPlaylist.uuid);
            createdUprez = {
              uuid: uprezPlaylist.uuid,
              name: uprezPlaylist.name,
            };
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
    keyframes,
    completedTransitions,
    createPlaylist,
    addPlaylistItem,
    runPlaylist,
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
                  <FactorRow
                    label="Upscale factor"
                    options={UPSCALE_FACTOR_OPTIONS}
                    value={upscaleFactor}
                    onChange={setUpscaleFactor}
                  />
                  <FactorRow
                    label="Interpolation factor"
                    options={INTERPOLATION_FACTOR_OPTIONS}
                    value={interpolationFactor}
                    onChange={setInterpolationFactor}
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
