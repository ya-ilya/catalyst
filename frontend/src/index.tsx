import "./index.css";
import "primeicons/primeicons.css";

import { PrimeReactProvider } from "primereact/api";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";

import { QueryClientProvider } from "@tanstack/react-query";

import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/ToastContext";
import { Account, Admin, App, Capes, Configs, SignIn } from "./pages";
import { queryClient } from "./query-config";
import { AuthenticationRoute } from "./routes";

export * from "./axios-config";
export * from "./i18n-config";
export * from "./query-config";

const router = createBrowserRouter([
  {
    element: <AuthenticationRoute />,
    children: [
      {
        path: "/",
        element: <App />,
      },
      {
        path: "/capes",
        element: <Capes />,
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
    <QueryClientProvider client={queryClient}>
      <PrimeReactProvider>
        <ThemeProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </ThemeProvider>
      </PrimeReactProvider>
    </QueryClientProvider>
  </StrictMode>
);
