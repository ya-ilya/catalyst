import "./Configs.css";

import { TabMenu } from "primereact/tabmenu";
import { useCallback, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";

import * as api from "../../api";
import { Config, Header } from "../../components";
import { useAuthenticationContext, useToastContext } from "../../contexts";

export function Configs() {
  const meControler = api.useMeController();
  const configController = api.useConfigController();

  const [subscriptions, setSubscriptions] = useState<api.Subscription[]>([]);
  const [configs, setConfigs] = useState<api.Config[]>([]);

  const [activeIndex, setActiveIndex] = useState(0);
  const items = [
    { label: "Subscriptions", icon: "pi pi-star" },
    { label: "Library", icon: "pi pi-th-large" },
  ];

  const [session] = useAuthenticationContext();
  const [showToast] = useToastContext();

  const location = useLocation();

  const updateConfigs = useCallback(() => {
    configController
      ?.getPublicConfigs()
      .then((configs) => {
        setConfigs(configs);
      })
      .catch((error) => {
        console.error("Failed to fetch configs:", error);
        showToast({
          severity: "error",
          summary: "Error",
          detail: "Failed to fetch configs.",
        });
      });
  }, [configController]);

  const updateSubscriptions = useCallback(() => {
    meControler
      ?.getSubscriptions()
      .then((subscriptions) => {
        setSubscriptions(subscriptions);
      })
      .catch((error) => {
        console.error("Failed to fetch subscriptions:", error);
        showToast({
          severity: "error",
          summary: "Error",
          detail: "Failed to fetch subscriptions.",
        });
      });
  }, [meControler]);

  useEffect(() => {
    updateConfigs();
  }, [updateConfigs]);

  useEffect(() => {
    updateSubscriptions();
  }, [updateSubscriptions]);

  const handleSubscribe = useCallback(
    (config: api.Config) => {
      if (!configController) {
        return;
      }

      configController
        .subscribe(config.id)
        .then(() => {
          updateSubscriptions();
          showToast({
            severity: "success",
            summary: "Subscribed",
            detail: "You have successfully subscribed to the config.",
          });
        })
        .catch((error) => {
          console.error("Failed to subscribe:", error);
          showToast({
            severity: "error",
            summary: "Error",
            detail: "Failed to subscribe to the config.",
          });
        });
    },
    [configController]
  );

  const handleUnsubscribe = useCallback(
    (config: api.Config) => {
      if (!configController) {
        return;
      }

      configController
        .unsubscribe(config.id)
        .then(() => {
          updateSubscriptions();
          showToast({
            severity: "success",
            summary: "Unsubscribed",
            detail: "You have successfully unsubscribed from the config.",
          });
        })
        .catch((error) => {
          console.error("Failed to unsubscribe:", error);
          showToast({
            severity: "error",
            summary: "Error",
            detail: "Failed to unsubscribe from the config.",
          });
        });
    },
    [configController]
  );

  const handleDelete = useCallback(
    (config: api.Config) => {
      configController
        ?.deleteConfig(config.id)
        .then(() => {
          updateConfigs();
          updateSubscriptions();
          showToast({
            severity: "success",
            summary: "Deleted",
            detail: "Config has been successfully deleted.",
          });
        })
        .catch((error) => {
          console.error("Failed to delete config:", error);
          showToast({ severity: "error", summary: "Error", detail: "Failed to delete the config." });
        });
    },
    [configController]
  );

  const configMapper = useCallback(
    (key: string, config: api.Config) => {
      return (
        <Config
          key={key}
          config={config}
          isAuthor={session !== null && config.author.id === session.user.id}
          isSubscribed={subscriptions?.some((other) => other.config.id === config.id)}
          subscribe={() => handleSubscribe(config)}
          unsubscribe={() => handleUnsubscribe(config)}
          delete={() => handleDelete(config)}
        />
      );
    },
    [session, subscriptions, handleSubscribe, handleUnsubscribe, handleDelete]
  );

  if (!session) {
    return (
      <Navigate
        to={`/sign-in?redirectTo=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  return (
    <div className="configs-container">
      <Header />
      <div className="configs-content">
        <TabMenu
          model={items}
          activeIndex={activeIndex}
          onTabChange={(event) => setActiveIndex(event.index)}
        />
        {activeIndex === 0 && (
          <div className="subscriptions">
            {subscriptions.map((subscription) => configMapper(subscription.id, subscription.config))}
          </div>
        )}
        {activeIndex === 1 && <div className="library">{configs.map((config) => configMapper(config.id, config))}</div>}
      </div>
    </div>
  );
}
