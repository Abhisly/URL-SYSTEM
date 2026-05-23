import { ThreatReason } from '@projectTypes/index';

// Trusted email domains — official/established providers
const TRUSTED_EMAIL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com',
  'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
  'yahoo.com', 'yahoo.co.uk', 'yahoo.in', 'ymail.com',
  'icloud.com', 'me.com', 'mac.com',
  'protonmail.com', 'proton.me', 'pm.me',
  'tutanota.com', 'fastmail.com', 'zoho.com',
  // Official corporate senders
  'paypal.com', 'amazon.com', 'amazon.in', 'amazon.co.uk',
  'apple.com', 'microsoft.com', 'google.com',
  'netflix.com', 'spotify.com', 'dropbox.com',
  'linkedin.com', 'twitter.com', 'facebook.com',
  'stripe.com', 'shopify.com', 'github.com',
  // Govt
  'irs.gov', 'gov.uk', 'gov.in',
]);

// Known disposable / temporary email providers
const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
  'yopmail.com', 'dispostable.com', 'getairmail.com', 'trashmail.com',
  'temp-mail.org', 'throwawaymail.com', 'tempmailaddress.com', 'maildrop.cc',
  'sharklasers.com', 'guerrillamailblock.com', 'guerrillamail.net',
  'guerrillamail.org', 'guerrillamail.biz', 'fakeinbox.com', 'spam4.me',
  'mailnull.com', 'spamgourmet.com', 'trashmail.me', 'discard.email',
  'mintemail.com', 'owlpic.com', 'armyspy.com', 'cuvox.de', 'dayrep.com',
  'einrot.com', 'fleckens.hu', 'gustr.com', 'jourrapide.com',
  'rhyta.com', 'superrito.com', 'teleworm.us',
]);

// Brand keywords that should NEVER come from a public/free email domain
const BRAND_KEYWORDS = [
  'paypal', 'apple', 'amazon', 'microsoft', 'google', 'netflix', 'spotify',
  'facebook', 'instagram', 'twitter', 'linkedin', 'dropbox', 'stripe',
  'shopify', 'ebay', 'walmart', 'chase', 'wellsfargo', 'bankofamerica',
  'citibank', 'irs', 'fedex', 'dhl', 'ups', 'usps', 'admin', 'support',
  'security', 'service', 'noreply', 'no-reply', 'helpdesk', 'billing',
];

// Public free email domains (brand keywords from here = spoofing)
const PUBLIC_FREE_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.uk', 'yahoo.in',
  'hotmail.com', 'outlook.com', 'live.com', 'msn.com',
  'icloud.com', 'me.com', 'protonmail.com', 'proton.me',
]);

// Suspicious TLDs for email domains
const SUSPICIOUS_EMAIL_TLDS = new Set([
  '.xyz', '.top', '.click', '.gq', '.cf', '.tk', '.ml', '.ga', '.buzz',
  '.cam', '.fit', '.science', '.download', '.zip', '.loan', '.date',
  '.racing', '.win', '.bid', '.men', '.review', '.trade', '.party',
]);

// Detects random-looking strings (UUID-style, long numeric runs)
function isRandomLocalPart(local: string): boolean {
  // Long string of hex chars
  if (/^[a-f0-9]{20,}$/.test(local)) return true;
  // UUID pattern
  if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(local)) return true;
  // 5+ consecutive digits
  if (/\d{5,}/.test(local)) return true;
  // 15+ character string with no vowels (random consonants)
  if (local.length >= 15 && !/[aeiou]/i.test(local)) return true;
  return false;
}

function getDomainApex(domain: string): string {
  const parts = domain.split('.');
  const twoPartSuffix = ['co.uk', 'com.au', 'co.in', 'co.jp', 'com.br'];
  const suffix = parts.slice(-2).join('.');
  if (twoPartSuffix.includes(suffix) && parts.length > 2) return parts.slice(-3).join('.');
  return parts.slice(-2).join('.');
}

export function analyzeEmail(email: string): { score: number; reasons: ThreatReason[] } {
  let score = 0;
  const reasons: ThreatReason[] = [];

  // ── 1. Basic Format Validation ──
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    score += 80;
    reasons.push({ id: 'INVALID_FORMAT', description: 'Email format is fundamentally invalid (missing @, domain, or TLD)', severity: 'high' });
    return { score, reasons };
  }

  const [localPart, domain] = email.split('@');
  const lowerDomain = domain.toLowerCase();
  const lowerLocal = localPart.toLowerCase();
  const apexDomain = getDomainApex(lowerDomain);
  const tld = '.' + apexDomain.split('.').pop()!;

  // ── 2. Disposable / Temporary Email Provider ──
  if (DISPOSABLE_DOMAINS.has(lowerDomain)) {
    score += 70;
    reasons.push({ id: 'DISPOSABLE_DOMAIN', description: `Domain "${lowerDomain}" is a known disposable/temporary email provider — strongly associated with fraud and bypass attacks`, severity: 'high' });
  }

  // ── 3. Suspicious TLD for Email ──
  if (SUSPICIOUS_EMAIL_TLDS.has(tld)) {
    score += 30;
    reasons.push({ id: 'SUSPICIOUS_TLD', description: `Email domain uses TLD "${tld}" which is frequently abused for spam and phishing`, severity: 'medium' });
  }

  // ── 4. Brand Spoofing from Public/Free Email Domain ──
  // e.g. paypal-support@gmail.com, apple.security@yahoo.com
  if (PUBLIC_FREE_DOMAINS.has(lowerDomain)) {
    for (const brand of BRAND_KEYWORDS) {
      if (lowerLocal.includes(brand)) {
        score += 60;
        reasons.push({
          id: 'BRAND_SPOOFING',
          description: `Email uses a free/public provider (${lowerDomain}) but impersonates brand "${brand}" in the username — a classic phishing vector`,
          severity: 'high'
        });
        break;
      }
    }
  }

  // ── 5. Brand Name in Unknown / Suspicious Domain ──
  // e.g. support@paypal-service.com, noreply@apple-security.net
  if (!TRUSTED_EMAIL_DOMAINS.has(lowerDomain) && !PUBLIC_FREE_DOMAINS.has(lowerDomain)) {
    for (const brand of BRAND_KEYWORDS.filter(b => !['admin', 'support', 'security', 'service', 'noreply', 'no-reply', 'helpdesk', 'billing'].includes(b))) {
      if (lowerDomain.includes(brand) || lowerLocal.includes(brand)) {
        score += 55;
        reasons.push({
          id: 'BRAND_DOMAIN_ABUSE',
          description: `Unrecognized domain "${lowerDomain}" contains brand keyword "${brand}" — likely impersonation of a known company`,
          severity: 'high'
        });
        break;
      }
    }
  }

  // ── 6. Unrecognized / Unknown Email Domain ──
  // If domain is completely unknown (not trusted, not public, not disposable),
  // it's likely a throwaway registration or low-reputation domain.
  if (!TRUSTED_EMAIL_DOMAINS.has(lowerDomain) && !PUBLIC_FREE_DOMAINS.has(lowerDomain) && !DISPOSABLE_DOMAINS.has(lowerDomain)) {
    score += 25;
    reasons.push({
      id: 'UNKNOWN_DOMAIN',
      description: `Domain "${lowerDomain}" is not a recognized email provider or verified corporate domain — treat with caution`,
      severity: 'medium'
    });
  }

  // ── 7. Spam / Scam Keywords in Local Part ──
  const spamKeywords = [
    'prize', 'winner', 'lottery', 'free', 'bonus', 'claim', 'giftcard',
    'urgent', 'invoice', 'overdue', 'wire-transfer', 'refund', 'reward',
    'lucky', 'selected', 'congratulations', 'confirm-payment', 'update-account',
  ];
  for (const keyword of spamKeywords) {
    if (lowerLocal.includes(keyword)) {
      score += 30;
      reasons.push({ id: 'SPAM_KEYWORD', description: `Local part contains spam/scam keyword: "${keyword}"`, severity: 'medium' });
      break; // one flag is enough
    }
  }

  // ── 8. Auto-Generated / Random Local Part ──
  if (isRandomLocalPart(localPart)) {
    score += 25;
    reasons.push({ id: 'RANDOM_LOCAL_PART', description: 'Username appears auto-generated or random (UUID-style, excessive digits, or no vowels) — common in bot-generated fraud accounts', severity: 'medium' });
  }

  // ── 9. Suspicious Domain Formatting ──
  // e.g. paypal.com.services-login.net — domain contains a trusted apex within it
  const domainParts = lowerDomain.split('.');
  if (domainParts.length >= 3) {
    // Check if subdomain contains a trusted brand apex
    const subdomainPortion = domainParts.slice(0, -2).join('.');
    for (const trusted of TRUSTED_EMAIL_DOMAINS) {
      if (subdomainPortion.includes(trusted.split('.')[0]) && !TRUSTED_EMAIL_DOMAINS.has(lowerDomain)) {
        score += 50;
        reasons.push({
          id: 'DECEPTIVE_SUBDOMAIN',
          description: `Domain "${lowerDomain}" uses a trusted brand "${trusted}" as a subdomain to appear legitimate`,
          severity: 'high'
        });
        break;
      }
    }
  }

  // ── 10. Excessive Hyphens in Domain ──
  const hyphens = (lowerDomain.match(/-/g) || []).length;
  if (hyphens >= 2) {
    score += 20;
    reasons.push({ id: 'HYPHENATED_DOMAIN', description: `Email domain contains ${hyphens} hyphens — common in fake/phishing sender domains (e.g., "paypal-security-alerts.com")`, severity: 'medium' });
  }

  return { score: Math.min(score, 100), reasons };
}
