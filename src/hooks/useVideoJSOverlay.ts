import {
  HIDE_OVERLAY_TRANSITION_MS,
  SHOW_OVERLAY_TRANSITION_MS,
} from "@/constants/web-client.constants";
import { useCallback, useRef, useEffect } from "react";
import Player from "video.js/dist/types/player";

export type OverlayOptions = {
  id?: string;
  content: string;
  duration?: number; // in ms if want to autohide
};

export const useVideoJSOverlay = (
  playerRefs: Array<React.MutableRefObject<Player | null>>,
) => {
  const overlaysRef = useRef<Map<string, HTMLElement[]>>(new Map());
  const overlayTimeoutsRef = useRef(new Map<string, NodeJS.Timeout>());
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
            transition: opacity ${SHOW_OVERLAY_TRANSITION_MS}ms ease;
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
    const overlays = overlaysRef.current.get(id);
    if (!overlays) return;

    // remove any existing timeout
    const timeoutId = overlayTimeoutsRef.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // revemove visible class
    overlays.forEach((overlay) => {
      overlay.classList.remove("visible");
    });

    const newTimeoutId = setTimeout(() => {
      // remove if element existso on DOM
      // remove all overlays with this ID from DOM
      overlays.forEach((overlay) => {
        if (overlay && overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      });
      overlaysRef.current.delete(id);
      overlayTimeoutsRef.current.delete(id);
    }, SHOW_OVERLAY_TRANSITION_MS); // match transition duration

    // add new timeout
    overlayTimeoutsRef.current.set(id, newTimeoutId);
  }, []);

  // show overlay fn
  const showOverlay = useCallback(
    (options: OverlayOptions) => {
      const { id = "default", content, duration } = options;

      // remove overlay with id if exists
      hideOverlay(id);

      // wait for any pending removal to complete
      setTimeout(() => {
        const newOverlays: HTMLElement[] = [];

        playerRefs.forEach((playerRef) => {
          const player = playerRef.current;
          if (!player) return;
          // add new overlay
          const overlay = document.createElement("div");
          overlay.className = "video-js-overlay";
          overlay.id = `video-overlay-${id}`;
          overlay.innerHTML = content;

          player.el().appendChild(overlay);
          newOverlays.push(overlay);

          // make visible
          requestAnimationFrame(() => {
            overlay.classList.add("visible");
          });
        });

        // store all overlays for this ID
        overlaysRef.current.set(id, newOverlays);

        // autohide if duration is set
        if (duration) {
          setTimeout(() => {
            hideOverlay(id);
          }, duration);
        }
      }, HIDE_OVERLAY_TRANSITION_MS); // slightly longer than hide transition
    },
    [playerRefs, hideOverlay],
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
