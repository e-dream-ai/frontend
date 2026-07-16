import { useState, useCallback } from "react";
import { useFlowStore } from "@/stores/flow.store";
import { useShallow } from "zustand/react/shallow";
import { SaveToPlaylistModal } from "./save-to-playlist-modal";
import { ActionBarContainer, ActionButton } from "./flow-action-bar.styled";

export function FlowActionBar() {
  const { transitions, setPreviewLightboxOpen } = useFlowStore(
    useShallow((s) => ({
      transitions: s.transitions,
      setPreviewLightboxOpen: s.setPreviewLightboxOpen,
    })),
  );

  const [showSaveModal, setShowSaveModal] = useState(false);

  const hasResults = transitions.some((t) => t.status === "processed");

  const handlePreviewAll = useCallback(() => {
    setPreviewLightboxOpen(true);
  }, [setPreviewLightboxOpen]);

  const handleSaveToPlaylist = useCallback(() => {
    setShowSaveModal(true);
  }, []);

  if (!hasResults) return null;

  return (
    <>
      <ActionBarContainer>
        <ActionButton onClick={handlePreviewAll}>Preview All</ActionButton>

        <ActionButton onClick={handleSaveToPlaylist}>
          Save to Playlist
        </ActionButton>
      </ActionBarContainer>
      {showSaveModal && (
        <SaveToPlaylistModal onClose={() => setShowSaveModal(false)} />
      )}
    </>
  );
}
