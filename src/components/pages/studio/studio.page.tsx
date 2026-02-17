import React from "react";
import { useStudioStore } from "@/stores/studio.store";
import { StudioTabs } from "./components/studio-tabs";
import {
  StudioContainer,
  StudioHeader,
  StudioTitle,
} from "./studio.page.styled";

export const StudioPage: React.FC = () => {
  const activeTab = useStudioStore((s) => s.activeTab);

  return (
    <StudioContainer>
      <StudioHeader>
        <StudioTitle>Studio</StudioTitle>
      </StudioHeader>
      <StudioTabs />
      {activeTab === "images" && <div>Images tab (coming soon)</div>}
      {activeTab === "actions" && <div>Actions tab (coming soon)</div>}
      {activeTab === "generate" && <div>Generate tab (coming soon)</div>}
      {activeTab === "results" && <div>Results tab (coming soon)</div>}
    </StudioContainer>
  );
};
