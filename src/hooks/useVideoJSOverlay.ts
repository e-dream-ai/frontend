import { useCallback, useRef, useEffect } from "react";
import Player from "video.js/dist/types/player";

export type OverlayOptions = {
  id?: string;
  content: string;
  duration?: number; // in ms if want to autohide
};

export const useVideoJSOverlay = (
  playerRef: React.MutableRefObject<Player | null>,
) => {
  const overlaysRef = useRef<Map<string, HTMLElement>>(new Map());
  const styleElementRef = useRef<HTMLStyleElement | null>(null);

  const setupStyles = useCallback(() => {
    if (!styleElementRef.current) {
      const style = document.createElement("style");
      style.textContent = `
          .video-js-overlay {
            position: absolute;
            bottom: 40px;
            left: 20px;
            color: white;
            font-size: 20px;
            padding: 10px;
            z-index: 1;
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          .video-js-overlay.visible {
            opacity: 1;
          }
        `;
      document.head.appendChild(style);
      styleElementRef.current = style;
    }
  }, []);

  // hide overlay fn
  const hideOverlay = useCallback((id: string = "default") => {
    const overlay = overlaysRef.current.get(id);
    if (overlay) {
      overlay.classList.remove("visible");
      // remove after transition
      setTimeout(() => {
        overlay.remove();
        overlaysRef.current.delete(id);
      }, 300); // match transition duration
    }
  }, []);

  // show overlay fn
  const showOverlay = useCallback(
    (options: OverlayOptions) => {
      const { id = "default", content, duration } = options;
      const player = playerRef.current;
      if (!player) return;

      // remove overlay with id if exists
      hideOverlay(id);

      // add new overlay
      const overlay = document.createElement("div");
      overlay.className = "video-js-overlay";
      overlay.id = `video-overlay-${id}`;
      overlay.innerHTML = content;

      player.el().appendChild(overlay);
      overlaysRef.current.set(id, overlay);

      // make visible
      requestAnimationFrame(() => {
        overlay.classList.add("visible");
      });

      // autohide if duration is set
      if (duration) {
        setTimeout(() => {
          hideOverlay(id);
        }, duration);
      }
    },
    [playerRef, hideOverlay],
  );

  const hideAllOverlays = useCallback(() => {
    overlaysRef.current.forEach((_, id) => hideOverlay(id));
  }, [hideOverlay]);

  // clean up
  useEffect(() => {
    return () => {
      hideAllOverlays();
      styleElementRef.current?.remove();
    };
  }, [hideAllOverlays]);

  // setup styles
  useEffect(() => {
    setupStyles();
  }, [setupStyles]);

  return {
    showOverlay,
    hideOverlay,
    hideAllOverlays,
  };
};
