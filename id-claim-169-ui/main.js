/* ============================================================================
   CLAIM 169 — INTERACTIONS
   Progressive enhancement only: the page is fully readable without JS.
   - Mobile nav drawer (with Escape + outside-click + focus return)
   - "Where" carousel (scroll-snap + prev/next, disabled-state aware)
   - Contributors collapse/expand
   - Decorative QR matrix fill
   All motion respects prefers-reduced-motion.
   ========================================================================== */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------- MOBILE NAV ----- */
  var toggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("primary-nav");
  if (toggle && nav) {
    // Scrim sits behind the drawer; tapping it closes the menu.
    var scrim = document.createElement("div");
    scrim.className = "nav-scrim";
    scrim.setAttribute("data-open", "false");
    document.body.appendChild(scrim);

    var setNav = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.setAttribute("data-open", String(open));
      scrim.setAttribute("data-open", String(open));
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    toggle.addEventListener("click", function () {
      setNav(toggle.getAttribute("aria-expanded") !== "true");
    });
    // Close on link click (anchor nav)
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setNav(false);
    });
    // Close on scrim tap
    scrim.addEventListener("click", function () { setNav(false); toggle.focus(); });
    // Close on Escape, return focus to toggle
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setNav(false);
        toggle.focus();
      }
    });
    // Close on outside click
    document.addEventListener("click", function (e) {
      if (toggle.getAttribute("aria-expanded") !== "true") return;
      if (!nav.contains(e.target) && !toggle.contains(e.target)) setNav(false);
    });
    // Reset state if resized up to desktop while open
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1280 && toggle.getAttribute("aria-expanded") === "true") setNav(false);
    });
  }

  /* ------------------------------------------------------ CAROUSEL ----- */
  /* ------------------------------------------------------ CAROUSELS ---- */
  /* Generalised: drives every .carousel on the page (home + subpages). */
  [].forEach.call(document.querySelectorAll(".carousel"), function (root) {
    var track = root.querySelector(".carousel__track");
    var prev = root.querySelector(".carousel__btn--prev");
    var next = root.querySelector(".carousel__btn--next");
    if (!track || !prev || !next) return;
    var step = function () {
      var card = track.firstElementChild;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 20;
      return card ? card.getBoundingClientRect().width + gap : 320;
    };
    var maxScroll = function () { return track.scrollWidth - track.clientWidth; };
    var update = function () {
      prev.disabled = track.scrollLeft <= 8;
      next.disabled = track.scrollLeft >= maxScroll() - 8;
    };
    var anim = null;
    var scrollToPos = function (target) {
      target = Math.max(0, Math.min(target, maxScroll()));
      if (anim) cancelAnimationFrame(anim);
      if (reduceMotion) { track.scrollLeft = target; update(); return; }
      var start = track.scrollLeft, change = target - start, t0 = null, dur = 360;
      var tick = function (ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        track.scrollLeft = start + change * eased;
        update();
        if (p < 1) anim = requestAnimationFrame(tick);
      };
      anim = requestAnimationFrame(tick);
    };
    prev.addEventListener("click", function () { scrollToPos(track.scrollLeft - step()); });
    next.addEventListener("click", function () { scrollToPos(track.scrollLeft + step()); });
    track.addEventListener("scroll", function () { window.requestAnimationFrame(update); }, { passive: true });
    window.addEventListener("resize", update);
    update();
  });

  /* -------------------------------------------------- CONTRIBUTORS ----- */
  var contribToggle = document.getElementById("contrib-toggle");
  var contribBody = document.getElementById("contrib-body");
  if (contribToggle && contribBody) {
    contribToggle.addEventListener("click", function () {
      var open = contribToggle.getAttribute("aria-expanded") === "true";
      contribToggle.setAttribute("aria-expanded", String(!open));
      contribBody.hidden = open;
      contribToggle.childNodes[0].nodeValue = open ? "Show contributors " : "Hide contributors ";
    });
  }

  /* ------------------------------------------ SHOW / HIDE ALL MEMBERS -- */
  var membersBtn = document.getElementById("members-toggle");
  var orgsGrid = document.getElementById("orgs-grid");
  var membersStatus = document.getElementById("members-status");
  if (membersBtn && orgsGrid) {
    var MEMBER_COUNT = orgsGrid.querySelectorAll(".org-card__members li").length;
    var membersLabel = membersBtn.querySelector(".members-toggle__label");
    if (membersLabel) membersLabel.textContent = "Show all members";
    membersBtn.addEventListener("click", function () {
      var open = orgsGrid.getAttribute("data-members-open") === "true";
      var next = !open;
      orgsGrid.setAttribute("data-members-open", String(next));
      membersBtn.setAttribute("aria-expanded", String(next));
      if (membersLabel) membersLabel.textContent = next ? "Hide all members" : "Show all members";
      if (membersStatus) {
        membersStatus.textContent = next
          ? "All " + MEMBER_COUNT + " organization members shown."
          : "Member lists collapsed.";
      }
    });
  }

  /* ------------------------------------------- HEADER SCROLL SHADOW ---- */
  /* IntersectionObserver on a top sentinel — robust regardless of scroller. */
  var header = document.querySelector(".site-header");
  if (header) {
    var sentinel = document.createElement("div");
    sentinel.setAttribute("aria-hidden", "true");
    sentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;";
    document.body.insertBefore(sentinel, document.body.firstChild);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        header.classList.toggle("is-scrolled", !entries[0].isIntersecting);
      }).observe(sentinel);
    } else {
      var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 4); };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }

  /* ----------------------------------------- DECORATIVE QR MATRIX ------ */
  var matrix = document.getElementById("qr-matrix");
  if (matrix) {
    // Fixed pattern (49 cells, 7x7) — deterministic so it reads as a "code".
    var pattern = [
      1,0,1,1,0,1,0,
      0,1,0,0,1,0,1,
      1,0,1,0,0,1,1,
      1,1,0,0,0,0,0,
      0,1,0,0,1,1,0,
      1,0,1,1,0,0,1,
      0,1,0,1,1,0,1
    ];
    var frag = document.createDocumentFragment();
    for (var i = 0; i < pattern.length; i++) {
      var cell = document.createElement("span");
      // clear the 3x3 center for the badge
      var row = Math.floor(i / 7), col = i % 7;
      var center = row >= 2 && row <= 4 && col >= 2 && col <= 4;
      if (pattern[i] && !center) cell.className = "on";
      frag.appendChild(cell);
    }
    matrix.appendChild(frag);
  }

  /* --------------------------------------------------- THEME TOGGLE ---- */
  var THEME_KEY = "claim169-theme";
  var root = document.documentElement;
  var themeBtn = document.getElementById("theme-toggle");
  var sysMq = window.matchMedia("(prefers-color-scheme: dark)");

  var applyLabel = function () {
    if (!themeBtn) return;
    var isDark = root.getAttribute("data-theme") === "dark";
    var next = isDark ? "light" : "dark";
    themeBtn.setAttribute("aria-label", "Switch to " + next + " theme");
    themeBtn.setAttribute("aria-pressed", String(isDark));
    var tt = themeBtn.querySelector(".tt");
    if (tt) tt.textContent = next === "dark" ? "Dark mode" : "Light mode";
  };
  applyLabel();

  var setTheme = function (theme, persist) {
    // Smooth crossfade between palettes (skipped under reduced-motion).
    if (!reduceMotion) {
      root.classList.add("theme-transition");
      window.setTimeout(function () { root.classList.remove("theme-transition"); }, 500);
    }
    root.setAttribute("data-theme", theme);
    if (persist) { try { localStorage.setItem(THEME_KEY, theme); } catch (e) {} }
    applyLabel();
  };

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      setTheme(current === "dark" ? "light" : "dark", true);
    });
  }
  // Follow the OS only while the user hasn't made an explicit choice.
  sysMq.addEventListener("change", function (e) {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (err) {}
    if (!saved) setTheme(e.matches ? "dark" : "light", false);
  });

  /* ------------------------------------------------ ENTRANCE REVEAL ---- */
  if (!reduceMotion && "IntersectionObserver" in window) {
    var revealSelectors = [
      ".section-head", ".about-col", ".edge-card", ".process-step",
      ".registry-card", ".usecase-card", ".use-card", ".band",
      ".use169-panel", ".howto-card", ".contribute-cta", ".contributors-card",
      ".faq-band", ".contact-band", ".hero__copy", ".hero__visual", ".stat-card",
      ".cta-card", ".footer-brand", ".footer-col", ".ver-card", ".ver-note",
      ".pipeline-card", ".vp-step", ".signing-callout", ".info-card", ".spec-strip", ".dev-card"
    ];
    var targets = document.querySelectorAll(revealSelectors.join(","));
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        // Stagger items that share a parent for a gentle cascade.
        var sibs = Array.prototype.slice.call(el.parentNode.children).filter(function (c) {
          return c.classList && c.classList.contains("reveal");
        });
        var idx = sibs.indexOf(el);
        el.style.transitionDelay = Math.min(idx, 6) * 70 + "ms";
        el.classList.add("is-in");
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    targets.forEach(function (el) {
      el.classList.add("reveal");
      io.observe(el);
    });
  }
})();
