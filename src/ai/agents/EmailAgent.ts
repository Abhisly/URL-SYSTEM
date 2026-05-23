import { processEmailScan } from '@cyber/email-analysis/emailAnalysisService';
import { EmailScanResponse, RiskLevel } from '@projectTypes/index';
import { ThreatReasoningAgent } from './ThreatReasoningAgent';

/** Maps AI threat level strings → canonical RiskLevel */
function mapThreatLevelToRisk(threatLevel: string): RiskLevel | null {
  const tl = threatLevel.toUpperCase().trim();
  if (tl === 'SAFE') return 'LOW';
  if (tl === 'LOW RISK' || tl === 'LOW') return 'LOW';
  if (tl === 'SUSPICIOUS' || tl === 'MEDIUM' || tl === 'MEDIUM RISK') return 'MEDIUM';
  if (tl === 'HIGH RISK' || tl === 'HIGH') return 'HIGH';
  if (tl === 'CRITICAL') return 'CRITICAL';
  return null;
}

export class EmailAgent {
  static async analyze(email: string): Promise<EmailScanResponse> {
    console.log(`[EmailAgent] Initiating analysis for: ${email}`);

    // 1. Heuristic Scan
    const result = await processEmailScan(email);

    // 2. Parse email parts for rich context
    const [localPart, domain] = email.includes('@') ? email.split('@') : [email, ''];
    const enrichedContext = [
      `Email Address: ${email}`,
      domain ? `Sender Domain: ${domain}` : '',
      localPart ? `Local Part (username): ${localPart}` : '',
    ].filter(Boolean).join('\n');

    // 3. AI Deep Reasoning with enriched context
    const aiInsights = await ThreatReasoningAgent.reason('EMAIL', enrichedContext, result.reasons);

    // 4. Merge results
    if (aiInsights) {
      const mappedRisk = mapThreatLevelToRisk(aiInsights.threatLevel);

      // AI risk always wins if it's more severe than heuristics
      if (mappedRisk) {
        const riskOrder: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
        const currentIdx = riskOrder.indexOf(result.riskLevel);
        const aiIdx = riskOrder.indexOf(mappedRisk);
        // Take the HIGHER of AI or heuristic risk
        result.riskLevel = riskOrder[Math.max(currentIdx, aiIdx)];
      }

      // Blend confidence: 70% AI weight
      result.confidence = Math.round((aiInsights.confidenceScore * 0.7) + (result.confidence * 0.3));
      result.aiExplanation = aiInsights.aiExplanation;
      result.detectedPatterns = [
        ...(result.detectedPatterns || []),
        ...aiInsights.detectedPatterns.filter(p => !(result.detectedPatterns || []).includes(p))
      ];

      // Derive final status from merged risk
      if (result.riskLevel === 'LOW') result.status = 'GENUINE';
      else if (result.riskLevel === 'MEDIUM') result.status = 'SUSPICIOUS';
      else result.status = 'SPOOFED'; // HIGH or CRITICAL
    } else {
      result.aiExplanation = 'AI reasoning engine offline. Relied strictly on heuristic models.';
    }

    return result;
  }
}
