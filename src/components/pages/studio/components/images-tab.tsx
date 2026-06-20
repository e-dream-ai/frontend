import React, { useCallback, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useStudioStore } from "@/stores/studio.store";
import { axiosClient } from "@/client/axios.client";
import type { StudioImage, ImageModel } from "@/types/studio.types";
import { useFileDropUpload } from "../hooks/useFileDropUpload";
import { useUploadImageDream } from "@/api/dream/mutation/useUploadImageDream";
import { useModels } from "@/api/model/query/useModels";
import { useModelConstraints } from "@/api/model/query/useModelConstraints";
import {
  IMAGE_COUNT_OPTIONS,
  clampSizeToAllowed,
} from "../constants/size-options";
import {
  GenerateSection,
  SectionTitle,
  PromptTextarea,
  FormRow,
  FormField,
  FieldLabel,
  StyledSelect,
  GenerateButton,
  ImageGrid,
  ImageCard,
  ImageThumbnail,
  StarBadge,
  ImageStatus,
  SeedLabel,
  BottomRow,
  SelectionCount,
  NavButton,
  SecondaryNavButton,
  EmptyStateText,
  ButtonRow,
  LightboxOverlay,
  LightboxImage,
  ImagesTabContainer,
  LightboxUploadedImage,
} from "./images-tab.styled";
import { PresignedImage } from "@/components/shared/presigned-image";
import { AddFromPlaylistModal } from "./add-from-playlist-modal";

export const ImagesTab: React.FC = () => {
  const imagePrompt = useStudioStore((s) => s.imagePrompt);
  const setImagePrompt = useStudioStore((s) => s.setImagePrompt);
  const imageGenParams = useStudioStore((s) => s.imageGenParams);
  const setImageGenParams = useStudioStore((s) => s.setImageGenParams);
  const images = useStudioStore((s) => s.images);
  const addImage = useStudioStore((s) => s.addImage);
  const toggleImageSelected = useStudioStore((s) => s.toggleImageSelected);
  const selectAllImages = useStudioStore((s) => s.selectAllImages);
  const deselectAllImages = useStudioStore((s) => s.deselectAllImages);
  const setActiveTab = useStudioStore((s) => s.setActiveTab);

  const updateImage = useStudioStore((s) => s.updateImage);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadDream = useUploadImageDream();

  const isGenerating = useStudioStore((s) => s.isGenerating);
  const setIsGenerating = useStudioStore((s) => s.setIsGenerating);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [expandedImageUuid, setExpandedImageUuid] = useState<string | null>(
    null,
  );

  const { data: modelsData } = useModels({ mediaType: "image" });
  const modelOptions = useMemo(
    () => modelsData?.data?.models ?? [],
    [modelsData?.data?.models],
  );
  const modelConstraints = useModelConstraints({ mediaType: "image" });
  const sizeOptions =
    modelConstraints.get(imageGenParams.model)?.imageSizes ?? [];

  const processedImages = useMemo(
    () => images.filter((img) => img.status === "processed"),
    [images],
  );
  const selectedCount = useMemo(
    () => images.filter((img) => img.selected).length,
    [images],
  );
  const allProcessedSelected =
    processedImages.length > 0 && processedImages.every((img) => img.selected);

  const handleGenerate = useCallback(async () => {
    if (!imagePrompt.trim()) return;
    setIsGenerating(true);

    const baseSeed = Math.floor(Math.random() * 99_000) + 1;
    const currentImageCount = useStudioStore.getState().images.length;
    const modelLabel =
      modelOptions.find((m) => m.id === imageGenParams.model)?.label ??
      imageGenParams.model;

    const promises = Array.from(
      { length: imageGenParams.seedCount },
      (_, i) => {
        const seed = baseSeed + i;
        const algoParams = {
          infinidream_algorithm: imageGenParams.model,
          prompt: imagePrompt,
          size: imageGenParams.size,
          seed,
        };

        return axiosClient
          .post("/v1/dream", {
            name: `${modelLabel} ${currentImageCount + i + 1}`,
            prompt: JSON.stringify(algoParams),
            description: "Studio generated image",
          })
          .then(({ data }) => {
            const dream = data.data?.dream;
            if (!dream) return;
            addImage({
              uuid: dream.uuid,
              url: dream.thumbnail || "",
              name: dream.name,
              seed,
              size: imageGenParams.size,
              status: (dream.status as StudioImage["status"]) || "queue",
              selected: false,
            });
          })
          .catch((err) => {
            console.error("Failed to create image:", err);
          });
      },
    );

    await Promise.all(promises);
    setIsGenerating(false);
  }, [imagePrompt, imageGenParams, modelOptions, addImage, setIsGenerating]);

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
          selected: false,
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
        <SectionTitle>Generate New Images</SectionTitle>
        <PromptTextarea
          placeholder="Describe the image you want to generate..."
          value={imagePrompt}
          onChange={(e) => setImagePrompt(e.target.value)}
        />
        <FormRow>
          <FormField>
            <FieldLabel>Model:</FieldLabel>
            <StyledSelect
              value={imageGenParams.model}
              onChange={(e) => {
                const newModel = e.target.value as ImageModel;
                const newSizes =
                  modelConstraints.get(newModel)?.imageSizes ?? [];
                setImageGenParams({
                  model: newModel,
                  size: clampSizeToAllowed(imageGenParams.size, newSizes),
                });
              }}
            >
              {modelOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </StyledSelect>
          </FormField>
          <FormField>
            <FieldLabel>Images:</FieldLabel>
            <StyledSelect
              value={imageGenParams.seedCount}
              onChange={(e) =>
                setImageGenParams({ seedCount: Number(e.target.value) })
              }
            >
              {IMAGE_COUNT_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </StyledSelect>
          </FormField>
          <FormField>
            <FieldLabel>Size:</FieldLabel>
            <StyledSelect
              value={imageGenParams.size}
              onChange={(e) => setImageGenParams({ size: e.target.value })}
            >
              {sizeOptions.map((s) => (
                <option key={s} value={s}>
                  {s.replace("*", "x")}
                </option>
              ))}
            </StyledSelect>
          </FormField>
          <SecondaryNavButton onClick={() => fileInputRef.current?.click()}>
            Upload
          </SecondaryNavButton>
          <GenerateButton
            onClick={handleGenerate}
            disabled={!imagePrompt.trim() || isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate Images"}
          </GenerateButton>
        </FormRow>
      </GenerateSection>

      <GenerateSection>
        <SectionTitle>Image Library</SectionTitle>
        {images.length === 0 ? (
          <EmptyStateText>
            No images yet. Generate some above, upload, or add from a playlist.
          </EmptyStateText>
        ) : (
          <ImageGrid>
            {images.map((img) => (
              <ImageCard key={img.uuid} $selected={img.selected}>
                {img.status === "processed" ? (
                  img.url.startsWith("http") ? (
                    <ImageThumbnail
                      src={img.url}
                      alt={img.name}
                      onClick={() => setExpandedImageUuid(img.uuid)}
                      style={{ cursor: "zoom-in" }}
                    />
                  ) : (
                    <ImageThumbnail
                      as={PresignedImage}
                      dreamUuid={img.uuid}
                      alt={img.name}
                      onClick={() => setExpandedImageUuid(img.uuid)}
                      style={{ cursor: "zoom-in" }}
                    />
                  )
                ) : img.status === "processing" && img.url ? (
                  <ImageThumbnail
                    src={img.url}
                    alt={img.name}
                    style={{ opacity: 0.5 }}
                  />
                ) : (
                  <ImageStatus>
                    {img.status === "queue" && "Queued..."}
                    {img.status === "processing" && `${img.progress ?? 0}%`}
                    {img.status === "failed" && "Failed"}
                  </ImageStatus>
                )}
                {img.seed != null && <SeedLabel>#{img.seed}</SeedLabel>}
                <StarBadge
                  $active={img.selected}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleImageSelected(img.uuid);
                  }}
                >
                  {img.selected ? "\u2605" : "\u2606"}
                </StarBadge>
              </ImageCard>
            ))}
          </ImageGrid>
        )}
        <BottomRow>
          <ButtonRow>
            <SelectionCount>
              {selectedCount} selected for animation
            </SelectionCount>
            {processedImages.length > 0 && (
              <SecondaryNavButton
                onClick={
                  allProcessedSelected ? deselectAllImages : selectAllImages
                }
              >
                {allProcessedSelected ? "Deselect All" : "Select All"}
              </SecondaryNavButton>
            )}
          </ButtonRow>
          <ButtonRow>
            <SecondaryNavButton onClick={() => setShowPlaylistModal(true)}>
              + Add from Playlist
            </SecondaryNavButton>
            <NavButton onClick={() => setActiveTab("actions")}>
              Continue to Actions &rarr;
            </NavButton>
          </ButtonRow>
        </BottomRow>
      </GenerateSection>

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

      {expandedImageUuid && (
        <LightboxOverlay onClick={() => setExpandedImageUuid(null)}>
          {(() => {
            const img = images.find((i) => i.uuid === expandedImageUuid);
            return img?.url.startsWith("http") ? (
              <LightboxUploadedImage src={img.url} alt="Expanded" />
            ) : (
              <LightboxImage dreamUuid={expandedImageUuid} alt="Expanded" />
            );
          })()}
        </LightboxOverlay>
      )}
    </ImagesTabContainer>
  );
};
