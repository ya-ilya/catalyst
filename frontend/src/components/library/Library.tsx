import "./Library.css";

import { Config } from "../";
import * as api from "../../api";

type LibraryProps = {
  configs: api.Config[];
  subscriptions: api.Subscription[];
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
              subscriptions={props.subscriptions}
              config={config}
            />
          );
        })}
      </div>
    </div>
  );
}
