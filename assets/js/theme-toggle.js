(function () {
  "use strict";

  var storageKey = "databaser-theme";
  var lightTheme = document.getElementById("databaser-light-theme");
  var darkTheme = document.getElementById("databaser-dark-theme");
  var button = document.getElementById("theme-toggle");
  var systemPreference = window.matchMedia
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

  if (!lightTheme || !darkTheme || !button) {
    return;
  }

  function storedPreference() {
    try {
      var value = window.localStorage.getItem(storageKey);
      return value === "light" || value === "dark" ? value : null;
    } catch (error) {
      return null;
    }
  }

  function systemTheme() {
    return systemPreference && systemPreference.matches ? "dark" : "light";
  }

  function applyTheme(theme, persist) {
    lightTheme.media = theme === "light" ? "all" : "not all";
    darkTheme.media = theme === "dark" ? "all" : "not all";

    document.documentElement.dataset.databaserTheme = theme;
    document.documentElement.style.colorScheme = theme;

    var nextTheme = theme === "dark" ? "ljust" : "mörkt";
    button.setAttribute("aria-label", "Byt till " + nextTheme + " tema");
    button.setAttribute("title", "Byt till " + nextTheme + " tema");
    button.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");

    if (persist) {
      try {
        window.localStorage.setItem(storageKey, theme);
      } catch (error) {
        // The chosen theme still applies for the current page view.
      }
    }
  }

  button.addEventListener("click", function () {
    var current = document.documentElement.dataset.databaserTheme || systemTheme();
    applyTheme(current === "dark" ? "light" : "dark", true);
  });

  function handleSystemChange() {
    if (!storedPreference()) {
      applyTheme(systemTheme(), false);
    }
  }

  if (systemPreference && systemPreference.addEventListener) {
    systemPreference.addEventListener("change", handleSystemChange);
  } else if (systemPreference && systemPreference.addListener) {
    systemPreference.addListener(handleSystemChange);
  }

  applyTheme(storedPreference() || systemTheme(), false);
}());
