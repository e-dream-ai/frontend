import React, { useEffect, useState, useCallback, useMemo } from "react";
import { axiosClient } from "@/client/axios.client";
import { useStudioStore } from "@/stores/studio.store";
import type { StudioImage } from "@/types/studio.types";
import { useUserPlaylists } from "../hooks/useUserPlaylists";
import {
  StyledSelect,
  NavButton,
  SecondaryNavButton,
} from "./images-tab.styled";
import { PresignedImage } from "@/components/shared/presigned-image";
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
  const addImage = useStudioStore((s) => s.addImage);
  const studioImages = useStudioStore((s) => s.images);
  const existingUuids = useMemo(
    () => new Set(studioImages.map((img) => img.uuid)),
    [studioImages],
  );

  const { playlists } = useUserPlaylists();

  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
  const [items, setItems] = useState<PlaylistItem[]>([]);
  const [selectedUuids, setSelectedUuids] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedPlaylistId) {
      setItems([]);
      return;
    }
    let ignore = false;
    setLoading(true);
    axiosClient
      .get(`/v1/playlist/${selectedPlaylistId}/items?take=100&skip=0`)
      .then(({ data }) => {
        if (!ignore) {
          setItems(
            data.data.items.filter(
              (item: PlaylistItem) =>
                item.dreamItem?.thumbnail &&
                (!item.dreamItem.mediaType ||
                  item.dreamItem.mediaType === "image"),
            ),
          );
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [selectedPlaylistId]);

  const selectableUuids = useMemo(
    () =>
      items
        .map((item) => item.dreamItem?.uuid)
        .filter((uuid): uuid is string => !!uuid && !existingUuids.has(uuid)),
    [items, existingUuids],
  );
  const allSelectableSelected =
    selectableUuids.length > 0 &&
    selectableUuids.every((uuid) => selectedUuids.has(uuid));

  const toggleSelectAll = useCallback(() => {
    if (allSelectableSelected) {
      setSelectedUuids(new Set());
    } else {
      setSelectedUuids(new Set(selectableUuids));
    }
  }, [allSelectableSelected, selectableUuids]);

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
                    onClick={() => !alreadyAdded && toggleSelected(dream.uuid)}
                    style={{ opacity: alreadyAdded ? 0.4 : 1 }}
                  >
                    <ImageThumbnail as={PresignedImage} dreamUuid={dream.uuid} alt={dream.name} />
                  </ImageSelectCard>
                );
              })}
            </ImageSelectGrid>
          )}
        </ModalBody>

        <ModalFooter>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <span style={{ fontSize: "0.8125rem", color: "#888" }}>
              {selectedUuids.size} images selected
            </span>
            {selectableUuids.length > 0 && (
              <SecondaryNavButton onClick={toggleSelectAll}>
                {allSelectableSelected ? "Deselect All" : "Select All"}
              </SecondaryNavButton>
            )}
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <SecondaryNavButton onClick={onClose}>Cancel</SecondaryNavButton>
            <NavButton onClick={handleAdd} disabled={selectedUuids.size === 0}>
              Add Selected
            </NavButton>
          </div>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};
