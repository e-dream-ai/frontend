import { DreamProgressOverlay } from "@/components/shared/dream-progress/dream-progress";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useStudioStore } from "@/stores/studio.store";
import type { StudioImage } from "@/types/studio.types";
import { useFileDropUpload } from "../hooks/useFileDropUpload";
import { useUploadImageDream } from "@/api/dream/mutation/useUploadImageDream";
import {
  GenerateSection,
  SectionTitle,
  SectionHeaderRow,
  ImageGrid,
  ImageCard,
  ImageThumbnail,
  ThumbnailButton,
  DeleteButton,
  ImageStatus,
  SeedLabel,
  BottomRow,
  ImageCount,
  NavButton,
  AddButton,
  AddButtonPlus,
  EmptyStateText,
  ButtonRow,
  ImagesTabContainer,
} from "./images-tab.styled";
import { PresignedImage } from "@/components/shared/presigned-image";
import { AddFromPlaylistModal } from "./add-from-playlist-modal";
import { SelectImageDreamModal } from "./select-image-dream-modal";
import { GenerateReferenceFramesModal } from "./generate-reference-frames-modal";
import { ImageLightbox } from "./image-lightbox";
import type { Dream } from "@/types/dream.types";

export const ImagesTab: React.FC = () => {
  const images = useStudioStore((s) => s.images);
  const addImage = useStudioStore((s) => s.addImage);
  const removeImage = useStudioStore((s) => s.removeImage);
  const setActiveTab = useStudioStore((s) => s.setActiveTab);

  const updateImage = useStudioStore((s) => s.updateImage);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadDream = useUploadImageDream();

  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [expandedImageUuid, setExpandedImageUuid] = useState<string | null>(
    null,
  );

  // Already-present images are marked "added" in the library modal and skipped,
  // so re-opening it can't create duplicate cards.
  const existingImageUuids = useMemo(
    () => new Set(images.map((img) => img.uuid)),
    [images],
  );

  // The library lists every image dream the user owns, not just this session's
  // — the modal is shared with the flow app, which owns the same behaviour.
  const handleAddDreamsFromLibrary = useCallback(
    (dreams: Dream[]) => {
      for (const dream of dreams) {
        const studioImage: StudioImage = {
          uuid: dream.uuid,
          url: dream.thumbnail,
          name: dream.name,
          status: "processed",
        };
        addImage(studioImage);
      }
    },
    [addImage],
  );

  const processedImages = useMemo(
    () => images.filter((img) => img.status === "processed"),
    [images],
  );

  const handleUploadFiles = useCallback(
    async (files: File[]) => {
      for (const file of files) {
        const placeholderUuid = uuidv4();
        const blobUrl = URL.createObjectURL(file);
        addImage({
          uuid: placeholderUuid,
          url: blobUrl,
          name: file.name.replace(/\.[^.]+$/, ""),
          status: "processing",
        });

        try {
          const result = await uploadDream.mutateAsync({ file });
          updateImage(placeholderUuid, {
            uuid: result.dreamUuid,
            url: result.imageUrl,
            status: "processed",
            name: result.name,
          });
        } catch (err) {
          console.error("Failed to upload image:", err);
          updateImage(placeholderUuid, { status: "failed" });
        } finally {
          URL.revokeObjectURL(blobUrl);
        }
      }
    },
    [addImage, updateImage, uploadDream],
  );

  const handleFileSelected = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      await handleUploadFiles(Array.from(files));
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [handleUploadFiles],
  );

  const { isDragOver, dropHandlers } = useFileDropUpload({
    accept: ["image/jpeg", "image/png", "image/webp"],
    onFiles: handleUploadFiles,
  });

  return (
    <ImagesTabContainer $dragOver={isDragOver} {...dropHandlers}>
      <GenerateSection>
        <SectionHeaderRow>
          <SectionTitle>Reference Frames</SectionTitle>
          <ButtonRow>
            <AddButton onClick={() => fileInputRef.current?.click()}>
              <AddButtonPlus>+</AddButtonPlus> Upload
            </AddButton>
            <AddButton onClick={() => setShowGenerateModal(true)}>
              <AddButtonPlus>+</AddButtonPlus> Generate
            </AddButton>
            <AddButton onClick={() => setShowPlaylistModal(true)}>
              <AddButtonPlus>+</AddButtonPlus> From Playlist
            </AddButton>
            <AddButton onClick={() => setShowLibraryModal(true)}>
              <AddButtonPlus>+</AddButtonPlus> My Images
            </AddButton>
          </ButtonRow>
        </SectionHeaderRow>
        {images.length === 0 ? (
          <EmptyStateText>
            Add reference frames to get started. Generate, upload, or import
            from a playlist.
          </EmptyStateText>
        ) : (
          <ImageGrid>
            {images.map((img) => (
              <ImageCard key={img.uuid}>
                {img.status === "processed" ? (
                  <ThumbnailButton
                    type="button"
                    aria-label={`Preview ${img.name}`}
                    onClick={() => setExpandedImageUuid(img.uuid)}
                  >
                    {img.url.startsWith("http") ? (
                      <ImageThumbnail src={img.url} alt={img.name} />
                    ) : (
                      <ImageThumbnail
                        as={PresignedImage}
                        dreamUuid={img.uuid}
                        alt={img.name}
                      />
                    )}
                  </ThumbnailButton>
                ) : img.status === "processing" && img.url ? (
                  <ImageThumbnail $pending src={img.url} alt={img.name} />
                ) : img.status === "failed" ? (
                  <ImageStatus>Failed</ImageStatus>
                ) : null}
                <DreamProgressOverlay dream={img} />
                {img.seed != null && <SeedLabel>#{img.seed}</SeedLabel>}
                <DeleteButton
                  aria-label={`Remove ${img.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(img.uuid);
                  }}
                >
                  &times;
                </DeleteButton>
              </ImageCard>
            ))}
          </ImageGrid>
        )}
      </GenerateSection>

      <BottomRow>
        <ButtonRow>
          <ImageCount>
            {processedImages.length}{" "}
            {processedImages.length === 1 ? "frame" : "frames"} to animate
          </ImageCount>
        </ButtonRow>
        <ButtonRow>
          <NavButton onClick={() => setActiveTab("actions")}>
            Continue to Actions &rarr;
          </NavButton>
        </ButtonRow>
      </BottomRow>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        style={{ display: "none" }}
        onChange={handleFileSelected}
      />

      {showPlaylistModal && (
        <AddFromPlaylistModal onClose={() => setShowPlaylistModal(false)} />
      )}

      {showGenerateModal && (
        <GenerateReferenceFramesModal
          onClose={() => setShowGenerateModal(false)}
        />
      )}

      {showLibraryModal && (
        <SelectImageDreamModal
          onClose={() => setShowLibraryModal(false)}
          existingDreamUuids={existingImageUuids}
          onAdd={handleAddDreamsFromLibrary}
        />
      )}

      {expandedImageUuid && (
        <ImageLightbox
          images={processedImages}
          openUuid={expandedImageUuid}
          onClose={() => setExpandedImageUuid(null)}
          onOpenChange={setExpandedImageUuid}
        />
      )}
    </ImagesTabContainer>
  );
};
