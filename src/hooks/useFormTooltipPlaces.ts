import { useEffect, useMemo, useState } from "react";
import { PlacesType } from "react-tooltip";
import { useWindowSize } from "./useWindowSize";
import { DEVICES } from "@/constants/devices.constants";

export const useTooltipPlaces = () => {
  const [places, setPlaces] = useState<{
    left: PlacesType;
    right: PlacesType;
  }>({
    // Default for mobile
    left: "right",
    right: "right",
  });

  const { width } = useWindowSize();

  // get base font size
  const baseFontSize = useMemo(
    () => parseFloat(getComputedStyle(document.documentElement).fontSize),
    [],
  );

  // convert breakpoint to pixels
  const breakpoint = useMemo(
    () => parseFloat(DEVICES.TABLET) * baseFontSize,
    [baseFontSize],
  );

  useEffect(() => {
    const handleResize = () => {
      if ((width ?? 0) >= breakpoint) {
        // on desktop:
        //      left components -> left tooltip
        //      right components -> right tooltip
        setPlaces({
          left: "left",
          right: "right",
        });
      } else {
        // on mobile:
        //      all tooltips go top
        setPlaces({
          left: "top",
          right: "top",
        });
      }
    };

    handleResize();
  }, [width, breakpoint]);

  return places;
};
