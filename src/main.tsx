import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

declare global {
  interface Window {
    __SKELETON_CLEANUP__: () => void;
  }
}

createRoot(document.getElementById("root")!).render(<App />);

// Cleanup skeleton after React takes over
if (typeof window.__SKELETON_CLEANUP__ === 'function') {
  window.__SKELETON_CLEANUP__();
}
