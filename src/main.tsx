import ReactDOM from "react-dom/client";
import App from "./App";
import "./i18n";
import React from "react";
import Bugsnag from "@bugsnag/js";
import BugsnagPluginReact from "@bugsnag/plugin-react";
import BugsnagPerformance from "@bugsnag/browser-performance";
import { ErrorFallback } from "./components/shared/error-fallback/error-fallback";
import OfflineHandler from "./components/shared/offline-handler/offline-handler";
import { getReleaseStage } from "@/utils/bugsnag.util";
import ThemeProvider from "@/providers/theme.provider";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

Bugsnag.start({
  apiKey: import.meta.env.VITE_BUGSNAG_API_KEY,
  plugins: [new BugsnagPluginReact()],
  enabledReleaseStages: ["production", "development"],
  releaseStage: getReleaseStage(),
  onError: function (event) {
    if (event.originalError && event.originalError.stack) {
      const stack = event.originalError.stack?.toLowerCase();
      // Check for various types of browser extensions
      if (
        stack?.includes("chrome-extension://") ||
        stack?.includes("moz-extension://") ||
        stack?.includes("safari-extension://") ||
        stack?.includes("safari-web-extension://") ||
        stack?.includes("ms-browser-extension://") ||
        stack?.includes("edge-extension://")
      ) {
        // Don't send event if comes from an extension
        return false;
      }
    }

    return true;
  },
});
BugsnagPerformance.start({ apiKey: import.meta.env.VITE_BUGSNAG_API_KEY });

export const ErrorBoundary =
  Bugsnag.getPlugin("react")!.createErrorBoundary(React);

root.render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    {/* Theme Provider should be here since offline handler needs it */}
    <ThemeProvider>
      <OfflineHandler>
        <App />
      </OfflineHandler>
    </ThemeProvider>
  </ErrorBoundary>,
);
