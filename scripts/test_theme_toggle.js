const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const script = fs.readFileSync("assets/js/theme-toggle.js", "utf8");
const head = fs.readFileSync("_includes/head.html", "utf8");
const bootstrap = head.match(/<script id="databaser-theme-bootstrap">([\s\S]*?)<\/script>/)[1];

function setup(saved, dark) {
  const storage = new Map(saved ? [["databaser-theme", saved]] : []);
  const links = [];
  function element() {
    return {dataset: {}, attributes: {}, listeners: {},
      setAttribute(k, v) { this.attributes[k] = v; },
      removeAttribute(k) { delete this.attributes[k]; },
      addEventListener(k, f) { this.listeners[k] = f; },
      remove() { this.removed = true; }};
  }
  const active = element();
  active.dataset = {lightUrl: "/light.css", darkUrl: "/dark.css"};
  links.push(active);
  const button = element(), status = element();
  const root = {dataset: {}, style: {}, classList: {add() {}}};
  const system = {matches: dark, listeners: {}, addEventListener(k, f) {this.listeners[k] = f;}};
  const window = {matchMedia() {return system;}, listeners: {}, addEventListener(k, f) {this.listeners[k] = f;}};
  const context = {window, localStorage: {getItem(k) {return storage.get(k) || null;}, setItem(k, v) {storage.set(k, v);}},
    document: {documentElement: root, getElementById(id) {return {"databaser-theme-stylesheet":active,"theme-toggle":button,"theme-status":status}[id];},
      createElement: element, head: {appendChild(link) {links.push(link);}}}};
  vm.runInNewContext(bootstrap, context);
  vm.runInNewContext(script, context);
  return {root, active, button, status, system, window, storage, links, newest() {return links.at(-1);}};
}

for (const dark of [true, false]) for (const saved of [null, "dark", "light", "invalid"]) {
  const state = setup(saved, dark);
  const expected = ["light", "dark"].includes(saved) ? saved : dark ? "dark" : "light";
  assert.equal(state.active.href, "/" + expected + ".css");
  assert.equal(state.root.dataset.databaserTheme, expected);
  assert.equal(state.links.length, 1, "Only the selected stylesheet should be requested at startup");
}

const explicit = setup("light", true);
explicit.button.listeners.click({stopPropagation() {}});
assert.equal(explicit.root.dataset.databaserTheme, "light", "Retain the current theme during a slow request");
assert.equal(explicit.active.removed, undefined);
assert.equal(explicit.newest().media, "not all");
assert.equal(explicit.storage.get("databaser-theme"), "light");
explicit.newest().onload();
assert.equal(explicit.root.dataset.databaserTheme, "dark");
assert.equal(explicit.active.removed, true);
assert.equal(explicit.newest().media, "all");
assert.equal(explicit.storage.get("databaser-theme"), "dark");
assert.match(explicit.button.attributes["aria-label"], /ljust/);

const failed = setup("dark", true);
failed.button.listeners.click({stopPropagation() {}});
failed.newest().onerror();
assert.equal(failed.root.dataset.databaserTheme, "dark");
assert.equal(failed.active.removed, undefined);
assert.equal(failed.storage.get("databaser-theme"), "dark");
assert.equal(failed.button.disabled, false);
assert.match(failed.status.textContent, /kunde inte laddas/);

const automatic = setup(null, false);
automatic.system.matches = true;
automatic.system.listeners.change();
automatic.newest().onload();
assert.equal(automatic.root.dataset.databaserTheme, "dark");
assert.equal(automatic.storage.has("databaser-theme"), false);

const override = setup("light", false);
override.system.matches = true;
override.system.listeners.change();
assert.equal(override.links.length, 1, "System changes must not override a saved choice");