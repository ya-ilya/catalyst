(function initializeTheme() {
  const darkTheme = "lara-dark-indigo";
  const lightTheme = "lara-light-indigo";
  const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const storedDarkMode = localStorage.getItem("isDarkMode");
  const darkMode = storedDarkMode !== null ? storedDarkMode === "true" : prefersDarkMode;

  const themeLink = document.getElementById("theme-link");
  if (themeLink) {
    themeLink.href = "themes/" + (darkMode ? darkTheme : lightTheme) + "/theme.css";
  }
})();
