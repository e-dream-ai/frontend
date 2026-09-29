import React, { useCallback, useMemo, useState } from "react";
import { axiosClient } from "@/client/axios.client";
import { useStudioStore } from "@/stores/studio.store";
import { isStudioImageModel, type StudioImage } from "@/types/studio.types";
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
import { buildImageAlgoParams } from "../utils/build-image-algo-params";
import { imageNames } from "../utils/image-names";
import { resolveNegativePromptSupport } from "../utils/negative-prompt-support";
import { SizeSelect } from "./size-select";
import { StyleReferenceField } from "./style-reference-field";
import { useLightboxA11y } from "../hooks/useLightboxA11y";
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
} from "./select-modal.styled";
import {
  FieldRow,
  FieldGroup,
  FieldLabel,
  FieldHint,
  Select,
  PromptTextarea,
} from "./transition-settings-panel.styled";

export interface GeneratedFrameDream {
  uuid: string;
  name: string;
}

interface Props {
  onClose: () => void;
  onCreated?: (dream: GeneratedFrameDream) => void;
}

export const GenerateReferenceFramesModal: React.FC<Props> = ({
  onClose,
  onCreated,
}) => {
  const imageGenParams = useStudioStore((s) => s.imageGenParams);
  const setImageGenParams = useStudioStore((s) => s.setImageGenParams);
  const addImage = useStudioStore((s) => s.addImage);
  const overlayRef = useLightboxA11y<HTMLDivElement>(onClose);

  // Shared with the batch Images tab so the prompt survives reopening the
  // dialog and carries over between the two generate UIs.
  const prompt = useStudioStore((s) => s.imagePrompt);
  const setPrompt = useStudioStore((s) => s.setImagePrompt);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const styleReference = useStudioStore((s) => s.styleReference);
  const setStyleReference = useStudioStore((s) => s.setStyleReference);
  const requiresStyleReference = imageGenParams.model === "krea-2-turbo-style";

  const { data: modelsData } = useModels({ mediaType: "image" });
  const modelOptions = useMemo(
    () =>
      (modelsData?.data?.models ?? []).filter((model) =>
        isStudioImageModel(model.id),
      ),
    [modelsData?.data?.models],
  );
  const modelConstraints = useModelConstraints({ mediaType: "image" });
  const sizeOptions =
    modelConstraints.get(imageGenParams.model)?.imageSizes ?? [];
  const selectedModel = modelOptions.find(
    (model) => model.id === imageGenParams.model,
  );
  const hasRequiredReference =
    !requiresStyleReference || styleReference !== null;
  const canGenerate =
    !isSubmitting &&
    prompt.trim().length > 0 &&
    selectedModel !== undefined &&
    hasRequiredReference;

  const { enabled: negativePromptEnabled, hint: negativePromptHint } =
    resolveNegativePromptSupport(modelOptions, imageGenParams.model);

  const { totalCostUsd, costBreakdown } = useCostEstimate({
    model: selectedModel,
    params: { imageSize: imageGenParams.size },
    count: imageGenParams.seedCount,
    breakdownKey: "components.cost_estimate.images",
  });

  const { overBudget, canManageKey, resetIn, guardOverBudget } =
    useCreditGuard(totalCostUsd);

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return;
    if (guardOverBudget()) return;
    setIsSubmitting(true);

    const baseSeed = Math.floor(Math.random() * 99_000) + 1;
    const names = imageNames(
      prompt,
      imageGenParams.seedCount,
      useStudioStore.getState().images,
    );

    await Promise.all(
      Array.from({ length: imageGenParams.seedCount }, (_, i) => {
        const seed = baseSeed + i;
        const algoParams = buildImageAlgoParams({
          model: imageGenParams.model,
          prompt,
          size: imageGenParams.size,
          seed,
          sourceDreamUuid: requiresStyleReference
            ? styleReference?.uuid
            : undefined,
          negativePrompt: negativePromptEnabled
            ? imageGenParams.negativePrompt
            : undefined,
        });

        return axiosClient
          .post("/v1/dream", {
            name: names[i],
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
              prompt,
              status: (dream.status as StudioImage["status"]) || "queue",
            });
            onCreated?.(dream);
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
    canGenerate,
    requiresStyleReference,
    styleReference,
    guardOverBudget,
    imageGenParams,
    negativePromptEnabled,
    addImage,
    onCreated,
    onClose,
  ]);

  return (
    <Overlay ref={overlayRef} tabIndex={-1}>
      <Panel
        role="dialog"
        aria-modal="true"
        aria-label="Generate Reference Frames"
      >
        <Header>
          <Title>Generate Reference Frames</Title>
          <CloseBtn onClick={onClose}>&times;</CloseBtn>
        </Header>
        <Body>
          <PromptTextarea
            placeholder="Describe the image you want to generate..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            data-autofocus
          />
          <FieldRow style={{ marginTop: 14 }}>
            <FieldGroup>
              <FieldLabel htmlFor="reference-frame-model">Model</FieldLabel>
              <Select
                id="reference-frame-model"
                value={imageGenParams.model}
                onChange={(e) => {
                  const newModel = e.target.value;
                  if (!isStudioImageModel(newModel)) return;
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
              <SizeSelect
                value={imageGenParams.size}
                options={sizeOptions}
                onChange={(size) => setImageGenParams({ size })}
              />
            </FieldGroup>
          </FieldRow>
          {requiresStyleReference ? (
            <StyleReferenceField
              value={styleReference}
              onChange={setStyleReference}
            />
          ) : null}
          <FieldLabel
            htmlFor="reference-frame-negative-prompt"
            style={{ display: "block", marginTop: 14, marginBottom: 8 }}
          >
            Negative prompt
          </FieldLabel>
          <PromptTextarea
            id="reference-frame-negative-prompt"
            placeholder="Describe what to avoid (optional)..."
            value={imageGenParams.negativePrompt}
            disabled={!negativePromptEnabled}
            aria-describedby={
              negativePromptHint
                ? "reference-frame-negative-prompt-hint"
                : undefined
            }
            onChange={(e) =>
              setImageGenParams({ negativePrompt: e.target.value })
            }
          />
          {negativePromptHint && (
            <FieldHint id="reference-frame-negative-prompt-hint">
              {negativePromptHint}
            </FieldHint>
          )}
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
            <AddBtn onClick={handleGenerate} disabled={!canGenerate}>
              {isSubmitting ? "Generating..." : "Generate"}
            </AddBtn>
          </FooterButtons>
        </Footer>
      </Panel>
    </Overlay>
  );
};
