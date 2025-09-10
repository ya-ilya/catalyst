import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { confirmDialog } from "primereact/confirmdialog";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { FileUpload, FileUploadHandlerEvent } from "primereact/fileupload";
import { FloatLabel } from "primereact/floatlabel";
import { useDebounce } from "primereact/hooks";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useMutation, useQuery } from "@tanstack/react-query";

import { queryClient } from "../../..";
import * as api from "../../../api";
import { useToastContext } from "../../../contexts";

type CapesTableProps = {
  adminController?: api.AdminController;
};

const MIN_NAME_LENGTH = 4;
const MAX_NAME_LENGTH = 32;
const MIN_DESCRIPTION_LENGTH = 4;
const MAX_DESCRIPTION_LENGTH = 256;
const MAX_CAPES_PER_PAGE = 5;

export function CapesTable({ adminController }: CapesTableProps) {
  const { t } = useTranslation("admin");

  const SORT_OPTIONS = [{ label: t("capesTable.sortBy.name"), value: "name" }];

  const [filterValue, debouncedFilterValue, setFilterValue] = useDebounce("", 400);
  const [sortValue, setSortValue] = useState<"name">();
  const capeController = api.useCapeController();

  const [page, setPage] = useState(0);

  const { data, isFetching, error } = useQuery({
    queryKey: ["tables/capes", page, debouncedFilterValue, sortValue],
    queryFn: async () => {
      if (!capeController) return { capes: [], total: 0 };
      const response = await capeController.getCapes(
        MAX_CAPES_PER_PAGE,
        page,
        debouncedFilterValue,
        sortValue
      );
      return response;
    },
    enabled: !!capeController,
    placeholderData: (previousData) => previousData,
  });

  const capes = data?.capes ?? [];
  const total = data?.total ?? 0;

  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedCape, setUploadedCape] = useState<Blob | null>(null);

  const [showToast] = useToastContext();

  useEffect(() => {
    if (error) {
      console.error("Failed to fetch capes:", error);
      showToast({
        severity: "error",
        summary: t("toasts.errorSummary"),
        detail: t("toasts.details.failedToFetchCapes"),
      });
    }
  }, [error, t, showToast]);

  const createCapeMutation = useMutation({
    mutationFn: (newCape: { name: string; description: string; file: Blob }) => {
      return adminController!.createCape(newCape.name, newCape.description, newCape.file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables/capes"] });
      showToast({
        severity: "success",
        summary: t("toasts.successSummary.capeCreated"),
        detail: t("toasts.details.capeCreated"),
      });
      setIsDialogVisible(false);
    },
    onError: () => {
      showToast({
        severity: "error",
        summary: t("toasts.errorSummary"),
        detail: t("toasts.details.failedToCreateCape"),
      });
    },
  });

  const deleteCapeMutation = useMutation({
    mutationFn: (capeId: string) => {
      return adminController!.deleteCape(capeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables/capes"] });
      showToast({
        severity: "success",
        summary: t("toasts.successSummary.capeDeleted"),
        detail: t("toasts.details.capeDeleted"),
      });
    },
    onError: () => {
      showToast({
        severity: "error",
        summary: t("toasts.errorSummary"),
        detail: t("toasts.details.failedToDeleteCape"),
      });
    },
  });

  const handleCreateCape = useCallback(() => {
    if (!adminController || !uploadedCape) return;
    createCapeMutation.mutate({ name, description, file: uploadedCape });
  }, [adminController, name, description, uploadedCape, createCapeMutation]);

  const handleDeleteCape = useCallback(
    (cape: api.Cape) => {
      if (!adminController) return;
      deleteCapeMutation.mutate(cape.id);
    },
    [adminController, deleteCapeMutation]
  );

  const confirmDeleteCape = useCallback(
    (cape: api.Cape) => {
      confirmDialog({
        message: t("capesTable.deleteConfirm.message"),
        header: t("capesTable.deleteConfirm.header"),
        icon: "pi pi-info-circle",
        defaultFocus: "reject",
        acceptClassName: "p-button-danger",
        accept: () => handleDeleteCape(cape),
      });
    },
    [handleDeleteCape, t]
  );

  const actionsTemplate = useCallback(
    (cape: api.Cape) => {
      return (
        <Button
          icon="pi pi-trash"
          severity="danger"
          size="small"
          onClick={() => confirmDeleteCape(cape)}
          rounded
          text
        />
      );
    },
    [confirmDeleteCape]
  );

  const imageTemplate = (cape: api.Cape) => {
    return (
      <img
        className="image"
        src={`http://127.0.0.1:3000/api/capes/${cape.id}/image`}
        alt={cape.id}
      />
    );
  };

  const tableHeader = (
    <div className="admin-table-header">
      <span className="title">{t("capesTable.title")}</span>
      <div className="actions">
        <Dropdown
          value={sortValue}
          options={SORT_OPTIONS}
          onChange={(event) => setSortValue(event.value)}
          placeholder={t("capesTable.sortBy.placeholder")}
          showClear
        />
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText
            value={filterValue}
            onChange={(event) => setFilterValue(event.target.value)}
            placeholder={t("capesTable.searchPlaceholder")}
          />
        </IconField>
        <Button
          label={t("capesTable.createButton")}
          icon="pi pi-plus"
          size="small"
          onClick={() => {
            setName("");
            setDescription("");
            setUploadedCape(null);
            setIsDialogVisible(true);
          }}
          outlined
        />
        <Button
          icon="pi pi-refresh"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["tables/capes"] })}
          rounded
          raised
        />
      </div>
    </div>
  );

  const dialogFooter = (
    <div>
      <Button
        label={t("capesTable.createDialog.cancelButton")}
        icon="pi pi-times"
        onClick={() => setIsDialogVisible(false)}
        text
      />
      <Button
        label={t("capesTable.createDialog.createButton")}
        icon="pi pi-check"
        onClick={handleCreateCape}
        disabled={
          name.length < MIN_NAME_LENGTH ||
          name.length > MAX_NAME_LENGTH ||
          description.length < MIN_DESCRIPTION_LENGTH ||
          description.length > MAX_DESCRIPTION_LENGTH ||
          !uploadedCape
        }
      />
    </div>
  );

  const createCapeUploadHandler = useCallback((event: FileUploadHandlerEvent) => {
    const [file] = event.files;
    const fileReader = new FileReader();
    fileReader.onload = (ev) => {
      setUploadedCape(new Blob([ev.target?.result!]));
    };
    fileReader.readAsArrayBuffer(file);
  }, []);

  return (
    <>
      <DataTable
        header={tableHeader}
        value={capes}
        loading={isFetching}
        className="admin-table"
        scrollable
        scrollHeight="100%"
        paginator
        lazy
        first={page}
        rows={MAX_CAPES_PER_PAGE}
        totalRecords={total}
        onPage={(event) => {
          setPage(event.first);
        }}
      >
        <Column
          field="id"
          header={t("capesTable.table.id")}
          body={(cape: api.Cape) => cape.id.slice(0, 8)}
        />
        <Column
          header={t("capesTable.table.image")}
          body={imageTemplate}
        />
        <Column
          field="name"
          header={t("capesTable.table.name")}
        />
        <Column
          field="description"
          header={t("capesTable.table.description")}
        />
        <Column
          header={t("capesTable.table.actions")}
          body={actionsTemplate}
        />
      </DataTable>
      <Dialog
        className="admin-dialog"
        header={t("capesTable.createDialog.header")}
        visible={isDialogVisible}
        footer={dialogFooter}
        onHide={() => setIsDialogVisible(false)}
      >
        <div className="p-fluid">
          <div className="p-field">
            <FloatLabel>
              <InputText
                id="new-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                invalid={name.length < MIN_NAME_LENGTH || name.length > MAX_NAME_LENGTH}
              />
              <label htmlFor="new-name">{t("capesTable.createDialog.nameLabel")}</label>
            </FloatLabel>
          </div>
          <div className="p-field">
            <FloatLabel>
              <InputText
                id="new-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                invalid={
                  description.length < MIN_DESCRIPTION_LENGTH || description.length > MAX_DESCRIPTION_LENGTH
                }
              />
              <label htmlFor="new-description">{t("capesTable.createDialog.descriptionLabel")}</label>
            </FloatLabel>
          </div>
          <div
            className="p-field"
            style={{ marginTop: 16 }}
          >
            <FileUpload
              mode="basic"
              name="image"
              chooseLabel={t("capesTable.createDialog.chooseFileButton")}
              uploadHandler={createCapeUploadHandler}
              customUpload
            />
          </div>
        </div>
      </Dialog>
    </>
  );
}
