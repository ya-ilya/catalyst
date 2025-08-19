import "./Configs.css";

import { Toast } from "primereact/toast";
import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router";

import * as api from "../../api";
import { Header, Library, Subscriptions } from "../../components";
import { useToast } from "../../hooks";

export function Configs() {
  const meControler = api.useMeController();
  const configController = api.useConfigController();

  const [subscriptions, setSubscriptions] = useState<api.Subscription[]>([]);
  const [configs, setConfigs] = useState<api.Config[]>([]);

  const [session] = api.useAuthenticationContext();

  const [toast, showToast] = useToast();

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

  useEffect(() => {
    updateConfigs();
  }, [updateConfigs]);

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
    updateSubscriptions();
  }, [updateSubscriptions]);

  if (!session) {
    return (
      <Navigate
        to="/sign-in"
        replace
      />
    );
  }

  return (
    <div className="configs-container">
      <Toast ref={toast} />
      <Header />
      <div className="configs-content">
        <Subscriptions
          showToast={showToast}
          subscriptions={subscriptions}
          updateSubscriptions={updateSubscriptions}
          updateConfigs={updateConfigs}
        />
        <Library
          showToast={showToast}
          configs={configs}
          subscriptions={subscriptions}
          updateSubscriptions={updateSubscriptions}
          updateConfigs={updateConfigs}
        />
      </div>
    </div>
  );
}
