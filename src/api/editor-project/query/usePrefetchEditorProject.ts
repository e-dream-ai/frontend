import { useCallback, useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { editorProjectDetailQuery } from "@/api/editor-project/query/useEditorProject";

const HOVER_INTENT_MS = 100;

export const usePrefetchEditorProject = () => {
  const queryClient = useQueryClient();
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  useEffect(() => cancel, [cancel]);

  const prefetch = useCallback(
    (uuid: string) => {
      cancel();
      timerRef.current = setTimeout(() => {
        timerRef.current = undefined;
        void queryClient.prefetchQuery(editorProjectDetailQuery(uuid));
      }, HOVER_INTENT_MS);
    },
    [cancel, queryClient],
  );

  return useMemo(() => ({ prefetch, cancel }), [prefetch, cancel]);
};
