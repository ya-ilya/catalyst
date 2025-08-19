import "./Admin.css";

import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Panel } from "primereact/panel";
import { Toast } from "primereact/toast";
import { useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router";

import * as api from "../../api";
import { Header } from "../../components";
import { useToast } from "../../hooks";

export function Admin() {
  const adminController = api.useAdminController();

  const [users, setUsers] = useState<api.User[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreateUserDialogVisible, setIsCreateUserDialogVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);

  const [session] = api.useAuthenticationContext();

  const [toast, showToast] = useToast();

  const navigate = useNavigate();

  useEffect(() => {
    if (session && !session.user.isAdmin) {
      navigate("/");
    }
  }, [session, navigate]);

  const fetchUsers = () => {
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
  };

  useEffect(() => {
    fetchUsers();
  }, [adminController]);

  const handleCreateUser = useCallback(() => {
    adminController
      ?.createUser({ username: username })
      .then((createdUser) => {
        setTemporaryPassword(createdUser.temporaryPassword);
        fetchUsers();
      })
      .catch((error) => {
        console.error("Failed to create user:", error);
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

  const actionBodyTemplate = (rowData: api.User) => {
    return (
      <Button
        icon="pi pi-trash"
        className="p-button-danger p-button-sm"
        rounded
        text
        onClick={() => handleDeleteUser(rowData.id)}
        disabled={rowData.id === session?.user.id}
      />
    );
  };

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
        to="/sign-in"
        replace
      />
    );
  }

  return (
    <div className="admin-container">
      <Toast ref={toast} />
      <Header />
      <div className="admin-content">
        <div className="p-d-flex p-jc-between p-ai-center w-full mb-3">
          <h2 className="m-0">User Management</h2>
          <Button
            label="Create User"
            icon="pi pi-user-plus"
            className="p-button-sm mt-2"
            onClick={() => {
              setUsername("");
              setTemporaryPassword(null);
              setIsCreateUserDialogVisible(true);
            }}
          />
        </div>
        <DataTable
          value={users}
          loading={loading}
          responsiveLayout="scroll"
          className="admin-table"
        >
          <Column
            field="id"
            header="ID"
            body={(rowData) => rowData.id.slice(0, 8)}
          />
          <Column
            field="username"
            header="Username"
          />
          <Column
            field="isAdmin"
            header="Admin"
            body={(rowData) => (rowData.isAdmin ? "Yes" : "No")}
          />
          <Column
            field="createdAt"
            header="Joined"
            body={(rowData) => new Date(rowData.createdAt).toLocaleDateString()}
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
              onChange={(e) => setUsername(e.target.value)}
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
