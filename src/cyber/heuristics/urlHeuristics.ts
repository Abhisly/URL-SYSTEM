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

    // Advanced Checks:
    
    // 1. Check IDN Homograph Attack (non-ASCII characters in hostname)
    if (/[^\x00-\x7F]/.test(parsedUrl.hostname)) {
      score += 40;
      reasons.push({ id: 'HOMOGRAPH_SPOOFING', description: 'Domain contains internationalized/non-ASCII characters (potential homograph spoofing)', severity: 'high' });
    }

    // 2. Check Suspicious/Scam TLDs
    const scamTLDs = ['.xyz', '.top', '.info', '.work', '.click', '.gq', '.cf', '.tk', '.ml', '.ga', '.buzz', '.cam', '.fit', '.gdn', '.science', '.country', '.stream', '.download', '.zip'];
    const currentTLD = '.' + parts[parts.length - 1].toLowerCase();
    if (scamTLDs.includes(currentTLD)) {
      score += 25;
      reasons.push({ id: 'SUSPICIOUS_TLD', description: `URL uses a top-level domain frequently associated with spam or scams: ${currentTLD}`, severity: 'medium' });
    }

    // 3. Check Obfuscated Credentials in Authority
    if (parsedUrl.username || parsedUrl.password) {
      score += 35;
      reasons.push({ id: 'OBFUSCATED_AUTH', description: 'URL contains obfuscated username/password credentials in authority', severity: 'high' });
    }

    // 4. Check Double Slash Redirection in Path
    const rawPath = url.replace(/^https?:\/\//i, '');
    if (rawPath.includes('//')) {
      score += 30;
      reasons.push({ id: 'DOUBLE_SLASH_REDIRECT', description: 'URL contains double slashes in path (potential redirect obfuscation)', severity: 'high' });
    }

    // 5. Check Non-Standard Ports
    if (parsedUrl.port && !['80', '443', ''].includes(parsedUrl.port)) {
      score += 20;
      reasons.push({ id: 'NON_STANDARD_PORT', description: `URL specifies a non-standard port: :${parsedUrl.port}`, severity: 'medium' });
    }

  } catch {
    score += 50;
    reasons.push({ id: 'MALFORMED_URL', description: 'URL structure is invalid or malformed', severity: 'high' });
  }

  return { score: Math.min(score, 100), reasons };
}
