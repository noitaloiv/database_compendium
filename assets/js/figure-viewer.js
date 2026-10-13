(function () {
  "use strict";
  if (!window.HTMLDialogElement || !HTMLDialogElement.prototype.showModal) return;
  var images = document.querySelectorAll("main figure img");
  if (!images.length) return;

  var dialog = document.createElement("dialog");
  dialog.className = "figure-dialog";
  dialog.setAttribute("aria-labelledby", "figure-dialog-title");
  dialog.innerHTML = '<div class="figure-dialog-header">' +
    '<h2 id="figure-dialog-title">Figur</h2>' +
    '<button type="button" data-zoom aria-pressed="false">Förstora</button>' +
    '<button type="button" data-close autofocus>Stäng ×</button></div>' +
    '<div class="figure-dialog-stage" tabindex="0" aria-label="Bildyta, rulla vid behov">' +
    '<img alt=""></div><div class="figure-dialog-caption"></div>';
  document.body.appendChild(dialog);
  var stage = dialog.querySelector(".figure-dialog-stage");
  var enlarged = stage.querySelector("img");
  var title = dialog.querySelector("h2");
  var caption = dialog.querySelector(".figure-dialog-caption");
  var zoom = dialog.querySelector("[data-zoom]");
  var close = dialog.querySelector("[data-close]");
  var opener = null;
  var previousOverflow = "";

  function tidyCaption(source) {
    var copy = source.cloneNode(true);
    copy.querySelectorAll('a[href$=".svg"]').forEach(function (link) {
      var next = link.nextSibling;
      if (next && next.nodeType === Node.TEXT_NODE) next.textContent = next.textContent.replace(/^\s*\./, "");
      link.remove();
    });
    return copy;
  }

  images.forEach(function (image) {
    var figure = image.closest("figure");
    var sourceCaption = figure.querySelector("figcaption");
    if (!sourceCaption || image.closest("button, a")) return;
    var label = sourceCaption.querySelector("strong");
    var name = label ? label.textContent.replace(/\.$/, "") : "Figur";
    var button = document.createElement("button");
    button.className = "figure-zoom";
    button.type = "button";
    button.setAttribute("aria-label", "Förstora " + name.toLowerCase());
    button.setAttribute("aria-haspopup", "dialog");
    button.title = "Klicka för att förstora";
    image.before(button);
    button.appendChild(image);

    // The existing source link remains the no-JavaScript fallback.
    sourceCaption.querySelectorAll('a[href$=".svg"]').forEach(function (link) {
      var next = link.nextSibling;
      if (next && next.nodeType === Node.TEXT_NODE) next.textContent = next.textContent.replace(/^\s*\./, "");
      link.remove();
    });
    button.addEventListener("click", function () {
      opener = button;
      title.textContent = name;
      enlarged.src = image.currentSrc || image.src;
      enlarged.alt = image.alt;
      enlarged.width = image.naturalWidth || Number(image.getAttribute("width"));
      enlarged.height = image.naturalHeight || Number(image.getAttribute("height"));
      stage.style.setProperty("--image-width", (Number(image.getAttribute("width")) || image.naturalWidth) + "px");
      stage.classList.remove("is-zoomed");
      zoom.setAttribute("aria-pressed", "false");
      caption.replaceChildren();
      var copy = tidyCaption(sourceCaption);
      while (copy.firstChild) caption.appendChild(copy.firstChild);
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      dialog.showModal();
      stage.scrollTop = 0;
      stage.scrollLeft = 0;
      close.focus();
    });
  });

  close.addEventListener("click", function () { dialog.close(); });
  dialog.addEventListener("keydown", function (event) {
    if (event.key !== "Tab") return;
    var targets = Array.from(dialog.querySelectorAll('button:not(:disabled), a[href], [tabindex="0"]'))
      .filter(function (element) { return element.getClientRects().length; });
    var first = targets[0];
    var last = targets[targets.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  zoom.addEventListener("click", function () {
    var enlargedView = stage.classList.toggle("is-zoomed");
    if (enlargedView) {
      var originalWidth = parseFloat(stage.style.getPropertyValue("--image-width")) || 0;
      stage.style.setProperty("--image-width", Math.max(originalWidth, stage.clientWidth * 2) + "px");
    }
    zoom.setAttribute("aria-pressed", String(enlargedView));
  });
  dialog.addEventListener("click", function (event) {
    if (event.target !== dialog) return;
    var rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener("close", function () {
    document.body.style.overflow = previousOverflow;
    if (opener && opener.isConnected) opener.focus({ preventScroll: true });
  });
}());