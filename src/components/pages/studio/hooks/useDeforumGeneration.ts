import { useCallback, useRef, useState } from "react";
import Bugsnag from "@bugsnag/js";
import { toast } from "react-toastify";
import { useDeforumStore } from "@/stores/deforum.store";
import { axiosClient } from "@/client/axios.client";
import { getRequestHeaders, ContentType } from "@/constants/auth.constants";
import queryClient from "@/api/query-client";
import { USER_QUERY_KEY } from "@/api/user/query/useUser";
import type { DeforumClip, DeforumRenderKind } from "@/types/deforum.types";
import { buildDeforumAlgoParams } from "../utils/deforum-params";
import { resolveDeforumTargets } from "../utils/deforum-targets";

// Same cap as the flow: a big playlist shouldn't fire every request at once.
const GENERATE_CONCURRENCY = 4;

export function useDeforumGeneration() {
  const [busy, setBusy] = useState(0);
  const busyRef = useRef(0);
  const recordRender = useDeforumStore((s) => s.recordRender);

  const renderClip = useCallback(
    async (clip: DeforumClip, kind: DeforumRenderKind) => {
      const settings = clip.settings;
      const name = kind === "test" ? `${clip.name} (test)` : clip.name;
      try {
        const { data } = await axiosClient.post(
          "/v1/dream",
          {
            name,
            prompt: JSON.stringify(buildDeforumAlgoParams(settings, kind)),
          },
          { headers: getRequestHeaders({ contentType: ContentType.json }) },
        );
        const dreamUuid = data?.data?.dream?.uuid;
        if (!dreamUuid) throw new Error("No dream UUID returned from API");
        recordRender(clip.id, kind, {
          dreamUuid,
          createdAt: Date.now(),
          settings,
        });
      } catch (error) {
        Bugsnag.notify(error as Error);
        toast.error(`Could not start ${name}.`);
      }
    },
    [recordRender],
  );

  const generate = useCallback(
    async (kind: DeforumRenderKind) => {
      const { clips, selectedIds } = useDeforumStore.getState();
      const targets = resolveDeforumTargets(clips, selectedIds, kind);
      if (targets.length === 0) return;

      busyRef.current += 1;
      setBusy(busyRef.current);
      try {
        let cursor = 0;
        const worker = async () => {
          while (cursor < targets.length) {
            await renderClip(targets[cursor++], kind);
          }
        };
        await Promise.all(
          Array.from(
            { length: Math.min(GENERATE_CONCURRENCY, targets.length) },
            worker,
          ),
        );
        await queryClient.invalidateQueries([USER_QUERY_KEY]);
      } finally {
        busyRef.current -= 1;
        setBusy(busyRef.current);
      }
    },
    [renderClip],
  );

  return { generate, isGenerating: busy > 0 };
}
