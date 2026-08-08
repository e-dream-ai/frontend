import React, { useState, useMemo, useCallback } from "react";
import { useStudioStore } from "@/stores/studio.store";
import type { StudioImage } from "@/types/studio.types";
import { useUserPlaylists } from "../hooks/useUserPlaylists";
import { usePlaylistImageDreams } from "../hooks/usePlaylistImageDreams";
import { useUuidSelection } from "../hooks/useUuidSelection";
import { mediaAspectRatio } from "../utils/media-aspect-ratio";
import {
  StyledSelect,
  NavButton,
  SecondaryNavButton,
} from "./images-tab.styled";
import { PresignedImage } from "@/components/shared/presigned-image";
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
  StatusMessage,
} from "./add-from-playlist-modal.styled";

interface Props {
  onClose: () => void;
}

export const AddFromPlaylistModal: React.FC<Props> = ({ onClose }) => {
  const addImage = useStudioStore((s) => s.addImage);
  const studioImages = useStudioStore((s) => s.images);
  const existingUuids = useMemo(
    () => new Set(studioImages.map((img) => img.uuid)),
    [studioImages],
  );

  const { playlists } = useUserPlaylists();
  const { selectedUuids, toggle, clear, replace } = useUuidSelection();

  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
  const {
    dreams,
    isLoading,
    isError,
    hasMore,
    fetchNextPage,
    isFetchingNextPage,
  } = usePlaylistImageDreams(selectedPlaylistId);

  const selectableUuids = useMemo(
    () =>
      dreams
        .map((dream) => dream.uuid)
        .filter((uuid) => !existingUuids.has(uuid)),
    [dreams, existingUuids],
  );
  const allSelectableSelected =
    selectableUuids.length > 0 &&
    selectableUuids.every((uuid) => selectedUuids.has(uuid));

  const toggleSelectAll = useCallback(() => {
    if (allSelectableSelected) clear();
    else replace(selectableUuids);
  }, [allSelectableSelected, selectableUuids, clear, replace]);

  const handleAdd = useCallback(() => {
    for (const dream of dreams) {
      if (!selectedUuids.has(dream.uuid) || existingUuids.has(dream.uuid))
        continue;

      const studioImage: StudioImage = {
        uuid: dream.uuid,
        url: dream.thumbnail,
        name: dream.name,
        status: "processed",
        selected: true,
      };
      addImage(studioImage);
    }
    onClose();
  }, [dreams, selectedUuids, existingUuids, addImage, onClose]);

  const showEmpty =
    Boolean(selectedPlaylistId) &&
    !isLoading &&
    !isError &&
    dreams.length === 0;

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
              clear();
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

          {isLoading && <StatusMessage>Loading...</StatusMessage>}

          {isError && (
            <StatusMessage>Couldn&apos;t load this playlist.</StatusMessage>
          )}

          {showEmpty && (
            <StatusMessage>No images in this playlist.</StatusMessage>
          )}

          {dreams.length > 0 && (
            <>
              <ImageSelectGrid>
                {dreams.map((dream) => {
                  const alreadyAdded = existingUuids.has(dream.uuid);
                  return (
                    <ImageSelectCard
                      key={dream.uuid}
                      $selected={selectedUuids.has(dream.uuid)}
                      $disabled={alreadyAdded}
                      onClick={() => !alreadyAdded && toggle(dream.uuid)}
                      title={alreadyAdded ? "Already added" : dream.name}
                    >
                      <ImageSelectThumbnail
                        as={PresignedImage}
                        dreamUuid={dream.uuid}
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
              {hasMore && (
                <SecondaryNavButton
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  style={{ marginTop: "1rem" }}
                >
                  {isFetchingNextPage ? "Loading..." : "Load more"}
                </SecondaryNavButton>
              )}
            </>
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
