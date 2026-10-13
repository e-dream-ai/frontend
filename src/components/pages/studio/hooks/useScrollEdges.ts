import { useCallback, useEffect, useRef, useState } from "react";

export interface ScrollEdges {
  /** More content past the left edge. */
  left: boolean;
  /** More content past the right edge. */
  right: boolean;
}

/**
 * Which sides of a horizontally scrolling element hide content, kept current
 * as it scrolls, resizes, or gains and loses children.
 */
export function useScrollEdges<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [edges, setEdges] = useState<ScrollEdges>({
    left: false,
    right: false,
  });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const left = el.scrollLeft > 1;
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
    setEdges((prev) =>
      prev.left === left && prev.right === right ? prev : { left, right },
    );
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const resize = new ResizeObserver(measure);
    resize.observe(el);
    const children = new MutationObserver(measure);
    children.observe(el, { childList: true });
    return () => {
      el.removeEventListener("scroll", measure);
      resize.disconnect();
      children.disconnect();
    };
  }, [measure]);

  /** Scrolls most of a view's width toward one side. */
  const page = useCallback((direction: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  }, []);

  return { ref, edges, page };
}
