import { processUrlScan } from '@cyber/url-analysis/urlAnalysisService';
import { URLScanResponse, RiskLevel } from '@projectTypes/index';
import { ThreatReasoningAgent } from './ThreatReasoningAgent';
import { fetchSiteMetadata } from '@ai/services/siteMetadataService';

export class URLAgent {
  static async analyze(url: string): Promise<URLScanResponse> {
    console.log(`[URLAgent] Initiating analysis for: ${url}`);

    // 1. Heuristic Scan + Site Metadata fetch (in parallel)
    const [result, metadata] = await Promise.all([
      processUrlScan(url),
      fetchSiteMetadata(url),
    ]);

    console.log(`[URLAgent] Site metadata — title: "${metadata.title}" | desc: "${metadata.description.slice(0, 80)}..."`);

    // 2. AI Deep Reasoning (with real metadata injected into context)
    const enrichedContext = [
      `URL: ${url}`,
      `Page Title: ${metadata.title}`,
      metadata.description ? `Page Description: ${metadata.description}` : '',
    ].filter(Boolean).join('\n');

    const aiInsights = await ThreatReasoningAgent.reason('URL', enrichedContext, result.reasons, metadata);

    // 3. Merge results
    if (aiInsights) {
      if (['SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(aiInsights.threatLevel.toUpperCase())) {
        const mappedRisk = aiInsights.threatLevel.replace(' RISK', '').toUpperCase() as RiskLevel;
        if (['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(mappedRisk)) {
          result.riskLevel = mappedRisk;
        }
      }

      // Blend confidence scores (70% AI, 30% Heuristics)
      result.confidence = Math.round((aiInsights.confidenceScore * 0.7) + (result.confidence * 0.3));

      result.aiExplanation = aiInsights.aiExplanation;
      result.detectedPatterns = aiInsights.detectedPatterns;

      if (result.riskLevel === 'LOW') result.status = 'SAFE';
      else if (result.riskLevel === 'MEDIUM') result.status = 'SUSPICIOUS';
      else result.status = 'MALICIOUS';
    } else {
      result.aiExplanation = 'AI reasoning engine offline. Relied strictly on heuristic models.';
    }

    return result;
  }
}
