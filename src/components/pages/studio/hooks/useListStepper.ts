import { useCallback, useState } from "react";

export const useListStepper = <T extends { uuid: string }>(
  items: readonly T[],
) => {
  const [openUuid, setOpenUuid] = useState<string | null>(null);
  const index = openUuid
    ? items.findIndex((item) => item.uuid === openUuid)
    : -1;

  const step = useCallback(
    (delta: number) => {
      const next = items[index + delta];
      if (next) setOpenUuid(next.uuid);
    },
    [items, index],
  );

  const close = useCallback(() => setOpenUuid(null), []);

  return {
    current: index >= 0 ? items[index] : undefined,
    index,
    open: setOpenUuid,
    close,
    step,
  };
};
