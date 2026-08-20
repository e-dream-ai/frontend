import { useCallback, useEffect, useRef } from "react";
import type { Dream } from "@/types/dream.types";
import {
  DreamMediaAborted,
  resolveDreamMedia,
} from "../utils/resolve-dream-media";

export const useDreamMediaResolver = () => {
  const inFlight = useRef(new Map<string, Promise<Dream | undefined>>());
  const abortRef = useRef<AbortController | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      abortRef.current?.abort();
      abortRef.current = null;
      inFlight.current.clear();
    };
  }, []);

  return useCallback((uuid: string) => {
    if (!mounted.current) return Promise.reject(new DreamMediaAborted());

    const running = inFlight.current.get(uuid);
    if (running) return running;

    abortRef.current ??= new AbortController();
    const poll = resolveDreamMedia(uuid, {
      signal: abortRef.current.signal,
    }).finally(() => inFlight.current.delete(uuid));

    inFlight.current.set(uuid, poll);
    return poll;
  }, []);
};
