import { useCallback, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useDeforumStore } from "@/stores/deforum.store";
import { ROUTES } from "@/constants/routes.constants";
import type { DeforumRenderKind, DeforumSettings } from "@/types/deforum.types";
import { DEFORUM_TEST_FRAMES } from "../constants/deforum-options";
import { hasPrompt, resolveDeforumTargets } from "../utils/deforum-targets";
import { ForceSettingsDialog } from "./force-settings-dialog";
import { DeforumPromptList } from "./deforum-prompt-list";
import {
  DeforumAdvancedSection,
  DeforumMotionSection,
  NumberField,
} from "./deforum-param-sections";
import {
  FieldLabel,
  GenerateButton,
  OpenDreamLink,
  ScopeHint,
  ValidationHint,
} from "./transition-settings-panel.styled";
import {
  DeforumPanel,
  EditingLabel,
  FramesField,
  PanelTop,
  RenderControls,
  SecondaryButton,
} from "./deforum-app.styled";

interface DeforumSettingsPanelProps {
  onGenerate: (kind: DeforumRenderKind) => void;
  isGenerating: boolean;
}

/** Comparable form of one field, so a multi-selection can tell if it agrees. */
const fieldKey = (settings: DeforumSettings, field: keyof DeforumSettings) =>
  field === "prompts"
    ? JSON.stringify(settings.prompts.map(({ frame, text }) => [frame, text]))
    : JSON.stringify(settings[field]);

export function DeforumSettingsPanel({
  onGenerate,
  isGenerating,
}: DeforumSettingsPanelProps) {
  const selectedIds = useDeforumStore((s) => s.selectedIds);
  const selected = useDeforumStore(
    useShallow((s) => s.clips.filter((c) => s.selectedIds.includes(c.id))),
  );
  const clipCount = useDeforumStore((s) => s.clips.length);
  const testCount = useDeforumStore(
    (s) => resolveDeforumTargets(s.clips, s.selectedIds, "test").length,
  );
  const finalCount = useDeforumStore(
    (s) => resolveDeforumTargets(s.clips, s.selectedIds, "final").length,
  );
  const [pendingEdit, setPendingEdit] = useState<(() => void) | null>(null);

  const primary = selected.find(
    (c) => c.id === selectedIds[selectedIds.length - 1],
  );
  const settings = primary?.settings;

  /**
   * Write a patch to every selected clip. When the selection disagrees about a
   * field being edited, confirm before forcing one value onto all of them —
   * the same rule the flow's transition panel follows.
   */
  const edit = useCallback((patch: Partial<DeforumSettings>) => {
    const { clips: current, selectedIds: ids } = useDeforumStore.getState();
    const run = () => useDeforumStore.getState().setClipSettings(ids, patch);
    const group = current.filter((c) => ids.includes(c.id));
    const fields = Object.keys(patch) as (keyof DeforumSettings)[];
    const clash = fields.some(
      (field) =>
        new Set(group.map((c) => fieldKey(c.settings, field))).size > 1,
    );
    if (clash) setPendingEdit(() => run);
    else run();
  }, []);

  const hasSelection = selectedIds.length > 0;
  const needsPrompt = selected.some((c) => !hasPrompt(c));
  const startsLater = selected.some(
    (c) => hasPrompt(c) && !c.settings.prompts[0]?.text.trim(),
  );

  const buttons = (
    <>
      <SecondaryButton
        $disabled={isGenerating || testCount === 0}
        disabled={isGenerating || testCount === 0}
        title={`Render ${DEFORUM_TEST_FRAMES} frames with every keyframe scaled to fit — a quick look at the whole arc`}
        onClick={() => onGenerate("test")}
      >
        Test ({DEFORUM_TEST_FRAMES} frames)
        {testCount > 1 ? ` × ${testCount}` : ""}
      </SecondaryButton>
      <GenerateButton
        $disabled={isGenerating || finalCount === 0}
        disabled={isGenerating || finalCount === 0}
        title="Full-length render. Finished renders go into the playlist."
        onClick={() => onGenerate("final")}
      >
        Render{finalCount > 1 ? ` × ${finalCount}` : ""}
      </GenerateButton>
      {primary?.final?.status === "failed" && selectedIds.length === 1 && (
        <OpenDreamLink
          to={`${ROUTES.VIEW_DREAM}/${primary.final.dreamUuid}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open failed render
        </OpenDreamLink>
      )}
    </>
  );

  const hints = (
    <>
      {needsPrompt && (
        <ValidationHint>
          Every dream needs at least one prompt to render.
        </ValidationHint>
      )}
      {startsLater && (
        <ValidationHint>
          The first prompt is empty, so the next one starts the dream.
        </ValidationHint>
      )}
      {!hasSelection && (
        <ScopeHint>
          Nothing selected &mdash; Test and Render cover every dream whose video
          is behind its settings. Select one to edit it, or several to change
          them together.
        </ScopeHint>
      )}
    </>
  );

  if (!primary || !settings) {
    return clipCount ? (
      <DeforumPanel>
        <RenderControls>{buttons}</RenderControls>
        {hints}
      </DeforumPanel>
    ) : null;
  }

  const extra = selectedIds.length - 1;

  return (
    <DeforumPanel>
      <PanelTop>
        <RenderControls>
          <FramesField>
            <FieldLabel htmlFor="deforum-frames">Frames</FieldLabel>
            <NumberField
              id="deforum-frames"
              value={settings.maxFrames}
              min={1}
              // Five digits is plenty: room for up to 99999 frames.
              max={99_999}
              style={{ width: "calc(5ch + 24px)" }}
              onCommit={(maxFrames) => edit({ maxFrames })}
            />
          </FramesField>
          {buttons}
        </RenderControls>
        <EditingLabel>
          Editing: {primary.name}
          {extra > 0 && ` and ${extra} more`}
        </EditingLabel>
      </PanelTop>

      {hints}

      <DeforumPromptList settings={settings} onEdit={edit} />
      <DeforumMotionSection settings={settings} onEdit={edit} />
      <DeforumAdvancedSection settings={settings} onEdit={edit} />

      {pendingEdit && (
        <ForceSettingsDialog
          title="Give these dreams the same value?"
          body="The selected dreams don't agree on this setting. OK sets it on all of them; Cancel leaves them as they are."
          onConfirm={() => {
            pendingEdit();
            setPendingEdit(null);
          }}
          onCancel={() => setPendingEdit(null)}
        />
      )}
    </DeforumPanel>
  );
}
