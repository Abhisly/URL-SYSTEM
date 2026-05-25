import Tesseract from 'tesseract.js';

document.addEventListener('DOMContentLoaded', async () => {
  const currentUrlEl = document.getElementById('current-url') as HTMLElement;
  const verdictTextEl = document.getElementById('verdict-text') as HTMLElement;
  const confidenceBarEl = document.getElementById('confidence-bar') as HTMLElement;
  const confidenceTextEl = document.getElementById('confidence-text') as HTMLElement;
  const aiReportTextEl = document.getElementById('ai-report-text') as HTMLElement;
  const serverStatusBadge = document.getElementById('server-status-badge') as HTMLElement;
  const headerStatusDot = document.getElementById('header-status-dot') as HTMLElement;
  const analyzeBtn = document.getElementById('analyze-screenshot-btn') as HTMLButtonElement;
  const threatDetailsCard = document.getElementById('threat-details-card') as HTMLElement;
  const reasonsList = document.getElementById('reasons-list') as HTMLElement;

  let activeTabUrl = '';
  let activeTabId: number | undefined;

  // 1. Get Current Tab Info
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs && tabs[0]) {
      const tab = tabs[0];
      activeTabUrl = tab.url || '';
      activeTabId = tab.id;
      
      if (activeTabUrl) {
        currentUrlEl.textContent = activeTabUrl;
        if (!activeTabUrl.startsWith('http')) {
          verdictTextEl.textContent = 'SYSTEM PAGE';
          verdictTextEl.className = 'verdict-value unknown';
          aiReportTextEl.textContent = 'This URL belongs to an internal browser or extension page and does not require security auditing.';
          analyzeBtn.disabled = true;
          return;
        }
      }
    }
  } catch (err) {
    console.error('Error fetching tab:', err);
    currentUrlEl.textContent = 'Failed to read tab URL';
    return;
  }

  // 2. Check Server Status
  chrome.runtime.sendMessage({ action: 'checkServer' }, (response) => {
    if (response && response.online) {
      serverStatusBadge.textContent = 'API ONLINE';
      serverStatusBadge.className = 'server-badge online';
    } else {
      serverStatusBadge.textContent = 'LOCAL SHELD';
      serverStatusBadge.className = 'server-badge offline';
    }
  });

  // 3. Trigger URL Scan
  verdictTextEl.textContent = 'SCANNING...';
  verdictTextEl.className = 'verdict-value unknown';
  headerStatusDot.className = 'pulse-dot grey';
  aiReportTextEl.innerHTML = '<span class="loading-pulse">Auditing website signatures, DNS, and SSL layers...</span>';

  chrome.runtime.sendMessage({ action: 'scanUrl', url: activeTabUrl }, (result) => {
    if (!result || result.error) {
      verdictTextEl.textContent = 'SCAN ERROR';
      verdictTextEl.className = 'verdict-value unknown';
      aiReportTextEl.textContent = result?.message || 'Connection to the scanning core failed.';
      analyzeBtn.disabled = true;
      return;
    }

    // Enable screenshot analysis if it is a standard webpage
    analyzeBtn.disabled = false;

    // Render results
    renderScanResults(result);
  });

  // 4. Handle Screenshot Analysis Action
  analyzeBtn.addEventListener('click', async () => {
    analyzeBtn.disabled = true;
    const originalBtnText = analyzeBtn.querySelector('.btn-text')!.textContent || '';
    analyzeBtn.querySelector('.btn-text')!.textContent = 'CAPTURING TAB...';

    chrome.runtime.sendMessage({ action: 'captureScreenshot' }, async (response) => {
      if (!response || response.error) {
        alert('Screenshot capture failed: ' + (response?.message || 'Unknown error'));
        resetBtn();
        return;
      }

      const dataUrl = response.dataUrl;
      analyzeBtn.querySelector('.btn-text')!.textContent = 'PERFORMING OCR...';
      aiReportTextEl.innerHTML = '<span class="loading-pulse">Processing image buffers. Initializing Tesseract OCR core...</span>';

      try {
        // Run OCR inside the popup DOM context
        const worker = await Tesseract.createWorker('eng');
        const ocrRes = await worker.recognize(dataUrl);
        const text = ocrRes.data.text.trim();
        await worker.terminate();

        analyzeBtn.querySelector('.btn-text')!.textContent = 'ANALYZING THREATS...';
        aiReportTextEl.innerHTML = '<span class="loading-pulse">Extracting language patterns and querying AI reasoning engine...</span>';

        chrome.runtime.sendMessage(
          { action: 'analyzeOcrText', ocrText: text, filename: 'screenshot_capture.png' },
          (scanResult) => {
            resetBtn();
            if (!scanResult || scanResult.error) {
              alert('Image analysis failed: ' + (scanResult?.message || 'Server error'));
              return;
            }
            renderScanResults(scanResult);
          }
        );
      } catch (err: any) {
        console.error('OCR Error:', err);
        alert('OCR Engine failed: ' + (err.message || String(err)));
        resetBtn();
      }
    });

    function resetBtn() {
      analyzeBtn.disabled = false;
      analyzeBtn.querySelector('.btn-text')!.textContent = originalBtnText;
    }
  });

  function renderScanResults(result: any) {
    const status = result.status; // SAFE | SUSPICIOUS | MALICIOUS | INVALID
    const score = result.threatScore !== undefined ? result.threatScore : (result.riskLevel === 'CRITICAL' || result.riskLevel === 'HIGH' ? 80 : 0);
    const confidence = result.confidence || 90;

    // Verdict display
    verdictTextEl.textContent = status === 'MALICIOUS' ? 'PHISHING RISK' : status;
    verdictTextEl.className = `verdict-value ${status.toLowerCase()}`;

    // Header pulse dot
    headerStatusDot.className = `pulse-dot ${status.toLowerCase()}`;

    // Confidence
    confidenceBarEl.style.width = `${confidence}%`;
    confidenceTextEl.textContent = `Confidence: ${confidence}% | Score: ${score}/100`;

    // AI Explanation
    aiReportTextEl.textContent = result.aiExplanation || 'No report explanation returned.';

    // Reasons/Heuristic logs
    reasonsList.innerHTML = '';
    const reasons = result.reasons || [];
    if (reasons.length > 0) {
      threatDetailsCard.style.display = 'block';
      reasons.forEach((r: any) => {
        const li = document.createElement('li');
        li.className = r.severity || 'low';
        li.textContent = `[${r.id}] ${r.description}`;
        reasonsList.appendChild(li);
      });
    } else {
      threatDetailsCard.style.display = 'none';
    }
  }
});
