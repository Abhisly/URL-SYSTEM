import { ThreatReason } from '@projectTypes/index';

export function analyzeUrl(url: string): { score: number; reasons: ThreatReason[] } {
  let score = 0;
  const reasons: ThreatReason[] = [];

  try {
    const parsedUrl = new URL(url.startsWith('http') ? url : `http://${url}`);
    
    // Check HTTPS
    if (parsedUrl.protocol !== 'https:') {
      score += 20;
      reasons.push({ id: 'HTTP_NO_SECURE', description: 'URL uses insecure HTTP protocol', severity: 'medium' });
    }

    // Check Length
    if (url.length > 75) {
      score += 15;
      reasons.push({ id: 'LONG_URL', description: 'URL is unusually long (potential obfuscation)', severity: 'low' });
    }

    // Check IP address in hostname
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipPattern.test(parsedUrl.hostname)) {
      score += 40;
      reasons.push({ id: 'IP_HOSTNAME', description: 'URL uses an IP address instead of a domain name', severity: 'high' });
    }

    // Check Subdomains
    const parts = parsedUrl.hostname.split('.');
    if (parts.length > 3 && !parsedUrl.hostname.includes('co.uk')) {
      score += 20;
      reasons.push({ id: 'EXCESSIVE_SUBDOMAINS', description: 'Unusually high number of subdomains', severity: 'medium' });
    }

    // Check Suspicious Keywords
    const suspiciousKeywords = ['login', 'verify', 'update', 'secure', 'account', 'banking', 'paypal', 'apple', 'microsoft'];
    for (const kw of suspiciousKeywords) {
      if (parsedUrl.hostname.includes(kw)) {
        score += 30;
        reasons.push({ id: 'SUSPICIOUS_KEYWORD', description: `Hostname contains suspicious keyword: ${kw}`, severity: 'high' });
      }
    }

    // Check Hyphens
    const hyphens = (parsedUrl.hostname.match(/-/g) || []).length;
    if (hyphens > 2) {
      score += 10;
      reasons.push({ id: 'MULTIPLE_HYPHENS', description: 'Domain contains multiple hyphens', severity: 'low' });
    }

  } catch {
    score += 50;
    reasons.push({ id: 'MALFORMED_URL', description: 'URL structure is invalid or malformed', severity: 'high' });
  }

  return { score: Math.min(score, 100), reasons };
}
