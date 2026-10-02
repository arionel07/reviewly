(function(){function e(e){let t=e.dataset.projectKey?.trim();if(!t)return null;let n;try{n=new URL(e.src).origin}catch{return null}return{projectKey:t,apiBaseUrl:n}}function t(e){if(e.currentScript&&e.currentScript.tagName===`SCRIPT`)return e.currentScript;let t=e.querySelectorAll(`script[data-project-key]`);return t.length>0?t[t.length-1]:null}var n=class extends Error{};async function r(e,t){let r=await fetch(`${e}/api/widget/projects/${encodeURIComponent(t)}`,{method:`GET`}),i=await r.json().catch(()=>null);if(!r.ok)throw new n(i?.error??`Could not load the Reviewly widget.`);return i.project}async function i(e,t){let r=await fetch(`${e}/api/widget/uploads`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(t)}),i=await r.json().catch(()=>null);if(!r.ok)throw new n(i?.error??`Could not prepare the screenshot upload.`);return i}async function a(e,t,n){let r=await fetch(e,{method:`PUT`,headers:{"Content-Type":n},body:t});if(!r.ok)throw Error(`Screenshot upload failed with status ${r.status}.`)}async function o(e,t){let r=await fetch(`${e}/api/widget/feedback`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(t)}),i=await r.json().catch(()=>null);if(!r.ok)throw new n(i?.error??`Could not send feedback. Please try again.`);return{feedbackId:i.feedbackId}}var s=1600,c=1200,l=.82,u=.92,d=null;function f(e=document){if(d!==null)return d;try{let t=e.createElement(`canvas`);t.width=1,t.height=1,d=t.toDataURL(`image/webp`).startsWith(`data:image/webp`)}catch{d=!1}return d}function p(e,t=s,n=c){if(e.width<=t&&e.height<=n)return e;let r=Math.min(t/e.width,n/e.height),i=e.ownerDocument.createElement(`canvas`);i.width=Math.max(1,Math.round(e.width*r)),i.height=Math.max(1,Math.round(e.height*r));let a=i.getContext(`2d`);return a?(a.drawImage(e,0,0,i.width,i.height),i):e}function m(e){let t=f(e.ownerDocument),n=t?`image/webp`:`image/png`,r=t?l:u;return new Promise((t,i)=>{e.toBlob(e=>{e?t({blob:e,contentType:n}):i(Error(`Canvas could not be encoded to an image.`))},n,r)})}var h=null;function g(e){return typeof window<`u`&&window.html2canvas?Promise.resolve(window.html2canvas):h||(h=new Promise((t,n)=>{let r=document.createElement(`script`);r.src=`${e}/widget/html2canvas.min.js`,r.async=!0,r.addEventListener(`load`,()=>{window.html2canvas?t(window.html2canvas):n(Error(`html2canvas did not initialize.`))}),r.addEventListener(`error`,()=>{n(Error(`Could not load the screenshot library.`))}),document.head.appendChild(r)}).catch(e=>{throw h=null,e}),h)}var _=`reviewly-screenshot-highlight`,v=class{constructor(e){this.scriptBaseUrl=e}async capture(e){let t=await g(this.scriptBaseUrl),n=e.highlightRect?this.createHighlightElement(e.highlightRect):null;n&&document.body.appendChild(n);try{return m(p(await t(document.documentElement,{x:e.scrollX,y:e.scrollY,width:e.viewportWidth,height:e.viewportHeight,windowWidth:document.documentElement.scrollWidth,windowHeight:document.documentElement.scrollHeight,scale:1,useCORS:!0,logging:!1,ignoreElements:t=>t===e.ignoreElement})))}finally{n?.remove()}}createHighlightElement(e){let t=document.createElement(`div`);return t.className=_,t.style.position=`fixed`,t.style.top=`${e.top}px`,t.style.left=`${e.left}px`,t.style.width=`${e.width}px`,t.style.height=`${e.height}px`,t.style.border=`2px solid #6366f1`,t.style.borderRadius=`2px`,t.style.boxShadow=`0 0 0 2px rgba(99, 102, 241, 0.35)`,t.style.pointerEvents=`none`,t.style.zIndex=`2147483647`,t.style.margin=`0`,t.style.padding=`0`,t.style.background=`transparent`,t}},y=5e3,b=500,x=500,S=500;function C(e){let t={projectKey:e.projectKey,message:e.message.trim().slice(0,y),pageUrl:e.pageUrl};return e.selector&&(t.selector=e.selector.slice(0,b)),e.elementText&&(t.elementText=e.elementText.slice(0,x)),e.screenshotKey&&(t.screenshotKey=e.screenshotKey),typeof e.viewportWidth==`number`&&(t.viewportWidth=Math.round(e.viewportWidth)),typeof e.viewportHeight==`number`&&(t.viewportHeight=Math.round(e.viewportHeight)),e.userAgent&&(t.userAgent=e.userAgent.slice(0,S)),t}var w=500;function T(e){return typeof CSS<`u`&&typeof CSS.escape==`function`?CSS.escape(e):e.replace(/([^a-zA-Z0-9_-])/g,`\\$1`)}function E(e,t){try{return t.querySelectorAll(e).length===1}catch{return!1}}function D(e){let t=Array.from(e.classList).filter(Boolean);return t.length===0?null:`${e.tagName.toLowerCase()}.${t.slice(0,2).map(T).join(`.`)}`}function O(e,t){let n=[],r=e;for(;r&&r!==t&&r.parentElement;){let e=r.parentElement,i=Array.from(e.children).indexOf(r)+1;n.unshift(`${r.tagName.toLowerCase()}:nth-child(${i})`);let a=n.join(` > `);if(E(a,t))return a.slice(0,w);r=e}return n.join(` > `).slice(0,w)}function k(e,t=document){if(e.id){let n=`#${T(e.id)}`;if(E(n,t))return n.slice(0,w)}let n=D(e);return n&&E(n,t)?n.slice(0,w):O(e,t)}var A=200;function j(e){return e.trim().replace(/\s+/g,` `)}function M(e,t=A){let n=j(e.textContent??``);if(n)return n.slice(0,t);if(e instanceof HTMLImageElement&&e.alt)return j(e.alt).slice(0,t);if(e instanceof HTMLInputElement){let n=e.placeholder||e.value||``;if(n)return j(n).slice(0,t)}let r=e.getAttribute(`aria-label`);return r?j(r).slice(0,t):``}var N=`
:host {
  all: initial;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color-scheme: light;
}

* {
  box-sizing: border-box;
}

.rw-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 2147483000;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 999px;
  background: #111827;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.rw-button:hover {
  background: #1f2937;
}

.rw-button[data-active="true"] {
  background: #dc2626;
}

.rw-overlay {
  position: fixed;
  z-index: 2147483001;
  pointer-events: none;
  border: 2px solid #2563eb;
  background: rgba(37, 99, 235, 0.12);
  border-radius: 4px;
  transition: all 60ms ease-out;
}

.rw-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2147483002;
  text-align: center;
  padding: 8px 16px;
  background: #111827;
  color: #ffffff;
  font-size: 13px;
}

.rw-composer-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2147483003;
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 24px;
}

@media (min-width: 640px) {
  .rw-composer-backdrop {
    align-items: center;
    justify-content: flex-end;
  }
}

.rw-composer {
  width: 100%;
  max-width: 360px;
  background: #ffffff;
  color: #111827;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rw-composer h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}

.rw-composer-target {
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  border-radius: 6px;
  padding: 6px 8px;
  overflow-wrap: anywhere;
}

.rw-composer-screenshot-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: #9ca3af;
}

.rw-composer-screenshot-status {
  font-size: 12px;
  color: #6b7280;
  margin-top: -6px;
}

.rw-composer-screenshot-status[data-state="captured"] {
  color: #047857;
}

.rw-composer-screenshot-status[data-state="unavailable"] {
  color: #9ca3af;
}

.rw-composer textarea {
  width: 100%;
  min-height: 80px;
  resize: vertical;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 14px;
  font-family: inherit;
  color: #111827;
}

.rw-composer textarea:focus {
  outline: 2px solid #2563eb;
  outline-offset: 1px;
}

.rw-composer-error {
  font-size: 12px;
  color: #dc2626;
}

.rw-composer-success {
  font-size: 13px;
  color: #047857;
  font-weight: 500;
}

.rw-composer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.rw-composer-actions button {
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
}

.rw-btn-secondary {
  background: #f3f4f6;
  color: #111827;
}

.rw-btn-secondary:hover {
  background: #e5e7eb;
}

.rw-btn-primary {
  background: #111827;
  color: #ffffff;
}

.rw-btn-primary:hover {
  background: #1f2937;
}

.rw-btn-primary:disabled,
.rw-btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.rw-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
`,P=`reviewly-widget`,F={idle:``,capturing:`Capturing…`,captured:`✓ Captured`,unavailable:`Screenshot unavailable — feedback can still be sent.`},I=class{constructor(e){this.config=null,this.host=null,this.shadow=null,this.buttonEl=null,this.overlayEl=null,this.composerBackdrop=null,this.inspecting=!1,this.selectedContext=null,this.composerState=`idle`,this.composerError=null,this.screenshotProvider=null,this.screenshotBlob=null,this.screenshotContentType=null,this.screenshotState=`idle`,this.screenshotStatusEl=null,this.projectKey=e.projectKey,this.apiBaseUrl=e.apiBaseUrl,this.handlePointerMove=this.handlePointerMove.bind(this),this.handleInspectClick=this.handleInspectClick.bind(this),this.handleKeyDown=this.handleKeyDown.bind(this),this.handleButtonClick=this.handleButtonClick.bind(this)}async init(){this.mountHost();try{this.config=await r(this.apiBaseUrl,this.projectKey)}catch(e){this.logDevError(`Reviewly widget: could not load project config`,e),this.destroy();return}this.renderButton()}mountHost(){let e=document.createElement(P);e.style.position=`fixed`,e.style.inset=`0`,e.style.width=`0`,e.style.height=`0`;let t=e.attachShadow({mode:`open`}),n=document.createElement(`style`);n.textContent=N,t.appendChild(n),document.body.appendChild(e),this.host=e,this.shadow=t}renderButton(){if(!this.shadow)return;let e=document.createElement(`button`);e.type=`button`,e.className=`rw-button`,e.textContent=`Feedback`,e.setAttribute(`aria-pressed`,`false`),e.addEventListener(`click`,this.handleButtonClick),this.shadow.appendChild(e),this.buttonEl=e}handleButtonClick(){this.inspecting?this.disableInspectMode():this.enableInspectMode()}enableInspectMode(){if(this.inspecting||!this.shadow)return;this.inspecting=!0,this.buttonEl&&(this.buttonEl.dataset.active=`true`,this.buttonEl.textContent=`Cancel`,this.buttonEl.setAttribute(`aria-pressed`,`true`));let e=document.createElement(`div`);e.className=`rw-overlay`,e.style.display=`none`,this.shadow.appendChild(e),this.overlayEl=e,document.addEventListener(`pointermove`,this.handlePointerMove,!0),document.addEventListener(`click`,this.handleInspectClick,!0),document.addEventListener(`keydown`,this.handleKeyDown,!0)}disableInspectMode(){this.inspecting&&(this.inspecting=!1,document.removeEventListener(`pointermove`,this.handlePointerMove,!0),document.removeEventListener(`click`,this.handleInspectClick,!0),document.removeEventListener(`keydown`,this.handleKeyDown,!0),this.overlayEl?.remove(),this.overlayEl=null,this.buttonEl&&(this.buttonEl.dataset.active=`false`,this.buttonEl.textContent=`Feedback`,this.buttonEl.setAttribute(`aria-pressed`,`false`)))}isWidgetElement(e){return e instanceof Node&&e===this.host}handlePointerMove(e){if(!this.overlayEl)return;let t=document.elementFromPoint(e.clientX,e.clientY);if(!t||this.isWidgetElement(t)||t===document.documentElement){this.overlayEl.style.display=`none`;return}let n=t.getBoundingClientRect();this.overlayEl.style.display=`block`,this.overlayEl.style.top=`${n.top}px`,this.overlayEl.style.left=`${n.left}px`,this.overlayEl.style.width=`${n.width}px`,this.overlayEl.style.height=`${n.height}px`}handleInspectClick(e){let t=document.elementFromPoint(e.clientX,e.clientY);t&&!this.isWidgetElement(t)&&(e.preventDefault(),e.stopPropagation(),this.selectElement(t))}handleKeyDown(e){e.key===`Escape`&&(this.composerBackdrop?this.closeComposer():this.disableInspectMode())}selectElement(e){let t=e.getBoundingClientRect();this.selectedContext={selector:k(e,document),elementText:M(e),rect:t},this.screenshotBlob=null,this.screenshotContentType=null,this.screenshotState=`idle`,this.disableInspectMode(),this.openComposer(),this.captureScreenshot()}async captureScreenshot(){if(this.selectedContext&&this.host){this.screenshotState=`capturing`,this.updateScreenshotStatusUI();try{this.screenshotProvider??=new v(this.apiBaseUrl);let e=this.selectedContext.rect,t=await this.screenshotProvider.capture({ignoreElement:this.host,highlightRect:{top:e.top,left:e.left,width:e.width,height:e.height},viewportWidth:window.innerWidth,viewportHeight:window.innerHeight,scrollX:window.scrollX,scrollY:window.scrollY});this.screenshotBlob=t.blob,this.screenshotContentType=t.contentType,this.screenshotState=`captured`}catch(e){this.logDevError(`Reviewly widget: screenshot capture failed`,e),this.screenshotBlob=null,this.screenshotContentType=null,this.screenshotState=`unavailable`}this.updateScreenshotStatusUI()}}updateScreenshotStatusUI(){this.screenshotStatusEl&&(this.screenshotStatusEl.textContent=F[this.screenshotState],this.screenshotStatusEl.dataset.state=this.screenshotState)}openComposer(){this.shadow&&!this.composerBackdrop&&(this.composerState=`idle`,this.composerError=null,this.renderComposer())}closeComposer(){this.composerBackdrop?.remove(),this.composerBackdrop=null,this.selectedContext=null,this.composerState=`idle`,this.composerError=null,this.screenshotBlob=null,this.screenshotContentType=null,this.screenshotState=`idle`,this.screenshotStatusEl=null}renderComposer(){if(!this.shadow)return;this.composerBackdrop?.remove();let e=document.createElement(`div`);e.className=`rw-composer-backdrop`,e.addEventListener(`click`,t=>{t.target===e&&this.closeComposer()});let t=document.createElement(`div`);t.className=`rw-composer`;let n=document.createElement(`h2`);if(n.textContent=`Leave feedback`,t.appendChild(n),this.selectedContext?.selector){let e=document.createElement(`div`);e.className=`rw-composer-target`,e.textContent=`Selected: ${this.selectedContext.selector}`,t.appendChild(e)}let r=document.createElement(`div`);r.className=`rw-composer-screenshot-label`,r.textContent=`Screenshot`,t.appendChild(r);let i=document.createElement(`div`);i.className=`rw-composer-screenshot-status`,t.appendChild(i),this.screenshotStatusEl=i,this.updateScreenshotStatusUI();let a=`rw-composer-message`,o=document.createElement(`label`);o.className=`rw-sr-only`,o.setAttribute(`for`,a),o.textContent=`Your feedback`,t.appendChild(o);let s=document.createElement(`textarea`);s.id=a,s.placeholder=`What should change here?`,t.appendChild(s);let c=document.createElement(`div`);t.appendChild(c);let l=document.createElement(`div`);l.className=`rw-composer-actions`;let u=document.createElement(`button`);u.type=`button`,u.className=`rw-btn-secondary`,u.textContent=`Cancel`,u.addEventListener(`click`,()=>this.closeComposer());let d=document.createElement(`button`);d.type=`button`,d.className=`rw-btn-primary`,d.textContent=`Send`,d.addEventListener(`click`,()=>{this.handleSubmit(s.value,{sendButton:d,cancelButton:u,textarea:s,statusEl:c})}),l.appendChild(u),l.appendChild(d),t.appendChild(l),e.appendChild(t),this.shadow.appendChild(e),this.composerBackdrop=e,s.focus()}async handleSubmit(e,t){let r=e.trim();if(!r){this.renderComposerStatus(t.statusEl,`error`,`Enter some feedback first.`);return}t.sendButton.disabled=!0,t.cancelButton.disabled=!0,t.textarea.disabled=!0,this.renderComposerStatus(t.statusEl,`pending`,`Sending…`);try{await this.submitFeedback(r),this.renderComposerStatus(t.statusEl,`success`,`Feedback sent`),window.setTimeout(()=>this.closeComposer(),1200)}catch(e){this.logDevError(`Reviewly widget: failed to submit feedback`,e);let r=e instanceof n?e.message:`Could not send feedback. Please try again.`;this.renderComposerStatus(t.statusEl,`error`,r),t.sendButton.disabled=!1,t.cancelButton.disabled=!1,t.textarea.disabled=!1}}renderComposerStatus(e,t,n){this.composerState=t,e.textContent=n,e.className=t===`error`?`rw-composer-error`:t===`success`?`rw-composer-success`:``}async submitFeedback(e){let t=await this.uploadCapturedScreenshot(),n=C({projectKey:this.projectKey,message:e,pageUrl:window.location.href,selector:this.selectedContext?.selector,elementText:this.selectedContext?.elementText,screenshotKey:t,viewportWidth:window.innerWidth,viewportHeight:window.innerHeight,userAgent:navigator.userAgent});await o(this.apiBaseUrl,n)}async uploadCapturedScreenshot(){if(this.screenshotBlob&&this.screenshotContentType)try{let e=await i(this.apiBaseUrl,{projectKey:this.projectKey,contentType:this.screenshotContentType,fileSize:this.screenshotBlob.size});return await a(e.uploadUrl,this.screenshotBlob,e.contentType),e.objectKey}catch(e){this.logDevError(`Reviewly widget: screenshot upload failed; submitting feedback without it`,e);return}}logDevError(e,t){typeof console<`u`&&console.warn(e,t)}destroy(){this.disableInspectMode(),this.closeComposer(),this.host?.remove(),this.host=null,this.shadow=null,this.buttonEl=null}};function L(){if(window.__reviewlyWidgetLoaded||document.querySelector(`reviewly-widget`))return;let n=t(document);if(!n){console.warn(`Reviewly widget: could not find its own <script> tag.`);return}let r=e(n);if(!r){console.warn(`Reviewly widget: missing data-project-key on the embed <script> tag.`);return}window.__reviewlyWidgetLoaded=!0,new I(r).init()}try{L()}catch(e){console.warn(`Reviewly widget: failed to initialize.`,e)}})();