import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

window.addEventListener("vite:preloadError", (event) => {
  console.log("Preload error detected:", event);
  const result = confirm(
    "A new version of the app is available. Please reload to update.",
  );
  if (result) {
    window.location.reload();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
