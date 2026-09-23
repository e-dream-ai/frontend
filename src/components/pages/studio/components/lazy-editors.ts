import { lazy } from "react";
import type { StudioMode } from "@/types/flow.types";

const importFlowBuilder = () => import("./flow-builder");
const importUprezApp = () => import("./uprez-app");
const importImagesTab = () => import("./images-tab");
const importActionsTab = () => import("./actions-tab");
const importGenerateTab = () => import("./generate-tab");

export const FlowBuilder = lazy(() =>
  importFlowBuilder().then((m) => ({ default: m.FlowBuilder })),
);
export const UprezApp = lazy(() =>
  importUprezApp().then((m) => ({ default: m.UprezApp })),
);
export const ImagesTab = lazy(() =>
  importImagesTab().then((m) => ({ default: m.ImagesTab })),
);
export const ActionsTab = lazy(() =>
  importActionsTab().then((m) => ({ default: m.ActionsTab })),
);
export const GenerateTab = lazy(() =>
  importGenerateTab().then((m) => ({ default: m.GenerateTab })),
);

const EDITOR_IMPORTS: Record<StudioMode, () => Promise<unknown>> = {
  flow: importFlowBuilder,
  action: importImagesTab,
  uprez: importUprezApp,
};

export const preloadEditor = (mode: StudioMode) => {
  void EDITOR_IMPORTS[mode]?.();
};
