import "./Admin.css";

import { ConfirmDialog } from "primereact/confirmdialog";
import { Navigate, useLocation } from "react-router";

import * as api from "../../api";
import { useAuthenticationContext } from "../../contexts";
import { CapesTable } from "./tables/CapesTable";
import { UsersTable } from "./tables/UsersTable";

export function Admin() {
  const adminController = api.useAdminController();

  const [session] = useAuthenticationContext();

  const location = useLocation();

  if (!session) {
    return (
      <Navigate
        to={`/sign-in?redirectTo=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  if (!session.user.isAdmin) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return (
    <>
      <div className="admin-content">
        <UsersTable
          adminController={adminController}
          session={session}
        />
        <CapesTable adminController={adminController} />
      </div>
      <ConfirmDialog />
    </>
  );
}
