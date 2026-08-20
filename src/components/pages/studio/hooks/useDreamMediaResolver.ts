import { useCallback, useEffect, useRef } from "react";
import type { Dream } from "@/types/dream.types";
import { resolveDreamMedia } from "../utils/resolve-dream-media";

export const useDreamMediaResolver = () => {
  const inFlight = useRef(new Map<string, Promise<Dream | undefined>>());
  const abortRef = useRef<AbortController>();

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    return () => {
      controller.abort();
      inFlight.current.clear();
    };
  }, []);

  return useCallback((uuid: string) => {
    const running = inFlight.current.get(uuid);
    if (running) return running;

    const poll = resolveDreamMedia(uuid, {
      signal: abortRef.current?.signal,
    }).finally(() => inFlight.current.delete(uuid));

    inFlight.current.set(uuid, poll);
    return poll;
  }, []);
};
