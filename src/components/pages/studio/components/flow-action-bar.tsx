import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useFlowStore } from "@/stores/flow.store";
import { useShallow } from "zustand/react/shallow";
import { axiosClient } from "@/client/axios.client";
import { getRequestHeaders, ContentType } from "@/constants/auth.constants";
import type { UprezModel } from "@/types/studio.types";
import {
  ActionBarContainer,
  ActionButton,
  UprezDropdown,
  DropdownMenu,
  DropdownItem,
} from "./flow-action-bar.styled";

interface FlowActionBarProps {
  onPreviewAll: () => void;
}

export function FlowActionBar({ onPreviewAll }: FlowActionBarProps) {
  const {
    transitions,
    keyframes,
    setTransitionUprez,
    updateTransitionUprezStatus,
  } = useFlowStore(
    useShallow((s) => ({
      transitions: s.transitions,
      keyframes: s.keyframes,
      setTransitionUprez: s.setTransitionUprez,
      updateTransitionUprezStatus: s.updateTransitionUprezStatus,
    })),
  );

  const [uprezDropdownOpen, setUprezDropdownOpen] = useState(false);
  const [isUprezzing, setIsUprezzing] = useState(false);

  const hasResults = transitions.some((t) => t.status === "processed");

  const handleUprezAll = useCallback(
    async (uprezModel: UprezModel) => {
      setUprezDropdownOpen(false);
      setIsUprezzing(true);
      const headers = getRequestHeaders({ contentType: ContentType.json });

      try {
        const transitionCount = transitions.length;
        for (let i = 0; i < transitionCount; i++) {
          const t = useFlowStore.getState().transitions[i];
          if (!t || t.status !== "processed" || !t.dreamUuid) continue;
          if (
            t.uprezStatus === "processed" ||
            t.uprezStatus === "processing" ||
            t.uprezStatus === "queue"
          )
            continue;

          try {
            const algoParams = {
              infinidream_algorithm: uprezModel,
              video_uuid: t.dreamUuid,
              upscale_factor: 2,
              interpolation_factor: 2,
            };

            const { data } = await axiosClient.post(
              "/v1/dream",
              {
                name: `Uprez: ${
                  keyframes.find((kf) => kf.id === t.fromKeyframeId)?.name ||
                  "frame"
                } \u2192 ${
                  keyframes.find((kf) => kf.id === t.toKeyframeId)?.name ||
                  "frame"
                }`,
                prompt: JSON.stringify(algoParams),
              },
              { headers },
            );

            const uprezUuid = data?.data?.dream?.uuid;
            if (uprezUuid) {
              setTransitionUprez(i, uprezUuid);
              updateTransitionUprezStatus(i, "queue");
            }
          } catch (error) {
            console.error(`Uprez failed for transition ${i}:`, error);
            updateTransitionUprezStatus(i, "failed");
          }
        }
      } finally {
        setIsUprezzing(false);
      }
    },
    [transitions.length, setTransitionUprez, updateTransitionUprezStatus],
  );

  const handleSaveToPlaylist = useCallback(() => {
    toast.info(
      "Coming soon \u2014 Save to Playlist will be available in Phase 2",
    );
  }, []);

  if (!hasResults) return null;

  return (
    <ActionBarContainer>
      <ActionButton onClick={onPreviewAll}>Preview All</ActionButton>

      <UprezDropdown>
        <ActionButton
          $accent
          disabled={isUprezzing}
          onClick={() => setUprezDropdownOpen(!uprezDropdownOpen)}
        >
          Uprez All &#9662;
        </ActionButton>
        {uprezDropdownOpen && (
          <DropdownMenu>
            <DropdownItem onClick={() => handleUprezAll("nvidia-uprez")}>
              Nvidia Super Resolution
            </DropdownItem>
            <DropdownItem onClick={() => handleUprezAll("uprez")}>
              Standard Uprez
            </DropdownItem>
          </DropdownMenu>
        )}
      </UprezDropdown>

      <ActionButton onClick={handleSaveToPlaylist}>
        Save to Playlist
      </ActionButton>
    </ActionBarContainer>
  );
}
