import { processUrlScan } from '@cyber/url-analysis/urlAnalysisService';
import { URLScanResponse, RiskLevel } from '@projectTypes/index';
import { ThreatReasoningAgent } from './ThreatReasoningAgent';

export class URLAgent {
  static async analyze(url: string): Promise<URLScanResponse> {
    console.log(`[URLAgent] Initiating analysis for: ${url}`);
    
    // 1. Initial Heuristic Scan
    const result = await processUrlScan(url);
    
    // 2. AI Deep Reasoning
    const aiInsights = await ThreatReasoningAgent.reason('URL', url, result.reasons);
    
    // 3. Merge results
    if (aiInsights) {
      // Allow AI to override the risk level if confidence is high, but we'll map it to standard types
      if (['SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(aiInsights.threatLevel.toUpperCase())) {
         const mappedRisk = aiInsights.threatLevel.replace(' RISK', '').toUpperCase() as RiskLevel;
         if (['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(mappedRisk)) {
             result.riskLevel = mappedRisk;
         }
      }
      
      // Blend confidence scores (70% AI, 30% Heuristics)
      result.confidence = Math.round((aiInsights.confidenceScore * 0.7) + (result.confidence * 0.3));
      
      // Attach AI insights
      result.aiExplanation = aiInsights.aiExplanation;
      result.detectedPatterns = aiInsights.detectedPatterns;
      
      // Re-evaluate status based on AI risk level
      if (result.riskLevel === 'LOW') result.status = 'SAFE';
      else if (result.riskLevel === 'MEDIUM') result.status = 'SUSPICIOUS';
      else result.status = 'MALICIOUS';
    } else {
      result.aiExplanation = "AI reasoning engine offline. Relied strictly on heuristic models.";
    }
    
    return result;
  }
}
