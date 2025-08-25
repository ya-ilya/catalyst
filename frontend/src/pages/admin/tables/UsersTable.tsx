import { AxiosError } from "axios";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Panel } from "primereact/panel";
import { useCallback, useEffect, useState } from "react";

import * as api from "../../../api";
import { Session, useToastContext } from "../../../contexts";

type UsersTableProps = {
  adminController?: api.AdminController;
  session: Session;
};

export function UsersTable({ adminController, session }: UsersTableProps) {
  const [users, setUsers] = useState<api.User[]>([]);
  const [loading, setLoading] = useState(false);

  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);

  const [showToast] = useToastContext();

  const fetchUsers = useCallback(async () => {
    if (!adminController) return;

    setLoading(true);

    try {
      const users = await adminController.getUsers();
      setUsers(users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      showToast({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch users.",
      });
    } finally {
      setLoading(false);
    }
  }, [adminController]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = useCallback(async () => {
    if (!adminController) return;

    if (username.length < 4 || username.length > 32) {
      showToast({
        severity: "error",
        summary: "Error",
        detail: "Invalid format for username.",
      });
      return;
    }

    try {
      const createdUser = await adminController.createUser({
        username: username,
      });

      setTemporaryPassword(createdUser.temporaryPassword);
      await fetchUsers();
    } catch (error) {
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
    } finally {
      setIsDialogVisible(false);
    }
  }, [adminController, username, fetchUsers]);

  const handleDeleteUser = useCallback(
    async (userId: string) => {
      if (!adminController) return;

      if (window.confirm("Are you sure you want to delete this user?")) {
        try {
          await adminController.deleteUser(userId);
          await fetchUsers();
        } catch (error) {
          console.error("Failed to delete user:", error);
          showToast({
            severity: "error",
            summary: "Error",
            detail: "Failed to delete user.",
          });
        }
      }
    },
    [adminController, fetchUsers]
  );

  const actionsTemplate = useCallback(
    (user: api.User) => {
      return (
        <Button
          icon="pi pi-trash"
          className="p-button-danger p-button-sm"
          onClick={() => handleDeleteUser(user.id)}
          disabled={user.id === session?.user.id}
          rounded
          text
        />
      );
    },
    [handleDeleteUser, session]
  );

  const tableHeader = (
    <div className="admin-table-header">
      <span className="title">User Management</span>
      <div className="actions">
        <Button
          label="Create User"
          icon="pi pi-user-plus"
          className="p-button-sm"
          onClick={() => {
            setUsername("");
            setTemporaryPassword(null);
            setIsDialogVisible(true);
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

  const tableFooter = `In total there are ${users ? users.length : 0} users.`;

  const dialogFooter = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={() => setIsDialogVisible(false)}
        className="p-button-text"
      />
      <Button
        label="Create"
        icon="pi pi-check"
        onClick={handleCreateUser}
      />
    </div>
  );

  return (
    <>
      <DataTable
        header={tableHeader}
        footer={tableFooter}
        value={users}
        loading={loading}
        className="admin-table"
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
          body={actionsTemplate}
        />
      </DataTable>

      <Dialog
        header="Create New User"
        visible={isDialogVisible}
        style={{ width: "400px" }}
        footer={dialogFooter}
        onHide={() => setIsDialogVisible(false)}
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
            <div
              className="p-field"
              style={{ marginTop: 3 }}
            >
              <Panel header="Temporary Password">
                <p className="m-0 p-0 text-break">{temporaryPassword}</p>
              </Panel>
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
}
