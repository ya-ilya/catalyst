import "./Capes.css";

import { useDebounce } from "primereact/hooks";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Paginator } from "primereact/paginator";
import { useCallback, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";

import { useMutation, useQuery } from "@tanstack/react-query";

import { queryClient } from "../..";
import * as api from "../../api";
import { Cape, Header } from "../../components";
import { useAuthenticationContext, useToastContext } from "../../contexts";

const MAX_CAPES_PER_PAGE = 24;

export function Capes() {
  const capeController = api.useCapeController();
  const meController = api.useMeController();

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
        summary: "Error",
        detail: "Failed to fetch capes.",
      });
    }
  }, [capesError]);

  useEffect(() => {
    if (selectedCapeError) {
      console.error("Failed to fetch selected cape: ", selectedCapeError);
      showToast({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch selected cape.",
      });
    }
  }, [selectedCapeError]);

  const selectMutation = useMutation({
    mutationFn: async (cape: api.Cape) => {
      await capeController!.select(cape.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["selectedCape"] });
      showToast({
        severity: "success",
        summary: "Selected",
        detail: "You have successfully selected the cape.",
      });
    },
    onError: () => {
      showToast({
        severity: "error",
        summary: "Error",
        detail: "Failed to select cape.",
      });
    },
  });

  const unselectMutation = useMutation({
    mutationFn: async () => {
      await meController!.unselectCape();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["selectedCape"] });
      showToast({
        severity: "success",
        summary: "Unselected",
        detail: "You have successfully unselected the cape.",
      });
    },
    onError: () => {
      showToast({
        severity: "error",
        summary: "Error",
        detail: "Failed to unselect cape.",
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

  return (
    <div className="capes-container">
      <Header />
      {capes.length === 0 ? (
        <div className="empty-message">No capes available.</div>
      ) : (
        <>
          <div className="capes-content">
            <div className="input-container">
              <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText
                  value={filterValue}
                  onChange={(event) => setFilterValue(event.target.value)}
                  placeholder="Search in capes by name"
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
      )}
    </div>
  );
}
