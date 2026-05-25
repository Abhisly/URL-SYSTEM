import { analyzeUrlLocal, validateUrlFormat } from './localHeuristics';

const BACKEND_URL = 'http://localhost:3001';
const scanCache = new Map<string, any>();

// Message listeners
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scanUrl') {
    const tabId = sender.tab?.id;
    handleScanUrl(request.url, tabId)
      .then(sendResponse)
      .catch((err) => sendResponse({ error: true, message: err.message }));
    return true; // Keep message channel open for async response
  }

  if (request.action === 'checkServer') {
    checkServerStatus()
      .then(sendResponse)
      .catch(() => sendResponse({ online: false }));
    return true;
  }

  if (request.action === 'captureScreenshot') {
    chrome.tabs.captureVisibleTab(undefined, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        sendResponse({ error: true, message: chrome.runtime.lastError.message });
      } else if (!dataUrl) {
        sendResponse({ error: true, message: 'Failed to capture screenshot.' });
      } else {
        sendResponse({ success: true, dataUrl });
      }
    });
    return true;
  }

  if (request.action === 'analyzeOcrText') {
    analyzeImageText(request.ocrText, request.filename)
      .then(sendResponse)
      .catch((err) => sendResponse({ error: true, message: err.message }));
    return true;
  }
});

// Cache scans and report to the UI
async function handleScanUrl(url: string, tabId?: number) {
  if (!url || !url.startsWith('http')) {
    if (tabId !== undefined) {
      chrome.action.setBadgeText({ text: '', tabId });
    }
    return {
      status: 'INVALID',
      confidence: 100,
      riskLevel: 'LOW',
      reasons: [{ id: 'INVALID_PROTOCOL', description: 'Internal browser page or invalid protocol', severity: 'low' }],
      threatScore: 0,
      aiExplanation: 'Aborted: The extension only scans HTTP or HTTPS pages.'
    };
  }

  const cleanUrl = url.split('#')[0]; // Remove hash for caching
  if (scanCache.has(cleanUrl)) {
    const cached = scanCache.get(cleanUrl);
    if (tabId !== undefined) {
      updateExtensionBadge(cached.status, tabId);
    }
    return cached;
  }

  // 1. Try to scan via Backend
  try {
    const response = await fetch(`${BACKEND_URL}/api/scan-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: cleanUrl })
    });

    if (response.ok) {
      const data = await response.json();
      scanCache.set(cleanUrl, data);
      
      // Update browser badge for this tab
      updateExtensionBadge(data.status, tabId);
      return data;
    }
    throw new Error('Server returned error status');
  } catch (error) {
    console.warn('[URL SYSTEM SHIELD] Backend offline or fetch error. Falling back to local Heuristics.', error);
    
    // 2. Local Fallback (Heuristic Analysis)
    const validation = validateUrlFormat(cleanUrl);
    if (!validation.isValid) {
      return {
        status: 'INVALID',
        confidence: 100,
        riskLevel: 'LOW',
        reasons: [{ id: 'INVALID_URL_FORMAT', description: validation.reason || 'Invalid format', severity: 'high' }],
        threatScore: 0,
        aiExplanation: 'Aborted: Local validation failed.'
      };
    }

    const localResult = analyzeUrlLocal(cleanUrl);
    const result = {
      status: localResult.status,
      confidence: 80, // High confidence in heuristics
      riskLevel: localResult.riskLevel,
      reasons: localResult.reasons,
      threatScore: localResult.score,
      aiExplanation: `[LOCAL HEURISTICS] URL SYSTEM server is offline. Local Heuristic Shield is active.\n\nHeuristic scan evaluated this URL score at ${localResult.score}/100 based on ${localResult.reasons.length} warning indicators.`
    };

    scanCache.set(cleanUrl, result);
    updateExtensionBadge(result.status, tabId);
    return result;
  }
}

// Check server connectivity
async function checkServerStatus() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/system-status`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.json();
      return { online: true, aiConnected: data.services?.ai_orchestrator === 'online' };
    }
  } catch {
    // Silent catch
  }
  return { online: false, aiConnected: false };
}

// Upload OCR text to backend for AI evaluation, fallback to local heuristics if offline
async function analyzeImageText(ocrText: string, filename: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/analyze-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ocrText, filename })
    });

    if (res.ok) {
      return await res.json();
    }
    throw new Error('Failed to analyze image content via API.');
  } catch (error) {
    console.warn('[URL SYSTEM SHIELD] Image Analysis API offline. Performing local heuristic analysis.', error);
    
    const lowerText = ocrText.toLowerCase();
    const hasUrgent = /urgent|verify|suspend|limited|reset|security|unusual/i.test(lowerText);
    const hasPhish = /login|password|signin|credentials|bank|wallet/i.test(lowerText);
    
    let score = 0;
    const reasons = [];
    if (hasUrgent) {
      score += 35;
      reasons.push({ id: 'URGENCY_MANIPULATION', description: 'OCR text contains high-urgency keywords', severity: 'medium' });
    }
    if (hasPhish) {
      score += 45;
      reasons.push({ id: 'CREDENTIAL_HARVESTING', description: 'OCR text requests sensitive credentials or login details', severity: 'high' });
    }

    const localVerdict = score >= 45 ? 'MALICIOUS' : (score > 0 ? 'SUSPICIOUS' : 'SAFE');
    return {
      status: localVerdict,
      confidence: 75,
      riskLevel: score >= 45 ? 'HIGH' : (score > 0 ? 'MEDIUM' : 'LOW'),
      reasons,
      aiExplanation: `[LOCAL HEURISTICS] URL SYSTEM server is offline. Local Image Heuristics scan completed.\n\nExtracted OCR Text length: ${ocrText.length} characters.\nUrgency indicators: ${hasUrgent ? 'YES' : 'NO'}\nPhishing keywords: ${hasPhish ? 'YES' : 'NO'}\n\nStart URL SYSTEM backend to run Ollama AI reasoning.`
    };
  }
}

// Update Action Badge Indicator
function updateExtensionBadge(status: string, tabId?: number) {
  let text = '';
  let color = '#6b7280';

  if (status === 'SAFE') {
    text = 'OK';
    color = '#10b981';
  } else if (status === 'SUSPICIOUS') {
    text = 'WARN';
    color = '#f59e0b';
  } else if (status === 'MALICIOUS') {
    text = 'RISK';
    color = '#ef4444';
  }

  chrome.action.setBadgeText({ text, tabId });
  chrome.action.setBadgeBackgroundColor({ color, tabId });
}

// Automatically scan active tab when url changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    if (!changeInfo.url.startsWith('http')) {
      chrome.action.setBadgeText({ text: '', tabId });
    } else {
      handleScanUrl(changeInfo.url, tabId).catch((err) => {
        console.error('[URL SYSTEM SHIELD] Auto-scan on update failed:', err);
      });
    }
  }
});

// Sync badge when switching tabs
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (chrome.runtime.lastError || !tab || !tab.url) {
      chrome.action.setBadgeText({ text: '', tabId: activeInfo.tabId });
      return;
    }
    
    if (!tab.url.startsWith('http')) {
      chrome.action.setBadgeText({ text: '', tabId: activeInfo.tabId });
    } else {
      const cleanUrl = tab.url.split('#')[0];
      const cached = scanCache.get(cleanUrl);
      if (cached) {
        updateExtensionBadge(cached.status, activeInfo.tabId);
      } else {
        chrome.action.setBadgeText({ text: '', tabId: activeInfo.tabId });
        // Start scanning automatically if not scanned yet
        handleScanUrl(tab.url, activeInfo.tabId).catch(() => {});
      }
    }
  });
});
