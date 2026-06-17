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

  /* --------------------------------------------- NAV SCROLLSPY (home) -- */
  /* Highlights the nav link for the section currently occupying the upper
     viewport. IntersectionObserver-based (no scroll-offset math). Single
     source of truth (setActive) feeds BOTH the desktop bar and the mobile
     drawer — they read the same <a> elements, so they can't disagree.
     Only acts where nav links are in-page anchors (home page); on subpages
     the hrefs are "index.html#…" so this no-ops and the existing
     aria-current="page" styling is left untouched. */
  (function () {
    var navEl = document.getElementById("primary-nav");
    if (!navEl || !("IntersectionObserver" in window)) return;

    // Main nav list only (skip the drawer utility actions). Sections kept in
    // document order; verify each link's target id exists.
    var links = [].slice.call(navEl.querySelectorAll('ul a[href^="#"]'));
    var sections = [];
    links.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      var el = id && document.getElementById(id);
      if (el && !sections.some(function (s) { return s.id === id; })) sections.push({ id: id, el: el });
    });
    if (!sections.length) return;

    // ---- single source of truth -------------------------------------
    var activeId = null;
    var lockUntil = 0; // clicks set this so the observer can't override mid-scroll
    var setActive = function (id) {
      activeId = id;
      links.forEach(function (a) {
        var on = a.getAttribute("href").slice(1) === id;
        a.classList.toggle("is-active", !!on);
        if (on) a.setAttribute("aria-current", "true");
        else if (a.getAttribute("aria-current") === "true") a.removeAttribute("aria-current");
      });
    };

    var headerEl = document.querySelector(".site-header");
    var headerH = headerEl ? Math.round(headerEl.getBoundingClientRect().height) : 64;

    var bottomReached = false;
    // Active = topmost section overlapping the band just below the sticky
    // header (down to ~38% of the viewport). Uses live getBoundingClientRect
    // (viewport-relative) so it's correct regardless of which element scrolls.
    var recompute = function () {
      if (Date.now() < lockUntil) return;
      if (bottomReached) { setActive(sections[sections.length - 1].id); return; }
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var bandTop = headerH + 4;
      var bandBottom = vh * 0.38;
      for (var i = 0; i < sections.length; i++) {
        var r = sections[i].el.getBoundingClientRect();
        if (r.top <= bandBottom && r.bottom > bandTop) { setActive(sections[i].id); return; }
      }
      setActive(null); // hero / between sections → nothing highlighted
    };

    // IntersectionObserver fires recompute as sections cross the band edges;
    // scroll/resize keep it continuous in every environment.
    var io = new IntersectionObserver(recompute,
      { rootMargin: "-" + (headerH + 4) + "px 0px -62% 0px", threshold: [0, 1] });
    sections.forEach(function (s) { io.observe(s.el); });

    var ticking = false;
    var onScrollResize = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { recompute(); ticking = false; });
    };
    window.addEventListener("scroll", onScrollResize, { passive: true });
    document.addEventListener("scroll", onScrollResize, { passive: true, capture: true });
    window.addEventListener("resize", onScrollResize);

    // Bottom fallback: a sentinel at the end of the page. When it enters view
    // (user at/near the bottom), the last section wins even if it never hit
    // the band — covers short final sections under a tall footer.
    var sentinel = document.createElement("div");
    sentinel.setAttribute("aria-hidden", "true");
    sentinel.style.cssText = "position:absolute;left:0;bottom:0;width:1px;height:1px;pointer-events:none;";
    document.body.appendChild(sentinel);
    new IntersectionObserver(function (entries) {
      bottomReached = entries[0].isIntersecting;
      recompute();
    }, { rootMargin: "0px 0px 120px 0px", threshold: 0 }).observe(sentinel);

    // Click: set active immediately + lock so smooth-scroll isn't overridden.
    navEl.addEventListener("click", function (e) {
      var a = e.target.closest('ul a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href").slice(1);
      if (!document.getElementById(id)) return;
      setActive(id);
      lockUntil = Date.now() + 900;
    });

    // Initial load with a hash (e.g. /#use-cases) → highlight that item.
    var hash = (location.hash || "").slice(1);
    if (hash && sections.some(function (s) { return s.id === hash; })) {
      setActive(hash);
      lockUntil = Date.now() + 900;
    }
    recompute();
  })();

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
      if (pattern[i] && !center) {
        cell.className = "on";
        // Ripple delay: tied to the row so accent cells light up just behind
        // the scan beam. Sweep starts ~0.5s and runs ~1.15s over 7 rows.
        cell.style.animationDelay = (0.5 + (row / 7) * 1.0).toFixed(2) + "s";
      }
      frag.appendChild(cell);
    }
    matrix.appendChild(frag);
  }

  /* ------------------------------------------- QR SCANNER SEQUENCE ----- */
  /* Orchestrates the "scan & confirm" load sequence on the hero asset, then
     hands off to the CSS ambient loop. Re-triggers a quick sweep on hover/tap.
     Reduced-motion: skip straight to the composed/ambient-free final state. */
  (function () {
    var panel = document.getElementById("qr-panel");
    if (!panel) return;

    if (reduceMotion) { panel.classList.add("is-static"); return; }

    var SEQ_MS = 2350; // total load sequence before ambient loop takes over
    var run = function () {
      panel.classList.remove("is-done", "is-replay");
      // force reflow so re-adding the class restarts the animations
      void panel.offsetWidth;
      panel.classList.add("is-scanning");
      window.setTimeout(function () {
        panel.classList.remove("is-scanning");
        panel.classList.add("is-done");
      }, SEQ_MS);
    };

    // Fire on load when the hero is in view (it's at the top → effectively load).
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { run(); io.disconnect(); } });
      }, { threshold: 0.3 });
      io.observe(panel);
    } else { run(); }

    // Hover / tap → quick re-scan + badge pulse (ignored mid-sequence).
    var replay = function () {
      if (panel.classList.contains("is-scanning") || panel.classList.contains("is-replay")) return;
      panel.classList.remove("is-done");
      void panel.offsetWidth;
      panel.classList.add("is-replay");
      window.setTimeout(function () {
        panel.classList.remove("is-replay");
        panel.classList.add("is-done");
      }, 1750);
    };
    panel.addEventListener("mouseenter", replay);
    panel.addEventListener("click", replay);
  })();

  /* ------------------------------------------- HERO STAT COUNT-UP ----- */
  /* Counts each hero stat up from 0 → target with an ease-out curve, staggered,
     then a scale "pop" as it lands. Fires once when the hero enters view (it's
     at the top, so on load). Reduced-motion: skip straight to final values. */
  (function () {
    var statsWrap = document.querySelector(".hero__stats");
    if (!statsWrap) return;
    var nums = [].slice.call(statsWrap.querySelectorAll(".stat-num"));
    if (!nums.length) return;

    // Reserve digit width up front so nothing reflows while counting.
    nums.forEach(function (el) {
      var to = parseInt(el.getAttribute("data-to"), 10) || 0;
      el.style.minWidth = String(to).length + "ch";
    });

    if (reduceMotion) {
      nums.forEach(function (el) { el.textContent = el.getAttribute("data-to"); });
      return; // labels already visible (marker not added)
    }

    var DUR = 1800, STAGGER = 150;
    var started = false;
    var run = function () {
      if (started) return;
      started = true;
      statsWrap.classList.add("hero__stats--anim"); // arms label entrance
      nums.forEach(function (el) { el.textContent = "0"; });
      nums.forEach(function (el, i) {
        var to = parseInt(el.getAttribute("data-to"), 10) || 0;
        var card = el.closest(".stat-card");
        var label = card ? card.querySelector(".stat-card__label") : null;
        window.setTimeout(function () {
          var t0 = null;
          var tick = function (ts) {
            if (t0 === null) t0 = ts;
            var p = Math.min((ts - t0) / DUR, 1);
            var eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
            el.textContent = String(Math.round(to * eased));
            if (p < 1) { requestAnimationFrame(tick); }
            else {
              el.textContent = String(to);
              el.classList.add("is-pop");
              if (label) label.classList.add("is-in");
            }
          };
          requestAnimationFrame(tick);
        }, i * STAGGER);
      });
    };

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { run(); io.disconnect(); } });
      }, { threshold: 0.35 });
      io.observe(statsWrap);
    } else {
      run();
    }
  })();

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
