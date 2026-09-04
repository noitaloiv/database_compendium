const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("assets/js/theme-toggle.js", "utf8");

function loadThemeToggle(storedPreference, systemIsDark) {
  const storage = new Map();
  if (storedPreference !== null) {
    storage.set("databaser-theme", storedPreference);
  }

  const darkTheme = { media: "(prefers-color-scheme: dark)" };
  const selector = {
    value: null,
    listeners: {},
    addEventListener(name, callback) {
      this.listeners[name] = callback;
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
        if (id === "databaser-dark-theme") return darkTheme;
        if (id === "theme-preference") return selector;
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
        removeItem(key) {
          storage.delete(key);
        },
      },
      matchMedia() {
        return systemPreference;
      },
    },
  };

  vm.runInNewContext(source, context);
  return { darkTheme, documentElement, selector, storage, systemPreference };
}

const savedDark = loadThemeToggle("dark", false);
assert.equal(savedDark.darkTheme.media, "all");
assert.equal(savedDark.documentElement.dataset.databaserTheme, "dark");
assert.equal(savedDark.selector.value, "dark");

savedDark.selector.listeners.change({ target: { value: "light" } });
assert.equal(savedDark.darkTheme.media, "not all");
assert.equal(savedDark.storage.get("databaser-theme"), "light");

const automatic = loadThemeToggle(null, false);
assert.equal(automatic.darkTheme.media, "(prefers-color-scheme: dark)");
assert.equal(automatic.documentElement.dataset.databaserTheme, "light");
assert.equal(automatic.selector.value, "system");

automatic.systemPreference.matches = true;
automatic.systemPreference.listeners.change();
assert.equal(automatic.documentElement.dataset.databaserTheme, "dark");

const invalidPreference = loadThemeToggle("sepia", true);
assert.equal(invalidPreference.selector.value, "system");
assert.equal(invalidPreference.documentElement.dataset.databaserTheme, "dark");

console.log("Theme preference behavior: OK");
