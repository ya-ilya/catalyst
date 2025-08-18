import "./Config.css";

import { Button } from "primereact/button";
import { Card } from "primereact/card";

export function Config({ config }: { config: any }) {
  return (
    <Card className="config">
      <div className="config-header">
        <span className="config-name">{config.name}</span>
        <span className="config-author">by {config.author}</span>
        <span className="config-id">id: {config.configId}</span>
      </div>
      <div className="config-footer">
        <Button
          icon="pi pi-info-circle"
          className="p-button-sm"
          rounded
          text
        />
        <Button
          icon="pi pi-cloud"
          className="p-button-sm"
          rounded
          text
        />
        <Button
          icon="pi pi-plus-circle"
          className="add-button p-button-sm"
          rounded
          text
        />
        <Button
          icon="pi pi-trash"
          className="p-button-danger p-button-sm"
          rounded
          text
        />
      </div>
    </Card>
  );
}
