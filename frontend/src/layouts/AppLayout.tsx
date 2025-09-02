import "./AppLayout.css";

import { Outlet } from "react-router";

import { Header } from "../components";

export function AppLayout() {
  return (
    <div className="container">
      <Header />
      <Outlet />
    </div>
  );
}
