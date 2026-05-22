import { analyzeUrl } from '@cyber/heuristics/urlHeuristics';
import { calculateRiskLevel, determineUrlStatus, adjustScoreBasedOnMemory } from '@cyber/scoring/threatScoringService';
import { supabase } from '@backend/database/supabase';
import { URLScanResponse } from '@projectTypes/index';

export async function processUrlScan(url: string): Promise<URLScanResponse> {
  const heuristicResult = analyzeUrl(url);
  
  // Dynamic threat score adjustment based on neural memory cache
  const { score, reasons } = adjustScoreBasedOnMemory(
    heuristicResult.score,
    url,
    'URL',
    heuristicResult.reasons
  );
  
  const riskLevel = calculateRiskLevel(score);
  const status = determineUrlStatus(score);
  const confidence = 100 - (score * 0.2); // Basic confidence calculation

  const response: URLScanResponse = {
    status,
    confidence: Math.round(confidence),
    riskLevel,
    reasons,
    threatScore: score
  };

  // Log to Supabase asynchronously
  supabase.from('url_scans').insert([{
    url,
    status,
    confidence: Math.round(confidence),
    risk_level: riskLevel,
    threat_score: score,
    reasons
  }]).then(({ error }) => {
    if (error) console.error('Failed to log URL scan:', error);
  });

  return response;
}
