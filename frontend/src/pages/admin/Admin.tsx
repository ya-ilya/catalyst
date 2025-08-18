import "./Admin.css";

import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Panel } from "primereact/panel";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router";

import * as api from "../../api";
import { Header } from "../../components";

export function Admin() {
  const adminController = api.useAdminController();

  const [users, setUsers] = useState<api.User[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreateUserDialogVisible, setIsCreateUserDialogVisible] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newTemporaryPassword, setTemporaryPassword] = useState<string | null>(null);

  const [session] = api.useAuthenticationContext();

  const navigate = useNavigate();

  useEffect(() => {
    if (session && !session.user.isAdmin) {
      navigate("/");
    }
  }, [session, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await adminController?.getUsers();
      if (fetchedUsers) {
        setUsers((await adminController?.getUsers()) || []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    try {
      if (newUsername.length === 0) {
        return;
      }
      const createdUser = await adminController?.createUser({ username: newUsername });
      if (createdUser) {
        setTemporaryPassword(createdUser.temporaryPassword);
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await adminController?.deleteUser(userId);
        setUsers(users.filter((u) => u.id !== userId));
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  const actionBodyTemplate = (rowData: api.User) => {
    return (
      <Button
        icon="pi pi-trash"
        className="p-button-danger p-button-sm"
        rounded
        text
        onClick={() => handleDeleteUser(rowData.id)}
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
      <Header />
      <div className="admin-content">
        <div className="p-d-flex p-jc-between p-ai-center w-full mb-3">
          <h2 className="m-0">User Management</h2>
          <Button
            label="Create User"
            icon="pi pi-user-plus"
            className="p-button-sm mb-5"
            onClick={() => {
              setNewUsername("");
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
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
          </div>
          {newTemporaryPassword && (
            <div className="mt-3">
              <Panel header="Temporary Password">
                <p className="m-0 p-0 text-break">{newTemporaryPassword}</p>
              </Panel>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}
