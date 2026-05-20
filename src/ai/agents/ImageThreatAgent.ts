import { processImageScan } from '@cyber/detection/imageAnalysisService';
import { ImageScanResponse, RiskLevel } from '@projectTypes/index';
import { ThreatReasoningAgent } from './ThreatReasoningAgent';

export class ImageThreatAgent {
  static async analyze(imageBuffer: Buffer, filename: string): Promise<ImageScanResponse> {
    console.log(`[ImageThreatAgent] Initiating analysis for: ${filename}`);
    
    // 1. Initial OCR & Heuristic Scan
    const result = await processImageScan(imageBuffer, filename);
    
    if (!result.extractedText || result.extractedText.trim().length === 0) {
      result.aiExplanation = "No text extracted from image. AI analysis skipped.";
      return result;
    }

    // 2. AI Deep Reasoning
    const aiInsights = await ThreatReasoningAgent.reason('IMAGE', result.extractedText, result.reasons);
    
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

      if (result.riskLevel === 'LOW') result.status = 'SAFE';
      else if (result.riskLevel === 'MEDIUM') result.status = 'SUSPICIOUS';
      else result.status = 'MALICIOUS';
    } else {
      result.aiExplanation = "AI reasoning engine offline. Relied strictly on OCR heuristics.";
    }
    
    return result;
  }
}
