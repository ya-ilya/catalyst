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
    updateSubscriptions();
  }, [updateConfigs, updateSubscriptions]);

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
            {subscriptions.map((subscription) => (
              <Config
                key={subscription.id}
                config={subscription.config}
                subscriptions={subscriptions}
                updateSubscriptions={updateSubscriptions}
                updateConfigs={updateConfigs}
              />
            ))}
          </div>
        )}
        {activeIndex === 1 && (
          <div className="library">
            {configs.map((config) => {
              return (
                <Config
                  key={config.id}
                  config={config}
                  subscriptions={subscriptions}
                  updateSubscriptions={updateSubscriptions}
                  updateConfigs={updateConfigs}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
