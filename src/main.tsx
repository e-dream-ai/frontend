import ReactDOM from "react-dom/client";
import App from "./App";
import "./i18n";
import React from 'react'
import Bugsnag from '@bugsnag/js'
import BugsnagPluginReact from '@bugsnag/plugin-react'
import BugsnagPerformance from '@bugsnag/browser-performance'

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

if (import.meta.env.PROD) {
    Bugsnag.start({
      apiKey: '563a8a8c8ca5c81400b1a137177abcab',
      plugins: [new BugsnagPluginReact()]
    })
    BugsnagPerformance.start({ apiKey: '563a8a8c8ca5c81400b1a137177abcab' })

    const ErrorBoundary = Bugsnag.getPlugin('react')
      .createErrorBoundary(React)

    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
} else {
  root.render(
    <App />
  );
}
