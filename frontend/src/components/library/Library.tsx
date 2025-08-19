import "./Library.css";

import { ToastMessage } from "primereact/toast";

import { Config } from "../";
import * as api from "../../api";

type LibraryProps = {
  showToast: (message: ToastMessage) => void;
  configs: api.Config[];
  subscriptions: api.Subscription[];
  updateSubscriptions: () => void;
  updateConfigs: () => void;
};

export function Library(props: LibraryProps) {
  return (
    <div className="library">
      <h2 className="library-title">Library</h2>
      <div className="library-content">
        {props.configs.map((config) => {
          return (
            <Config
              key={config.id}
              showToast={props.showToast}
              config={config}
              subscriptions={props.subscriptions}
              updateSubscriptions={props.updateSubscriptions}
              updateConfigs={props.updateConfigs}
            />
          );
        })}
      </div>
    </div>
  );
}
