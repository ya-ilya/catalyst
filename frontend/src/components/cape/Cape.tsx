import "./Cape.css";

import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { useEffect, useState } from "react";
import ReactSkinview3d from "react-skinview3d";

import * as api from "../../api";

const DEFAULT_SKIN_URL =
  "http://textures.minecraft.net/texture/cafaa0fac9f1ae898431e8b99c1ba7a200f25d7154fba26490139e94daa366bb";
const BACK_EQUIPMENTS = ["Cape", "Elytra"];

type CapeProps = {
  cape: api.Cape;
  isSelected: boolean;
  select: () => void;
  unselect: () => void;
};

export function Cape({ cape, isSelected, select, unselect }: CapeProps) {
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [viewer, setViewer] = useState<any>(null);
  const [backEquipment, setBackEquipment] = useState(BACK_EQUIPMENTS[0]);

  useEffect(() => {
    if (!viewer) {
      return;
    }

    switch (backEquipment) {
      case "Cape":
        viewer.playerObject.cape.visible = true;
        viewer.playerObject.elytra.visible = false;
        break;
      case "Elytra":
        viewer.playerObject.cape.visible = false;
        viewer.playerObject.elytra.visible = true;
        break;
      default:
        break;
    }
  }, [backEquipment, viewer]);

  const dialogFooter = (
    <div>
      <Button
        label="Close"
        icon="pi pi-times"
        onClick={() => setIsDialogVisible(false)}
      />
    </div>
  );

  return (
    <>
      <Card className={`cape ${isSelected ? "--selected-cape" : ""}`}>
        <h2 className="title">{cape.name}</h2>
        <ReactSkinview3d
          className="viewer"
          skinUrl={DEFAULT_SKIN_URL}
          capeUrl={`http://127.0.0.1:3000/api/capes/${cape.id}/image`}
          width={250}
          height={300}
          onReady={(params) => {
            params.viewer.controls.enableZoom = false;
            params.viewer.playerWrapper.rotation.y += 3.92699;
            params.canvasRef.addEventListener("contextmenu", (event) => {
              event.preventDefault();
              setBackEquipment((backEquipment) => (backEquipment == "Cape" ? "Elytra" : "Cape"));
            });
            setViewer(params.viewer);
          }}
        />
        <div className="actions">
          <Button
            icon="pi pi-info"
            onClick={() => setIsDialogVisible(true)}
          />
          {isSelected ? (
            <Button
              icon="pi pi-minus"
              label="Unselect"
              onClick={unselect}
              outlined
            />
          ) : (
            <Button
              icon="pi pi-plus"
              label="Select"
              onClick={select}
            />
          )}
        </div>
      </Card>
      <Dialog
        className="cape-description-dialog"
        header={`"${cape.name}" cape description`}
        visible={isDialogVisible}
        footer={dialogFooter}
        onHide={() => setIsDialogVisible(false)}
      >
        <div className="p-fluid">{cape.description}</div>
      </Dialog>
    </>
  );
}
