import "./Configs.css";

import { useDebounce } from "primereact/hooks";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Paginator } from "primereact/paginator";
import { TabMenu } from "primereact/tabmenu";
import { useCallback, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";

import { useMutation, useQuery } from "@tanstack/react-query";

import { queryClient } from "../..";
import * as api from "../../api";
import { Config, Header } from "../../components";
import { useAuthenticationContext, useToastContext } from "../../contexts";

const MAX_CONFIGS_PER_PAGE = 35;

export function Configs() {
  const meController = api.useMeController();
  const configController = api.useConfigController();

  const [subscriptionsFilterValue, debouncedSubscriptionsFilterValue, setSubscriptionsFilterValue] =
    useDebounce("", 400);
  const [subscriptionsPage, setSubscriptionsPage] = useState(0);

  const { data: subscriptionsData, error: subscriptionsError } = useQuery({
    queryKey: ["subscriptions", subscriptionsPage, debouncedSubscriptionsFilterValue],
    queryFn: async () => {
      if (!meController) return { subscriptions: [], total: 0 };
      const response = await meController.getSubscriptions(
        MAX_CONFIGS_PER_PAGE,
        subscriptionsPage,
        debouncedSubscriptionsFilterValue
      );
      return response;
    },
    enabled: !!meController,
    placeholderData: (previousData) => previousData,
  });

  const subscriptions = subscriptionsData?.subscriptions ?? [];
  const subscriptionsTotal = subscriptionsData?.total ?? 0;

  const [configsFilterValue, debouncedConfigsFilterValue, setConfigsFilterValue] = useDebounce("", 400);
  const [configsPage, setConfigsPage] = useState(0);

  const { data: configsData, error: configsError } = useQuery({
    queryKey: ["configs", configsPage, debouncedConfigsFilterValue],
    queryFn: async () => {
      if (!configController) return { configs: [], total: 0 };
      const response = await configController.getPublicConfigs(
        MAX_CONFIGS_PER_PAGE,
        configsPage,
        debouncedConfigsFilterValue
      );
      return response;
    },
    enabled: !!configController,
    placeholderData: (previousData) => previousData,
  });

  const configs = configsData?.configs ?? [];
  const configsTotal = configsData?.total ?? 0;

  const [activeIndex, setActiveIndex] = useState(0);
  const items = [
    { label: "Subscriptions", icon: "pi pi-star" },
    { label: "Library", icon: "pi pi-th-large" },
  ];

  const [session] = useAuthenticationContext();
  const [showToast] = useToastContext();

  const location = useLocation();

  useEffect(() => {
    if (subscriptionsError) {
      console.error("Failed to fetch subscriptions:", subscriptionsError);
      showToast({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch subscriptions.",
      });
    }
  }, [subscriptionsError]);

  useEffect(() => {
    if (configsError) {
      console.error("Failed to fetch configs:", configsError);
      showToast({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch configs.",
      });
    }
  }, [configsError]);

  const subscribeMutation = useMutation({
    mutationFn: async (config: api.Config) => {
      await configController!.subscribe(config.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      showToast({
        severity: "success",
        summary: "Subscribed",
        detail: "You have successfully subscribed to the config.",
      });
    },
    onError: (error) => {
      console.error("Failed to subscribe:", error);
      showToast({
        severity: "error",
        summary: "Error",
        detail: "Failed to subscribe to the config.",
      });
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: async (config: api.Config) => {
      await configController!.unsubscribe(config.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      showToast({
        severity: "success",
        summary: "Unsubscribed",
        detail: "You have successfully unsubscribed from the config.",
      });
    },
    onError: (error) => {
      console.error("Failed to unsubscribe:", error);
      showToast({
        severity: "error",
        summary: "Error",
        detail: "Failed to unsubscribe from the config.",
      });
    },
  });

  const togglePublicityMutation = useMutation({
    mutationFn: async (config: api.Config) => {
      await configController!.updateConfig(config.id, {
        isPublic: !config.isPublic,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configs"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      showToast({
        severity: "success",
        summary: "Publicity toggled",
        detail: "Config publicity has been successfully toggled.",
      });
    },
    onError: (error) => {
      console.error("Failed to toggle config publicity:", error);
      showToast({
        severity: "error",
        summary: "Error",
        detail: "Failed to toggle config publicity.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (config: api.Config) => {
      await configController!.deleteConfig(config.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configs"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      showToast({
        severity: "success",
        summary: "Deleted",
        detail: "Config has been successfully deleted.",
      });
    },
    onError: (error) => {
      console.error("Failed to delete config:", error);
      showToast({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete the config.",
      });
    },
  });

  const handleSubscribe = useCallback(
    async (config: api.Config) => {
      if (!configController) return;
      subscribeMutation.mutate(config);
    },
    [configController, subscribeMutation]
  );

  const handleUnsubscribe = useCallback(
    async (config: api.Config) => {
      if (!configController) return;
      unsubscribeMutation.mutate(config);
    },
    [configController, unsubscribeMutation]
  );

  const handleTogglePublicity = useCallback(
    async (config: api.Config) => {
      if (!configController) return;
      togglePublicityMutation.mutate(config);
    },
    [configController, togglePublicityMutation]
  );

  const handleDelete = useCallback(
    async (config: api.Config) => {
      if (!configController) return;
      deleteMutation.mutate(config);
    },
    [configController, deleteMutation]
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
        <div className="input-container">
          <IconField iconPosition="left">
            <InputIcon className="pi pi-search" />
            <InputText
              value={activeIndex === 0 ? subscriptionsFilterValue : configsFilterValue}
              onChange={(event) => {
                if (activeIndex === 0) {
                  setSubscriptionsFilterValue(event.target.value);
                } else {
                  setConfigsFilterValue(event.target.value);
                }
              }}
              placeholder={`Search ${
                activeIndex === 0 ? "in subscriptions" : "in library"
              } by name or author`}
            />
          </IconField>
        </div>
        <TabMenu
          model={items}
          activeIndex={activeIndex}
          onTabChange={(event) => setActiveIndex(event.index)}
        />
        {activeIndex === 0 && (
          <>
            {subscriptions.length === 0 ? (
              <div className="empty-message">No subscriptions yet.</div>
            ) : (
              <>
                <div className="subscriptions">
                  {subscriptions.map((subscription) => (
                    <Config
                      key={subscription.id}
                      config={subscription.config}
                      isAdmin={session !== null && session.user.isAdmin}
                      isAuthor={session !== null && subscription.config.author.id === session.user.id}
                      isSubscribed={subscriptions?.some(
                        (other) => other.config.id === subscription.config.id
                      )}
                      subscribe={() => handleSubscribe(subscription.config)}
                      unsubscribe={() => handleUnsubscribe(subscription.config)}
                      togglePublicity={() => handleTogglePublicity(subscription.config)}
                      delete={() => handleDelete(subscription.config)}
                    />
                  ))}
                </div>
                <Paginator
                  first={subscriptionsPage}
                  rows={MAX_CONFIGS_PER_PAGE}
                  totalRecords={subscriptionsTotal}
                  onPageChange={(event) => {
                    setSubscriptionsPage(event.first);
                  }}
                />
              </>
            )}
          </>
        )}
        {activeIndex === 1 && (
          <>
            {configs.length === 0 ? (
              <div className="empty-message">No configs available.</div>
            ) : (
              <>
                <div className="library">
                  {configs.map((config) => (
                    <Config
                      key={config.id}
                      config={config}
                      isAdmin={session !== null && session.user.isAdmin}
                      isAuthor={session !== null && config.author.id === session.user.id}
                      isSubscribed={subscriptions?.some((other) => other.config.id === config.id)}
                      subscribe={() => handleSubscribe(config)}
                      unsubscribe={() => handleUnsubscribe(config)}
                      togglePublicity={() => handleTogglePublicity(config)}
                      delete={() => handleDelete(config)}
                    />
                  ))}
                </div>
                <Paginator
                  first={configsPage}
                  rows={MAX_CONFIGS_PER_PAGE}
                  totalRecords={configsTotal}
                  onPageChange={(event) => {
                    setConfigsPage(event.first);
                  }}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
