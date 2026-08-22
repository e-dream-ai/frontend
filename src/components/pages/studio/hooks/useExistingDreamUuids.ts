import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useFlowStore } from "@/stores/flow.store";

export const useExistingDreamUuids = () => {
  const dreamUuids = useFlowStore(
    useShallow((s) =>
      s.referenceFrames
        .map((frame) => frame.dreamUuid)
        .filter((uuid): uuid is string => Boolean(uuid)),
    ),
  );

  return useMemo(() => new Set(dreamUuids), [dreamUuids]);
};
