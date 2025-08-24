import "./Config.css";

import { Button } from "primereact/button";
import { Card } from "primereact/card";

import * as api from "../../api";

type ConfigProps = {
  config: api.Config;
  isAuthor: boolean;
  isSubscribed: boolean;
  subscribe: () => void;
  unsubscribe: () => void;
  delete: () => void;
};

export function Config(props: ConfigProps) {
  return (
    <Card className="config">
      <div className="config-header">
        <span className="config-name">{props.config.name}</span>
        <span className="config-author">by {props.config.author.username}</span>
        <span className="config-id">id: {props.config.id.slice(0, 8)}</span>
      </div>
      <div className="config-footer">
        <Button
          icon="pi pi-info-circle"
          className="p-button-sm"
          rounded
          text
        />
        {!props.isAuthor && props.isSubscribed && (
          <Button
            icon="pi pi-minus-circle"
            className="p-button-danger p-button-sm"
            onClick={props.unsubscribe}
            rounded
            text
          />
        )}
        {!props.isSubscribed && (
          <Button
            icon="pi pi-plus-circle"
            className="add-button p-button-sm"
            onClick={props.subscribe}
            rounded
            text
          />
        )}
        {props.isAuthor && (
          <Button
            icon="pi pi-trash"
            className="p-button-danger p-button-sm"
            onClick={props.delete}
            rounded
            text
          />
        )}
      </div>
    </Card>
  );
}
