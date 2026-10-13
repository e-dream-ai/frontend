import type { TFunction } from "i18next";
import type { EnhanceRunSummary } from "@/types/playlist.types";

const KEY = "components.enhance_run_summary";

export const formatEnhanceRunSummary = (
  t: TFunction,
  result: EnhanceRunSummary,
  mode: "preview" | "started" = "started",
  inProgress = false,
): string => {
  if (!result.hasWork) {
    return inProgress
      ? t(`${KEY}.in_progress`)
      : t(`${KEY}.up_to_date`, { context: mode });
  }

  const actions = [
    { key: "render", count: result.created + result.requeued },
    { key: "reuse", count: result.reused },
    {
      key: "replace",
      count: result.replaced,
      cancelled: result.cancelled,
      context: result.cancelled > 0 ? "cancelling" : undefined,
    },
    { key: "remove", count: result.removed },
  ]
    .filter(({ count }) => count > 0)
    .map(({ key, ...options }) => t(`${KEY}.${key}`, options));

  return t(`${KEY}.summary`, { context: mode, actions });
};
