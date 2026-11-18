(() => {
  const S = window.SITE || {};
  const $ = (q, el = document) => el.querySelector(q);
  const $$ = (q, el = document) => [...el.querySelectorAll(q)];
  const eur = n => "€" + n;
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pkgs = S.packages || [];
  const work = (S.work || []).slice(0, 6);

  /* ---------- Plans (prices section) ---------- */
  $("[data-plans]").innerHTML = pkgs.map(p => `
    <article class="plan rv ${p.featured ? "plan--featured" : ""}">
      ${p.featured ? '<span class="plan__flag">Black Friday pick</span>' : ""}
      <h3>${esc(p.name)}</h3>
      <p class="plan__note">${esc(p.note)}</p>
      <div class="plan__price"><b>${eur(p.price)}</b><s>${eur(p.was)}</s></div>
      <span class="plan__save">You save ${eur(p.was - p.price)} · ${Math.round((1 - p.price / p.was) * 100)}% off</span>
      <button class="btn btn--lg" type="button" data-order="${p.id}">Choose ${esc(p.name.toLowerCase())}</button>
    </article>`).join("");

  /* ---------- Order form plan choices ---------- */
  $("[data-plan-choices]").innerHTML = pkgs.map(p => `
    <label class="choice">
      <input type="radio" name="package" value="${p.id}" ${p.featured ? "checked" : ""} required>
      <span class="choice__txt"><b>${esc(p.name)}${p.featured ? '<span class="choice__hot">Top offer</span>' : ""}</b><small>${esc(p.note)}</small></span>
      <span class="choice__price"><b>${eur(p.price)}</b><s>${eur(p.was)}</s></span>
    </label>`).join("");

  /* ---------- Work grid ---------- */
  const hasVideo = w => w && w.video;
  $("[data-work]").innerHTML = work.map((w, i) => hasVideo(w) ? `
    <button class="reel reel--has-video rv" type="button" data-play="${i}" aria-label="Play ${esc(w.title)}">
      <video muted loop playsinline preload="none" ${w.poster ? `poster="${esc(w.poster)}"` : ""} data-src="${esc(w.video)}"></video>
      ${w.price ? `<span class="reel__price">This video<b>${eur(w.price)}</b>${w.was ? `<s>${eur(w.was)}</s>` : ""}</span>` : ""}
      <span class="reel__play" aria-hidden="true"></span>
      <span class="reel__meta">
        <span class="reel__tag">${esc(w.tag)}</span>
        <span class="reel__title">${esc(w.title)}</span>
        <span class="reel__sub">${esc([w.format, w.made].filter(Boolean).join(" · "))}</span>
      </span>
    </button>` : `
    <div class="reel reel--soon rv" aria-label="New example coming soon">
      <span class="reel__big">${esc(w.tag)}</span>
      <span class="reel__meta">
        <span class="reel__tag">New example soon</span>
        <span class="reel__title">${esc(w.format)} · from ${eur(pkgs[0]?.price ?? 47)}</span>
      </span>
    </div>`).join("");

  // Muted preview autoplay only while visible; never with sound.
  const previews = $$(".reel video");
  if (!reduced && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); }
      else v.pause();
    }), { threshold: .4 });
    previews.forEach(v => io.observe(v));
  }

  /* ---------- Hero phone ---------- */
  const hero = work.find(hasVideo);
  const phone = $("[data-hero-video]");
  if (hero) {
    phone.innerHTML = `<div class="phone__screen">
      <video ${reduced ? "" : "autoplay"} muted loop playsinline preload="metadata" ${hero.poster ? `poster="${esc(hero.poster)}"` : ""} src="${esc(hero.video)}"></video>
      <button class="vbtn" type="button" data-play="${work.indexOf(hero)}">🔊 Watch with sound</button></div>`;
    const hv = $("video", phone);
    hv.addEventListener("error", () => { phone.innerHTML = placeholder(); }, { once: true });
  } else phone.innerHTML = placeholder();
  function placeholder() {
    return `<div class="phone__screen"><div class="ph"><small>Example video</small><b>Your ad,<br>made in 24–72h</b></div></div>`;
  }

  /* ---------- Lightbox ---------- */
  const lb = $("#lightbox"), lbv = $("video", lb);
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-play]");
    if (!b) return;
    const w = work[+b.dataset.play];
    if (!w?.video) return;
    $$("video").forEach(v => v !== lbv && v.pause());
    lbv.src = w.video; if (w.poster) lbv.poster = w.poster;
    lb.showModal(); lbv.muted = false; lbv.play().catch(() => {});
  });
  lb.addEventListener("close", () => { lbv.pause(); lbv.removeAttribute("src"); lbv.load(); });

  /* ---------- Order modal ---------- */
  const modal = $("#order"), form = $("#orderForm");
  const supportCheck = $("[data-support-check]");
  const updateTotal = () => {
    const p = pkgs.find(x => x.id === form.package.value);
    $("[data-total]").textContent = p ? eur(p.price) : "";
  };
  form.addEventListener("change", e => { if (e.target.name === "package") updateTotal(); });
  const openOrder = (id, support) => {
    const r = $(`input[name="package"][value="${id}"]`, form);
    if (r) r.checked = true;
    supportCheck.hidden = !support;
    if (support) supportCheck.querySelector("input").checked = true;
    updateTotal();
    if (!modal.open) modal.showModal();
    try { sessionStorage.setItem("bd_popup", "1"); } catch {}
  };
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-order]");
    if (b) { e.preventDefault(); closeNav(); openOrder(b.dataset.order, !!b.dataset.support); }
    if (e.target.closest("[data-close]")) e.target.closest("dialog").close();
  });
  // click on backdrop closes
  [modal, lb].forEach(d => d.addEventListener("click", e => { if (e.target === d) d.close(); }));

  // Auto pop-up once per visit (like the Black Friday pop-up on the reference site)
  const delay = +S.popupDelaySeconds || 0;
  let seen = false; try { seen = sessionStorage.getItem("bd_popup") === "1"; } catch {}
  if (delay > 0 && !seen && !offerOver()) setTimeout(() => {
    if (!document.querySelector("dialog[open]")) openOrder(pkgs.find(p => p.featured)?.id || pkgs[0]?.id);
  }, delay * 1000);

  /* ---------- Validation & submit ---------- */
  const rules = {
    whatsapp: v => /^[+\d][\d\s()-]{6,}$/.test(v) || "Enter a valid WhatsApp number, e.g. +353 87 123 4567",
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || "Enter a valid email address",
    business: v => v.length > 2 || "Add your website or social account so we can see your business"
  };
  const setErr = (el, msg) => {
    el.setAttribute("aria-invalid", msg ? "true" : "false");
    let n = el.parentElement.querySelector(".f__err");
    if (msg) { if (!n) { n = document.createElement("span"); n.className = "f__err"; el.after(n); } n.textContent = msg; }
    else n?.remove();
  };
  Object.keys(rules).forEach(k => form[k].addEventListener("blur", () => {
    const r = rules[k](form[k].value.trim()); if (form[k].value) setErr(form[k], r === true ? "" : r);
  }));
  // date: no past dates
  form.date.min = new Date().toISOString().slice(0, 10);

  const status = $("[data-status]");
  const summary = d => {
    const p = pkgs.find(x => x.id === d.package);
    return [
      `New video order — ${p ? `${p.name} ${eur(p.price)} (was ${eur(p.was)})` : d.package}`,
      `WhatsApp: ${d.whatsapp}`, `Email: ${d.email}`, `Business: ${d.business}`,
      d.events && `Events: ${d.events}`, d.platform && `Platform: ${d.platform}`,
      d.date && `Needed by: ${d.date}`, d.growth_support && `Also interested in Growth support`
    ].filter(Boolean).join("\n");
  };
  const altLinks = text => {
    const a = [];
    if (S.whatsapp) a.push(`<a class="btn btn--sm" style="--bg:#25D366" target="_blank" rel="noopener" href="https://wa.me/${S.whatsapp}?text=${encodeURIComponent(text)}">Send via WhatsApp</a>`);
    if (S.email) a.push(`<a class="btn btn--sm btn--ink" href="mailto:${S.email}?subject=${encodeURIComponent("Video order")}&body=${encodeURIComponent(text)}">Send by email</a>`);
    return a.length ? `<div class="msg__alts">${a.join("")}</div>` : "";
  };

  form.addEventListener("submit", async e => {
    e.preventDefault();
    let first = null;
    Object.keys(rules).forEach(k => {
      const r = rules[k](form[k].value.trim());
      setErr(form[k], r === true ? "" : r);
      if (r !== true && !first) first = form[k];
    });
    if (first) { first.focus(); return; }
    if (form._gotcha.value) return; // bot

    const data = Object.fromEntries(new FormData(form));
    delete data._gotcha;
    const p = pkgs.find(x => x.id === data.package);
    data.package_label = p ? `${p.name} — ${eur(p.price)} (was ${eur(p.was)})` : data.package;
    const text = summary(data);
    const btn = $("[data-submit]");

    if (S.formEndpoint && location.protocol === "file:") {
      status.innerHTML = `<div class="msg msg--err"><b>The form only sends from the live website.</b> This page is opened as a file on your computer, so the request was not sent. Once the site is online it will work.${altLinks(text)}</div>`;
      return;
    }
    if (!S.formEndpoint) {
      status.innerHTML = `<div class="msg msg--err"><b>Online ordering isn't connected yet.</b> Your request was not sent.${
        altLinks(text) || " Please contact us directly — details coming soon."}</div>`;
      return;
    }
    btn.disabled = true; const label = btn.innerHTML; btn.textContent = "Sending…";
    status.innerHTML = "";
    try {
      const res = await fetch(S.formEndpoint, {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...data, _subject: `Video order: ${data.package_label}`, _template: "table", _captcha: "false", message: text })
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || String(out.success) === "false") throw new Error(out.message || ("HTTP " + res.status));
      status.innerHTML = `<div class="msg msg--ok"><b>Thank you, we’ve got your order.</b> We’ll be in touch on WhatsApp or email shortly to confirm the details.</div>`;
      form.querySelectorAll("input:not([type=radio])").forEach(i => { if (i.type === "checkbox") i.checked = false; else i.value = ""; });
    } catch (err) {
      if (err instanceof TypeError) err = new Error("network or browser blocked the request");
      console.warn("Order form error:", err);
      const reason = String(err && err.message || "");
      if (/activat/i.test(reason)) {
        status.innerHTML = `<div class="msg msg--err"><b>Almost there:</b> this order form needs a one-time activation by the site owner. Please send your order directly for now:${altLinks(text)}</div>`;
        return;
      }
      status.innerHTML = `<div class="msg msg--err"><b>Sorry, that didn't go through.</b>${reason && !/^\d+$/.test(reason) ? ` <small>(${esc(reason)})</small>` : ""} Please try again${S.whatsapp || S.email ? " or send it directly:" : "."}${altLinks(text)}</div>`;
    } finally { btn.disabled = false; btn.innerHTML = label; updateTotal(); }
  });

  /* ---------- Countdown ---------- */
  function offerOver() { return S.offerEnds && new Date(S.offerEnds) < new Date(); }
  const cds = $$("[data-countdown]");
  const tickCd = () => {
    if (!S.offerEnds) return;
    const ms = new Date(S.offerEnds) - new Date();
    if (ms <= 0) { cds.forEach(c => c.textContent = ""); return; }
    const d = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5), m = Math.floor(ms % 36e5 / 6e4);
    const t = d > 0 ? `ends in ${d}d ${h}h` : `ends in ${h}h ${m}m`;
    cds.forEach(c => c.textContent = t);
  };
  tickCd(); setInterval(tickCd, 30000);

  /* ---------- Contacts ---------- */
  const c = [];
  if (S.whatsapp) c.push(`<li><a href="https://wa.me/${S.whatsapp}" target="_blank" rel="noopener">WhatsApp</a></li>`);
  if (S.email) c.push(`<li><a href="mailto:${esc(S.email)}">${esc(S.email)}</a></li>`);
  [["Instagram", S.instagram], ["TikTok", S.tiktok], ["Facebook", S.facebook]].forEach(([n, u]) => u && c.push(`<li><a href="${esc(u)}" target="_blank" rel="noopener">${n}</a></li>`));
  $("[data-contacts]").innerHTML = c.join("");
  if (S.whatsapp) { const w = $("[data-wa-float]"); w.href = `https://wa.me/${S.whatsapp}`; w.hidden = false; }
  $("[data-year]").textContent = new Date().getFullYear();

  /* ---------- Mobile nav ---------- */
  const burger = $(".burger"), nav = $("#nav");
  function closeNav() { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }
  burger.addEventListener("click", () => {
    const o = nav.classList.toggle("open"); burger.setAttribute("aria-expanded", String(o));
  });
  $$("a", nav).forEach(a => a.addEventListener("click", closeNav));

  /* ---------- Reveal on scroll ---------- */
  if (!reduced && "IntersectionObserver" in window) {
    const ro = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); } }), { threshold: .12 });
    $$(".rv, .step, .plan").forEach(el => { el.classList.add("rv"); ro.observe(el); });
  } else $$(".rv").forEach(el => el.classList.add("in"));
})();
