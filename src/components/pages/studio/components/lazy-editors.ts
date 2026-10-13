import { lazy } from "react";
import type { StudioMode } from "@/types/flow.types";

const importFlowBuilder = () => import("./flow-builder");
const importEnhanceApp = () => import("./enhance-app");
const importDeforumApp = () => import("./deforum-app");
const importImagesTab = () => import("./images-tab");
const importActionsTab = () => import("./actions-tab");
const importGenerateTab = () => import("./generate-tab");

export const FlowBuilder = lazy(() =>
  importFlowBuilder().then((m) => ({ default: m.FlowBuilder })),
);
export const EnhanceApp = lazy(() =>
  importEnhanceApp().then((m) => ({ default: m.EnhanceApp })),
);
export const DeforumApp = lazy(() =>
  importDeforumApp().then((m) => ({ default: m.DeforumApp })),
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
  enhance: importEnhanceApp,
  deforum: importDeforumApp,
};

export const preloadEditor = (mode: StudioMode) => {
  void EDITOR_IMPORTS[mode]?.();
};
