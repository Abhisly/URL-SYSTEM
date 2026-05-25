// Content Script: Injects a floating real-time status indicator into the page
// Uses Shadow DOM to isolate styles and prevent host website CSS leaks

(async () => {
  const currentUrl = window.location.href;
  if (!currentUrl.startsWith('http')) return; // Ignore local/extension pages

  let activeHost: HTMLDivElement | null = null;
  let activeShadow: ShadowRoot | null = null;

  // Listen for messages from background/popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'ping') {
      sendResponse({ status: 'pong' });
      return true;
    }
    if (message.action === 'startAreaSelection') {
      startAreaSelection();
      return true;
    }
    if (message.action === 'showScanResult') {
      updateFloatingDotUI(message.result);
      return true;
    }
  });

  let lastUrl = window.location.href;

  function handleUrlChange(newUrl: string) {
    if (!newUrl.startsWith('http')) {
      if (activeHost) {
        activeHost.style.display = 'none';
      }
      return;
    }

    showLoadingState('Analyzing new URL layers...');

    chrome.runtime.sendMessage({ action: 'scanUrl', url: newUrl }, (result) => {
      if (!result || result.error || result.status === 'INVALID') {
        if (activeHost) {
          activeHost.style.display = 'none';
        }
        return;
      }

      if (activeHost) {
        activeHost.style.display = 'block';
      }
      updateFloatingDotUI(result);
    });
  }

  // Periodic URL polling check for Single Page Apps (Gmail, YouTube, etc.)
  setInterval(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      handleUrlChange(currentUrl);
    }
  }, 800);

  // Wait for document to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShield);
  } else {
    initShield();
  }

  function initShield() {
    // Request URL scan from background worker
    chrome.runtime.sendMessage({ action: 'scanUrl', url: currentUrl }, (result) => {
      if (!result || result.error || result.status === 'INVALID') {
        console.log('[URL SYSTEM SHIELD] Skipping indicator injection for internal or invalid URL.');
        return;
      }
      injectFloatingDot(result);
    });
  }

  function injectFloatingDot(result: any) {
    const status = result.status; // SAFE | SUSPICIOUS | MALICIOUS
    const score = result.threatScore !== undefined ? result.threatScore : 0;
    const confidence = result.confidence || 0;
    const reasons = result.reasons || [];
    const explanation = result.aiExplanation || 'No report explanation available.';

    // 1. Create Host Element
    const host = document.createElement('div');
    host.id = 'url-system-shield-host';
    host.style.position = 'fixed';
    host.style.top = '16px';
    host.style.right = '16px';
    host.style.zIndex = '2147483647'; // Max z-index
    host.style.fontFamily = "'Outfit', sans-serif";
    document.body.appendChild(host);
    activeHost = host;

    // 2. Attach Shadow DOM
    const shadow = host.attachShadow({ mode: 'closed' });
    activeShadow = shadow;

    // 3. CSS Styles for Shadow DOM
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Outfit:wght@300;400;600&display=swap');

      :host {
        --color-safe: #10b981;
        --color-safe-glow: rgba(16, 185, 129, 0.45);
        --color-suspicious: #f59e0b;
        --color-suspicious-glow: rgba(245, 158, 11, 0.45);
        --color-phishing: #ef4444;
        --color-phishing-glow: rgba(239, 68, 68, 0.45);
        --bg-glass: rgba(10, 7, 24, 0.88);
        --border-glass: rgba(255, 255, 255, 0.08);
      }

      .shield-container {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
        color: #e2e8f0;
        font-family: 'Outfit', sans-serif;
        user-select: none;
      }

      /* Floating Indicator Badge */
      .shield-badge {
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        overflow: hidden;
        box-sizing: border-box;
      }

      .shield-badge:hover {
        background: var(--bg-glass);
        border: 1px solid var(--border-glass);
        border-radius: 9999px;
        width: 180px;
        height: 36px;
        justify-content: flex-start;
        padding: 0 12px;
        gap: 8px;
        border-color: rgba(255, 255, 255, 0.2);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        transform: translateY(-1px);
      }

      /* Dot */
      .shield-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        flex-shrink: 0;
        position: relative;
      }

      .shield-dot.safe { background-color: var(--color-safe); box-shadow: 0 0 10px var(--color-safe-glow); }
      .shield-dot.suspicious { background-color: var(--color-suspicious); box-shadow: 0 0 10px var(--color-suspicious-glow); }
      .shield-dot.phishing, .shield-dot.malicious { background-color: var(--color-phishing); box-shadow: 0 0 10px var(--color-phishing-glow); }

      .shield-dot::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        box-shadow: 0 0 0 0 currentColor;
        animation: pulse 2.5s infinite;
        color: inherit;
      }

      @keyframes pulse {
        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.5); }
        70% { transform: scale(1.3); box-shadow: 0 0 0 8px rgba(255, 255, 255, 0); }
        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
      }

      /* Hover Text */
      .shield-label {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        white-space: nowrap;
        opacity: 0;
        transform: translateX(10px);
        transition: all 0.3s ease;
        position: absolute;
        pointer-events: none;
      }

      .shield-badge:hover .shield-label {
        opacity: 1;
        transform: translateX(0);
        position: static;
        pointer-events: auto;
      }

      .shield-badge.safe .shield-label { color: var(--color-safe); }
      .shield-badge.suspicious .shield-label { color: var(--color-suspicious); }
      .shield-badge.phishing .shield-label, .shield-badge.malicious .shield-label { color: var(--color-phishing); }

      /* Close button */
      .shield-close {
        font-size: 12px;
        color: #64748b;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.2s;
        margin-left: 4px;
        position: absolute;
        pointer-events: none;
      }

      .shield-badge:hover .shield-close {
        opacity: 1;
        position: static;
        pointer-events: auto;
      }

      .shield-close:hover {
        color: #ef4444;
      }

      /* Detailed Card Panel */
      .shield-panel {
        width: 320px;
        background: var(--bg-glass);
        border: 1px solid var(--border-glass);
        border-radius: 16px;
        padding: 16px;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(25px);
        -webkit-backdrop-filter: blur(25px);
        display: none;
        flex-direction: column;
        gap: 12px;
        transform: translateY(10px);
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .shield-panel.open {
        display: flex;
        transform: translateY(0);
        opacity: 1;
      }

      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        padding-bottom: 8px;
      }

      .panel-title {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 14px;
        font-weight: 700;
        color: #ffffff;
      }

      .panel-close-btn {
        background: none;
        border: none;
        color: #64748b;
        font-size: 18px;
        cursor: pointer;
        line-height: 1;
      }

      .panel-close-btn:hover {
        color: #ffffff;
      }

      .verdict-box {
        text-align: center;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.04);
        border-radius: 8px;
        padding: 12px;
      }

      .verdict-tag {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 18px;
        font-weight: 700;
        letter-spacing: 0.5px;
      }

      .verdict-tag.safe { color: var(--color-safe); text-shadow: 0 0 10px var(--color-safe-glow); }
      .verdict-tag.suspicious { color: var(--color-suspicious); text-shadow: 0 0 10px var(--color-suspicious-glow); }
      .verdict-tag.phishing, .verdict-tag.malicious { color: var(--color-phishing); text-shadow: 0 0 10px var(--color-phishing-glow); }

      .verdict-meta {
        font-size: 10px;
        color: #64748b;
        margin-top: 4px;
      }

      .ai-report {
        font-size: 11px;
        line-height: 1.5;
        color: #cbd5e1;
        max-height: 120px;
        overflow-y: auto;
        white-space: pre-line;
        padding-right: 4px;
      }

      .ai-report::-webkit-scrollbar { width: 3px; }
      .ai-report::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 2px; }

      .threat-reasons {
        display: flex;
        flex-direction: column;
        gap: 6px;
        max-height: 100px;
        overflow-y: auto;
        padding-right: 4px;
      }

      .threat-reasons::-webkit-scrollbar { width: 3px; }
      .threat-reasons::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 2px; }

      .reason-item {
        font-size: 10px;
        padding: 4px 6px;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.02);
        border-left: 2px solid #6366f1;
      }

      .reason-item.high { border-left-color: var(--color-phishing); background: rgba(239, 68, 68, 0.03); }
      .reason-item.medium { border-left-color: var(--color-suspicious); background: rgba(245, 158, 11, 0.03); }
      .reason-item.low { border-left-color: var(--color-safe); background: rgba(16, 185, 129, 0.03); }
    `;

    // 4. Create DOM elements for Shadow DOM
    const container = document.createElement('div');
    container.className = 'shield-container';

    // Badge
    const badge = document.createElement('div');
    badge.className = `shield-badge ${status.toLowerCase()}`;

    const dot = document.createElement('span');
    dot.className = `shield-dot ${status.toLowerCase()}`;

    const label = document.createElement('span');
    label.className = 'shield-label';
    label.textContent = status === 'MALICIOUS' ? 'PHISHING RISK' : `${status} SITE`;

    const closeBtn = document.createElement('span');
    closeBtn.className = 'shield-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.title = 'Dismiss Shield';

    badge.appendChild(dot);
    badge.appendChild(label);
    badge.appendChild(closeBtn);

    // Panel
    const panel = document.createElement('div');
    panel.className = 'shield-panel';

    const pHeader = document.createElement('div');
    pHeader.className = 'panel-header';
    
    const pTitle = document.createElement('div');
    pTitle.className = 'panel-title';
    pTitle.textContent = 'URL SYSTEM Core Report';

    const pClose = document.createElement('button');
    pClose.className = 'panel-close-btn';
    pClose.innerHTML = '&times;';

    pHeader.appendChild(pTitle);
    pHeader.appendChild(pClose);

    const vBox = document.createElement('div');
    vBox.className = 'verdict-box';

    const vTag = document.createElement('div');
    vTag.className = `verdict-tag ${status.toLowerCase()}`;
    vTag.textContent = status === 'MALICIOUS' ? 'PHISHING DETECTED' : (status === 'SUSPICIOUS' ? 'SUSPICIOUS WEB' : 'VERIFIED SAFE');

    const vMeta = document.createElement('div');
    vMeta.className = 'verdict-meta';
    vMeta.textContent = `Confidence: ${confidence}% | Threat Score: ${score}/100`;

    vBox.appendChild(vTag);
    vBox.appendChild(vMeta);

    const aiRep = document.createElement('div');
    aiRep.className = 'ai-report';
    aiRep.textContent = explanation;

    panel.appendChild(pHeader);
    panel.appendChild(vBox);
    panel.appendChild(aiRep);

    // If there are reason items, list them
    if (reasons.length > 0) {
      const reasonListEl = document.createElement('div');
      reasonListEl.className = 'threat-reasons';
      reasons.forEach((r: any) => {
        const item = document.createElement('div');
        item.className = `reason-item ${r.severity || 'low'}`;
        item.textContent = `[${r.id}] ${r.description}`;
        reasonListEl.appendChild(item);
      });
      panel.appendChild(reasonListEl);
    }

    container.appendChild(badge);
    container.appendChild(panel);

    shadow.appendChild(style);
    shadow.appendChild(container);

    // 5. Wire up events
    badge.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('shield-close')) {
        e.stopPropagation();
        host.remove();
        return;
      }
      
      const isOpen = panel.classList.contains('open');
      if (isOpen) {
        panel.classList.remove('open');
        setTimeout(() => { panel.style.display = 'none'; }, 400);
      } else {
        panel.style.display = 'flex';
        // Allow browser display block to trigger before adding open class for animation
        setTimeout(() => { panel.classList.add('open'); }, 20);
      }
    });

    pClose.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.remove('open');
      setTimeout(() => { panel.style.display = 'none'; }, 400);
    });

    // Make the host draggable
    let isDragging = false;
    let startY = 0;
    let startTop = 16;

    badge.addEventListener('mousedown', (e) => {
      // Only drag with left-click, and don't drag if clicking close button
      if (e.button !== 0 || (e.target as HTMLElement).classList.contains('shield-close')) return;
      isDragging = true;
      startY = e.clientY;
      startTop = parseInt(host.style.top || '16', 10);
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaY = e.clientY - startY;
      let newTop = startTop + deltaY;
      
      // Keep it within screen bounds
      newTop = Math.max(10, Math.min(newTop, window.innerHeight - 80));
      host.style.top = `${newTop}px`;
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  function updateFloatingDotUI(result: any) {
    if (!activeHost || !activeShadow) {
      injectFloatingDot(result);
      return;
    }

    const status = result.status || 'SAFE';
    const score = result.threatScore !== undefined ? result.threatScore : 0;
    const confidence = result.confidence || 0;
    const explanation = result.aiExplanation || 'No report explanation available.';
    const reasons = result.reasons || [];

    // Update Badge
    const badge = activeShadow.querySelector('.shield-badge') as HTMLElement;
    if (badge) {
      badge.className = `shield-badge ${status.toLowerCase()}`;
      const label = badge.querySelector('.shield-label') as HTMLElement;
      if (label) {
        label.textContent = status === 'MALICIOUS' ? 'PHISHING RISK' : `${status} SITE`;
      }
    }

    // Update Dot
    const dot = activeShadow.querySelector('.shield-dot') as HTMLElement;
    if (dot) {
      dot.className = `shield-dot ${status.toLowerCase()}`;
    }

    // Update Panel Verdict
    const vTag = activeShadow.querySelector('.verdict-tag') as HTMLElement;
    if (vTag) {
      vTag.className = `verdict-tag ${status.toLowerCase()}`;
      vTag.textContent = status === 'MALICIOUS' ? 'PHISHING DETECTED' : (status === 'SUSPICIOUS' ? 'SUSPICIOUS WEB' : 'VERIFIED SAFE');
    }

    const vMeta = activeShadow.querySelector('.verdict-meta') as HTMLElement;
    if (vMeta) {
      vMeta.textContent = `Confidence: ${confidence}% | Threat Score: ${score}/100`;
    }

    const aiRep = activeShadow.querySelector('.ai-report') as HTMLElement;
    if (aiRep) {
      aiRep.textContent = explanation;
    }

    // Update Reasons
    let reasonsContainer = activeShadow.querySelector('.threat-reasons') as HTMLElement;
    if (reasonsContainer) {
      reasonsContainer.innerHTML = '';
    } else if (reasons.length > 0) {
      reasonsContainer = document.createElement('div');
      reasonsContainer.className = 'threat-reasons';
      const panel = activeShadow.querySelector('.shield-panel') as HTMLElement;
      if (panel) {
        panel.appendChild(reasonsContainer);
      }
    }

    if (reasonsContainer && reasons.length > 0) {
      reasons.forEach((r: any) => {
        const item = document.createElement('div');
        item.className = `reason-item ${r.severity || 'low'}`;
        item.textContent = `[${r.id}] ${r.description}`;
        reasonsContainer.appendChild(item);
      });
    }

  }

  function showLoadingState(msg: string) {
    updateFloatingDotUI({
      status: 'SUSPICIOUS',
      confidence: 50,
      threatScore: 0,
      aiExplanation: msg,
      reasons: []
    });
    const aiRep = activeShadow?.querySelector('.ai-report') as HTMLElement;
    if (aiRep) {
      aiRep.innerHTML = `<span style="display:inline-block;animation:pulse 1.5s infinite;color:#6366f1;">${msg}</span>`;
    }
  }

  function startAreaSelection() {
    // 1. Create a fullscreen overlay canvas
    const overlay = document.createElement('canvas');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.zIndex = '2147483646'; // Below floating dot but above the site
    overlay.style.cursor = 'crosshair';
    document.body.appendChild(overlay);

    const ctx = overlay.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    overlay.width = width * dpr;
    overlay.height = height * dpr;
    ctx.scale(dpr, dpr);

    let isSelecting = false;
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    function drawOverlay(x = 0, y = 0, w = 0, h = 0) {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(7, 5, 16, 0.65)';
      ctx.fillRect(0, 0, width, height);

      if (w > 0 && h > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = '#000';
        ctx.fillRect(x, y, w, h);
        ctx.restore();

        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(x, y, w, h);

        ctx.fillStyle = '#6366f1';
        ctx.font = '10px Space Grotesk, sans-serif';
        const txt = `${Math.round(w)} x ${Math.round(h)}`;
        const textWidth = ctx.measureText(txt).width;
        
        const labelY = y - 20 >= 0 ? y - 20 : y + h + 5;
        ctx.fillRect(x, labelY, textWidth + 12, 16);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(txt, x + 6, labelY + 11);
      }
    }

    drawOverlay();

    overlay.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      isSelecting = true;
      startX = e.clientX;
      startY = e.clientY;
      endX = startX;
      endY = startY;
    });

    overlay.addEventListener('mousemove', (e) => {
      if (!isSelecting) return;
      endX = e.clientX;
      endY = e.clientY;
      const x = Math.min(startX, endX);
      const y = Math.min(startY, endY);
      const w = Math.abs(startX - endX);
      const h = Math.abs(startY - endY);
      drawOverlay(x, y, w, h);
    });

    overlay.addEventListener('mouseup', () => {
      if (!isSelecting) return;
      isSelecting = false;
      
      const x = Math.min(startX, endX);
      const y = Math.min(startY, endY);
      const w = Math.abs(startX - endX);
      const h = Math.abs(startY - endY);

      overlay.remove();

      if (w > 15 && h > 15) {
        showLoadingState('Capturing selected area and sending to AI backend...');

        chrome.runtime.sendMessage({
          action: 'analyzeRegion',
          coords: { x, y, width: w, height: h, dpr }
        }, (result) => {
          if (result && !result.error) {
            updateFloatingDotUI(result);
          } else {
            updateFloatingDotUI({
              status: 'SUSPICIOUS',
              confidence: 50,
              threatScore: 0,
              aiExplanation: result?.message || 'Failed to analyze selected region.',
              reasons: []
            });
          }
        });
      }
    });

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        overlay.remove();
        document.removeEventListener('keydown', handleKeydown);
      }
    };
    document.addEventListener('keydown', handleKeydown);
  }

  // Listen for messages from the host webpage to register the backend URL dynamically
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'URL_SYSTEM_REGISTER_BACKEND' && event.data.url) {
      chrome.runtime.sendMessage({ action: 'registerBackend', url: event.data.url }, (response) => {
        if (response && response.success) {
          console.log('[URL SYSTEM SHIELD] Dynamic backend registered:', event.data.url);
        }
      });
    }
  });
})();
