(function(){"use strict";(async()=>{const v=window.location.href;if(!v.startsWith("http"))return;document.readyState==="loading"?document.addEventListener("DOMContentLoaded",w):w();function w(){chrome.runtime.sendMessage({action:"scanUrl",url:v},e=>{if(!e||e.error||e.status==="INVALID"){console.log("[URL SYSTEM SHIELD] Skipping indicator injection for internal or invalid URL.");return}I(e)})}function I(e){const s=e.status,N=e.threatScore!==void 0?e.threatScore:0,T=e.confidence||0,y=e.reasons||[],D=e.aiExplanation||"No report explanation available.",a=document.createElement("div");a.id="url-system-shield-host",a.style.position="fixed",a.style.top="16px",a.style.right="16px",a.style.zIndex="2147483647",a.style.fontFamily="'Outfit', sans-serif",document.body.appendChild(a);const E=a.attachShadow({mode:"closed"}),C=document.createElement("style");C.textContent=`
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
        gap: 8px;
        background: var(--bg-glass);
        border: 1px solid var(--border-glass);
        border-radius: 9999px;
        padding: 4px 8px;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        max-width: 32px;
        height: 32px;
        overflow: hidden;
      }

      .shield-badge:hover {
        max-width: 240px;
        padding-right: 12px;
        border-color: rgba(255, 255, 255, 0.2);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
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
      .shield-dot.phishing { background-color: var(--color-phishing); box-shadow: 0 0 10px var(--color-phishing-glow); }

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
      }

      .shield-badge:hover .shield-label {
        opacity: 1;
        transform: translateX(0);
      }

      .shield-badge.safe .shield-label { color: var(--color-safe); }
      .shield-badge.suspicious .shield-label { color: var(--color-suspicious); }
      .shield-badge.phishing .shield-label { color: var(--color-phishing); }

      /* Close button */
      .shield-close {
        font-size: 12px;
        color: #64748b;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.2s;
        margin-left: 4px;
      }

      .shield-badge:hover .shield-close {
        opacity: 1;
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
      .verdict-tag.phishing { color: var(--color-phishing); text-shadow: 0 0 10px var(--color-phishing-glow); }

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
    `;const l=document.createElement("div");l.className="shield-container";const i=document.createElement("div");i.className=`shield-badge ${s.toLowerCase()}`;const S=document.createElement("span");S.className=`shield-dot ${s.toLowerCase()}`;const g=document.createElement("span");g.className="shield-label",g.textContent=s==="MALICIOUS"?"PHISHING RISK":`${s} SITE`;const d=document.createElement("span");d.className="shield-close",d.innerHTML="&times;",d.title="Dismiss Shield",i.appendChild(S),i.appendChild(g),i.appendChild(d);const t=document.createElement("div");t.className="shield-panel";const c=document.createElement("div");c.className="panel-header";const b=document.createElement("div");b.className="panel-title",b.textContent="URL SYSTEM Core Report";const p=document.createElement("button");p.className="panel-close-btn",p.innerHTML="&times;",c.appendChild(b),c.appendChild(p);const h=document.createElement("div");h.className="verdict-box";const m=document.createElement("div");m.className=`verdict-tag ${s.toLowerCase()}`,m.textContent=s==="MALICIOUS"?"PHISHING DETECTED":s==="SUSPICIOUS"?"SUSPICIOUS WEB":"VERIFIED SAFE";const u=document.createElement("div");u.className="verdict-meta",u.textContent=`Confidence: ${T}% | Threat Score: ${N}/100`,h.appendChild(m),h.appendChild(u);const f=document.createElement("div");if(f.className="ai-report",f.textContent=D,t.appendChild(c),t.appendChild(h),t.appendChild(f),y.length>0){const o=document.createElement("div");o.className="threat-reasons",y.forEach(n=>{const r=document.createElement("div");r.className=`reason-item ${n.severity||"low"}`,r.textContent=`[${n.id}] ${n.description}`,o.appendChild(r)}),t.appendChild(o)}l.appendChild(i),l.appendChild(t),E.appendChild(C),E.appendChild(l),i.addEventListener("click",o=>{if(o.target.classList.contains("shield-close")){o.stopPropagation(),a.remove();return}t.classList.contains("open")?(t.classList.remove("open"),setTimeout(()=>{t.style.display="none"},400)):(t.style.display="flex",setTimeout(()=>{t.classList.add("open")},20))}),p.addEventListener("click",o=>{o.stopPropagation(),t.classList.remove("open"),setTimeout(()=>{t.style.display="none"},400)});let x=!1,k=0,L=16;i.addEventListener("mousedown",o=>{o.button!==0||o.target.classList.contains("shield-close")||(x=!0,k=o.clientY,L=parseInt(a.style.top||"16",10),o.preventDefault())}),document.addEventListener("mousemove",o=>{if(!x)return;const n=o.clientY-k;let r=L+n;r=Math.max(10,Math.min(r,window.innerHeight-80)),a.style.top=`${r}px`}),document.addEventListener("mouseup",()=>{x=!1})}window.addEventListener("message",e=>{e.data&&e.data.type==="URL_SYSTEM_REGISTER_BACKEND"&&e.data.url&&chrome.runtime.sendMessage({action:"registerBackend",url:e.data.url},s=>{s&&s.success&&console.log("[URL SYSTEM SHIELD] Dynamic backend registered:",e.data.url)})})})()})();
