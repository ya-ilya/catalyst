import "./Configs.css";

import { useDebounce } from "primereact/hooks";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Paginator } from "primereact/paginator";
import { TabMenu } from "primereact/tabmenu";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useLocation } from "react-router";

import { useMutation, useQuery } from "@tanstack/react-query";

import { queryClient } from "../..";
import * as api from "../../api";
import { Config } from "../../components";
import { useAuthenticationContext, useToastContext } from "../../contexts";

const MAX_CONFIGS_PER_PAGE = 35;

export function Configs() {
  const meController = api.useMeController();
  const configController = api.useConfigController();

  const { t } = useTranslation("configs");

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
    { label: t("configsPage.subscriptionsTab"), icon: "pi pi-star" },
    { label: t("configsPage.libraryTab"), icon: "pi pi-th-large" },
  ];

  const [session] = useAuthenticationContext();
  const [showToast] = useToastContext();

  const location = useLocation();

  useEffect(() => {
    if (subscriptionsError) {
      console.error("Failed to fetch subscriptions:", subscriptionsError);
      showToast({
        severity: "error",
        summary: t("toasts.errorSummary"),
        detail: t("toasts.details.failedToFetchSubscriptions"),
      });
    }
  }, [subscriptionsError, t, showToast]);

  useEffect(() => {
    if (configsError) {
      console.error("Failed to fetch configs:", configsError);
      showToast({
        severity: "error",
        summary: t("toasts.errorSummary"),
        detail: t("toasts.details.failedToFetchConfigs"),
      });
    }
  }, [configsError, t, showToast]);

  const subscribeMutation = useMutation({
    mutationFn: async (config: api.Config) => {
      await configController!.subscribe(config.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      showToast({
        severity: "success",
        summary: t("toasts.successSummary.subscribed"),
        detail: t("toasts.details.subscribed"),
      });
    },
    onError: (error) => {
      console.error("Failed to subscribe:", error);
      showToast({
        severity: "error",
        summary: t("toasts.errorSummary"),
        detail: t("toasts.details.failedToSubscribe"),
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
        summary: t("toasts.successSummary.unsubscribed"),
        detail: t("toasts.details.unsubscribed"),
      });
    },
    onError: (error) => {
      console.error("Failed to unsubscribe:", error);
      showToast({
        severity: "error",
        summary: t("toasts.errorSummary"),
        detail: t("toasts.details.failedToUnsubscribe"),
      });
    },
  });

  const addTagMutation = useMutation({
    mutationFn: async ({ config, tag }: { config: api.Config; tag: string }) => {
      await configController!.updateConfig(config.id, {
        tags: [...(config.tags ?? []), tag],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configs"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      showToast({
        severity: "success",
        summary: t("toasts.successSummary.tagAdded"),
        detail: t("toasts.details.tagAdded"),
      });
    },
    onError: (error) => {
      console.error("Failed to add tag:", error);
      showToast({
        severity: "error",
        summary: t("toasts.errorSummary"),
        detail: t("toasts.details.failedToAddTag"),
      });
    },
  });

  const removeTagMutation = useMutation({
    mutationFn: async ({ config, tag }: { config: api.Config; tag: string }) => {
      await configController!.updateConfig(config.id, {
        tags: config.tags?.filter((other) => other != tag),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configs"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      showToast({
        severity: "success",
        summary: t("toasts.successSummary.tagRemoved"),
        detail: t("toasts.details.tagRemoved"),
      });
    },
    onError: (error) => {
      console.error("Failed to remove tag:", error);
      showToast({
        severity: "error",
        summary: t("toasts.errorSummary"),
        detail: t("toasts.details.failedToRemoveTag"),
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
        summary: t("toasts.successSummary.toggledPublicity"),
        detail: t("toasts.details.toggledPublicity"),
      });
    },
    onError: (error) => {
      console.error("Failed to toggle config publicity:", error);
      showToast({
        severity: "error",
        summary: t("toasts.errorSummary"),
        detail: t("toasts.details.failedToTogglePublicity"),
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
        summary: t("toasts.successSummary.deletedConfig"),
        detail: t("toasts.details.deletedConfig"),
      });
    },
    onError: (error) => {
      console.error("Failed to delete config:", error);
      showToast({
        severity: "error",
        summary: t("toasts.errorSummary"),
        detail: t("toasts.details.failedToDelete"),
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

  const handleAddTag = useCallback(
    async (config: api.Config, tag: string) => {
      if (!configController) return;
      addTagMutation.mutate({ config, tag });
    },
    [configController, addTagMutation]
  );

  const handleRemoveTag = useCallback(
    async (config: api.Config, tag: string) => {
      if (!configController) return;
      removeTagMutation.mutate({ config, tag });
    },
    [configController, removeTagMutation]
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
            placeholder={
              activeIndex === 0
                ? t("configsPage.searchPlaceholderSubscriptions")
                : t("configsPage.searchPlaceholderLibrary")
            }
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
            <div className="empty-message">{t("configsPage.noSubscriptions")}</div>
          ) : (
            <>
              <div className="subscriptions">
                {subscriptions.map((subscription) => (
                  <Config
                    key={subscription.id}
                    config={subscription.config}
                    isAdmin={session !== null && session.user.isAdmin}
                    isAuthor={session !== null && subscription.config.author.id === session.user.id}
                    isSubscribed={true}
                    subscribe={() => handleSubscribe(subscription.config)}
                    unsubscribe={() => handleUnsubscribe(subscription.config)}
                    togglePublicity={() => handleTogglePublicity(subscription.config)}
                    addTag={(tag: string) => handleAddTag(subscription.config, tag)}
                    removeTag={(tag: string) => handleRemoveTag(subscription.config, tag)}
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
            <div className="empty-message">{t("configsPage.noConfigs")}</div>
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
                    addTag={(tag: string) => handleAddTag(config, tag)}
                    removeTag={(tag: string) => handleRemoveTag(config, tag)}
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
  );
}
