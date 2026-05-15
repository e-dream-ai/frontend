import React, { useEffect, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { axiosClient } from "@/client/axios.client";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { useFlowStore } from "@/stores/flow.store";
import { useUserPlaylists } from "../hooks/useUserPlaylists";
import type { PlaylistKeyframe } from "@/types/playlist.types";
import {
  StyledSelect,
  NavButton,
  SecondaryNavButton,
  ImageThumbnail,
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
} from "./add-from-playlist-modal.styled";

interface Props {
  onClose: () => void;
}

export const AddKeyframesFromPlaylistModal: React.FC<Props> = ({ onClose }) => {
  const addKeyframe = useFlowStore((s) => s.addKeyframe);
  const existingKeyframes = useFlowStore((s) => s.keyframes);
  const { playlists } = useUserPlaylists();
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
  const [playlistKeyframes, setPlaylistKeyframes] = useState<
    PlaylistKeyframe[]
  >([]);
  const [selectedUuids, setSelectedUuids] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedPlaylistId) {
      setPlaylistKeyframes([]);
      return;
    }
    setLoading(true);
    axiosClient
      .get(`/v1/playlist/${selectedPlaylistId}/keyframes`, {
        headers: getRequestHeaders({ contentType: ContentType.json }),
      })
      .then((res) => {
        const items: PlaylistKeyframe[] = res.data.data?.keyframes ?? [];
        setPlaylistKeyframes(items);
      })
      .catch(() => setPlaylistKeyframes([]))
      .finally(() => setLoading(false));
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
    const existingUuids = new Set(
      existingKeyframes.map((kf) => kf.keyframeUuid),
    );
    for (const item of playlistKeyframes) {
      const kf = item.keyframe;
      if (!kf) continue;
      if (selectedUuids.has(kf.uuid) && !existingUuids.has(kf.uuid)) {
        addKeyframe({
          id: uuidv4(),
          keyframeUuid: kf.uuid,
          imageUrl: kf.image,
          name: kf.name,
          dreamUuid: kf.dreams?.[0]?.uuid,
        });
      }
    }
    onClose();
  }, [
    playlistKeyframes,
    selectedUuids,
    existingKeyframes,
    addKeyframe,
    onClose,
  ]);

  const validItems = playlistKeyframes.filter((pk) => pk.keyframe);

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

          {validItems.length > 0 && (
            <ImageSelectGrid>
              {validItems.map((item) => (
                <ImageSelectCard
                  key={item.keyframe!.uuid}
                  $selected={selectedUuids.has(item.keyframe!.uuid)}
                  onClick={() => toggleSelected(item.keyframe!.uuid)}
                >
                  <ImageThumbnail
                    src={item.keyframe!.image}
                    alt={item.keyframe!.name}
                  />
                </ImageSelectCard>
              ))}
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
