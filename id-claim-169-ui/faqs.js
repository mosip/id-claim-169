/* ============================================================================
   FAQ PAGE — category-grouped accordions, search, jump-nav, expand-all,
   deep-linkable questions. Respects prefers-reduced-motion.
   ========================================================================== */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var ICON = {
    general: '<svg viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2 2-2 3"/><path d="M12 17h.01"/></svg>',
    security: '<svg viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true"><path d="M12 3 4 6v6c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V6Z"/><path d="m9 12 2 2 4-4"/></svg>',
    privacy: '<svg viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
    interop: '<svg viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a9 9 0 0 0 0 18M12 3a9 9 0 0 1 0 18"/></svg>',
    contrib: '<svg viewBox="0 0 24 24" stroke-width="1.8" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11"/></svg>'
  };
  var CHEV = '<svg class="faq-chev" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

  var DATA = [
    { id:"general", label:"General", c:"#01a2fd", icon:ICON.general, items:[
      { q:"What is Claim 169?", a:"Claim 169 is a global, IANA-registered standard for encoding identity data in QR codes using CBOR Web Tokens (CWT). It enables secure and interoperable identity verification, even without internet connectivity." },
      { q:"What problem does Claim 169 solve?", a:"It enables offline identity verification in environments where connectivity is limited, such as border control, humanitarian settings, and field operations." },
      { q:"What data can be stored in a Claim 169 QR code?", a:"It can include the following fields. All fields are optional, allowing flexible implementations:", bullets:["Basic identity data (name, DOB, gender, etc.)","Contact details","Nationality and legal attributes","Photo (embedded image)","Biometrics (optional)"] },
      { q:"How is the data stored inside the QR code?", a:"The data follows this pipeline:", pipeline:"JSON → CBOR encoding → CWT → Signed (COSE) → Compressed → Base45 → QR code" },
      { q:"Is Claim 169 tied to MOSIP only?", a:"No. It is an open, interoperable standard registered with IANA, designed to work across different identity systems and ecosystems." },
      { q:"Does Claim 169 work offline?", a:"Yes. Verification can be done completely offline using the issuer's public key, without needing any server call." }
    ]},
    { id:"security", label:"Security", c:"#d64045", icon:ICON.security, items:[
      { q:"How is the QR code data secured?", a:"The data is digitally signed by the issuer using COSE (CBOR Object Signing and Encryption), which supports Ed25519 / ECDSA cryptography. This ensures authenticity and integrity of the data.", bullets:["The data is digitally signed by the issuer","Uses COSE (CBOR Object Signing and Encryption)","Supports Ed25519 / ECDSA cryptography"] },
      { q:"How do verifiers trust the data?", a:"Verifiers validate the following. If the signature is valid, the data is trusted:", bullets:["The digital signature","The issuer's public key (via trusted key distribution, e.g., well-known endpoints)","Standard CWT claims like expiry (exp)"] },
      { q:"Can the data be tampered with?", a:"No. Any modification to the QR code data will invalidate the signature, making tampering immediately detectable." },
      { q:"Does Claim 169 support encryption?", a:"Yes. Sensitive fields (e.g., biometrics) can be encrypted using COSE (e.g., AES-GCM) in addition to signing." },
      { q:"What protections exist against attacks?", a:"Implementations include the following protections against common security threats:", bullets:["Signature verification","Weak key rejection","Compression limits (to prevent zip-bomb attacks)","CBOR depth limits (to prevent parsing attacks)","Timestamp validation"] }
    ]},
    { id:"privacy", label:"Privacy", c:"#0a8754", icon:ICON.privacy, items:[
      { q:"Is personal data exposed in the QR code?", a:"Only the data chosen by the issuer is included. Since all fields are optional, implementations can minimize exposure." },
      { q:"How does Claim 169 protect sensitive data like biometrics?", a:"Sensitive data can be handled in the following ways, enabling privacy-aware implementations:", bullets:["Encrypted","Excluded entirely","Included in minimal form (e.g., low-resolution photo)"] },
      { q:"Does Claim 169 require sharing data with a central server?", a:"No. It supports offline verification, meaning no data needs to be transmitted during verification, improving privacy." },
      { q:"Can users control what data is shared?", a:"Yes. The specification allows selective inclusion of attributes and different profiles for different use cases, enabling data minimization and purpose limitation:", bullets:["Selective inclusion of attributes","Different profiles for different use cases"] },
      { q:"How is misuse or replay prevented?", a:"These mechanisms reduce risks of misuse or outdated credentials:", bullets:["Expiry (exp) timestamps","Credential status checks (if implemented)","Trusted issuer validation"] }
    ]},
    { id:"interop", label:"Interoperability & Governance", c:"#014daf", icon:ICON.interop, items:[
      { q:"Is Claim 169 interoperable across countries?", a:"Yes. It uses global standards (CBOR, CWT, COSE) and is IANA-registered, enabling cross-border interoperability." },
      { q:"Who maintains and governs Claim 169?", a:"It is maintained by a global working group led by MOSIP, with contributions from multiple ecosystem partners." },
      { q:"Can organizations extend the specification?", a:"Yes. The model is extensible and allows vendor-specific or use case-specific attributes while maintaining interoperability." }
    ]},
    { id:"contrib", label:"Contributions", c:"#fec40d", icon:ICON.contrib, items:[
      { q:"How can I contribute to Claim 169?", a:"You can contribute by joining the working group, proposing enhancements, raising issues on GitHub, reviewing pull requests, or improving documentation." },
      { q:"Do I need to be part of MOSIP to contribute?", a:"No. Claim 169 is an open standard, and contributions are welcome from individuals and organizations across the ecosystem." },
      { q:"Where can I submit a proposal or suggestion?", a:"You can raise an issue or submit a proposal on the official GitHub repository for Claim 169." },
      { q:"Can I propose new identity attributes or claim fields?", a:"Yes. The specification is extensible, and you can propose new fields or enhancements through the working group or GitHub." },
      { q:"How are contributions reviewed and accepted?", a:"Proposals are discussed within the working group, reviewed by maintainers, and evaluated based on interoperability, security, and alignment with the standard." },
      { q:"Is there a working group I can join?", a:"Yes. The Claim 169 Working Group meets regularly to review proposals, discuss updates, and guide the evolution of the specification." },
      { q:"Can organizations contribute or only individuals?", a:"Both individuals and organizations can contribute, including through implementation feedback, proposals, and active participation in discussions." },
      { q:"Where can I find contributors and collaborators?", a:"A list of contributors and participating organizations is available in the Claim 169 GitHub repository." },
      { q:"Can I build products or solutions using Claim 169?", a:"Yes. Claim 169 is designed as an open, interoperable standard and can be adopted in real-world implementations across sectors." },
      { q:"Who do I contact for contribution-related queries?", a:"You can reach out via GitHub issues or contact the maintainers directly for guidance." }
    ]}
  ];

  var navEl = document.getElementById("faq-nav");
  var rootEl = document.getElementById("faq-cats");
  var searchEl = document.getElementById("faq-search-input");
  var expandEl = document.getElementById("faq-expand");
  if (!rootEl) return;

  function slug(s){ return s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,60); }
  function esc(s){ return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

  // Build nav
  navEl.innerHTML = DATA.map(function(cat){
    return '<a href="#cat-'+cat.id+'" data-cat="'+cat.id+'" style="--c:'+cat.c+'">'+cat.label+'</a>';
  }).join("");

  // Build categories + items
  rootEl.innerHTML = DATA.map(function(cat){
    var items = cat.items.map(function(it){
      var id = "q-"+slug(it.q);
      var body = "";
      if (it.a) body += '<p>'+esc(it.a)+'</p>';
      if (it.pipeline) body += '<code class="faq-a__pipe">'+esc(it.pipeline)+'</code>';
      if (it.bullets) body += '<ul>'+it.bullets.map(function(b){return '<li><span>'+esc(b)+'</span></li>';}).join("")+'</ul>';
      return '<div class="faq-item" id="'+id+'" data-open="false" data-q="'+esc(it.q).toLowerCase()+'" data-text="'+esc((it.a||"")+" "+(it.bullets||[]).join(" ")+" "+(it.pipeline||"")).toLowerCase()+'">'
        + '<button class="faq-q" type="button" aria-expanded="false" aria-controls="'+id+'-a">'
        +   '<span class="faq-q__text">'+esc(it.q)+'</span>'+CHEV
        + '</button>'
        + '<div class="faq-a" id="'+id+'-a" role="region"><div class="faq-a__inner"><div class="faq-a__pad">'+body+'</div></div></div>'
      + '</div>';
    }).join("");
    return '<section class="faq-cat" id="cat-'+cat.id+'" style="--c:'+cat.c+'" aria-labelledby="cathead-'+cat.id+'">'
      + '<div class="faq-cathead"><span class="faq-cathead__icon">'+cat.icon+'</span><h2 id="cathead-'+cat.id+'">'+cat.label+'</h2></div>'
      + '<div class="faq-items">'+items+'</div>'
    + '</section>';
  }).join("")
  + '<div class="faq-empty" id="faq-empty" hidden><svg viewBox="0 0 24 24" stroke-width="1.6" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M8 11h6"/></svg><p>No questions match your search — try a different keyword.</p></div>';

  var items = [].slice.call(rootEl.querySelectorAll(".faq-item"));

  function setOpen(item, open){
    item.setAttribute("data-open", String(open));
    item.querySelector(".faq-q").setAttribute("aria-expanded", String(open));
  }

  // Accordion toggle
  rootEl.addEventListener("click", function(e){
    var btn = e.target.closest(".faq-q"); if(!btn) return;
    var item = btn.closest(".faq-item");
    setOpen(item, item.getAttribute("data-open") !== "true");
    syncExpandLabel();
  });

  // Expand / collapse all
  function visibleItems(){ return items.filter(function(it){ return !it.hidden; }); }
  function allOpen(){ var v=visibleItems(); return v.length && v.every(function(it){ return it.getAttribute("data-open")==="true"; }); }
  function syncExpandLabel(){
    if(!expandEl) return;
    expandEl.querySelector(".faq-expand__t").textContent = allOpen() ? "Collapse all" : "Expand all";
  }
  if (expandEl){
    expandEl.addEventListener("click", function(){
      var open = !allOpen();
      visibleItems().forEach(function(it){ setOpen(it, open); });
      syncExpandLabel();
    });
  }

  // Search filter
  var emptyEl = document.getElementById("faq-empty");
  if (searchEl){
    searchEl.addEventListener("input", function(){
      var q = searchEl.value.trim().toLowerCase();
      var anyVisible = false;
      DATA.forEach(function(cat){
        var sec = document.getElementById("cat-"+cat.id);
        var catHasMatch = false;
        [].forEach.call(sec.querySelectorAll(".faq-item"), function(it){
          var match = !q || it.getAttribute("data-q").indexOf(q)>=0 || it.getAttribute("data-text").indexOf(q)>=0;
          it.hidden = !match;
          if(match){ catHasMatch = true; anyVisible = true; if(q) setOpen(it, true); }
        });
        sec.hidden = !catHasMatch;
      });
      if(emptyEl) emptyEl.hidden = anyVisible;
      syncExpandLabel();
    });
  }

  // Scrollspy for nav active state
  if ("IntersectionObserver" in window){
    var spy = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){
          var id = en.target.id.replace("cat-","");
          [].forEach.call(navEl.querySelectorAll("a"), function(a){
            a.setAttribute("aria-current", String(a.getAttribute("data-cat")===id));
          });
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    DATA.forEach(function(cat){ spy.observe(document.getElementById("cat-"+cat.id)); });
  }

  // Deep-link: open + scroll to a question on load / hashchange
  function openFromHash(){
    var h = (location.hash||"").replace("#","");
    if(!h) return;
    var item = document.getElementById(h);
    if(item && item.classList.contains("faq-item")){
      setOpen(item, true); syncExpandLabel();
      try { item.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); } catch(e){ item.scrollIntoView(); }
    }
  }
  syncExpandLabel();
  openFromHash();
  window.addEventListener("hashchange", openFromHash);

  // Update hash when opening (shareable) without scroll jump
  rootEl.addEventListener("click", function(e){
    var btn = e.target.closest(".faq-q"); if(!btn) return;
    var item = btn.closest(".faq-item");
    if(item.getAttribute("data-open")==="true"){ try { history.replaceState(null,"","#"+item.id); } catch(err){} }
  });
})();
