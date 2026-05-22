import { analyzeImageText } from '@cyber/heuristics/imageHeuristics';
import { calculateRiskLevel, determineImageStatus, adjustScoreBasedOnMemory } from '@cyber/scoring/threatScoringService';
import { supabase } from '@backend/database/supabase';
import { ImageScanResponse } from '@projectTypes/index';
import { extractTextFromImage } from '@ai/ocr/ocrService';

export async function processImageScan(imageBuffer: Buffer, filename: string): Promise<ImageScanResponse> {
  // 1. OCR Extraction
  const text = await extractTextFromImage(imageBuffer);
  
  // 2. Heuristic Analysis
  const heuristicResult = analyzeImageText(text);
  
  // Dynamic threat score adjustment based on neural memory cache
  const { score, reasons } = adjustScoreBasedOnMemory(
    heuristicResult.score,
    text || filename,
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
    extractedText: text.substring(0, 500) // Truncate for response
  };

  // 3. Log to DB
  supabase.from('image_scans').insert([{
    filename,
    ocr_text: text,
    status,
    confidence: Math.round(confidence),
    risk_level: riskLevel,
    reasons
  }]).then(({ error }) => {
    if (error) console.error('Failed to log Image scan:', error);
  });

  return response;
}
