import React, { useState, useCallback, useRef } from "react";
import Bugsnag from "@bugsnag/js";
import { v4 as uuidv4 } from "uuid";
import styled from "styled-components";
import { useFlowStore } from "@/stores/flow.store";
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
  const updateKeyframe = useFlowStore((s) => s.updateKeyframe);
  const removeKeyframe = useFlowStore((s) => s.removeKeyframe);

  // Mount progress tracking
  useFlowJobProgress();

  // Generation controls
  const { generateAll, generateOne, isGenerating } = useFlowGeneration();

  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
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
            keyframeUuid: "",
            imageUrl: objectUrl,
            name: file.name.replace(/\.[^.]+$/, ""),
            uploadStatus: "uploading",
            uploadProgress: 0,
          });

          try {
            const result = await uploadKeyframeImage(file, (percent) => {
              updateKeyframe(id, { uploadProgress: percent });
            });
            updateKeyframe(id, {
              keyframeUuid: result.keyframeUuid,
              imageUrl: result.imageUrl,
              name: result.name,
              uploadStatus: undefined,
              uploadProgress: undefined,
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
    [addKeyframe, updateKeyframe, removeKeyframe],
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
        onAddUpload={handleAddUpload}
        onAddFromPlaylist={handleAddFromPlaylist}
        onRetry={generateOne}
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
    </FlowContainer>
  );
};
