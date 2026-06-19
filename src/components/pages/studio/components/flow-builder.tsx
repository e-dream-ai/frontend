import React, { useState, useCallback, useRef } from "react";
import Bugsnag from "@bugsnag/js";
import { v4 as uuidv4 } from "uuid";
import styled from "styled-components";
import { useFlowStore } from "@/stores/flow.store";
import { useStudioStore } from "@/stores/studio.store";
import { FLOW } from "@/constants/flow-theme.constants";
import { axiosClient } from "@/client/axios.client";
import { getRequestHeaders, ContentType } from "@/constants/auth.constants";
import { useUploadImageDream } from "@/api/dream/mutation/useUploadImageDream";
import { useUserApiEndpoints } from "@/api/user-api-endpoints/useUserApiEndpoints";
import type { VariationCandidate, FlowKeyframe } from "@/types/flow.types";
import { getVariationPreset } from "../constants/variation-presets";
import { expandPrompt } from "../utils/expand-prompt";
import { KeyframeStrip } from "./keyframe-strip";
import { TransitionSettingsPanel } from "./transition-settings-panel";
import { VariationSettingsPanel } from "./variation-settings-panel";
import { FlowPreview } from "./flow-preview";
import { FlowActionBar } from "./flow-action-bar";
import { AddKeyframesFromPlaylistModal } from "./add-keyframes-from-playlist-modal";
import { SelectImageDreamModal } from "./select-image-dream-modal";
import { useFlowGeneration } from "@/components/pages/studio/hooks/useFlowGeneration";
import { useFlowJobProgress } from "@/components/pages/studio/hooks/useFlowJobProgress";
import { useFileDropUpload } from "../hooks/useFileDropUpload";
import { VariationLightbox } from "./variation-lightbox";

const FlowContainer = styled.div<{ $dragOver?: boolean }>`
  background: ${FLOW.bgCard};
  border: 1px solid ${FLOW.border};
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  min-height: 200px;
  transition:
    border-color 0.2s,
    background-color 0.2s;

  ${(props) =>
    props.$dragOver &&
    `
    border-color: ${FLOW.accent};
    background-color: ${FLOW.accentDim};
  `}
`;

export const FlowBuilder: React.FC = () => {
  const addKeyframe = useFlowStore((s) => s.addKeyframe);
  const updateKeyframe = useFlowStore((s) => s.updateKeyframe);
  const removeKeyframe = useFlowStore((s) => s.removeKeyframe);
  const setI2iEndpoint = useFlowStore((s) => s.setI2iEndpoint);
  const addI2iCandidates = useFlowStore((s) => s.addI2iCandidates);
  const acceptI2iCandidate = useFlowStore((s) => s.acceptI2iCandidate);
  const discardI2iCandidate = useFlowStore((s) => s.discardI2iCandidate);

  // User i2i endpoints (BYO key) for image-to-image variations.
  const { data: endpointsData } = useUserApiEndpoints();
  const i2iEndpoints = (endpointsData?.data?.endpoints ?? []).filter(
    (ep) => ep.capabilities.imageToImage,
  );

  // State declarations must come before selectors that reference them (TDZ).
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [variationLightboxIndex, setVariationLightboxIndex] = useState<
    number | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mount progress tracking
  useFlowJobProgress();

  // Subscribe to the open transition for the lightbox — avoids IIFE with getState()
  // during render, which would bypass React's subscription and miss updates.
  const openTransition = useFlowStore((s) =>
    variationLightboxIndex !== null
      ? s.transitions[variationLightboxIndex] ?? null
      : null,
  );
  const lightboxGlobalPrompt = useFlowStore((s) => s.globalPrompt);

  // Generation controls
  const { generateAll, generateOne, isGenerating } = useFlowGeneration();
  const uploadDream = useUploadImageDream();

  const handleAddUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      // Insert placeholder cards up-front so the user sees immediate feedback.
      // Each one carries a local objectURL preview + uploading state, then we
      // patch it in place with the real keyframe data when the upload settles.
      await Promise.all(
        files.map(async (file) => {
          const id = uuidv4();
          const objectUrl = URL.createObjectURL(file);
          addKeyframe({
            id,
            imageUrl: objectUrl,
            name: file.name.replace(/\.[^.]+$/, ""),
            uploadStatus: "uploading",
            uploadProgress: 0,
          });

          try {
            const result = await uploadDream.mutateAsync({
              file,
              onProgress: (percent) =>
                updateKeyframe(id, { uploadProgress: percent }),
              onUploadComplete: (dreamUuid) => {
                updateKeyframe(id, {
                  dreamUuid,
                  uploadStatus: undefined,
                  uploadProgress: undefined,
                });
              },
            });
            updateKeyframe(id, {
              imageUrl: result.imageUrl,
              name: result.name,
            });
            URL.revokeObjectURL(objectUrl);
          } catch (err) {
            Bugsnag.notify(err as Error);
            updateKeyframe(id, {
              uploadStatus: "failed",
              uploadProgress: undefined,
            });
            // Auto-clean failed placeholders after a few seconds so the strip
            // doesn't fill with orphans. The user has the option to dismiss
            // sooner via the card's delete button (visible on hover).
            window.setTimeout(() => {
              removeKeyframe(id);
              URL.revokeObjectURL(objectUrl);
            }, 6000);
          }
        }),
      );
    },
    [addKeyframe, updateKeyframe, removeKeyframe, uploadDream],
  );

  const handleKeyframeVariations = useCallback(async (keyframeId: string) => {
    // Read image generation settings at call time (NOT via React subscription)
    // to keep callback identity stable across settings keystrokes.
    const {
      imagePrompt,
      imageGenParams,
      variationPresetId,
      variationCustomPrompt,
      variationSeed,
    } = useStudioStore.getState();
    const keyframe = useFlowStore
      .getState()
      .keyframes.find((kf) => kf.id === keyframeId);
    if (!keyframe) return;

    // Custom prompt (Customize section) overrides the canned preset: split per
    // line and apply {a|b|c} expansion to each line. Falls back to the preset.
    // Custom prompts (Customize section) override the preset when present: split
    // per line and apply {a|b|c} expansion to each line.
    const customModifiers = variationCustomPrompt
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .flatMap((line) => expandPrompt(line));
    const modifiers = (
      customModifiers.length > 0
        ? customModifiers
        : getVariationPreset(variationPresetId).modifiers
    ).slice(0, 8);

    const VARIATION_COUNT = modifiers.length;
    // The user's seed is the anchor (stable across a batch — variation comes
    // from the prompt). Each +More batch is offset by the count of variations
    // already present, so pressing +More yields NEW images rather than
    // regenerating the same seed/prompt, while staying reproducible.
    const existingCount = keyframe.variations?.length ?? 0;
    const baseSeed = variationSeed + existingCount;

    // Use the SOURCE image's own prompt as the base so variations stay on-theme.
    // Without this the tool fell back to the keyframe name and produced generic
    // qwen output. The original prompt is stored as algoParams JSON on the dream.
    let originalPrompt = "";
    if (keyframe.dreamUuid) {
      try {
        const { data } = await axiosClient.get(
          `/v1/dream/${keyframe.dreamUuid}`,
        );
        const rawPrompt = data?.data?.dream?.prompt;
        if (typeof rawPrompt === "string" && rawPrompt) {
          try {
            originalPrompt = JSON.parse(rawPrompt)?.prompt || "";
          } catch {
            originalPrompt = rawPrompt;
          }
        }
      } catch (err) {
        Bugsnag.notify(err as Error);
      }
    }
    const basePrompt = originalPrompt || imagePrompt || keyframe.name;

    // Layer a canned variation modifier onto the source prompt so the set is
    // meaningfully different (not generic seed jitter), and keep the seed STABLE
    // across the set so the difference comes from the prompt.
    const candidates: VariationCandidate[] = Array.from(
      { length: VARIATION_COUNT },
      (_, i) => ({
        id: uuidv4(),
        method: "expansion" as const,
        prompt: `${basePrompt}, ${modifiers[i % modifiers.length]}`,
        seed: baseSeed,
        status: "queue" as const,
      }),
    );

    useFlowStore.getState().addKeyframeVariations(keyframeId, candidates);

    // Fire all API calls in parallel — never sequential for-loop.
    await Promise.all(
      candidates.map(async (candidate, i) => {
        const algoParams = {
          infinidream_algorithm: imageGenParams.model,
          prompt: candidate.prompt,
          size: imageGenParams.size,
          seed: candidate.seed,
        };

        try {
          const { data } = await axiosClient.post("/v1/dream", {
            name: `${keyframe.name} v${i + 1}`,
            prompt: JSON.stringify(algoParams),
            description: "Keyframe variation",
          });
          const dreamUuid = data?.data?.dream?.uuid;
          if (!dreamUuid) {
            throw new Error("No dream UUID returned from API");
          }
          useFlowStore
            .getState()
            .updateKeyframeVariation(keyframeId, candidate.id, {
              dreamUuid,
              status: "queue",
            });
        } catch (err) {
          Bugsnag.notify(err as Error);
          useFlowStore
            .getState()
            .updateKeyframeVariation(keyframeId, candidate.id, {
              status: "failed",
            });
        }
      }),
    );
  }, []);

  const handleFileSelected = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      await uploadFiles(Array.from(files));
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [uploadFiles],
  );

  const handleI2iVariation = useCallback(
    (keyframe: FlowKeyframe) => {
      // Resolve which i2i endpoint to use. Prefer the one already selected this
      // session; otherwise auto-select (single -> that one, multiple -> first).
      const endpoints = i2iEndpoints;
      if (endpoints.length === 0) return;

      let endpointUuid = useFlowStore.getState().i2iEndpointUuid;
      if (!endpointUuid || !endpoints.some((ep) => ep.uuid === endpointUuid)) {
        // TODO: inline picker when multiple i2i endpoints are configured.
        endpointUuid = endpoints[0].uuid;
        setI2iEndpoint(endpointUuid);
      }

      // Source image — the worker adapter DOWNLOADS the `image` field as a
      // fetchable URL, so we must send the presigned imageUrl, NOT a Dream UUID
      // (a UUID is not fetchable). Skip if there's no usable URL.
      const sourceImage = keyframe.imageUrl;
      if (!sourceImage) return;

      const I2I_VARIATION_COUNT = 4;
      const baseName = keyframe.name || "frame";

      // Distinct per-candidate prompts so the four i2i outputs actually differ
      // from one another. Using the keyframe name (the old behaviour) gave the
      // model no variation direction, so it just reproduced the source image.
      const VARIATION_PROMPTS = [
        "Reinterpret this scene as a vivid impressionist oil painting, keeping the same subject and composition.",
        "Reimagine this scene as a moody, cinematic night shot with dramatic lighting, same subject and composition.",
        "Render this scene as a bright, saturated watercolor illustration, same subject and composition.",
        "Restyle this scene as a warm-toned vintage film photograph with grain, same subject and composition.",
      ];

      // Create candidate keyframes as a GATED staging area: addI2iCandidates
      // flags them so transition derivation skips them — they will not spawn
      // generation jobs until the user accepts one. Patch each in place as its
      // generation request settles.
      const candidates = Array.from(
        { length: I2I_VARIATION_COUNT },
        (_, i) => ({
          id: uuidv4(),
          imageUrl: keyframe.imageUrl,
          name: `${baseName} · variation ${i + 1}`,
          uploadStatus: "uploading" as const,
          uploadProgress: 0,
        }),
      );
      addI2iCandidates(keyframe.id, candidates);

      // Fire all variation generations concurrently (no sequential await loop).
      const headers = getRequestHeaders({ contentType: ContentType.json });
      void Promise.allSettled(
        candidates.map(async ({ id }, i) => {
          const algoParams = {
            userEndpointUuid: endpointUuid,
            image: sourceImage,
            prompt: VARIATION_PROMPTS[i % VARIATION_PROMPTS.length],
            n: 1,
          };
          try {
            const { data } = await axiosClient.post(
              "/v1/dream",
              {
                name: `${baseName} · variation ${i + 1}`,
                prompt: JSON.stringify(algoParams),
                description: "Studio i2i variation",
              },
              { headers },
            );
            const dreamUuid = data?.data?.dream?.uuid;
            if (!dreamUuid) {
              throw new Error("No dream UUID returned from API");
            }
            // Settle the placeholder into a real, queued keyframe.
            updateKeyframe(id, {
              dreamUuid,
              uploadStatus: undefined,
              uploadProgress: undefined,
            });
          } catch (err) {
            Bugsnag.notify(err as Error);
            updateKeyframe(id, {
              uploadStatus: "failed",
              uploadProgress: undefined,
            });
          }
        }),
      );
    },
    [i2iEndpoints, setI2iEndpoint, addI2iCandidates, updateKeyframe],
  );

  const handleAcceptI2iCandidate = useCallback(
    (keyframe: FlowKeyframe) => {
      acceptI2iCandidate(keyframe.id);
    },
    [acceptI2iCandidate],
  );

  const handleDiscardI2iCandidate = useCallback(
    (keyframe: FlowKeyframe) => {
      discardI2iCandidate(keyframe.id);
    },
    [discardI2iCandidate],
  );

  const handleAddFromPlaylist = useCallback(() => {
    setShowPlaylistModal(true);
  }, []);

  const handleAddFromLibrary = useCallback(() => {
    setShowLibraryModal(true);
  }, []);

  const { isDragOver, dropHandlers } = useFileDropUpload({
    accept: ["image/jpeg", "image/png", "image/webp"],
    onFiles: uploadFiles,
  });

  return (
    <FlowContainer $dragOver={isDragOver} {...dropHandlers}>
      <KeyframeStrip
        onAddUpload={handleAddUpload}
        onAddFromPlaylist={handleAddFromPlaylist}
        onAddFromLibrary={handleAddFromLibrary}
        onRetry={generateOne}
        onRequestVariations={handleKeyframeVariations}
        onOpenVariationLightbox={setVariationLightboxIndex}
        onRequestI2iVariation={handleI2iVariation}
        onAcceptI2iCandidate={handleAcceptI2iCandidate}
        onDiscardI2iCandidate={handleDiscardI2iCandidate}
      />

      <TransitionSettingsPanel
        onGenerateAll={generateAll}
        onGenerateOne={generateOne}
        isGenerating={isGenerating}
      />

      <FlowPreview />
      <FlowActionBar />

      <VariationSettingsPanel />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        style={{ display: "none" }}
        onChange={handleFileSelected}
      />

      {showPlaylistModal && (
        <AddKeyframesFromPlaylistModal
          onClose={() => setShowPlaylistModal(false)}
        />
      )}

      {showLibraryModal && (
        <SelectImageDreamModal onClose={() => setShowLibraryModal(false)} />
      )}

      {variationLightboxIndex !== null && openTransition && (
        <VariationLightbox
          transition={openTransition}
          transitionIndex={variationLightboxIndex}
          effectivePrompt={
            openTransition.promptOverride ?? lightboxGlobalPrompt
          }
          onSelectVariation={(idx, vid) => {
            useFlowStore.getState().selectTransitionVariation(idx, vid);
          }}
          onRegenerate={(idx) => {
            generateOne(idx);
          }}
          onClose={() => setVariationLightboxIndex(null)}
        />
      )}
    </FlowContainer>
  );
};
