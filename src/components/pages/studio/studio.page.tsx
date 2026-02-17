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
} from "./studio.page.styled";

export const StudioPage: React.FC = () => {
  const activeTab = useStudioStore((s) => s.activeTab);
  useStudioJobProgress();

  return (
    <StudioContainer>
      <StudioHeader>
        <StudioTitle>Studio</StudioTitle>
      </StudioHeader>
      <StudioTabs />
      {activeTab === "images" && <ImagesTab />}
      {activeTab === "actions" && <ActionsTab />}
      {activeTab === "generate" && <GenerateTab />}
      {activeTab === "results" && <ResultsTab />}
    </StudioContainer>
  );
};
