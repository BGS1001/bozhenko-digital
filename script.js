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
      ${p.featured ? '<span class="ribbon">Most chosen</span>' : ""}
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
      ${x.id === "shoot" ? '<span class="xcard__new">New</span>' : ""}
      <h3>${esc(x.name)}</h3><p>${esc(x.text)}</p>
      <button class="btn btn--sm ${x.id === "shoot" ? "" : "btn--soft"}" type="button" data-quote="${esc(x.id)}">Request a quote</button>
    </article>`).join("");
  $("[data-service-select]").innerHTML = extras.map(x => `<option value="${esc(x.name)}" data-id="${esc(x.id)}">${esc(x.name)}</option>`).join("") +
    '<option value="Something else">Something else</option>';

  /* ---------- Hero video ---------- */
  const heroIdx = work.findIndex(w => w && w.video);
  const phone = $("[data-hero-video]");
  if (heroIdx > -1) {
    const h = work[heroIdx];
    phone.innerHTML = `<video ${reduced ? "" : "autoplay"} muted loop playsinline preload="metadata" ${h.poster ? `poster="${esc(h.poster)}"` : ""} src="${esc(h.video)}"></video>
      <button class="vbtn" type="button" data-play="${heroIdx}">▶ Watch with sound</button>`;
  }

  /* ---------- Lightbox ---------- */
  const lb = $("#lightbox"), lbv = $("video", lb);
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-play]");
    if (!b) return;
    const w = work[+b.dataset.play];
    if (!w?.video) return;
    lbv.src = w.video; if (w.poster) lbv.poster = w.poster;
    lb.showModal(); lbv.muted = false; lbv.play().catch(() => {});
  });
  lb.addEventListener("close", () => { lbv.pause(); lbv.removeAttribute("src"); lbv.load(); });

  /* ---------- Nav ---------- */
  const nav = $("#nav"), burger = $(".burger");
  const closeNav = () => { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); };
  burger.addEventListener("click", () => burger.setAttribute("aria-expanded", String(nav.classList.toggle("open"))));
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
  [order, quote, lb].forEach(d => d.addEventListener("click", e => { if (e.target === d) d.close(); }));
  oform.date.min = new Date().toISOString().slice(0, 10);

  /* ---------- Validation & sending ---------- */
  const rules = {
    whatsapp: v => /^[+\d][\d\s()-]{6,}$/.test(v) || "Enter a valid WhatsApp number, e.g. +353 87 123 4567",
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || "Enter a valid email address",
    business: v => v.length > 2 || "Add your website or social page so we can see your business"
  };
  const setErr = (el, msg) => {
    el.setAttribute("aria-invalid", msg ? "true" : "false");
    let n = el.parentElement.querySelector(".f__err");
    if (msg) { if (!n) { n = document.createElement("span"); n.className = "f__err"; el.after(n); } n.textContent = msg; }
    else n?.remove();
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
        status.innerHTML = `<div class="msg msg--ok">${ok}</div>`;
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
    const t = ms <= 0 ? "Offer ended" : `${Math.floor(ms / 864e5)}d ${Math.floor(ms / 36e5 % 24)}h ${Math.floor(ms / 6e4 % 60)}m left`;
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

  /* ---------- Cookie notice ---------- */
  const ck = $("[data-cookie]");
  const showWa = () => { if (S.whatsapp) wa.hidden = !ck.hidden; };
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
  const puffs = (x, y, toCreative) => {
    smoke.innerHTML = "";
    const cols = toCreative ? ["#ffffff", "#E9E4FF", "#FFD9EC", "#FFF3C4", "#C9CCFF"] : ["#ffffff", "#DCE8E2", "#ECEEE8", "#C9DAD2", "#F3E6C8"];
    const n = innerWidth < 560 ? 12 : 18;
    for (let i = 0; i < n; i++) {
      const p = document.createElement("i");
      const sz = 160 + Math.random() * 220;
      p.style.cssText = `left:${x}px;top:${y}px;width:${sz}px;height:${sz}px;background:radial-gradient(circle,${cols[i % cols.length]} 0%,transparent 70%);` +
        `--dx:${(Math.random() - .75) * innerWidth * 1.2}px;--dy:${(Math.random() - .5) * innerHeight * 1.3}px;--s:${3 + Math.random() * 5};animation-delay:${i * 18}ms`;
      smoke.appendChild(p);
    }
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
    root.classList.add("is-casting");
    setTimeout(swap, 760);
    setTimeout(() => { root.classList.remove("is-casting"); root.classList.add("is-clearing"); }, 1050);
    setTimeout(() => { root.classList.remove("is-clearing"); smoke.innerHTML = ""; busy = false; }, 2200);
  });
})();
