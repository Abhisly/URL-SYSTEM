const f = /* @__PURE__ */ new Set([
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
]), U = [
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
]), I = {
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
function k(e) {
  const t = e.split("."), i = ["co.uk", "com.au", "co.in", "co.jp", "com.br"], o = t.slice(-2).join(".");
  return i.includes(o) && t.length > 2 ? t.slice(-3).join(".") : t.slice(-2).join(".");
}
function E(e) {
  if (!e || e.trim() === "")
    return { isValid: !1, reason: "URL input is empty" };
  if (e.includes(" "))
    return { isValid: !1, reason: "URL contains spaces" };
  try {
    const t = e.startsWith("http") ? e : `https://${e}`;
    new URL(t);
  } catch {
    return { isValid: !1, reason: "URL syntax is malformed or invalid" };
  }
  return { isValid: !0 };
}
function T(e) {
  let t = 0;
  const i = [];
  try {
    const r = new URL(e.startsWith("http") ? e : `https://${e}`), s = r.hostname.toLowerCase(), c = k(s), m = f.has(c);
    r.protocol !== "https:" && (t += 20, i.push({ id: "HTTP_NO_SECURE", description: "URL uses insecure HTTP protocol", severity: "medium" })), e.length > 100 ? (t += 20, i.push({ id: "LONG_URL", description: `URL is very long (${e.length} chars) — likely obfuscating destination`, severity: "medium" })) : e.length > 75 && (t += 10, i.push({ id: "LONG_URL", description: "URL is unusually long (potential obfuscation)", severity: "low" })), /^(\d{1,3}\.){3}\d{1,3}$/.test(s) && (t += 45, i.push({ id: "IP_HOSTNAME", description: "URL uses raw IP address instead of domain name", severity: "high" }));
    const l = s.split(".");
    if (l.length >= 5 && (t += 30, i.push({ id: "EXCESSIVE_SUBDOMAINS", description: `Extremely nested subdomains (${l.length} levels)`, severity: "high" })), !m) {
      for (const n of U)
        if (s.includes(n)) {
          t += 50, i.push({
            id: "BRAND_IMPERSONATION",
            description: `Non-trusted domain "${c}" contains brand keyword "${n}" — likely impersonation`,
            severity: "high"
          });
          break;
        }
    }
    for (const [n, u] of Object.entries(I))
      if (u.test(s) && !f.has(c)) {
        t += 55, i.push({
          id: "TYPOSQUATTING",
          description: `Domain appears to be a typosquat of "${n}" using character substitution`,
          severity: "high"
        });
        break;
      }
    const S = "." + l[l.length - 1].toLowerCase();
    b.has(S) && (t += 25, i.push({ id: "SUSPICIOUS_TLD", description: `TLD "${S}" is frequently abused in scam campaigns`, severity: "medium" }));
    const L = ["login", "verify", "update", "secure", "account", "banking", "signin", "confirm", "unlock", "validate"];
    if (!m) {
      for (const n of L)
        if (s.includes(n)) {
          t += 25, i.push({ id: "SUSPICIOUS_KEYWORD", description: `Untrusted hostname contains security-bait keyword: "${n}"`, severity: "high" });
          break;
        }
    }
    const y = (s.match(/-/g) || []).length;
    if (y >= 3 && (t += 20, i.push({ id: "MULTIPLE_HYPHENS", description: `Domain contains ${y} hyphens (phishing indicator)`, severity: "medium" })), !m && l.length >= 3) {
      const n = l.slice(0, -2).join(".");
      for (const u of f)
        if (n.includes(u.replace(".", "-")) || n.includes(u)) {
          t += 65, i.push({
            id: "DECEPTIVE_SUBDOMAIN",
            description: `Trusted brand "${u}" is used in subdomain to disguise malicious domain "${c}"`,
            severity: "high"
          });
          break;
        }
    }
    /[^\x00-\x7F]/.test(s) && (t += 40, i.push({ id: "HOMOGRAPH_SPOOFING", description: "Domain contains non-ASCII characters (homograph attack)", severity: "high" }));
  } catch {
    t += 50, i.push({ id: "MALFORMED_URL", description: "URL structure is invalid or malformed", severity: "high" });
  }
  t = Math.min(t, 100);
  let o = "LOW", a = "SAFE";
  return t >= 75 ? (o = "CRITICAL", a = "MALICIOUS") : t >= 45 ? (o = "HIGH", a = "MALICIOUS") : t >= 20 && (o = "MEDIUM", a = "SUSPICIOUS"), { score: t, reasons: i, riskLevel: o, status: a };
}
let d = "http://localhost:3000";
chrome.storage.local.get(["backendUrl"], (e) => {
  e.backendUrl && (d = e.backendUrl, console.log("[URL SYSTEM SHIELD] Loaded backend URL from storage:", d));
});
const h = /* @__PURE__ */ new Map();
chrome.runtime.onMessage.addListener((e, t, i) => {
  var o;
  if (e.action === "scanUrl") {
    const a = (o = t.tab) == null ? void 0 : o.id;
    return g(e.url, a).then(i).catch((r) => i({ error: !0, message: r.message })), !0;
  }
  if (e.action === "checkServer")
    return v().then(i).catch(() => i({ online: !1 })), !0;
  if (e.action === "captureScreenshot")
    return chrome.tabs.captureVisibleTab(void 0, { format: "png" }, (a) => {
      chrome.runtime.lastError ? i({ error: !0, message: chrome.runtime.lastError.message }) : i(a ? { success: !0, dataUrl: a } : { error: !0, message: "Failed to capture screenshot." });
    }), !0;
  if (e.action === "analyzeOcrText")
    return O(e.ocrText, e.filename).then(i).catch((a) => i({ error: !0, message: a.message })), !0;
  if (e.action === "registerBackend") {
    const a = e.url;
    return a && (a.startsWith("http://localhost") || a.includes("vercel.app") || a.includes("127.0.0.1")) ? (chrome.storage.local.set({ backendUrl: a }, () => {
      d = a, console.log("[URL SYSTEM SHIELD] Successfully registered backend URL:", a), i({ success: !0, backendUrl: a });
    }), !0) : (i({ success: !1 }), !0);
  }
});
async function g(e, t) {
  if (!e || !e.startsWith("http"))
    return t !== void 0 && chrome.action.setBadgeText({ text: "", tabId: t }), {
      status: "INVALID",
      confidence: 100,
      riskLevel: "LOW",
      reasons: [{ id: "INVALID_PROTOCOL", description: "Internal browser page or invalid protocol", severity: "low" }],
      threatScore: 0,
      aiExplanation: "Aborted: The extension only scans HTTP or HTTPS pages."
    };
  const i = e.split("#")[0];
  if (h.has(i)) {
    const o = h.get(i);
    return t !== void 0 && p(o.status, t), o;
  }
  try {
    const o = await fetch(`${d}/api/scan-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url: i })
    });
    if (o.ok) {
      const a = await o.json();
      return h.set(i, a), p(a.status, t), a;
    }
    throw new Error("Server returned error status");
  } catch (o) {
    console.warn("[URL SYSTEM SHIELD] Backend offline or fetch error. Falling back to local Heuristics.", o);
    const a = E(i);
    if (!a.isValid)
      return {
        status: "INVALID",
        confidence: 100,
        riskLevel: "LOW",
        reasons: [{ id: "INVALID_URL_FORMAT", description: a.reason || "Invalid format", severity: "high" }],
        threatScore: 0,
        aiExplanation: "Aborted: Local validation failed."
      };
    const r = T(i), s = {
      status: r.status,
      confidence: 80,
      // High confidence in heuristics
      riskLevel: r.riskLevel,
      reasons: r.reasons,
      threatScore: r.score,
      aiExplanation: `[LOCAL HEURISTICS] URL SYSTEM server is offline. Local Heuristic Shield is active.

Heuristic scan evaluated this URL score at ${r.score}/100 based on ${r.reasons.length} warning indicators.`
    };
    return h.set(i, s), p(s.status, t), s;
  }
}
async function v() {
  var e;
  try {
    const t = await fetch(`${d}/api/system-status`, { signal: AbortSignal.timeout(2e3) });
    if (t.ok)
      return { online: !0, aiConnected: ((e = (await t.json()).services) == null ? void 0 : e.ai_orchestrator) === "online" };
  } catch {
  }
  return { online: !1, aiConnected: !1 };
}
async function O(e, t) {
  try {
    const i = await fetch(`${d}/api/analyze-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ocrText: e, filename: t })
    });
    if (i.ok)
      return await i.json();
    throw new Error("Failed to analyze image content via API.");
  } catch (i) {
    console.warn("[URL SYSTEM SHIELD] Image Analysis API offline. Performing local heuristic analysis.", i);
    const o = e.toLowerCase(), a = /urgent|verify|suspend|limited|reset|security|unusual/i.test(o), r = /login|password|signin|credentials|bank|wallet/i.test(o);
    let s = 0;
    const c = [];
    return a && (s += 35, c.push({ id: "URGENCY_MANIPULATION", description: "OCR text contains high-urgency keywords", severity: "medium" })), r && (s += 45, c.push({ id: "CREDENTIAL_HARVESTING", description: "OCR text requests sensitive credentials or login details", severity: "high" })), {
      status: s >= 45 ? "MALICIOUS" : s > 0 ? "SUSPICIOUS" : "SAFE",
      confidence: 75,
      riskLevel: s >= 45 ? "HIGH" : s > 0 ? "MEDIUM" : "LOW",
      reasons: c,
      aiExplanation: `[LOCAL HEURISTICS] URL SYSTEM server is offline. Local Image Heuristics scan completed.

Extracted OCR Text length: ${e.length} characters.
Urgency indicators: ${a ? "YES" : "NO"}
Phishing keywords: ${r ? "YES" : "NO"}

Start URL SYSTEM backend to run Ollama AI reasoning.`
    };
  }
}
function p(e, t) {
  let i = "", o = "#6b7280";
  e === "SAFE" ? (i = "OK", o = "#10b981") : e === "SUSPICIOUS" ? (i = "WARN", o = "#f59e0b") : e === "MALICIOUS" && (i = "RISK", o = "#ef4444"), chrome.action.setBadgeText({ text: i, tabId: t }), chrome.action.setBadgeBackgroundColor({ color: o, tabId: t });
}
chrome.tabs.onUpdated.addListener((e, t, i) => {
  t.url && (t.url.startsWith("http") ? g(t.url, e).catch((o) => {
    console.error("[URL SYSTEM SHIELD] Auto-scan on update failed:", o);
  }) : chrome.action.setBadgeText({ text: "", tabId: e }));
});
chrome.tabs.onActivated.addListener((e) => {
  chrome.tabs.get(e.tabId, (t) => {
    if (chrome.runtime.lastError || !t || !t.url) {
      chrome.action.setBadgeText({ text: "", tabId: e.tabId });
      return;
    }
    if (!t.url.startsWith("http"))
      chrome.action.setBadgeText({ text: "", tabId: e.tabId });
    else {
      const i = t.url.split("#")[0], o = h.get(i);
      o ? p(o.status, e.tabId) : (chrome.action.setBadgeText({ text: "", tabId: e.tabId }), g(t.url, e.tabId).catch(() => {
      }));
    }
  });
});
