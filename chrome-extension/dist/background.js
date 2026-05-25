const p = /* @__PURE__ */ new Set([
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
]), b = [
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
], U = /* @__PURE__ */ new Set([
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
]), k = {
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
function I(i) {
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
function T(i) {
  let e = 0;
  const t = [];
  try {
    const n = new URL(i.startsWith("http") ? i : `https://${i}`), s = n.hostname.toLowerCase(), u = v(s), m = p.has(u);
    n.protocol !== "https:" && (e += 20, t.push({ id: "HTTP_NO_SECURE", description: "URL uses insecure HTTP protocol", severity: "medium" })), i.length > 100 ? (e += 20, t.push({ id: "LONG_URL", description: `URL is very long (${i.length} chars) — likely obfuscating destination`, severity: "medium" })) : i.length > 75 && (e += 10, t.push({ id: "LONG_URL", description: "URL is unusually long (potential obfuscation)", severity: "low" })), /^(\d{1,3}\.){3}\d{1,3}$/.test(s) && (e += 45, t.push({ id: "IP_HOSTNAME", description: "URL uses raw IP address instead of domain name", severity: "high" }));
    const c = s.split(".");
    if (c.length >= 5 && (e += 30, t.push({ id: "EXCESSIVE_SUBDOMAINS", description: `Extremely nested subdomains (${c.length} levels)`, severity: "high" })), !m) {
      for (const r of b)
        if (s.includes(r)) {
          e += 50, t.push({
            id: "BRAND_IMPERSONATION",
            description: `Non-trusted domain "${u}" contains brand keyword "${r}" — likely impersonation`,
            severity: "high"
          });
          break;
        }
    }
    for (const [r, l] of Object.entries(k))
      if (l.test(s) && !p.has(u)) {
        e += 55, t.push({
          id: "TYPOSQUATTING",
          description: `Domain appears to be a typosquat of "${r}" using character substitution`,
          severity: "high"
        });
        break;
      }
    const S = "." + c[c.length - 1].toLowerCase();
    U.has(S) && (e += 25, t.push({ id: "SUSPICIOUS_TLD", description: `TLD "${S}" is frequently abused in scam campaigns`, severity: "medium" }));
    const L = ["login", "verify", "update", "secure", "account", "banking", "signin", "confirm", "unlock", "validate"];
    if (!m) {
      for (const r of L)
        if (s.includes(r)) {
          e += 25, t.push({ id: "SUSPICIOUS_KEYWORD", description: `Untrusted hostname contains security-bait keyword: "${r}"`, severity: "high" });
          break;
        }
    }
    const y = (s.match(/-/g) || []).length;
    if (y >= 3 && (e += 20, t.push({ id: "MULTIPLE_HYPHENS", description: `Domain contains ${y} hyphens (phishing indicator)`, severity: "medium" })), !m && c.length >= 3) {
      const r = c.slice(0, -2).join(".");
      for (const l of p)
        if (r.includes(l.replace(".", "-")) || r.includes(l)) {
          e += 65, t.push({
            id: "DECEPTIVE_SUBDOMAIN",
            description: `Trusted brand "${l}" is used in subdomain to disguise malicious domain "${u}"`,
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
const f = "http://localhost:3001", d = /* @__PURE__ */ new Map();
chrome.runtime.onMessage.addListener((i, e, t) => {
  var o;
  if (i.action === "scanUrl") {
    const a = (o = e.tab) == null ? void 0 : o.id;
    return g(i.url, a).then(t).catch((n) => t({ error: !0, message: n.message })), !0;
  }
  if (i.action === "checkServer")
    return O().then(t).catch(() => t({ online: !1 })), !0;
  if (i.action === "captureScreenshot")
    return chrome.tabs.captureVisibleTab(void 0, { format: "png" }, (a) => {
      chrome.runtime.lastError ? t({ error: !0, message: chrome.runtime.lastError.message }) : t(a ? { success: !0, dataUrl: a } : { error: !0, message: "Failed to capture screenshot." });
    }), !0;
  if (i.action === "analyzeScreenshot")
    return w(i.image, i.filename).then(t).catch((a) => t({ error: !0, message: a.message })), !0;
});
async function g(i, e) {
  if (!i || !i.startsWith("http"))
    return e !== void 0 && chrome.action.setBadgeText({ text: "", tabId: e }), {
      status: "INVALID",
      confidence: 100,
      riskLevel: "LOW",
      reasons: [{ id: "INVALID_PROTOCOL", description: "Internal browser page or invalid protocol", severity: "low" }],
      threatScore: 0,
      aiExplanation: "Aborted: The extension only scans HTTP or HTTPS pages."
    };
  const t = i.split("#")[0];
  if (d.has(t)) {
    const o = d.get(t);
    return e !== void 0 && h(o.status, e), o;
  }
  try {
    const o = await fetch(`${f}/api/scan-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url: t })
    });
    if (o.ok) {
      const a = await o.json();
      return d.set(t, a), h(a.status, e), a;
    }
    throw new Error("Server returned error status");
  } catch (o) {
    console.warn("[URL SYSTEM SHIELD] Backend offline or fetch error. Falling back to local Heuristics.", o);
    const a = I(t);
    if (!a.isValid)
      return {
        status: "INVALID",
        confidence: 100,
        riskLevel: "LOW",
        reasons: [{ id: "INVALID_URL_FORMAT", description: a.reason || "Invalid format", severity: "high" }],
        threatScore: 0,
        aiExplanation: "Aborted: Local validation failed."
      };
    const n = T(t), s = {
      status: n.status,
      confidence: 80,
      // High confidence in heuristics
      riskLevel: n.riskLevel,
      reasons: n.reasons,
      threatScore: n.score,
      aiExplanation: `[LOCAL HEURISTICS] URL SYSTEM server is offline. Local Heuristic Shield is active.

Heuristic scan evaluated this URL score at ${n.score}/100 based on ${n.reasons.length} warning indicators.`
    };
    return d.set(t, s), h(s.status, e), s;
  }
}
async function O() {
  var i;
  try {
    const e = await fetch(`${f}/api/system-status`, { signal: AbortSignal.timeout(2e3) });
    if (e.ok)
      return { online: !0, aiConnected: ((i = (await e.json()).services) == null ? void 0 : i.ai_orchestrator) === "online" };
  } catch {
  }
  return { online: !1, aiConnected: !1 };
}
async function w(i, e) {
  try {
    const t = await fetch(`${f}/api/analyze-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ image: i, filename: e })
    });
    if (t.ok)
      return await t.json();
    const o = await t.json().catch(() => ({}));
    throw new Error(o.message || "Failed to analyze image content via API.");
  } catch (t) {
    return console.error("[URL SYSTEM SHIELD] Screenshot Analysis API failed:", t), {
      status: "UNKNOWN",
      confidence: 50,
      riskLevel: "LOW",
      reasons: [{ id: "OCR_OFFLINE", description: "OCR engine is offline. Start URL SYSTEM backend to run visual scanning.", severity: "medium" }],
      aiExplanation: `[OFFLINE] Could not analyze screenshot because the URL SYSTEM backend API is offline or unreachable.

Screenshot analysis requires the server-side OCR engine to be running.`
    };
  }
}
function h(i, e) {
  let t = "", o = "#6b7280";
  i === "SAFE" ? (t = "OK", o = "#10b981") : i === "SUSPICIOUS" ? (t = "WARN", o = "#f59e0b") : i === "MALICIOUS" && (t = "RISK", o = "#ef4444"), chrome.action.setBadgeText({ text: t, tabId: e }), chrome.action.setBadgeBackgroundColor({ color: o, tabId: e });
}
chrome.tabs.onUpdated.addListener((i, e, t) => {
  e.url && (e.url.startsWith("http") ? g(e.url, i).catch((o) => {
    console.error("[URL SYSTEM SHIELD] Auto-scan on update failed:", o);
  }) : chrome.action.setBadgeText({ text: "", tabId: i }));
});
chrome.tabs.onActivated.addListener((i) => {
  chrome.tabs.get(i.tabId, (e) => {
    if (chrome.runtime.lastError || !e || !e.url) {
      chrome.action.setBadgeText({ text: "", tabId: i.tabId });
      return;
    }
    if (!e.url.startsWith("http"))
      chrome.action.setBadgeText({ text: "", tabId: i.tabId });
    else {
      const t = e.url.split("#")[0], o = d.get(t);
      o ? h(o.status, i.tabId) : (chrome.action.setBadgeText({ text: "", tabId: i.tabId }), g(e.url, i.tabId).catch(() => {
      }));
    }
  });
});
