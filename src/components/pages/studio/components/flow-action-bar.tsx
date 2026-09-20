import { useCallback } from "react";
import { useFlowStore } from "@/stores/flow.store";
import { useShallow } from "zustand/react/shallow";
import { ActionBarContainer, ActionButton } from "./flow-action-bar.styled";

export function FlowActionBar() {
  const { transitions, setPreviewLightboxOpen } = useFlowStore(
    useShallow((s) => ({
      transitions: s.transitions,
      setPreviewLightboxOpen: s.setPreviewLightboxOpen,
    })),
  );

  const hasResults = transitions.some((t) => t.status === "processed");

  const handlePreviewAll = useCallback(() => {
    setPreviewLightboxOpen(true);
  }, [setPreviewLightboxOpen]);

  if (!hasResults) return null;

  return (
    <ActionBarContainer>
      <ActionButton onClick={handlePreviewAll}>Preview All</ActionButton>
    </ActionBarContainer>
  );
}
