"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync("assets/js/transaction-lab.js", "utf8");
function element() {
  return {textContent: "", disabled: false, hidden: true, listeners: {}, children: [], attributes: {},
    appendChild(child) { this.children.push(child); },
    replaceChildren() { this.children = []; },
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, action) { this.listeners[name] = action; }};
}
const nodes = Object.fromEntries([
  "select", "[data-lab-next]", "[data-lab-reset]", "[data-lab-purpose]",
  "[data-lab-step]", "[data-lab-status]", "[data-lab-db]", "[data-lab-a]",
  "[data-lab-b]", "[data-lab-lock]", "[data-lab-rows]"
].map(key => [key, element()]));
nodes.select.value = "lost";
const root = {hidden: true, querySelector: key => nodes[key]};
vm.runInNewContext(source, {document: {querySelectorAll: () => [root], createElement: element}});
assert.equal(root.hidden, false);
assert.equal(nodes["[data-lab-rows]"].children.length, 7);
assert.equal(nodes["[data-lab-rows]"].children[0].attributes["aria-current"], "step");
assert.equal(nodes["[data-lab-b]"].textContent, "Har inte läst");
function finish() {
  let count = 0;
  while (!nodes["[data-lab-next]"].disabled && count++ < 30) {
    nodes["[data-lab-next]"].listeners.click();
  }
  assert.ok(count < 30, "Schedule must finish");
}
finish();
assert.equal(nodes["[data-lab-db]"].textContent, "80 · godkänt");
assert.equal(nodes["[data-lab-b]"].textContent, 100, "Old local value must remain visible");
nodes["[data-lab-reset]"].listeners.click();
assert.equal(nodes["[data-lab-next]"].disabled, false);
assert.equal(nodes["[data-lab-db]"].textContent, "100 · godkänt");
for (const [name, result] of [["dirty",100],["repeat",80],["locked",70]]) {
  nodes.select.value = name;
  nodes.select.listeners.change();
  assert.equal(nodes["[data-lab-step]"].textContent.startsWith("Steg 0"), true);
  finish();
  assert.equal(nodes["[data-lab-db]"].textContent, result + " · godkänt");
}
assert.equal(nodes["[data-lab-b]"].textContent, 90, "Waiting writer reads the new value");
const rows = nodes["[data-lab-rows]"].children;
assert.equal(rows.length, 9);
assert.equal(rows.filter(row => row.attributes["aria-current"] === "step").length, 1);
assert.equal(rows[8].attributes["aria-current"], "step");
assert.match(rows[3].children[2].textContent, /väntar/);
assert.match(rows[6].children[2].textContent, /läser 90/);