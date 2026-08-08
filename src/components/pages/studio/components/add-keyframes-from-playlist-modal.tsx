import React, { useCallback, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useFlowStore } from "@/stores/flow.store";
import { useUserPlaylists } from "../hooks/useUserPlaylists";
import { usePlaylistImageDreams } from "../hooks/usePlaylistImageDreams";
import { useExistingDreamUuids } from "../hooks/useExistingDreamUuids";
import { useUuidSelection } from "../hooks/useUuidSelection";
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
  StatusMessage,
} from "./add-from-playlist-modal.styled";

interface Props {
  onClose: () => void;
}

export const AddKeyframesFromPlaylistModal: React.FC<Props> = ({ onClose }) => {
  const addKeyframe = useFlowStore((s) => s.addKeyframe);
  const { playlists } = useUserPlaylists();
  const existingDreamUuids = useExistingDreamUuids();
  const { selectedUuids, toggle, clear } = useUuidSelection();

  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
  const {
    dreams,
    isLoading,
    isError,
    hasMore,
    fetchNextPage,
    isFetchingNextPage,
  } = usePlaylistImageDreams(selectedPlaylistId);

  const handleAdd = useCallback(() => {
    for (const dream of dreams) {
      if (!selectedUuids.has(dream.uuid) || existingDreamUuids.has(dream.uuid))
        continue;
      addKeyframe({
        id: uuidv4(),
        dreamUuid: dream.uuid,
        // Prefer the full-resolution source over the thumbnail, matching
        // "+ My Images" — the keyframe feeds generation, not just display.
        imageUrl: dream.video || dream.original_video || dream.thumbnail,
        name: dream.name,
      });
    }
    onClose();
  }, [dreams, selectedUuids, existingDreamUuids, addKeyframe, onClose]);

  const showEmpty =
    Boolean(selectedPlaylistId) &&
    !isLoading &&
    !isError &&
    dreams.length === 0;

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
            onChange={(e) => {
              setSelectedPlaylistId(e.target.value);
              clear();
            }}
          >
            <option value="">Select a playlist...</option>
            {playlists.map((pl) => (
              <option key={pl.uuid} value={pl.uuid}>
                {pl.name}
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
                  const alreadyAdded = existingDreamUuids.has(dream.uuid);
                  return (
                    <ImageSelectCard
                      key={dream.uuid}
                      $selected={selectedUuids.has(dream.uuid)}
                      $disabled={alreadyAdded}
                      onClick={() => !alreadyAdded && toggle(dream.uuid)}
                      title={alreadyAdded ? "Already in strip" : dream.name}
                    >
                      <ImageSelectThumbnail
                        src={dream.thumbnail}
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
          <SecondaryNavButton onClick={onClose}>Cancel</SecondaryNavButton>
          <NavButton onClick={handleAdd} disabled={selectedUuids.size === 0}>
            Add {selectedUuids.size > 0 ? `(${selectedUuids.size})` : ""}
          </NavButton>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};
