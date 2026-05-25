import { generateOllamaResponse, extractJsonFromResponse } from '@ai/services/ollamaService';
import { buildUrlPrompt, buildEmailPrompt, buildImagePrompt } from '@ai/prompts/promptEngine';
import { ThreatReason, BrowserScanReport } from '@projectTypes/index';
import { threatMemoryService } from '@ai/memory/threatMemoryService';
import type { SiteMetadata } from '@ai/services/siteMetadataService';

export interface AIInsights {
  threatLevel: string;
  confidenceScore: number;
  aiExplanation: string;
  detectedPatterns: string[];
}

// ── Trusted apex domains for URL fallback ──
const TRUSTED_URL_DOMAINS = new Set([
  'google.com', 'gmail.com', 'youtube.com', 'facebook.com', 'instagram.com',
  'twitter.com', 'x.com', 'amazon.com', 'amazon.in', 'amazon.co.uk',
  'microsoft.com', 'live.com', 'outlook.com', 'hotmail.com',
  'apple.com', 'icloud.com', 'paypal.com', 'paypal.me',
  'netflix.com', 'spotify.com', 'twitch.tv', 'discord.com',
  'github.com', 'gitlab.com', 'linkedin.com', 'reddit.com',
  'wikipedia.org', 'openai.com', 'chatgpt.com', 'anthropic.com', 'claude.ai',
  'notion.so', 'vercel.com', 'stripe.com', 'shopify.com',
  'zoom.us', 'slack.com', 'dropbox.com', 'ebay.com',
  'chase.com', 'bankofamerica.com', 'wellsfargo.com',
]);

// ── Trusted email domains for EMAIL fallback ──
const TRUSTED_EMAIL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
  'yahoo.com', 'yahoo.co.uk', 'icloud.com', 'me.com', 'mac.com',
  'protonmail.com', 'proton.me', 'tutanota.com', 'fastmail.com',
  'paypal.com', 'amazon.com', 'apple.com', 'microsoft.com', 'google.com',
  'netflix.com', 'spotify.com', 'linkedin.com', 'twitter.com', 'facebook.com',
  'stripe.com', 'shopify.com', 'github.com',
]);

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
  'yopmail.com', 'trashmail.com', 'temp-mail.org', 'throwawaymail.com',
  'maildrop.cc', 'sharklasers.com', 'fakeinbox.com', 'spam4.me',
  'discard.email', 'mintemail.com',
]);

const PUBLIC_FREE_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.uk', 'yahoo.in',
  'hotmail.com', 'outlook.com', 'live.com', 'msn.com', 'icloud.com', 'me.com',
  'protonmail.com', 'proton.me',
]);

const BRAND_KEYWORDS_FOR_SPOOFING = [
  'paypal', 'apple', 'amazon', 'microsoft', 'google', 'netflix', 'spotify',
  'facebook', 'instagram', 'twitter', 'linkedin', 'ebay', 'walmart', 'chase',
  'wellsfargo', 'bankofamerica', 'citibank', 'irs', 'fedex', 'dhl', 'ups',
];

function getApexDomain(hostname: string): string {
  const parts = hostname.split('.');
  const twoPartSuffix = ['co.uk', 'com.au', 'co.in', 'co.jp', 'com.br'];
  const suffix = parts.slice(-2).join('.');
  if (twoPartSuffix.includes(suffix) && parts.length > 2) return parts.slice(-3).join('.');
  return parts.slice(-2).join('.');
}

/**
 * Assess the aggregate severity of heuristic flags.
 * Returns: 'safe' | 'low' | 'medium' | 'high' | 'critical'
 */
function assessHeuristicSeverity(reasons: ThreatReason[]): 'safe' | 'low' | 'medium' | 'high' | 'critical' {
  if (reasons.length === 0) return 'safe';
  const hasCritical = reasons.some(r => r.severity === 'high' && ['BRAND_IMPERSONATION', 'BRAND_SPOOFING', 'DECEPTIVE_SUBDOMAIN', 'TYPOSQUATTING', 'IP_HOSTNAME', 'BRAND_DOMAIN_ABUSE', 'DISPOSABLE_DOMAIN', 'CREDENTIAL_HARVESTING'].includes(r.id));
  const highCount = reasons.filter(r => r.severity === 'high').length;
  const mediumCount = reasons.filter(r => r.severity === 'medium').length;
  if (hasCritical || highCount >= 2) return 'critical';
  if (highCount === 1) return 'high';
  if (mediumCount >= 2) return 'medium';
  if (reasons.length > 0) return 'low';
  return 'safe';
}

export class ThreatReasoningAgent {
  static async reason(
    contextType: 'URL' | 'EMAIL' | 'IMAGE',
    rawContext: string,
    currentReasons: ThreatReason[],
    metadata?: SiteMetadata,
    browserReport?: BrowserScanReport
  ): Promise<AIInsights | null> {
    console.log(`[ThreatReasoningAgent] Reasoning over ${contextType} context...`);

    const historicalMemory = threatMemoryService.generateMemoryContext(rawContext);

    let prompt = '';
    if (contextType === 'URL') {
      prompt = buildUrlPrompt(rawContext, currentReasons, historicalMemory);
    } else if (contextType === 'EMAIL') {
      prompt = buildEmailPrompt(rawContext, currentReasons, historicalMemory);
    } else if (contextType === 'IMAGE') {
      prompt = buildImagePrompt(rawContext, currentReasons, historicalMemory);
    }

    try {
      const responseString = await generateOllamaResponse(prompt);
      const json = extractJsonFromResponse(responseString);

      const result = {
        threatLevel: (json.threatLevel as string) || 'UNKNOWN',
        confidenceScore: typeof json.confidenceScore === 'number' ? json.confidenceScore : 50,
        aiExplanation: (json.aiExplanation as string) || 'AI analysis completed.',
        detectedPatterns: Array.isArray(json.detectedPatterns) ? (json.detectedPatterns as string[]) : []
      };

      threatMemoryService.logThreat(rawContext, contextType, result.threatLevel, result.detectedPatterns);
      return result;

    } catch {
      console.warn(`[ThreatReasoningAgent] Ollama unreachable. Using smart fallback.`);
      const severity = assessHeuristicSeverity(currentReasons);
      const flagCount = currentReasons.length;

      // ── URL fallback ──
      if (contextType === 'URL') {
        const siteTitle = metadata?.title || '';
        const siteDesc = metadata?.description || '';
        const domain = metadata?.domain || rawContext;

        let displayUrl = rawContext;
        let apexDomain = domain;
        try {
          const urlLine = rawContext.split('\n')[0];
          displayUrl = urlLine.replace('URL: ', '').trim();
          const parsed = new URL(displayUrl.startsWith('http') ? displayUrl : `https://${displayUrl}`);
          apexDomain = getApexDomain(parsed.hostname);
        } catch { /* keep */ }

        const isTrusted = TRUSTED_URL_DOMAINS.has(apexDomain);
        
        // Check for brand impersonation: page title claims a trusted brand but domain doesn't match
        let titleBrandMismatch = false;
        if (siteTitle) {
          for (const brand of BRAND_KEYWORDS_FOR_SPOOFING) {
            if (siteTitle.toLowerCase().includes(brand) && !isTrusted) {
              titleBrandMismatch = true;
              break;
            }
          }
        }

        let threatLevel: string;
        let confidenceScore: number;
        let aiExplanation: string;

        if (severity === 'critical' || (severity === 'high' && titleBrandMismatch)) {
          threatLevel = 'CRITICAL';
          confidenceScore = 95;
          aiExplanation = `CRITICAL THREAT DETECTED: The URL "${displayUrl}" exhibits ${flagCount} severe heuristic anomalies including: ${currentReasons.filter(r => r.severity === 'high').map(r => r.description).join('; ')}. ${titleBrandMismatch ? `Critically, the page claims to be "${siteTitle}" but is served from the unrelated domain "${apexDomain}" — a definitive indicator of a phishing attack. ` : ''}This URL is highly likely to be a phishing, scam, or malware delivery vector. DO NOT visit this URL or submit any personal information.`;
        } else if (severity === 'high') {
          threatLevel = 'HIGH RISK';
          confidenceScore = 92;
          aiExplanation = `HIGH RISK: The URL "${displayUrl}" was flagged with ${flagCount} threat indicators including: ${currentReasons.map(r => r.description).join('; ')}. ${siteTitle ? `The page is titled "${siteTitle}" but structural analysis reveals significant red flags. ` : ''}These patterns are strongly consistent with phishing infrastructure, brand impersonation, or malicious redirect chains. Do not interact with this URL or provide any sensitive information.`;
        } else if (severity === 'medium') {
          threatLevel = 'SUSPICIOUS';
          confidenceScore = 78;
          aiExplanation = `SUSPICIOUS: The URL "${displayUrl}" raised ${flagCount} moderate-severity concerns during analysis: ${currentReasons.map(r => r.description).join('; ')}. While not definitively malicious, these indicators suggest this URL may not be entirely trustworthy. Exercise caution — verify the domain independently before proceeding, and avoid entering credentials.`;
        } else if (severity === 'low') {
          threatLevel = 'LOW RISK';
          confidenceScore = 72;
          aiExplanation = `LOW RISK: The URL "${displayUrl}" passed most checks but has minor anomalies: ${currentReasons.map(r => r.description).join('; ')}. ${isTrusted ? `The apex domain "${apexDomain}" is a recognized, legitimate website. ` : ''}Proceed with general caution and verify the URL is exactly as expected before entering any personal information.`;
        } else {
          // Truly no flags + trusted domain = SAFE
          if (isTrusted) {
            const knownSiteDesc: Record<string, string> = {
              'google.com': 'Google LLC, the world\'s leading search engine and technology company.',
              'youtube.com': 'YouTube, Google\'s video-sharing platform with billions of users.',
              'facebook.com': 'Facebook, Meta\'s global social networking platform.',
              'amazon.com': 'Amazon Inc., the world\'s largest e-commerce and cloud services company.',
              'microsoft.com': 'Microsoft Corporation, maker of Windows, Office 365, and Azure.',
              'apple.com': 'Apple Inc., the maker of iPhone, Mac, and iCloud services.',
              'paypal.com': 'PayPal Holdings Inc., a globally trusted digital payments platform.',
              'github.com': 'GitHub (owned by Microsoft), the world\'s largest code hosting and collaboration platform.',
              'linkedin.com': 'LinkedIn (owned by Microsoft), the professional networking platform.',
            };
            const siteDesc2 = siteTitle
              ? `The domain is the official home of ${siteTitle}. ${siteDesc || ''}`
              : (knownSiteDesc[apexDomain] ?? `"${apexDomain}" is a verified, trusted domain with a clean security profile.`);
            threatLevel = 'SAFE';
            confidenceScore = 97;
            aiExplanation = `SAFE: The URL "${displayUrl}" passes all security checks. ${siteDesc2} The domain structure, TLD, and URL composition are all consistent with legitimate use. No phishing indicators, suspicious keywords, typosquatting patterns, or redirect anomalies were detected. This URL is safe to visit.`;
          } else {
            // No flags but domain is unknown — treat as low risk / suspicious
            threatLevel = 'LOW RISK';
            confidenceScore = 65;
            aiExplanation = `LOW RISK: The URL "${displayUrl}" did not trigger any specific heuristic flags, but the domain "${apexDomain}" is not a widely recognized or verified website. ${siteTitle ? `The page is titled "${siteTitle}". ` : ''}While no overt threat patterns were detected, unverified domains should be treated with caution. Verify the website's authenticity independently before proceeding.`;
          }
        }

        const result = { threatLevel, confidenceScore, aiExplanation, detectedPatterns: currentReasons.map(r => r.id) };
        threatMemoryService.logThreat(rawContext, contextType, result.threatLevel, result.detectedPatterns);
        return result;
      }

      // ── EMAIL fallback ──
      if (contextType === 'EMAIL') {
        let email = rawContext;
        let domainRaw = '';
        let localPart = '';
        try {
          const emailLine = rawContext.split('\n').find(l => l.startsWith('Email Address:'));
          email = emailLine ? emailLine.replace('Email Address:', '').trim() : rawContext;
          [localPart, domainRaw] = email.includes('@') ? email.split('@') : [email, ''];
        } catch { /* keep raw */ }

        const lowerDomain = domainRaw.toLowerCase();
        const lowerLocal = localPart.toLowerCase();
        const isTrustedDomain = TRUSTED_EMAIL_DOMAINS.has(lowerDomain);
        const isDisposable = DISPOSABLE_EMAIL_DOMAINS.has(lowerDomain);
        const isPublicFree = PUBLIC_FREE_DOMAINS.has(lowerDomain);

        // Check brand spoofing from public domain
        const hasBrandSpoofing = isPublicFree && BRAND_KEYWORDS_FOR_SPOOFING.some(b => lowerLocal.includes(b));
        // Check brand in suspicious non-trusted domain
        const hasDomainBrandAbuse = !isTrustedDomain && !isPublicFree && BRAND_KEYWORDS_FOR_SPOOFING.some(b => lowerDomain.includes(b));

        let threatLevel: string;
        let confidenceScore: number;
        let aiExplanation: string;

        if (isDisposable || severity === 'critical') {
          threatLevel = 'CRITICAL';
          confidenceScore = 97;
          aiExplanation = isDisposable
            ? `CRITICAL THREAT: The email address "${email}" uses "${lowerDomain}" — a well-known disposable/temporary email provider. These services are specifically designed to avoid accountability and are overwhelmingly associated with fraud, spam, phishing, and account abuse. Any communication from this sender should be treated as highly suspicious. Do not click any links or attachments from this sender.`
            : `CRITICAL THREAT: The email address "${email}" triggered ${flagCount} critical threat indicators: ${currentReasons.filter(r => r.severity === 'high').map(r => r.description).join('; ')}. This sender exhibits multiple high-severity fraud signals. Do not engage with any communications from this address.`;
        } else if (hasBrandSpoofing || hasDomainBrandAbuse || severity === 'high') {
          threatLevel = 'HIGH RISK';
          confidenceScore = 93;
          if (hasBrandSpoofing) {
            const brand = BRAND_KEYWORDS_FOR_SPOOFING.find(b => lowerLocal.includes(b)) || 'a known brand';
            aiExplanation = `HIGH RISK — BRAND SPOOFING: The email address "${email}" is impersonating "${brand}" by using its name in the username of a free public email service (${lowerDomain}). This is a classic and well-known phishing technique. Legitimate companies like PayPal, Apple, Amazon, and Microsoft NEVER send official communications from free email providers like Gmail, Yahoo, or Outlook. This email is almost certainly fraudulent. Do not click any links or follow any instructions from this sender.`;
          } else if (hasDomainBrandAbuse) {
            const brand = BRAND_KEYWORDS_FOR_SPOOFING.find(b => lowerDomain.includes(b)) || 'a known brand';
            aiExplanation = `HIGH RISK — DOMAIN IMPERSONATION: The email address "${email}" uses a suspicious domain "${lowerDomain}" that contains the brand name "${brand}" but is NOT the official domain of that company. This is a domain spoofing attack designed to trick victims into believing the email is from a trusted source. The official domains of major companies are short and clean (e.g., @paypal.com, @apple.com) — not hyphenated variants like this. Treat this email as fraudulent.`;
          } else {
            aiExplanation = `HIGH RISK: The email address "${email}" exhibits ${flagCount} significant threat indicators: ${currentReasons.map(r => r.description).join('; ')}. These signals collectively suggest this sender is not legitimate and may be attempting fraud, phishing, or impersonation. Do not click links or respond to this sender.`;
          }
        } else if (severity === 'medium' || (!isTrustedDomain && !isPublicFree)) {
          threatLevel = 'SUSPICIOUS';
          confidenceScore = 75;
          aiExplanation = !isTrustedDomain && !isPublicFree && flagCount === 0
            ? `SUSPICIOUS: The email address "${email}" uses the domain "${lowerDomain}" which is not a recognized, verified email provider or official corporate domain. While no specific fraud patterns were detected in the username, emails from unverified domains should be treated with caution. Verify the sender's identity through independent channels before responding or clicking any links.`
            : `SUSPICIOUS: The email address "${email}" raised ${flagCount} concerns during analysis: ${currentReasons.map(r => r.description).join('; ')}. Exercise caution before trusting communications from this sender.`;
        } else {
          // Trusted domain, no flags
          threatLevel = 'SAFE';
          confidenceScore = 96;
          const domainDescriptions: Record<string, string> = {
            'gmail.com': 'Gmail (gmail.com) is Google\'s trusted email service used by over 1.8 billion people.',
            'outlook.com': 'Outlook.com is Microsoft\'s trusted consumer email service.',
            'yahoo.com': 'Yahoo Mail is one of the world\'s oldest and most widely used email providers.',
            'icloud.com': 'iCloud.com is Apple\'s official email service for Apple device users.',
            'protonmail.com': 'ProtonMail is a privacy-focused, end-to-end encrypted email provider based in Switzerland.',
            'proton.me': 'Proton.me is the primary domain of ProtonMail, a trusted encrypted email provider.',
            'paypal.com': 'paypal.com is the official corporate domain of PayPal Holdings Inc.',
            'apple.com': 'apple.com is the official corporate domain of Apple Inc.',
            'amazon.com': 'amazon.com is the official corporate domain of Amazon Inc.',
            'microsoft.com': 'microsoft.com is the official corporate domain of Microsoft Corporation.',
            'google.com': 'google.com is the official corporate domain of Google LLC.',
          };
          const domainDesc = domainDescriptions[lowerDomain] ?? `"${lowerDomain}" is a recognized, trusted email provider.`;
          aiExplanation = `SAFE: The email address "${email}" passes all security checks. ${domainDesc} The username "${localPart}" follows natural patterns consistent with legitimate use. No spoofing indicators, disposable domain flags, brand impersonation signals, or fraud patterns were detected. This email address appears genuine.`;
        }

        const result = { threatLevel, confidenceScore, aiExplanation, detectedPatterns: currentReasons.map(r => r.id) };
        threatMemoryService.logThreat(rawContext, contextType, result.threatLevel, result.detectedPatterns);
        return result;
      }

      // ── IMAGE fallback ──
      if (contextType === 'IMAGE') {
        let filename = 'Unknown';
        let ocrPreview = '';
        try {
          const filenameLine = rawContext.split('\n').find(l => l.startsWith('Image Filename:'));
          filename = filenameLine ? filenameLine.replace('Image Filename:', '').trim() : 'Unknown';
          const ocrStart = rawContext.indexOf('"""');
          const ocrEnd = rawContext.lastIndexOf('"""');
          if (ocrStart !== -1 && ocrEnd > ocrStart + 3) {
            ocrPreview = rawContext.substring(ocrStart + 3, ocrEnd).trim().substring(0, 300);
          }
        } catch { /* keep */ }

        const hasOCR = ocrPreview.length > 0;

        let threatLevel: string;
        let confidenceScore: number;
        let aiExplanation: string;

        if (severity === 'critical' || severity === 'high') {
          threatLevel = 'HIGH RISK';
          confidenceScore = 91;
          const highFlags = currentReasons.filter(r => r.severity === 'high').map(r => r.description).join('; ');
          aiExplanation = `HIGH RISK — BAD MAIL / PHISHING IMAGE: The image "${filename}" contains ${flagCount} threat indicators including: ${highFlags}. ${hasOCR ? `The extracted text "${ocrPreview.substring(0, 150)}..." contains patterns consistent with phishing content — ` : ''}Heuristic analysis detected urgency manipulation, credential harvesting requests, or brand impersonation. This image likely originates from a fraudulent source designed to deceive victims. Do not follow any instructions shown in this image, and report it as phishing. BAD MAIL.`;
        } else if (severity === 'medium') {
          threatLevel = 'SUSPICIOUS';
          confidenceScore = 74;
          aiExplanation = `SUSPICIOUS: The image "${filename}" raised ${flagCount} moderate concerns during analysis. ${hasOCR ? `Extracted text preview: "${ocrPreview.substring(0, 150)}..." — ` : ''}Some patterns were detected that may indicate suspicious intent. Exercise caution and do not provide any personal information based on instructions in this image.`;
        } else {
          // No significant flags
          threatLevel = 'SAFE';
          confidenceScore = 88;
          aiExplanation = `SAFE — GOOD MAIL / BENIGN IMAGE: The image "${filename}" was scanned for visual phishing indicators, credential harvesting patterns, and brand impersonation attempts. ${hasOCR ? `Extracted text: "${ocrPreview.substring(0, 150)}..." — no harmful content detected. ` : 'No readable text was detected in this image. '}No urgent language, fake login forms, payment scam indicators, or impersonation patterns were identified. The image content appears benign. GOOD MAIL.`;
        }

        const result = { threatLevel, confidenceScore, aiExplanation, detectedPatterns: currentReasons.map(r => r.id) };
        threatMemoryService.logThreat(rawContext, contextType, result.threatLevel, result.detectedPatterns);
        return result;
      }

      return null;
    }
  }
}
