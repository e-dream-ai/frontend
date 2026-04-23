import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface ScrollToHashElementProps {
  behavior?: ScrollBehavior;
  inline?: ScrollLogicalPosition;
  block?: ScrollLogicalPosition;
}

const ScrollToHashElement = ({
  behavior = "auto",
  inline = "nearest",
  block = "start",
}: ScrollToHashElementProps): null => {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (!hash) return;

    const id = hash.slice(1);

    const scroll = () => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior, inline, block });
      }
    };

    scroll();
    const timer = setTimeout(scroll, 100);
    return () => clearTimeout(timer);
  }, [hash, pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};

export default ScrollToHashElement;
