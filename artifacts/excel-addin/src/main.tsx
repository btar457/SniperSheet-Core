import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setStaticHeader } from "@workspace/api-client-react";

declare const Office: any;

// ── App authentication token ─────────────────────────────────────────────────
// Injected at build time by Vite from the VITE_APP_TOKEN env var.
// In dev mode: Vite exposes VITE_* vars; in production the value is baked in.
const APP_TOKEN = (import.meta.env.VITE_APP_TOKEN as string | undefined) ?? "";
if (APP_TOKEN) {
  setStaticHeader("X-App-Token", APP_TOKEN);
}

function renderApp() {
  createRoot(document.getElementById("root")!).render(<App />);
}

if (typeof Office !== "undefined" && Office.onReady) {
  Office.onReady(() => {
    renderApp();
  });
} else {
  window.addEventListener("load", () => {
    if (typeof Office !== "undefined" && Office.onReady) {
      Office.onReady(() => renderApp());
    } else {
      renderApp();
    }
  });
}
