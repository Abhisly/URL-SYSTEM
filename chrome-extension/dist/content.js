(function(){"use strict";(async()=>{const T=window.location.href;if(!T.startsWith("http"))return;let b=null,l=null;chrome.runtime.onMessage.addListener((e,t,s)=>{if(e.action==="ping")return s({status:"pong"}),!0;if(e.action==="startAreaSelection")return z(),!0;if(e.action==="showScanResult")return C(e.result),!0});let U=window.location.href;function Y(e){if(!e.startsWith("http")){b&&(b.style.display="none");return}$("Analyzing new URL layers..."),chrome.runtime.sendMessage({action:"scanUrl",url:e},t=>{if(!t||t.error||t.status==="INVALID"){b&&(b.style.display="none");return}b&&(b.style.display="block"),C(t)})}setInterval(()=>{const e=window.location.href;e!==U&&(U=e,Y(e))},800),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",R):R();function R(){chrome.runtime.sendMessage({action:"scanUrl",url:T},e=>{if(!e||e.error||e.status==="INVALID"){console.log("[URL SYSTEM SHIELD] Skipping indicator injection for internal or invalid URL.");return}A(e)})}function A(e){const t=e.status,s=e.threatScore!==void 0?e.threatScore:0,w=e.confidence||0,m=e.reasons||[],x=e.aiExplanation||"No report explanation available.",p=document.getElementById("url-system-shield-host");p&&p.remove();const i=document.createElement("div");i.id="url-system-shield-host",i.style.position="fixed",i.style.top="4px",i.style.right="4px",i.style.zIndex="2147483647",i.style.fontFamily="'Outfit', sans-serif",document.body.appendChild(i),b=i;const h=i.attachShadow({mode:"closed"});l=h;const f=document.createElement("style");f.textContent=`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Outfit:wght@300;400;600&display=swap');

      :host {
        --color-safe: #10b981;
        --color-safe-glow: rgba(16, 185, 129, 0.45);
        --color-suspicious: #f59e0b;
        --color-suspicious-glow: rgba(245, 158, 11, 0.45);
        --color-phishing: #ef4444;
        --color-phishing-glow: rgba(239, 68, 68, 0.45);
        --color-scanning: #6366f1;
        --color-scanning-glow: rgba(99, 102, 241, 0.45);
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
        width: 190px;
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
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      .shield-dot.safe { background-color: var(--color-safe); box-shadow: 0 0 10px var(--color-safe-glow); }
      .shield-dot.suspicious { background-color: var(--color-suspicious); box-shadow: 0 0 10px var(--color-suspicious-glow); }
      .shield-dot.phishing, .shield-dot.malicious { background-color: var(--color-phishing); box-shadow: 0 0 10px var(--color-phishing-glow); }
      .shield-dot.scanning { background-color: var(--color-scanning); box-shadow: 0 0 10px var(--color-scanning-glow); }

      /* Amplified hover effects for the dot */
      .shield-badge:hover .shield-dot {
        transform: scale(1.2);
      }
      .shield-badge:hover .shield-dot.safe { box-shadow: 0 0 18px 3px var(--color-safe-glow); }
      .shield-badge:hover .shield-dot.suspicious { box-shadow: 0 0 18px 3px var(--color-suspicious-glow); }
      .shield-badge:hover .shield-dot.phishing, .shield-badge:hover .shield-dot.malicious { box-shadow: 0 0 18px 3px var(--color-phishing-glow); }
      .shield-badge:hover .shield-dot.scanning { box-shadow: 0 0 18px 3px var(--color-scanning-glow); }

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
      .shield-badge.scanning .shield-label { color: var(--color-scanning); }

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
      .verdict-tag.scanning { color: var(--color-scanning); text-shadow: 0 0 10px var(--color-scanning-glow); }

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
    `;const u=document.createElement("div");u.className="shield-container";const g=document.createElement("div");g.className=`shield-badge ${t.toLowerCase()}`;const n=document.createElement("span");n.className=`shield-dot ${t.toLowerCase()}`;const o=document.createElement("span");o.className="shield-label",o.textContent=t==="MALICIOUS"?"PHISHING RISK":`${t} SITE`;const r=document.createElement("span");r.className="shield-close",r.innerHTML="&times;",r.title="Dismiss Shield",g.appendChild(n),g.appendChild(o),g.appendChild(r);const a=document.createElement("div");a.className="shield-panel";const c=document.createElement("div");c.className="panel-header";const E=document.createElement("div");E.className="panel-title",E.textContent="URL SYSTEM Core Report";const y=document.createElement("button");y.className="panel-close-btn",y.innerHTML="&times;",c.appendChild(E),c.appendChild(y);const I=document.createElement("div");I.className="verdict-box";const L=document.createElement("div");L.className=`verdict-tag ${t.toLowerCase()}`,L.textContent=t==="MALICIOUS"?"PHISHING DETECTED":t==="SUSPICIOUS"?"SUSPICIOUS WEB":"VERIFIED SAFE";const k=document.createElement("div");k.className="verdict-meta",k.textContent=`Confidence: ${w}% | Threat Score: ${s}/100`,I.appendChild(L),I.appendChild(k);const N=document.createElement("div");if(N.className="ai-report",N.textContent=x,a.appendChild(c),a.appendChild(I),a.appendChild(N),m.length>0){const d=document.createElement("div");d.className="threat-reasons",m.forEach(S=>{const v=document.createElement("div");v.className=`reason-item ${S.severity||"low"}`,v.textContent=`[${S.id}] ${S.description}`,d.appendChild(v)}),a.appendChild(d)}u.appendChild(g),u.appendChild(a),h.appendChild(f),h.appendChild(u),g.addEventListener("click",d=>{if(d.target.classList.contains("shield-close")){d.stopPropagation(),i.remove();return}a.classList.contains("open")?(a.classList.remove("open"),setTimeout(()=>{a.style.display="none"},400)):(a.style.display="flex",setTimeout(()=>{a.classList.add("open")},20))}),y.addEventListener("click",d=>{d.stopPropagation(),a.classList.remove("open"),setTimeout(()=>{a.style.display="none"},400)});let M=!1,D=0,H=4;g.addEventListener("mousedown",d=>{d.button!==0||d.target.classList.contains("shield-close")||(M=!0,D=d.clientY,H=parseInt(i.style.top||"4",10),d.preventDefault())}),document.addEventListener("mousemove",d=>{if(!M)return;const S=d.clientY-D;let v=H+S;v=Math.max(10,Math.min(v,window.innerHeight-80)),i.style.top=`${v}px`}),document.addEventListener("mouseup",()=>{M=!1})}function C(e,t=!1){if(!b||!l){A(e),t&&setTimeout(()=>{const o=l==null?void 0:l.querySelector(".shield-panel");o&&(o.style.display="flex",setTimeout(()=>o.classList.add("open"),20))},100);return}const s=e.status||"SAFE",w=e.threatScore!==void 0?e.threatScore:0,m=e.confidence||0,x=e.aiExplanation||"No report explanation available.",p=e.reasons||[],i=l.querySelector(".shield-badge");if(i){i.className=`shield-badge ${s.toLowerCase()}`;const o=i.querySelector(".shield-label");o&&(o.textContent=s==="MALICIOUS"?"PHISHING RISK":s==="SCANNING"?"ANALYZING...":`${s} SITE`)}const h=l.querySelector(".shield-dot");h&&(h.className=`shield-dot ${s.toLowerCase()}`);const f=l.querySelector(".verdict-tag");f&&(f.className=`verdict-tag ${s.toLowerCase()}`,f.textContent=s==="MALICIOUS"?"PHISHING DETECTED":s==="SUSPICIOUS"?"SUSPICIOUS WEB":s==="SCANNING"?"ANALYZING LAYERS...":"VERIFIED SAFE");const u=l.querySelector(".verdict-meta");u&&(s==="SCANNING"?u.textContent="Confidence: --% | Threat Score: --/100":u.textContent=`Confidence: ${m}% | Threat Score: ${w}/100`);const g=l.querySelector(".ai-report");g&&(g.textContent=x);let n=l.querySelector(".threat-reasons");if(n)n.innerHTML="";else if(p.length>0){n=document.createElement("div"),n.className="threat-reasons";const o=l.querySelector(".shield-panel");o&&o.appendChild(n)}if(n&&p.length>0&&p.forEach(o=>{const r=document.createElement("div");r.className=`reason-item ${o.severity||"low"}`,r.textContent=`[${o.id}] ${o.description}`,n.appendChild(r)}),t){const o=l.querySelector(".shield-panel");o&&(o.style.display="flex",setTimeout(()=>o.classList.add("open"),20))}}function $(e,t=!1){C({status:"SUSPICIOUS",confidence:50,threatScore:0,aiExplanation:e,reasons:[]},t);const s=l==null?void 0:l.querySelector(".ai-report");s&&(s.innerHTML=`<span style="display:inline-block;animation:pulse 1.5s infinite;color:#6366f1;">${e}</span>`)}function z(){const e=document.createElement("canvas");e.style.position="fixed",e.style.top="0",e.style.left="0",e.style.width="100vw",e.style.height="100vh",e.style.zIndex="2147483646",e.style.cursor="crosshair",document.body.appendChild(e);const t=e.getContext("2d"),s=window.devicePixelRatio||1,w=window.innerWidth,m=window.innerHeight;e.width=w*s,e.height=m*s,t.scale(s,s);let x=!1,p=0,i=0,h=0,f=0;function u(n=0,o=0,r=0,a=0){if(t.clearRect(0,0,w,m),t.fillStyle="rgba(7, 5, 16, 0.65)",t.fillRect(0,0,w,m),r>0&&a>0){t.save(),t.globalCompositeOperation="destination-out",t.fillStyle="#000",t.fillRect(n,o,r,a),t.restore(),t.strokeStyle="#6366f1",t.lineWidth=2,t.setLineDash([6,4]),t.strokeRect(n,o,r,a),t.fillStyle="#6366f1",t.font="10px Space Grotesk, sans-serif";const c=`${Math.round(r)} x ${Math.round(a)}`,E=t.measureText(c).width,y=o-20>=0?o-20:o+a+5;t.fillRect(n,y,E+12,16),t.fillStyle="#ffffff",t.fillText(c,n+6,y+11)}}u(),e.addEventListener("mousedown",n=>{n.button===0&&(x=!0,p=n.clientX,i=n.clientY,h=p,f=i)}),e.addEventListener("mousemove",n=>{if(!x)return;h=n.clientX,f=n.clientY;const o=Math.min(p,h),r=Math.min(i,f),a=Math.abs(p-h),c=Math.abs(i-f);u(o,r,a,c)}),e.addEventListener("mouseup",()=>{if(!x)return;x=!1;const n=Math.min(p,h),o=Math.min(i,f),r=Math.abs(p-h),a=Math.abs(i-f);e.remove(),r>15&&a>15&&($("Capturing selected area and sending to AI backend...",!0),chrome.runtime.sendMessage({action:"analyzeRegion",coords:{x:n,y:o,width:r,height:a,dpr:s}},c=>{c&&!c.error?C(c,!0):C({status:"SUSPICIOUS",confidence:50,threatScore:0,aiExplanation:(c==null?void 0:c.message)||"Failed to analyze selected region.",reasons:[]},!0)}))});const g=n=>{n.key==="Escape"&&(e.remove(),document.removeEventListener("keydown",g))};document.addEventListener("keydown",g)}window.addEventListener("message",e=>{e.data&&e.data.type==="URL_SYSTEM_REGISTER_BACKEND"&&e.data.url&&chrome.runtime.sendMessage({action:"registerBackend",url:e.data.url},t=>{t&&t.success&&console.log("[URL SYSTEM SHIELD] Dynamic backend registered:",e.data.url)})})})()})();
