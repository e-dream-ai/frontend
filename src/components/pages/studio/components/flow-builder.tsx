import React, { useState, useCallback, useRef } from "react";
import Bugsnag from "@bugsnag/js";
import { v4 as uuidv4 } from "uuid";
import styled from "styled-components";
import { useFlowStore } from "@/stores/flow.store";
import { useStudioStore } from "@/stores/studio.store";
import { FLOW } from "@/constants/flow-theme.constants";
import { useUploadImageDream } from "@/api/dream/mutation/useUploadImageDream";
import { axiosClient } from "@/client/axios.client";
import type { VariationCandidate } from "@/types/flow.types";
import { KeyframeStrip } from "./keyframe-strip";
import { TransitionSettingsPanel } from "./transition-settings-panel";
import { FlowPreview } from "./flow-preview";
import { FlowActionBar } from "./flow-action-bar";
import { AddKeyframesFromPlaylistModal } from "./add-keyframes-from-playlist-modal";
import { SelectImageDreamModal } from "./select-image-dream-modal";
import { useFlowGeneration } from "@/components/pages/studio/hooks/useFlowGeneration";
import { useFlowJobProgress } from "@/components/pages/studio/hooks/useFlowJobProgress";
import { useFileDropUpload } from "../hooks/useFileDropUpload";

const FlowContainer = styled.div<{ $dragOver?: boolean }>`
  background: ${FLOW.bgCard};
  border: 1px solid ${FLOW.border};
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  min-height: 200px;
  transition:
    border-color 0.2s,
    background-color 0.2s;

  ${(props) =>
    props.$dragOver &&
    `
    border-color: ${FLOW.accent};
    background-color: ${FLOW.accentDim};
  `}
`;

export const FlowBuilder: React.FC = () => {
  const addKeyframe = useFlowStore((s) => s.addKeyframe);
  const updateKeyframe = useFlowStore((s) => s.updateKeyframe);
  const removeKeyframe = useFlowStore((s) => s.removeKeyframe);

  // Mount progress tracking
  useFlowJobProgress();

  // Generation controls
  const { generateAll, generateOne, isGenerating } = useFlowGeneration();
  const uploadDream = useUploadImageDream();

  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      // Insert placeholder cards up-front so the user sees immediate feedback.
      // Each one carries a local objectURL preview + uploading state, then we
      // patch it in place with the real keyframe data when the upload settles.
      await Promise.all(
        files.map(async (file) => {
          const id = uuidv4();
          const objectUrl = URL.createObjectURL(file);
          addKeyframe({
            id,
            imageUrl: objectUrl,
            name: file.name.replace(/\.[^.]+$/, ""),
            uploadStatus: "uploading",
            uploadProgress: 0,
          });

          try {
            const result = await uploadDream.mutateAsync({
              file,
              onProgress: (percent) =>
                updateKeyframe(id, { uploadProgress: percent }),
              onUploadComplete: (dreamUuid) => {
                updateKeyframe(id, {
                  dreamUuid,
                  uploadStatus: undefined,
                  uploadProgress: undefined,
                });
              },
            });
            updateKeyframe(id, {
              imageUrl: result.imageUrl,
              name: result.name,
            });
            URL.revokeObjectURL(objectUrl);
          } catch (err) {
            Bugsnag.notify(err as Error);
            updateKeyframe(id, {
              uploadStatus: "failed",
              uploadProgress: undefined,
            });
            // Auto-clean failed placeholders after a few seconds so the strip
            // doesn't fill with orphans. The user has the option to dismiss
            // sooner via the card's delete button (visible on hover).
            window.setTimeout(() => {
              removeKeyframe(id);
              URL.revokeObjectURL(objectUrl);
            }, 6000);
          }
        }),
      );
    },
    [addKeyframe, updateKeyframe, removeKeyframe, uploadDream],
  );

  const handleKeyframeVariations = useCallback(async (keyframeId: string) => {
    // Read image generation settings at call time (NOT via React subscription)
    // to keep callback identity stable across settings keystrokes.
    const { imagePrompt, imageGenParams } = useStudioStore.getState();
    const keyframe = useFlowStore
      .getState()
      .keyframes.find((kf) => kf.id === keyframeId);
    if (!keyframe) return;

    const VARIATION_COUNT = 4;
    const baseSeed = Math.floor(Math.random() * 99_000) + 1;

    // Build placeholder candidates up-front so the grid appears immediately.
    const candidates: VariationCandidate[] = Array.from(
      { length: VARIATION_COUNT },
      (_, i) => ({
        id: uuidv4(),
        method: "seed" as const,
        prompt: imagePrompt || keyframe.name,
        seed: baseSeed + i,
        status: "queue" as const,
      }),
    );

    useFlowStore.getState().addKeyframeVariations(keyframeId, candidates);

    // Fire all API calls in parallel — never sequential for-loop.
    await Promise.all(
      candidates.map(async (candidate) => {
        const algoParams = {
          infinidream_algorithm: imageGenParams.model,
          prompt: candidate.prompt,
          size: imageGenParams.size,
          seed: candidate.seed,
        };

        try {
          const { data } = await axiosClient.post("/v1/dream", {
            name: `${keyframe.name} v${candidate.seed}`,
            prompt: JSON.stringify(algoParams),
            description: "Keyframe variation",
          });
          const dreamUuid = data?.data?.dream?.uuid;
          if (!dreamUuid) {
            throw new Error("No dream UUID returned from API");
          }
          useFlowStore
            .getState()
            .updateKeyframeVariation(keyframeId, candidate.id, {
              dreamUuid,
              status: "queue",
            });
        } catch (err) {
          Bugsnag.notify(err as Error);
          useFlowStore
            .getState()
            .updateKeyframeVariation(keyframeId, candidate.id, {
              status: "failed",
            });
        }
      }),
    );
  }, []);

  const handleFileSelected = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      await uploadFiles(Array.from(files));
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [uploadFiles],
  );

  const handleAddFromPlaylist = useCallback(() => {
    setShowPlaylistModal(true);
  }, []);

  const handleAddFromLibrary = useCallback(() => {
    setShowLibraryModal(true);
  }, []);

  const { isDragOver, dropHandlers } = useFileDropUpload({
    accept: ["image/jpeg", "image/png", "image/webp"],
    onFiles: uploadFiles,
  });

  return (
    <FlowContainer $dragOver={isDragOver} {...dropHandlers}>
      <KeyframeStrip
        onAddUpload={handleAddUpload}
        onAddFromPlaylist={handleAddFromPlaylist}
        onAddFromLibrary={handleAddFromLibrary}
        onRetry={generateOne}
        onRequestVariations={handleKeyframeVariations}
      />

      <TransitionSettingsPanel
        onGenerateAll={generateAll}
        onGenerateOne={generateOne}
        isGenerating={isGenerating}
      />

      <FlowPreview />
      <FlowActionBar />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        style={{ display: "none" }}
        onChange={handleFileSelected}
      />

      {showPlaylistModal && (
        <AddKeyframesFromPlaylistModal
          onClose={() => setShowPlaylistModal(false)}
        />
      )}

      {showLibraryModal && (
        <SelectImageDreamModal onClose={() => setShowLibraryModal(false)} />
      )}
    </FlowContainer>
  );
};
