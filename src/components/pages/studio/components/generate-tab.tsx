import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useStudioStore } from "@/stores/studio.store";
import { useBatchSubmit } from "../hooks/useBatchSubmit";
import {
  actionClipCounts,
  comboKeyOf,
  imageClipCount,
  indexCellJobs,
  isAnimatableFrame,
  isRunnableAction,
} from "../utils/batch-selectors";
import { actionHeadings } from "../utils/action-headings";
import {
  getLoraOptionsForModel,
  NO_LORA_OPTION,
} from "../constants/lora-options";
import { ActionDialog } from "./action-dialog";
import { ImageDialog } from "./image-dialog";
import { GenerateReferenceFramesModal } from "./generate-reference-frames-modal";
import {
  clampDurationToAllowed,
  getAllowedDurationsForActions,
} from "../constants/duration-options";
import { useModelConstraints } from "@/api/model/query/useModelConstraints";
import { useModels } from "@/api/model/query/useModels";
import { CostEstimate } from "@/components/shared/cost-estimate/cost-estimate";
import { CreditLimitNotice } from "@/components/shared/credit-limit-notice/credit-limit-notice";
import { useCostEstimate } from "@/hooks/useCostEstimate";
import { useCreditGuard } from "@/hooks/useCreditGuard";
import { useDreamSegments } from "../hooks/useDreamSegments";
import { useMatrixChecks } from "../hooks/useMatrixChecks";
import { useMatrixPreview } from "../hooks/useMatrixPreview";
import {
  useDiscardStudioClip,
  useRemoveStudioAction,
  useRemoveStudioImage,
} from "../hooks/useStudioClipActions";
import { ConfirmModal } from "@/components/modals/confirm.modal";
import { ClipHistory } from "./clip-history";
import { ForceSettingsDialog } from "./force-settings-dialog";
import { MatrixGrid } from "./matrix-grid";
import { MatrixPreview } from "./matrix-preview";
import { MatrixSettings } from "./matrix-settings";
import { BatchProgress } from "./batch-progress";
import {
  GenerateSection,
  SectionTitle,
  SectionHeaderRow,
  ButtonRow,
} from "./images-tab.styled";
import {
  TabLayout,
  TabColumn,
  ComboCountText,
  MatrixCheckButton,
  GenerateRow,
  GenerateButton,
} from "./generate-tab.styled";

interface PendingDelete {
  kind: "image" | "action";
  id: string;
  clipCount: number;
}

export const GenerateTab: React.FC = () => {
  const images = useStudioStore((s) => s.images);
  const actions = useStudioStore((s) => s.actions);
  const videoGenParams = useStudioStore((s) => s.videoGenParams);
  const setVideoGenParams = useStudioStore((s) => s.setVideoGenParams);
  const excludedCombos = useStudioStore((s) => s.excludedCombos);
  const rerenderCombos = useStudioStore((s) => s.rerenderCombos);
  const jobs = useStudioStore((s) => s.jobs);

  const { submit, isSubmitting, getPendingCombinations } = useBatchSubmit();
  const checks = useMatrixChecks();

  const frames = useMemo(() => images.filter(isAnimatableFrame), [images]);
  // Frames still generating or uploading get a row straight away, showing
  // their progress; its cells wake up once the frame is ready.
  const matrixRows = useMemo(
    () => images.filter((i) => i.status !== "failed"),
    [images],
  );
  const runnableActions = useMemo(
    () => actions.filter(isRunnableAction),
    [actions],
  );
  const cellJobs = useMemo(() => indexCellJobs(jobs), [jobs]);

  const headings = useMemo(() => {
    const loraOptions = getLoraOptionsForModel(videoGenParams.model);
    if (loraOptions.length === 0) return actionHeadings(runnableActions);
    return actionHeadings(runnableActions, (action) => {
      const path = action.highNoiseLoras?.[0]?.path;
      if (!path) return NO_LORA_OPTION.label;
      return loraOptions.find((o) => o.key === path)?.label;
    });
  }, [runnableActions, videoGenParams.model]);
  const clipCounts = useMemo(
    () => actionClipCounts(images, jobs),
    [images, jobs],
  );

  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [openImageUuid, setOpenImageUuid] = useState<string | null>(null);
  const [generateOpen, setGenerateOpen] = useState(false);
  // A row or column with clips, waiting on the go-ahead to delete it.
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
    null,
  );
  const openActionIndex = runnableActions.findIndex(
    (a) => a.id === openActionId,
  );
  const openAction =
    openActionIndex >= 0 ? runnableActions[openActionIndex] : undefined;
  const openImage = frames.find((i) => i.uuid === openImageUuid);
  const openImageClipCount = openImage
    ? imageClipCount(cellJobs, runnableActions, openImage.uuid)
    : 0;

  const newCombos = useMemo(
    () => getPendingCombinations(),
    [getPendingCombinations],
  );
  const modelConstraints = useModelConstraints({ mediaType: "video" });
  const durationOptions = useMemo(
    () =>
      getAllowedDurationsForActions(
        newCombos.map(({ action }) => action),
        modelConstraints.get(videoGenParams.model)?.durationsSec,
      ),
    [newCombos, videoGenParams.model, modelConstraints],
  );

  const { data: modelsData } = useModels({ mediaType: "video" });
  const modelOptions = modelsData?.data?.models ?? [];

  const { totalCostUsd, costBreakdown } = useCostEstimate({
    model: modelOptions.find((m) => m.id === videoGenParams.model),
    params: { durationSec: videoGenParams.duration },
    count: newCombos.length,
    breakdownKey: "components.cost_estimate.clips",
  });

  const { overBudget, canManageKey, resetIn, guardOverBudget } =
    useCreditGuard(totalCostUsd);

  useEffect(() => {
    const nextDuration = clampDurationToAllowed(
      videoGenParams.duration,
      durationOptions,
    );
    if (nextDuration !== videoGenParams.duration) {
      setVideoGenParams({ duration: nextDuration });
    }
  }, [durationOptions, videoGenParams.duration, setVideoGenParams]);

  const totalPossible = frames.length * runnableActions.length;

  const { completedUuids, renderedCount } = useMemo(() => {
    const uuids: string[] = [];
    const seen = new Set<string>();
    let rendered = 0;
    for (const image of frames) {
      for (const action of runnableActions) {
        const job = cellJobs.get(comboKeyOf(image.uuid, action.id));
        if (job?.status !== "processed") continue;
        rendered++;
        if (seen.has(job.dreamUuid)) continue;
        seen.add(job.dreamUuid);
        uuids.push(job.dreamUuid);
      }
    }
    return { completedUuids: uuids, renderedCount: rendered };
  }, [frames, runnableActions, cellJobs]);

  const segments = useDreamSegments(completedUuids);
  const preview = useMatrixPreview(segments);
  const { playSegment } = preview;
  const { checkRenderedCell } = checks;

  /** A clip back from history plays, and is checked like a click would. */
  const handleRestore = useCallback(
    (dreamUuid: string) => {
      playSegment(dreamUuid);
      const job = useStudioStore
        .getState()
        .jobs.find((j) => j.dreamUuid === dreamUuid);
      if (job) checkRenderedCell(comboKeyOf(job.imageId, job.actionId), job);
    },
    [playSegment, checkRenderedCell],
  );
  const discardClip = useDiscardStudioClip();
  const removeImage = useRemoveStudioImage();
  const removeAction = useRemoveStudioAction();

  /** Deletes a row or column; one with clips asks first, as its × would. */
  const requestDelete = (
    kind: PendingDelete["kind"],
    id: string,
    clipCount: number,
  ) => {
    if (clipCount > 0) setPendingDelete({ kind, id, clipCount });
    else if (kind === "image") removeImage(id);
    else removeAction(id);
  };

  const submittedJobs = useMemo(
    () => jobs.filter((j) => j.jobType !== "uprez"),
    [jobs],
  );

  return (
    <TabLayout>
      <TabColumn>
        <MatrixPreview
          segments={segments}
          previewIndex={preview.previewIndex}
          replayToken={preview.replayToken}
          playingUuid={preview.playingUuid}
          segmentKeys={preview.segmentKeys}
          images={images}
          actions={runnableActions}
          jobs={jobs}
          cellJobs={cellJobs}
          hasSubmitted={submittedJobs.length > 0}
          onIndexChange={preview.showIndex}
          onPlay={playSegment}
        />

        <BatchProgress jobs={submittedJobs} />

        <CreditLimitNotice
          overBudget={overBudget}
          canManageKey={canManageKey}
          resetIn={resetIn}
        />

        <GenerateRow>
          <CostEstimate amountUsd={totalCostUsd} breakdown={costBreakdown} />
          <GenerateButton
            type="button"
            onClick={() => {
              if (guardOverBudget()) return;
              submit();
            }}
            disabled={isSubmitting || newCombos.length === 0 || overBudget}
          >
            {isSubmitting
              ? "Submitting…"
              : `Generate ${newCombos.length} ${
                  newCombos.length === 1 ? "video" : "videos"
                }`}
          </GenerateButton>
        </GenerateRow>

        <ClipHistory
          onRestore={handleRestore}
          showRemoved={newCombos.length === 0}
        />
      </TabColumn>

      <TabColumn>
        <MatrixSettings
          durationOptions={durationOptions}
          hidden={newCombos.length === 0}
        />
      </TabColumn>

      <TabColumn>
        <GenerateSection>
          <SectionHeaderRow>
            <SectionTitle>Matrix</SectionTitle>
            <ButtonRow>
              <MatrixCheckButton
                type="button"
                onClick={() => checks.checkAll()}
              >
                Check all
              </MatrixCheckButton>
              <MatrixCheckButton
                type="button"
                onClick={() => checks.uncheckAll()}
              >
                Uncheck all
              </MatrixCheckButton>
            </ButtonRow>
          </SectionHeaderRow>

          <MatrixGrid
            rows={matrixRows}
            actions={runnableActions}
            headings={headings}
            cellJobs={cellJobs}
            excludedCombos={excludedCombos}
            rerenderCombos={rerenderCombos}
            segmentKeys={preview.segmentKeys}
            playingUuid={preview.playingUuid}
            onOpenAction={setOpenActionId}
            onOpenImage={setOpenImageUuid}
            onPlay={playSegment}
            onToggle={checks.toggleCell}
            onDiscard={discardClip}
          />

          <ComboCountText>
            <strong>{newCombos.length}</strong> of{" "}
            <strong>{totalPossible}</strong> combinations checked to generate
            {renderedCount > 0 && (
              <>
                {" · "}
                <strong>{renderedCount}</strong> rendered
              </>
            )}
          </ComboCountText>
        </GenerateSection>
      </TabColumn>
      {checks.pendingCombine && (
        <ForceSettingsDialog
          title="Clips have different settings"
          body={
            <>
              Checked clips re-render together with one set of settings &mdash;
              the ones shown now. Cancel leaves{" "}
              {checks.pendingCombine.kind === "cell"
                ? "this clip"
                : "the clips"}{" "}
              unchecked.
            </>
          }
          confirmLabel="Combine"
          onConfirm={checks.confirmCombine}
          onCancel={checks.cancelCombine}
        />
      )}
      {openAction && (
        <ActionDialog
          action={openAction}
          index={openActionIndex + 1}
          heading={headings[openActionIndex]}
          clipCount={clipCounts.get(openAction.id) ?? 0}
          onClose={() => setOpenActionId(null)}
          onCheckColumn={() => {
            setOpenActionId(null);
            checks.checkAll({ actionId: openAction.id });
          }}
          onUncheckColumn={() => {
            setOpenActionId(null);
            checks.uncheckAll({ actionId: openAction.id });
          }}
          onDelete={() => {
            setOpenActionId(null);
            requestDelete(
              "action",
              openAction.id,
              clipCounts.get(openAction.id) ?? 0,
            );
          }}
        />
      )}
      {openImage && (
        <ImageDialog
          image={openImage}
          clipCount={openImageClipCount}
          onClose={() => setOpenImageUuid(null)}
          onCheckRow={() => {
            setOpenImageUuid(null);
            checks.checkAll({ imageUuid: openImage.uuid });
          }}
          onUncheckRow={() => {
            setOpenImageUuid(null);
            checks.uncheckAll({ imageUuid: openImage.uuid });
          }}
          onGenerateMore={() => {
            setOpenImageUuid(null);
            setGenerateOpen(true);
          }}
          onDelete={() => {
            setOpenImageUuid(null);
            requestDelete("image", openImage.uuid, openImageClipCount);
          }}
        />
      )}
      <ConfirmModal
        isOpen={pendingDelete !== null}
        title={
          pendingDelete?.kind === "image" ? "Remove image?" : "Remove action?"
        }
        text={`This ${pendingDelete?.kind ?? "action"} has ${
          pendingDelete?.clipCount ?? 0
        } ${pendingDelete?.clipCount === 1 ? "clip" : "clips"} in the matrix. ${
          pendingDelete?.kind === "image"
            ? "Removing it from this playlist does not delete it."
            : "Removing it discards them: they leave the matrix and the output playlist."
        }`}
        confirmText="Remove"
        confirmButtonType="danger"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete?.kind === "image") removeImage(pendingDelete.id);
          else if (pendingDelete) removeAction(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
      {generateOpen && (
        <GenerateReferenceFramesModal onClose={() => setGenerateOpen(false)} />
      )}
    </TabLayout>
  );
};
