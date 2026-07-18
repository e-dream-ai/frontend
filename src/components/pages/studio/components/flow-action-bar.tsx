import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useFlowStore } from "@/stores/flow.store";
import { useShallow } from "zustand/react/shallow";
import { ROUTES } from "@/constants/routes.constants";
import { SaveToPlaylistModal } from "./save-to-playlist-modal";
import { ActionBarContainer, ActionButton } from "./flow-action-bar.styled";

export function FlowActionBar() {
  const navigate = useNavigate();
  const { transitions, savedPlaylistUuid, setPreviewLightboxOpen } =
    useFlowStore(
      useShallow((s) => ({
        transitions: s.transitions,
        savedPlaylistUuid: s.savedPlaylistUuid,
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

  const handleOpenPlaylist = useCallback(() => {
    if (savedPlaylistUuid) {
      navigate(`${ROUTES.VIEW_PLAYLIST}/${savedPlaylistUuid}`);
    }
  }, [navigate, savedPlaylistUuid]);

  if (!hasResults) return null;

  return (
    <>
      <ActionBarContainer>
        <ActionButton onClick={handlePreviewAll}>Preview All</ActionButton>

        {savedPlaylistUuid ? (
          <ActionButton onClick={handleOpenPlaylist}>
            Open Playlist
          </ActionButton>
        ) : (
          <ActionButton onClick={handleSaveToPlaylist}>
            Save to Playlist
          </ActionButton>
        )}
      </ActionBarContainer>
      {showSaveModal && (
        <SaveToPlaylistModal onClose={() => setShowSaveModal(false)} />
      )}
    </>
  );
}
