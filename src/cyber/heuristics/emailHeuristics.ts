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
  const disposableDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'yopmail.com'];
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

  return { score: Math.min(score, 100), reasons };
}
