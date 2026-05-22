import { ThreatReason } from '@projectTypes/index';

export function analyzeEmail(email: string): { score: number; reasons: ThreatReason[] } {
  let score = 0;
  const reasons: ThreatReason[] = [];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    score += 80;
    reasons.push({ id: 'INVALID_FORMAT', description: 'Email format is fundamentally invalid', severity: 'high' });
    return { score, reasons };
  }

  const [localPart, domain] = email.split('@');

  // Check Disposable Domains
  const disposableDomains = [
    'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'yopmail.com',
    'dispostable.com', 'getairmail.com', 'trashmail.com', 'temp-mail.org', 'throwawaymail.com',
    'tempmailaddress.com', 'maildrop.cc', 'sharklasers.com', 'guerrillamailblock.com',
    'guerrillamail.net', 'guerrillamail.org', 'guerrillamail.biz'
  ];
  if (disposableDomains.includes(domain.toLowerCase())) {
    score += 60;
    reasons.push({ id: 'DISPOSABLE_DOMAIN', description: 'Email uses a known disposable domain service', severity: 'high' });
  }

  // Check Random Characters in Local Part
  const randomRegex = /[0-9]{4,}|[a-zA-Z0-9]{15,}/;
  if (randomRegex.test(localPart)) {
    score += 20;
    reasons.push({ id: 'RANDOM_CHARS', description: 'Local part looks auto-generated or random', severity: 'medium' });
  }

  // Check Spoofed Branding in Local Part
  const brands = ['paypal', 'support', 'apple', 'admin', 'service', 'security'];
  const publicDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  
  if (publicDomains.includes(domain.toLowerCase())) {
    for (const brand of brands) {
      if (localPart.toLowerCase().includes(brand)) {
        score += 50;
        reasons.push({ id: 'BRAND_SPOOFING', description: `Attempted brand spoofing from public domain: ${brand}`, severity: 'high' });
      }
    }
  }

  // Check local part spam keywords
  const spamKeywords = ['prize', 'winner', 'lottery', 'free', 'bonus', 'claim', 'giftcard', 'urgent', 'invoice', 'overdue', 'wire-transfer', 'refund'];
  for (const keyword of spamKeywords) {
    if (localPart.toLowerCase().includes(keyword)) {
      score += 25;
      reasons.push({ id: 'SPAM_KEYWORD', description: `Local part contains suspicious spam/scam keyword: "${keyword}"`, severity: 'medium' });
    }
  }

  return { score: Math.min(score, 100), reasons };
}
