/* Pedagogical schedules; deliberately not an emulation of SQLite. */
(function () {
  "use strict";
  function state(event, db, committed, a, b, lock) {
    return {event: event, db: db, committed: committed, a: a, b: b, lock: lock || "Inget lås i modellen"};
  }
  var scenarios = {
    lost: {
      purpose: "A tar ut 10 och B tar ut 20. Båda uttagen ska tillsammans ge 70.",
      steps: [
        state("Startvärdet är 100. Ingen har läst ännu.",100,true,null,null),
        state("A läser 100 och behåller det som sitt lokala läsvärde.",100,true,100,null),
        state("B läser också 100. B har ännu inte sett något uttag.",100,true,100,100),
        state("A skriver 100 − 10 = 90. Förändringen är ännu inte godkänd.",90,false,100,100),
        state("A gör COMMIT. Saldot 90 är nu godkänt.",90,true,100,100),
        state("B skriver 100 − 20 = 80 från sitt gamla läsvärde. A:s effekt trängs undan.",80,false,100,100),
        state("B gör COMMIT. Slutvärdet är 80; båda uttagen skulle ha gett 70.",80,true,100,100)
      ]
    },
    dirty: {
      purpose: "B läser ett värde som A ännu inte har godkänt.",
      steps: [
        state("Startvärdet är 100.",100,true,null,null),
        state("A läser 100.",100,true,100,null),
        state("A skriver 90 men gör ännu inte COMMIT.",90,false,100,null),
        state("B läser 90. Detta är den smutsiga läsningen: A:s förändring är inte godkänd.",90,false,100,90),
        state("A gör ROLLBACK. Saldot återgår till 100, men B har redan läst 90.",100,true,100,90)
      ]
    },
    repeat: {
      purpose: "A läser samma saldo två gånger inom sin transaktion.",
      steps: [
        state("Startvärdet är 100.",100,true,null,null),
        state("A:s första läsning ger 100.",100,true,100,null),
        state("B läser 100 för sitt uttag.",100,true,100,100),
        state("B skriver 80.",80,false,100,100),
        state("B gör COMMIT. Den nya uppgiften är godkänd.",80,true,100,100),
        state("A läser igen och får 80. Läsningen är inte smutsig, men svaret har ändrats.",80,true,80,100)
      ]
    },
    locked: {
      purpose: "A och B begär X-lås före läsningen och håller det tills de godkänner.",
      steps: [
        state("Startvärdet är 100.",100,true,null,null),
        state("A får X-lås på saldot.",100,true,null,null,"A har X-lås"),
        state("A läser 100.",100,true,100,null,"A har X-lås"),
        state("B begär X-lås och måste vänta. B har ännu inget läsvärde.",100,true,100,null,"A har X-lås; B väntar"),
        state("A skriver 90 medan B väntar.",90,false,100,null,"A har X-lås; B väntar"),
        state("A gör COMMIT och släpper låset.",90,true,100,null),
        state("B får X-låset och läser nu 90.",90,true,100,90,"B har X-lås"),
        state("B skriver 90 − 20 = 70.",70,false,100,90,"B har X-lås"),
        state("B gör COMMIT och släpper låset. Båda uttagen finns med: 70 återstår.",70,true,100,90)
      ]
    }
  };
  // One schedule row per model step. Actions remain in their transaction's column.
  var actions = {
    lost: [["", ""], ["Läser 100", ""], ["", "Läser 100"],
      ["Skriver 90", ""], ["COMMIT", ""], ["", "Skriver 80 från läsvärdet 100"], ["", "COMMIT"]],
    dirty: [["", ""], ["Läser 100", ""], ["Skriver 90", ""],
      ["", "Läser 90 före A:s COMMIT"], ["ROLLBACK", ""]],
    repeat: [["", ""], ["Läser 100", ""], ["", "Läser 100"],
      ["", "Skriver 80"], ["", "COMMIT"], ["Läser 80 igen", ""]],
    locked: [["", ""], ["Får X-lås", ""], ["Läser 100", ""],
      ["", "Begär X-lås; väntar"], ["Skriver 90", "Väntar"],
      ["COMMIT; släpper låset", ""], ["", "Får X-lås; läser 90"],
      ["", "Skriver 70"], ["", "COMMIT; släpper låset"]]
  };
  Object.keys(scenarios).forEach(function (key) {
    scenarios[key].steps.forEach(function (s, i) {
      s.aAction = actions[key][i][0];
      s.bAction = actions[key][i][1];
    });
  });
  // Expose the schedule data only to the local Node verification script.
  if (typeof module !== "undefined" && module.exports) module.exports = scenarios;
  if (typeof document === "undefined") return;
  document.querySelectorAll("[data-transaction-lab]").forEach(function (root) {
    var choice = root.querySelector("select");
    var next = root.querySelector("[data-lab-next]");
    var step = 0;
    var body = root.querySelector("[data-lab-rows]");
    function schedule(scenario) {
      body.replaceChildren();
      scenario.steps.forEach(function (s, i) {
        var row = document.createElement("tr");
        if (i === step) row.setAttribute("aria-current", "step");
        var cells = [String(i) + (i === step ? " · Nu" : ""), s.aAction || "—",
          s.bAction || "—", s.db + (s.committed ? " · godkänt" : " · ej godkänt")];
        cells.forEach(function (value, column) {
          var cell = document.createElement(column === 0 ? "th" : "td");
          if (column === 0) cell.setAttribute("scope", "row");
          cell.textContent = value;
          row.appendChild(cell);
        });
        body.appendChild(row);
      });
    }
    function put(selector, value) { root.querySelector(selector).textContent = value; }
    function render() {
      var scenario = scenarios[choice.value];
      var s = scenario.steps[step];
      put("[data-lab-purpose]", scenario.purpose);
      put("[data-lab-step]", "Steg " + step + " av " + (scenario.steps.length - 1));
      put("[data-lab-status]", s.event);
      put("[data-lab-db]", s.db + (s.committed ? " · godkänt" : " · ännu inte godkänt"));
      put("[data-lab-a]", s.a === null ? "Har inte läst" : s.a);
      put("[data-lab-b]", s.b === null ? "Har inte läst" : s.b);
      put("[data-lab-lock]", s.lock);
      schedule(scenario);
      next.disabled = step === scenario.steps.length - 1;
    }
    next.addEventListener("click", function () {
      if (step < scenarios[choice.value].steps.length - 1) step += 1;
      render();
    });
    function reset() { step = 0; render(); }
    root.querySelector("[data-lab-reset]").addEventListener("click", reset);
    choice.addEventListener("change", reset);
    render();
    root.hidden = false;
  });
}());