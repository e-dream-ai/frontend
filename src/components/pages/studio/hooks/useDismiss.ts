import { type RefObject, useEffect } from "react";

type Options = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  containerRef: RefObject<HTMLElement>;
  triggerRef: RefObject<HTMLElement>;
};

export const useDismiss = ({
  open,
  onOpenChange,
  containerRef,
  triggerRef,
}: Options) => {
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      onOpenChange(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange, containerRef, triggerRef]);
};
