import "./Header.css";

import { Button } from "primereact/button";
import { Menubar } from "primereact/menubar";
import { useEffect } from "react";
import { useNavigate } from "react-router";

import { useAuthenticationContext } from "../../api";
import { useLocalStorage } from "../../hooks";

export function Header() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage("isDarkMode", false);

  const navigate = useNavigate();

  const [session] = useAuthenticationContext();

  useEffect(() => {
    const themeLink = document.getElementById("theme-link") as HTMLLinkElement;

    if (!themeLink) {
      console.error("Theme link element not found");
      return;
    }

    const theme = isDarkMode ? "lara-dark-indigo" : "lara-light-indigo";
    themeLink.href = `themes/${theme}/theme.css`;
  }, [isDarkMode]);

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
        icon={isDarkMode ? "pi pi-sun" : "pi pi-moon"}
        onClick={() => setIsDarkMode(!isDarkMode)}
        rounded
        text
      />
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
