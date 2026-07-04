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

  /* ---- Background photo ends partway down the hero ----
     Homepage: mid-services-widget. Subpages: bottom of the hero so the
     fixed-height layer never overhangs the footer (leaving empty space). */
  var pageBg = document.querySelector(".page-bg");
  var bgAnchor = document.querySelector(".quote-widget")
    || document.querySelector("main > .section")   /* pricing page: first section */
    || document.querySelector(".subpage-hero");
  function sizePageBg() {
    if (!pageBg || !bgAnchor) return;
    var top = bgAnchor.getBoundingClientRect().top + window.pageYOffset;
    var fraction = bgAnchor.classList.contains("quote-widget") ? 0.5 : 1;
    pageBg.style.height = Math.round(top + bgAnchor.offsetHeight * fraction) + "px";
  }
  if (pageBg && bgAnchor) {
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
  function previewVideo(thumb) {
    var id = thumb.dataset.video;
    if (!id || thumb.dataset.clicked || thumb.querySelector("iframe")) return;
    var iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube.com/embed/" + id + "?autoplay=1&mute=1&controls=0&rel=0&playsinline=1";
    iframe.title = thumb.getAttribute("aria-label") || "Video review";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.setAttribute("frameborder", "0");
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    thumb.appendChild(iframe);
  }
  function stopPreview(thumb) {
    if (thumb.dataset.clicked) return;
    var iframe = thumb.querySelector("iframe");
    if (iframe) iframe.remove();
  }
  Array.prototype.slice.call(document.querySelectorAll(".video-thumb[data-video]")).forEach(function (thumb) {
    var original = thumb.innerHTML;
    thumb.addEventListener("mouseenter", function () { previewVideo(thumb); });
    thumb.addEventListener("mouseleave", function () { stopPreview(thumb); });
    thumb.addEventListener("click", function () {
      thumb.dataset.clicked = "1";
      thumb.innerHTML = original;
      playVideo(thumb);
    });
    thumb.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        thumb.dataset.clicked = "1";
        thumb.innerHTML = original;
        playVideo(thumb);
      }
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
      window.location.href = "thank-you";
    });
  });

  /* ---- Scroll reveal: sections fade + rise as they enter view ---- */
  var revealEls = document.querySelectorAll(".frame > section, .frame > .quote-wrap, .frame > footer");
  function revealAll() {
    Array.prototype.forEach.call(revealEls, function (el) { el.classList.add("is-visible"); });
  }
  if ("IntersectionObserver" in window && revealEls.length) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    Array.prototype.forEach.call(revealEls, function (el) { revealObs.observe(el); });
    // Failsafe: if the observer never delivers (some browsers/extensions block
    // callbacks), the page must not stay blank — force everything visible.
    window.addEventListener("load", function () {
      setTimeout(revealAll, 1200);
    });
  } else {
    revealAll();
  }

  /* ---- Quote popup modal: opened by any non-call CTA ---- */
  var quoteModal = document.getElementById("quoteModal");
  if (quoteModal) {
    var modalIframe = quoteModal.querySelector("iframe");
    var lastFocused = null;

    function openQuoteModal() {
      lastFocused = document.activeElement;
      // lazy-load the form the first time the modal opens
      if (modalIframe && !modalIframe.src && modalIframe.dataset.src) {
        modalIframe.src = modalIframe.dataset.src;
      }
      quoteModal.classList.add("is-open");
      quoteModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      var closeBtn = quoteModal.querySelector(".quote-modal__close");
      if (closeBtn) closeBtn.focus();
    }
    function closeQuoteModal() {
      quoteModal.classList.remove("is-open");
      quoteModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    // any same-page "quote" CTA (not tel: calls, not the nav menu links) opens the modal
    document.addEventListener("click", function (e) {
      var trigger = e.target.closest('a[href="#quote"], .quote-cta, [data-quote-modal]');
      if (trigger && !trigger.closest(".nav-links")) {
        e.preventDefault();
        openQuoteModal();
        return;
      }
      if (e.target.closest("[data-close-modal]")) {
        closeQuoteModal();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && quoteModal.classList.contains("is-open")) closeQuoteModal();
    });
  }

  /* ---- Cookie consent banner ---- */
  (function () {
    if (document.cookie.indexOf("cookieConsent=") !== -1) return;
    // Build a path to the cookie policy that works from any folder depth,
    // including when the site is served from a GitHub Pages project subpath.
    var dir = location.pathname.slice(0, location.pathname.lastIndexOf("/") + 1);
    var base = location.hostname.endsWith("github.io")
      ? "/" + location.pathname.split("/")[1] + "/"
      : "/";
    var depth = dir.slice(base.length).split("/").filter(Boolean).length;
    var cookiePolicyHref =
      new Array(depth + 1).join("../") + "legal/cookie-policy.html";
    var banner = document.createElement("div");
    banner.className = "cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Cookie notice");
    banner.innerHTML =
      '<p class="cookie-banner__text">We use cookies to improve your experience. ' +
      '<a href="' + cookiePolicyHref + '">Learn more</a>.</p>' +
      '<button class="cookie-banner__btn" type="button">Got it</button>';
    banner.querySelector("button").addEventListener("click", function () {
      document.cookie = "cookieConsent=1; path=/; max-age=31536000";
      banner.remove();
    });
    document.body.appendChild(banner);
  })();
})();
