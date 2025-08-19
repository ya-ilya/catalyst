import "./index.css";
import "primeflex/primeflex.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.css";
import "primeicons/primeicons.css";

import { PrimeReactProvider } from "primereact/api";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";

import { AuthenticationRoute } from "./api";
import { Account, Admin, App, Configs, SignIn } from "./pages";

export * from "./axios-config";
export * from "./i18n-config";

const router = createBrowserRouter([
  {
    element: <AuthenticationRoute />,
    children: [
      {
        path: "/",
        element: <App />,
      },
      {
        path: "/configs",
        element: <Configs />,
      },
      {
        path: "/admin",
        element: <Admin />,
      },
      {
        path: "/account",
        element: <Account />,
      },
      {
        path: "/sign-in",
        element: <SignIn />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PrimeReactProvider>
      <RouterProvider router={router} />
    </PrimeReactProvider>
  </StrictMode>
);
