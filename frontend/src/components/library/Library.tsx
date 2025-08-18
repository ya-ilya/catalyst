import "./Library.css";

import { Config } from "../";

export function Library() {
  const configs = [
    {
      id: "1",
      name: "Super-config",
      author: "cattyn",
      configId: "pojfslk",
    },
    {
      id: "2",
      name: "My-config",
      author: "ya_ilya",
      configId: "pojfslk",
    },
  ];

  return (
    <div className="library">
      <h2 className="library-title">Library</h2>
      <div className="library-content">
        {configs.map((config) => {
          return (
            <Config
              key={config.id}
              config={config}
            />
          );
        })}
      </div>
    </div>
  );
}
