import React, { lazy, Suspense, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useStudioStore } from "@/stores/studio.store";
import { useStudioModeStore } from "@/stores/studio-mode.store";
import { useFlowStore } from "@/stores/flow.store";
import { StudioTabs } from "./components/studio-tabs";
import { useStudioJobProgress } from "./hooks/useStudioJobProgress";
import { useFileDropUpload } from "./hooks/useFileDropUpload";
import { uploadKeyframeImage } from "./utils/upload-keyframe-image";
import {
  StudioContainer,
  StudioHeader,
  StudioTitle,
  NewSessionButton,
  ModeToggle,
  ModeButton,
} from "./studio.page.styled";

const ImagesTab = lazy(() =>
  import("./components/images-tab").then((m) => ({ default: m.ImagesTab })),
);
const ActionsTab = lazy(() =>
  import("./components/actions-tab").then((m) => ({ default: m.ActionsTab })),
);
const GenerateTab = lazy(() =>
  import("./components/generate-tab").then((m) => ({ default: m.GenerateTab })),
);
const ResultsTab = lazy(() =>
  import("./components/results-tab").then((m) => ({ default: m.ResultsTab })),
);
const FlowBuilder = lazy(() =>
  import("./components/flow-builder").then((m) => ({ default: m.FlowBuilder })),
);

export const StudioPage: React.FC = () => {
  const mode = useStudioModeStore((s) => s.mode);
  const setMode = useStudioModeStore((s) => s.setMode);

  const activeTab = useStudioStore((s) => s.activeTab);
  const resetSession = useStudioStore((s) => s.resetSession);
  const hasContent = useStudioStore(
    (s) => s.images.length > 0 || s.actions.length > 0 || s.jobs.length > 0,
  );
  useStudioJobProgress();

  const addImage = useStudioStore((s) => s.addImage);
  const updateImage = useStudioStore((s) => s.updateImage);
  const addKeyframe = useFlowStore((s) => s.addKeyframe);

  const handleStudioDrop = useCallback(
    async (files: File[]) => {
      const currentMode = useStudioModeStore.getState().mode;

      for (const file of files) {
        if (currentMode === "batch") {
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
            const result = await uploadKeyframeImage(file);
            updateImage(placeholderUuid, {
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
        } else {
          try {
            const result = await uploadKeyframeImage(file);
            addKeyframe({
              id: uuidv4(),
              keyframeUuid: result.keyframeUuid,
              imageUrl: result.imageUrl,
              name: result.name,
            });
          } catch (err) {
            console.error("Failed to upload keyframe:", err);
          }
        }
      }
    },
    [addImage, updateImage, addKeyframe],
  );

  const { isDragOver, dropHandlers } = useFileDropUpload({
    accept: ["image/jpeg", "image/png", "image/webp"],
    onFiles: handleStudioDrop,
  });

  const handleNewSession = () => {
    if (
      !window.confirm(
        "Start a new session? This will clear all current images, actions, and results.",
      )
    )
      return;
    resetSession();
  };

  return (
    <StudioContainer $dragOver={isDragOver} {...dropHandlers}>
      <StudioHeader>
        <StudioTitle>Studio</StudioTitle>
        <ModeToggle>
          <ModeButton $active={mode === "flow"} onClick={() => setMode("flow")}>
            Flow
          </ModeButton>
          <ModeButton
            $active={mode === "batch"}
            onClick={() => setMode("batch")}
          >
            Batch (Advanced)
          </ModeButton>
        </ModeToggle>
        {mode === "batch" && hasContent && (
          <NewSessionButton onClick={handleNewSession}>
            New Session
          </NewSessionButton>
        )}
      </StudioHeader>

      <Suspense fallback={null}>
        {mode === "flow" && <FlowBuilder />}
        {mode === "batch" && (
          <>
            <StudioTabs />
            {activeTab === "images" && <ImagesTab />}
            {activeTab === "actions" && <ActionsTab />}
            {activeTab === "generate" && <GenerateTab />}
            {activeTab === "results" && <ResultsTab />}
          </>
        )}
      </Suspense>
    </StudioContainer>
  );
};
