import React from "react";
import ReactDOM from "react-dom/client";
import { RootApp } from "./App.tsx";

const root = document.getElementById("root") as HTMLElement;
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>,
);
