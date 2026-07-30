/**
 * Double-buffer state machine for the flow-preview carousel.
 *
 * Two stacked <video> layers share the frame. The layer in `front` is visible;
 * the other preloads the next segment off-screen. We only reveal the back layer
 * once its first frame has decoded, so the outgoing frame stays painted the whole
 * time and no blank/black frame is ever shown between segments (issue #670).
 *
 * This module is pure — no React, no DOM — so the swap logic can be unit-tested
 * in isolation. The component maps `front`/`loaded` onto opacity and the two
 * <video> `src`s, and dispatches `ready()` from each layer's `loadeddata` event.
 */

export type Layer = 0 | 1;

export interface PreviewBufferState {
  /** Which layer is currently visible (front). */
  front: Layer;
  /** Segment index each layer has loaded as its <video> src (null = empty). */
  loaded: [number | null, number | null];
  /** Whether each layer's current src has decoded a displayable frame. */
  ready: [boolean, boolean];
}

export const backLayer = (front: Layer): Layer => (front === 0 ? 1 : 0);

export const initialPreviewBuffer = (startIndex = 0): PreviewBufferState => ({
  front: 0,
  loaded: [startIndex, null],
  ready: [false, false],
});

/**
 * Request that `index` becomes the visible segment.
 * - Already in front → no change.
 * - Already buffered AND ready on the back layer → reveal it now (instant crossfade).
 * - Otherwise → assign it to the back layer so its <video> starts loading; the
 *   swap happens later via `ready()`, keeping the current frame up until then.
 */
export function requestIndex(
  state: PreviewBufferState,
  index: number,
): PreviewBufferState {
  if (index === state.loaded[state.front]) return state;

  const back = backLayer(state.front);
  if (state.loaded[back] === index && state.ready[back]) {
    return { ...state, front: back };
  }

  const loaded: [number | null, number | null] = [...state.loaded];
  loaded[back] = index;
  const ready: [boolean, boolean] = [...state.ready];
  // New (or not-yet-ready) src on the back layer: it must re-prove readiness.
  ready[back] = false;
  return { front: state.front, loaded, ready };
}

/**
 * A layer reported its first frame decoded (loadeddata) for `index`.
 * Records readiness, then swaps that layer to the front only if it's the back
 * layer, still holds that index (not superseded), and isn't already showing.
 */
export function ready(
  state: PreviewBufferState,
  layer: Layer,
  index: number,
): PreviewBufferState {
  if (state.loaded[layer] !== index) return state; // stale / superseded event

  const readyArr: [boolean, boolean] = [...state.ready];
  readyArr[layer] = true;
  const marked: PreviewBufferState = { ...state, ready: readyArr };

  if (layer === state.front) return marked; // front readiness never swaps
  if (state.loaded[state.front] === index) return marked; // front already shows it
  return { ...marked, front: layer };
}
