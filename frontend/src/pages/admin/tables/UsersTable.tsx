import { AxiosError } from "axios";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { confirmDialog } from "primereact/confirmdialog";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Panel } from "primereact/panel";
import { useCallback, useEffect, useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";

import * as api from "../../../api";
import { Session, useToastContext } from "../../../contexts";
import { queryClient } from "../../../query-config";

type UsersTableProps = {
  adminController?: api.AdminController;
  session: Session;
};

const MIN_USERNAME_LENGTH = 4;
const MAX_USERNAME_LENGTH = 32;
const MAX_USERS_PER_PAGE = 5;

export function UsersTable({ adminController, session }: UsersTableProps) {
  const [page, setPage] = useState(0);

  const { data, isFetching, error } = useQuery({
    queryKey: ["tables/users", page],
    queryFn: async () => {
      if (!adminController) return { users: [], total: 0 };
      const response = await adminController.getUsers(MAX_USERS_PER_PAGE, page);
      return response;
    },
    enabled: !!adminController,
    placeholderData: (previousData) => previousData,
  });

  const users = data?.users ?? [];
  const total = data?.total ?? 0;

  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);

  const [showToast] = useToastContext();

  useEffect(() => {
    if (error) {
      console.error("Failed to fetch capes:", error);
      showToast({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch capes.",
      });
    }
  }, [error]);

  const createUserMutation = useMutation({
    mutationFn: async (newUsername: string) => {
      return await adminController!.createUser({ username: newUsername });
    },
    onSuccess: (data) => {
      setTemporaryPassword(data.temporaryPassword);
      queryClient.invalidateQueries({ queryKey: ["tables/users"] });
      showToast({
        severity: "success",
        summary: "User Created",
        detail: "User has been successfully created.",
      });
      setIsDialogVisible(false);
    },
    onError: (error) => {
      console.error("Failed to create user:", error);
      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 400) {
          showToast({ severity: "error", summary: "Error", detail: "Invalid format for username." });
          return;
        } else if (error.response.status === 409) {
          showToast({
            severity: "error",
            summary: "Error",
            detail: "User with the same name already exists.",
          });
          return;
        }
      }
      showToast({ severity: "error", summary: "Error", detail: "Failed to create user." });
      setIsDialogVisible(false);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (user: api.User) => {
      await adminController!.deleteUser(user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables/users"] });
      showToast({
        severity: "success",
        summary: "User Deleted",
        detail: "User has been successfully deleted.",
      });
    },
    onError: () => {
      showToast({ severity: "error", summary: "Error", detail: "Failed to delete user." });
    },
  });

  const handleCreateUser = useCallback(() => {
    if (!adminController) return;
    createUserMutation.mutate(username);
  }, [adminController, createUserMutation, username]);

  const handleDeleteUser = useCallback(
    (user: api.User) => {
      if (!adminController) return;
      deleteUserMutation.mutate(user);
    },
    [adminController, deleteUserMutation]
  );

  const confirmDeleteUser = useCallback(
    (user: api.User) => {
      confirmDialog({
        message: "Are you sure you want to delete this user?",
        header: "Delete Confirmation",
        icon: "pi pi-info-circle",
        defaultFocus: "reject",
        acceptClassName: "p-button-danger",
        accept: () => handleDeleteUser(user),
      });
    },
    [handleDeleteUser]
  );

  const actionsTemplate = useCallback(
    (user: api.User) => {
      return (
        <Button
          icon="pi pi-trash"
          className="p-button-danger p-button-sm"
          onClick={() => confirmDeleteUser(user)}
          disabled={user.id === session?.user.id}
          rounded
          text
        />
      );
    },
    [confirmDeleteUser, session]
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
          onClick={() => queryClient.invalidateQueries({ queryKey: ["tables/users"] })}
          rounded
          raised
        />
      </div>
    </div>
  );

  const dialogFooter = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={() => setIsDialogVisible(false)}
        text
      />
      <Button
        label="Create"
        icon="pi pi-check"
        onClick={handleCreateUser}
        disabled={username.length < MIN_USERNAME_LENGTH || username.length > MAX_USERNAME_LENGTH}
      />
    </div>
  );

  return (
    <>
      <DataTable
        header={tableHeader}
        value={users}
        loading={isFetching}
        className="admin-table"
        scrollable
        scrollHeight="100%"
        paginator
        lazy
        first={page}
        rows={MAX_USERS_PER_PAGE}
        totalRecords={total}
        onPage={(event) => {
          setPage(event.first);
        }}
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
        className="admin-dialog"
        header="Create New User"
        visible={isDialogVisible}
        footer={dialogFooter}
        onHide={() => setIsDialogVisible(false)}
      >
        <div className="p-fluid">
          <div className="p-field">
            <FloatLabel>
              <InputText
                id="new-username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                invalid={username.length < MIN_USERNAME_LENGTH || username.length > MAX_USERNAME_LENGTH}
              />
              <label htmlFor="new-username">Username</label>
            </FloatLabel>
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
