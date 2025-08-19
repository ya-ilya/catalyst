import "./Subscriptions.css";

import { ToastMessage } from "primereact/toast";

import { Config } from "../";
import * as api from "../../api";

type SubscriptionsProps = {
  showToast: (message: ToastMessage) => void;
  subscriptions: api.Subscription[];
  updateSubscriptions: () => void;
  updateConfigs: () => void;
};

export function Subscriptions(props: SubscriptionsProps) {
  return (
    <div className="subscriptions">
      <h2 className="subscriptions-title">Subscriptions</h2>
      <div className="subscriptions-content">
        {props.subscriptions.map((subscription) => (
          <Config
            key={subscription.id}
            showToast={props.showToast}
            config={subscription.config}
            subscriptions={props.subscriptions}
            updateSubscriptions={props.updateSubscriptions}
            updateConfigs={props.updateConfigs}
          />
        ))}
      </div>
    </div>
  );
}
