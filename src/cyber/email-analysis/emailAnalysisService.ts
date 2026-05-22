import { analyzeEmail } from '@cyber/heuristics/emailHeuristics';
import { calculateRiskLevel, determineEmailStatus, adjustScoreBasedOnMemory } from '@cyber/scoring/threatScoringService';
import { supabase } from '@backend/database/supabase';
import { EmailScanResponse } from '@projectTypes/index';

export async function processEmailScan(email: string): Promise<EmailScanResponse> {
  const heuristicResult = analyzeEmail(email);
  
  // Dynamic threat score adjustment based on neural memory cache
  const { score, reasons } = adjustScoreBasedOnMemory(
    heuristicResult.score,
    email,
    'EMAIL',
    heuristicResult.reasons
  );
  
  const riskLevel = calculateRiskLevel(score);
  const status = determineEmailStatus(score);
  const confidence = 100 - (score * 0.2);

  const response: EmailScanResponse = {
    status,
    confidence: Math.round(confidence),
    riskLevel,
    reasons
  };

  supabase.from('email_scans').insert([{
    email,
    status,
    confidence: Math.round(confidence),
    risk_level: riskLevel,
    reasons
  }]).then(({ error }) => {
    if (error) console.error('Failed to log Email scan:', error);
  });

  return response;
}
