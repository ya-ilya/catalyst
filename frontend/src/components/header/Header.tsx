import "./Header.css";

import { Button } from "primereact/button";
import { Menubar } from "primereact/menubar";
import { useNavigate } from "react-router";

export function Header() {
  const navigate = useNavigate();

  const start = (
    <div className="header-start">
      <a
        href="/"
        className="header-title"
      >
        Catalyst
      </a>
    </div>
  );
  const end = (
    <div className="header-end">
      <Button
        className="header-button"
        label="Configs"
        icon="pi pi-cog"
        onClick={() => navigate("/configs")}
        text
      />
      <Button
        className="header-button"
        label="Username"
        icon="pi pi-user"
        onClick={() => navigate("/account")}
        text
      />
    </div>
  );

  return (
    <Menubar
      start={start}
      end={end}
      className="header"
    />
  );
}
