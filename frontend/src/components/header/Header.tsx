import "./Header.css";

import { Button } from "primereact/button";
import { Menubar } from "primereact/menubar";
import { memo, useEffect } from "react";
import { useNavigate } from "react-router";

import { useAuthenticationContext, useThemeContext } from "../../contexts";

export const Header = memo(() => {
  const navigate = useNavigate();

  const [session] = useAuthenticationContext();
  const [isDarkMode, toggleTheme] = useThemeContext();

  useEffect(() => {
    try {
      // Because we don't have any menu YET. And this thing is interfering with accessibility
      (document.getElementsByClassName("p-menubar-button")[0] as HTMLElement).remove();
      (document.getElementsByClassName("p-menubar-root-list")[0] as HTMLElement).remove();
    } catch (error) {
      // Ignore
    }
  }, []);

  const start = (
    <div className="header-start">
      <Button
        className="title"
        label="Catalyst"
        onClick={() => navigate("/")}
        link
        text
      />
    </div>
  );
  const end = (
    <div className="header-end">
      <Button
        className="header-button"
        icon={isDarkMode ? "pi pi-sun" : "pi pi-moon"}
        onClick={() => toggleTheme()}
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
});
