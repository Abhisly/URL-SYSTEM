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
]), w = [
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
], E = /* @__PURE__ */ new Set([
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
    const s = new URL(t.startsWith("http") ? t : `https://${t}`), n = s.hostname.toLowerCase(), r = T(n), d = f.has(r);
    s.protocol !== "https:" && (e += 20, i.push({ id: "HTTP_NO_SECURE", description: "URL uses insecure HTTP protocol", severity: "medium" })), t.length > 100 ? (e += 20, i.push({ id: "LONG_URL", description: `URL is very long (${t.length} chars) — likely obfuscating destination`, severity: "medium" })) : t.length > 75 && (e += 10, i.push({ id: "LONG_URL", description: "URL is unusually long (potential obfuscation)", severity: "low" })), /^(\d{1,3}\.){3}\d{1,3}$/.test(n) && (e += 45, i.push({ id: "IP_HOSTNAME", description: "URL uses raw IP address instead of domain name", severity: "high" }));
    const c = n.split(".");
    if (c.length >= 5 && (e += 30, i.push({ id: "EXCESSIVE_SUBDOMAINS", description: `Extremely nested subdomains (${c.length} levels)`, severity: "high" })), !d) {
      for (const l of w)
        if (n.includes(l)) {
          e += 50, i.push({
            id: "BRAND_IMPERSONATION",
            description: `Non-trusted domain "${r}" contains brand keyword "${l}" — likely impersonation`,
            severity: "high"
          });
          break;
        }
    }
    for (const [l, m] of Object.entries(I))
      if (m.test(n) && !f.has(r)) {
        e += 55, i.push({
          id: "TYPOSQUATTING",
          description: `Domain appears to be a typosquat of "${l}" using character substitution`,
          severity: "high"
        });
        break;
      }
    const y = "." + c[c.length - 1].toLowerCase();
    E.has(y) && (e += 25, i.push({ id: "SUSPICIOUS_TLD", description: `TLD "${y}" is frequently abused in scam campaigns`, severity: "medium" }));
    const b = ["login", "verify", "update", "secure", "account", "banking", "signin", "confirm", "unlock", "validate"];
    if (!d) {
      for (const l of b)
        if (n.includes(l)) {
          e += 25, i.push({ id: "SUSPICIOUS_KEYWORD", description: `Untrusted hostname contains security-bait keyword: "${l}"`, severity: "high" });
          break;
        }
    }
    const L = (n.match(/-/g) || []).length;
    if (L >= 3 && (e += 20, i.push({ id: "MULTIPLE_HYPHENS", description: `Domain contains ${L} hyphens (phishing indicator)`, severity: "medium" })), !d && c.length >= 3) {
      const l = c.slice(0, -2).join(".");
      for (const m of f)
        if (l.includes(m.replace(".", "-")) || l.includes(m)) {
          e += 65, i.push({
            id: "DECEPTIVE_SUBDOMAIN",
            description: `Trusted brand "${m}" is used in subdomain to disguise malicious domain "${r}"`,
            severity: "high"
          });
          break;
        }
    }
    /[^\x00-\x7F]/.test(n) && (e += 40, i.push({ id: "HOMOGRAPH_SPOOFING", description: "Domain contains non-ASCII characters (homograph attack)", severity: "high" }));
  } catch {
    e += 50, i.push({ id: "MALFORMED_URL", description: "URL structure is invalid or malformed", severity: "high" });
  }
  e = Math.min(e, 100);
  let o = "LOW", a = "SAFE";
  return e >= 75 ? (o = "CRITICAL", a = "MALICIOUS") : e >= 45 ? (o = "HIGH", a = "MALICIOUS") : e >= 20 && (o = "MEDIUM", a = "SUSPICIOUS"), { score: e, reasons: i, riskLevel: o, status: a };
}
let h = "http://localhost:3000";
chrome.storage.local.get(["backendUrl"], (t) => {
  t.backendUrl && (h = t.backendUrl, console.log("[URL SYSTEM SHIELD] Loaded backend URL from storage:", h));
});
const u = /* @__PURE__ */ new Map();
chrome.runtime.onMessage.addListener((t, e, i) => {
  var o;
  if (t.action === "getCachedResult") {
    const a = t.url.split("#")[0];
    return i(u.get(a) || null), !0;
  }
  if (t.action === "scanUrl") {
    const a = (o = e.tab) == null ? void 0 : o.id;
    return g(t.url, a).then(i).catch((s) => i({ error: !0, message: s.message })), !0;
  }
  if (t.action === "checkServer")
    return O().then(i).catch(() => i({ online: !1 })), !0;
  if (t.action === "captureScreenshot")
    return chrome.tabs.captureVisibleTab(void 0, { format: "png" }, (a) => {
      chrome.runtime.lastError ? i({ error: !0, message: chrome.runtime.lastError.message }) : i(a ? { success: !0, dataUrl: a } : { error: !0, message: "Failed to capture screenshot." });
    }), !0;
  if (t.action === "analyzeOcrText")
    return A(t.ocrText, t.filename).then(i).catch((a) => i({ error: !0, message: a.message })), !0;
  if (t.action === "registerBackend") {
    const a = t.url;
    return a && (a.startsWith("http://localhost") || a.includes("vercel.app") || a.includes("127.0.0.1")) ? (chrome.storage.local.set({ backendUrl: a }, () => {
      h = a, console.log("[URL SYSTEM SHIELD] Successfully registered backend URL:", a), i({ success: !0, backendUrl: a });
    }), !0) : (i({ success: !1 }), !0);
  }
  if (t.action === "analyzeRegion")
    return R(t.coords).then(i).catch((a) => i({ error: !0, message: a.message })), !0;
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
  function i(a, s) {
    a !== void 0 && chrome.tabs.sendMessage(a, { action: "showScanResult", result: s }).catch(() => {
    });
  }
  const o = t.split("#")[0];
  if (u.has(o)) {
    const a = u.get(o);
    return e !== void 0 && (p(a.status, e), i(e, a)), a;
  }
  try {
    const a = await fetch(`${h}/api/scan-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url: o })
    });
    if (a.ok) {
      const s = await a.json();
      return u.set(o, s), p(s.status, e), i(e, s), s;
    }
    throw new Error("Server returned error status");
  } catch (a) {
    console.warn("[URL SYSTEM SHIELD] Backend offline or fetch error. Falling back to local Heuristics.", a);
    const s = k(o);
    if (!s.isValid) {
      const d = {
        status: "INVALID",
        confidence: 100,
        riskLevel: "LOW",
        reasons: [{ id: "INVALID_URL_FORMAT", description: s.reason || "Invalid format", severity: "high" }],
        threatScore: 0,
        aiExplanation: "Aborted: Local validation failed."
      };
      return i(e, d), d;
    }
    const n = v(o), r = {
      status: n.status,
      confidence: 80,
      // High confidence in heuristics
      riskLevel: n.riskLevel,
      reasons: n.reasons,
      threatScore: n.score,
      aiExplanation: `[LOCAL HEURISTICS] URL SYSTEM server is offline. Local Heuristic Shield is active.

Heuristic scan evaluated this URL score at ${n.score}/100 based on ${n.reasons.length} warning indicators.`
    };
    return u.set(o, r), p(r.status, e), i(e, r), r;
  }
}
async function O() {
  var t;
  try {
    const e = await fetch(`${h}/api/system-status`, { signal: AbortSignal.timeout(2e3) });
    if (e.ok)
      return { online: !0, aiConnected: ((t = (await e.json()).services) == null ? void 0 : t.ai_orchestrator) === "online" };
  } catch {
  }
  return { online: !1, aiConnected: !1 };
}
async function A(t, e) {
  try {
    const i = await fetch(`${h}/api/analyze-image`, {
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
    const o = t.toLowerCase(), a = /urgent|verify|suspend|limited|reset|security|unusual/i.test(o), s = /login|password|signin|credentials|bank|wallet/i.test(o);
    let n = 0;
    const r = [];
    return a && (n += 35, r.push({ id: "URGENCY_MANIPULATION", description: "OCR text contains high-urgency keywords", severity: "medium" })), s && (n += 45, r.push({ id: "CREDENTIAL_HARVESTING", description: "OCR text requests sensitive credentials or login details", severity: "high" })), {
      status: n >= 45 ? "MALICIOUS" : n > 0 ? "SUSPICIOUS" : "SAFE",
      confidence: 75,
      riskLevel: n >= 45 ? "HIGH" : n > 0 ? "MEDIUM" : "LOW",
      reasons: r,
      aiExplanation: `[LOCAL HEURISTICS] URL SYSTEM server is offline. Local Image Heuristics scan completed.

Extracted OCR Text length: ${t.length} characters.
Urgency indicators: ${a ? "YES" : "NO"}
Phishing keywords: ${s ? "YES" : "NO"}

Start URL SYSTEM backend to run Ollama AI reasoning.`
    };
  }
}
function p(t, e) {
  let i = "", o = "#6b7280";
  t === "SAFE" ? (i = "OK", o = "#10b981") : t === "SUSPICIOUS" ? (i = "WARN", o = "#f59e0b") : t === "MALICIOUS" && (i = "RISK", o = "#ef4444"), chrome.action.setBadgeText({ text: i, tabId: e }), chrome.action.setBadgeBackgroundColor({ color: o, tabId: e });
}
async function U(t, e) {
  !e || !e.startsWith("http") || chrome.tabs.sendMessage(t, { action: "ping" }, async (i) => {
    if (chrome.runtime.lastError || !i || i.status !== "pong")
      try {
        await chrome.scripting.executeScript({
          target: { tabId: t },
          files: ["content.js"]
        });
        const o = e.split("#")[0], a = u.get(o);
        a && setTimeout(() => {
          chrome.tabs.sendMessage(t, { action: "showScanResult", result: a }).catch(() => {
          });
        }, 150);
      } catch (o) {
        console.warn(`[URL SYSTEM SHIELD] Content script auto-injection skipped for tab ${t}:`, o);
      }
  });
}
chrome.tabs.onUpdated.addListener((t, e, i) => {
  e.status === "complete" && i.url && i.url.startsWith("http") && U(t, i.url), e.url && (e.url.startsWith("http") ? g(e.url, t).catch((o) => {
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
      U(t.tabId, e.url);
      const i = e.url.split("#")[0], o = u.get(i);
      o ? (p(o.status, t.tabId), notifyTab(t.tabId, o)) : (chrome.action.setBadgeText({ text: "", tabId: t.tabId }), g(e.url, t.tabId).catch(() => {
      }));
    }
  });
});
async function R(t) {
  return new Promise((e, i) => {
    chrome.tabs.captureVisibleTab(void 0, { format: "png" }, async (o) => {
      if (chrome.runtime.lastError) {
        i(new Error(chrome.runtime.lastError.message));
        return;
      }
      try {
        const a = await x(o, t), s = await fetch(`${h}/api/analyze-image`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: a, filename: "region_capture.png" })
        });
        if (s.ok) {
          const n = await s.json();
          e(n);
        } else {
          const n = await s.json().catch(() => ({}));
          throw new Error(n.message || "Failed to analyze region.");
        }
      } catch (a) {
        console.error("[URL SYSTEM SHIELD] Region analysis failed:", a), e({
          status: "SUSPICIOUS",
          confidence: 70,
          riskLevel: "MEDIUM",
          reasons: [{ id: "OFFLINE_REGION_SCAN", description: "Backend server is required to analyze image context.", severity: "medium" }],
          aiExplanation: `[OFFLINE] Could not analyze the selected region because the URL SYSTEM backend is offline.

Please start the server (npm run dev:all) to run local server-side OCR and Ollama AI scanning.`
        });
      }
    });
  });
}
async function x(t, e) {
  const o = await (await fetch(t)).blob(), a = await createImageBitmap(o), s = new OffscreenCanvas(e.width, e.height);
  s.getContext("2d").drawImage(
    a,
    e.x * e.dpr,
    e.y * e.dpr,
    e.width * e.dpr,
    e.height * e.dpr,
    0,
    0,
    e.width,
    e.height
  );
  const r = await s.convertToBlob({ type: "image/png" });
  return new Promise((d, S) => {
    const c = new FileReader();
    c.onloadend = () => d(c.result), c.onerror = S, c.readAsDataURL(r);
  });
}
