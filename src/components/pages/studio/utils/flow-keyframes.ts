import { axiosClient } from "@/client/axios.client";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { useFlowStore } from "@/stores/flow.store";
import type { FlowKeyframe, FlowTransition } from "@/types/flow.types";
import type { ApiResponse } from "@/types/api.types";
import type { PlaylistKeyframe } from "@/types/playlist.types";

const PLAYLIST_KEYFRAMES_PAGE_SIZE = 5000;

const pendingKeyframes = new Map<string, Promise<string>>();

const isConflict = (error: unknown): boolean =>
  (error as { response?: { status?: number } })?.response?.status === 409;

export type DreamKeyframeState = {
  startKeyframe?: string;
  endKeyframe?: string;
};

export const ensureFlowKeyframe = async (
  keyframe: FlowKeyframe,
): Promise<string> => {
  const current = useFlowStore
    .getState()
    .keyframes.find((candidate) => candidate.id === keyframe.id);
  const existingUuid = current?.keyframeUuid ?? keyframe.keyframeUuid;
  if (existingUuid) return existingUuid;

  const pending = pendingKeyframes.get(keyframe.id);
  if (pending) return pending;

  const name = keyframe.name.trim() || "Flow keyframe";
  const request = axiosClient
    .post(
      "/v1/keyframe",
      { name: name.startsWith("kf_") ? name : `kf_${name}` },
      {
        headers: getRequestHeaders({ contentType: ContentType.json }),
      },
    )
    .then(({ data }) => {
      const uuid = data?.data?.keyframe?.uuid;
      if (!uuid) throw new Error("No keyframe UUID returned from API");
      useFlowStore.getState().updateKeyframe(keyframe.id, {
        keyframeUuid: uuid,
      });
      return uuid as string;
    })
    .finally(() => {
      pendingKeyframes.delete(keyframe.id);
    });

  pendingKeyframes.set(keyframe.id, request);
  return request;
};

const fetchPlaylistKeyframes = async (
  playlistUuid: string,
): Promise<PlaylistKeyframe[]> => {
  const { data } = await axiosClient.get<
    ApiResponse<{ keyframes: PlaylistKeyframe[] }>
  >(`/v1/playlist/${playlistUuid}/keyframes`, {
    params: { take: PLAYLIST_KEYFRAMES_PAGE_SIZE, skip: 0 },
    headers: getRequestHeaders({ contentType: ContentType.json }),
  });
  return data?.data?.keyframes ?? [];
};

export const syncFlowPlaylistKeyframes = async ({
  playlistUuid,
  keyframes,
  transitions,
  currentDreamKeyframes,
}: {
  playlistUuid: string;
  keyframes: FlowKeyframe[];
  transitions: FlowTransition[];
  currentDreamKeyframes?: Map<string, DreamKeyframeState>;
}): Promise<void> => {
  const linkedTransitions = transitions.filter(
    (transition) => transition.dreamUuid,
  );
  if (linkedTransitions.length === 0) return;

  const uuidEntries = await Promise.all(
    keyframes.map(async (keyframe) => {
      return [keyframe.id, await ensureFlowKeyframe(keyframe)] as const;
    }),
  );
  const keyframeUuidById = new Map(uuidEntries);
  const desiredKeyframeUuids = new Set(keyframeUuidById.values());
  const headers = getRequestHeaders({ contentType: ContentType.json });

  for (const uuid of desiredKeyframeUuids) {
    try {
      await axiosClient.post(
        `/v1/playlist/${playlistUuid}/keyframe`,
        { uuid },
        { headers },
      );
    } catch (error) {
      if (!isConflict(error)) throw error;
    }
  }

  const existingKeyframes = await fetchPlaylistKeyframes(playlistUuid);
  await Promise.all(
    existingKeyframes
      .filter((playlistKeyframe) => {
        const uuid = playlistKeyframe.keyframe?.uuid;
        return Boolean(uuid) && !desiredKeyframeUuids.has(uuid!);
      })
      .map(async (playlistKeyframe) => {
        try {
          await axiosClient.delete(
            `/v1/playlist/${playlistUuid}/keyframe/${playlistKeyframe.id}`,
            { headers },
          );
        } catch (error) {
          if (!isConflict(error)) throw error;
        }
      }),
  );

  await Promise.all(
    linkedTransitions.map(async (transition) => {
      const startKeyframe = keyframeUuidById.get(transition.fromKeyframeId);
      const endKeyframe = keyframeUuidById.get(transition.toKeyframeId);
      if (!startKeyframe || !endKeyframe) {
        throw new Error("Flow transition keyframes could not be resolved");
      }

      const current = currentDreamKeyframes?.get(transition.dreamUuid!);
      if (
        current &&
        current.startKeyframe === startKeyframe &&
        current.endKeyframe === endKeyframe
      ) {
        return;
      }

      await axiosClient.put(
        `/v1/dream/${transition.dreamUuid}`,
        { startKeyframe, endKeyframe },
        { headers },
      );
    }),
  );
};
