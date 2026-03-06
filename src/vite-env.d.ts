/// <reference types="vite/client" />

declare module "@dragdroptouch/drag-drop-touch" {
  interface DragDropTouchOptions {
    allowDragScroll?: boolean;
    dragImageOpacity?: number;
    dragThresholdPixels?: number;
    isPressHoldMode?: boolean;
    pressHoldDelayMS?: number;
    pressHoldMargin?: number;
    pressHoldThresholdPixels?: number;
    contextMenuDelayMS?: number;
  }

  export function enableDragDropTouch(
    dragRoot?: HTMLElement,
    dropRoot?: HTMLElement,
    options?: DragDropTouchOptions,
  ): void;
}
