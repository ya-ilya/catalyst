import "./Capes.css";

import { Toast } from "primereact/toast";
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";

import * as api from "../../api";
import { Header } from "../../components";
import { Cape } from "../../components/cape/Cape";
import { useAuthenticationContext } from "../../contexts";
import { useToast } from "../../hooks";

export function Capes() {
  const capeController = api.useCapeController();
  const meController = api.useMeController();

  const [selectedCape, setSelectedCape] = useState<api.Cape | null>(null);
  const [capes, setCapes] = useState<api.Cape[]>([]);

  const [session] = useAuthenticationContext();

  const [toast, showToast] = useToast();

  const location = useLocation();

  useEffect(() => {
    meController?.getCape().then((cape) => {
      setSelectedCape(cape);
    });
  });

  useEffect(() => {
    capeController
      ?.getCapes()
      .then((capes) => {
        setCapes(capes);
      })
      .catch((error) => {
        console.error("Failed to fetch capes: ", error);
        showToast({
          severity: "error",
          summary: "Error",
          detail: "Failed to fetch capes.",
        });
      });
  }, [capeController]);

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
      <Toast ref={toast} />
      <Header />
      <div className="capes-content">
        {capes.map((cape) => {
          return (
            <Cape
              cape={cape}
              isSelected={cape.id == selectedCape?.id}
            />
          );
        })}
      </div>
    </div>
  );
}
