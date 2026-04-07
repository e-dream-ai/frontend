import React, { useCallback, useMemo, useState } from "react";
import { useStudioStore } from "@/stores/studio.store";
import { axiosClient } from "@/client/axios.client";
import type { StudioImage, ImageModel } from "@/types/studio.types";
import {
  SIZE_OPTIONS,
  IMAGE_COUNT_OPTIONS,
  clampSizeToModel,
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
} from "./images-tab.styled";
import { PresignedImage } from "@/components/shared/presigned-image";
import { AddFromPlaylistModal } from "./add-from-playlist-modal";

const MODEL_LABELS: Record<ImageModel, string> = {
  "z-image-turbo": "Z Image Turbo",
  "qwen-image": "Qwen Image",
};

const IMAGE_MODELS: ImageModel[] = ["z-image-turbo", "qwen-image"];

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

  const isGenerating = useStudioStore((s) => s.isGenerating);
  const setIsGenerating = useStudioStore((s) => s.setIsGenerating);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [expandedImageUuid, setExpandedImageUuid] = useState<string | null>(
    null,
  );

  const sizeOptions = SIZE_OPTIONS[imageGenParams.model];

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
            name: `${MODEL_LABELS[imageGenParams.model]} ${
              currentImageCount + i + 1
            }`,
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
  }, [imagePrompt, imageGenParams, addImage, setIsGenerating]);

  return (
    <>
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
                setImageGenParams({
                  model: newModel,
                  size: clampSizeToModel(imageGenParams.size, newModel),
                });
              }}
            >
              {IMAGE_MODELS.map((m) => (
                <option key={m} value={m}>
                  {MODEL_LABELS[m]}
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
            No images yet. Generate some above or add from a playlist.
          </EmptyStateText>
        ) : (
          <ImageGrid>
            {images.map((img) => (
              <ImageCard key={img.uuid} $selected={img.selected}>
                {img.status === "processed" ? (
                  <ImageThumbnail
                    as={PresignedImage}
                    dreamUuid={img.uuid}
                    alt={img.name}
                    onClick={() => setExpandedImageUuid(img.uuid)}
                    style={{ cursor: "zoom-in" }}
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

      {showPlaylistModal && (
        <AddFromPlaylistModal onClose={() => setShowPlaylistModal(false)} />
      )}

      {expandedImageUuid && (
        <LightboxOverlay onClick={() => setExpandedImageUuid(null)}>
          <LightboxImage dreamUuid={expandedImageUuid} alt="Expanded" />
        </LightboxOverlay>
      )}
    </>
  );
};
