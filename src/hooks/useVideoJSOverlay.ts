import {
  HIDE_OVERLAY_TRANSITION_MS,
  SHOW_OVERLAY_TRANSITION_MS,
} from "@/constants/web-client.constants";
import { useCallback, useRef, useEffect, useState } from "react";
import Player from "video.js/dist/types/player";

export type OverlayOptions = {
  id?: string;
  content: string;
  duration?: number; // in ms if want to autohide
};

export const useVideoJSOverlay = (
  players: Array<Player | null>,
) => {
  const overlaysRef = useRef<Map<string, HTMLElement[]>>(new Map());
  const overlayTransitionsRef = useRef<Map<string, Promise<void>>>(new Map());
  const styleElementRef = useRef<HTMLStyleElement | null>(null);

  // track active overlay ids to prevent race conditions
  const [activeOverlays] = useState(() => new Set<string>());

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

  const waitForOverlayTransition = useCallback(async (id: string) => {
    const pendingTransition = overlayTransitionsRef.current.get(id);
    if (pendingTransition) {
      await pendingTransition;
    }
  }, []);

  // hide overlay fn
  const hideOverlay = useCallback(
    async (id: string = "default") => {
      // wait for pending operations to complete
      await waitForOverlayTransition(id);

      const overlayTransition = new Promise<void>((resolve) => {
        const overlays = overlaysRef.current.get(id);
        if (!overlays) {
          resolve();
          return;
        }

        // remove visible class
        overlays.forEach((overlay) => {
          overlay.classList.remove("visible");
        });

        // wait for transition to complete before removing
        setTimeout(() => {
          overlays.forEach((overlay) => {
            if (overlay?.parentNode) {
              overlay.parentNode.removeChild(overlay);
            }
          });
          overlaysRef.current.delete(id);
          activeOverlays.delete(id);
          resolve();
        }, HIDE_OVERLAY_TRANSITION_MS);
      });

      overlayTransitionsRef.current.set(id, overlayTransition);
      await overlayTransition;
      overlayTransitionsRef.current.delete(id);
    },
    [activeOverlays, waitForOverlayTransition],
  );

  // show overlay fn
  const showOverlay = useCallback(
    async (options: OverlayOptions) => {
      const { id = "default", content, duration } = options;

      // wait for pending operations
      await waitForOverlayTransition(id);

      // eslint-disable-next-line no-async-promise-executor
      const showPromise = new Promise<void>(async (resolve) => {
        // hide existing overlay
        if (activeOverlays.has(id)) {
          await hideOverlay(id);
        }

        const newOverlays: HTMLElement[] = [];
        activeOverlays.add(id);

        players.forEach((p) => {
          const player = p;
          if (!player) return;

          // add new overlay
          const overlay = document.createElement("div");
          overlay.className = "video-js-overlay";
          overlay.id = `video-overlay-${id}`;
          overlay.innerHTML = content;

          player.el().appendChild(overlay);
          newOverlays.push(overlay);

          // force a reflow before adding the visible class
          overlay.getBoundingClientRect();

          requestAnimationFrame(() => {
            overlay.classList.add("visible");
          });
        });

        overlaysRef.current.set(id, newOverlays);

        if (duration) {
          setTimeout(() => {
            hideOverlay(id);
          }, duration);
        }

        resolve();
      });

      overlayTransitionsRef.current.set(id, showPromise);
      await showPromise;
      overlayTransitionsRef.current.delete(id);
    },
    [activeOverlays, players, hideOverlay, waitForOverlayTransition],
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
