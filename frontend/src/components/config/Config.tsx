import "./Config.css";

import { Button } from "primereact/button";
import { Card } from "primereact/card";

import * as api from "../../api";

type ConfigProps = {
  config: api.Config;
  subscriptions?: api.Subscription[];
};

export function Config(props: ConfigProps) {
  const [session] = api.useAuthenticationContext();

  const isAuthor = session && props.config.author.id === session?.user?.id;
  const isSubscribed = props.subscriptions?.some((subscription) => subscription.config.id === props.config.id);

  return (
    <Card className="config">
      <div className="config-header">
        <span className="config-name">{props.config.name}</span>
        <span className="config-author">by {props.config.author.username}</span>
        <span className="config-id">id: {props.config.id.slice(0, 4)}...</span>
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
            rounded
            text
          />
        )}
        {!isSubscribed && (
          <Button
            icon="pi pi-plus-circle"
            className="add-button p-button-sm"
            rounded
            text
          />
        )}
        {isAuthor && (
          <Button
            icon="pi pi-trash"
            className="p-button-danger p-button-sm"
            rounded
            text
          />
        )}
      </div>
    </Card>
  );
}
