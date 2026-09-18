import React, { useEffect, useRef } from "react";
import { Overlay, Panel } from "./project-dialog.styled";

const FOCUSABLE = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

type Props = {
  labelledBy: string;
  children: React.ReactNode;
};

export const ProjectDialog: React.FC<Props> = ({ labelledBy, children }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const previous = document.activeElement as HTMLElement | null;
    const focusable = () =>
      Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));

    const [initial] = focusable();
    (initial ?? panel).focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const items = focusable();
      if (!items.length) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus();
    };
  }, []);

  return (
    <Overlay role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
      <Panel ref={panelRef} tabIndex={-1}>
        {children}
      </Panel>
    </Overlay>
  );
};
