export type ScanStatus = 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS' | 'GENUINE' | 'SPOOFED' | 'UNKNOWN';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ThreatReason {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface BaseScanResponse {
  status: ScanStatus;
  confidence: number; // 0-100
  riskLevel: RiskLevel;
  reasons: ThreatReason[];
  aiExplanation?: string;
  detectedPatterns?: string[];
}

export interface URLScanResponse extends BaseScanResponse {
  threatScore: number;
}

export type EmailScanResponse = BaseScanResponse;

export interface ImageScanResponse extends BaseScanResponse {
  extractedText?: string;
}

export interface URLScanRequest {
  url: string;
}

export interface EmailScanRequest {
  email: string;
}

// Supabase Database Models
export interface DBUrlScan {
  id: string;
  url: string;
  status: string;
  confidence: number;
  risk_level: string;
  threat_score: number;
  reasons: unknown; // JSON
  created_at: string;
}

export interface DBEmailScan {
  id: string;
  email: string;
  status: string;
  confidence: number;
  risk_level: string;
  reasons: unknown; // JSON
  created_at: string;
}

export interface DBImageScan {
  id: string;
  filename: string;
  ocr_text: string | null;
  status: string;
  confidence: number;
  risk_level: string;
  reasons: unknown; // JSON
  created_at: string;
}

export interface DBThreatReport {
  id: string;
  scan_type: 'URL' | 'EMAIL' | 'IMAGE';
  scan_id: string;
  report_data: unknown; // JSON
  created_at: string;
}
