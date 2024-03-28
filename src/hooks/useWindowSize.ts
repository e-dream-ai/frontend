import { useState, useEffect, useCallback } from "react";

export const useWindowSize = () => {
  // Initialize state with undefined width/height
  const [size, setSize] = useState<{ width?: number; height?: number }>({
    width: undefined,
    height: undefined,
  });

  // Handler to call on window resize
  const handleResize = useCallback(() => {
    // Set window width/height to state
    setSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  useEffect(() => {
    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]); // Empty array ensures that effect runs only on mount and unmount

  return size;
};
