import { useEffect, useRef, RefObject } from "react";

type CallbackFunction = () => void;

const useOutsideClick = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  callback: CallbackFunction,
  excludeRefs: RefObject<T>[] = [],
): void => {
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        if (ref.current && event.target instanceof Node) {
          const isOutside =
            !ref.current.contains(event.target) &&
            !excludeRefs.some(
              (excludeRef) =>
                excludeRef.current &&
                excludeRef.current.contains(event.target as Node),
            );

          if (isOutside) {
            callback();
          }
        }
      }, 0);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [ref, callback, excludeRefs]);
};

export default useOutsideClick;
