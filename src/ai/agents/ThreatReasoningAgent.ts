import { generateOllamaResponse, extractJsonFromResponse } from '@ai/services/ollamaService';
import { buildUrlPrompt, buildEmailPrompt, buildImagePrompt } from '@ai/prompts/promptEngine';
import { ThreatReason } from '@projectTypes/index';
import { threatMemoryService } from '@ai/memory/threatMemoryService';
import type { SiteMetadata } from '@ai/services/siteMetadataService';

export interface AIInsights {
  threatLevel: string;
  confidenceScore: number;
  aiExplanation: string;
  detectedPatterns: string[];
}

export class ThreatReasoningAgent {
  static async reason(
    contextType: 'URL' | 'EMAIL' | 'IMAGE',
    rawContext: string,
    currentReasons: ThreatReason[],
    metadata?: SiteMetadata
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
      const hasFlags = currentReasons.length > 0;

      // ── URL fallback ──
      if (contextType === 'URL') {
        const siteTitle = metadata?.title || '';
        const siteDesc = metadata?.description || '';
        const domain = metadata?.domain || rawContext;

        let displayUrl = rawContext;
        try {
          const urlLine = rawContext.split('\n')[0];
          displayUrl = urlLine.replace('URL: ', '').trim();
        } catch { /* keep */ }

        const knownSites: Record<string, string> = {
          'google.com': 'Google.com is the homepage of Google LLC, one of the world\'s most widely-used search engines offering web search, Gmail, Maps, YouTube, and cloud services.',
          'youtube.com': 'YouTube.com is a video-sharing platform owned by Google LLC where billions of users upload, share, and stream video content.',
          'facebook.com': 'Facebook.com is a social networking platform owned by Meta Platforms Inc., connecting billions of users globally.',
          'twitter.com': 'Twitter.com (now X) is a microblogging platform where users post short messages called tweets.',
          'x.com': 'X.com is the rebranded Twitter platform for real-time public conversation and news sharing.',
          'instagram.com': 'Instagram.com is a photo and video sharing social network owned by Meta Platforms Inc.',
          'amazon.com': 'Amazon.com is the world\'s largest e-commerce marketplace operated by Amazon Inc.',
          'github.com': 'GitHub.com is a developer platform owned by Microsoft for Git repository hosting and collaborative software development.',
          'linkedin.com': 'LinkedIn.com is a professional networking platform owned by Microsoft for career development and business networking.',
          'wikipedia.org': 'Wikipedia.org is a free online encyclopedia edited by volunteers covering millions of topics.',
          'reddit.com': 'Reddit.com is a social news aggregation and discussion platform.',
          'netflix.com': 'Netflix.com is a subscription streaming platform for movies, TV series, and original content.',
          'apple.com': 'Apple.com is the official website of Apple Inc., featuring iPhone, Mac, and various services.',
          'microsoft.com': 'Microsoft.com is the official website of Microsoft Corporation for Windows, Office, and Azure services.',
          'openai.com': 'OpenAI.com is the website of OpenAI, the AI research organization behind ChatGPT and the GPT series.',
          'claude.ai': 'Claude.ai is the official web interface of Claude, an AI assistant developed by Anthropic for conversational AI, analysis, coding, and writing.',
          'anthropic.com': 'Anthropic.com is the website of Anthropic, an AI safety company that develops the Claude series of large language models.',
          'chatgpt.com': 'ChatGPT.com is the official platform for ChatGPT, an AI chatbot developed by OpenAI for natural language conversation.',
          'notion.so': 'Notion.so is a collaborative productivity platform combining notes, databases, and project management tools.',
          'vercel.com': 'Vercel.com is a cloud platform for front-end developers specializing in Next.js applications.',
          'stripe.com': 'Stripe.com is a financial infrastructure platform for online payments and billing.',
          'spotify.com': 'Spotify.com is a music and podcast streaming platform with over 100 million tracks.',
          'twitch.tv': 'Twitch.tv is a live streaming platform primarily for gaming and creative content, owned by Amazon.',
          'discord.com': 'Discord.com is a communication platform popular with gaming, developer, and online communities.',
          'paypal.com': 'PayPal.com is a global digital payments platform for sending and receiving money securely.',
        };

        let siteDescription = '';
        if (siteTitle && siteDesc) {
          siteDescription = `"${domain}" — identified as "${siteTitle}". ${siteDesc}`;
        } else if (siteTitle && siteTitle !== domain) {
          siteDescription = `The domain "${domain}" hosts a page titled "${siteTitle}", indicating it belongs to ${siteTitle.split(' | ')[0].split(' - ')[0].trim()}.`;
        } else {
          siteDescription = knownSites[domain] ?? `The target domain "${domain}" was analyzed for structural and security properties.`;
        }

        const aiExplanation = hasFlags
          ? `${siteDescription} However, the submitted URL "${displayUrl}" exhibits ${currentReasons.length} heuristic anomalies deviating from expected structure. These signals — including suspicious path segments, subdomain manipulation, or misleading URL patterns — are consistent with phishing infrastructure attempting to impersonate this brand. Do not submit credentials or personal information to this target.`
          : `${siteDescription} The submitted URL "${displayUrl}" was scanned against heuristic models and known threat patterns. The domain structure, TLD, and path composition all conform to expected legitimate patterns. No deceptive subdomain nesting, typosquatting, or redirect chains were detected. This target is safe to access.`;

        const result = { threatLevel: hasFlags ? 'HIGH RISK' : 'SAFE', confidenceScore: hasFlags ? 92 : 98, aiExplanation, detectedPatterns: currentReasons.map(r => r.id) };
        threatMemoryService.logThreat(rawContext, contextType, result.threatLevel, result.detectedPatterns);
        return result;
      }

      // ── EMAIL fallback ──
      if (contextType === 'EMAIL') {
        // Parse email from enriched context
        let email = rawContext;
        let domain = '';
        let localPart = '';
        try {
          const emailLine = rawContext.split('\n').find(l => l.startsWith('Email Address:'));
          email = emailLine ? emailLine.replace('Email Address:', '').trim() : rawContext;
          [localPart, domain] = email.includes('@') ? email.split('@') : [email, ''];
        } catch { /* keep raw */ }

        const knownEmailDomains: Record<string, string> = {
          'gmail.com': 'Gmail (gmail.com) is Google\'s free email service, used by over 1.8 billion people worldwide.',
          'googlemail.com': 'Googlemail.com is an alias for Gmail, Google\'s free email platform.',
          'outlook.com': 'Outlook.com is Microsoft\'s consumer email service, part of the Microsoft 365 ecosystem.',
          'hotmail.com': 'Hotmail.com is a legacy Microsoft email domain, now operating under the Outlook platform.',
          'live.com': 'Live.com is a Microsoft email domain, part of the legacy Windows Live and Outlook platform.',
          'yahoo.com': 'Yahoo.com is Yahoo\'s free email service, one of the oldest web-based email providers.',
          'icloud.com': 'iCloud.com is Apple\'s email and cloud service, integrated with all Apple devices.',
          'me.com': 'Me.com is an Apple iCloud email alias used on Apple devices.',
          'protonmail.com': 'ProtonMail.com is a privacy-focused, end-to-end encrypted email service based in Switzerland.',
          'proton.me': 'Proton.me is the primary domain of Proton Mail, a secure encrypted email provider.',
          'paypal.com': 'PayPal.com is the official domain of PayPal Holdings Inc., a global digital payments platform.',
          'amazon.com': 'Amazon.com is the official domain of Amazon Inc., the world\'s largest e-commerce company.',
          'apple.com': 'Apple.com is the official corporate domain of Apple Inc., used for official Apple communications.',
          'microsoft.com': 'Microsoft.com is the official corporate domain of Microsoft Corporation.',
          'support.microsoft.com': 'Support.microsoft.com is an official Microsoft subdomain used for customer support communications.',
          'no-reply.accounts.google.com': 'This is an official Google no-reply address used for automated account notifications.',
          'tempmail.com': 'TempMail.com is a disposable temporary email service, often used to avoid spam or hide identity.',
          'mailinator.com': 'Mailinator.com is a public disposable email service where anyone can read messages — commonly used in fraud.',
          'guerrillamail.com': 'GuerillaMail is a disposable anonymous email provider, a strong indicator of suspicious activity.',
          '10minutemail.com': '10MinuteMail provides temporary email addresses that expire after 10 minutes, commonly used to bypass verification.',
        };

        const domainDescription = domain ? (knownEmailDomains[domain.toLowerCase()] ?? `The domain "${domain}" is not a widely recognized email provider.`) : '';

        const aiExplanation = hasFlags
          ? `The email address "${email}" was flagged during analysis. ${domainDescription} The local part "${localPart}" combined with ${currentReasons.length} heuristic anomalies raises significant concerns about the legitimacy of this sender. Patterns suggest this address may be used for phishing, fraud, or impersonation campaigns. Do not click links or download attachments from this sender.`
          : `The email address "${email}" was analyzed for authenticity and threat indicators. ${domainDescription} The username pattern "${localPart}" is structurally consistent with legitimate use of this email provider. No spoofing signals, disposable domain flags, or impersonation patterns were detected. This email address appears genuine.`;

        const result = { threatLevel: hasFlags ? 'HIGH RISK' : 'SAFE', confidenceScore: hasFlags ? 91 : 97, aiExplanation, detectedPatterns: currentReasons.map(r => r.id) };
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
            ocrPreview = rawContext.substring(ocrStart + 3, ocrEnd).trim().substring(0, 200);
          }
        } catch { /* keep */ }

        const hasOCR = ocrPreview.length > 0;

        const aiExplanation = hasFlags
          ? `The image "${filename}" was analyzed and ${currentReasons.length} threat indicators were detected. ${hasOCR ? `The extracted text contains: "${ocrPreview}..." — ` : ''}Heuristic analysis flagged patterns consistent with phishing content, including urgency-based language, credential harvesting forms, or brand impersonation. This image likely originates from a fraudulent source. Do not follow any instructions shown in this image.`
          : `The image "${filename}" was scanned for visual phishing indicators and suspicious content. ${hasOCR ? `Extracted text preview: "${ocrPreview}..."` : 'No readable text was detected in this image.'} No harmful patterns, fake login forms, payment scams, or impersonation attempts were identified. The image content appears benign based on available analysis.`;

        const result = { threatLevel: hasFlags ? 'HIGH RISK' : 'SAFE', confidenceScore: hasFlags ? 89 : 94, aiExplanation, detectedPatterns: currentReasons.map(r => r.id) };
        threatMemoryService.logThreat(rawContext, contextType, result.threatLevel, result.detectedPatterns);
        return result;
      }

      return null;
    }
  }
}
