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
]), I = [
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
], b = /* @__PURE__ */ new Set([
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
]), U = {
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
function T(t) {
  const e = t.split("."), i = ["co.uk", "com.au", "co.in", "co.jp", "com.br"], o = e.slice(-2).join(".");
  return i.includes(o) && e.length > 2 ? e.slice(-3).join(".") : e.slice(-2).join(".");
}
function k(t) {
  if (!t || t.trim() === "")
    return { isValid: !1, reason: "URL input is empty" };
  if (t.includes(" "))
    return { isValid: !1, reason: "URL contains spaces" };
  try {
    const e = t.startsWith("http") ? t : `https://${t}`;
    new URL(e);
  } catch {
    return { isValid: !1, reason: "URL syntax is malformed or invalid" };
  }
  return { isValid: !0 };
}
function v(t) {
  let e = 0;
  const i = [];
  try {
    const n = new URL(t.startsWith("http") ? t : `https://${t}`), a = n.hostname.toLowerCase(), c = T(a), h = p.has(c);
    n.protocol !== "https:" && (e += 20, i.push({ id: "HTTP_NO_SECURE", description: "URL uses insecure HTTP protocol", severity: "medium" })), t.length > 100 ? (e += 20, i.push({ id: "LONG_URL", description: `URL is very long (${t.length} chars) — likely obfuscating destination`, severity: "medium" })) : t.length > 75 && (e += 10, i.push({ id: "LONG_URL", description: "URL is unusually long (potential obfuscation)", severity: "low" })), /^(\d{1,3}\.){3}\d{1,3}$/.test(a) && (e += 45, i.push({ id: "IP_HOSTNAME", description: "URL uses raw IP address instead of domain name", severity: "high" }));
    const l = a.split(".");
    if (l.length >= 5 && (e += 30, i.push({ id: "EXCESSIVE_SUBDOMAINS", description: `Extremely nested subdomains (${l.length} levels)`, severity: "high" })), !h) {
      for (const r of I)
        if (a.includes(r)) {
          e += 50, i.push({
            id: "BRAND_IMPERSONATION",
            description: `Non-trusted domain "${c}" contains brand keyword "${r}" — likely impersonation`,
            severity: "high"
          });
          break;
        }
    }
    for (const [r, d] of Object.entries(U))
      if (d.test(a) && !p.has(c)) {
        e += 55, i.push({
          id: "TYPOSQUATTING",
          description: `Domain appears to be a typosquat of "${r}" using character substitution`,
          severity: "high"
        });
        break;
      }
    const S = "." + l[l.length - 1].toLowerCase();
    b.has(S) && (e += 25, i.push({ id: "SUSPICIOUS_TLD", description: `TLD "${S}" is frequently abused in scam campaigns`, severity: "medium" }));
    const L = ["login", "verify", "update", "secure", "account", "banking", "signin", "confirm", "unlock", "validate"];
    if (!h) {
      for (const r of L)
        if (a.includes(r)) {
          e += 25, i.push({ id: "SUSPICIOUS_KEYWORD", description: `Untrusted hostname contains security-bait keyword: "${r}"`, severity: "high" });
          break;
        }
    }
    const y = (a.match(/-/g) || []).length;
    if (y >= 3 && (e += 20, i.push({ id: "MULTIPLE_HYPHENS", description: `Domain contains ${y} hyphens (phishing indicator)`, severity: "medium" })), !h && l.length >= 3) {
      const r = l.slice(0, -2).join(".");
      for (const d of p)
        if (r.includes(d.replace(".", "-")) || r.includes(d)) {
          e += 65, i.push({
            id: "DECEPTIVE_SUBDOMAIN",
            description: `Trusted brand "${d}" is used in subdomain to disguise malicious domain "${c}"`,
            severity: "high"
          });
          break;
        }
    }
    /[^\x00-\x7F]/.test(a) && (e += 40, i.push({ id: "HOMOGRAPH_SPOOFING", description: "Domain contains non-ASCII characters (homograph attack)", severity: "high" }));
  } catch {
    e += 50, i.push({ id: "MALFORMED_URL", description: "URL structure is invalid or malformed", severity: "high" });
  }
  e = Math.min(e, 100);
  let o = "LOW", s = "SAFE";
  return e >= 75 ? (o = "CRITICAL", s = "MALICIOUS") : e >= 45 ? (o = "HIGH", s = "MALICIOUS") : e >= 20 && (o = "MEDIUM", s = "SUSPICIOUS"), { score: e, reasons: i, riskLevel: o, status: s };
}
const f = "http://localhost:3001", u = /* @__PURE__ */ new Map();
chrome.runtime.onMessage.addListener((t, e, i) => {
  var o;
  if (t.action === "scanUrl") {
    const s = (o = e.tab) == null ? void 0 : o.id;
    return g(t.url, s).then(i).catch((n) => i({ error: !0, message: n.message })), !0;
  }
  if (t.action === "checkServer")
    return E().then(i).catch(() => i({ online: !1 })), !0;
  if (t.action === "captureScreenshot")
    return chrome.tabs.captureVisibleTab(void 0, { format: "png" }, (s) => {
      chrome.runtime.lastError ? i({ error: !0, message: chrome.runtime.lastError.message }) : i(s ? { success: !0, dataUrl: s } : { error: !0, message: "Failed to capture screenshot." });
    }), !0;
  if (t.action === "analyzeOcrText")
    return O(t.ocrText, t.filename).then(i).catch((s) => i({ error: !0, message: s.message })), !0;
});
async function g(t, e) {
  if (!t || !t.startsWith("http"))
    return e !== void 0 && chrome.action.setBadgeText({ text: "", tabId: e }), {
      status: "INVALID",
      confidence: 100,
      riskLevel: "LOW",
      reasons: [{ id: "INVALID_PROTOCOL", description: "Internal browser page or invalid protocol", severity: "low" }],
      threatScore: 0,
      aiExplanation: "Aborted: The extension only scans HTTP or HTTPS pages."
    };
  const i = t.split("#")[0];
  if (u.has(i)) {
    const o = u.get(i);
    return e !== void 0 && m(o.status, e), o;
  }
  try {
    const o = await fetch(`${f}/api/scan-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url: i })
    });
    if (o.ok) {
      const s = await o.json();
      return u.set(i, s), m(s.status, e), s;
    }
    throw new Error("Server returned error status");
  } catch (o) {
    console.warn("[URL SYSTEM SHIELD] Backend offline or fetch error. Falling back to local Heuristics.", o);
    const s = k(i);
    if (!s.isValid)
      return {
        status: "INVALID",
        confidence: 100,
        riskLevel: "LOW",
        reasons: [{ id: "INVALID_URL_FORMAT", description: s.reason || "Invalid format", severity: "high" }],
        threatScore: 0,
        aiExplanation: "Aborted: Local validation failed."
      };
    const n = v(i), a = {
      status: n.status,
      confidence: 80,
      // High confidence in heuristics
      riskLevel: n.riskLevel,
      reasons: n.reasons,
      threatScore: n.score,
      aiExplanation: `[LOCAL HEURISTICS] URL SYSTEM server is offline. Local Heuristic Shield is active.

Heuristic scan evaluated this URL score at ${n.score}/100 based on ${n.reasons.length} warning indicators.`
    };
    return u.set(i, a), m(a.status, e), a;
  }
}
async function E() {
  var t;
  try {
    const e = await fetch(`${f}/api/system-status`, { signal: AbortSignal.timeout(2e3) });
    if (e.ok)
      return { online: !0, aiConnected: ((t = (await e.json()).services) == null ? void 0 : t.ai_orchestrator) === "online" };
  } catch {
  }
  return { online: !1, aiConnected: !1 };
}
async function O(t, e) {
  try {
    const i = await fetch(`${f}/api/analyze-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ocrText: t, filename: e })
    });
    if (i.ok)
      return await i.json();
    throw new Error("Failed to analyze image content via API.");
  } catch (i) {
    console.warn("[URL SYSTEM SHIELD] Image Analysis API offline. Performing local heuristic analysis.", i);
    const o = t.toLowerCase(), s = /urgent|verify|suspend|limited|reset|security|unusual/i.test(o), n = /login|password|signin|credentials|bank|wallet/i.test(o);
    let a = 0;
    const c = [];
    return s && (a += 35, c.push({ id: "URGENCY_MANIPULATION", description: "OCR text contains high-urgency keywords", severity: "medium" })), n && (a += 45, c.push({ id: "CREDENTIAL_HARVESTING", description: "OCR text requests sensitive credentials or login details", severity: "high" })), {
      status: a >= 45 ? "MALICIOUS" : a > 0 ? "SUSPICIOUS" : "SAFE",
      confidence: 75,
      riskLevel: a >= 45 ? "HIGH" : a > 0 ? "MEDIUM" : "LOW",
      reasons: c,
      aiExplanation: `[LOCAL HEURISTICS] URL SYSTEM server is offline. Local Image Heuristics scan completed.

Extracted OCR Text length: ${t.length} characters.
Urgency indicators: ${s ? "YES" : "NO"}
Phishing keywords: ${n ? "YES" : "NO"}

Start URL SYSTEM backend to run Ollama AI reasoning.`
    };
  }
}
function m(t, e) {
  let i = "", o = "#6b7280";
  t === "SAFE" ? (i = "OK", o = "#10b981") : t === "SUSPICIOUS" ? (i = "WARN", o = "#f59e0b") : t === "MALICIOUS" && (i = "RISK", o = "#ef4444"), chrome.action.setBadgeText({ text: i, tabId: e }), chrome.action.setBadgeBackgroundColor({ color: o, tabId: e });
}
chrome.tabs.onUpdated.addListener((t, e, i) => {
  e.url && (e.url.startsWith("http") ? g(e.url, t).catch((o) => {
    console.error("[URL SYSTEM SHIELD] Auto-scan on update failed:", o);
  }) : chrome.action.setBadgeText({ text: "", tabId: t }));
});
chrome.tabs.onActivated.addListener((t) => {
  chrome.tabs.get(t.tabId, (e) => {
    if (chrome.runtime.lastError || !e || !e.url) {
      chrome.action.setBadgeText({ text: "", tabId: t.tabId });
      return;
    }
    if (!e.url.startsWith("http"))
      chrome.action.setBadgeText({ text: "", tabId: t.tabId });
    else {
      const i = e.url.split("#")[0], o = u.get(i);
      o ? m(o.status, t.tabId) : (chrome.action.setBadgeText({ text: "", tabId: t.tabId }), g(e.url, t.tabId).catch(() => {
      }));
    }
  });
});
