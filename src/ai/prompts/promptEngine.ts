import { ThreatReason } from '@projectTypes/index';

const JSON_FORMAT_INSTRUCTIONS = `
OUTPUT FORMAT REQUIREMENT:
You must return ONLY a raw JSON object with the following exact structure. Do not output any markdown formatting, no conversational text, and no backticks.
{
  "threatLevel": "SAFE" | "LOW RISK" | "SUSPICIOUS" | "HIGH RISK" | "CRITICAL",
  "confidenceScore": number (0-100),
  "aiExplanation": "A concise, 1-2 sentence explanation of WHY this is a threat or why it is safe.",
  "detectedPatterns": ["pattern 1", "pattern 2"]
}`;

export function buildUrlPrompt(url: string, heuristicReasons: ThreatReason[], historicalMemory: string = ''): string {
  const heuristicsStr = heuristicReasons.length > 0 
    ? `Heuristic flags detected:\n${heuristicReasons.map(r => `- ${r.description}`).join('\n')}` 
    : 'No heuristic flags detected.';

  return `
You are a top-tier cybersecurity AI analyzing a URL for phishing and malware threats.
Target URL: "${url}"

${historicalMemory}

${heuristicsStr}

Analyze the URL structure, domains, subdomains, and the heuristic flags provided.
Determine if this is a phishing attempt, a scam, or a legitimate URL.

${JSON_FORMAT_INSTRUCTIONS}
`;
}

export function buildEmailPrompt(email: string, heuristicReasons: ThreatReason[], historicalMemory: string = ''): string {
  const heuristicsStr = heuristicReasons.length > 0 
    ? `Heuristic flags detected:\n${heuristicReasons.map(r => `- ${r.description}`).join('\n')}` 
    : 'No heuristic flags detected.';

  return `
You are an expert cybersecurity AI analyzing an email address for spoofing and fraud.
Target Email: "${email}"

${historicalMemory}

${heuristicsStr}

Analyze the email for disposable domains, fake branding, spoofed sender names, and the heuristic flags provided.
Determine if this is a genuine email, spam, or a targeted phishing/fraud attempt.

${JSON_FORMAT_INSTRUCTIONS}
`;
}

export function buildImagePrompt(ocrText: string, heuristicReasons: ThreatReason[], historicalMemory: string = ''): string {
  const heuristicsStr = heuristicReasons.length > 0 
    ? `Heuristic flags detected:\n${heuristicReasons.map(r => `- ${r.description}`).join('\n')}` 
    : 'No heuristic flags detected.';

  return `
You are an expert cybersecurity AI analyzing the text extracted from a screenshot (such as an email or login page).
Extracted OCR Text:
"""
${ocrText.substring(0, 2000)}
"""

${historicalMemory}

${heuristicsStr}

Analyze the extracted text for fake login requests, urgent payment scams, credential theft attempts, fake banking alerts, and threatening language.
Determine if the screenshot represents a phishing attack or scam.

${JSON_FORMAT_INSTRUCTIONS}
`;
}
