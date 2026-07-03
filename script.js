/* Wheat State Cleaning — vanilla JS only.
   Handles: quote-widget folder tabs + mobile sticky bar visibility. */
(function () {
  "use strict";

  /* ---- Quote widget tabs ---- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".quote-tab"));
  var serviceInput = document.getElementById("quote-service");

  var panels = Array.prototype.slice.call(document.querySelectorAll(".quote-panel"));

  function selectTab(tab) {
    var service = tab.dataset.service || tab.textContent.trim();
    tabs.forEach(function (t) {
      var active = t === tab;
      t.setAttribute("aria-selected", active ? "true" : "false");
      t.tabIndex = active ? 0 : -1;
    });
    if (serviceInput) serviceInput.value = service;
    panels.forEach(function (p) {
      p.hidden = p.dataset.service !== service;
    });
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { selectTab(tab); });
    tab.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      var dir = e.key === "ArrowRight" ? 1 : -1;
      var next = tabs[(i + dir + tabs.length) % tabs.length];
      next.focus();
      selectTab(next);
    });
  });

  /* ---- Reviews: duplicate each row's cards for a seamless loop ---- */
  Array.prototype.slice.call(document.querySelectorAll(".reviews-track")).forEach(function (track) {
    track.innerHTML += track.innerHTML;
  });

  /* ---- Background photo ends at the middle of the services widget ---- */
  var pageBg = document.querySelector(".page-bg");
  var quoteWidget = document.querySelector(".quote-widget");
  function sizePageBg() {
    if (!pageBg || !quoteWidget) return;
    var top = quoteWidget.getBoundingClientRect().top + window.pageYOffset;
    pageBg.style.height = Math.round(top + quoteWidget.offsetHeight * 0.5) + "px";
  }
  if (pageBg && quoteWidget) {
    sizePageBg();
    window.addEventListener("load", sizePageBg);
    window.addEventListener("resize", sizePageBg);
  }

  /* ---- Mobile hamburger menu ---- */
  var nav = document.querySelector(".nav");
  var navToggle = document.querySelector(".nav-toggle");
  if (nav && navToggle) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // close the menu after tapping a link
    nav.querySelectorAll(".nav-links a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- Video reviews: click-to-play YouTube facade ---- */
  function playVideo(thumb) {
    var id = thumb.dataset.video;
    if (!id || thumb.querySelector("iframe")) return;
    var iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube.com/embed/" + id + "?autoplay=1&rel=0";
    iframe.title = thumb.getAttribute("aria-label") || "Video review";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.setAttribute("frameborder", "0");
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    thumb.innerHTML = "";
    thumb.appendChild(iframe);
    thumb.removeAttribute("role");
    thumb.removeAttribute("tabindex");
  }
  Array.prototype.slice.call(document.querySelectorAll(".video-thumb[data-video]")).forEach(function (thumb) {
    thumb.addEventListener("click", function () { playVideo(thumb); });
    thumb.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); playVideo(thumb); }
    });
  });

  /* ---- Sticky bottom bar: reveal after leaving the hero ---- */
  var bar = document.querySelector(".sticky-bar");
  var hero = document.querySelector(".hero");
  if (bar && hero && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        bar.style.transform = entry.isIntersecting ? "translateY(110%)" : "translateY(0)";
      });
    }, { threshold: 0.15 });
    io.observe(hero);
    bar.style.transition = "transform .25s ease";
  }

  /* ---- Forms: lightweight submit acknowledgement (no backend) ---- */
  Array.prototype.slice.call(document.querySelectorAll("form[data-quote]")).forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector("button[type=submit]");
      if (btn) {
        var label = btn.querySelector(".label") || btn;
        var original = label.textContent;
        label.textContent = "Thanks — we'll call you shortly";
        setTimeout(function () { label.textContent = original; }, 3500);
      }
    });
  });
})();
