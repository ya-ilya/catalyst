import "./Configs.css";

import { Header, Library, Subscriptions } from "../../components";

export function Configs() {
  return (
    <div className="configs-container">
      <Header />
      <div className="configs-content">
        <Subscriptions />
        <Library />
      </div>
    </div>
  );
}
