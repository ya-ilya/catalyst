import React, { createContext, useContext, useEffect } from "react";

import { useLocalStorage } from "../hooks";

export function useThemeContext() {
  return useContext(ThemeContext);
}

export const ThemeContext = createContext<[isDarkMode: boolean | null, toggleTheme: () => void]>([null, () => {}]);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useLocalStorage(
    "isDarkMode",
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    const themeLink = document.getElementById("theme-link") as HTMLLinkElement;

    if (!themeLink) {
      console.error("Theme link element not found");
      return;
    }

    const theme = isDarkMode ? "lara-dark-indigo" : "lara-light-indigo";
    themeLink.href = `themes/${theme}/theme.css`;

    document.body.classList.toggle("dark", isDarkMode ?? undefined);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return <ThemeContext.Provider value={[isDarkMode, toggleTheme]}>{children}</ThemeContext.Provider>;
};
