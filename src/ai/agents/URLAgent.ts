import { processUrlScan } from '@cyber/url-analysis/urlAnalysisService';
import { URLScanResponse, RiskLevel } from '@projectTypes/index';
import { ThreatReasoningAgent } from './ThreatReasoningAgent';
import { runBrowserSimulation } from '@cyber/url-analysis/browserSimulator';
import { validateUrlFormat } from '@cyber/heuristics/urlHeuristics';

/** Maps AI threat level strings → canonical RiskLevel */
function mapThreatLevelToRisk(threatLevel: string): RiskLevel | null {
  const tl = threatLevel.toUpperCase().trim();
  if (tl === 'SAFE' || tl === 'LOW RISK' || tl === 'LOW') return 'LOW';
  if (tl === 'SUSPICIOUS' || tl === 'MEDIUM' || tl === 'MEDIUM RISK') return 'MEDIUM';
  if (tl === 'HIGH RISK' || tl === 'HIGH') return 'HIGH';
  if (tl === 'CRITICAL') return 'CRITICAL';
  return null;
}

export class URLAgent {
  static async analyze(url: string): Promise<URLScanResponse> {
    console.log(`[URLAgent] Initiating analysis for: ${url}`);

    // 1. Syntax & Format Validation
    const validation = validateUrlFormat(url);
    if (!validation.isValid) {
      return {
        status: 'INVALID',
        confidence: 100,
        riskLevel: 'LOW',
        reasons: [{ id: 'INVALID_URL_FORMAT', description: validation.reason || 'URL is syntactically invalid', severity: 'high' }],
        threatScore: 0,
        aiExplanation: `Target scan aborted. The URL format is invalid: ${validation.reason}.`
      };
    }

    // 2. Heuristic Scan + Virtual Browser Simulation (in parallel)
    const [result, browserReport] = await Promise.all([
      processUrlScan(url),
      runBrowserSimulation(url),
    ]);

    result.browserReport = browserReport;

    // 3. Handle DNS Unresolved (Unreachable/Non-existent Domain)
    if (!browserReport.dns.resolved) {
      result.status = 'INVALID';
      result.riskLevel = 'LOW';
      result.threatScore = 0;
      result.confidence = 100;
      result.reasons.push({
        id: 'DNS_RESOLUTION_FAILED',
        description: `Browser DNS lookup failed: ${browserReport.dns.error || 'Host unreachable'}`,
        severity: 'high'
      });
      result.aiExplanation = `Target scan aborted. The browser sandbox could not resolve DNS for domain "${new URL(url.startsWith('http') ? url : `https://${url}`).hostname}". The host domain does not exist, or has no active name servers.`;
      return result;
    }

    // 4. Map browser metadata back to SiteMetadata signature
    const metadata = {
      title: browserReport.dom.title || browserReport.dns.ip || 'Unknown Title',
      description: browserReport.dom.description || '',
      domain: new URL(url.startsWith('http') ? url : `https://${url}`).hostname,
    };

    console.log(`[URLAgent] Virtual browser completed. IP: ${browserReport.dns.ip} | Title: "${metadata.title}"`);

    // 5. AI Deep Reasoning (with detailed virtual browser metrics injected)
    const enrichedContext = [
      `URL: ${url}`,
      `Resolved IP Address: ${browserReport.dns.ip}`,
      `HTTP Status: ${browserReport.http.statusCode} (${browserReport.http.statusText || 'N/A'})`,
      `SSL/TLS Connection Status: ${browserReport.connection.status} (Verified: ${browserReport.connection.sslVerified ? 'YES' : 'NO'}, Protocol: ${browserReport.connection.protocol || 'N/A'})`,
      `Redirect Chain: ${browserReport.http.redirectChain.join(' -> ') || 'None'}`,
      `Page Title: ${metadata.title}`,
      metadata.description ? `Page Description: ${metadata.description}` : '',
      `DOM Elements: ${browserReport.dom.elementCount}`,
      `Scripts: ${browserReport.dom.scriptsDetected}`,
      `Security Headers Checked: HSTS=${browserReport.securityHeaders.hsts ? 'ON' : 'OFF'}, CSP=${browserReport.securityHeaders.csp ? 'ON' : 'OFF'}, X-Frame-Options=${browserReport.securityHeaders.xFrameOptions || 'NONE'}`,
    ].filter(Boolean).join('\n');

    const aiInsights = await ThreatReasoningAgent.reason('URL', enrichedContext, result.reasons, metadata, browserReport);

    // 6. Merge results
    if (aiInsights) {
      const mappedRisk = mapThreatLevelToRisk(aiInsights.threatLevel);

      // AI risk always wins if it's more severe than heuristics
      if (mappedRisk) {
        const riskOrder: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
        const currentIdx = riskOrder.indexOf(result.riskLevel);
        const aiIdx = riskOrder.indexOf(mappedRisk);
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
      result.aiExplanation = 'AI reasoning engine offline. Relied strictly on virtual browser simulation metrics and heuristic models.';
    }

    return result;
  }
}
