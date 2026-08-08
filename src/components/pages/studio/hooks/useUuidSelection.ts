import { useCallback, useState } from "react";

export const useUuidSelection = () => {
  const [selectedUuids, setSelectedUuids] = useState<Set<string>>(new Set());

  const toggle = useCallback((uuid: string) => {
    setSelectedUuids((prev) => {
      const next = new Set(prev);
      if (next.has(uuid)) next.delete(uuid);
      else next.add(uuid);
      return next;
    });
  }, []);

  const clear = useCallback(() => setSelectedUuids(new Set()), []);

  const replace = useCallback(
    (uuids: Iterable<string>) => setSelectedUuids(new Set(uuids)),
    [],
  );

  return { selectedUuids, toggle, clear, replace };
};
