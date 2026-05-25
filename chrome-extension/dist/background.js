const h = /* @__PURE__ */ new Set([
  "google.com",
  "gmail.com",
  "youtube.com",
  "facebook.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "amazon.com",
  "amazon.in",
  "amazon.co.uk",
  "microsoft.com",
  "live.com",
  "outlook.com",
  "hotmail.com",
  "apple.com",
  "icloud.com",
  "paypal.com",
  "paypal.me",
  "netflix.com",
  "spotify.com",
  "twitch.tv",
  "discord.com",
  "github.com",
  "gitlab.com",
  "linkedin.com",
  "reddit.com",
  "wikipedia.org",
  "openai.com",
  "chatgpt.com",
  "anthropic.com",
  "claude.ai",
  "notion.so",
  "vercel.com",
  "stripe.com",
  "shopify.com",
  "zoom.us",
  "slack.com",
  "dropbox.com",
  "box.com",
  "ebay.com",
  "walmart.com",
  "target.com",
  "bestbuy.com",
  "chase.com",
  "bankofamerica.com",
  "wellsfargo.com",
  "citibank.com",
  "irs.gov",
  "gov.uk",
  "gov.in"
]), L = [
  "paypal",
  "google",
  "gmail",
  "apple",
  "icloud",
  "microsoft",
  "outlook",
  "amazon",
  "facebook",
  "instagram",
  "twitter",
  "netflix",
  "spotify",
  "whatsapp",
  "yahoo",
  "ebay",
  "walmart",
  "chase",
  "citibank",
  "wellsfargo",
  "bankofamerica",
  "irs",
  "gov",
  "fedex",
  "dhl",
  "ups",
  "usps",
  "linkedin",
  "dropbox",
  "stripe",
  "shopify",
  "zoom",
  "discord"
], I = /* @__PURE__ */ new Set([
  ".xyz",
  ".top",
  ".info",
  ".work",
  ".click",
  ".gq",
  ".cf",
  ".tk",
  ".ml",
  ".ga",
  ".buzz",
  ".cam",
  ".fit",
  ".gdn",
  ".science",
  ".country",
  ".stream",
  ".download",
  ".zip",
  ".loan",
  ".date",
  ".racing",
  ".win",
  ".bid",
  ".men",
  ".review",
  ".trade",
  ".party",
  ".accountant"
]), b = {
  paypal: /p[a4][iy]p[a4]l/i,
  google: /g[o0][o0]g[l1][e3]/i,
  apple: /[a4]pp[l1][e3]/i,
  amazon: /[a4]m[a4]z[o0]n/i,
  microsoft: /m[i1]cr[o0]s[o0]ft/i,
  netflix: /n[e3]tf[l1][i1]x/i,
  facebook: /f[a4]c[e3]b[o0][o0]k/i,
  instagram: /[i1]nst[a4]gr[a4]m/i,
  twitter: /tw[i1]tt[e3]r/i,
  linkedin: /l[i1]nk[e3]d[i1]n/i
};
function v(i) {
  const e = i.split("."), t = ["co.uk", "com.au", "co.in", "co.jp", "com.br"], o = e.slice(-2).join(".");
  return t.includes(o) && e.length > 2 ? e.slice(-3).join(".") : e.slice(-2).join(".");
}
function U(i) {
  if (!i || i.trim() === "")
    return { isValid: !1, reason: "URL input is empty" };
  if (i.includes(" "))
    return { isValid: !1, reason: "URL contains spaces" };
  try {
    const e = i.startsWith("http") ? i : `https://${i}`;
    new URL(e);
  } catch {
    return { isValid: !1, reason: "URL syntax is malformed or invalid" };
  }
  return { isValid: !0 };
}
function k(i) {
  let e = 0;
  const t = [];
  try {
    const r = new URL(i.startsWith("http") ? i : `https://${i}`), s = r.hostname.toLowerCase(), c = v(s), u = h.has(c);
    r.protocol !== "https:" && (e += 20, t.push({ id: "HTTP_NO_SECURE", description: "URL uses insecure HTTP protocol", severity: "medium" })), i.length > 100 ? (e += 20, t.push({ id: "LONG_URL", description: `URL is very long (${i.length} chars) — likely obfuscating destination`, severity: "medium" })) : i.length > 75 && (e += 10, t.push({ id: "LONG_URL", description: "URL is unusually long (potential obfuscation)", severity: "low" })), /^(\d{1,3}\.){3}\d{1,3}$/.test(s) && (e += 45, t.push({ id: "IP_HOSTNAME", description: "URL uses raw IP address instead of domain name", severity: "high" }));
    const l = s.split(".");
    if (l.length >= 5 && (e += 30, t.push({ id: "EXCESSIVE_SUBDOMAINS", description: `Extremely nested subdomains (${l.length} levels)`, severity: "high" })), !u) {
      for (const n of L)
        if (s.includes(n)) {
          e += 50, t.push({
            id: "BRAND_IMPERSONATION",
            description: `Non-trusted domain "${c}" contains brand keyword "${n}" — likely impersonation`,
            severity: "high"
          });
          break;
        }
    }
    for (const [n, d] of Object.entries(b))
      if (d.test(s) && !h.has(c)) {
        e += 55, t.push({
          id: "TYPOSQUATTING",
          description: `Domain appears to be a typosquat of "${n}" using character substitution`,
          severity: "high"
        });
        break;
      }
    const f = "." + l[l.length - 1].toLowerCase();
    I.has(f) && (e += 25, t.push({ id: "SUSPICIOUS_TLD", description: `TLD "${f}" is frequently abused in scam campaigns`, severity: "medium" }));
    const S = ["login", "verify", "update", "secure", "account", "banking", "signin", "confirm", "unlock", "validate"];
    if (!u) {
      for (const n of S)
        if (s.includes(n)) {
          e += 25, t.push({ id: "SUSPICIOUS_KEYWORD", description: `Untrusted hostname contains security-bait keyword: "${n}"`, severity: "high" });
          break;
        }
    }
    const g = (s.match(/-/g) || []).length;
    if (g >= 3 && (e += 20, t.push({ id: "MULTIPLE_HYPHENS", description: `Domain contains ${g} hyphens (phishing indicator)`, severity: "medium" })), !u && l.length >= 3) {
      const n = l.slice(0, -2).join(".");
      for (const d of h)
        if (n.includes(d.replace(".", "-")) || n.includes(d)) {
          e += 65, t.push({
            id: "DECEPTIVE_SUBDOMAIN",
            description: `Trusted brand "${d}" is used in subdomain to disguise malicious domain "${c}"`,
            severity: "high"
          });
          break;
        }
    }
    /[^\x00-\x7F]/.test(s) && (e += 40, t.push({ id: "HOMOGRAPH_SPOOFING", description: "Domain contains non-ASCII characters (homograph attack)", severity: "high" }));
  } catch {
    e += 50, t.push({ id: "MALFORMED_URL", description: "URL structure is invalid or malformed", severity: "high" });
  }
  e = Math.min(e, 100);
  let o = "LOW", a = "SAFE";
  return e >= 75 ? (o = "CRITICAL", a = "MALICIOUS") : e >= 45 ? (o = "HIGH", a = "MALICIOUS") : e >= 20 && (o = "MEDIUM", a = "SUSPICIOUS"), { score: e, reasons: t, riskLevel: o, status: a };
}
const p = "http://localhost:3001", m = /* @__PURE__ */ new Map();
chrome.runtime.onMessage.addListener((i, e, t) => {
  if (i.action === "scanUrl")
    return O(i.url).then(t).catch((o) => t({ error: !0, message: o.message })), !0;
  if (i.action === "checkServer")
    return w().then(t).catch(() => t({ online: !1 })), !0;
  if (i.action === "captureScreenshot")
    return chrome.tabs.captureVisibleTab(void 0, { format: "png" }, (o) => {
      chrome.runtime.lastError ? t({ error: !0, message: chrome.runtime.lastError.message }) : t(o ? { success: !0, dataUrl: o } : { error: !0, message: "Failed to capture screenshot." });
    }), !0;
  if (i.action === "analyzeOcrText")
    return E(i.ocrText, i.filename).then(t).catch((o) => t({ error: !0, message: o.message })), !0;
});
async function O(i) {
  if (!i || !i.startsWith("http"))
    return {
      status: "INVALID",
      confidence: 100,
      riskLevel: "LOW",
      reasons: [{ id: "INVALID_PROTOCOL", description: "Internal browser page or invalid protocol", severity: "low" }],
      threatScore: 0,
      aiExplanation: "Aborted: The extension only scans HTTP or HTTPS pages."
    };
  const e = i.split("#")[0];
  if (m.has(e))
    return m.get(e);
  try {
    const t = await fetch(`${p}/api/scan-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url: e })
    });
    if (t.ok) {
      const o = await t.json();
      return m.set(e, o), y(o.status), o;
    }
    throw new Error("Server returned error status");
  } catch (t) {
    console.warn("[URL SYSTEM SHIELD] Backend offline or fetch error. Falling back to local Heuristics.", t);
    const o = U(e);
    if (!o.isValid)
      return {
        status: "INVALID",
        confidence: 100,
        riskLevel: "LOW",
        reasons: [{ id: "INVALID_URL_FORMAT", description: o.reason || "Invalid format", severity: "high" }],
        threatScore: 0,
        aiExplanation: "Aborted: Local validation failed."
      };
    const a = k(e), r = {
      status: a.status,
      confidence: 80,
      // High confidence in heuristics
      riskLevel: a.riskLevel,
      reasons: a.reasons,
      threatScore: a.score,
      aiExplanation: `[LOCAL HEURISTICS] URL SYSTEM server is offline. Local Heuristic Shield is active.

Heuristic scan evaluated this URL score at ${a.score}/100 based on ${a.reasons.length} warning indicators.`
    };
    return m.set(e, r), y(r.status), r;
  }
}
async function w() {
  var i;
  try {
    const e = await fetch(`${p}/api/system-status`, { signal: AbortSignal.timeout(2e3) });
    if (e.ok)
      return { online: !0, aiConnected: ((i = (await e.json()).services) == null ? void 0 : i.ai_orchestrator) === "online" };
  } catch {
  }
  return { online: !1, aiConnected: !1 };
}
async function E(i, e) {
  try {
    const t = await fetch(`${p}/api/analyze-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ocrText: i, filename: e })
    });
    if (t.ok)
      return await t.json();
    throw new Error("Failed to analyze image content via API.");
  } catch (t) {
    console.error("[URL SYSTEM SHIELD] OCR Analysis API failed:", t);
    const o = i.toLowerCase(), a = /urgent|verify|suspend|limited|reset|security|unusual/i.test(o), r = /login|password|signin|credentials|bank|wallet/i.test(o);
    let s = 0;
    const c = [];
    return a && (s += 35, c.push({ id: "URGENCY_MANIPULATION", description: "OCR text contains high-urgency keywords", severity: "medium" })), r && (s += 45, c.push({ id: "CREDENTIAL_HARVESTING", description: "OCR text requests sensitive credentials or login details", severity: "high" })), {
      status: s >= 45 ? "MALICIOUS" : s > 0 ? "SUSPICIOUS" : "SAFE",
      confidence: 65,
      riskLevel: s >= 45 ? "HIGH" : s > 0 ? "MEDIUM" : "LOW",
      reasons: c,
      aiExplanation: `[LOCAL HEURISTICS] Server offline. Local Image Heuristics scan completed.

Extracted OCR Text length: ${i.length} characters.
Urgency indicators: ${a ? "YES" : "NO"}
Phishing keywords: ${r ? "YES" : "NO"}`
    };
  }
}
function y(i) {
  let e = "", t = "#6b7280";
  i === "SAFE" ? (e = "OK", t = "#10b981") : i === "SUSPICIOUS" ? (e = "WARN", t = "#f59e0b") : i === "MALICIOUS" && (e = "RISK", t = "#ef4444"), chrome.action.setBadgeText({ text: e }), chrome.action.setBadgeBackgroundColor({ color: t });
}
