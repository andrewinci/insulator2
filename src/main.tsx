import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { App } from "./App";
import { NotificationsProvider } from "./components";


const router = createBrowserRouter([
  {
    path: "*",
    element: <App />,
    errorElement: <App/> //todo: handle 404/500?
  }
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <NotificationsProvider>
      <RouterProvider 
        router={router} />
    </NotificationsProvider>
  </React.StrictMode>
);
