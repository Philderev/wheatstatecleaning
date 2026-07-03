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

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function scrollToSection(selector) {
    var target = document.querySelector(selector);
    if (!target) return;
    window.setTimeout(function () {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
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

  function lockPanelHeights(containerSelector, panelSelector) {
    var container = document.querySelector(containerSelector);
    var lockPanels = Array.prototype.slice.call(document.querySelectorAll(panelSelector));
    if (!container || !lockPanels.length) return;

    container.style.minHeight = "";
    var maxHeight = 0;
    lockPanels.forEach(function (panel) {
      var wasHidden = panel.hidden;
      var previousVisibility = panel.style.visibility;
      var previousPosition = panel.style.position;
      var previousPointerEvents = panel.style.pointerEvents;
      var previousWidth = panel.style.width;

      panel.hidden = false;
      panel.style.visibility = "hidden";
      panel.style.position = "absolute";
      panel.style.pointerEvents = "none";
      panel.style.width = container.clientWidth + "px";
      maxHeight = Math.max(maxHeight, panel.offsetHeight);

      panel.hidden = wasHidden;
      panel.style.visibility = previousVisibility;
      panel.style.position = previousPosition;
      panel.style.pointerEvents = previousPointerEvents;
      panel.style.width = previousWidth;
    });
    container.style.minHeight = maxHeight + "px";
  }

  function lockAllTabbedPanelHeights() {
    lockPanelHeights(".quote-panels", ".quote-panel");
    lockPanelHeights(".coverage-panels", ".coverage-panel");
  }

  /* ---- Coverage city tabs ---- */
  var coverageTabs = Array.prototype.slice.call(document.querySelectorAll(".coverage-tab"));
  var coveragePanels = Array.prototype.slice.call(document.querySelectorAll(".coverage-panel"));

  function selectCoverageTab(tab) {
    var area = tab.dataset.area || tab.textContent.trim();
    coverageTabs.forEach(function (t) {
      var active = t === tab;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", active ? "true" : "false");
      t.tabIndex = active ? 0 : -1;
    });
    coveragePanels.forEach(function (panel) {
      panel.hidden = panel.dataset.area !== area;
    });
  }

  function openTabFromHash() {
    var hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;

    if (hash.indexOf("quote-") === 0) {
      var serviceSlug = hash.replace("quote-", "");
      var serviceTab = tabs.find(function (tab) {
        return slugify(tab.dataset.service || tab.textContent) === serviceSlug;
      });
      if (serviceTab) {
        selectTab(serviceTab);
        scrollToSection("#quote");
      }
      return;
    }

    if (hash.indexOf("areas-") === 0) {
      var areaSlug = hash.replace("areas-", "");
      var areaTab = coverageTabs.find(function (tab) {
        return slugify(tab.dataset.area || tab.textContent) === areaSlug;
      });
      if (areaTab) {
        selectCoverageTab(areaTab);
        scrollToSection("#areas");
      }
    }
  }

  coverageTabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { selectCoverageTab(tab); });
    tab.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      var dir = e.key === "ArrowRight" ? 1 : -1;
      var next = coverageTabs[(i + dir + coverageTabs.length) % coverageTabs.length];
      next.focus();
      selectCoverageTab(next);
    });
  });

  lockAllTabbedPanelHeights();
  window.addEventListener("load", lockAllTabbedPanelHeights);
  window.addEventListener("resize", lockAllTabbedPanelHeights);
  openTabFromHash();
  window.addEventListener("hashchange", openTabFromHash);

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
      window.location.href = "pages/thank-you.html";
    });
  });
})();
