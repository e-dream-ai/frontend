import React, { useState, useCallback, useRef } from "react";
import Bugsnag from "@bugsnag/js";
import { v4 as uuidv4 } from "uuid";
import styled from "styled-components";
import { useFlowStore } from "@/stores/flow.store";
import { FLOW } from "@/constants/flow-theme.constants";
import { useUploadImageDream } from "@/api/dream/mutation/useUploadImageDream";
import { ReferenceFrameStrip } from "./reference-frame-strip";
import { TransitionSettingsPanel } from "./transition-settings-panel";
import { FlowPreview } from "./flow-preview";
import { FlowActionBar } from "./flow-action-bar";
import { AddReferenceFramesFromPlaylistModal } from "./add-reference-frames-from-playlist-modal";
import { SelectImageDreamModal } from "./select-image-dream-modal";
import { GenerateReferenceFramesModal } from "./generate-reference-frames-modal";
import { useGeneratedFrameSync } from "@/components/pages/studio/hooks/useGeneratedFrameSync";
import { useFlowGeneration } from "@/components/pages/studio/hooks/useFlowGeneration";
import { useFlowJobProgress } from "@/components/pages/studio/hooks/useFlowJobProgress";
import { useSavedPlaylistSync } from "@/components/pages/studio/hooks/useSavedPlaylistSync";
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
  const addReferenceFrame = useFlowStore((s) => s.addReferenceFrame);
  const updateReferenceFrame = useFlowStore((s) => s.updateReferenceFrame);
  const removeReferenceFrame = useFlowStore((s) => s.removeReferenceFrame);

  // Mount progress tracking
  useFlowJobProgress();

  useSavedPlaylistSync();

  // Fill in progress/thumbnails for referenceFrames created by the Generate dialog
  useGeneratedFrameSync();

  // Generation controls
  const { generateAll, generateOne, isGenerating } = useFlowGeneration();
  const uploadDream = useUploadImageDream();

  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      // Insert placeholder cards up-front so the user sees immediate feedback.
      // Each one carries a local objectURL preview + uploading state, then we
      // patch it in place with the real frame data when the upload settles.
      await Promise.all(
        files.map(async (file) => {
          const id = uuidv4();
          const objectUrl = URL.createObjectURL(file);
          addReferenceFrame({
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
                updateReferenceFrame(id, { uploadProgress: percent }),
              onUploadComplete: (dreamUuid) => {
                updateReferenceFrame(id, {
                  dreamUuid,
                  uploadStatus: undefined,
                  uploadProgress: undefined,
                });
              },
            });
            updateReferenceFrame(id, {
              imageUrl: result.imageUrl,
              name: result.name,
            });
            URL.revokeObjectURL(objectUrl);
          } catch (err) {
            Bugsnag.notify(err as Error);
            updateReferenceFrame(id, {
              uploadStatus: "failed",
              uploadProgress: undefined,
            });
            // Auto-clean failed placeholders after a few seconds so the strip
            // doesn't fill with orphans. The user has the option to dismiss
            // sooner via the card's delete button (visible on hover).
            window.setTimeout(() => {
              removeReferenceFrame(id);
              URL.revokeObjectURL(objectUrl);
            }, 6000);
          }
        }),
      );
    },
    [
      addReferenceFrame,
      updateReferenceFrame,
      removeReferenceFrame,
      uploadDream,
    ],
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

  const handleAddFromLibrary = useCallback(() => {
    setShowLibraryModal(true);
  }, []);

  const { isDragOver, dropHandlers } = useFileDropUpload({
    accept: ["image/jpeg", "image/png", "image/webp"],
    onFiles: uploadFiles,
  });

  return (
    <FlowContainer $dragOver={isDragOver} {...dropHandlers}>
      <ReferenceFrameStrip
        onAddUpload={handleAddUpload}
        onAddGenerate={() => setShowGenerateModal(true)}
        onAddFromPlaylist={handleAddFromPlaylist}
        onAddFromLibrary={handleAddFromLibrary}
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
        <AddReferenceFramesFromPlaylistModal
          onClose={() => setShowPlaylistModal(false)}
        />
      )}

      {showLibraryModal && (
        <SelectImageDreamModal onClose={() => setShowLibraryModal(false)} />
      )}

      {showGenerateModal && (
        <GenerateReferenceFramesModal
          onClose={() => setShowGenerateModal(false)}
        />
      )}
    </FlowContainer>
  );
};
