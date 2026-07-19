import React, { useCallback, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { axiosClient } from "@/client/axios.client";
import { useStudioStore } from "@/stores/studio.store";
import { useFlowStore } from "@/stores/flow.store";
import type { ImageModel, StudioImage } from "@/types/studio.types";
import { useModels } from "@/api/model/query/useModels";
import { useModelConstraints } from "@/api/model/query/useModelConstraints";
import { CostEstimate } from "@/components/shared/cost-estimate/cost-estimate";
import { CreditLimitNotice } from "@/components/shared/credit-limit-notice/credit-limit-notice";
import { useCostEstimate } from "@/hooks/useCostEstimate";
import { useCreditGuard } from "@/hooks/useCreditGuard";
import {
  IMAGE_COUNT_OPTIONS,
  clampSizeToAllowed,
} from "../constants/size-options";
import {
  Overlay,
  Panel,
  Header,
  Title,
  CloseBtn,
  Body,
  Footer,
  FooterButtons,
  CancelBtn,
  AddBtn,
} from "./select-image-dream-modal.styled";
import {
  FieldRow,
  FieldGroup,
  FieldLabel,
  Select,
  PromptTextarea,
} from "./transition-settings-panel.styled";

interface Props {
  onClose: () => void;
}

export const GenerateKeyframesModal: React.FC<Props> = ({ onClose }) => {
  const imageGenParams = useStudioStore((s) => s.imageGenParams);
  const setImageGenParams = useStudioStore((s) => s.setImageGenParams);
  const addImage = useStudioStore((s) => s.addImage);
  const addKeyframe = useFlowStore((s) => s.addKeyframe);

  // Shared with the batch Images tab so the prompt survives reopening the
  // dialog and carries over between the two generate UIs.
  const prompt = useStudioStore((s) => s.imagePrompt);
  const setPrompt = useStudioStore((s) => s.setImagePrompt);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: modelsData } = useModels({ mediaType: "image" });
  const modelOptions = useMemo(
    () => modelsData?.data?.models ?? [],
    [modelsData?.data?.models],
  );
  const modelConstraints = useModelConstraints({ mediaType: "image" });
  const sizeOptions =
    modelConstraints.get(imageGenParams.model)?.imageSizes ?? [];

  const { totalCostUsd, costBreakdown } = useCostEstimate({
    model: modelOptions.find((m) => m.id === imageGenParams.model),
    params: { imageSize: imageGenParams.size },
    count: imageGenParams.seedCount,
    breakdownKey: "components.cost_estimate.images",
  });

  const { overBudget, canManageKey, resetIn, guardOverBudget } =
    useCreditGuard(totalCostUsd);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isSubmitting) return;
    if (guardOverBudget()) return;
    setIsSubmitting(true);

    const baseSeed = Math.floor(Math.random() * 99_000) + 1;
    const currentImageCount = useStudioStore.getState().images.length;
    const modelLabel =
      modelOptions.find((m) => m.id === imageGenParams.model)?.label ??
      imageGenParams.model;

    await Promise.all(
      Array.from({ length: imageGenParams.seedCount }, (_, i) => {
        const seed = baseSeed + i;
        const algoParams = {
          infinidream_algorithm: imageGenParams.model,
          prompt,
          size: imageGenParams.size,
          seed,
        };

        return axiosClient
          .post("/v1/dream", {
            name: `${modelLabel} ${currentImageCount + i + 1}`,
            prompt: JSON.stringify(algoParams),
            description: "Studio generated image",
          })
          .then(({ data }) => {
            const dream = data.data?.dream;
            if (!dream) return;
            // Track on the shared studio image list so socket/reconcile
            // progress updates flow in (and it shows in the batch library).
            addImage({
              uuid: dream.uuid,
              url: dream.thumbnail || "",
              name: dream.name,
              seed,
              size: imageGenParams.size,
              status: (dream.status as StudioImage["status"]) || "queue",
              selected: false,
            });
            // Placeholder card in the strip; useGeneratedKeyframeSync fills
            // in progress and the final thumbnail.
            addKeyframe({
              id: uuidv4(),
              dreamUuid: dream.uuid,
              imageUrl: "",
              name: dream.name,
              uploadStatus: "uploading",
              uploadProgress: 0,
            });
          })
          .catch((err) => {
            console.error("Failed to create image:", err);
          });
      }),
    );

    setIsSubmitting(false);
    onClose();
  }, [
    prompt,
    isSubmitting,
    guardOverBudget,
    imageGenParams,
    modelOptions,
    addImage,
    addKeyframe,
    onClose,
  ]);

  return (
    <Overlay>
      <Panel>
        <Header>
          <Title>Generate Keyframes</Title>
          <CloseBtn onClick={onClose}>&times;</CloseBtn>
        </Header>
        <Body>
          <PromptTextarea
            placeholder="Describe the image you want to generate..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            autoFocus
          />
          <FieldRow style={{ marginTop: 14 }}>
            <FieldGroup>
              <FieldLabel>Model</FieldLabel>
              <Select
                value={imageGenParams.model}
                onChange={(e) => {
                  const newModel = e.target.value as ImageModel;
                  const newSizes =
                    modelConstraints.get(newModel)?.imageSizes ?? [];
                  setImageGenParams({
                    model: newModel,
                    size: clampSizeToAllowed(imageGenParams.size, newSizes),
                  });
                }}
              >
                {modelOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </Select>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Images</FieldLabel>
              <Select
                value={imageGenParams.seedCount}
                onChange={(e) =>
                  setImageGenParams({ seedCount: Number(e.target.value) })
                }
              >
                {IMAGE_COUNT_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Select>
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Size</FieldLabel>
              <Select
                value={imageGenParams.size}
                onChange={(e) => setImageGenParams({ size: e.target.value })}
              >
                {sizeOptions.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("*", "x")}
                  </option>
                ))}
              </Select>
            </FieldGroup>
          </FieldRow>
          <CreditLimitNotice
            overBudget={overBudget}
            canManageKey={canManageKey}
            resetIn={resetIn}
          />
        </Body>
        <Footer>
          <CostEstimate amountUsd={totalCostUsd} breakdown={costBreakdown} />
          <FooterButtons>
            <CancelBtn onClick={onClose}>Cancel</CancelBtn>
            <AddBtn
              onClick={handleGenerate}
              disabled={!prompt.trim() || isSubmitting}
            >
              {isSubmitting ? "Generating..." : "Generate"}
            </AddBtn>
          </FooterButtons>
        </Footer>
      </Panel>
    </Overlay>
  );
};
