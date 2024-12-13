import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import "./index.css";
import App from "./App.tsx";
import GoogleLogin from "./components/GoogleLogin.tsx";
import Dashboard from "./components/Dashboard.tsx";
import NotFound from "./components/NotFound.tsx";
import PrivateRoutes from "./components/PrivateRoutes.tsx";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <GoogleLogin />,
  },
  {
    path: "/",
    element: <Navigate to="/login" />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
  {
    path: "",
    element: <PrivateRoutes />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="911606192600-aq68pbufifuj844qa6r7mpeigs3ir111.apps.googleusercontent.com">
      <App>
        <RouterProvider router={router} />
      </App>
    </GoogleOAuthProvider>
  </StrictMode>
);
