import { RiskLevel, ScanStatus } from '@projectTypes/index';

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
