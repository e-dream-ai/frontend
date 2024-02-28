import ReactDOM from "react-dom/client";
import App from "./App";
import "./i18n";
import React from "react";
import Bugsnag from "@bugsnag/js";
import BugsnagPluginReact from "@bugsnag/plugin-react";
import BugsnagPerformance from "@bugsnag/browser-performance";
import { IS_PRODUCTION } from "@/constants/env.constantes";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

if (IS_PRODUCTION) {
  Bugsnag.start({
    apiKey: "7743b75d16aa1c3b8ef18de27aa35e30",
    plugins: [new BugsnagPluginReact()],
  });
  BugsnagPerformance.start({ apiKey: "7743b75d16aa1c3b8ef18de27aa35e30" });

  Bugsnag.notify(new Error("Test error"));

  const ErrorBoundary = Bugsnag.getPlugin("react")!.createErrorBoundary(React);

  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>,
  );
} else {
  root.render(<App />);
}
