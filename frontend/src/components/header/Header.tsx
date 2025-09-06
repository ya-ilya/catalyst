import "./Header.css";

import { GB, RU } from "country-flag-icons/react/3x2";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Menubar } from "primereact/menubar";
import { memo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { useAuthenticationContext, useThemeContext } from "../../contexts";

type LanguageOption = {
  label: string;
  value: string;
};

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { label: "Русский", value: "ru" },
  { label: "English", value: "en" },
];

export const Header = memo(() => {
  const { i18n, t } = useTranslation("header");
  const navigate = useNavigate();

  const [language, setLanguage] = useState<"ru" | "en">(i18n.language as "ru" | "en");

  const [session] = useAuthenticationContext();
  const [isDarkMode, toggleTheme] = useThemeContext();

  const handleLanguageChange = useCallback(
    (language: "ru" | "en") => {
      setLanguage(language);
      i18n.changeLanguage(language);
    },
    [i18n]
  );

  const items = [
    {
      label: t("navigation.configs"),
      icon: "pi pi-cog",
      command: () => navigate("/configs"),
    },
    {
      label: t("navigation.capes"),
      icon: (
        <span className="pi p-menuitem-icon">
          <svg
            viewBox="0 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: 14, height: 14 }}
          >
            <path
              fill="currentColor"
              d="M257.1 18.46c-17 19.58-32.7 35.31-55.1 42.98 41.5 68.46 139.9 119.76 241.2 62.36 18-14.1 26.7-31.45 34.9-47.34-98.9-5.45-164.8-19.81-221-58zM225 111.1c-18.9 38.3-41 72.2-65.1 100.2-40.8 47.5-87.03 78.7-132.67 85.3 6.47 19.8 10.43 59.2 25.84 72.6 45.63 18.5 132.83-9.1 164.63-38.7 16.1-16.4 24-36.6 34.2-60.9-2 35.2-13.3 56.6-27.7 72.4-18.5 18.2-36.6 30.8-59 37.8 11.9 22.3 16.8 49.7 27.7 67.8 4.4 6.7 8 9.5 14.6 9.4 42-10.9 74.4-45.9 110.9-60.5 55.3-29.3 65.3-74 67-85.5-1.1 28.7-12.7 67.5-31.7 83.6 33.8 12.4 47.5 67.3 52.3 90.2 15.2-14 33.2-35.4 48.1-60.1C473 393.5 487 357.2 487 324.2c-.3-38.8-17-76.4-26.5-118.2-5-21.7-7.7-44.7-4.6-69.3-131.7 55.7-190.9 9.4-230.9-25.6z"
            />
          </svg>
        </span>
      ),
      command: () => navigate("/capes"),
    },
    {
      label: t("navigation.admin"),
      icon: "pi pi-shield",
      visible: session?.user?.isAdmin,
      command: () => navigate("/admin"),
    },
  ];

  const languageValueTemplate = useCallback((option: LanguageOption, props: any) => {
    if (option) {
      return (
        <div className="language-option">
          {option.value == "en" ? <GB className="flag" /> : <RU className="flag" />}
          <div className="label">{option.label}</div>
        </div>
      );
    }

    return <span>{props.placeholder}</span>;
  }, []);

  const languageOptionTemplate = useCallback((option: LanguageOption) => {
    return (
      <div className="language-option">
        {option.value == "en" ? <GB className="flag" /> : <RU className="flag" />}
        <div className="label">{option.label}</div>
      </div>
    );
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
      <div className="header-language">
        <Dropdown
          value={language}
          options={LANGUAGE_OPTIONS}
          onChange={(event) => handleLanguageChange(event.value as "ru" | "en")}
          optionLabel="label"
          valueTemplate={languageValueTemplate}
          itemTemplate={languageOptionTemplate}
          className="header-language-dropdown"
          placeholder={language.toUpperCase()}
        />
      </div>
      <Button
        className="header-button"
        icon={isDarkMode ? "pi pi-sun" : "pi pi-moon"}
        onClick={() => toggleTheme()}
        rounded
        text
      />
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
          label={t("auth.signIn")}
          icon="pi pi-sign-in"
          onClick={() => navigate("/sign-in")}
          outlined
        />
      )}
    </div>
  );

  return (
    <Menubar
      model={items}
      start={start}
      end={end}
      className="header"
    />
  );
});
