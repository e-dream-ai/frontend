// src/components/pages/studio/studio.layout.tsx
import { useEffect } from "react";
import ReactGA from "react-ga4";
import Providers, { withProviders } from "@/providers/providers";
import { StudioPage } from "./studio.page";

const StudioLayout = () => {
  useEffect(() => {
    ReactGA.send({
      hitType: "pageview",
      page: window.location.pathname + window.location.search,
    });
  }, []);

  return <StudioPage />;
};

export const StudioLayoutWithProviders = withProviders(...Providers)(
  StudioLayout,
);
