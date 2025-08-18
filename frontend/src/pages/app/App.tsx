import "./App.css";

import { Card } from "primereact/card";

import { Header } from "../../components";

export function App() {
  return (
    <div className="app-container">
      <Header />
      <div className="app-content">
        <Card
          title="Hello, Catalyst!"
          className="hello-card"
        >
          <p className="m-0">Hello from PrimeReact application!</p>
        </Card>
      </div>
    </div>
  );
}
