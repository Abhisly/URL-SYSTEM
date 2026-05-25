(function(){"use strict";(async()=>{const M=window.location.href;if(!M.startsWith("http"))return;let u=null,r=null;chrome.runtime.onMessage.addListener((e,t,s)=>{if(e.action==="ping")return s({status:"pong"}),!0;if(e.action==="startAreaSelection")return Y(),!0;if(e.action==="showScanResult")return E(e.result),!0});let T=window.location.href;function H(e){if(!e.startsWith("http")){u&&(u.style.display="none");return}A("Analyzing new URL layers..."),chrome.runtime.sendMessage({action:"scanUrl",url:e},t=>{if(!t||t.error||t.status==="INVALID"){u&&(u.style.display="none");return}u&&(u.style.display="block"),E(t)})}setInterval(()=>{const e=window.location.href;e!==T&&(T=e,H(e))},800),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",U):U();function U(){chrome.runtime.sendMessage({action:"scanUrl",url:M},e=>{if(!e||e.error||e.status==="INVALID"){console.log("[URL SYSTEM SHIELD] Skipping indicator injection for internal or invalid URL.");return}R(e)})}function R(e){const t=e.status,s=e.threatScore!==void 0?e.threatScore:0,w=e.confidence||0,b=e.reasons||[],m=e.aiExplanation||"No report explanation available.",i=document.createElement("div");i.id="url-system-shield-host",i.style.position="fixed",i.style.top="4px",i.style.right="4px",i.style.zIndex="2147483647",i.style.fontFamily="'Outfit', sans-serif",document.body.appendChild(i),u=i;const h=i.attachShadow({mode:"closed"});r=h;const g=document.createElement("style");g.textContent=`
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
    `;const l=document.createElement("div");l.className="shield-container";const f=document.createElement("div");f.className=`shield-badge ${t.toLowerCase()}`;const x=document.createElement("span");x.className=`shield-dot ${t.toLowerCase()}`;const a=document.createElement("span");a.className="shield-label",a.textContent=t==="MALICIOUS"?"PHISHING RISK":`${t} SITE`;const o=document.createElement("span");o.className="shield-close",o.innerHTML="&times;",o.title="Dismiss Shield",f.appendChild(x),f.appendChild(a),f.appendChild(o);const n=document.createElement("div");n.className="shield-panel";const c=document.createElement("div");c.className="panel-header";const d=document.createElement("div");d.className="panel-title",d.textContent="URL SYSTEM Core Report";const S=document.createElement("button");S.className="panel-close-btn",S.innerHTML="&times;",c.appendChild(d),c.appendChild(S);const y=document.createElement("div");y.className="verdict-box";const I=document.createElement("div");I.className=`verdict-tag ${t.toLowerCase()}`,I.textContent=t==="MALICIOUS"?"PHISHING DETECTED":t==="SUSPICIOUS"?"SUSPICIOUS WEB":"VERIFIED SAFE";const L=document.createElement("div");L.className="verdict-meta",L.textContent=`Confidence: ${w}% | Threat Score: ${s}/100`,y.appendChild(I),y.appendChild(L);const k=document.createElement("div");if(k.className="ai-report",k.textContent=m,n.appendChild(c),n.appendChild(y),n.appendChild(k),b.length>0){const p=document.createElement("div");p.className="threat-reasons",b.forEach(C=>{const v=document.createElement("div");v.className=`reason-item ${C.severity||"low"}`,v.textContent=`[${C.id}] ${C.description}`,p.appendChild(v)}),n.appendChild(p)}l.appendChild(f),l.appendChild(n),h.appendChild(g),h.appendChild(l),f.addEventListener("click",p=>{if(p.target.classList.contains("shield-close")){p.stopPropagation(),i.remove();return}n.classList.contains("open")?(n.classList.remove("open"),setTimeout(()=>{n.style.display="none"},400)):(n.style.display="flex",setTimeout(()=>{n.classList.add("open")},20))}),S.addEventListener("click",p=>{p.stopPropagation(),n.classList.remove("open"),setTimeout(()=>{n.style.display="none"},400)});let N=!1,$=0,D=4;f.addEventListener("mousedown",p=>{p.button!==0||p.target.classList.contains("shield-close")||(N=!0,$=p.clientY,D=parseInt(i.style.top||"4",10),p.preventDefault())}),document.addEventListener("mousemove",p=>{if(!N)return;const C=p.clientY-$;let v=D+C;v=Math.max(10,Math.min(v,window.innerHeight-80)),i.style.top=`${v}px`}),document.addEventListener("mouseup",()=>{N=!1})}function E(e,t=!1){if(!u||!r){R(e),t&&setTimeout(()=>{const o=r==null?void 0:r.querySelector(".shield-panel");o&&(o.style.display="flex",setTimeout(()=>o.classList.add("open"),20))},100);return}const s=e.status||"SAFE",w=e.threatScore!==void 0?e.threatScore:0,b=e.confidence||0,m=e.aiExplanation||"No report explanation available.",i=e.reasons||[],h=r.querySelector(".shield-badge");if(h){h.className=`shield-badge ${s.toLowerCase()}`;const o=h.querySelector(".shield-label");o&&(o.textContent=s==="MALICIOUS"?"PHISHING RISK":s==="SCANNING"?"ANALYZING...":`${s} SITE`)}const g=r.querySelector(".shield-dot");g&&(g.className=`shield-dot ${s.toLowerCase()}`);const l=r.querySelector(".verdict-tag");l&&(l.className=`verdict-tag ${s.toLowerCase()}`,l.textContent=s==="MALICIOUS"?"PHISHING DETECTED":s==="SUSPICIOUS"?"SUSPICIOUS WEB":s==="SCANNING"?"ANALYZING LAYERS...":"VERIFIED SAFE");const f=r.querySelector(".verdict-meta");f&&(s==="SCANNING"?f.textContent="Confidence: --% | Threat Score: --/100":f.textContent=`Confidence: ${b}% | Threat Score: ${w}/100`);const x=r.querySelector(".ai-report");x&&(x.textContent=m);let a=r.querySelector(".threat-reasons");if(a)a.innerHTML="";else if(i.length>0){a=document.createElement("div"),a.className="threat-reasons";const o=r.querySelector(".shield-panel");o&&o.appendChild(a)}if(a&&i.length>0&&i.forEach(o=>{const n=document.createElement("div");n.className=`reason-item ${o.severity||"low"}`,n.textContent=`[${o.id}] ${o.description}`,a.appendChild(n)}),t){const o=r.querySelector(".shield-panel");o&&(o.style.display="flex",setTimeout(()=>o.classList.add("open"),20))}}function A(e,t=!1){E({status:"SUSPICIOUS",confidence:50,threatScore:0,aiExplanation:e,reasons:[]},t);const s=r==null?void 0:r.querySelector(".ai-report");s&&(s.innerHTML=`<span style="display:inline-block;animation:pulse 1.5s infinite;color:#6366f1;">${e}</span>`)}function Y(){const e=document.createElement("canvas");e.style.position="fixed",e.style.top="0",e.style.left="0",e.style.width="100vw",e.style.height="100vh",e.style.zIndex="2147483646",e.style.cursor="crosshair",document.body.appendChild(e);const t=e.getContext("2d"),s=window.devicePixelRatio||1,w=window.innerWidth,b=window.innerHeight;e.width=w*s,e.height=b*s,t.scale(s,s);let m=!1,i=0,h=0,g=0,l=0;function f(a=0,o=0,n=0,c=0){if(t.clearRect(0,0,w,b),t.fillStyle="rgba(7, 5, 16, 0.65)",t.fillRect(0,0,w,b),n>0&&c>0){t.save(),t.globalCompositeOperation="destination-out",t.fillStyle="#000",t.fillRect(a,o,n,c),t.restore(),t.strokeStyle="#6366f1",t.lineWidth=2,t.setLineDash([6,4]),t.strokeRect(a,o,n,c),t.fillStyle="#6366f1",t.font="10px Space Grotesk, sans-serif";const d=`${Math.round(n)} x ${Math.round(c)}`,S=t.measureText(d).width,y=o-20>=0?o-20:o+c+5;t.fillRect(a,y,S+12,16),t.fillStyle="#ffffff",t.fillText(d,a+6,y+11)}}f(),e.addEventListener("mousedown",a=>{a.button===0&&(m=!0,i=a.clientX,h=a.clientY,g=i,l=h)}),e.addEventListener("mousemove",a=>{if(!m)return;g=a.clientX,l=a.clientY;const o=Math.min(i,g),n=Math.min(h,l),c=Math.abs(i-g),d=Math.abs(h-l);f(o,n,c,d)}),e.addEventListener("mouseup",()=>{if(!m)return;m=!1;const a=Math.min(i,g),o=Math.min(h,l),n=Math.abs(i-g),c=Math.abs(h-l);e.remove(),n>15&&c>15&&(A("Capturing selected area and sending to AI backend...",!0),chrome.runtime.sendMessage({action:"analyzeRegion",coords:{x:a,y:o,width:n,height:c,dpr:s}},d=>{d&&!d.error?E(d,!0):E({status:"SUSPICIOUS",confidence:50,threatScore:0,aiExplanation:(d==null?void 0:d.message)||"Failed to analyze selected region.",reasons:[]},!0)}))});const x=a=>{a.key==="Escape"&&(e.remove(),document.removeEventListener("keydown",x))};document.addEventListener("keydown",x)}window.addEventListener("message",e=>{e.data&&e.data.type==="URL_SYSTEM_REGISTER_BACKEND"&&e.data.url&&chrome.runtime.sendMessage({action:"registerBackend",url:e.data.url},t=>{t&&t.success&&console.log("[URL SYSTEM SHIELD] Dynamic backend registered:",e.data.url)})})})()})();
