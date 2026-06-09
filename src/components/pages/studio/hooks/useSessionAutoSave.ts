import { useEffect } from "react";
import { useFlowStore } from "@/stores/flow.store";
import { useStudioStore } from "@/stores/studio.store";
import { useSessionStore } from "@/stores/session.store";

export function useSessionAutoSave() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const debouncedSave = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        useSessionStore.getState().saveCurrentSession();
      }, 2000);
    };

    const unsubFlow = useFlowStore.subscribe(debouncedSave);
    const unsubStudio = useStudioStore.subscribe(debouncedSave);

    return () => {
      unsubFlow();
      unsubStudio();
      if (timer) clearTimeout(timer);
    };
  }, []);
}
