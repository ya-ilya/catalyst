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
  const { config, isAuthor, isSubscribed, subscribe, unsubscribe } = props;

  return (
    <Card className="config">
      <div className="config-header">
        <span className="config-name">{config.name}</span>
        <span className="config-author">by {config.author.username}</span>
        <span className="config-id">id: {config.id.slice(0, 8)}</span>
      </div>
      <div className="config-footer">
        <Button
          icon="pi pi-info-circle"
          className="p-button-sm"
          rounded
          text
        />
        {!isAuthor && isSubscribed && (
          <Button
            icon="pi pi-minus-circle"
            className="p-button-danger p-button-sm"
            onClick={unsubscribe}
            rounded
            text
          />
        )}
        {!isSubscribed && (
          <Button
            icon="pi pi-plus-circle"
            className="add-button p-button-sm"
            onClick={subscribe}
            rounded
            text
          />
        )}
        {isAuthor && (
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
