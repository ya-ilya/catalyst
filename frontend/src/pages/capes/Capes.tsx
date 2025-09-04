import "./Capes.css";

import { useDebounce } from "primereact/hooks";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Paginator } from "primereact/paginator";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useLocation } from "react-router";

import { useMutation, useQuery } from "@tanstack/react-query";

import { queryClient } from "../..";
import * as api from "../../api";
import { Cape } from "../../components";
import { useAuthenticationContext, useToastContext } from "../../contexts";

const MAX_CAPES_PER_PAGE = 24;

export function Capes() {
  const capeController = api.useCapeController();
  const meController = api.useMeController();

  const { t } = useTranslation("capes");

  const [filterValue, debouncedFilterValue, setFilterValue] = useDebounce("", 400);
  const [page, setPage] = useState(0);

  const { data: capesData, error: capesError } = useQuery({
    queryKey: ["capes", page, debouncedFilterValue],
    queryFn: async () => {
      if (!capeController) return { capes: [], total: 0 };
      const response = await capeController.getCapes(MAX_CAPES_PER_PAGE, page, debouncedFilterValue);
      return response;
    },
    enabled: !!capeController,
    placeholderData: (previousData) => previousData,
  });

  const capes = capesData?.capes ?? [];
  const total = capesData?.total ?? 0;

  const { data: selectedCape, error: selectedCapeError } = useQuery({
    queryKey: ["selectedCape"],
    queryFn: async () => {
      if (!meController) return null;
      const user = await meController.getUser();
      return user.cape ?? null;
    },
    enabled: !!meController,
  });

  const [session] = useAuthenticationContext();
  const [showToast] = useToastContext();

  const location = useLocation();

  useEffect(() => {
    if (capesError) {
      console.error("Failed to fetch capes:", capesError);
      showToast({
        severity: "error",
        summary: t("toasts.errorSummary"),
        detail: t("toasts.details.failedToFetchCapes"),
      });
    }
  }, [capesError, t, showToast]);

  useEffect(() => {
    if (selectedCapeError) {
      console.error("Failed to fetch selected cape: ", selectedCapeError);
      showToast({
        severity: "error",
        summary: t("toasts.errorSummary"),
        detail: t("toasts.details.failedToFetchSelectedCape"),
      });
    }
  }, [selectedCapeError, t, showToast]);

  const selectMutation = useMutation({
    mutationFn: async (cape: api.Cape) => {
      await capeController!.select(cape.id);
    },
    onMutate: async (newCape) => {
      await queryClient.cancelQueries({ queryKey: ["selectedCape"] });

      const previousSelectedCape = queryClient.getQueryData<api.Cape>(["selectedCape"]) ?? null;

      queryClient.setQueryData(["selectedCape"], newCape);

      return { previousSelectedCape };
    },
    onError: (_error, _newCape, context: { previousSelectedCape: api.Cape | null } | undefined) => {
      queryClient.setQueryData(["selectedCape"], context?.previousSelectedCape ?? null);

      showToast({
        severity: "error",
        summary: t("toasts.errorSummary"),
        detail: t("toasts.details.failedToSelectCape"),
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["selectedCape"] });
      showToast({
        severity: "success",
        summary: t("toasts.successSummary.selectedCape"),
        detail: t("toasts.details.selectedCape"),
      });
    },
  });

  const unselectMutation = useMutation({
    mutationFn: async () => {
      await meController!.unselectCape();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["selectedCape"] });

      const previousSelectedCape = queryClient.getQueryData<api.Cape>(["selectedCape"]) ?? null;

      queryClient.setQueryData(["selectedCape"], null);

      return { previousSelectedCape };
    },
    onError: (_error, _newCape, context: { previousSelectedCape: api.Cape | null } | undefined) => {
      queryClient.setQueryData(["selectedCape"], context?.previousSelectedCape ?? null);

      showToast({
        severity: "error",
        summary: t("toasts.errorSummary"),
        detail: t("toasts.details.failedToUnselectCape"),
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["selectedCape"] });
      showToast({
        severity: "success",
        summary: t("toasts.successSummary.unselectedCape"),
        detail: t("toasts.details.unselectedCape"),
      });
    },
  });

  const handleSelect = useCallback(
    (cape: api.Cape) => {
      if (!capeController) return;
      selectMutation.mutate(cape);
    },
    [capeController, selectMutation]
  );

  const handleUnselect = useCallback(() => {
    if (!meController) return;
    unselectMutation.mutate();
  }, [meController, unselectMutation]);

  if (!session) {
    return (
      <Navigate
        to={`/sign-in?redirectTo=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  return capes.length === 0 ? (
    <div className="empty-message">{t("capesPage.noCapes")}</div>
  ) : (
    <>
      <div className="capes-content">
        <div className="input-container">
          <IconField iconPosition="left">
            <InputIcon className="pi pi-search" />
            <InputText
              value={filterValue}
              onChange={(event) => setFilterValue(event.target.value)}
              placeholder={t("capesPage.searchPlaceholder")}
            />
          </IconField>
        </div>
        <div className="capes">
          {capes.map((cape) => (
            <Cape
              key={cape.id}
              cape={cape}
              isSelected={cape.id === selectedCape?.id}
              select={() => handleSelect(cape)}
              unselect={handleUnselect}
            />
          ))}
        </div>
        <Paginator
          first={page}
          rows={MAX_CAPES_PER_PAGE}
          totalRecords={total}
          onPageChange={(event) => {
            setPage(event.first);
          }}
        />
      </div>
    </>
  );
}
