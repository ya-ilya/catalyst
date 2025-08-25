import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { FileUpload, FileUploadHandlerEvent } from "primereact/fileupload";
import { InputText } from "primereact/inputtext";
import { useCallback, useEffect, useState } from "react";

import * as api from "../../../api";
import { useToastContext } from "../../../contexts";

type CapesTableProps = {
  adminController?: api.AdminController;
};

const MIN_NAME_LENGTH = 4;
const MAX_NAME_LENGTH = 32;
const MIN_DESCRIPTION_LENGTH = 4;
const MAX_DESCRIPTION_LENGTH = 256;

export function CapesTable({ adminController }: CapesTableProps) {
  const capeController = api.useCapeController();

  const [capes, setCapes] = useState<api.Cape[]>([]);
  const [loading, setLoading] = useState(false);

  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedCape, setUploadedCape] = useState<Blob | null>(null);

  const [showToast] = useToastContext();

  const fetchCapes = useCallback(async () => {
    if (!capeController) return;

    setLoading(true);

    try {
      const capes = await capeController.getCapes();

      setCapes(capes);
    } catch (error) {
      console.error("Failed to fetch capes:", error);
      showToast({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch capes.",
      });
    } finally {
      setLoading(false);
    }
  }, [capeController]);

  useEffect(() => {
    fetchCapes();
  }, [fetchCapes]);

  const handleCreateCape = useCallback(async () => {
    if (!adminController) return;

    try {
      await adminController.createCape(name, description, uploadedCape!);
      await fetchCapes();

      showToast({
        severity: "success",
        summary: "Cape Created",
        detail: "New cape successfully created",
      });
    } catch (error) {
      console.log("Failed to create cape:", error);
      showToast({
        severity: "error",
        summary: "Error",
        detail: "Failed to create cape.",
      });
    } finally {
      setIsDialogVisible(false);
    }
  }, [adminController, name, description, uploadedCape, fetchCapes, setIsDialogVisible]);

  const handleDeleteCape = useCallback(
    async (capeId: string) => {
      if (!adminController) return;

      if (window.confirm("Are you sure you want to delete this cape?")) {
        try {
          await adminController.deleteCape(capeId);
          await fetchCapes();
        } catch (error) {
          console.error("Failed to delete cape:", error);
          showToast({
            severity: "error",
            summary: "Error",
            detail: "Failed to delete cape.",
          });
        }
      }
    },
    [adminController, fetchCapes]
  );

  const actionsTemplate = useCallback(
    (cape: api.Cape) => {
      return (
        <Button
          icon="pi pi-trash"
          className="p-button-danger p-button-sm"
          onClick={() => handleDeleteCape(cape.id)}
          rounded
          text
        />
      );
    },
    [handleDeleteCape]
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
          onClick={fetchCapes}
          rounded
          raised
        />
      </div>
    </div>
  );

  const tableFooter = `In total there are ${capes ? capes.length : 0} capes.`;

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
        footer={tableFooter}
        value={capes}
        loading={loading}
        className="admin-table"
        scrollable
        scrollHeight="100%"
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
        header="Create New Cape"
        visible={isDialogVisible}
        style={{ width: "400px" }}
        footer={dialogFooter}
        onHide={() => setIsDialogVisible(false)}
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="new-name">Name</label>
            <InputText
              id="new-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              invalid={name.length < MIN_NAME_LENGTH || name.length > MAX_NAME_LENGTH}
            />
          </div>
          <div
            className="p-field"
            style={{ marginTop: 3 }}
          >
            <label htmlFor="new-description">Description</label>
            <InputText
              id="new-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              invalid={description.length < MIN_DESCRIPTION_LENGTH || description.length > MAX_DESCRIPTION_LENGTH}
            />
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
