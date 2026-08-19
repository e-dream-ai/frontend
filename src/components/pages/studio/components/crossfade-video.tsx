import { useEffect, useMemo, useRef, useState } from "react";
import {
  initialPreviewBuffer,
  backLayer,
  requestSegment,
  markReady,
  pruneSegments,
  type Layer,
  type PreviewBufferState,
} from "../utils/preview-buffer";
import { LayerStack, VideoLayer } from "./crossfade-video.styled";

export interface CrossfadeSegment {
  key: string;
  url: string;
  poster?: string;
  /**
   * CSS aspect-ratio of the segment's source ("1440 / 1440"), when known.
   * Used to size the box before the file's header has been read.
   */
  ratio?: string;
}

interface Props {
  segments: readonly CrossfadeSegment[];
  index: number;
  active?: boolean;
  muted?: boolean;
  controls?: boolean;
  loop?: boolean;
  onEnded?: () => void;
  /**
   * Reports a segment's true shape once the browser has read the file header,
   * correcting the `ratio` hint. Covers dreams whose dimensions were never
   * recorded, and any case where the file played is not the one those
   * dimensions describe.
   */
  onMeasured?: (key: string, ratio: string) => void;
}

const LAYERS = [0, 1] as const satisfies readonly Layer[];

function resolveUrl(url: string): string {
  try {
    return new URL(url, document.baseURI).href;
  } catch {
    return url;
  }
}

export function CrossfadeVideo({
  segments,
  index,
  active = true,
  muted = false,
  controls = false,
  loop = false,
  onEnded,
  onMeasured,
}: Props) {
  const targetKey = segments[index]?.key ?? null;

  const signature = JSON.stringify(segments);
  const lookups = useMemo(
    () => ({
      validKeys: new Set(segments.map((s) => s.key)),
      byKey: new Map(segments.map((s) => [s.key, s])),
      keyByResolvedUrl: new Map(
        segments.map((s) => [resolveUrl(s.url), s.key]),
      ),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on signature, not the churning array identity
    [signature],
  );

  const [buf, setBuf] = useState<PreviewBufferState>(() =>
    initialPreviewBuffer(targetKey),
  );

  const [synced, setSynced] = useState({ key: targetKey, signature });
  if (synced.key !== targetKey || synced.signature !== signature) {
    setSynced({ key: targetKey, signature });
    setBuf((s) => {
      const pruned = pruneSegments(s, lookups.validKeys);
      return targetKey === null ? pruned : requestSegment(pruned, targetKey);
    });
  }

  const layer0 = useRef<HTMLVideoElement>(null);
  const layer1 = useRef<HTMLVideoElement>(null);
  const layerRefs = useMemo(() => [layer0, layer1] as const, []);

  useEffect(() => {
    const front = layerRefs[buf.front].current;
    layerRefs[backLayer(buf.front)].current?.pause();
    if (!front) return;
    if (!active) {
      front.pause();
      return;
    }
    if (front.paused && front.currentTime > 0.05) front.currentTime = 0;
    front.play().catch(() => undefined);
  }, [buf.front, active, layerRefs]);

  return (
    <LayerStack>
      {LAYERS.map((layer) => {
        const isFront = buf.front === layer;
        const loadedKey = buf.loaded[layer];
        const segment =
          loadedKey === null ? undefined : lookups.byKey.get(loadedKey);
        return (
          <VideoLayer
            key={layer}
            ref={layerRefs[layer]}
            $visible={isFront}
            src={segment?.url}
            poster={segment?.poster}
            preload="auto"
            autoPlay
            playsInline
            muted={muted}
            loop={loop}
            controls={controls && isFront}
            aria-hidden={!isFront}
            tabIndex={isFront ? undefined : -1}
            onLoadedMetadata={(e) => {
              const { currentSrc, videoWidth, videoHeight } = e.currentTarget;
              if (!videoWidth || !videoHeight) return;
              const measuredKey = lookups.keyByResolvedUrl.get(currentSrc);
              if (measuredKey === undefined) return;
              onMeasured?.(measuredKey, `${videoWidth} / ${videoHeight}`);
            }}
            onLoadedData={(e) => {
              // From the element's own resource, not `buf.loaded` — see markReady.
              const decodedKey = lookups.keyByResolvedUrl.get(
                e.currentTarget.currentSrc,
              );
              if (decodedKey === undefined) return;
              setBuf((s) => markReady(s, layer, decodedKey));
            }}
            onEnded={() => {
              if (buf.front !== layer || !active) return;
              onEnded?.();
            }}
          />
        );
      })}
    </LayerStack>
  );
}
