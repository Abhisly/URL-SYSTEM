import { ThreatReason } from '@projectTypes/index';

export function analyzeImageText(text: string): { score: number; reasons: ThreatReason[] } {
  let score = 0;
  const reasons: ThreatReason[] = [];
  const lowerText = text.toLowerCase();

  if (!text || text.trim().length === 0) {
    return { score: 0, reasons: [] };
  }

  // Urgent/Threatening Language
  const urgentPhrases = ['immediate action required', 'account suspended', 'verify your account', 'unauthorized access', 'click here to secure', 'final warning'];
  for (const phrase of urgentPhrases) {
    if (lowerText.includes(phrase)) {
      score += 40;
      reasons.push({ id: 'URGENT_LANGUAGE', description: `Found urgent/threatening phrase: "${phrase}"`, severity: 'high' });
    }
  }

  // Financial Scam Indicators
  const financialPhrases = ['invoice attached', 'payment overdue', 'crypto wallet', 'bitcoin', 'wire transfer', 'gift card'];
  for (const phrase of financialPhrases) {
    if (lowerText.includes(phrase)) {
      score += 30;
      reasons.push({ id: 'FINANCIAL_SCAM', description: `Found financial scam indicator: "${phrase}"`, severity: 'medium' });
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
