import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { TooltipBox } from "./hover-tooltip.styled";

const HALF_WIDTH = 170;

interface TooltipState {
  text: string;
  x: number;
  y: number;
}

/**
 * A hover label that escapes its scroll container.
 *
 * The matrix scrolls both ways, so anything positioned inside it is clipped at
 * the panel edge — a tooltip on the rightmost column would be cut in half.
 * This portals to the body and positions from the anchor's rect instead, and
 * `title` is deliberately left off the anchors so the native tooltip does not
 * turn up alongside this one.
 */
export function useHoverTooltip() {
  const [tip, setTip] = useState<TooltipState | null>(null);

  const show = useCallback(
    (anchor: Element | null | undefined, text: string) => {
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      setTip({
        // Clamped so a column near either edge of the window still shows the
        // whole label rather than running off it.
        x: Math.min(
          Math.max(rect.left + rect.width / 2, HALF_WIDTH),
          window.innerWidth - HALF_WIDTH,
        ),
        y: rect.bottom + 6,
        text,
      });
    },
    [],
  );

  const hide = useCallback(() => setTip(null), []);

  const tooltip = tip
    ? createPortal(
        <TooltipBox role="tooltip" style={{ left: tip.x, top: tip.y }}>
          {tip.text}
        </TooltipBox>,
        document.body,
      )
    : null;

  return { show, hide, tooltip };
}
