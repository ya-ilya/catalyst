import "./Subscriptions.css";

import { Config } from "../";
import * as api from "../../api";

type SubscriptionsProps = {
  subscriptions: api.Subscription[];
};

export function Subscriptions(props: SubscriptionsProps) {
  return (
    <div className="subscriptions">
      <h2 className="subscriptions-title">Your configs</h2>
      <div className="subscriptions-content">
        {props.subscriptions.map((subscription) => (
          <Config
            key={subscription.id}
            subscriptions={props.subscriptions}
            config={subscription.config}
          />
        ))}
      </div>
    </div>
  );
}
