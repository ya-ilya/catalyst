import "./App.css";

import { Card } from "primereact/card";

export function App() {
  return (
    <div className="app-container">
      <Card
        title="Hello, Catalyst!"
        className="hello-card"
      >
        <p className="m-0">Hello from PrimeReact application!</p>
      </Card>
    </div>
  );
}
