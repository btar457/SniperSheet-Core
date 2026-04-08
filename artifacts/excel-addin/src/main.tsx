import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

declare const Office: any;

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
