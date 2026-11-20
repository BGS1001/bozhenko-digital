(() => {
  const S = window.SITE || {};
  const $ = (q, el = document) => el.querySelector(q);
  const $$ = (q, el = document) => [...el.querySelectorAll(q)];
  const eur = n => "€" + n;
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch {} }
  };
  const pkgs = S.packages || [];
  const work = S.work || [];
  const extras = S.extras || [];
  const root = document.documentElement;

  /* ---------- Prices ---------- */
  $("[data-plans]").innerHTML = pkgs.map(p => `
    <article class="plan ${p.featured ? "plan--main" : ""}">
      ${p.featured ? '<span class="ribbon">Our pick</span>' : ""}
      <h3>${esc(p.name)}</h3>
      <div class="plan__p">${eur(p.price)}<s>${eur(p.was)}</s></div>
      <p>${esc(p.note)}</p>
      <span class="plan__save">You save ${eur(p.was - p.price)}</span>
      <button class="btn ${p.featured ? "" : "btn--soft"}" type="button" data-order="${p.id}">Choose ${esc(p.name.toLowerCase())}</button>
    </article>`).join("");

  $("[data-plan-choices]").innerHTML = pkgs.map(p => `
    <label class="choice">
      <input type="radio" name="package" value="${p.id}" ${p.featured ? "checked" : ""} required>
      <span class="choice__txt"><b>${esc(p.name)}</b><small>${esc(p.note)}</small></span>
      <span class="choice__price"><b>${eur(p.price)}</b><s>${eur(p.was)}</s></span>
    </label>`).join("");

  /* ---------- Extras ---------- */
  $("[data-extras]").innerHTML = extras.map(x => `
    <article class="xcard ${x.id === "shoot" ? "xcard--shoot" : ""}">
      <h3>${esc(x.name)}</h3><p>${esc(x.text)}</p>
      <button class="btn btn--sm ${x.id === "shoot" ? "" : "btn--soft"}" type="button" data-quote="${esc(x.id)}">Request a quote</button>
    </article>`).join("");
  $("[data-service-select]").innerHTML = extras.map(x => `<option value="${esc(x.name)}" data-id="${esc(x.id)}">${esc(x.name)}</option>`).join("") +
    '<option value="Something else">Something else</option>';

  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const label = w => [w.tag, w.place].filter(Boolean).join(" · ");

  /* ---------- Hero: a fan of cards, dealt with the arrow ----------
     Three cards show at once (front, right, left); any others wait behind.
     The arrow, a swipe or a tap on a side card sends the front card round to
     the back of the deck, like dealing from the top. Only the front card plays
     its small silent loop, and only while the hero is on screen. */
  const deckIdx = work.map((w, i) => (w.hero && w.video ? i : -1)).filter(i => i > -1);
  const cardsEl = $("[data-deck-cards]"), capEl = $("[data-deck-cap]"), nextBtn = $("[data-deck-next]");
  let stack = deckIdx.slice(), heroSeen = false, dealing = false;
  cardsEl.innerHTML = deckIdx.map((i, n) => {
    const w = work[i];
    return `<div class="card" data-card="${i}" data-pos="${Math.min(n, 3)}">
      <img src="${esc(w.poster)}" alt="" width="540" height="960" decoding="async" ${n === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}>
      <video muted loop playsinline preload="none" aria-hidden="true" tabindex="-1"></video>
      <button class="card__hit" type="button" data-card-hit="${i}"><span class="sr"></span></button>
      <span class="card__play" aria-hidden="true">▶ Watch with sound</span>
      <span class="card__hand card__hand--a" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg></span><span class="card__hand card__hand--b" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg></span>
    </div>`;
  }).join("");
  const cardOf = i => $(`[data-card="${i}"]`, cardsEl);
  const layout = () => {
    stack.forEach((i, pos) => {
      const c = cardOf(i), w = work[i];
      c.dataset.pos = Math.min(pos, 3);
      const hit = $(".card__hit", c);
      hit.tabIndex = pos < 3 ? 0 : -1;
      $(".sr", hit).textContent = pos === 0 ? `Play the ${w.name} ad with sound` : `Bring the ${w.name} ad to the front`;
      const v = $("video", c);
      if (pos === 0 && heroSeen && !reduced && !saveData && !lb.open) {
        if (!v.getAttribute("src") && w.preview) v.src = w.preview;
        if (v.getAttribute("src")) v.play().then(() => c.classList.add("is-live")).catch(() => {});
      } else { v.pause(); }
    });
    const f = work[stack[0]];
    if (f) capEl.innerHTML = `<b>${esc(f.name)}</b><span>${esc(label(f))}</span>`;
  };
  const deal = () => {
    if (dealing || stack.length < 2) return;
    const top = stack[0], c = cardOf(top);
    stack = stack.slice(1).concat(top);
    if (reduced || !c.animate) { layout(); return; }
    dealing = true;
    /* lift the top card off to the side, then tuck it in at the back */
    c.classList.add("is-dealt");
    c.animate([{ transform: "translate(0,0) rotate(0)" }, { transform: "translate(-70%,-6%) rotate(-18deg)", offset: .45 },
      { transform: "translate(-24%,2%) rotate(-7deg) scale(.86)" }], { duration: 600, easing: "cubic-bezier(.3,.7,.3,1)" });
    setTimeout(() => { c.classList.remove("is-dealt"); layout(); }, 270);
    setTimeout(() => { dealing = false; }, 620);
  };

  /* ---------- Our work: the film strip ---------- */
  const reel = $("[data-reel]");
  reel.innerHTML = work.map((w, i) => `
    <li class="frame">
      <p class="frame__title"><b>${esc(w.name)}</b><span>${esc(label(w))}</span></p>
      <button class="frame__pic" type="button" data-play="${i}">
        <img src="${esc(w.poster)}" alt="" loading="lazy" decoding="async" width="540" height="960">
        <span class="frame__play" aria-hidden="true"></span>
        <span class="sr">Play the ${esc(w.name)} ${esc(w.tag)} ad with sound</span>
      </button>
      <p class="frame__note">${esc(w.note)}</p>
      <span class="frame__no" aria-hidden="true">${String(i + 1).padStart(2, "0")}${i % 2 ? "A" : ""} ▸</span>
    </li>`).join("");
  $$("[data-reel-step]").forEach(b => b.addEventListener("click", () => {
    const f = $(".frame", reel), step = f ? f.getBoundingClientRect().width * 2 : 400;
    reel.scrollBy({ left: +b.dataset.reelStep * step, behavior: reduced ? "auto" : "smooth" });
  }));
  /* hide an arrow when the film is already at that end */
  const ends = () => {
    const max = reel.scrollWidth - reel.clientWidth - 4;
    $$("[data-reel-step]").forEach(b => { b.disabled = +b.dataset.reelStep < 0 ? reel.scrollLeft <= 4 : reel.scrollLeft >= max; });
  };
  reel.addEventListener("scroll", () => requestAnimationFrame(ends), { passive: true });
  addEventListener("resize", ends); ends();
  /* drag the film along with a mouse */
  let drag = null, dragged = false;
  reel.addEventListener("pointerdown", e => { if (e.pointerType === "mouse" && e.button === 0) { drag = { x: e.clientX, l: reel.scrollLeft, moved: false }; dragged = false; } });
  addEventListener("pointermove", e => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 6) { drag.moved = true; reel.classList.add("is-dragging"); }
    if (drag.moved) reel.scrollLeft = drag.l - dx;
  });
  addEventListener("pointerup", () => { if (!drag) return; dragged = drag.moved; drag = null; reel.classList.remove("is-dragging"); });
  reel.addEventListener("dragstart", e => e.preventDefault());

  /* ---------- Cinema frame: the ad grows out of its card and plays ---------- */
  const lb = $("#lightbox"), lbv = $("video", lb), screen = $("[data-cine-screen]");
  let cur = -1;
  const fill = i => {
    const w = work[i]; cur = i;
    $("[data-cine-tag]").textContent = label(w);
    $("[data-cine-name]").textContent = w.name;
    $("[data-cine-note]").textContent = w.note;
    $("[data-cine-count]").textContent = `${i + 1} / ${work.length}`;
    lbv.poster = w.poster || ""; lbv.src = w.video;
    lbv.muted = false; lbv.play().catch(() => {});
  };
  function openCine(i, fromEl) {
    if (!work[i]?.video) return;
    $$("video", cardsEl).forEach(v => v.pause());
    fill(i); lb.showModal();
    if (reduced || !fromEl || !screen.animate) return;
    const a = fromEl.getBoundingClientRect(), b = screen.getBoundingClientRect();
    if (!a.width || !b.width) return;
    screen.animate([
      { transform: `translate(${a.left - b.left}px,${a.top - b.top}px) scale(${a.width / b.width},${a.height / b.height})` },
      { transform: "none" }
    ], { duration: 640, easing: "cubic-bezier(.2,.75,.2,1)" });
    $$(".cine__tag,.cine__name,.cine__note,.cine__ctrl", lb).forEach((n, k) =>
      n.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 420, delay: 380 + k * 70, fill: "backwards", easing: "ease-out" }));
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-play]");
    if (!b) return;
    if (dragged) { dragged = false; return; }
    openCine(+b.dataset.play, b);
  });
  $$("[data-cine-step]").forEach(b => b.addEventListener("click", () => {
    const n = (cur + +b.dataset.cineStep + work.length) % work.length;
    if (reduced || !screen.animate) { fill(n); return; }
    screen.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: "forwards" }).onfinish = () => {
      fill(n); screen.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 280 });
    };
  }));
  lb.addEventListener("keydown", e => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    if (e.target === lbv) return;
    e.preventDefault(); $(`[data-cine-step="${e.key === "ArrowRight" ? 1 : -1}"]`, lb).click();
  });
  lb.addEventListener("close", () => { lbv.pause(); lbv.removeAttribute("src"); lbv.load(); layout(); });

  /* hero wiring (needs the cinema frame above) */
  if (deckIdx.length) {
    layout();
    nextBtn.hidden = deckIdx.length < 2;
    nextBtn.addEventListener("click", deal);
    cardsEl.addEventListener("click", e => {
      const h = e.target.closest("[data-card-hit]"); if (!h) return;
      const i = +h.dataset.cardHit, pos = stack.indexOf(i);
      if (pos === 0) openCine(i, h.closest(".card"));
      else { deal(); if (pos === 2) setTimeout(deal, 640); }
    });
    let sx = null;
    cardsEl.addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive: true });
    cardsEl.addEventListener("touchend", e => { if (sx !== null && Math.abs(e.changedTouches[0].clientX - sx) > 40) deal(); sx = null; });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([en]) => {
        heroSeen = en.isIntersecting;
        if (heroSeen) layout(); else $$("video", cardsEl).forEach(v => v.pause());
      }, { threshold: .25 }).observe(cardsEl);
    }
  } else { $("[data-deck]").closest(".hero__media").hidden = true; }

  /* ---------- Ticker pause (moving content must be stoppable) ---------- */
  const tk = $("[data-ticker]"), tkp = $("[data-ticker-pause]");
  const setPaused = on => {
    tk.classList.toggle("is-paused", on); tkp.setAttribute("aria-pressed", String(on));
    tkp.setAttribute("aria-label", on ? "Play the scrolling offer" : "Pause the scrolling offer");
  };
  tkp.addEventListener("click", () => { const on = !tk.classList.contains("is-paused"); setPaused(on); store.set("bd_ticker_paused", on ? "1" : ""); });
  if (store.get("bd_ticker_paused") === "1") setPaused(true);

  /* ---------- Nav ---------- */
  const nav = $("#nav"), burger = $(".burger");
  const closeNav = () => { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); };
  burger.addEventListener("click", () => burger.setAttribute("aria-expanded", String(nav.classList.toggle("open"))));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && nav.classList.contains("open")) { closeNav(); burger.focus(); } });
  $$("a", nav).forEach(a => a.addEventListener("click", closeNav));

  /* ---------- Modals ---------- */
  const order = $("#order"), oform = $("#orderForm"), quote = $("#quote"), qform = $("#quoteForm");
  const updateTotal = () => {
    const p = pkgs.find(x => x.id === oform.package.value);
    $("[data-total]", oform).textContent = p ? eur(p.price) : "";
  };
  oform.addEventListener("change", e => { if (e.target.name === "package") updateTotal(); });
  document.addEventListener("click", e => {
    const o = e.target.closest("[data-order]");
    if (o) {
      e.preventDefault(); closeNav();
      const r = $(`input[name="package"][value="${o.dataset.order}"]`, oform); if (r) r.checked = true;
      updateTotal(); if (!order.open) order.showModal();
    }
    const q = e.target.closest("[data-quote]");
    if (q) {
      e.preventDefault();
      const opt = $(`option[data-id="${q.dataset.quote}"]`, qform); if (opt) opt.selected = true;
      if (!quote.open) quote.showModal();
    }
    if (e.target.closest("[data-close]")) e.target.closest("dialog").close();
  });
  [order, quote].forEach(d => d.addEventListener("click", e => { if (e.target === d) d.close(); }));
  lb.addEventListener("click", e => { if (e.target === lb || e.target.classList.contains("cine__stage")) lb.close(); });
  [order, quote].forEach(d => d.addEventListener("close", () => {
    const f = $("form", d); if (f.classList.contains("is-sent")) { f.classList.remove("is-sent"); $("[data-status]", f).innerHTML = ""; }
  }));
  const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  oform.date.min = today.toISOString().slice(0, 10);

  /* ---------- Validation & sending ---------- */
  const rules = {
    whatsapp: v => /^[+\d][\d\s()-]{6,}$/.test(v) || "Enter a valid WhatsApp number, e.g. +353 87 123 4567",
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || "Enter a valid email address",
    business: v => v.length > 2 || "Add your website or social page so we can see your business"
  };
  let errId = 0;
  const setErr = (el, msg) => {
    let n = el.parentElement.querySelector(".f__err");
    if (msg) {
      if (!n) { n = document.createElement("span"); n.className = "f__err"; n.id = "err" + (++errId); el.after(n); }
      n.textContent = msg; el.setAttribute("aria-invalid", "true"); el.setAttribute("aria-describedby", n.id);
    } else { n?.remove(); el.removeAttribute("aria-invalid"); el.removeAttribute("aria-describedby"); }
  };
  const altLinks = (text, subject) => {
    const a = [];
    if (S.whatsapp) a.push(`<a class="btn btn--sm" style="--b:#25D366;--bf:#fff" target="_blank" rel="noopener" href="https://wa.me/${S.whatsapp}?text=${encodeURIComponent(text)}">Send via WhatsApp</a>`);
    if (S.email) a.push(`<a class="btn btn--sm btn--soft" href="mailto:${S.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}">Send by email</a>`);
    return a.length ? `<div class="msg__alts">${a.join("")}</div>` : "";
  };

  function wire(form, { subject, summary, ok, after }) {
    Object.keys(rules).forEach(k => form[k] && form[k].addEventListener("blur", () => {
      const r = rules[k](form[k].value.trim()); if (form[k].value) setErr(form[k], r === true ? "" : r);
    }));
    const status = $("[data-status]", form), btn = $("[data-submit]", form);
    form.addEventListener("submit", async e => {
      e.preventDefault();
      let first = null;
      Object.keys(rules).forEach(k => {
        if (!form[k]) return;
        const r = rules[k](form[k].value.trim()); setErr(form[k], r === true ? "" : r);
        if (r !== true && !first) first = form[k];
      });
      if (first) { first.focus(); return; }
      if (form._gotcha.value) return;
      const data = Object.fromEntries(new FormData(form)); delete data._gotcha;
      const text = summary(data), subj = subject(data);
      if (!S.formEndpoint || location.protocol === "file:") {
        status.innerHTML = `<div class="msg msg--err"><b>The form only sends from the live website.</b> Your request was not sent. You can send it directly:${altLinks(text, subj)}</div>`;
        return;
      }
      btn.disabled = true; const label = btn.innerHTML; btn.textContent = "Sending…"; status.innerHTML = "";
      try {
        const res = await fetch(S.formEndpoint, {
          method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ ...data, _subject: subj, _template: "table", _captcha: "false", message: text })
        });
        const out = await res.json().catch(() => ({}));
        if (!res.ok || String(out.success) === "false") throw new Error(out.message || ("HTTP " + res.status));
        status.innerHTML = `<div class="msg msg--ok" tabindex="-1">${ok}<div class="msg__alts"><button class="btn btn--sm" type="button" data-close>Close</button></div></div>`;
        form.classList.add("is-sent"); $(".msg", status).focus();
        form.querySelectorAll("input:not([type=radio]),textarea").forEach(i => { if (i.type === "checkbox") i.checked = false; else i.value = ""; });
      } catch (err) {
        const reason = err instanceof TypeError ? "network or browser blocked the request" : String(err?.message || "");
        if (/activat/i.test(reason)) {
          status.innerHTML = `<div class="msg msg--err"><b>Almost there:</b> this form needs a one-time activation by the site owner. Please send your request directly for now:${altLinks(text, subj)}</div>`;
        } else {
          status.innerHTML = `<div class="msg msg--err"><b>Sorry, that didn’t go through.</b>${reason && !/^\d+$/.test(reason) ? ` <small>(${esc(reason)})</small>` : ""} Please try again or send it directly:${altLinks(text, subj)}</div>`;
        }
      } finally { btn.disabled = false; btn.innerHTML = label; after && after(); }
    });
  }
  wire(oform, {
    subject: d => { const p = pkgs.find(x => x.id === d.package); return `Video order: ${p ? `${p.name} ${eur(p.price)}` : d.package}`; },
    summary: d => {
      const p = pkgs.find(x => x.id === d.package);
      return [`New video order — ${p ? `${p.name} ${eur(p.price)} (was ${eur(p.was)})` : d.package}`, `WhatsApp: ${d.whatsapp}`, `Email: ${d.email}`,
        `Business: ${d.business}`, d.events && `Events: ${d.events}`, d.platform && `Platform: ${d.platform}`, d.date && `Needed by: ${d.date}`,
        d.extras_interest && "Also wants a quote for extras"].filter(Boolean).join("\n");
    },
    ok: "<b>Thank you, we’ve got your order.</b> We’ll be in touch on WhatsApp or email shortly to confirm the details.",
    after: updateTotal
  });
  wire(qform, {
    subject: d => `Quote request: ${d.service}`,
    summary: d => [`Quote request — ${d.service}`, d.name && `Name: ${d.name}`, `WhatsApp: ${d.whatsapp}`, `Email: ${d.email}`,
      `Business: ${d.business}`, d.details && `Details: ${d.details}`].filter(Boolean).join("\n"),
    ok: "<b>Thank you, your request is in.</b> We’ll come back to you with a quote on WhatsApp or email."
  });

  /* ---------- Countdown, timecode, contacts ---------- */
  const end = S.offerEnds ? new Date(S.offerEnds) : null;
  const cds = $$("[data-countdown]");
  const tick = () => {
    if (!end) { cds.forEach(n => n.textContent = ""); return; }
    const ms = end - new Date();
    const t = ms <= 0 ? "" : `${Math.floor(ms / 864e5)}d ${Math.floor(ms / 36e5 % 24)}h ${Math.floor(ms / 6e4 % 60)}m left`;
    cds.forEach(n => n.textContent = t);
  };
  tick(); setInterval(tick, 30000);
  const tc = $("[data-timecode]"), t0 = Date.now();
  setInterval(() => {
    if (root.dataset.look !== "creative") return;
    const s = (Date.now() - t0) / 1000, p = n => String(Math.floor(n)).padStart(2, "0");
    tc.textContent = `${p(s / 3600)}:${p(s / 60 % 60)}:${p(s % 60)}:${p(s * 25 % 25)}`;
  }, 80);
  $$("[data-year]").forEach(n => n.textContent = new Date().getFullYear());
  const c = [];
  if (S.whatsapp) c.push(`<li><a href="https://wa.me/${esc(S.whatsapp)}" target="_blank" rel="noopener">WhatsApp +${esc(S.whatsapp).replace(/^(353)(\d{2})(\d{3})(\d+)$/, "$1 $2 $3 $4")}</a></li>`);
  if (S.email) c.push(`<li><a href="mailto:${esc(S.email)}">${esc(S.email)}</a></li>`);
  $("[data-contacts]").innerHTML = c.join("");
  const wa = $("[data-wa-float]");
  if (S.whatsapp) wa.href = `https://wa.me/${S.whatsapp}`;

  /* ---------- Structured data for Google (built from config.js) ---------- */
  const ld = {
    "@context": "https://schema.org", "@type": "ProfessionalService", name: "Bozhenko Digital",
    description: "Short ad videos for Instagram, TikTok and Facebook, made from a business's existing reviews, photos and clips.",
    url: (S.siteUrl || location.origin) + "/", image: (S.siteUrl || location.origin) + "/assets/og.jpg",
    address: { "@type": "PostalAddress", addressLocality: "Limerick", addressCountry: "IE" },
    areaServed: { "@type": "Country", name: "Ireland" }, priceRange: pkgs.length ? `€${Math.min(...pkgs.map(p => p.price))}–€${Math.max(...pkgs.map(p => p.price))}` : undefined,
    ...(S.email && { email: S.email }), ...(S.whatsapp && { telephone: "+" + S.whatsapp }),
    makesOffer: pkgs.map(p => ({ "@type": "Offer", name: p.name, description: p.note, price: p.price, priceCurrency: "EUR",
      ...(S.offerEnds && { priceValidUntil: S.offerEnds.slice(0, 10) }) }))
  };
  const lds = document.createElement("script"); lds.type = "application/ld+json"; lds.textContent = JSON.stringify(ld);
  document.head.appendChild(lds);

  /* ---------- Cookie notice ---------- */
  const ck = $("[data-cookie]");
  const showWa = () => { wa.hidden = !S.whatsapp; };
  if (!store.get("bd_cookie_choice")) ck.hidden = false;
  showWa();
  $$("[data-cookie-choice]").forEach(b => b.addEventListener("click", () => {
    store.set("bd_cookie_choice", b.dataset.cookieChoice + "|" + new Date().toISOString()); ck.hidden = true; showWa();
  }));
  $$("[data-cookie-open]").forEach(b => b.addEventListener("click", () => { ck.hidden = false; showWa(); }));

  /* ---------- Magic button ---------- */
  const magic = $("[data-magic]"), smoke = $(".smoke"), meta = $('meta[name="theme-color"]');
  let ticking = false;
  const place = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    const prog = max > 0 ? scrollY / max : 0;
    const small = innerWidth < 560;
    const top = small ? innerHeight - 150 : innerHeight * .3, span = small ? 70 : innerHeight * .4;
    const sway = Math.sin(scrollY / 260) * (small ? 5 : 10);
    magic.style.setProperty("--my", `${Math.round(top + span * prog + sway)}px`);
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(place); } }, { passive: true });
  addEventListener("resize", place); place();

  let busy = false;
  const sparks = (x, y) => {
    for (let i = 0; i < 18; i++) {
      const s = document.createElement("span"); s.className = "spark";
      const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 90;
      s.style.left = x + "px"; s.style.top = y + "px";
      s.style.background = ["#FFD43B", "#FF9ACB", "#8C7BFF", "#ffffff"][i % 4];
      document.body.appendChild(s);
      s.animate([{ transform: "translate(-50%,-50%) scale(1)", opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d}px)) scale(.2)`, opacity: 0 }],
        { duration: 700 + Math.random() * 400, easing: "cubic-bezier(.2,.7,.3,1)" }).onfinish = () => s.remove();
    }
  };
  /* fine film grain, drawn once into a small tile */
  let grainUrl = "";
  const grainTile = () => {
    if (grainUrl) return grainUrl;
    try {
      const c = document.createElement("canvas"); c.width = c.height = 128;
      const g = c.getContext("2d"), d = g.createImageData(128, 128);
      for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = Math.random() * 70; }
      g.putImageData(d, 0, 0); grainUrl = c.toDataURL();
    } catch {}
    return grainUrl;
  };
  const puffs = (x, y, toCreative) => {
    smoke.innerHTML = "";
    /* tinted, see-through fog so the site stays visible while it changes */
    const cols = toCreative ? ["255,255,255", "201,204,255", "255,154,203", "255,212,59", "140,123,255"]
                            : ["255,255,255", "201,218,210", "215,157,50", "236,238,232", "31,94,78"];
    const W = innerWidth, H = innerHeight, small = W < 560, n = small ? 9 : 14;
    for (let i = 0; i < n; i++) {
      const p = document.createElement("i"), sz = (small ? 150 : 220) + Math.random() * (small ? 120 : 200);
      const c = cols[i % cols.length], o = .35 + Math.random() * .25;
      /* puffs start at the wand and roll out across the screen */
      const tx = W * (.05 + Math.random() * .9), ty = H * (.05 + Math.random() * .9);
      p.style.cssText = `width:${sz}px;height:${sz}px;background:radial-gradient(circle,rgba(${c},.9) 0%,rgba(${c},.45) 38%,rgba(${c},0) 70%);` +
        `--x0:${x - sz / 2}px;--y0:${y - sz / 2}px;--x1:${tx - sz / 2}px;--y1:${ty - sz / 2}px;--s:${1.6 + Math.random() * 1.6};--o:${o};--d:${1.4 + Math.random() * .6}s;animation-delay:${i * 35}ms`;
      smoke.appendChild(p);
    }
    const g = document.createElement("b"); const url = grainTile(); if (url) g.style.backgroundImage = `url(${url})`;
    smoke.appendChild(g);
  };
  magic.addEventListener("click", () => {
    if (busy) return;
    const toCreative = root.dataset.look !== "creative";
    const r = magic.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    const swap = () => {
      root.dataset.look = toCreative ? "creative" : "irish";
      magic.setAttribute("aria-pressed", String(toCreative));
      magic.title = toCreative ? "Back to the calm look" : "Switch the site to our creative studio look";
      meta.setAttribute("content", toCreative ? "#2A35E8" : "#14463A");
    };
    if (reduced) { swap(); return; }
    busy = true;
    sparks(x, y); puffs(x, y, toCreative);
    root.classList.add("is-casting", "is-morphing");
    /* the colours change while the fog is still thin, so you watch the site transform */
    setTimeout(swap, 420);
    setTimeout(() => { root.classList.remove("is-casting"); root.classList.add("is-clearing"); }, 1250);
    setTimeout(() => { root.classList.remove("is-clearing", "is-morphing"); smoke.innerHTML = ""; busy = false; }, 2150);
  });
})();
