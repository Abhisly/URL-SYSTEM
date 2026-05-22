import { RiskLevel, ScanStatus, ThreatReason } from '@projectTypes/index';
import { threatMemoryService } from '@ai/memory/threatMemoryService';

export function calculateRiskLevel(score: number): RiskLevel {
  if (score < 20) return 'LOW';
  if (score < 50) return 'MEDIUM';
  if (score < 80) return 'HIGH';
  return 'CRITICAL';
}

export function determineUrlStatus(score: number): ScanStatus {
  if (score < 30) return 'SAFE';
  if (score < 70) return 'SUSPICIOUS';
  return 'MALICIOUS';
}

export function determineEmailStatus(score: number): ScanStatus {
  if (score < 30) return 'GENUINE';
  if (score < 70) return 'SUSPICIOUS';
  return 'SPOOFED';
}

export function determineImageStatus(score: number): ScanStatus {
  if (score < 30) return 'SAFE';
  if (score < 70) return 'SUSPICIOUS';
  return 'MALICIOUS';
}

/**
 * Dynamically adjusts threat heuristic scores using historical neural cache logs.
 * Provides a high-fidelity intelligence uplink that detects recurring attack vectors.
 */
export function adjustScoreBasedOnMemory(
  baseScore: number,
  target: string,
  type: 'URL' | 'EMAIL' | 'IMAGE',
  existingReasons: ThreatReason[]
): { score: number; reasons: ThreatReason[] } {
  let score = baseScore;
  const reasons = [...existingReasons];

  try {
    const history = threatMemoryService.recallHistory(target);
    if (history.length > 0) {
      // Find critical/malicious past threats
      const maliciousPast = history.filter(
        h => h.threatLevel === 'HIGH RISK' || 
             h.threatLevel === 'CRITICAL' || 
             h.threatLevel === 'MALICIOUS' || 
             h.threatLevel === 'SPOOFED'
      );
      
      if (maliciousPast.length > 0) {
        // Boost score based on number of times it was flagged historically
        const boost = Math.min(maliciousPast.length * 20, 50);
        score += boost;
        
        reasons.push({
          id: 'HISTORICAL_THREAT_RECURRENCE',
          description: `Neural memory match: Target has been flagged as malicious ${maliciousPast.length} time(s) in recent history (Recurrence Score Boost: +${boost})`,
          severity: 'high'
        });
      } else {
        reasons.push({
          id: 'HISTORICAL_SAFE_ENCOUNTER',
          description: `Neural memory match: Target was scanned ${history.length} time(s) previously and flagged as safe.`,
          severity: 'low'
        });
      }
    }
  } catch (err) {
    console.error('[threatScoringService] Failed to query neural memory bank:', err);
  }

  return {
    score: Math.min(score, 100),
    reasons
  };
}
