import "./Header.css";

import { Button } from "primereact/button";
import { Menubar } from "primereact/menubar";
import { useNavigate } from "react-router";

import { useAuthenticationContext } from "../../api";

export function Header() {
  const navigate = useNavigate();

  const [session] = useAuthenticationContext();

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
      {session?.user?.isAdmin && (
        <Button
          className="header-button"
          label="Admin"
          icon="pi pi-shield"
          onClick={() => navigate("/admin")}
          text
        />
      )}
      {session ? (
        <Button
          className="header-button"
          label={session?.user?.username}
          icon="pi pi-user"
          onClick={() => navigate("/account")}
          text
        />
      ) : (
        <Button
          label="Sign In"
          icon="pi pi-sign-in"
          onClick={() => navigate("/sign-in")}
          outlined
        />
      )}
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
