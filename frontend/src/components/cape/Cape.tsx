import "./Cape.css";

import { Card } from "primereact/card";
import { SelectButton } from "primereact/selectbutton";
import { useEffect, useState } from "react";
import ReactSkinview3d from "react-skinview3d";

import * as api from "../../api";

const DEFAULT_SKIN_URL =
  "http://textures.minecraft.net/texture/cafaa0fac9f1ae898431e8b99c1ba7a200f25d7154fba26490139e94daa366bb";

type CapeProps = {
  cape: api.Cape;
  isSelected: boolean;
};

export function Cape(props: CapeProps) {
  const [viewer, setViewer] = useState<any>(null);

  const backEquipments = ["Cape", "Elytra"];
  const [backEquipment, setBackEquipment] = useState(backEquipments[0]);

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

  return (
    <Card className={`cape ${props.isSelected ? "--selected-cape" : ""}`}>
      <ReactSkinview3d
        className={`viewer`}
        skinUrl={DEFAULT_SKIN_URL}
        capeUrl={`http://127.0.0.1:3000/api/capes/${props.cape.id}/image`}
        width={220}
        height={300}
        onReady={(params) => {
          params.viewer.controls.enableZoom = false;
          params.viewer.playerWrapper.rotation.y += 3.92699;
          setViewer(params.viewer);
        }}
      />
      <div className="back-equipment-switcher">
        <SelectButton
          value={backEquipment}
          onChange={(event) => setBackEquipment(event.value)}
          options={backEquipments}
        />
      </div>
    </Card>
  );
}
