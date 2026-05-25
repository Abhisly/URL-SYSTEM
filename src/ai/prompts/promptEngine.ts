import { ThreatReason } from '@projectTypes/index';

const JSON_FORMAT_INSTRUCTIONS = `
OUTPUT FORMAT REQUIREMENT:
Return ONLY a valid raw JSON object. No markdown, no backticks, no extra text. Exactly this structure:
{
  "threatLevel": "SAFE" | "LOW RISK" | "SUSPICIOUS" | "HIGH RISK" | "CRITICAL",
  "confidenceScore": number between 0 and 100,
  "aiExplanation": "string — see requirements below",
  "detectedPatterns": ["array", "of", "string", "pattern", "labels"]
}`;

export function buildUrlPrompt(enrichedContext: string, heuristicReasons: ThreatReason[], historicalMemory: string = ''): string {
  const heuristicsStr = heuristicReasons.length > 0
    ? `Heuristic threat flags detected (${heuristicReasons.length} total):\n${heuristicReasons.map(r => `- [${r.severity.toUpperCase()}] ${r.description}`).join('\n')}`
    : 'No heuristic flags detected.';

  return `
You are a world-class cybersecurity forensics AI specializing in URL threat analysis, phishing detection, brand impersonation, and live browser scan telemetry evaluation.

Your job is to ACCURATELY classify whether this URL is legitimate, suspicious, or malicious. Analyze the target information obtained from our headless browser simulator.

Target Information (Simulated Browser Scan):
${enrichedContext}

${historicalMemory ? historicalMemory + '\n' : ''}
${heuristicsStr}

FORENSIC ANALYSIS RULES (FOLLOW STRICTLY):
1. If ANY heuristic flag is HIGH or CRITICAL severity, the verdict MUST be at minimum SUSPICIOUS, likely HIGH RISK.
2. If a trusted brand name appears in the URL but the apex domain is NOT the official domain (e.g., "paypal" in "paypal-secure-login.com"), this is BRAND IMPERSONATION → HIGH RISK or CRITICAL.
3. If the URL uses a raw IP address, it is ALMOST ALWAYS malicious.
4. If the URL domain is different from what the page title claims (e.g., URL is "evl-login.net" but title says "PayPal — Secure Login"), this is a PHISHING ATTACK.
5. Legitimate websites like Google, Amazon, PayPal have clean, short, official domains. They do NOT use hyphens, weird TLDs, or subdomains to hide their apex domain.
6. Pay close attention to the Redirect Chain: If the URL redirects from a secure site (HTTPS) to an insecure site (HTTP), or redirects to a completely different domain with suspicious keywords, raise the threat level to HIGH RISK.
7. Check the Security Headers: Legitimate banking, payment, or authentication sites ALWAYS implement security headers like HSTS and X-Frame-Options to prevent clickjacking and session spoofing. If a portal claiming to be a financial or login service lacks HSTS/CSP, treat it as highly SUSPICIOUS or MALICIOUS.
8. Only output "SAFE" if the domain is an established, recognizable legitimate website with NO suspicious structural indicators.

YOUR TASK — write the "aiExplanation" as a forensic 4-6 sentence paragraph doing ALL of:
1. IDENTIFY the apex domain, TLD, and resolved IP — is it hosted on a known public provider or suspicious subnet?
2. EVALUATE browser execution metrics: redirects, SSL connection security, and DOM scripts count.
3. ASSESS all structural anomalies: hyphens, suspicious keywords, TLD reputation, page title vs domain mismatch.
4. Cross-check the heuristic flags: what do they indicate collectively about the URL's intent?
5. CONCLUDE with a clear, unambiguous security verdict. If dangerous: warn the user NOT to visit and state why. If safe: explain why it's legitimate.

${JSON_FORMAT_INSTRUCTIONS}
`;
}

export function buildEmailPrompt(enrichedContext: string, heuristicReasons: ThreatReason[], historicalMemory: string = ''): string {
  const heuristicsStr = heuristicReasons.length > 0
    ? `Heuristic threat flags detected (${heuristicReasons.length} total):\n${heuristicReasons.map(r => `- [${r.severity.toUpperCase()}] ${r.description}`).join('\n')}`
    : 'No heuristic flags detected.';

  return `
You are a world-class cybersecurity forensics AI specializing in email threat analysis, phishing detection, and sender authenticity verification.

Your job is to ACCURATELY classify whether this email address is legitimate or a fraud/phishing/spoofed sender. You must NOT default to "safe" — be honest, skeptical, and precise.

Target Email Information:
${enrichedContext}

${historicalMemory ? historicalMemory + '\n' : ''}
${heuristicsStr}

FORENSIC ANALYSIS RULES (FOLLOW STRICTLY):
1. If the email domain is a known disposable provider (tempmail, mailinator, guerrillamail, yopmail, etc.) → HIGH RISK or CRITICAL.
2. If a brand name (paypal, apple, amazon, microsoft, google, etc.) appears in the username of a FREE email service (gmail.com, yahoo.com, hotmail.com, etc.) → BRAND SPOOFING → HIGH RISK.
3. If the domain is unrecognized and not a verified corporate domain → at minimum SUSPICIOUS.
4. If a brand name appears in the domain of an unofficial website (e.g., "paypal-service.com", "amazon-helpdesk.net") → IMPERSONATION → HIGH RISK.
5. If the username looks auto-generated (random hex, long numbers, no vowels) → SUSPICIOUS or HIGH RISK.
6. Official companies like PayPal, Apple, Amazon, Microsoft send emails from THEIR OWN official domains ONLY (e.g., @paypal.com, @apple.com) — NEVER from Gmail, Yahoo, or random domains.
7. Only output "SAFE" if the domain is a well-known, trusted provider AND no spoofing signals are present.

YOUR TASK — write the "aiExplanation" as a forensic 4-6 sentence paragraph doing ALL of:
1. IDENTIFY the email domain — Is it an official corporate sender, a trusted public provider, a disposable service, or an unknown/suspicious domain?
2. ASSESS the full email address: Does the username pattern match the claimed brand? Are there spoofing signals?
3. Cross-check the heuristic flags: what do they collectively indicate about the sender's authenticity?
4. CONCLUDE with a clear, unambiguous verdict. If fraudulent: explicitly state this is a fake/phishing sender and warn the user. If legitimate: explain why it's trusted.

${JSON_FORMAT_INSTRUCTIONS}
`;
}

export function buildImagePrompt(enrichedContext: string, heuristicReasons: ThreatReason[], historicalMemory: string = ''): string {
  const heuristicsStr = heuristicReasons.length > 0
    ? `Heuristic threat flags detected (${heuristicReasons.length} total):\n${heuristicReasons.map(r => `- [${r.severity.toUpperCase()}] ${r.description}`).join('\n')}`
    : 'No heuristic flags detected.';

  return `
You are a world-class cybersecurity forensics AI specializing in visual phishing detection, screenshot analysis, and brand impersonation in images.

Your job is to ACCURATELY classify whether this image contains a legitimate communication or a phishing/scam/malicious attempt. Do NOT default to "safe" — be forensic, skeptical, and precise.

Target Image Information:
${enrichedContext}

${historicalMemory ? historicalMemory + '\n' : ''}
${heuristicsStr}

FORENSIC ANALYSIS RULES (FOLLOW STRICTLY):
1. If the extracted text contains urgency phrases (account suspended, verify now, final warning, unauthorized access, action required) → HIGH RISK.
2. If the text requests passwords, OTPs, credit card numbers, SSN, or any credentials → CREDENTIAL HARVESTING → HIGH RISK or CRITICAL.
3. If the image impersonates a known brand (PayPal, Apple, Google, Amazon, bank) but contains suspicious URLs or informal language → PHISHING.
4. If URLs visible in the image don't match the claimed brand's official domain → BRAND IMPERSONATION.
5. If the image contains QR codes combined with urgency text → HIGH RISK (QR phishing).
6. Legitimate organizations never ask for credentials, OTPs, or payments via image-based messages.
7. Only output "SAFE" if the content is clearly benign with NO threat indicators.

YOUR TASK — write the "aiExplanation" as a forensic 4-6 sentence paragraph doing ALL of:
1. IDENTIFY what type of content the image contains: login page, payment form, OTP request, alert/warning, email screenshot, bank page, etc. Name the brand being impersonated if recognizable.
2. ASSESS whether the text, layout, and visual cues are consistent with a legitimate brand communication OR show red flags like urgency manipulation, credential harvesting, or mismatched branding.
3. Cross-check the heuristic flags: what patterns were detected and what do they mean for this image's threat level?
4. CONCLUDE with a clear, unambiguous verdict. If this is an email screenshot, explicitly state "GOOD MAIL" (if legitimate) or "BAD MAIL" (if phishing/malicious) in your conclusion.

${JSON_FORMAT_INSTRUCTIONS}
`;
}
