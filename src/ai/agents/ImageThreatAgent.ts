import { processImageScan } from '@cyber/detection/imageAnalysisService';
import { ImageScanResponse, RiskLevel } from '@projectTypes/index';
import { ThreatReasoningAgent } from './ThreatReasoningAgent';

export class ImageThreatAgent {
  static async analyze(ocrText: string, filename: string): Promise<ImageScanResponse> {
    console.log(`[ImageThreatAgent] Initiating analysis for: ${filename}`);

    // 1. OCR & Heuristic Scan
    const result = await processImageScan(ocrText, filename);

    // 2. Build enriched context — always include filename, add OCR if available
    const enrichedContext = [
      `Image Filename: ${filename}`,
      ocrText.length > 0 ? `Extracted Text (OCR):\n"""\n${ocrText.substring(0, 2000)}\n"""` : 'No text was extracted from this image via OCR.',
    ].join('\n\n');

    // 3. AI Deep Reasoning — always run, even with no OCR text
    const aiInsights = await ThreatReasoningAgent.reason('IMAGE', enrichedContext, result.reasons);

    // 4. Merge results
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

      if (result.riskLevel === 'LOW') result.status = 'SAFE';
      else if (result.riskLevel === 'MEDIUM') result.status = 'SUSPICIOUS';
      else result.status = 'MALICIOUS';
    } else {
      result.aiExplanation = 'AI reasoning engine offline. Relied strictly on OCR heuristics.';
    }

    return result;
  }
}
