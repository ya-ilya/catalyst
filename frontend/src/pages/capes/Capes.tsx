import "./Capes.css";

import { useCallback, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";

import * as api from "../../api";
import { Cape, Header } from "../../components";
import { useAuthenticationContext, useToastContext } from "../../contexts";

export function Capes() {
  const capeController = api.useCapeController();
  const meController = api.useMeController();

  const [selectedCape, setSelectedCape] = useState<api.Cape | null>(null);
  const [capes, setCapes] = useState<api.Cape[]>([]);

  const [session] = useAuthenticationContext();
  const [showToast] = useToastContext();

  const location = useLocation();

  const updateSelectedCape = useCallback(async () => {
    if (!meController) return;

    try {
      const cape = await meController.getUser();
      setSelectedCape(cape.cape ?? null);
    } catch (error) {
      console.error("Failed to fetch selected cape: ", error);
      showToast({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch selected cape.",
      });
    }
  }, [meController]);

  const updateCapes = useCallback(async () => {
    if (!capeController) return;

    try {
      const capes = await capeController.getCapes();
      setCapes(capes);
    } catch (error) {
      console.error("Failed to fetch capes: ", error);
      showToast({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch capes.",
      });
    }
  }, [capeController]);

  useEffect(() => {
    updateSelectedCape();
  }, [updateSelectedCape]);

  useEffect(() => {
    updateCapes();
  }, [updateCapes]);

  const handleSelect = useCallback(
    async (cape: api.Cape) => {
      if (!capeController) return;

      try {
        await capeController.select(cape.id);
        await updateSelectedCape();

        showToast({
          severity: "success",
          summary: "Selected",
          detail: "You have successfully selected the cape.",
        });
      } catch (error) {
        console.error("Failed to select cape: ", error);
        showToast({
          severity: "error",
          summary: "Error",
          detail: "Failed to select cape",
        });
      }
    },
    [capeController, updateSelectedCape]
  );

  const handleUnselect = useCallback(async () => {
    if (!meController) return;

    try {
      await meController.unselectCape();
      await updateSelectedCape();

      showToast({
        severity: "success",
        summary: "Unselected",
        detail: "You have successfully unselected the cape.",
      });
    } catch (error) {
      console.error("Failed to unselect cape: ", error);
      showToast({
        severity: "error",
        summary: "Error",
        detail: "Failed to unselect cape",
      });
    }
  }, [meController, updateSelectedCape]);

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
      <div className="capes-content">
        {capes.map((cape) => {
          return (
            <Cape
              key={cape.id}
              cape={cape}
              isSelected={cape.id == selectedCape?.id}
              select={() => handleSelect(cape)}
              unselect={handleUnselect}
            />
          );
        })}
      </div>
    </div>
  );
}
