import { processUrlScan } from '@cyber/url-analysis/urlAnalysisService';
import { URLScanResponse, RiskLevel } from '@projectTypes/index';
import { ThreatReasoningAgent } from './ThreatReasoningAgent';
import { fetchSiteMetadata } from '@ai/services/siteMetadataService';

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
      const mappedRisk = mapThreatLevelToRisk(aiInsights.threatLevel);

      // AI risk always wins if it's more severe than heuristics
      if (mappedRisk) {
        const riskOrder: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
        const currentIdx = riskOrder.indexOf(result.riskLevel);
        const aiIdx = riskOrder.indexOf(mappedRisk);
        // Take the HIGHER of AI or heuristic risk
        result.riskLevel = riskOrder[Math.max(currentIdx, aiIdx)];
      }

      // Blend confidence scores (70% AI, 30% Heuristics)
      result.confidence = Math.round((aiInsights.confidenceScore * 0.7) + (result.confidence * 0.3));

      result.aiExplanation = aiInsights.aiExplanation;
      result.detectedPatterns = [
        ...(result.detectedPatterns || []),
        ...aiInsights.detectedPatterns.filter(p => !(result.detectedPatterns || []).includes(p))
      ];

      // Derive final status from merged risk
      if (result.riskLevel === 'LOW') result.status = 'SAFE';
      else if (result.riskLevel === 'MEDIUM') result.status = 'SUSPICIOUS';
      else result.status = 'MALICIOUS'; // HIGH or CRITICAL
    } else {
      result.aiExplanation = 'AI reasoning engine offline. Relied strictly on heuristic models.';
    }

    return result;
  }
}
