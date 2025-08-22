import "./Capes.css";

import { Toast } from "primereact/toast";
import { useEffect, useState } from "react";

import * as api from "../../api";
import { Header } from "../../components";
import { Cape } from "../../components/cape/Cape";
import { useToast } from "../../hooks";

export function Capes() {
  // const [cape, setCape] = useState<string | null>(null);
  const capeController = api.useCapeController();

  const [capes, setCapes] = useState<api.Cape[]>([]);

  const [toast, showToast] = useToast();

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

  return (
    <div className="capes-container">
      <Toast ref={toast} />
      <Header />
      <div className="capes-content">
        {capes.map((cape) => {
          return <Cape cape={cape} />;
        })}
      </div>
    </div>
  );
}
