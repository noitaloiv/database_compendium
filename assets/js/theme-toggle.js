(function () {
  "use strict";
  var root = document.documentElement;
  var active = document.getElementById("databaser-theme-stylesheet");
  var button = document.getElementById("theme-toggle");
  var status = document.getElementById("theme-status");
  if (!active || !button) return;
  var urls = { light: active.dataset.lightUrl, dark: active.dataset.darkUrl };
  var system = window.matchMedia("(prefers-color-scheme: dark)");
  var pending = null;
  var revision = 0;

  function preference() {
    try {
      var value = localStorage.getItem("databaser-theme");
      return value === "light" || value === "dark" ? value : null;
    } catch (error) { return null; }
  }

  function describe(theme) {
    var label = "Byt till " + (theme === "dark" ? "ljust" : "mörkt") + " tema";
    button.setAttribute("aria-label", label);
    button.title = label;
  }

  function change(theme, persist) {
    var request = ++revision;
    if (pending) { pending.remove(); pending = null; }
    button.disabled = false;
    button.removeAttribute("aria-busy");
    if (theme === root.dataset.databaserTheme) return;

    var next = document.createElement("link");
    next.rel = "stylesheet";
    next.media = "not all";
    next.href = urls[theme];
    pending = next;
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    if (status) status.textContent = "";

    next.onload = function () {
      if (request !== revision) return;
      // Activate the complete new sheet before removing the old one.
      next.media = "all";
      active.remove();
      next.id = "databaser-theme-stylesheet";
      next.dataset.theme = theme;
      next.dataset.lightUrl = urls.light;
      next.dataset.darkUrl = urls.dark;
      active = next;
      pending = null;
      root.dataset.databaserTheme = theme;
      root.style.colorScheme = theme;
      describe(theme);
      if (persist) {
        try { localStorage.setItem("databaser-theme", theme); } catch (error) {}
      }
      button.disabled = false;
      button.removeAttribute("aria-busy");
    };
    next.onerror = function () {
      if (request !== revision) return;
      next.remove();
      pending = null;
      button.disabled = false;
      button.removeAttribute("aria-busy");
      if (status) status.textContent = "Temat kunde inte laddas. Försök igen.";
    };
    document.head.appendChild(next);
  }

  button.addEventListener("pointerdown", function (event) {
    // Keep an open mobile search in place until this click has completed.
    if (document.activeElement && document.activeElement.id === "search-input" &&
        root.classList.contains("search-active")) event.preventDefault();
  });
  ["search-input", "search-results"].forEach(function (id) {
    var element = document.getElementById(id);
    if (!element) return;
    element.addEventListener("focusout", function (event) {
      // Just the Docs otherwise dismisses search when its theme control gains focus.
      if (event.relatedTarget && button.contains(event.relatedTarget)) event.stopImmediatePropagation();
    }, true);
  });
  button.addEventListener("click", function (event) {
    event.stopPropagation();
    change(root.dataset.databaserTheme === "dark" ? "light" : "dark", true);
  });
  system.addEventListener("change", function () {
    if (!preference()) change(system.matches ? "dark" : "light", false);
  });
  window.addEventListener("storage", function (event) {
    if (event.key === "databaser-theme" || event.key === null) {
      change(preference() || (system.matches ? "dark" : "light"), false);
    }
  });
  describe(root.dataset.databaserTheme);
}());