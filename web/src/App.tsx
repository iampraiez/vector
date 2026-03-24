import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default App;
