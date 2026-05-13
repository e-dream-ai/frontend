import React, { lazy, Suspense } from "react";
import { useStudioStore } from "@/stores/studio.store";
import { useStudioModeStore } from "@/stores/studio-mode.store";
import { StudioTabs } from "./components/studio-tabs";
import { useStudioJobProgress } from "./hooks/useStudioJobProgress";
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
    <StudioContainer>
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
