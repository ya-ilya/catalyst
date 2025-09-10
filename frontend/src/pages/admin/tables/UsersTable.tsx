import { AxiosError } from "axios";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { confirmDialog } from "primereact/confirmdialog";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { FloatLabel } from "primereact/floatlabel";
import { useDebounce } from "primereact/hooks";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Panel } from "primereact/panel";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useMutation, useQuery } from "@tanstack/react-query";

import { queryClient } from "../../..";
import * as api from "../../../api";
import { Session, useToastContext } from "../../../contexts";

type UsersTableProps = {
  adminController?: api.AdminController;
  session: Session;
};

const MIN_USERNAME_LENGTH = 4;
const MAX_USERNAME_LENGTH = 32;
const MAX_USERS_PER_PAGE = 5;

export function UsersTable({ adminController, session }: UsersTableProps) {
  const { t } = useTranslation("admin");

  const SORT_OPTIONS = [
    { label: t("usersTable.sortBy.createdAt"), value: "createdAt" },
    { label: t("usersTable.sortBy.username"), value: "username" },
  ];

  const [filterValue, debouncedFilterValue, setFilterValue] = useDebounce("", 400);
  const [sortValue, setSortValue] = useState<"createdAt" | "username">("createdAt");
  const [page, setPage] = useState(0);

  const { data, isFetching, error } = useQuery({
    queryKey: ["tables/users", page, debouncedFilterValue, sortValue],
    queryFn: async () => {
      if (!adminController) return { users: [], total: 0 };
      const response = await adminController.getUsers(
        MAX_USERS_PER_PAGE,
        page,
        debouncedFilterValue,
        sortValue
      );
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
      console.error("Failed to fetch users:", error);
      showToast({
        severity: "error",
        summary: t("toasts.errorSummary"),
        detail: t("toasts.details.failedToFetchUsers"),
      });
    }
  }, [error, t, showToast]);

  const createUserMutation = useMutation({
    mutationFn: async (newUsername: string) => {
      return await adminController!.createUser({ username: newUsername });
    },
    onSuccess: (data) => {
      setTemporaryPassword(data.temporaryPassword);
      queryClient.invalidateQueries({ queryKey: ["tables/users"] });
      showToast({
        severity: "success",
        summary: t("toasts.successSummary.userCreated"),
        detail: t("toasts.details.userCreated"),
      });
    },
    onError: (error) => {
      console.error("Failed to create user:", error);
      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 400) {
          showToast({
            severity: "error",
            summary: t("toasts.errorSummary"),
            detail: t("toasts.details.invalidUsernameFormat"),
          });
          return;
        } else if (error.response.status === 409) {
          showToast({
            severity: "error",
            summary: t("toasts.errorSummary"),
            detail: t("toasts.details.userAlreadyExists"),
          });
          return;
        }
      }
      showToast({
        severity: "error",
        summary: t("toasts.errorSummary"),
        detail: t("toasts.details.failedToCreateUser"),
      });
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
        summary: t("toasts.successSummary.userDeleted"),
        detail: t("toasts.details.userDeleted"),
      });
    },
    onError: () => {
      showToast({
        severity: "error",
        summary: t("toasts.errorSummary"),
        detail: t("toasts.details.failedToDeleteUser"),
      });
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
        message: t("usersTable.deleteConfirm.message"),
        header: t("usersTable.deleteConfirm.header"),
        icon: "pi pi-info-circle",
        defaultFocus: "reject",
        acceptClassName: "p-button-danger",
        accept: () => handleDeleteUser(user),
      });
    },
    [handleDeleteUser, t]
  );

  const actionsTemplate = useCallback(
    (user: api.User) => {
      return (
        <Button
          icon="pi pi-trash"
          severity="danger"
          size="small"
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
      <span className="title">{t("usersTable.title")}</span>
      <div className="actions">
        <Dropdown
          value={sortValue}
          options={SORT_OPTIONS}
          onChange={(event) => setSortValue(event.value)}
          placeholder={t("usersTable.sortBy.placeholder")}
          showClear
        />
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText
            value={filterValue}
            onChange={(event) => setFilterValue(event.target.value)}
            placeholder={t("usersTable.searchPlaceholder")}
          />
        </IconField>
        <Button
          label={t("usersTable.createButton")}
          icon="pi pi-user-plus"
          size="small"
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
        label={t("usersTable.createDialog.cancelButton")}
        icon="pi pi-times"
        onClick={() => setIsDialogVisible(false)}
        text
      />
      <Button
        label={t("usersTable.createDialog.createButton")}
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
          header={t("usersTable.table.id")}
          body={(user: api.User) => user.id.slice(0, 8)}
        />
        <Column
          field="username"
          header={t("usersTable.table.username")}
        />
        <Column
          field="isAdmin"
          header={t("usersTable.table.admin")}
          body={(user: api.User) =>
            user.isAdmin ? t("usersTable.table.adminStatus.yes") : t("usersTable.table.adminStatus.no")
          }
        />
        <Column
          field="createdAt"
          header={t("usersTable.table.joined")}
          body={(user: api.User) => new Date(user.createdAt).toLocaleDateString()}
        />
        <Column
          header={t("usersTable.table.actions")}
          body={actionsTemplate}
        />
      </DataTable>
      <Dialog
        className="admin-dialog"
        header={t("usersTable.createDialog.header")}
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
              <label htmlFor="new-username">{t("usersTable.createDialog.usernameLabel")}</label>
            </FloatLabel>
          </div>
          {temporaryPassword && (
            <div
              className="p-field"
              style={{ marginTop: 3 }}
            >
              <Panel header={t("usersTable.createDialog.temporaryPasswordPanel")}>
                <p className="m-0 p-0 text-break">{temporaryPassword}</p>
              </Panel>
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
}
