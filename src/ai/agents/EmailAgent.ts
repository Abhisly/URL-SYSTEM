import { processEmailScan } from '@cyber/email-analysis/emailAnalysisService';
import { EmailScanResponse, RiskLevel } from '@projectTypes/index';
import { ThreatReasoningAgent } from './ThreatReasoningAgent';

export class EmailAgent {
  static async analyze(email: string): Promise<EmailScanResponse> {
    console.log(`[EmailAgent] Initiating analysis for: ${email}`);
    
    // 1. Initial Heuristic Scan
    const result = await processEmailScan(email);
    
    // 2. AI Deep Reasoning
    const aiInsights = await ThreatReasoningAgent.reason('EMAIL', email, result.reasons);
    
    // 3. Merge results
    if (aiInsights) {
      if (['SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(aiInsights.threatLevel.toUpperCase())) {
         const mappedRisk = aiInsights.threatLevel.replace(' RISK', '').toUpperCase() as RiskLevel;
         if (['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(mappedRisk)) {
             result.riskLevel = mappedRisk;
         }
      }
      result.confidence = Math.round((aiInsights.confidenceScore * 0.7) + (result.confidence * 0.3));
      result.aiExplanation = aiInsights.aiExplanation;
      result.detectedPatterns = aiInsights.detectedPatterns;

      if (result.riskLevel === 'LOW') result.status = 'GENUINE';
      else if (result.riskLevel === 'MEDIUM') result.status = 'SUSPICIOUS';
      else result.status = 'SPOOFED';
    } else {
      result.aiExplanation = "AI reasoning engine offline. Relied strictly on heuristic models.";
    }
    
    return result;
  }
}
