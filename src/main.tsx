import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { NotificationsProvider } from "./components";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <NotificationsProvider>
      <App />
    </NotificationsProvider>
  </React.StrictMode>
);
