import React from "react";
import { useStudioStore } from "@/stores/studio.store";
import { StudioTabs } from "./components/studio-tabs";
import { ImagesTab } from "./components/images-tab";
import { ActionsTab } from "./components/actions-tab";
import { GenerateTab } from "./components/generate-tab";
import { ResultsTab } from "./components/results-tab";
import { useStudioJobProgress } from "./hooks/useStudioJobProgress";
import {
  StudioContainer,
  StudioHeader,
  StudioTitle,
  NewSessionButton,
} from "./studio.page.styled";

export const StudioPage: React.FC = () => {
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
        {hasContent && (
          <NewSessionButton onClick={handleNewSession}>
            New Session
          </NewSessionButton>
        )}
      </StudioHeader>
      <StudioTabs />
      {activeTab === "images" && <ImagesTab />}
      {activeTab === "actions" && <ActionsTab />}
      {activeTab === "generate" && <GenerateTab />}
      {activeTab === "results" && <ResultsTab />}
    </StudioContainer>
  );
};
