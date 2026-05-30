import { createRoot } from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import App from "./App";
import i18n from "./i18n";
import { captureError } from "./hooks/use-analytics";
import "./index.css";

// Global error monitoring (beyond the React ErrorBoundary).
window.addEventListener("error", (e) => captureError(e.error ?? e.message, { kind: "window.error" }));
window.addEventListener("unhandledrejection", (e) =>
  captureError(e.reason, { kind: "unhandledrejection" })
);

createRoot(document.getElementById("root")!).render(
  <I18nextProvider i18n={i18n}>
    <App />
  </I18nextProvider>
);
