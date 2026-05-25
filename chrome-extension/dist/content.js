(function(){"use strict";(async()=>{const N=window.location.href;if(!N.startsWith("http"))return;let b=null,u=null;chrome.runtime.onMessage.addListener((e,t,g)=>{if(e.action==="ping")return g({status:"pong"}),!0;if(e.action==="startAreaSelection")return z(),!0;if(e.action==="showScanResult")return C(e.result),!0});let T=window.location.href;function O(e){if(!e.startsWith("http")){b&&(b.style.display="none");return}$("Analyzing new URL layers..."),chrome.runtime.sendMessage({action:"scanUrl",url:e},t=>{if(!t||t.error||t.status==="INVALID"){b&&(b.style.display="none");return}b&&(b.style.display="block"),C(t)})}setInterval(()=>{const e=window.location.href;e!==T&&(T=e,O(e))},800),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",U):U();function U(){chrome.runtime.sendMessage({action:"scanUrl",url:N},e=>{if(!e||e.error||e.status==="INVALID"){console.log("[URL SYSTEM SHIELD] Skipping indicator injection for internal or invalid URL.");return}R(e)})}function R(e){const t=e.status,g=e.threatScore!==void 0?e.threatScore:0,y=e.confidence||0,x=e.reasons||[],m=e.aiExplanation||"No report explanation available.",a=document.createElement("div");a.id="url-system-shield-host",a.style.position="fixed",a.style.top="16px",a.style.right="16px",a.style.zIndex="2147483647",a.style.fontFamily="'Outfit', sans-serif",document.body.appendChild(a),b=a;const d=a.attachShadow({mode:"closed"});u=d;const p=document.createElement("style");p.textContent=`
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
    `;const c=document.createElement("div");c.className="shield-container";const h=document.createElement("div");h.className=`shield-badge ${t.toLowerCase()}`;const f=document.createElement("span");f.className=`shield-dot ${t.toLowerCase()}`;const o=document.createElement("span");o.className="shield-label",o.textContent=t==="MALICIOUS"?"PHISHING RISK":`${t} SITE`;const s=document.createElement("span");s.className="shield-close",s.innerHTML="&times;",s.title="Dismiss Shield",h.appendChild(f),h.appendChild(o),h.appendChild(s);const n=document.createElement("div");n.className="shield-panel";const i=document.createElement("div");i.className="panel-header";const r=document.createElement("div");r.className="panel-title",r.textContent="URL SYSTEM Core Report";const S=document.createElement("button");S.className="panel-close-btn",S.innerHTML="&times;",i.appendChild(r),i.appendChild(S);const w=document.createElement("div");w.className="verdict-box";const I=document.createElement("div");I.className=`verdict-tag ${t.toLowerCase()}`,I.textContent=t==="MALICIOUS"?"PHISHING DETECTED":t==="SUSPICIOUS"?"SUSPICIOUS WEB":"VERIFIED SAFE";const L=document.createElement("div");L.className="verdict-meta",L.textContent=`Confidence: ${y}% | Threat Score: ${g}/100`,w.appendChild(I),w.appendChild(L);const k=document.createElement("div");if(k.className="ai-report",k.textContent=m,n.appendChild(i),n.appendChild(w),n.appendChild(k),x.length>0){const l=document.createElement("div");l.className="threat-reasons",x.forEach(E=>{const v=document.createElement("div");v.className=`reason-item ${E.severity||"low"}`,v.textContent=`[${E.id}] ${E.description}`,l.appendChild(v)}),n.appendChild(l)}c.appendChild(h),c.appendChild(n),d.appendChild(p),d.appendChild(c),h.addEventListener("click",l=>{if(l.target.classList.contains("shield-close")){l.stopPropagation(),a.remove();return}n.classList.contains("open")?(n.classList.remove("open"),setTimeout(()=>{n.style.display="none"},400)):(n.style.display="flex",setTimeout(()=>{n.classList.add("open")},20))}),S.addEventListener("click",l=>{l.stopPropagation(),n.classList.remove("open"),setTimeout(()=>{n.style.display="none"},400)});let M=!1,D=0,H=16;h.addEventListener("mousedown",l=>{l.button!==0||l.target.classList.contains("shield-close")||(M=!0,D=l.clientY,H=parseInt(a.style.top||"16",10),l.preventDefault())}),document.addEventListener("mousemove",l=>{if(!M)return;const E=l.clientY-D;let v=H+E;v=Math.max(10,Math.min(v,window.innerHeight-80)),a.style.top=`${v}px`}),document.addEventListener("mouseup",()=>{M=!1})}function C(e){if(!b||!u){R(e);return}const t=e.status||"SAFE",g=e.threatScore!==void 0?e.threatScore:0,y=e.confidence||0,x=e.aiExplanation||"No report explanation available.",m=e.reasons||[],a=u.querySelector(".shield-badge");if(a){a.className=`shield-badge ${t.toLowerCase()}`;const o=a.querySelector(".shield-label");o&&(o.textContent=t==="MALICIOUS"?"PHISHING RISK":`${t} SITE`)}const d=u.querySelector(".shield-dot");d&&(d.className=`shield-dot ${t.toLowerCase()}`);const p=u.querySelector(".verdict-tag");p&&(p.className=`verdict-tag ${t.toLowerCase()}`,p.textContent=t==="MALICIOUS"?"PHISHING DETECTED":t==="SUSPICIOUS"?"SUSPICIOUS WEB":"VERIFIED SAFE");const c=u.querySelector(".verdict-meta");c&&(c.textContent=`Confidence: ${y}% | Threat Score: ${g}/100`);const h=u.querySelector(".ai-report");h&&(h.textContent=x);let f=u.querySelector(".threat-reasons");if(f)f.innerHTML="";else if(m.length>0){f=document.createElement("div"),f.className="threat-reasons";const o=u.querySelector(".shield-panel");o&&o.appendChild(f)}f&&m.length>0&&m.forEach(o=>{const s=document.createElement("div");s.className=`reason-item ${o.severity||"low"}`,s.textContent=`[${o.id}] ${o.description}`,f.appendChild(s)})}function $(e){C({status:"SUSPICIOUS",confidence:50,threatScore:0,aiExplanation:e,reasons:[]});const t=u==null?void 0:u.querySelector(".ai-report");t&&(t.innerHTML=`<span style="display:inline-block;animation:pulse 1.5s infinite;color:#6366f1;">${e}</span>`)}function z(){const e=document.createElement("canvas");e.style.position="fixed",e.style.top="0",e.style.left="0",e.style.width="100vw",e.style.height="100vh",e.style.zIndex="2147483646",e.style.cursor="crosshair",document.body.appendChild(e);const t=e.getContext("2d"),g=window.devicePixelRatio||1,y=window.innerWidth,x=window.innerHeight;e.width=y*g,e.height=x*g,t.scale(g,g);let m=!1,a=0,d=0,p=0,c=0;function h(o=0,s=0,n=0,i=0){if(t.clearRect(0,0,y,x),t.fillStyle="rgba(7, 5, 16, 0.65)",t.fillRect(0,0,y,x),n>0&&i>0){t.save(),t.globalCompositeOperation="destination-out",t.fillStyle="#000",t.fillRect(o,s,n,i),t.restore(),t.strokeStyle="#6366f1",t.lineWidth=2,t.setLineDash([6,4]),t.strokeRect(o,s,n,i),t.fillStyle="#6366f1",t.font="10px Space Grotesk, sans-serif";const r=`${Math.round(n)} x ${Math.round(i)}`,S=t.measureText(r).width,w=s-20>=0?s-20:s+i+5;t.fillRect(o,w,S+12,16),t.fillStyle="#ffffff",t.fillText(r,o+6,w+11)}}h(),e.addEventListener("mousedown",o=>{o.button===0&&(m=!0,a=o.clientX,d=o.clientY,p=a,c=d)}),e.addEventListener("mousemove",o=>{if(!m)return;p=o.clientX,c=o.clientY;const s=Math.min(a,p),n=Math.min(d,c),i=Math.abs(a-p),r=Math.abs(d-c);h(s,n,i,r)}),e.addEventListener("mouseup",()=>{if(!m)return;m=!1;const o=Math.min(a,p),s=Math.min(d,c),n=Math.abs(a-p),i=Math.abs(d-c);e.remove(),n>15&&i>15&&($("Capturing selected area and sending to AI backend..."),chrome.runtime.sendMessage({action:"analyzeRegion",coords:{x:o,y:s,width:n,height:i,dpr:g}},r=>{r&&!r.error?C(r):C({status:"SUSPICIOUS",confidence:50,threatScore:0,aiExplanation:(r==null?void 0:r.message)||"Failed to analyze selected region.",reasons:[]})}))});const f=o=>{o.key==="Escape"&&(e.remove(),document.removeEventListener("keydown",f))};document.addEventListener("keydown",f)}window.addEventListener("message",e=>{e.data&&e.data.type==="URL_SYSTEM_REGISTER_BACKEND"&&e.data.url&&chrome.runtime.sendMessage({action:"registerBackend",url:e.data.url},t=>{t&&t.success&&console.log("[URL SYSTEM SHIELD] Dynamic backend registered:",e.data.url)})})})()})();
