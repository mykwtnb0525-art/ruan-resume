import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import { archivePaperTexture } from "./utils/assetUrl.js";
import "./styles.css";

document.documentElement.style.setProperty(
  "--asset-archive-paper",
  archivePaperTexture,
);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
