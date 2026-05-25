(function(){"use strict";(async()=>{const M=window.location.href;if(!M.startsWith("http"))return;let T=null,i=null;chrome.runtime.onMessage.addListener((e,t,m)=>{e.action==="startAreaSelection"&&H()}),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",N):N();function N(){chrome.runtime.sendMessage({action:"scanUrl",url:M},e=>{if(!e||e.error||e.status==="INVALID"){console.log("[URL SYSTEM SHIELD] Skipping indicator injection for internal or invalid URL.");return}U(e)})}function U(e){const t=e.status,m=e.threatScore!==void 0?e.threatScore:0,v=e.confidence||0,b=e.reasons||[],u=e.aiExplanation||"No report explanation available.",s=document.createElement("div");s.id="url-system-shield-host",s.style.position="fixed",s.style.top="16px",s.style.right="16px",s.style.zIndex="2147483647",s.style.fontFamily="'Outfit', sans-serif",document.body.appendChild(s),T=s;const p=s.attachShadow({mode:"closed"});i=p;const h=document.createElement("style");h.textContent=`
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
    `;const d=document.createElement("div");d.className="shield-container";const f=document.createElement("div");f.className=`shield-badge ${t.toLowerCase()}`;const g=document.createElement("span");g.className=`shield-dot ${t.toLowerCase()}`;const n=document.createElement("span");n.className="shield-label",n.textContent=t==="MALICIOUS"?"PHISHING RISK":`${t} SITE`;const o=document.createElement("span");o.className="shield-close",o.innerHTML="&times;",o.title="Dismiss Shield",f.appendChild(g),f.appendChild(n),f.appendChild(o);const a=document.createElement("div");a.className="shield-panel";const r=document.createElement("div");r.className="panel-header";const l=document.createElement("div");l.className="panel-title",l.textContent="URL SYSTEM Core Report";const w=document.createElement("button");w.className="panel-close-btn",w.innerHTML="&times;",r.appendChild(l),r.appendChild(w);const y=document.createElement("div");y.className="verdict-box";const C=document.createElement("div");C.className=`verdict-tag ${t.toLowerCase()}`,C.textContent=t==="MALICIOUS"?"PHISHING DETECTED":t==="SUSPICIOUS"?"SUSPICIOUS WEB":"VERIFIED SAFE";const I=document.createElement("div");I.className="verdict-meta",I.textContent=`Confidence: ${v}% | Threat Score: ${m}/100`,y.appendChild(C),y.appendChild(I);const L=document.createElement("div");if(L.className="ai-report",L.textContent=u,a.appendChild(r),a.appendChild(y),a.appendChild(L),b.length>0){const c=document.createElement("div");c.className="threat-reasons",b.forEach(S=>{const x=document.createElement("div");x.className=`reason-item ${S.severity||"low"}`,x.textContent=`[${S.id}] ${S.description}`,c.appendChild(x)}),a.appendChild(c)}d.appendChild(f),d.appendChild(a),p.appendChild(h),p.appendChild(d),f.addEventListener("click",c=>{if(c.target.classList.contains("shield-close")){c.stopPropagation(),s.remove();return}a.classList.contains("open")?(a.classList.remove("open"),setTimeout(()=>{a.style.display="none"},400)):(a.style.display="flex",setTimeout(()=>{a.classList.add("open")},20))}),w.addEventListener("click",c=>{c.stopPropagation(),a.classList.remove("open"),setTimeout(()=>{a.style.display="none"},400)});let k=!1,R=0,$=16;f.addEventListener("mousedown",c=>{c.button!==0||c.target.classList.contains("shield-close")||(k=!0,R=c.clientY,$=parseInt(s.style.top||"16",10),c.preventDefault())}),document.addEventListener("mousemove",c=>{if(!k)return;const S=c.clientY-R;let x=$+S;x=Math.max(10,Math.min(x,window.innerHeight-80)),s.style.top=`${x}px`}),document.addEventListener("mouseup",()=>{k=!1})}function E(e){if(!T||!i){U(e);const o=i==null?void 0:i.querySelector(".shield-panel");o&&(o.style.display="flex",setTimeout(()=>o.classList.add("open"),20));return}const t=e.status||"SAFE",m=e.threatScore!==void 0?e.threatScore:0,v=e.confidence||0,b=e.aiExplanation||"No report explanation available.",u=e.reasons||[],s=i.querySelector(".shield-badge");if(s){s.className=`shield-badge ${t.toLowerCase()}`;const o=s.querySelector(".shield-label");o&&(o.textContent=t==="MALICIOUS"?"PHISHING RISK":`${t} SITE`)}const p=i.querySelector(".shield-dot");p&&(p.className=`shield-dot ${t.toLowerCase()}`);const h=i.querySelector(".verdict-tag");h&&(h.className=`verdict-tag ${t.toLowerCase()}`,h.textContent=t==="MALICIOUS"?"PHISHING DETECTED":t==="SUSPICIOUS"?"SUSPICIOUS WEB":"VERIFIED SAFE");const d=i.querySelector(".verdict-meta");d&&(d.textContent=`Confidence: ${v}% | Threat Score: ${m}/100`);const f=i.querySelector(".ai-report");f&&(f.textContent=b);let g=i.querySelector(".threat-reasons");if(g)g.innerHTML="";else if(u.length>0){g=document.createElement("div"),g.className="threat-reasons";const o=i.querySelector(".shield-panel");o&&o.appendChild(g)}g&&u.length>0&&u.forEach(o=>{const a=document.createElement("div");a.className=`reason-item ${o.severity||"low"}`,a.textContent=`[${o.id}] ${o.description}`,g.appendChild(a)});const n=i.querySelector(".shield-panel");n&&(n.style.display="flex",setTimeout(()=>n.classList.add("open"),20))}function D(e){E({status:"SUSPICIOUS",confidence:50,threatScore:0,aiExplanation:e,reasons:[]});const t=i==null?void 0:i.querySelector(".ai-report");t&&(t.innerHTML=`<span style="display:inline-block;animation:pulse 1.5s infinite;color:#6366f1;">${e}</span>`)}function H(){const e=document.createElement("canvas");e.style.position="fixed",e.style.top="0",e.style.left="0",e.style.width="100vw",e.style.height="100vh",e.style.zIndex="2147483646",e.style.cursor="crosshair",document.body.appendChild(e);const t=e.getContext("2d"),m=window.devicePixelRatio||1,v=window.innerWidth,b=window.innerHeight;e.width=v*m,e.height=b*m,t.scale(m,m);let u=!1,s=0,p=0,h=0,d=0;function f(n=0,o=0,a=0,r=0){if(t.clearRect(0,0,v,b),t.fillStyle="rgba(7, 5, 16, 0.65)",t.fillRect(0,0,v,b),a>0&&r>0){t.save(),t.globalCompositeOperation="destination-out",t.fillStyle="#000",t.fillRect(n,o,a,r),t.restore(),t.strokeStyle="#6366f1",t.lineWidth=2,t.setLineDash([6,4]),t.strokeRect(n,o,a,r),t.fillStyle="#6366f1",t.font="10px Space Grotesk, sans-serif";const l=`${Math.round(a)} x ${Math.round(r)}`,w=t.measureText(l).width,y=o-20>=0?o-20:o+r+5;t.fillRect(n,y,w+12,16),t.fillStyle="#ffffff",t.fillText(l,n+6,y+11)}}f(),e.addEventListener("mousedown",n=>{n.button===0&&(u=!0,s=n.clientX,p=n.clientY,h=s,d=p)}),e.addEventListener("mousemove",n=>{if(!u)return;h=n.clientX,d=n.clientY;const o=Math.min(s,h),a=Math.min(p,d),r=Math.abs(s-h),l=Math.abs(p-d);f(o,a,r,l)}),e.addEventListener("mouseup",()=>{if(!u)return;u=!1;const n=Math.min(s,h),o=Math.min(p,d),a=Math.abs(s-h),r=Math.abs(p-d);e.remove(),a>15&&r>15&&(D("Capturing selected area and sending to AI backend..."),chrome.runtime.sendMessage({action:"analyzeRegion",coords:{x:n,y:o,width:a,height:r,dpr:m}},l=>{l&&!l.error?E(l):E({status:"SUSPICIOUS",confidence:50,threatScore:0,aiExplanation:(l==null?void 0:l.message)||"Failed to analyze selected region.",reasons:[]})}))});const g=n=>{n.key==="Escape"&&(e.remove(),document.removeEventListener("keydown",g))};document.addEventListener("keydown",g)}window.addEventListener("message",e=>{e.data&&e.data.type==="URL_SYSTEM_REGISTER_BACKEND"&&e.data.url&&chrome.runtime.sendMessage({action:"registerBackend",url:e.data.url},t=>{t&&t.success&&console.log("[URL SYSTEM SHIELD] Dynamic backend registered:",e.data.url)})})})()})();
