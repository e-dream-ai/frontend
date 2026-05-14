import React, { useState, useCallback, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import styled from "styled-components";
import { useFlowStore } from "@/stores/flow.store";
import { useShallow } from "zustand/react/shallow";
import { FLOW } from "@/constants/flow-theme.constants";
import { uploadKeyframeImage } from "@/components/pages/studio/utils/upload-keyframe-image";
import { KeyframeStrip } from "./keyframe-strip";
import { TransitionSettingsPanel } from "./transition-settings-panel";
import { FlowPreview } from "./flow-preview";
import { FlowActionBar } from "./flow-action-bar";
import { AddKeyframesFromPlaylistModal } from "./add-keyframes-from-playlist-modal";
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
  const { keyframes, loop, recomputeTransitions } = useFlowStore(
    useShallow((s) => ({
      keyframes: s.keyframes,
      loop: s.loop,
      recomputeTransitions: s.recomputeTransitions,
    })),
  );

  // Recompute transitions when keyframes or loop changes
  useEffect(() => {
    recomputeTransitions();
  }, [keyframes.length, loop, recomputeTransitions]);

  // Mount progress tracking
  useFlowJobProgress();

  // Generation controls
  const { generateAll, generateOne, isGenerating } = useFlowGeneration();

  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddGenerate = useCallback(() => {
    alert("Inline image generation coming in Phase 1");
  }, []);

  const handleAddUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      for (const file of files) {
        try {
          const result = await uploadKeyframeImage(file);
          addKeyframe({
            id: uuidv4(),
            keyframeUuid: result.keyframeUuid,
            imageUrl: result.imageUrl,
            name: result.name,
          });
        } catch (err) {
          console.error("Failed to upload keyframe image:", err);
        }
      }
    },
    [addKeyframe],
  );

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

  const { isDragOver, dropHandlers } = useFileDropUpload({
    accept: ["image/jpeg", "image/png", "image/webp"],
    onFiles: uploadFiles,
  });

  return (
    <FlowContainer $dragOver={isDragOver} {...dropHandlers}>
      <KeyframeStrip
        onAddGenerate={handleAddGenerate}
        onAddUpload={handleAddUpload}
        onAddFromPlaylist={handleAddFromPlaylist}
      />

      <TransitionSettingsPanel
        onGenerateAll={generateAll}
        onGenerateOne={generateOne}
        isGenerating={isGenerating}
      />

      <FlowPreview />
      <FlowActionBar onPreviewAll={() => {}} />

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
    </FlowContainer>
  );
};
