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
    ? `Heuristic flags detected:\n${heuristicReasons.map(r => `- ${r.description}`).join('\n')}`
    : 'No heuristic flags detected.';

  return `
You are a world-class cybersecurity AI and internet intelligence analyst with broad knowledge of websites, companies, and digital services.

Target Information:
${enrichedContext}

${historicalMemory}

${heuristicsStr}

YOUR TASK — write the "aiExplanation" as a rich, 4-6 sentence paragraph doing ALL of:
1. IDENTIFY what this website is in the real world using the page title and description. Say what company or service runs it and what it does for users.
2. ASSESS the URL structure, domain, TLD, and any anomalies detected by heuristics.
3. CONCLUDE with a clear security verdict and practical advice.

${JSON_FORMAT_INSTRUCTIONS}
`;
}

export function buildEmailPrompt(enrichedContext: string, heuristicReasons: ThreatReason[], historicalMemory: string = ''): string {
  const heuristicsStr = heuristicReasons.length > 0
    ? `Heuristic flags detected:\n${heuristicReasons.map(r => `- ${r.description}`).join('\n')}`
    : 'No heuristic flags detected.';

  return `
You are a world-class cybersecurity AI and email intelligence analyst with deep knowledge of email providers, corporate domains, and fraud patterns.

Target Email Information:
${enrichedContext}

${historicalMemory}

${heuristicsStr}

YOUR TASK — write the "aiExplanation" as a rich, 4-6 sentence paragraph doing ALL of:
1. IDENTIFY the email domain — Is this Gmail, Outlook, Yahoo, a corporate domain, a university, a government, a disposable mail service, or a suspicious/unknown provider? Use your world knowledge.
2. ASSESS the full email address: username patterns, domain reputation, any spoofing or impersonation signals.
3. CONCLUDE with a clear verdict — is this a genuine email address, a suspicious one, or likely a phishing/fraud sender?

Example for "support@paypal.com":
"The domain 'paypal.com' belongs to PayPal Holdings Inc., one of the world's most widely used digital payment platforms. The 'support@' prefix is a common pattern for customer service communications from this brand. The domain structure and TLD are consistent with PayPal's official infrastructure. This email address appears genuine, however always verify the full email header before clicking links."

${JSON_FORMAT_INSTRUCTIONS}
`;
}

export function buildImagePrompt(enrichedContext: string, heuristicReasons: ThreatReason[], historicalMemory: string = ''): string {
  const heuristicsStr = heuristicReasons.length > 0
    ? `Heuristic flags detected:\n${heuristicReasons.map(r => `- ${r.description}`).join('\n')}`
    : 'No heuristic flags detected.';

  return `
You are a world-class cybersecurity AI specializing in visual phishing detection, screenshot analysis, and brand impersonation.

Target Image Information:
${enrichedContext}

${historicalMemory}

${heuristicsStr}

YOUR TASK — write the "aiExplanation" as a rich, 4-6 sentence paragraph doing ALL of:
1. IDENTIFY what type of content this image contains: login page, payment form, OTP screen, alert/warning, email screenshot, bank page, etc. Name the brand or service it appears to represent if recognizable.
2. ASSESS whether the visual content and extracted text are consistent with a legitimate brand communication, or show signs of impersonation, urgency manipulation, or credential harvesting.
3. CONCLUDE with a clear verdict — is this a genuine screenshot, a phishing attempt, or a scam — and give practical advice. IMPORTANT: If the image is a screenshot of an email, explicitly include the exact phrase "GOOD MAIL" (if safe/legitimate) or "BAD MAIL" (if malicious/phishing) in your conclusion.

Example for a fake bank login screenshot:
"This image appears to contain a login form impersonating a banking institution, with text fields requesting account credentials. The extracted text contains urgency-triggering language and references to account suspension, which are hallmark tactics of phishing campaigns. The visual layout mimics a legitimate bank interface but contains irregular typography and suspicious redirect links. This image is highly likely to be part of a phishing attack and should not be interacted with."

${JSON_FORMAT_INSTRUCTIONS}
`;
}
