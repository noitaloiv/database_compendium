const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("assets/js/theme-toggle.js", "utf8");

function loadThemeToggle(storedPreference, systemIsDark) {
  const storage = new Map();
  if (storedPreference !== null) {
    storage.set("databaser-theme", storedPreference);
  }

  const lightTheme = { media: "(prefers-color-scheme: light)" };
  const darkTheme = { media: "(prefers-color-scheme: dark)" };
  const button = {
    attributes: {},
    listeners: {},
    addEventListener(name, callback) {
      this.listeners[name] = callback;
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
  };
  const systemPreference = {
    matches: systemIsDark,
    listeners: {},
    addEventListener(name, callback) {
      this.listeners[name] = callback;
    },
  };
  const documentElement = { dataset: {}, style: {} };

  const context = {
    document: {
      documentElement,
      getElementById(id) {
        if (id === "databaser-light-theme") return lightTheme;
        if (id === "databaser-dark-theme") return darkTheme;
        if (id === "theme-toggle") return button;
        return null;
      },
    },
    window: {
      localStorage: {
        getItem(key) {
          return storage.has(key) ? storage.get(key) : null;
        },
        setItem(key, value) {
          storage.set(key, value);
        },
      },
      matchMedia() {
        return systemPreference;
      },
    },
  };

  vm.runInNewContext(source, context);
  return {
    button,
    darkTheme,
    documentElement,
    lightTheme,
    storage,
    systemPreference,
  };
}

const savedDark = loadThemeToggle("dark", false);
assert.equal(savedDark.lightTheme.media, "not all");
assert.equal(savedDark.darkTheme.media, "all");
assert.equal(savedDark.documentElement.dataset.databaserTheme, "dark");
assert.equal(savedDark.button.attributes["aria-pressed"], "true");
assert.match(savedDark.button.attributes["aria-label"], /ljust/);

savedDark.button.listeners.click();
assert.equal(savedDark.lightTheme.media, "all");
assert.equal(savedDark.darkTheme.media, "not all");
assert.equal(savedDark.storage.get("databaser-theme"), "light");

const automatic = loadThemeToggle(null, false);
assert.equal(automatic.documentElement.dataset.databaserTheme, "light");
assert.equal(automatic.button.attributes["aria-pressed"], "false");

automatic.systemPreference.matches = true;
automatic.systemPreference.listeners.change();
assert.equal(automatic.documentElement.dataset.databaserTheme, "dark");

const invalidPreference = loadThemeToggle("sepia", true);
assert.equal(invalidPreference.documentElement.dataset.databaserTheme, "dark");

console.log("Theme toggle behavior: OK");