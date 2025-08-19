import "./Config.css";

import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { ToastMessage } from "primereact/toast";
import { useCallback } from "react";

import * as api from "../../api";

type ConfigProps = {
  showToast: (message: ToastMessage) => void;
  config: api.Config;
  subscriptions: api.Subscription[];
  updateSubscriptions: () => void;
  updateConfigs: () => void;
};

export function Config(props: ConfigProps) {
  const configController = api.useConfigController();

  const [session] = api.useAuthenticationContext();

  const isAuthor = session && props.config.author.id === session?.user?.id;
  const isSubscribed = props.subscriptions?.some((subscription) => subscription.config.id === props.config.id);

  const handleSubscribe = useCallback(() => {
    if (!configController) {
      return;
    }

    configController
      .subscribe(props.config.id)
      .then(() => {
        props.updateSubscriptions();
        props.showToast({
          severity: "success",
          summary: "Subscribed",
          detail: "You have successfully subscribed to the config.",
        });
      })
      .catch((error) => {
        console.error("Failed to subscribe:", error);
        props.showToast({
          severity: "error",
          summary: "Error",
          detail: "Failed to subscribe to the config.",
        });
      });
  }, [configController, props.config.id, props.updateSubscriptions, props.showToast]);

  const handleUnsubscribe = useCallback(() => {
    if (!configController) {
      return;
    }

    configController
      .unsubscribe(props.config.id)
      .then(() => {
        props.updateSubscriptions();
        props.showToast({
          severity: "success",
          summary: "Unsubscribed",
          detail: "You have successfully unsubscribed from the config.",
        });
      })
      .catch((error) => {
        console.error("Failed to unsubscribe:", error);
        props.showToast({
          severity: "error",
          summary: "Error",
          detail: "Failed to unsubscribe from the config.",
        });
      });
  }, [configController, props.config.id, props.updateSubscriptions, props.showToast]);

  const handleDelete = useCallback(() => {
    configController
      ?.deleteConfig(props.config.id)
      .then(() => {
        props.updateConfigs();
        props.updateSubscriptions();
        props.showToast({
          severity: "success",
          summary: "Deleted",
          detail: "Config has been successfully deleted.",
        });
      })
      .catch((error) => {
        console.error("Failed to delete config:", error);
        props.showToast({ severity: "error", summary: "Error", detail: "Failed to delete the config." });
      });
  }, [configController, props.config.id, props.showToast]);

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
        {!isAuthor && isSubscribed && (
          <Button
            icon="pi pi-minus-circle"
            className="p-button-danger p-button-sm"
            onClick={handleUnsubscribe}
            rounded
            text
          />
        )}
        {!isSubscribed && (
          <Button
            icon="pi pi-plus-circle"
            className="add-button p-button-sm"
            onClick={handleSubscribe}
            rounded
            text
          />
        )}
        {isAuthor && (
          <Button
            icon="pi pi-trash"
            className="p-button-danger p-button-sm"
            onClick={handleDelete}
            rounded
            text
          />
        )}
      </div>
    </Card>
  );
}
