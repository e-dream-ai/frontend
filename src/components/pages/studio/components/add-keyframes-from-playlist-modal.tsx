import React, { useEffect, useState, useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { axiosClient } from "@/client/axios.client";
import { useFlowStore } from "@/stores/flow.store";
import { useUserPlaylists } from "../hooks/useUserPlaylists";
import { mediaAspectRatio } from "../utils/media-aspect-ratio";
import {
  StyledSelect,
  NavButton,
  SecondaryNavButton,
} from "./images-tab.styled";
import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalBody,
  ModalFooter,
  ImageSelectGrid,
  ImageSelectCard,
  ImageSelectThumbnail,
} from "./add-from-playlist-modal.styled";

interface Props {
  onClose: () => void;
}

/**
 * The dream fields this picker needs from /v1/playlist/:uuid/items, which
 * leftJoinAndSelects the whole dream and signs its media URLs.
 */
interface PlaylistDream {
  uuid: string;
  name: string;
  thumbnail?: string | null;
  video?: string | null;
  original_video?: string | null;
  mediaType?: string;
  processedMediaWidth?: number | null;
  processedMediaHeight?: number | null;
}

interface PlaylistItem {
  dreamItem?: PlaylistDream;
}

/**
 * Playlists mix video and still dreams; a flow keyframe is a still, so this
 * picker shows the same subset "+ My Images" does. Older dreams predate
 * mediaType and are images.
 */
const isImageDream = (dream?: PlaylistDream): dream is PlaylistDream =>
  !!dream?.thumbnail && (!dream.mediaType || dream.mediaType === "image");

export const AddKeyframesFromPlaylistModal: React.FC<Props> = ({ onClose }) => {
  const addKeyframe = useFlowStore((s) => s.addKeyframe);
  const existingKeyframes = useFlowStore((s) => s.keyframes);
  const { playlists } = useUserPlaylists();
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
  const [dreams, setDreams] = useState<PlaylistDream[]>([]);
  const [selectedUuids, setSelectedUuids] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const existingDreamUuids = useMemo(
    () =>
      new Set(
        existingKeyframes
          .map((kf) => kf.dreamUuid)
          .filter((v): v is string => Boolean(v)),
      ),
    [existingKeyframes],
  );

  useEffect(() => {
    if (!selectedPlaylistId) {
      setDreams([]);
      return;
    }
    let ignore = false;
    setLoading(true);
    setSelectedUuids(new Set());
    axiosClient
      .get(`/v1/playlist/${selectedPlaylistId}/items?take=100&skip=0`)
      .then(({ data }) => {
        if (ignore) return;
        const items: PlaylistItem[] = data?.data?.items ?? [];
        setDreams(
          items
            .map((item) => item.dreamItem)
            .filter((dream): dream is PlaylistDream => isImageDream(dream)),
        );
      })
      .catch(() => {
        if (!ignore) setDreams([]);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [selectedPlaylistId]);

  const toggleSelected = useCallback((uuid: string) => {
    setSelectedUuids((prev) => {
      const next = new Set(prev);
      if (next.has(uuid)) next.delete(uuid);
      else next.add(uuid);
      return next;
    });
  }, []);

  const handleAdd = useCallback(() => {
    for (const dream of dreams) {
      if (!selectedUuids.has(dream.uuid) || existingDreamUuids.has(dream.uuid))
        continue;
      addKeyframe({
        id: uuidv4(),
        dreamUuid: dream.uuid,
        // Prefer the full-resolution source over the thumbnail, matching
        // "+ My Images" — the keyframe feeds generation, not just display.
        imageUrl: dream.video || dream.original_video || dream.thumbnail || "",
        name: dream.name,
      });
    }
    onClose();
  }, [dreams, selectedUuids, existingDreamUuids, addKeyframe, onClose]);

  const showEmpty = !loading && selectedPlaylistId && dreams.length === 0;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Add Keyframes from Playlist</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        <ModalBody>
          <StyledSelect
            value={selectedPlaylistId}
            onChange={(e) => setSelectedPlaylistId(e.target.value)}
          >
            <option value="">Select a playlist...</option>
            {playlists.map((pl) => (
              <option key={pl.uuid} value={pl.uuid}>
                {pl.name}
              </option>
            ))}
          </StyledSelect>

          {loading && (
            <p style={{ color: "#999", marginTop: "1rem" }}>Loading...</p>
          )}

          {showEmpty && (
            <p style={{ color: "#999", marginTop: "1rem" }}>
              No images in this playlist.
            </p>
          )}

          {dreams.length > 0 && (
            <ImageSelectGrid>
              {dreams.map((dream) => {
                const alreadyAdded = existingDreamUuids.has(dream.uuid);
                return (
                  <ImageSelectCard
                    key={dream.uuid}
                    $selected={selectedUuids.has(dream.uuid)}
                    onClick={() => !alreadyAdded && toggleSelected(dream.uuid)}
                    style={
                      alreadyAdded
                        ? { opacity: 0.4, cursor: "default" }
                        : undefined
                    }
                    title={alreadyAdded ? "Already in strip" : dream.name}
                  >
                    <ImageSelectThumbnail
                      src={dream.thumbnail ?? undefined}
                      alt={dream.name}
                      $ratio={mediaAspectRatio(
                        dream.processedMediaWidth,
                        dream.processedMediaHeight,
                      )}
                    />
                  </ImageSelectCard>
                );
              })}
            </ImageSelectGrid>
          )}
        </ModalBody>
        <ModalFooter>
          <SecondaryNavButton onClick={onClose}>Cancel</SecondaryNavButton>
          <NavButton onClick={handleAdd} disabled={selectedUuids.size === 0}>
            Add {selectedUuids.size > 0 ? `(${selectedUuids.size})` : ""}
          </NavButton>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};
