import "./Admin.css";

import { AxiosError } from "axios";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Panel } from "primereact/panel";
import { useCallback, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";

import * as api from "../../api";
import { Header } from "../../components";
import { useAuthenticationContext, useToastContext } from "../../contexts";

export function Admin() {
  const adminController = api.useAdminController();

  const [users, setUsers] = useState<api.User[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreateUserDialogVisible, setIsCreateUserDialogVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);

  const [session] = useAuthenticationContext();
  const [showToast] = useToastContext();

  const location = useLocation();

  const fetchUsers = useCallback(() => {
    setLoading(true);

    adminController
      ?.getUsers()
      .then((users) => {
        setUsers(users);
      })
      .catch((error) => {
        console.error("Failed to fetch users:", error);
        showToast({
          severity: "error",
          summary: "Error",
          detail: "Failed to fetch users.",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [adminController, showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = useCallback(() => {
    adminController
      ?.createUser({ username: username })
      .then((createdUser) => {
        setTemporaryPassword(createdUser.temporaryPassword);
        fetchUsers();
      })
      .catch((error) => {
        console.error("Failed to create user:", error);

        if (error instanceof AxiosError && error.response) {
          if (error.status === 400) {
            showToast({
              severity: "error",
              summary: "Error",
              detail: "Invalid format for username.",
            });
            return;
          } else if (error.status === 409) {
            showToast({
              severity: "error",
              summary: "Error",
              detail: "User with same name already exists.",
            });
            return;
          }
        }

        showToast({
          severity: "error",
          summary: "Error",
          detail: "Failed to create user.",
        });
      });
  }, [adminController, username]);

  const handleDeleteUser = useCallback(
    (userId: string) => {
      if (window.confirm("Are you sure you want to delete this user?")) {
        adminController
          ?.deleteUser(userId)
          .then(() => {
            setUsers(users.filter((user) => user.id !== userId));
          })
          .catch((error) => {
            console.error("Failed to delete user:", error);
            showToast({
              severity: "error",
              summary: "Error",
              detail: "Failed to delete user.",
            });
          });
      }
    },
    [adminController, users]
  );

  const actionBodyTemplate = (user: api.User) => {
    return (
      <Button
        icon="pi pi-trash"
        className="p-button-danger p-button-sm"
        rounded
        text
        onClick={() => handleDeleteUser(user.id)}
        disabled={user.id === session?.user.id}
      />
    );
  };

  const usersTableHeader = (
    <div className="users-table-header">
      <span className="title">User Management</span>
      <div className="actions">
        <Button
          label="Create User"
          icon="pi pi-user-plus"
          className="p-button-sm"
          onClick={() => {
            setUsername("");
            setTemporaryPassword(null);
            setIsCreateUserDialogVisible(true);
          }}
          outlined
        />
        <Button
          icon="pi pi-refresh"
          onClick={fetchUsers}
          rounded
          raised
        />
      </div>
    </div>
  );

  const usersTableFooter = `In total there are ${users ? users.length : 0} users.`;

  const createUserDialogFooter = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={() => setIsCreateUserDialogVisible(false)}
        className="p-button-text"
      />
      <Button
        label="Create"
        icon="pi pi-check"
        onClick={handleCreateUser}
      />
    </div>
  );

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
    <div className="admin-container">
      <Header />
      <div className="admin-content">
        <DataTable
          header={usersTableHeader}
          footer={usersTableFooter}
          value={users}
          loading={loading}
          className="users-table"
          scrollable
          scrollHeight="100%"
        >
          <Column
            field="id"
            header="ID"
            body={(user: api.User) => user.id.slice(0, 8)}
          />
          <Column
            field="username"
            header="Username"
          />
          <Column
            field="isAdmin"
            header="Admin"
            body={(user: api.User) => (user.isAdmin ? "Yes" : "No")}
          />
          <Column
            field="createdAt"
            header="Joined"
            body={(user: api.User) => new Date(user.createdAt).toLocaleDateString()}
          />
          <Column
            header="Actions"
            body={actionBodyTemplate}
          />
        </DataTable>
      </div>

      <Dialog
        header="Create New User"
        visible={isCreateUserDialogVisible}
        style={{ width: "400px" }}
        footer={createUserDialogFooter}
        onHide={() => setIsCreateUserDialogVisible(false)}
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="new-username">Username</label>
            <InputText
              id="new-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>
          {temporaryPassword && (
            <div className="mt-3">
              <Panel header="Temporary Password">
                <p className="m-0 p-0 text-break">{temporaryPassword}</p>
              </Panel>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}
