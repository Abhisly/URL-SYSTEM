export interface ThreatReason {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

const TRUSTED_APEX_DOMAINS = new Set([
  'google.com', 'gmail.com', 'youtube.com', 'facebook.com', 'instagram.com',
  'twitter.com', 'x.com', 'amazon.com', 'amazon.in', 'amazon.co.uk',
  'microsoft.com', 'live.com', 'outlook.com', 'hotmail.com',
  'apple.com', 'icloud.com', 'paypal.com', 'paypal.me',
  'netflix.com', 'spotify.com', 'twitch.tv', 'discord.com',
  'github.com', 'gitlab.com', 'linkedin.com', 'reddit.com', 'wikipedia.org',
  'openai.com', 'chatgpt.com', 'anthropic.com', 'claude.ai',
  'notion.so', 'vercel.com', 'stripe.com', 'shopify.com',
  'zoom.us', 'slack.com', 'dropbox.com', 'box.com',
  'ebay.com', 'walmart.com', 'target.com', 'bestbuy.com',
  'chase.com', 'bankofamerica.com', 'wellsfargo.com', 'citibank.com',
  'irs.gov', 'gov.uk', 'gov.in'
]);

const BRAND_KEYWORDS = [
  'paypal', 'google', 'gmail', 'apple', 'icloud', 'microsoft', 'outlook',
  'amazon', 'facebook', 'instagram', 'twitter', 'netflix', 'spotify',
  'whatsapp', 'yahoo', 'ebay', 'walmart', 'chase', 'citibank', 'wellsfargo',
  'bankofamerica', 'irs', 'gov', 'fedex', 'dhl', 'ups', 'usps',
  'linkedin', 'dropbox', 'stripe', 'shopify', 'zoom', 'discord'
];

const SCAM_TLDS = new Set([
  '.xyz', '.top', '.info', '.work', '.click', '.gq', '.cf', '.tk',
  '.ml', '.ga', '.buzz', '.cam', '.fit', '.gdn', '.science', '.country',
  '.stream', '.download', '.zip', '.loan', '.date', '.racing', '.win',
  '.bid', '.men', '.review', '.trade', '.party', '.accountant'
]);

const TYPOSQUAT_BRANDS = {
  'paypal': /p[a4][iy]p[a4]l/i,
  'google': /g[o0][o0]g[l1][e3]/i,
  'apple': /[a4]pp[l1][e3]/i,
  'amazon': /[a4]m[a4]z[o0]n/i,
  'microsoft': /m[i1]cr[o0]s[o0]ft/i,
  'netflix': /n[e3]tf[l1][i1]x/i,
  'facebook': /f[a4]c[e3]b[o0][o0]k/i,
  'instagram': /[i1]nst[a4]gr[a4]m/i,
  'twitter': /tw[i1]tt[e3]r/i,
  'linkedin': /l[i1]nk[e3]d[i1]n/i
};

function getApexDomain(hostname: string): string {
  const parts = hostname.split('.');
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
  try {
    const normalized = url.startsWith('http') ? url : `https://${url}`;
    new URL(normalized);
  } catch {
    return { isValid: false, reason: 'URL syntax is malformed or invalid' };
  }
  return { isValid: true };
}

export function analyzeUrlLocal(url: string): { score: number; reasons: ThreatReason[]; riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; status: 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS' } {
  let score = 0;
  const reasons: ThreatReason[] = [];

  try {
    const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    const hostname = parsedUrl.hostname.toLowerCase();
    const apexDomain = getApexDomain(hostname);
    const isTrustedApex = TRUSTED_APEX_DOMAINS.has(apexDomain);

    if (parsedUrl.protocol !== 'https:') {
      score += 20;
      reasons.push({ id: 'HTTP_NO_SECURE', description: 'URL uses insecure HTTP protocol', severity: 'medium' });
    }

    if (url.length > 100) {
      score += 20;
      reasons.push({ id: 'LONG_URL', description: `URL is very long (${url.length} chars) — likely obfuscating destination`, severity: 'medium' });
    } else if (url.length > 75) {
      score += 10;
      reasons.push({ id: 'LONG_URL', description: 'URL is unusually long (potential obfuscation)', severity: 'low' });
    }

    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipPattern.test(hostname)) {
      score += 45;
      reasons.push({ id: 'IP_HOSTNAME', description: 'URL uses raw IP address instead of domain name', severity: 'high' });
    }

    const parts = hostname.split('.');
    if (parts.length >= 5) {
      score += 30;
      reasons.push({ id: 'EXCESSIVE_SUBDOMAINS', description: `Extremely nested subdomains (${parts.length} levels)`, severity: 'high' });
    }

    if (!isTrustedApex) {
      for (const brand of BRAND_KEYWORDS) {
        if (hostname.includes(brand)) {
          score += 50;
          reasons.push({
            id: 'BRAND_IMPERSONATION',
            description: `Non-trusted domain "${apexDomain}" contains brand keyword "${brand}" — likely impersonation`,
            severity: 'high'
          });
          break;
        }
      }
    }

    for (const [brand, pattern] of Object.entries(TYPOSQUAT_BRANDS)) {
      if (pattern.test(hostname) && !TRUSTED_APEX_DOMAINS.has(apexDomain)) {
        score += 55;
        reasons.push({
          id: 'TYPOSQUATTING',
          description: `Domain appears to be a typosquat of "${brand}" using character substitution`,
          severity: 'high'
        });
        break;
      }
    }

    const currentTLD = '.' + parts[parts.length - 1].toLowerCase();
    if (SCAM_TLDS.has(currentTLD)) {
      score += 25;
      reasons.push({ id: 'SUSPICIOUS_TLD', description: `TLD "${currentTLD}" is frequently abused in scam campaigns`, severity: 'medium' });
    }

    const suspiciousKeywords = ['login', 'verify', 'update', 'secure', 'account', 'banking', 'signin', 'confirm', 'unlock', 'validate'];
    if (!isTrustedApex) {
      for (const kw of suspiciousKeywords) {
        if (hostname.includes(kw)) {
          score += 25;
          reasons.push({ id: 'SUSPICIOUS_KEYWORD', description: `Untrusted hostname contains security-bait keyword: "${kw}"`, severity: 'high' });
          break;
        }
      }
    }

    const hyphens = (hostname.match(/-/g) || []).length;
    if (hyphens >= 3) {
      score += 20;
      reasons.push({ id: 'MULTIPLE_HYPHENS', description: `Domain contains ${hyphens} hyphens (phishing indicator)`, severity: 'medium' });
    }

    if (!isTrustedApex && parts.length >= 3) {
      const subdomain = parts.slice(0, -2).join('.');
      for (const trusted of TRUSTED_APEX_DOMAINS) {
        if (subdomain.includes(trusted.replace('.', '-')) || subdomain.includes(trusted)) {
          score += 65;
          reasons.push({
            id: 'DECEPTIVE_SUBDOMAIN',
            description: `Trusted brand "${trusted}" is used in subdomain to disguise malicious domain "${apexDomain}"`,
            severity: 'high'
          });
          break;
        }
      }
    }

    if (/[^\x00-\x7F]/.test(hostname)) {
      score += 40;
      reasons.push({ id: 'HOMOGRAPH_SPOOFING', description: 'Domain contains non-ASCII characters (homograph attack)', severity: 'high' });
    }
  } catch {
    score += 50;
    reasons.push({ id: 'MALFORMED_URL', description: 'URL structure is invalid or malformed', severity: 'high' });
  }

  // Cap at 100
  score = Math.min(score, 100);

  // Derive risk level and status
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  let status: 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS' = 'SAFE';

  if (score >= 75) {
    riskLevel = 'CRITICAL';
    status = 'MALICIOUS';
  } else if (score >= 45) {
    riskLevel = 'HIGH';
    status = 'MALICIOUS';
  } else if (score >= 20) {
    riskLevel = 'MEDIUM';
    status = 'SUSPICIOUS';
  }

  return { score, reasons, riskLevel, status };
}
