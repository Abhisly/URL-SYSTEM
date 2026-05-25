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
]), w = {
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
function E(t) {
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
    const n = new URL(t.startsWith("http") ? t : `https://${t}`), r = n.hostname.toLowerCase(), c = E(r), h = f.has(c);
    n.protocol !== "https:" && (e += 20, i.push({ id: "HTTP_NO_SECURE", description: "URL uses insecure HTTP protocol", severity: "medium" })), t.length > 100 ? (e += 20, i.push({ id: "LONG_URL", description: `URL is very long (${t.length} chars) — likely obfuscating destination`, severity: "medium" })) : t.length > 75 && (e += 10, i.push({ id: "LONG_URL", description: "URL is unusually long (potential obfuscation)", severity: "low" })), /^(\d{1,3}\.){3}\d{1,3}$/.test(r) && (e += 45, i.push({ id: "IP_HOSTNAME", description: "URL uses raw IP address instead of domain name", severity: "high" }));
    const s = r.split(".");
    if (s.length >= 5 && (e += 30, i.push({ id: "EXCESSIVE_SUBDOMAINS", description: `Extremely nested subdomains (${s.length} levels)`, severity: "high" })), !h) {
      for (const l of I)
        if (r.includes(l)) {
          e += 50, i.push({
            id: "BRAND_IMPERSONATION",
            description: `Non-trusted domain "${c}" contains brand keyword "${l}" — likely impersonation`,
            severity: "high"
          });
          break;
        }
    }
    for (const [l, u] of Object.entries(w))
      if (u.test(r) && !f.has(c)) {
        e += 55, i.push({
          id: "TYPOSQUATTING",
          description: `Domain appears to be a typosquat of "${l}" using character substitution`,
          severity: "high"
        });
        break;
      }
    const y = "." + s[s.length - 1].toLowerCase();
    U.has(y) && (e += 25, i.push({ id: "SUSPICIOUS_TLD", description: `TLD "${y}" is frequently abused in scam campaigns`, severity: "medium" }));
    const b = ["login", "verify", "update", "secure", "account", "banking", "signin", "confirm", "unlock", "validate"];
    if (!h) {
      for (const l of b)
        if (r.includes(l)) {
          e += 25, i.push({ id: "SUSPICIOUS_KEYWORD", description: `Untrusted hostname contains security-bait keyword: "${l}"`, severity: "high" });
          break;
        }
    }
    const L = (r.match(/-/g) || []).length;
    if (L >= 3 && (e += 20, i.push({ id: "MULTIPLE_HYPHENS", description: `Domain contains ${L} hyphens (phishing indicator)`, severity: "medium" })), !h && s.length >= 3) {
      const l = s.slice(0, -2).join(".");
      for (const u of f)
        if (l.includes(u.replace(".", "-")) || l.includes(u)) {
          e += 65, i.push({
            id: "DECEPTIVE_SUBDOMAIN",
            description: `Trusted brand "${u}" is used in subdomain to disguise malicious domain "${c}"`,
            severity: "high"
          });
          break;
        }
    }
    /[^\x00-\x7F]/.test(r) && (e += 40, i.push({ id: "HOMOGRAPH_SPOOFING", description: "Domain contains non-ASCII characters (homograph attack)", severity: "high" }));
  } catch {
    e += 50, i.push({ id: "MALFORMED_URL", description: "URL structure is invalid or malformed", severity: "high" });
  }
  e = Math.min(e, 100);
  let o = "LOW", a = "SAFE";
  return e >= 75 ? (o = "CRITICAL", a = "MALICIOUS") : e >= 45 ? (o = "HIGH", a = "MALICIOUS") : e >= 20 && (o = "MEDIUM", a = "SUSPICIOUS"), { score: e, reasons: i, riskLevel: o, status: a };
}
let d = "http://localhost:3000";
chrome.storage.local.get(["backendUrl"], (t) => {
  t.backendUrl && (d = t.backendUrl, console.log("[URL SYSTEM SHIELD] Loaded backend URL from storage:", d));
});
const m = /* @__PURE__ */ new Map();
chrome.runtime.onMessage.addListener((t, e, i) => {
  var o;
  if (t.action === "scanUrl") {
    const a = (o = e.tab) == null ? void 0 : o.id;
    return g(t.url, a).then(i).catch((n) => i({ error: !0, message: n.message })), !0;
  }
  if (t.action === "checkServer")
    return T().then(i).catch(() => i({ online: !1 })), !0;
  if (t.action === "captureScreenshot")
    return chrome.tabs.captureVisibleTab(void 0, { format: "png" }, (a) => {
      chrome.runtime.lastError ? i({ error: !0, message: chrome.runtime.lastError.message }) : i(a ? { success: !0, dataUrl: a } : { error: !0, message: "Failed to capture screenshot." });
    }), !0;
  if (t.action === "analyzeOcrText")
    return O(t.ocrText, t.filename).then(i).catch((a) => i({ error: !0, message: a.message })), !0;
  if (t.action === "registerBackend") {
    const a = t.url;
    return a && (a.startsWith("http://localhost") || a.includes("vercel.app") || a.includes("127.0.0.1")) ? (chrome.storage.local.set({ backendUrl: a }, () => {
      d = a, console.log("[URL SYSTEM SHIELD] Successfully registered backend URL:", a), i({ success: !0, backendUrl: a });
    }), !0) : (i({ success: !1 }), !0);
  }
  if (t.action === "analyzeRegion")
    return A(t.coords).then(i).catch((a) => i({ error: !0, message: a.message })), !0;
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
  if (m.has(i)) {
    const o = m.get(i);
    return e !== void 0 && p(o.status, e), o;
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
      return m.set(i, a), p(a.status, e), a;
    }
    throw new Error("Server returned error status");
  } catch (o) {
    console.warn("[URL SYSTEM SHIELD] Backend offline or fetch error. Falling back to local Heuristics.", o);
    const a = k(i);
    if (!a.isValid)
      return {
        status: "INVALID",
        confidence: 100,
        riskLevel: "LOW",
        reasons: [{ id: "INVALID_URL_FORMAT", description: a.reason || "Invalid format", severity: "high" }],
        threatScore: 0,
        aiExplanation: "Aborted: Local validation failed."
      };
    const n = v(i), r = {
      status: n.status,
      confidence: 80,
      // High confidence in heuristics
      riskLevel: n.riskLevel,
      reasons: n.reasons,
      threatScore: n.score,
      aiExplanation: `[LOCAL HEURISTICS] URL SYSTEM server is offline. Local Heuristic Shield is active.

Heuristic scan evaluated this URL score at ${n.score}/100 based on ${n.reasons.length} warning indicators.`
    };
    return m.set(i, r), p(r.status, e), r;
  }
}
async function T() {
  var t;
  try {
    const e = await fetch(`${d}/api/system-status`, { signal: AbortSignal.timeout(2e3) });
    if (e.ok)
      return { online: !0, aiConnected: ((t = (await e.json()).services) == null ? void 0 : t.ai_orchestrator) === "online" };
  } catch {
  }
  return { online: !1, aiConnected: !1 };
}
async function O(t, e) {
  try {
    const i = await fetch(`${d}/api/analyze-image`, {
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
    const o = t.toLowerCase(), a = /urgent|verify|suspend|limited|reset|security|unusual/i.test(o), n = /login|password|signin|credentials|bank|wallet/i.test(o);
    let r = 0;
    const c = [];
    return a && (r += 35, c.push({ id: "URGENCY_MANIPULATION", description: "OCR text contains high-urgency keywords", severity: "medium" })), n && (r += 45, c.push({ id: "CREDENTIAL_HARVESTING", description: "OCR text requests sensitive credentials or login details", severity: "high" })), {
      status: r >= 45 ? "MALICIOUS" : r > 0 ? "SUSPICIOUS" : "SAFE",
      confidence: 75,
      riskLevel: r >= 45 ? "HIGH" : r > 0 ? "MEDIUM" : "LOW",
      reasons: c,
      aiExplanation: `[LOCAL HEURISTICS] URL SYSTEM server is offline. Local Image Heuristics scan completed.

Extracted OCR Text length: ${t.length} characters.
Urgency indicators: ${a ? "YES" : "NO"}
Phishing keywords: ${n ? "YES" : "NO"}

Start URL SYSTEM backend to run Ollama AI reasoning.`
    };
  }
}
function p(t, e) {
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
      const i = e.url.split("#")[0], o = m.get(i);
      o ? p(o.status, t.tabId) : (chrome.action.setBadgeText({ text: "", tabId: t.tabId }), g(e.url, t.tabId).catch(() => {
      }));
    }
  });
});
async function A(t) {
  return new Promise((e, i) => {
    chrome.tabs.captureVisibleTab(void 0, { format: "png" }, async (o) => {
      if (chrome.runtime.lastError) {
        i(new Error(chrome.runtime.lastError.message));
        return;
      }
      try {
        const a = await x(o, t), n = await fetch(`${d}/api/analyze-image`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: a, filename: "region_capture.png" })
        });
        if (n.ok) {
          const r = await n.json();
          e(r);
        } else {
          const r = await n.json().catch(() => ({}));
          throw new Error(r.message || "Failed to analyze region.");
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
  const o = await (await fetch(t)).blob(), a = await createImageBitmap(o), n = new OffscreenCanvas(e.width, e.height);
  n.getContext("2d").drawImage(
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
  const c = await n.convertToBlob({ type: "image/png" });
  return new Promise((h, S) => {
    const s = new FileReader();
    s.onloadend = () => h(s.result), s.onerror = S, s.readAsDataURL(c);
  });
}
