/// <reference types="vite/client" />

declare module "drag-drop-touch" {
  interface DragDropTouchOptions {
    allowDragScroll?: boolean;
    dragScrollPercentage?: number;
    dragScrollSpeed?: number;
    dragImageOpacity?: number;
    dragThresholdPixels?: number;
    isPressHoldMode?: boolean;
    pressHoldDelayMS?: number;
    pressHoldMargin?: number;
    pressHoldThresholdPixels?: number;
    contextMenuDelayMS?: number;
    forceListen?: boolean;
  }

  export class DragDropTouch {
    static instance: DragDropTouch | null;
    configure(options: DragDropTouchOptions): void;
  }
}
