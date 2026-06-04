// src/components/pages/studio/studio.layout.tsx
import { useEffect } from "react";
import ReactGA from "react-ga4";
import { StudioPage } from "./studio.page";

export const StudioLayout = () => {
  useEffect(() => {
    ReactGA.send({
      hitType: "pageview",
      page: window.location.pathname + window.location.search,
    });
  }, []);

  return <StudioPage />;
};
