(function () {
  "use strict";

  var storageKey = "databaser-theme";
  var darkTheme = document.getElementById("databaser-dark-theme");
  var selector = document.getElementById("theme-preference");
  var systemPreference = window.matchMedia
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

  if (!darkTheme || !selector) {
    return;
  }

  function readPreference() {
    try {
      var stored = window.localStorage.getItem(storageKey);
      return stored === "light" || stored === "dark" ? stored : "system";
    } catch (error) {
      return "system";
    }
  }

  function resolvedTheme(preference) {
    if (preference !== "system") {
      return preference;
    }
    return systemPreference && systemPreference.matches ? "dark" : "light";
  }

  function applyTheme(preference, persist) {
    if (preference === "dark") {
      darkTheme.media = "all";
    } else if (preference === "light") {
      darkTheme.media = "not all";
    } else {
      darkTheme.media = "(prefers-color-scheme: dark)";
    }

    if (persist) {
      try {
        if (preference === "system") {
          window.localStorage.removeItem(storageKey);
        } else {
          window.localStorage.setItem(storageKey, preference);
        }
      } catch (error) {
        // The selected theme still applies for the current page view.
      }
    }

    var resolved = resolvedTheme(preference);
    document.documentElement.dataset.databaserTheme = resolved;
    document.documentElement.style.colorScheme = resolved;
    selector.value = preference;
  }

  selector.addEventListener("change", function (event) {
    applyTheme(event.target.value, true);
  });

  function handleSystemChange() {
      if (readPreference() === "system") {
        applyTheme("system", false);
      }
  }

  if (systemPreference && systemPreference.addEventListener) {
    systemPreference.addEventListener("change", handleSystemChange);
  } else if (systemPreference && systemPreference.addListener) {
    systemPreference.addListener(handleSystemChange);
  }

  applyTheme(readPreference(), false);
}());
