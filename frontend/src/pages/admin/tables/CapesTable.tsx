import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { confirmDialog } from "primereact/confirmdialog";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { FileUpload, FileUploadHandlerEvent } from "primereact/fileupload";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { useCallback, useEffect, useState } from "react";

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
  const capeController = api.useCapeController();

  const [page, setPage] = useState(0);

  const { data, isFetching, error } = useQuery({
    queryKey: ["tables/capes", page],
    queryFn: async () => {
      if (!capeController) return { capes: [], total: 0 };
      const response = await capeController.getCapes(MAX_CAPES_PER_PAGE, page);
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
        summary: "Error",
        detail: "Failed to fetch capes.",
      });
    }
  }, [error]);

  const createCapeMutation = useMutation({
    mutationFn: (newCape: { name: string; description: string; file: Blob }) => {
      return adminController!.createCape(newCape.name, newCape.description, newCape.file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables/capes"] });
      showToast({
        severity: "success",
        summary: "Cape Created",
        detail: "New cape successfully created",
      });
      setIsDialogVisible(false);
    },
    onError: () => {
      showToast({
        severity: "error",
        summary: "Error",
        detail: "Failed to create cape.",
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
        summary: "Cape Deleted",
        detail: "Cape has been successfully deleted.",
      });
    },
    onError: () => {
      showToast({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete cape.",
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
        message: "Are you sure you want to delete this cape?",
        header: "Delete Confirmation",
        icon: "pi pi-info-circle",
        defaultFocus: "reject",
        acceptClassName: "p-button-danger",
        accept: () => handleDeleteCape(cape),
      });
    },
    [handleDeleteCape]
  );

  const actionsTemplate = useCallback(
    (cape: api.Cape) => {
      return (
        <Button
          icon="pi pi-trash"
          className="p-button-danger p-button-sm"
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
      <span className="title">Cape Management</span>
      <div className="actions">
        <Button
          label="Create Cape"
          icon="pi pi-plus"
          className="p-button-sm"
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
        label="Cancel"
        icon="pi pi-times"
        onClick={() => setIsDialogVisible(false)}
        text
      />
      <Button
        label="Create"
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
          header="ID"
          body={(cape: api.Cape) => cape.id.slice(0, 8)}
        />
        <Column
          header="Image"
          body={imageTemplate}
        />
        <Column
          field="name"
          header="Name"
        />
        <Column
          field="description"
          header="Description"
        />
        <Column
          header="Actions"
          body={actionsTemplate}
        />
      </DataTable>
      <Dialog
        className="admin-dialog"
        header="Create New Cape"
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
              <label htmlFor="new-name">Name</label>
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
              <label htmlFor="new-description">Description</label>
            </FloatLabel>
          </div>
          <div
            className="p-field"
            style={{ marginTop: 16 }}
          >
            <FileUpload
              mode="basic"
              name="image"
              chooseLabel="Choose cape file"
              uploadHandler={createCapeUploadHandler}
              customUpload
            />
          </div>
        </div>
      </Dialog>
    </>
  );
}
