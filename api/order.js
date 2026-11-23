/* Order / quote relay.
   The browser posts to this same-site address, so iPhone content blockers and
   cross-site (CORS) rules cannot stop it. This function then passes the request
   on to FormSubmit, which emails it to the studio inbox. FormSubmit is slow
   (often 30-40 s) and sometimes answers "Server Error", so we retry here. */
const INBOX = "bozhenkodigital@gmail.com";
const SITE = "https://www.bozhenkodigital.ie/";
const ENDPOINT = "https://formsubmit.co/ajax/" + INBOX;

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function relay(payload) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 50000);
  try {
    const r = await fetch(ENDPOINT, {
      method: "POST", signal: ctl.signal,
      headers: { "Content-Type": "application/json", Accept: "application/json", Origin: SITE.slice(0, -1), Referer: SITE },
      body: JSON.stringify(payload)
    });
    const out = await r.json().catch(() => ({}));
    return { status: r.status, out };
  } finally { clearTimeout(t); }
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.status(405).json({ success: "false", message: "Method not allowed" }); return; }
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== "object" || Array.isArray(body)) { res.status(400).json({ success: "false", message: "Bad request" }); return; }
  if (body._gotcha) { res.status(200).json({ success: "true" }); return; } // bot trap

  // Keep only plain short text fields.
  const payload = {};
  for (const [k, v] of Object.entries(body).slice(0, 30)) {
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") payload[String(k).slice(0, 60)] = String(v).slice(0, 4000);
  }
  payload._captcha = "false";
  payload._template = "table";

  let last = { status: 0, out: {} };
  for (let i = 0; i < 2; i++) {
    try {
      last = await relay(payload);
      const msg = String(last.out.message || "");
      if (last.status < 500 && !/server error/i.test(msg)) break;
    } catch (e) {
      last = { status: 504, out: { message: e && e.name === "AbortError" ? "the mail service timed out" : "the mail service could not be reached" } };
    }
    if (i === 0) await sleep(1500);
  }
  const ok = last.status >= 200 && last.status < 300 && String(last.out.success) !== "false";
  res.status(ok ? 200 : 502).json(ok ? { success: "true" } : { success: "false", message: last.out.message || "Server Error" });
};
