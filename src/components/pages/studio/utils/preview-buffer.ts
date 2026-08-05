/**
 * Double-buffer state machine for the flow-preview carousel (issue #670): a back
 * layer preloads the next segment while the front stays visible, and only swaps
 * once its first frame has decoded, so no blank frame is ever shown.
 *
 * Segments are tracked by key (dream uuid), not position — a retried transition
 * can complete out of order and shift every later index.
 */

export type Layer = 0 | 1;

export type SegmentKey = string;

export interface PreviewBufferState {
  /** Which layer is currently visible (front). */
  front: Layer;
  /** Segment key each layer has loaded as its <video> src (null = empty). */
  loaded: [SegmentKey | null, SegmentKey | null];
  /** Whether each layer's current src has decoded a displayable frame. */
  ready: [boolean, boolean];
}

export const backLayer = (front: Layer): Layer => (front === 0 ? 1 : 0);

export const initialPreviewBuffer = (
  startKey: SegmentKey | null = null,
): PreviewBufferState => ({
  front: 0,
  loaded: [startKey, null],
  ready: [false, false],
});

/** Request that `key` becomes visible: instant if the back layer already has it ready, otherwise assigns it to the back layer to load. */
export function requestSegment(
  state: PreviewBufferState,
  key: SegmentKey,
): PreviewBufferState {
  if (key === state.loaded[state.front]) return state;

  const back = backLayer(state.front);
  if (state.loaded[back] === key) {
    return state.ready[back] ? { ...state, front: back } : state;
  }

  const loaded: [SegmentKey | null, SegmentKey | null] = [...state.loaded];
  loaded[back] = key;
  const ready: [boolean, boolean] = [...state.ready];
  ready[back] = false;
  return { front: state.front, loaded, ready };
}

/**
 * A layer decoded its first frame for `key`; swaps it to front unless superseded.
 * `key` must come from the DOM event itself, not read back out of `state.loaded` —
 * that would make the staleness check below unfalsifiable.
 */
export function markReady(
  state: PreviewBufferState,
  layer: Layer,
  key: SegmentKey,
): PreviewBufferState {
  if (state.loaded[layer] !== key) return state; // stale / superseded event
  if (state.ready[layer] && state.front === layer) return state; // no-op

  const ready: [boolean, boolean] = [...state.ready];
  ready[layer] = true;
  const marked: PreviewBufferState = { ...state, ready };

  if (layer === state.front) return marked; // front readiness never swaps
  if (state.loaded[state.front] === key) return marked; // front already shows it
  return { ...marked, front: layer };
}

export function pruneSegments(
  state: PreviewBufferState,
  validKeys: ReadonlySet<SegmentKey>,
): PreviewBufferState {
  const keep = (key: SegmentKey | null) =>
    key !== null && validKeys.has(key) ? key : null;
  const loaded: [SegmentKey | null, SegmentKey | null] = [
    keep(state.loaded[0]),
    keep(state.loaded[1]),
  ];
  if (loaded[0] === state.loaded[0] && loaded[1] === state.loaded[1]) {
    return state;
  }
  const ready: [boolean, boolean] = [
    loaded[0] === null ? false : state.ready[0],
    loaded[1] === null ? false : state.ready[1],
  ];
  const back = backLayer(state.front);
  const front =
    loaded[state.front] === null && loaded[back] !== null ? back : state.front;
  return { front, loaded, ready };
}
