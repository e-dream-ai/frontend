import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export const useScrollRestoration = (isReady: boolean) => {
  const { key } = useLocation();
  const storageKey = `scroll-pos:${key}`;
  const restoredRef = useRef(false);
  const latestScrollYRef = useRef(0);

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      latestScrollYRef.current = window.scrollY;
    };
    const persist = () => {
      sessionStorage.setItem(storageKey, String(latestScrollYRef.current));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", persist);
    return () => {
      persist();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", persist);
    };
  }, [storageKey]);

  useLayoutEffect(() => {
    if (restoredRef.current || !isReady) return;
    restoredRef.current = true;

    const saved = sessionStorage.getItem(storageKey);
    const target = saved == null ? 0 : Number(saved);
    latestScrollYRef.current = target;
    const apply = () => window.scrollTo(0, target);

    apply();
    let frame = requestAnimationFrame(() => {
      apply();
      frame = requestAnimationFrame(apply);
    });

    return () => cancelAnimationFrame(frame);
  }, [isReady, storageKey]);
};
