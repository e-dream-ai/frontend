import React, { useState } from "react";
import { useStudioStore, DEFAULT_VARIATION_SEED } from "@/stores/studio.store";
import type { ImageModel } from "@/types/studio.types";
import {
  VARIATION_PRESETS,
  getVariationPreset,
} from "../constants/variation-presets";
import { clampSizeToModel } from "../constants/size-options";
import { expandPrompt } from "../utils/expand-prompt";
import {
  PanelContainer,
  PanelHeader,
  PanelTitle,
  PanelSubtitle,
  FieldRow,
  FieldGroup,
  FieldLabel,
  Select,
  PromptTextarea,
  ToggleLink,
  ExpandedSection,
  NumberInput,
} from "./transition-settings-panel.styled";

const IMAGE_MODELS: ImageModel[] = ["z-image-turbo", "qwen-image"];
const MODEL_LABELS: Record<ImageModel, string> = {
  "z-image-turbo": "Z Image Turbo",
  "qwen-image": "Qwen Image",
};

/**
 * Settings for the per-keyframe "Generate variations" tool. Mirrors the
 * Transition Settings panel: a canned preset list, plus an optional "Customize"
 * section (collapsed by default) to edit the variation prompts / use {a|b|c}
 * expansion. The custom prompts override the preset when set.
 */
export const VariationSettingsPanel: React.FC = () => {
  const model = useStudioStore((s) => s.imageGenParams.model);
  const size = useStudioStore((s) => s.imageGenParams.size);
  const setImageGenParams = useStudioStore((s) => s.setImageGenParams);
  const variationPresetId = useStudioStore((s) => s.variationPresetId);
  const setVariationPresetId = useStudioStore((s) => s.setVariationPresetId);
  const variationCustomPrompt = useStudioStore((s) => s.variationCustomPrompt);
  const setVariationCustomPrompt = useStudioStore(
    (s) => s.setVariationCustomPrompt,
  );
  const variationSeed = useStudioStore((s) => s.variationSeed);
  const setVariationSeed = useStudioStore((s) => s.setVariationSeed);

  // Custom variations are optional and collapsed by default.
  const [expanded, setExpanded] = useState(false);

  // Real variation count = lines × {a|b|c} expansion, capped at 8 (matches the
  // generation handler).
  const variationCount = Math.min(
    variationCustomPrompt
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .flatMap((l) => expandPrompt(l)).length || 0,
    8,
  );

  return (
    <PanelContainer>
      <PanelHeader>
        <PanelTitle>Variation Settings</PanelTitle>
      </PanelHeader>
      <FieldRow>
        <FieldGroup>
          <FieldLabel>Model</FieldLabel>
          <Select
            value={model}
            onChange={(e) => {
              const newModel = e.target.value as ImageModel;
              setImageGenParams({
                model: newModel,
                size: clampSizeToModel(size, newModel),
              });
            }}
          >
            {IMAGE_MODELS.map((m) => (
              <option key={m} value={m}>
                {MODEL_LABELS[m]}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup>
          <FieldLabel>Variation style</FieldLabel>
          <Select
            value={variationPresetId}
            onChange={(e) => {
              const id = e.target.value;
              setVariationPresetId(id);
              // Keep the custom editor in sync with the chosen preset, so the
              // dropdown always takes effect (custom overrides preset in the
              // generation handler) and the editor shows the preset's lines.
              setVariationCustomPrompt(
                getVariationPreset(id).modifiers.join("\n"),
              );
            }}
          >
            {VARIATION_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup>
          <FieldLabel>Seed</FieldLabel>
          <NumberInput
            type="number"
            value={variationSeed}
            onChange={(e) => {
              const v = e.target.value.trim();
              setVariationSeed(v === "" ? DEFAULT_VARIATION_SEED : Number(v));
            }}
          />
        </FieldGroup>
      </FieldRow>

      <ToggleLink
        type="button"
        onClick={() =>
          setExpanded((v) => {
            const next = !v;
            // Prefill from the selected preset so the editor starts from real
            // values rather than a blank box.
            if (next && !variationCustomPrompt.trim()) {
              setVariationCustomPrompt(
                getVariationPreset(variationPresetId).modifiers.join("\n"),
              );
            }
            return next;
          })
        }
      >
        {expanded ? "▴" : "▾"} Customize
      </ToggleLink>

      {expanded && (
        <ExpandedSection>
          <FieldLabel>Custom variations (one per line)</FieldLabel>
          <PromptTextarea
            placeholder="One variation per line, or use {a|b|c} expansion — e.g. {glowing|frozen|burning} version. Each is layered onto the source image's prompt."
            value={variationCustomPrompt}
            onChange={(e) => setVariationCustomPrompt(e.target.value)}
          />
          <PanelSubtitle>
            {variationCount} variation{variationCount === 1 ? "" : "s"} (max 8)
          </PanelSubtitle>
        </ExpandedSection>
      )}
    </PanelContainer>
  );
};
