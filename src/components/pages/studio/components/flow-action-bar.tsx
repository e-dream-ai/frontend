import { useState, useCallback, useMemo } from "react";
import Bugsnag from "@bugsnag/js";
import { Loader2, Check } from "lucide-react";
import { useFlowStore } from "@/stores/flow.store";
import { useShallow } from "zustand/react/shallow";
import { axiosClient } from "@/client/axios.client";
import { getRequestHeaders, ContentType } from "@/constants/auth.constants";
import { SaveToPlaylistModal } from "./save-to-playlist-modal";
import {
  ActionBarContainer,
  ActionButton,
  UprezDropdown,
  UprezProgressButton,
  UprezButtonContent,
  UprezDivider,
  UprezDoneBadge,
  FactorPopup,
  FactorLabel,
  FactorGrid,
  FactorOption,
  FactorValue,
  SplitButtonGroup,
  SplitMainButton,
  SplitCaretButton,
} from "./flow-action-bar.styled";

export function FlowActionBar() {
  const {
    transitions,
    keyframes,
    setTransitionUprez,
    updateTransitionUprezStatus,
    setPreviewLightboxOpen,
  } = useFlowStore(
    useShallow((s) => ({
      transitions: s.transitions,
      keyframes: s.keyframes,
      setTransitionUprez: s.setTransitionUprez,
      updateTransitionUprezStatus: s.updateTransitionUprezStatus,
      setPreviewLightboxOpen: s.setPreviewLightboxOpen,
    })),
  );

  const [isUprezzing, setIsUprezzing] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [interpolationFactor, setInterpolationFactor] = useState<2 | 4>(2);
  const [factorPopupOpen, setFactorPopupOpen] = useState(false);

  const hasResults = transitions.some((t) => t.status === "processed");

  // Aggregate uprez state across all transitions that are eligible (or already running).
  const uprezState = useMemo(() => {
    const eligible = transitions.filter(
      (t) =>
        t.status === "processed" &&
        t.dreamUuid &&
        (t.uprezStatus === "queue" ||
          t.uprezStatus === "processing" ||
          t.uprezStatus === "processed" ||
          t.uprezStatus === "failed"),
    );
    if (eligible.length === 0) {
      return { inFlight: 0, done: 0, failed: 0, total: 0, percent: 0 };
    }
    const inFlight = eligible.filter(
      (t) => t.uprezStatus === "queue" || t.uprezStatus === "processing",
    );
    const done = eligible.filter((t) => t.uprezStatus === "processed");
    const failed = eligible.filter((t) => t.uprezStatus === "failed");

    // Average completion across the whole batch:
    // done → 100%, processing → uprezProgress, queue → 0%, failed → 0%.
    const totalProgress =
      done.length * 100 +
      inFlight.reduce(
        (acc, t) =>
          acc + (t.uprezStatus === "processing" ? t.uprezProgress ?? 0 : 0),
        0,
      );
    const percent = totalProgress / eligible.length;

    return {
      inFlight: inFlight.length,
      done: done.length,
      failed: failed.length,
      total: eligible.length,
      percent,
    };
  }, [transitions]);

  const handleUprezAll = useCallback(
    async (factor: 2 | 4 = interpolationFactor) => {
      setFactorPopupOpen(false);
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
              infinidream_algorithm: "uprez",
              video_uuid: t.dreamUuid,
              upscale_factor: 2,
              interpolation_factor: factor,
            };

            const { data } = await axiosClient.post(
              "/v1/dream",
              {
                name: `Uprez: ${
                  keyframes.find((kf) => kf.id === t.fromKeyframeId)?.name ||
                  "frame"
                } → ${
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
            Bugsnag.notify(error as Error);
            updateTransitionUprezStatus(i, "failed");
          }
        }
      } finally {
        setIsUprezzing(false);
      }
    },
    [
      interpolationFactor,
      transitions.length,
      keyframes,
      setTransitionUprez,
      updateTransitionUprezStatus,
    ],
  );

  const handlePreviewAll = useCallback(() => {
    setPreviewLightboxOpen(true);
  }, [setPreviewLightboxOpen]);

  const handleSaveToPlaylist = useCallback(() => {
    setShowSaveModal(true);
  }, []);

  if (!hasResults) return null;

  // Visual state for the Uprez slot:
  //  - submitting: HTTP roundtrip for /v1/dream POSTs is in flight (local state)
  //  - running:    at least one transition is queue/processing on the worker
  //  - allDone:    every eligible transition has finished uprez successfully
  //  - idle:       not in any of the above — show the dropdown trigger
  const running = uprezState.inFlight > 0;
  const allDone =
    uprezState.total > 0 &&
    uprezState.done === uprezState.total &&
    uprezState.failed === 0;
  const showProgressButton = isUprezzing || running;

  return (
    <>
      <ActionBarContainer>
        <ActionButton onClick={handlePreviewAll}>Preview All</ActionButton>

        <UprezDropdown>
          {showProgressButton ? (
            <UprezProgressButton
              $percent={uprezState.percent}
              aria-live="polite"
              aria-label={`Interpolating ${uprezState.done} of ${
                uprezState.total
              }, ${Math.round(uprezState.percent)} percent`}
            >
              <UprezButtonContent>
                <Loader2 size={13} strokeWidth={2.4} className="spin" />
                <span>Interpolating</span>
                <UprezDivider />
                <span>
                  {uprezState.done}/{uprezState.total}
                </span>
              </UprezButtonContent>
            </UprezProgressButton>
          ) : allDone ? (
            <ActionButton $accent>
              <UprezButtonContent>
                <Check size={13} strokeWidth={2.8} />
                <span>Interpolated</span>
                <UprezDoneBadge>{uprezState.done}</UprezDoneBadge>
              </UprezButtonContent>
            </ActionButton>
          ) : (
            <SplitButtonGroup>
              <SplitMainButton $accent onClick={() => handleUprezAll()}>
                <UprezButtonContent>
                  <span>Interpolate All</span>
                  <UprezDivider />
                  <span>{interpolationFactor}×</span>
                </UprezButtonContent>
              </SplitMainButton>
              <SplitCaretButton
                $accent
                aria-label="Choose interpolation factor"
                aria-haspopup="menu"
                aria-expanded={factorPopupOpen}
                onClick={() => setFactorPopupOpen((o) => !o)}
              >
                <span aria-hidden>&#9662;</span>
              </SplitCaretButton>
            </SplitButtonGroup>
          )}

          {factorPopupOpen && !showProgressButton && (
            <FactorPopup>
              <FactorLabel>Interpolation Factor</FactorLabel>
              <FactorGrid>
                {([2, 4] as const).map((f) => (
                  <FactorOption
                    key={f}
                    $active={interpolationFactor === f}
                    onClick={() => {
                      setInterpolationFactor(f);
                      setFactorPopupOpen(false);
                    }}
                  >
                    <FactorValue>{f}×</FactorValue>
                  </FactorOption>
                ))}
              </FactorGrid>
            </FactorPopup>
          )}
        </UprezDropdown>

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
