import { analyzeImageText } from '@cyber/heuristics/imageHeuristics';
import { calculateRiskLevel, determineImageStatus, adjustScoreBasedOnMemory } from '@cyber/scoring/threatScoringService';
import { supabase } from '@backend/database/supabase';
import { ImageScanResponse } from '@projectTypes/index';

export async function processImageScan(ocrText: string, filename: string): Promise<ImageScanResponse> {
  // 1. Heuristic Analysis
  const heuristicResult = analyzeImageText(ocrText);
  
  // Dynamic threat score adjustment based on neural memory cache
  const { score, reasons } = adjustScoreBasedOnMemory(
    heuristicResult.score,
    ocrText || filename,
    'IMAGE',
    heuristicResult.reasons
  );
  
  const riskLevel = calculateRiskLevel(score);
  const status = determineImageStatus(score);
  const confidence = 100 - (score * 0.2);

  const response: ImageScanResponse = {
    status,
    confidence: Math.round(confidence),
    riskLevel,
    reasons,
    extractedText: ocrText.substring(0, 500), // Truncate for response
    threatScore: score
  };

  // 3. Log to DB
  supabase.from('image_scans').insert([{
    filename,
    ocr_text: ocrText,
    status,
    confidence: Math.round(confidence),
    risk_level: riskLevel,
    reasons
  }]).then(({ error }) => {
    if (error) console.error('Failed to log Image scan:', error);
  });

  return response;
}
