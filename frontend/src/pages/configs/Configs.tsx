import "./Configs.css";

import { useEffect, useState } from "react";
import { Navigate } from "react-router";

import * as api from "../../api";
import { Header, Library, Subscriptions } from "../../components";

export function Configs() {
  const meControler = api.useMeController();
  const configController = api.useConfigController();

  const [subscriptions, setSubscriptions] = useState<api.Subscription[]>([]);
  const [configs, setConfigs] = useState<api.Config[]>([]);

  const [session] = api.useAuthenticationContext();

  useEffect(() => {
    configController
      ?.getPublicConfigs()
      .then((configs) => {
        setConfigs(configs);
      })
      .catch((error) => {
        console.error("Failed to fetch configs:", error);
      });
  }, [configController]);

  useEffect(() => {
    meControler
      ?.getSubscriptions()
      .then((subscriptions) => {
        setSubscriptions(subscriptions);
      })
      .catch((error) => {
        console.error("Failed to fetch subscriptions:", error);
      });
  }, [meControler]);

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
      <Header />
      <div className="configs-content">
        <Subscriptions subscriptions={subscriptions} />
        <Library
          configs={configs}
          subscriptions={subscriptions}
        />
      </div>
    </div>
  );
}
