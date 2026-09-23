import React from "react";
import { useStudioStore } from "@/stores/studio.store";
import type { StudioTab } from "@/types/studio.types";
import { TabBar, Tab } from "./studio-tabs.styled";

const TABS: { key: StudioTab; label: string }[] = [
  { key: "images", label: "Images" },
  { key: "actions", label: "Actions" },
  { key: "generate", label: "Matrix" },
];

export const StudioTabs: React.FC = () => {
  const activeTab = useStudioStore((s) => s.activeTab);
  const setActiveTab = useStudioStore((s) => s.setActiveTab);
  const newCompletedCount = useStudioStore((s) => s.newCompletedCount);

  return (
    <TabBar>
      {TABS.map((tab) => (
        <Tab
          key={tab.key}
          $active={activeTab === tab.key}
          $badge={
            tab.key === "generate" && activeTab !== "generate"
              ? newCompletedCount
              : undefined
          }
          onClick={() => setActiveTab(tab.key)}
        >
          {tab.label}
        </Tab>
      ))}
    </TabBar>
  );
};
