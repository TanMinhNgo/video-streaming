import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppProviders } from "./AppProviders";
import "./index.css";

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkKey) {
  throw new Error("Thiếu VITE_CLERK_PUBLISHABLE_KEY trong cấu hình frontend.");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AppProviders clerkKey={clerkKey} />
    </BrowserRouter>
  </StrictMode>,
);
