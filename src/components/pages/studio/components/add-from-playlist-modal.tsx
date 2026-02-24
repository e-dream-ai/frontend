import React, { useEffect, useState, useCallback, useMemo } from "react";
import { axiosClient } from "@/client/axios.client";
import useAuth from "@/hooks/useAuth";
import { useStudioStore } from "@/stores/studio.store";
import type { StudioImage } from "@/types/studio.types";
import { StyledSelect, NavButton } from "./images-tab.styled";
import { ImageThumbnail } from "./images-tab.styled";
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

interface PlaylistItem {
  dreamItem?: {
    uuid: string;
    name: string;
    thumbnail: string;
    mediaType?: string;
  };
}

export const AddFromPlaylistModal: React.FC<Props> = ({ onClose }) => {
  const { user } = useAuth();
  const addImage = useStudioStore((s) => s.addImage);
  const studioImages = useStudioStore((s) => s.images);
  const existingUuids = useMemo(
    () => new Set(studioImages.map((img) => img.uuid)),
    [studioImages],
  );

  const [playlists, setPlaylists] = useState<
    Array<{ uuid: string; name: string }>
  >([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
  const [items, setItems] = useState<PlaylistItem[]>([]);
  const [selectedUuids, setSelectedUuids] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.uuid) return;
    axiosClient
      .get(`/v1/playlist?userUUID=${user.uuid}&take=200&skip=0`)
      .then(({ data }) => setPlaylists(data.data.playlists))
      .catch(() => {});
  }, [user?.uuid]);

  useEffect(() => {
    if (!selectedPlaylistId) {
      setItems([]);
      return;
    }
    setLoading(true);
    axiosClient
      .get(`/v1/playlist/${selectedPlaylistId}/items?take=100&skip=0`)
      .then(({ data }) => {
        setItems(
          data.data.items.filter(
            (item: PlaylistItem) =>
              item.dreamItem?.thumbnail &&
              (!item.dreamItem.mediaType ||
                item.dreamItem.mediaType === "image"),
          ),
        );
      })
      .catch(() => {})
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
    items.forEach((item) => {
      const dream = item.dreamItem;
      if (!dream || !selectedUuids.has(dream.uuid)) return;
      if (existingUuids.has(dream.uuid)) return;

      const studioImage: StudioImage = {
        uuid: dream.uuid,
        url: dream.thumbnail,
        name: dream.name,
        status: "processed",
        selected: true,
      };
      addImage(studioImage);
    });
    onClose();
  }, [items, selectedUuids, existingUuids, addImage, onClose]);

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Add Images from Playlist</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <ModalBody>
          <StyledSelect
            value={selectedPlaylistId}
            onChange={(e) => {
              setSelectedPlaylistId(e.target.value);
              setSelectedUuids(new Set());
            }}
            style={{ width: "100%" }}
          >
            <option value="">Select a playlist...</option>
            {playlists.map((p) => (
              <option key={p.uuid} value={p.uuid}>
                {p.name}
              </option>
            ))}
          </StyledSelect>

          {loading && (
            <p style={{ marginTop: "1rem", color: "#888" }}>Loading...</p>
          )}

          {items.length > 0 && (
            <ImageSelectGrid>
              {items.map((item) => {
                const dream = item.dreamItem;
                if (!dream) return null;
                const isSelected = selectedUuids.has(dream.uuid);
                const alreadyAdded = existingUuids.has(dream.uuid);

                return (
                  <ImageSelectCard
                    key={dream.uuid}
                    $selected={isSelected}
                    onClick={() =>
                      !alreadyAdded && toggleSelected(dream.uuid)
                    }
                    style={{ opacity: alreadyAdded ? 0.4 : 1 }}
                  >
                    <ImageThumbnail src={dream.thumbnail} alt={dream.name} />
                  </ImageSelectCard>
                );
              })}
            </ImageSelectGrid>
          )}
        </ModalBody>

        <ModalFooter>
          <span style={{ fontSize: "0.8125rem", color: "#888" }}>
            {selectedUuids.size} images selected
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <NavButton
              onClick={onClose}
              style={{
                background: "transparent",
                border: "1px solid #555",
              }}
            >
              Cancel
            </NavButton>
            <NavButton onClick={handleAdd} disabled={selectedUuids.size === 0}>
              Add Selected
            </NavButton>
          </div>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};
