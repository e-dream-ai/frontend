import React, { useCallback, useState } from "react";
import { useStudioStore } from "@/stores/studio.store";
import { useCreateDreamFromPrompt } from "@/api/dream/mutation/useCreateDreamFromPrompt";
import type { StudioImage } from "@/types/studio.types";
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
} from "./images-tab.styled";
import { AddFromPlaylistModal } from "./add-from-playlist-modal";

const SEED_OPTIONS = [1, 4, 8, 12, 16, 24];
const SIZE_OPTIONS = ["1280*720", "1024*1024", "720*1280", "512*512"];

export const ImagesTab: React.FC = () => {
  const imagePrompt = useStudioStore((s) => s.imagePrompt);
  const setImagePrompt = useStudioStore((s) => s.setImagePrompt);
  const qwenParams = useStudioStore((s) => s.qwenParams);
  const setQwenParams = useStudioStore((s) => s.setQwenParams);
  const images = useStudioStore((s) => s.images);
  const addImage = useStudioStore((s) => s.addImage);
  const toggleImageSelected = useStudioStore((s) => s.toggleImageSelected);
  const setActiveTab = useStudioStore((s) => s.setActiveTab);
  const createDream = useCreateDreamFromPrompt();

  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [expandedImageUrl, setExpandedImageUrl] = useState<string | null>(null);
  const selectedCount = images.filter((img) => img.selected).length;

  const handleGenerate = useCallback(() => {
    if (!imagePrompt.trim()) return;

    const baseSeed = Math.floor(Math.random() * 99_000) + 1;

    for (let i = 0; i < qwenParams.seedCount; i++) {
      const seed = baseSeed + i;
      const algoParams = {
        infinidream_algorithm: "qwen-image",
        prompt: imagePrompt,
        size: qwenParams.size,
        seed,
      };

      createDream.mutate(
        {
          name: `Qwen Image ${images.length + i + 1}`,
          prompt: JSON.stringify(algoParams),
          description: "Studio generated image",
        },
        {
          onSuccess: (response) => {
            const dream = response.data?.dream;
            if (!dream) return;
            addImage({
              uuid: dream.uuid,
              url: dream.thumbnail || "",
              name: dream.name,
              seed,
              status: dream.status as StudioImage["status"],
              selected: false,
            });
          },
        },
      );
    }
  }, [imagePrompt, qwenParams, images.length, createDream, addImage]);

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
            <FieldLabel>Seeds:</FieldLabel>
            <StyledSelect
              value={qwenParams.seedCount}
              onChange={(e) =>
                setQwenParams({ seedCount: Number(e.target.value) })
              }
            >
              {SEED_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </StyledSelect>
          </FormField>
          <FormField>
            <FieldLabel>Size:</FieldLabel>
            <StyledSelect
              value={qwenParams.size}
              onChange={(e) => setQwenParams({ size: e.target.value })}
            >
              {SIZE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.replace("*", "x")}
                </option>
              ))}
            </StyledSelect>
          </FormField>
          <GenerateButton
            onClick={handleGenerate}
            disabled={!imagePrompt.trim() || createDream.isLoading}
          >
            {createDream.isLoading ? "Generating..." : "Generate Images"}
          </GenerateButton>
        </FormRow>
      </GenerateSection>

      <GenerateSection>
        <SectionTitle>Image Library</SectionTitle>
        {images.length === 0 ? (
          <p style={{ color: "#888", fontSize: "0.875rem" }}>
            No images yet. Generate some above or add from a playlist.
          </p>
        ) : (
          <ImageGrid>
            {images.map((img) => (
              <ImageCard key={img.uuid} $selected={img.selected}>
                {img.status === "processed" && img.url ? (
                  <ImageThumbnail
                    src={img.url}
                    alt={img.name}
                    onClick={() => setExpandedImageUrl(img.url)}
                    style={{ cursor: "zoom-in" }}
                  />
                ) : (
                  <ImageStatus>
                    {img.status === "queue" && "Queued..."}
                    {img.status === "processing" &&
                      `${img.progress ?? 0}%`}
                    {img.status === "failed" && "Failed"}
                  </ImageStatus>
                )}
                {img.seed != null && (
                  <SeedLabel>seed:{img.seed}</SeedLabel>
                )}
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
          <SelectionCount>{selectedCount} selected for animation</SelectionCount>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <NavButton
              onClick={() => setShowPlaylistModal(true)}
              style={{
                background: "transparent",
                border: "1px solid #555",
              }}
            >
              + Add from Playlist
            </NavButton>
            <NavButton onClick={() => setActiveTab("actions")}>
              Continue to Actions &rarr;
            </NavButton>
          </div>
        </BottomRow>
      </GenerateSection>

      {showPlaylistModal && (
        <AddFromPlaylistModal onClose={() => setShowPlaylistModal(false)} />
      )}

      {expandedImageUrl && (
        <div
          onClick={() => setExpandedImageUrl(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            cursor: "zoom-out",
          }}
        >
          <img
            src={expandedImageUrl}
            alt="Expanded"
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              objectFit: "contain",
              borderRadius: "8px",
            }}
          />
        </div>
      )}
    </>
  );
};
