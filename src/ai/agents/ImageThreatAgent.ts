import { processImageScan } from '@cyber/detection/imageAnalysisService';
import { ImageScanResponse } from '@projectTypes/index';
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
      const cleanLevel = aiInsights.threatLevel.toUpperCase();
      let finalScore = 0;
      if (cleanLevel.includes('CRITICAL')) {
        result.riskLevel = 'CRITICAL';
        result.status = 'MALICIOUS';
        finalScore = 95;
      } else if (cleanLevel.includes('HIGH') || cleanLevel.includes('MALICIOUS') || cleanLevel.includes('PHISHING')) {
        result.riskLevel = 'HIGH';
        result.status = 'MALICIOUS';
        finalScore = 85;
      } else if (cleanLevel.includes('SUSPICIOUS') || cleanLevel.includes('MEDIUM')) {
        result.riskLevel = 'MEDIUM';
        result.status = 'SUSPICIOUS';
        finalScore = 55;
      } else {
        result.riskLevel = 'LOW';
        result.status = 'SAFE';
        finalScore = 15;
      }

      result.threatScore = Math.max(finalScore, result.threatScore || 0);
      result.confidence = Math.round((aiInsights.confidenceScore * 0.7) + (result.confidence * 0.3));
      result.aiExplanation = aiInsights.aiExplanation;
      result.detectedPatterns = aiInsights.detectedPatterns;
    } else {
      result.aiExplanation = 'AI reasoning engine offline. Relied strictly on OCR heuristics.';
    }

    return result;
  }
}
