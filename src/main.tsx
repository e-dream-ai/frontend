import { enableDragDropTouch } from "@dragdroptouch/drag-drop-touch";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./i18n";
import React from "react";
import ReactGA from "react-ga4";
import Bugsnag from "@bugsnag/js";
import BugsnagPluginReact from "@bugsnag/plugin-react";
import BugsnagPerformance from "@bugsnag/browser-performance";
import { ErrorFallback } from "./components/shared/error-fallback/error-fallback";
import OfflineHandler from "./components/shared/offline-handler/offline-handler";
import { getReleaseStage } from "@/utils/bugsnag.util";
import ThemeProvider from "@/providers/theme.provider";
import { IS_DEV } from "./constants/env.constantes";

enableDragDropTouch(undefined, undefined, {
  isPressHoldMode: true,
  pressHoldDelayMS: 300,
  allowDragScroll: true,
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

const BUGSNAG_API_KEY = import.meta.env.VITE_BUGSNAG_API_KEY;
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

// Matches the props the Bugsnag React error boundary passes to its fallback,
// so both the real boundary and the passthrough share one type.
type BoundaryFallbackProps = {
  error: Error;
  info: React.ErrorInfo;
  clearError: () => void;
};
type AppErrorBoundary = React.ComponentType<{
  children?: React.ReactNode;
  FallbackComponent?: React.ComponentType<BoundaryFallbackProps>;
}>;

// Passthrough used when Bugsnag can't start (missing key on local/preview).
const PassthroughBoundary: AppErrorBoundary = ({ children }) => <>{children}</>;

/**
 * Initialize Bugsnag.
 *
 * Guarded: with no API key (local/preview builds) Bugsnag.start() throws, and
 * Bugsnag.getPlugin("react")! would then throw again — either one white-screens
 * the entire app. When the key is absent we skip init and fall back to a
 * passthrough error boundary so the app still boots.
 */
export let ErrorBoundary: AppErrorBoundary = PassthroughBoundary;

if (BUGSNAG_API_KEY) {
  Bugsnag.start({
    apiKey: BUGSNAG_API_KEY,
    plugins: [new BugsnagPluginReact()],
    enabledReleaseStages: ["production", "development"],
    releaseStage: getReleaseStage(),
    appVersion: import.meta.env.VITE_COMMIT_REF,
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

  BugsnagPerformance.start({ apiKey: BUGSNAG_API_KEY });

  const reactPlugin = Bugsnag.getPlugin("react");
  if (reactPlugin) {
    ErrorBoundary = reactPlugin.createErrorBoundary(React);
  }
} else {
  // eslint-disable-next-line no-console
  console.warn("VITE_BUGSNAG_API_KEY not set — Bugsnag disabled.");
}

/**
 * Initialize GA4
 *
 * using react-ga4 since is the latest package for Google Analytics
 *  recommended keep up to date with new Google releases and changes for GA
 * https://www.npmjs.com/package/react-ga4
 *
 * Guarded for the same reason as Bugsnag: initialize() throws on a missing id.
 */
if (GA_MEASUREMENT_ID) {
  ReactGA.initialize(GA_MEASUREMENT_ID, {
    gaOptions: {
      debug: IS_DEV,
      titleCase: false,
    },
  });
} else {
  // eslint-disable-next-line no-console
  console.warn("VITE_GA_MEASUREMENT_ID not set — Google Analytics disabled.");
}

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
