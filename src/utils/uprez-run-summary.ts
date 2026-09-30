import type { TFunction } from "i18next";
import type { UprezRunSummary } from "@/types/playlist.types";

const KEY = "components.uprez_run_summary";

export const formatUprezRunSummary = (
  t: TFunction,
  result: UprezRunSummary,
  mode: "preview" | "started" = "started",
): string => {
  if (!result.hasWork) return t(`${KEY}.up_to_date`, { context: mode });

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
