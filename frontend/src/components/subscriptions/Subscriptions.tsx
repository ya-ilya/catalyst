import "./Subscriptions.css";

import { Config } from "../";

export function Subscriptions() {
  const subscriptions = [
    {
      id: "1",
      name: "Secret-config",
      author: "ya_ilya",
      configId: "cjHapdfe",
    },
    {
      id: "2",
      name: "My-config",
      author: "other_user",
      configId: "pojfslk",
    },
    {
      id: "3",
      name: "My-config",
      author: "other_user",
      configId: "pojfslk",
    },
    {
      id: "4",
      name: "My-config",
      author: "other_user",
      configId: "pojfslk",
    },
    {
      id: "5",
      name: "My-config",
      author: "other_user",
      configId: "pojfslk",
    },
  ];

  return (
    <div className="subscriptions">
      <h2 className="subscriptions-title">Your configs</h2>
      <div className="subscriptions-content">
        {subscriptions.map((subscription) => (
          <Config
            key={subscription.id}
            config={subscription}
          />
        ))}
      </div>
    </div>
  );
}
