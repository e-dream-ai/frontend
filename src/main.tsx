import ReactDOM from "react-dom/client";
import App from "./App";
import "./i18n";
import React from "react";
import Bugsnag from "@bugsnag/js";
import BugsnagPluginReact from "@bugsnag/plugin-react";
import BugsnagPerformance from "@bugsnag/browser-performance";
import { MODE } from "@/constants/env.constantes";
import { ErrorFallback } from "./components/shared/error-fallback/error-fallback";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

Bugsnag.start({
  apiKey: "7743b75d16aa1c3b8ef18de27aa35e30",
  plugins: [new BugsnagPluginReact()],
  enabledReleaseStages: ["prod", "stage"],
  releaseStage: MODE,
});
BugsnagPerformance.start({ apiKey: "7743b75d16aa1c3b8ef18de27aa35e30" });

export const ErrorBoundary =
  Bugsnag.getPlugin("react")!.createErrorBoundary(React);

root.render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
  </ErrorBoundary>,
);
