import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useStudioStore } from "@/stores/studio.store";
import { DREAM_QUERY_KEY } from "@/api/dream/query/useDream";
import { useModelConstraints } from "@/api/model/query/useModelConstraints";
import type { Dream } from "@/types/dream.types";
import type { ApiResponse } from "@/types/api.types";
import type { StudioJob, VideoGenParams } from "@/types/studio.types";
import {
  guidanceForModel,
  resolveGuidanceConstraint,
} from "../constants/guidance-options";
import {
  comboKeyOf,
  indexCellJobs,
  isAnimatableFrame,
  isJobInFlight,
  isRunnableAction,
} from "../utils/batch-selectors";
import {
  resolveJobSettings,
  settingsDiffer,
  settingsPatch,
  type JobSettings,
} from "../utils/job-settings";

export type CellScope = { actionId?: string; imageUuid?: string };

export type PendingCombine =
  | { kind: "cell"; comboKey: string }
  | {
      kind: "cells";
      patch: Partial<VideoGenParams>;
      excludedCombos: Set<string>;
      rerenderCombos: Set<string>;
    };

const cellsIn = ({ actionId, imageUuid }: CellScope) => {
  const { images, actions, jobs } = useStudioStore.getState();
  const cellJobs = indexCellJobs(jobs);
  return images
    .filter(isAnimatableFrame)
    .filter((image) => imageUuid === undefined || image.uuid === imageUuid)
    .flatMap((image) =>
      actions
        .filter(isRunnableAction)
        .filter((action) => actionId === undefined || action.id === actionId)
        .map((action) => {
          const key = comboKeyOf(image.uuid, action.id);
          return { key, job: cellJobs.get(key) };
        }),
    );
};

const applyChecks = (
  patch: Partial<VideoGenParams>,
  excludedCombos: Set<string>,
  rerenderCombos: Set<string>,
) => {
  const { setVideoGenParams, setComboChecks } = useStudioStore.getState();
  if (Object.keys(patch).length > 0) setVideoGenParams(patch);
  setComboChecks({ excludedCombos, rerenderCombos });
};

export const useMatrixChecks = () => {
  const queryClient = useQueryClient();
  const modelConstraints = useModelConstraints({ mediaType: "video" });
  const [pendingCombine, setPendingCombine] = useState<PendingCombine | null>(
    null,
  );

  const settingsOf = useCallback(
    (job: StudioJob) =>
      resolveJobSettings(
        job,
        queryClient.getQueryData<ApiResponse<{ dream: Dream }>>([
          DREAM_QUERY_KEY,
          job.dreamUuid,
        ])?.data?.dream?.prompt,
      ),
    [queryClient],
  );

  const resolvePanel = useCallback(
    (params: VideoGenParams): VideoGenParams => ({
      ...params,
      guidance: guidanceForModel(
        params.guidance,
        resolveGuidanceConstraint(
          params.model,
          modelConstraints.get(params.model),
        ),
      ),
    }),
    [modelConstraints],
  );

  const checkAll = useCallback(
    (scope: CellScope = {}) => {
      const { excludedCombos, rerenderCombos, videoGenParams } =
        useStudioStore.getState();
      const excluded = new Set(excludedCombos);
      const rerender = new Set(rerenderCombos);
      const known: JobSettings[] = [];
      for (const { key, job } of cellsIn(scope)) {
        if (!job) {
          excluded.delete(key);
        } else if (!isJobInFlight(job)) {
          rerender.add(key);
          const clip = rerenderCombos.has(key) ? undefined : settingsOf(job);
          if (clip) known.push(clip);
        }
      }
      const patch =
        rerenderCombos.size === 0 && known[0] ? settingsPatch(known[0]) : {};
      const reference = resolvePanel({ ...videoGenParams, ...patch });
      if (known.some((clip) => settingsDiffer(clip, reference))) {
        setPendingCombine({
          kind: "cells",
          patch,
          excludedCombos: excluded,
          rerenderCombos: rerender,
        });
      } else {
        applyChecks(patch, excluded, rerender);
      }
    },
    [settingsOf, resolvePanel],
  );

  const uncheckAll = useCallback((scope: CellScope = {}) => {
    const { excludedCombos, rerenderCombos, setComboChecks } =
      useStudioStore.getState();
    const whole = scope.actionId === undefined && scope.imageUuid === undefined;
    const excluded = new Set(excludedCombos);
    const rerender = whole ? new Set<string>() : new Set(rerenderCombos);
    for (const { key, job } of cellsIn(scope)) {
      if (!job) excluded.add(key);
      rerender.delete(key);
    }
    setComboChecks({ excludedCombos: excluded, rerenderCombos: rerender });
  }, []);

  const checkRenderedCell = useCallback(
    (comboKey: string, job: StudioJob) => {
      const {
        rerenderCombos: picked,
        videoGenParams: panel,
        setVideoGenParams,
        toggleComboRerender,
      } = useStudioStore.getState();
      if (picked.has(comboKey)) return;
      const clip = settingsOf(job);
      if (clip) {
        if (picked.size === 0) {
          setVideoGenParams(settingsPatch(clip));
        } else if (settingsDiffer(clip, resolvePanel(panel))) {
          setPendingCombine({ kind: "cell", comboKey });
          return;
        }
      }
      toggleComboRerender(comboKey);
    },
    [settingsOf, resolvePanel],
  );

  const toggleCell = useCallback(
    (comboKey: string, job: StudioJob | undefined) => {
      const { rerenderCombos, toggleComboRerender, toggleComboExcluded } =
        useStudioStore.getState();
      if (!job) toggleComboExcluded(comboKey);
      else if (rerenderCombos.has(comboKey)) toggleComboRerender(comboKey);
      else checkRenderedCell(comboKey, job);
    },
    [checkRenderedCell],
  );

  const confirmCombine = useCallback(() => {
    if (!pendingCombine) return;
    if (pendingCombine.kind === "cell") {
      useStudioStore.getState().toggleComboRerender(pendingCombine.comboKey);
    } else {
      applyChecks(
        pendingCombine.patch,
        pendingCombine.excludedCombos,
        pendingCombine.rerenderCombos,
      );
    }
    setPendingCombine(null);
  }, [pendingCombine]);

  const cancelCombine = useCallback(() => setPendingCombine(null), []);

  return {
    checkAll,
    uncheckAll,
    checkRenderedCell,
    toggleCell,
    pendingCombine,
    confirmCombine,
    cancelCombine,
  };
};
