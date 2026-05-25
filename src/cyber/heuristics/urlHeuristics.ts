import { ThreatReason } from '@projectTypes/index';

// Trusted brand domains — if a URL *contains* one of these brand names but the
// APEX domain is NOT in the trusted list, it's impersonation.
const TRUSTED_APEX_DOMAINS = new Set([
  'google.com', 'gmail.com', 'youtube.com', 'facebook.com', 'instagram.com',
  'twitter.com', 'x.com', 'amazon.com', 'amazon.in', 'amazon.co.uk',
  'microsoft.com', 'live.com', 'outlook.com', 'hotmail.com',
  'apple.com', 'icloud.com',
  'paypal.com', 'paypal.me',
  'netflix.com', 'spotify.com', 'twitch.tv', 'discord.com',
  'github.com', 'gitlab.com',
  'linkedin.com', 'reddit.com', 'wikipedia.org',
  'openai.com', 'chatgpt.com', 'anthropic.com', 'claude.ai',
  'notion.so', 'vercel.com', 'stripe.com', 'shopify.com',
  'zoom.us', 'slack.com', 'dropbox.com', 'box.com',
  'ebay.com', 'walmart.com', 'target.com', 'bestbuy.com',
  'chase.com', 'bankofamerica.com', 'wellsfargo.com', 'citibank.com',
  'irs.gov', 'gov.uk', 'gov.in',
]);

// Brand keywords — presence in hostname of a NON-TRUSTED domain is suspicious
const BRAND_KEYWORDS = [
  'paypal', 'google', 'gmail', 'apple', 'icloud', 'microsoft', 'outlook',
  'amazon', 'facebook', 'instagram', 'twitter', 'netflix', 'spotify',
  'whatsapp', 'yahoo', 'ebay', 'walmart', 'chase', 'citibank', 'wellsfargo',
  'bankofamerica', 'irs', 'gov', 'fedex', 'dhl', 'ups', 'usps', 'dhl',
  'linkedin', 'dropbox', 'stripe', 'shopify', 'zoom', 'discord',
];

const SCAM_TLDS = new Set([
  '.xyz', '.top', '.info', '.work', '.click', '.gq', '.cf', '.tk',
  '.ml', '.ga', '.buzz', '.cam', '.fit', '.gdn', '.science', '.country',
  '.stream', '.download', '.zip', '.loan', '.date', '.racing', '.win',
  '.bid', '.men', '.review', '.trade', '.party', '.accountant',
]);

// Common typosquatting substitutions: maps char → lookalike chars
// We detect when a brand name is spelled with lookalikes
const TYPOSQUAT_BRANDS: Record<string, RegExp> = {
  'paypal':     /p[a4][iy]p[a4]l/i,
  'google':     /g[o0][o0]g[l1][e3]/i,
  'apple':      /[a4]pp[l1][e3]/i,
  'amazon':     /[a4]m[a4]z[o0]n/i,
  'microsoft':  /m[i1]cr[o0]s[o0]ft/i,
  'netflix':    /n[e3]tf[l1][i1]x/i,
  'facebook':   /f[a4]c[e3]b[o0][o0]k/i,
  'instagram':  /[i1]nst[a4]gr[a4]m/i,
  'twitter':    /tw[i1]tt[e3]r/i,
  'linkedin':   /l[i1]nk[e3]d[i1]n/i,
};

function getApexDomain(hostname: string): string {
  const parts = hostname.split('.');
  // Handle co.uk, com.au, etc.
  const twoPartSuffix = ['co.uk', 'com.au', 'co.in', 'co.jp', 'com.br'];
  const suffix = parts.slice(-2).join('.');
  if (twoPartSuffix.includes(suffix) && parts.length > 2) {
    return parts.slice(-3).join('.');
  }
  return parts.slice(-2).join('.');
}

export function validateUrlFormat(url: string): { isValid: boolean; reason?: string } {
  if (!url || url.trim() === '') {
    return { isValid: false, reason: 'URL input is empty' };
  }
  if (url.includes(' ')) {
    return { isValid: false, reason: 'URL contains spaces' };
  }
  
  let parsedUrl: URL;
  try {
    const normalized = url.startsWith('http') ? url : `https://${url}`;
    parsedUrl = new URL(normalized);
  } catch {
    return { isValid: false, reason: 'URL syntax is malformed or invalid' };
  }

  const hostname = parsedUrl.hostname;
  if (!hostname) {
    return { isValid: false, reason: 'URL is missing a valid hostname' };
  }

  if (!hostname.includes('.')) {
    return { isValid: false, reason: 'Domain lacks a top-level extension (e.g. .com, .org)' };
  }

  const parts = hostname.split('.');
  const tld = parts[parts.length - 1];
  if (!/^[a-zA-Z0-9-]{2,}$/.test(tld)) {
    return { isValid: false, reason: `Invalid top-level domain extension ".${tld}"` };
  }

  return { isValid: true };
}

export function analyzeUrl(url: string): { score: number; reasons: ThreatReason[] } {
  let score = 0;
  const reasons: ThreatReason[] = [];

  try {
    const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    const hostname = parsedUrl.hostname.toLowerCase();
    const apexDomain = getApexDomain(hostname);
    const isTrustedApex = TRUSTED_APEX_DOMAINS.has(apexDomain);

    // ── 1. HTTP (insecure) ──
    if (parsedUrl.protocol !== 'https:') {
      score += 20;
      reasons.push({ id: 'HTTP_NO_SECURE', description: 'URL uses insecure HTTP protocol', severity: 'medium' });
    }

    // ── 2. URL Length ──
    if (url.length > 100) {
      score += 20;
      reasons.push({ id: 'LONG_URL', description: `URL is very long (${url.length} chars) — likely obfuscating destination`, severity: 'medium' });
    } else if (url.length > 75) {
      score += 10;
      reasons.push({ id: 'LONG_URL', description: 'URL is unusually long (potential obfuscation)', severity: 'low' });
    }

    // ── 3. IP Address as Hostname ──
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipPattern.test(hostname)) {
      score += 45;
      reasons.push({ id: 'IP_HOSTNAME', description: 'URL uses raw IP address instead of domain name — strongly associated with phishing', severity: 'high' });
    }

    // ── 4. Excessive Subdomains (brand-abuse via deep nesting) ──
    const parts = hostname.split('.');
    if (parts.length >= 5) {
      score += 30;
      reasons.push({ id: 'EXCESSIVE_SUBDOMAINS', description: `Extremely nested subdomains (${parts.length} levels) — common in phishing infrastructure`, severity: 'high' });
    } else if (parts.length === 4 && !hostname.includes('co.uk') && !hostname.includes('co.in')) {
      score += 15;
      reasons.push({ id: 'EXCESSIVE_SUBDOMAINS', description: 'Unusually high number of subdomains detected', severity: 'medium' });
    }

    // ── 5. Brand Impersonation in Non-Trusted Domain ──
    if (!isTrustedApex) {
      for (const brand of BRAND_KEYWORDS) {
        if (hostname.includes(brand)) {
          score += 50;
          reasons.push({
            id: 'BRAND_IMPERSONATION',
            description: `Non-trusted domain "${apexDomain}" contains brand keyword "${brand}" — likely impersonation`,
            severity: 'high'
          });
          break; // one flag is enough per URL
        }
      }
    }

    // ── 6. Typosquatting Detection ──
    for (const [brand, pattern] of Object.entries(TYPOSQUAT_BRANDS)) {
      if (pattern.test(hostname) && !TRUSTED_APEX_DOMAINS.has(apexDomain)) {
        score += 55;
        reasons.push({
          id: 'TYPOSQUATTING',
          description: `Domain appears to be a typosquat of "${brand}" using character substitution (e.g. 0→o, 1→l)`,
          severity: 'high'
        });
        break;
      }
    }

    // ── 7. Suspicious / Scam TLDs ──
    const currentTLD = '.' + parts[parts.length - 1].toLowerCase();
    if (SCAM_TLDS.has(currentTLD)) {
      score += 25;
      reasons.push({ id: 'SUSPICIOUS_TLD', description: `TLD "${currentTLD}" is frequently abused in spam and phishing campaigns`, severity: 'medium' });
    }

    // ── 8. Suspicious Keywords in Hostname (non-trusted domains only) ──
    const suspiciousKeywords = ['login', 'verify', 'update', 'secure', 'account', 'banking', 'signin', 'confirm', 'unlock', 'validate'];
    if (!isTrustedApex) {
      for (const kw of suspiciousKeywords) {
        if (hostname.includes(kw)) {
          score += 25;
          reasons.push({ id: 'SUSPICIOUS_KEYWORD', description: `Untrusted hostname contains security-bait keyword: "${kw}"`, severity: 'high' });
          break; // only flag once per URL to avoid score explosion
        }
      }
    }

    // ── 9. Multiple Hyphens in Domain ──
    const hyphens = (hostname.match(/-/g) || []).length;
    if (hyphens >= 3) {
      score += 20;
      reasons.push({ id: 'MULTIPLE_HYPHENS', description: `Domain contains ${hyphens} hyphens — common in fake phishing domains like "paypal-secure-login.com"`, severity: 'medium' });
    } else if (hyphens === 2 && !isTrustedApex) {
      score += 10;
      reasons.push({ id: 'MULTIPLE_HYPHENS', description: 'Domain contains multiple hyphens on an untrusted domain', severity: 'low' });
    }

    // ── 10. Deceptive Subdomain (brand in subdomain, random apex) ──
    // e.g. paypal.com.evil-login.xyz → apex is evil-login.xyz
    if (!isTrustedApex && parts.length >= 3) {
      const subdomain = parts.slice(0, -2).join('.');
      for (const trusted of TRUSTED_APEX_DOMAINS) {
        // Strip TLD to check: e.g. "paypal.com" → subdomain contains "paypal.com"
        if (subdomain.includes(trusted.replace('.', '-')) || subdomain.includes(trusted)) {
          score += 65;
          reasons.push({
            id: 'DECEPTIVE_SUBDOMAIN',
            description: `Trusted brand "${trusted}" is used in subdomain to disguise a malicious apex domain "${apexDomain}"`,
            severity: 'high'
          });
          break;
        }
      }
    }

    // ── 11. IDN Homograph Attack ──
    if (/[^\x00-\x7F]/.test(hostname)) {
      score += 40;
      reasons.push({ id: 'HOMOGRAPH_SPOOFING', description: 'Domain contains non-ASCII/internationalized characters — classic homograph phishing attack', severity: 'high' });
    }

    // ── 12. Credentials in URL Authority ──
    if (parsedUrl.username || parsedUrl.password) {
      score += 40;
      reasons.push({ id: 'OBFUSCATED_AUTH', description: 'URL embeds username/password credentials — used to deceive users about destination', severity: 'high' });
    }

    // ── 13. Double Slash Redirect in Path ──
    const rawPath = url.replace(/^https?:\/\//i, '');
    if (rawPath.includes('//')) {
      score += 30;
      reasons.push({ id: 'DOUBLE_SLASH_REDIRECT', description: 'URL contains double slashes in path — used to obfuscate redirect destination', severity: 'high' });
    }

    // ── 14. Non-Standard Port ──
    if (parsedUrl.port && !['80', '443', ''].includes(parsedUrl.port)) {
      score += 25;
      reasons.push({ id: 'NON_STANDARD_PORT', description: `URL uses non-standard port :${parsedUrl.port} — not typical for legitimate websites`, severity: 'medium' });
    }

    // ── 15. Suspicious Path Keywords ──
    const pathKeywords = ['/wp-admin', '/phpmyadmin', '/admin', '/login', '/verify', '/update-account', '/confirm-payment'];
    for (const pk of pathKeywords) {
      if (parsedUrl.pathname.toLowerCase().includes(pk) && !isTrustedApex) {
        score += 15;
        reasons.push({ id: 'SUSPICIOUS_PATH', description: `Path contains suspicious segment "${pk}" on an untrusted domain`, severity: 'low' });
        break;
      }
    }

    // ── 16. Free Hosting / Shortener Detection ──
    const freeHosting = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly', 'is.gd', 'buff.ly', 'adf.ly',
      'sites.google.com', 'weebly.com', 'wixsite.com', 'blogspot.com', 'wordpress.com', 'netlify.app',
      'web.app', 'firebaseapp.com', 'pages.dev'];
    if (freeHosting.some(h => hostname.endsWith(h))) {
      score += 20;
      reasons.push({ id: 'FREE_HOSTING', description: `URL is hosted on a free/shortening platform (${apexDomain}) — often used to disguise phishing pages`, severity: 'medium' });
    }

  } catch {
    score += 50;
    reasons.push({ id: 'MALFORMED_URL', description: 'URL structure is invalid or malformed — cannot be parsed safely', severity: 'high' });
  }

  return { score: Math.min(score, 100), reasons };
}
