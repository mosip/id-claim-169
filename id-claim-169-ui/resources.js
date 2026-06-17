/* ============================================================================
   RESOURCES PAGE — single live podcast; full tab row with count badges.
   Live content: one featured podcast (shown under All + Podcasts).
   Articles / Videos / Webinars / Events show a "Coming soon" state.
   Respects prefers-reduced-motion (entrance via shared reveal CSS).
   ========================================================================== */
(function () {
  "use strict";

  var ACCENT = { podcast: "#fa8005" };
  var TYPE_LABEL = { podcast: "Podcast" };

  var I = {
    mic:     '<svg viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
    article: '<svg viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true"><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>',
    video:   '<svg viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5z"/></svg>',
    webinar: '<svg viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    cal:     '<svg viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>',
    ext:     '<svg viewBox="0 0 24 24" stroke-width="2" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>'
  };

  // ---- Content pool: the single live podcast (meta line removed) ----
  var ITEMS = [
    { type:"podcast", title:"Building offline-first identity with Claim 169",
      href:"https://www.linkedin.com/events/episode169-interoperableqrcodes7435789414271762432/",
      featured:true,
      cover:"assets/podcast-cover-1200.png",
      desc:"Our latest episode unpacks how Claim 169 carries a signed credential entirely offline — the design trade-offs, the cryptography, and what it takes to deploy at national scale." }
  ];

  // ---- Tabs (full row; Webinars & Events split) ----
  var TABS = [
    { id:"all",     label:"All",      match:function(){ return true; } },
    { id:"article", label:"Articles", match:function(it){ return it.type==="article"; } },
    { id:"event",   label:"Events",   match:function(it){ return it.type==="event"; } },
    { id:"podcast", label:"Podcasts", match:function(it){ return it.type==="podcast"; } },
    { id:"video",   label:"Videos",   match:function(it){ return it.type==="video"; } },
    { id:"webinar", label:"Webinars", match:function(it){ return it.type==="webinar"; } }
  ];

  // ---- Coming-soon copy + icon per empty tab ----
  var SOON = {
    article: { icon:I.article, line:"New articles are on the way." },
    video:   { icon:I.video,   line:"Video walkthroughs are coming soon." },
    webinar: { icon:I.webinar, line:"Live webinars will be announced here." },
    event:   { icon:I.cal,     line:"Upcoming events will appear here." }
  };

  var state = { tab:"all" };

  var elTabs = document.getElementById("res-tabs");
  var elSearch = document.getElementById("res-search-input");
  var elFeatured = document.getElementById("res-featured");
  var elGrid = document.getElementById("res-grid");
  var elMore = document.getElementById("res-loadmore-wrap");
  if (!elGrid) return;
  if (elMore) elMore.innerHTML = ""; // no load-more

  function media(it, extra){
    if(it.cover){
      return '<div class="res-media res-media--cover'+(extra||"")+'" style="--c:'+ACCENT[it.type]+'"><img src="'+it.cover+'" alt="" loading="lazy" /></div>';
    }
    return '<div class="res-media'+(extra||"")+'" style="--c:'+ACCENT[it.type]+'"><span class="res-media__glyph">'+I.mic+'</span></div>';
  }

  function card(it){
    return '<article class="res-card" style="--c:'+ACCENT[it.type]+'">'
      + media(it)
      + '<div class="res-card__pills"><span class="res-pill res-pill--type">'+I.mic+TYPE_LABEL[it.type]+'</span></div>'
      + '<h3>'+it.title+'</h3>'
      + '<p class="res-card__meta">'+it.desc+'</p>'
      + '<a class="res-cta" href="'+it.href+'" target="_blank" rel="noopener noreferrer" aria-label="Watch: '+it.title+' (opens in a new tab)">Watch'+I.ext+'</a>'
      + '</article>';
  }

  function renderFeatured(){
    var feat = ITEMS.filter(function(it){ return it.featured; })[0];
    if(state.tab!=="all" || !feat){ elFeatured.hidden = true; elFeatured.innerHTML = ""; return feat; }
    elFeatured.hidden = false;
    elFeatured.style.setProperty("--c", ACCENT[feat.type]);
    elFeatured.innerHTML =
        media(feat, " res-featured__media")
      + '<div class="res-featured__body">'
      +   '<div class="res-featured__pills"><span class="res-pill res-pill--featured">Featured</span><span class="res-pill res-pill--type">'+I.mic+'Podcast</span></div>'
      +   '<h2>'+feat.title+'</h2>'
      +   '<p class="res-featured__desc">'+feat.desc+'</p>'
      +   '<a class="res-cta" href="'+feat.href+'" target="_blank" rel="noopener noreferrer" aria-label="Watch: '+feat.title+' (opens in a new tab)">Watch'+I.ext+'</a>'
      + '</div>';
    return feat;
  }

  function comingSoon(id){
    var s = SOON[id];
    return '<div class="res-soon">'
      + '<span class="res-soon__icon">'+s.icon+'</span>'
      + '<p class="res-soon__title">Coming soon</p>'
      + '<p class="res-soon__line">'+s.line+'</p>'
      + '</div>';
  }

  function render(){
    var feat = renderFeatured();
    if(SOON[state.tab]){
      elGrid.style.display = "block";
      elGrid.innerHTML = comingSoon(state.tab);
      return;
    }
    // All (featured in slot, grid empty) or Podcasts (podcast as card)
    var t = TABS.filter(function(x){ return x.id===state.tab; })[0];
    var list = ITEMS.filter(t.match);
    if(state.tab==="all" && feat){ list = list.filter(function(it){ return it!==feat; }); }
    if(!list.length){
      elGrid.style.display = "none";
      elGrid.innerHTML = "";
    } else {
      elGrid.style.display = "";
      elGrid.innerHTML = list.map(card).join("");
    }
  }

  // ---- Build tabs with count badges ----
  elTabs.innerHTML = TABS.map(function(t){
    return '<button class="res-tab" type="button" role="tab" data-tab="'+t.id+'" aria-selected="'+(t.id===state.tab)+'">'+t.label+' <span class="res-tab__count"></span></button>';
  }).join("");
  // Counts reflect reality (All 1, Podcasts 1, others 0 → badge hidden)
  TABS.forEach(function(t){
    var n = ITEMS.filter(t.match).length;
    var cEl = document.querySelector('.res-tab[data-tab="'+t.id+'"] .res-tab__count');
    if(cEl){ if(n>0){ cEl.textContent = n; } else { cEl.remove(); } }
  });

  function setTab(id, fromHash){
    if(!TABS.some(function(t){ return t.id===id; })) id = "all";
    state.tab = id;
    [].forEach.call(elTabs.querySelectorAll(".res-tab"), function(b){ b.setAttribute("aria-selected", String(b.getAttribute("data-tab")===id)); });
    if(!fromHash){ try { history.replaceState(null, "", id==="all" ? location.pathname : "#"+id); } catch(e){} }
    render();
  }

  elTabs.addEventListener("click", function(e){ var b=e.target.closest(".res-tab"); if(b) setTab(b.getAttribute("data-tab")); });
  if(elSearch){ // search filters the live pool (title/desc); empty tabs stay coming-soon
    elSearch.addEventListener("input", function(){ render(); });
  }

  var hash = (location.hash||"").replace("#","");
  setTab(TABS.some(function(t){ return t.id===hash; }) ? hash : "all", true);
  window.addEventListener("hashchange", function(){
    var h=(location.hash||"").replace("#","");
    if(TABS.some(function(t){ return t.id===h; })) setTab(h, true);
  });
})();
