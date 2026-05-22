import { ThreatReason } from '@projectTypes/index';

export function analyzeImageText(text: string): { score: number; reasons: ThreatReason[] } {
  let score = 0;
  const reasons: ThreatReason[] = [];
  const lowerText = text.toLowerCase();

  if (!text || text.trim().length === 0) {
    return { score: 0, reasons: [] };
  }

  // Urgent/Threatening Language
  const urgentPhrases = [
    'immediate action required', 'account suspended', 'verify your account', 
    'unauthorized access', 'click here to secure', 'final warning',
    'confirm identity', 'security alert', 'security bypass', 'critical update', 
    'action required', 'suspended immediately'
  ];
  for (const phrase of urgentPhrases) {
    if (lowerText.includes(phrase)) {
      score += 40;
      reasons.push({ id: 'URGENT_LANGUAGE', description: `Found urgent/threatening phrase: "${phrase}"`, severity: 'high' });
    }
  }

  // Financial Scam Indicators
  const financialPhrases = [
    'invoice attached', 'payment overdue', 'crypto wallet', 'bitcoin', 
    'wire transfer', 'gift card', 'routing number', 'bank account', 
    'credit card', 'ssn', 'social security', 'pin code', 'otp', 
    'one-time password', 'two-factor', '2fa', 'passcode'
  ];
  for (const phrase of financialPhrases) {
    if (lowerText.includes(phrase)) {
      score += 30;
      reasons.push({ id: 'FINANCIAL_SCAM', description: `Found financial scam indicator: "${phrase}"`, severity: 'medium' });
    }
  }

  // Credential Harvesting Indicators
  const credentialPhrases = ['sign in to', 'log in to', 'reset password', 'enter password', 'login credentials', 'security verification'];
  for (const phrase of credentialPhrases) {
    if (lowerText.includes(phrase)) {
      score += 35;
      reasons.push({ id: 'CREDENTIAL_HARVESTING', description: `Found credential harvesting indicator: "${phrase}"`, severity: 'high' });
    }
  }

  // Suspicious URLs hidden in text
  const urlRegex = /https?:\/\/[^\s]+/g;
  const foundUrls = text.match(urlRegex) || [];
  if (foundUrls.length > 0) {
    // If it mentions a brand but link goes elsewhere
    if (lowerText.includes('paypal') && !foundUrls.some(u => u.includes('paypal.com'))) {
      score += 50;
      reasons.push({ id: 'MISMATCHED_LINK', description: 'Brand mentioned in text but links point to different domain', severity: 'high' });
    }
  }

  return { score: Math.min(score, 100), reasons };
}
