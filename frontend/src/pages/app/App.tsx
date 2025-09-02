import "./App.css";

import { Card } from "primereact/card";

export function App() {
  return (
    <div className="app-content">
      <Card
        title="Hello, Catalyst!"
        className="hello-card"
      >
        <p style={{ margin: 0 }}>Hello from PrimeReact application!</p>
      </Card>
    </div>
  );
}
