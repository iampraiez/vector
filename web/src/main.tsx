import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

window.addEventListener("vite:preloadError", (event) => {
  console.log("Preload error detected:", event);
  // Avoid infinite reload loop by checking if we reloaded in the last 5 seconds
  const lastReload = sessionStorage.getItem("last-preload-reload");
  const now = Date.now();
  if (!lastReload || now - parseInt(lastReload) > 5000) {
    sessionStorage.setItem("last-preload-reload", now.toString());
    window.location.reload();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
