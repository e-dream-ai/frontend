import { v4 as uuidv4 } from "uuid";
import type { DeforumPrompt, DeforumSettings } from "@/types/deforum.types";
import { DEFORUM_TEST_FRAMES } from "../constants/deforum-options";
import { FieldRow } from "./transition-settings-panel.styled";
import {
  FrameInput,
  PromptFrame,
  PromptList,
  PromptRemove,
  PromptRow,
  PromptText,
  Section,
  SectionHeader,
  SectionTitle,
  SmallButton,
} from "./deforum-app.styled";

const byFrame = (prompts: DeforumPrompt[]) =>
  [...prompts].sort((a, b) => a.frame - b.frame);

interface DeforumPromptListProps {
  settings: DeforumSettings;
  onEdit: (patch: Partial<DeforumSettings>) => void;
}

export function DeforumPromptList({
  settings,
  onEdit,
}: DeforumPromptListProps) {
  const { prompts, maxFrames } = settings;
  const lastFrame = maxFrames - 1;
  const testScale = Math.min(1, DEFORUM_TEST_FRAMES / maxFrames);
  const setPrompts = (next: DeforumPrompt[]) => onEdit({ prompts: next });

  const addPrompt = () => {
    const sorted = byFrame(prompts);
    const last = sorted[sorted.length - 1];
    const step = Math.max(1, Math.round(maxFrames / 5));
    // Start from the last prompt's text: the next keyframe is usually a
    // variation on it, not a blank slate.
    setPrompts([
      ...sorted,
      {
        id: uuidv4(),
        frame: Math.min((last?.frame ?? -1) + step, lastFrame),
        text: last?.text ?? "",
      },
    ]);
  };

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>Prompts</SectionTitle>
      </SectionHeader>
      <PromptList>
        {prompts.map((prompt, i) => {
          // The first prompt is where the animation starts: always frame 0.
          const isFirst = i === 0;
          const outOfRange = prompt.frame < 0 || prompt.frame > lastFrame;
          const duplicate = prompts.some(
            (p, j) => j !== i && p.frame === prompt.frame,
          );
          return (
            <PromptRow key={prompt.id}>
              <PromptRemove
                aria-label="Remove prompt"
                disabled={isFirst}
                title={
                  isFirst ? "The first prompt can't be removed" : undefined
                }
                onClick={() =>
                  setPrompts(prompts.filter((p) => p.id !== prompt.id))
                }
              >
                ✕
              </PromptRemove>
              <PromptFrame>
                <FrameInput
                  type="text"
                  inputMode="numeric"
                  aria-label="Frame"
                  readOnly={isFirst}
                  $invalid={!isFirst && (outOfRange || duplicate)}
                  title={
                    isFirst
                      ? "The first prompt always starts at frame 0"
                      : outOfRange
                        ? `Past the last frame (${lastFrame})`
                        : duplicate
                          ? "Another prompt starts on this frame"
                          : `Test frame ≈ ${Math.round(
                              prompt.frame * testScale,
                            )}`
                  }
                  value={prompt.frame}
                  onChange={(e) =>
                    setPrompts(
                      prompts.map((p) =>
                        p.id === prompt.id
                          ? {
                              ...p,
                              frame:
                                Number(e.target.value.replace(/\D/g, "")) || 0,
                            }
                          : p,
                      ),
                    )
                  }
                  onBlur={() => {
                    const sorted = byFrame(prompts);
                    if (sorted.some((p, j) => p !== prompts[j])) {
                      setPrompts(sorted);
                    }
                  }}
                />
              </PromptFrame>
              <PromptText
                aria-label={`Prompt at frame ${prompt.frame}`}
                placeholder="What the dream becomes from this frame on…"
                value={prompt.text}
                onChange={(e) =>
                  setPrompts(
                    prompts.map((p) =>
                      p.id === prompt.id ? { ...p, text: e.target.value } : p,
                    ),
                  )
                }
              />
            </PromptRow>
          );
        })}
      </PromptList>
      <FieldRow style={{ marginTop: 8 }}>
        <SmallButton onClick={addPrompt}>+ Add prompt</SmallButton>
      </FieldRow>
    </Section>
  );
}
