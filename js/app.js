'use strict';
/* DEAD SIGNAL — vanilla JS. Sections: store, content, ui helpers, windows, apps, puzzles, final/endings.
   PHP hooks: API.session (login), API.content (override CONTENT), API.save (progress). All fail soft. */
const API={session:'api/session.php',content:'api/content.php',save:'api/progress.php'};
const $=(s,r=document)=>r.querySelector(s);
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const S=JSON.parse(localStorage.getItem('ds')||'null')||{t0:Date.now(),solved:{},ev:[],hints:0,hl:{},flags:{},notes:[],lore:0};
const save=()=>{localStorage.setItem('ds',JSON.stringify(S));const i=$('#saveind');i.textContent='◌ saving';
 fetch(API.save,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(S)}).catch(()=>{}).finally(()=>setTimeout(()=>i.textContent='● saved',400))};
const CONTENT={
 msgs:[{w:'dev',t:'03.17 00:09',x:'You still have the key?'},{w:'mira',t:'03.17 00:1▒',x:'Yes. They know about the archive, Dev.'},{w:'gap',x:'▒▒▒▒ 14 messages missing ▒▒▒▒'},{w:'dev',t:'??.?? ??:??',x:'Not on this line. Use what we agreed.'}],
 cipher:'PHHW PH DW PLGQLJKW',plain:'MEET ME AT MIDNIGHT',
 mail:[
  {id:1,f:'inbox',from:'NEXUS-7 Admin <no-reply@nexus7.int>',s:'Scheduled wipe: 03.18',warn:'Sender domain does not match registry. Header tampered.',b:'All local archives are flagged for ▒▒▒▒. Compliance wipe runs at 00:17.',m:['Received 03.17 23:02','Route: 3 hops, 1 unlisted']},
  {id:2,f:'inbox',from:'Dev Rao <dev@halden-sec.example>',s:'Don\'t use the office net',b:'Whatever you found, keep it off the office network. Meet me when you can. If I don\'t answer, assume I\'m watched.',m:['Received 03.16 21:40','Attachment: none']},
  {id:3,f:'sent',from:'To: myself',s:'Notes: Halden Group',b:'Their "wellness" app logs location, voice and contacts. 4.1M profiles, all sold on. Files are in PROJECT_██.',att:'PROJECT_██.txt (locked)',m:['Sent 03.15 02:12']},
  {id:4,f:'drafts',from:'To: press@▒▒▒▒',s:'DRAFT — never sent',b:'If they reach me first, the message is in the encrypted file. The password is what the night loses to. Four letters. Count the static.',m:['Autosaved 03.17 00:15']},
  {id:5,f:'archived',from:'HR <hr@halden.example>',s:'Offboarding: M. Sen',b:'Your access ends Friday. Please return all devices. Please do not copy any research material.',m:['Received 02.28']},
  {id:6,f:'inbox',from:'Mira Sen <me@nexus7.int>',s:'Re: the recording',key:1,b:'The recording is named by date: AUD_MMDD.wav. I saved it the night of the login, month first. The cache ate one digit.',m:['Received 03.17 00:14','Metadata: restored']}
 ],
 hints:{login:['Look at the sticky note on the login screen.','The note gives a date. The password has no slashes.','Type 0317.'],caesar:['Open Messages. One line is scrambled.','It is a Caesar cipher. Use the shift slider.','Shift 3 reveals the message.'],file:['Open Email and read the newest message.','The recording file is named by date. The missing digit is the month\'s second digit.','AUD_0317.wav: pick 3.'],audio:['Open Audio Player and let it play for a while.','Watch the spectrum. Four bars rise from the static, one at a time.','Bars 4, 1, 23, 14. Check the Notes cipher index.'],term:['Open Terminal and type help.','Recover the file from the Recycle Bin first, then run recover final_message.enc.','4 1 23 14 spells DAWN with A=1.']}
};
const ICON=c=>`<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="3" y="3" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 11h34" stroke="currentColor"/><text x="20" y="29" text-anchor="middle" font-size="10" fill="currentColor" font-family="monospace">${c}</text></svg>`;
const screen=id=>{document.querySelectorAll('.scr').forEach(s=>s.hidden=s.id!==id)};
const rm=()=>document.body.classList.contains('rm')||matchMedia('(prefers-reduced-motion:reduce)').matches;
const pulse=()=>{if(rm())return;document.body.classList.add('pulse');setTimeout(()=>document.body.classList.remove('pulse'),1000)};
const notify=m=>{S.notes.push(m);const t=el('div','toast',m);$('#toasts').append(t);setTimeout(()=>t.remove(),5000);$('#bell').classList.add('lit');$('#belln').textContent=S.notes.length;save()};
const modal=(t,h)=>{$('#mt').textContent=t;$('#mb').innerHTML=h;$('#modal').showModal()};
const EVN=['Messages decoded','Recording name rebuilt','Recording recovered','Hidden sequence','Message file restored','Final message'];
const ev=k=>{if(S.ev.includes(k))return;S.ev.push(k);$('#evc').textContent=`Evidence ${S.ev.length}/6`;save()};
const caesar=(s,k)=>s.replace(/[A-Z]/g,c=>String.fromCharCode((c.charCodeAt(0)-65-k+26)%26+65));
const stage=()=>!S.solved.login?'login':!S.solved.caesar?'caesar':!S.solved.file?'file':!S.solved.audio?'audio':'term';
/* ---- boot ---- */
const BOOT=[['NEXUS-7 firmware 4.2.1  (c) 1998',''],['MEM CHECK 640K ........ OK',''],['MEM CHECK 3584K ....... ▒▒▒▒ FAULT @0x00A1F','warn'],['VOL /dsk0 mounted read-only',''],['Previous shutdown was unexpected','warn'],['clock: 00:17 — HALTED',''],['UNAUTHORIZED RECOVERY DETECTED','bad'],['Continuing in degraded mode','']];
let bootTimer,bootDone=false;
function boot(){screen('boot');const ul=$('#bootlog');let i=0;
 const next=()=>{if(i>=BOOT.length){setTimeout(toLogin,rm()?600:900);return}const [t,c]=BOOT[i++];ul.append(el('li',c,t));bootTimer=setTimeout(next,rm()?0:(c==='bad'?750:380))};
 next();$('#bootskip').onclick=toLogin}
function toLogin(){if(bootDone)return;bootDone=true;clearTimeout(bootTimer);if(S.solved.login)return toDesktop();screen('login');$('#pw').focus()}
$('#loginform').addEventListener('submit',async e=>{e.preventDefault();const m=$('#pwmsg'),v=$('#pw').value.replace(/\D/g,'');
 let ok=v==='0317';try{const r=await fetch(API.session,{method:'POST',body:new FormData(e.target)});if(r.ok){const j=await r.json();if('ok' in j)ok=j.ok}}catch{}
 if(ok){m.className='ok';m.textContent='✓ Profile unlocked. Loading desktop…';S.solved.login=1;save();setTimeout(toDesktop,rm()?100:900)}
 else{m.className='err';m.textContent='✕ Incorrect password. Check the note on the screen.';if(!rm())$('.loginbox').classList.add('shake');setTimeout(()=>$('.loginbox').classList.remove('shake'),700)}});
/* ---- windows ---- */
const mobile=()=>matchMedia('(max-width:760px)').matches;
const WM={z:10,w:{},n:0};
const APPS={
 msg:{t:'Messages',c:'MSG',b:buildMsg},mail:{t:'Email',c:'@',b:buildMail},files:{t:'File Explorer',c:'DIR',b:b=>buildFiles(b,'files')},
 notes:{t:'Notes',c:'TXT',b:buildNotes},audio:{t:'Audio Player',c:'WAV',b:buildAudio},bin:{t:'Recycle Bin',c:'BIN',b:b=>buildFiles(b,'bin')},term:{t:'Terminal',c:'>_',b:buildTerm}};
function open(id){let w=WM.w[id];if(w){w.el.classList.remove('min');return focus(id)}
 const a=APPS[id],e=el('section','win');e.setAttribute('role','dialog');e.setAttribute('aria-label',a.t);
 e.innerHTML=`<div class="wh" tabindex="0" aria-label="${a.t} title bar. Arrow keys move, Escape minimizes."><button class="back" aria-label="Back to desktop">‹</button><h2>${a.t}</h2><button class="mm" aria-label="Minimize">_</button><button class="mm" aria-label="Maximize">□</button><button aria-label="Close">×</button></div><div class="wb"></div>`;
 e.style.cssText=`left:${90+WM.n*28%140}px;top:${20+WM.n*28%120}px;width:min(620px,70vw);height:min(460px,70vh)`;WM.n++;
 const bs=e.querySelectorAll('button');bs[0].onclick=()=>minimize(id);bs[1].onclick=()=>minimize(id);bs[2].onclick=()=>e.classList.toggle('max');bs[3].onclick=()=>close(id);
 const h=$('.wh',e);h.addEventListener('keydown',k=>{const d={ArrowLeft:[-16,0],ArrowRight:[16,0],ArrowUp:[0,-16],ArrowDown:[0,16]}[k.key];if(d&&!mobile()){e.style.left=e.offsetLeft+d[0]+'px';e.style.top=e.offsetTop+d[1]+'px';k.preventDefault()}if(k.key==='Escape')minimize(id)});
 h.addEventListener('pointerdown',p=>{if(p.target.closest('button')||mobile()||e.classList.contains('max'))return;const ox=p.clientX-e.offsetLeft,oy=p.clientY-e.offsetTop;h.setPointerCapture(p.pointerId);
  const mv=q=>{e.style.left=Math.max(0,q.clientX-ox)+'px';e.style.top=Math.max(0,q.clientY-oy)+'px'};h.addEventListener('pointermove',mv);h.addEventListener('pointerup',()=>h.removeEventListener('pointermove',mv),{once:true})});
 e.addEventListener('pointerdown',()=>focus(id));$('#wins').append(e);WM.w[id]={el:e};a.b($('.wb',e),e);focus(id);tb()}
function focus(id){Object.entries(WM.w).forEach(([k,w])=>w.el.classList.toggle('act',k===id));const e=WM.w[id].el;e.style.zIndex=++WM.z;e.classList.remove('min');e.querySelector('.wh').focus({preventScroll:true});tb()}
function minimize(id){WM.w[id].el.classList.add('min');WM.w[id].el.classList.remove('act');tb();$('#desktop').focus()}
function close(id){const w=WM.w[id];w.el.style.opacity=0;setTimeout(()=>w.el.remove(),rm()?0:150);delete WM.w[id];if(id==='audio')audioStop();tb();$('#desktop').focus()}
function tb(){const c=$('#tbapps');c.innerHTML='';Object.keys(WM.w).forEach(id=>{const w=WM.w[id].el,b=el('button','',APPS[id].t);b.setAttribute('aria-pressed',w.classList.contains('act')&&!w.classList.contains('min'));b.onclick=()=>w.classList.contains('act')&&!w.classList.contains('min')?minimize(id):open(id);c.append(b)})}
function toDesktop(){screen('desktop');$('#desktop').dataset.noise='7F A3 00 1C 9E 44 B1 D2 00 17 FF 3A 5C 08 E1 90 '.repeat(160);
 const ul=$('#icons');if(!ul.children.length)Object.keys(APPS).forEach(id=>{const li=el('li'),b=el('button','',ICON(APPS[id].c)+APPS[id].t);b.dataset.id=id;if(id==='bin')b.classList.add('gl');
  if(id==='msg'&&!S.flags.msg)b.append(el('span','badge','1'));if(id==='mail'&&S.solved.caesar&&!S.flags.mail)b.append(el('span','badge','1'));b.onclick=()=>{open(id);if(id==='msg'||id==='mail'){S.flags[id]=1;b.querySelector('.badge')?.remove()}};li.append(b);ul.append(li)});
 $('#evc').textContent=`Evidence ${S.ev.length}/6`;$('#belln').textContent=S.notes.length;
 setInterval(()=>{const s=Math.floor((Date.now()-S.t0)/1000);$('#timer').textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')},1000);
 if(!S.flags.welcome){S.flags.welcome=1;setTimeout(()=>notify('1 new message on the recovered drive'),1200)}}
/* ---- messages ---- */
function buildMsg(b){let sh=0;b.innerHTML=`<p class="warn">⚠ Transmission interrupted — 14 blocks unrecoverable</p><div class="thread" role="log" aria-label="Chat with Dev Rao"></div><div id="typ" class="muted mono" role="status"></div><div class="dec"><label for="shift">Caesar shift: <output id="sv">0</output></label><input id="shift" type="range" min="0" max="25" value="0"><p class="mono" id="dout" role="status"></p></div>`;
 const th=$('.thread',b);
 const draw=()=>{th.innerHTML='';CONTENT.msgs.forEach(m=>th.append(m.w==='gap'?el('div','gap',m.x):el('div','m '+m.w,`<small>${m.t}</small>${m.x}`)));
  const out=S.solved.caesar?CONTENT.plain:caesar(CONTENT.cipher,sh);th.append(el('div','m mira enc',`<small>03.17 00:16 · ${S.solved.caesar?'decoded':'encrypted'}</small>${out}`));$('#dout').textContent=out===CONTENT.plain?'✓ Signal clean: '+out:'Output: '+out};
 draw();$('#shift').oninput=e=>{sh=+e.target.value;$('#sv').textContent=sh;if(caesar(CONTENT.cipher,sh)===CONTENT.plain&&!S.solved.caesar){S.solved.caesar=1;ev('caesar');pulse();notify('New email recovered: Re: the recording');const mb=$('[data-id=mail]');if(mb&&!mb.querySelector('.badge'))mb.append(el('span','badge','1'))}draw()};
 if(!S.solved.caesar)setTimeout(()=>{const t=$('#typ');if(!t)return;t.textContent='Dev is typing…';setTimeout(()=>{t.textContent=''},3500)},4000)}
/* ---- email ---- */
function buildMail(b){let folder='inbox',q='';b.innerHTML=`<div class="tabs" role="tablist"></div><label class="meta" for="q">Search</label> <input id="q" type="search" aria-label="Search mail"><ul class="elist"></ul><article class="pane" aria-live="polite">Select a message.</article>`;
 const draw=()=>{const tabs=$('.tabs',b);tabs.innerHTML='';['inbox','sent','drafts','archived'].forEach(f=>{const x=el('button','',f);x.setAttribute('role','tab');x.setAttribute('aria-selected',f===folder);x.onclick=()=>{folder=f;draw()};tabs.append(x)});
  const ul=$('.elist',b);ul.innerHTML='';CONTENT.mail.filter(m=>m.f===folder&&(!m.key||S.solved.caesar)&&(m.s+m.b+m.from).toLowerCase().includes(q)).forEach(m=>{const li=el('li'),x=el('button','',`${S.flags['s'+m.id]?'★ ':''}<b>${m.s}</b><br><span class="meta">${m.from}</span>`);x.onclick=()=>show(m);li.append(x);ul.append(li)});if(!ul.children.length)ul.append(el('li','muted','No messages.'))};
 const show=m=>{$('.pane',b).innerHTML=`<h3>${m.s}</h3>${m.warn?`<p class="warn">⚠ ${m.warn}</p>`:''}<p>${m.b}</p>${m.att?`<p class="meta">📎 ${m.att}</p>`:''}<p class="meta">${m.m.join(' · ')}</p><button class="btn" id="star">${S.flags['s'+m.id]?'★ Starred':'☆ Star as evidence'}</button>`;
  $('#star',b).onclick=()=>{S.flags['s'+m.id]=!S.flags['s'+m.id];save();show(m);draw()};if(m.key){ev('mailkey');}};
 $('#q',b).oninput=e=>{q=e.target.value.toLowerCase();draw()};draw()}
/* ---- files / bin ---- */
function buildFiles(b,tab){b.innerHTML='<div class="tabs" role="tablist"></div><div id="fl"></div><p id="fmsg" class="mono" role="status"></p>';
 const draw=()=>{const t=$('.tabs',b);t.innerHTML='';[['files','/Research'],['bin','Recycle Bin']].forEach(([k,n])=>{const x=el('button','',n);x.setAttribute('role','tab');x.setAttribute('aria-selected',k===tab);x.onclick=()=>{tab=k;draw()};t.append(x)});const f=$('#fl',b);f.innerHTML='';
  if(tab==='files'){
   f.append(el('div','frow',`DIR · notes_old.txt · mod 02.11 · <button>Open</button>`));
   const r=el('div','frow',S.solved.file?`WAV · AUD_0317.wav · mod 03.17 00:17 · ◆ evidence · <button id="op">Open in Audio Player</button>`:`WAV · AUD_0<button id="qm" aria-label="Missing character, select to reconstruct">?</button>17.wav · LOCKED · corrupted`);f.append(r);
   f.append(el('div','frow','TXT · PROJECT_██.txt · LOCKED · clearance NX-4'));
   const lore=el('div','frow',`TXT · README_IF_FOUND.txt · <button>Read</button>`);lore.querySelector('button').onclick=()=>{if(!S.lore){S.lore=1;save()}modal('README_IF_FOUND.txt','If you can read this, the drive survived. Halden calls it "retention analytics". I call it a ledger of people who never agreed. — M.')};f.append(lore);
   const qm=$('#qm',b);if(qm)qm.onclick=()=>{f.append(el('div','frow',`<label for="dg">Missing character:</label><select id="dg">${[...Array(10).keys()].map(n=>`<option>${n}</option>`).join('')}</select><button id="tr">Reconstruct</button>`));$('#dg',b).focus();
    $('#tr',b).onclick=()=>{if($('#dg',b).value==='3'){S.solved.file=1;ev('file');pulse();notify('Recovered: AUD_0317.wav');draw()}else{const m=$('#fmsg',b);m.className='mono err';m.textContent='✕ Header mismatch. File stays corrupted.'}}};
   const op=$('#op',b);if(op)op.onclick=()=>open('audio');
  }else{const r=el('div','frow',S.flags.enc?'ENC · FINAL_MESSAGE.enc · restored · ◆ evidence':`ENC · FINAL_MESS██E.enc · deleted 03.17 00:17 · <button id="rc">Recover</button>`);f.append(r);
   const rc=$('#rc',b);if(rc)rc.onclick=()=>{rc.disabled=true;let p=0;const m=$('#fmsg',b);const iv=setInterval(()=>{p+=rm()?100:10;m.className='mono';m.textContent=`Recovering… ${p}%`;if(p>=100){clearInterval(iv);S.flags.enc=1;ev('enc');pulse();notify('Restored FINAL_MESSAGE.enc (locked)');draw()}},200)}}};draw()}
/* ---- notes ---- */
function buildNotes(b){b.innerHTML=`<h3>Field log</h3><p>03.14 — Halden's data pipeline is not a leak. It is the product.</p><h3>Cipher index</h3><p class="mono">Count the alphabet from 1. A=1, B=2, C=3 …</p><h3>Reminder</h3><p>If I vanish, the message opens at the hour the night gives way. I put the recording in a file named after the date.</p>`}
/* ---- audio ---- */
let A={ctx:0,t:0,iv:0,playing:false,gain:0,mute:false,src:0};
const audioStop=()=>{clearInterval(A.iv);A.playing=false;try{A.src&&A.src.stop()}catch{}A.src=0};
function buildAudio(b){if(!S.solved.file){b.innerHTML='<p class="locked">🔒 Locked. No readable audio file is indexed. Reconstruct the corrupted filename in File Explorer.</p>';return}
 b.innerHTML=`<canvas aria-label="Waveform and frequency spectrum, bins 1 to 32"></canvas><div class="ctl"><button class="btn" id="pp" aria-label="Play">▶ Play</button><input type="range" id="sc" min="0" max="60" value="0" aria-label="Scrub"><span class="mono" id="tm">0:00 / 1:00</span></div><div class="ctl"><label for="vol">Volume</label><input type="range" id="vol" min="0" max="100" value="30"><button class="btn" id="mu" aria-pressed="false">Mute</button><button class="btn" id="tx">Transcript</button></div><p class="mono muted">Bins 1–32 shown left to right.</p>`;
 const cv=$('canvas',b),g=cv.getContext('2d'),HID=[[10,4],[20,1],[30,23],[40,14]];
 const draw=()=>{const w=cv.width=cv.clientWidth,h=cv.height=150;g.fillStyle='#030607';g.fillRect(0,0,w,h);const bw=w/32;
  for(let i=1;i<=32;i++){let v=Math.random()*(A.playing?.35:.12);HID.forEach(([t,bin])=>{if(bin===i&&A.t>=t&&A.t<t+6)v=.85});g.fillStyle=v>.6?'#FFC857':'#55D6C2';g.fillRect((i-1)*bw+1,h-v*h,bw-2,v*h)}
  g.fillStyle='#829397';g.font='10px monospace';[1,4,8,14,16,23,32].forEach(n=>g.fillText(n,(n-1)*bw+2,10))};
 const upd=()=>{$('#sc',b).value=A.t;const f=n=>Math.floor(n/60)+':'+String(Math.floor(n%60)).padStart(2,'0');$('#tm',b).textContent=f(A.t)+' / 1:00';if(A.t>=46&&!S.solved.audio){S.solved.audio=1;ev('audio');pulse();notify('Sequence logged: 4 1 23 14')}};
 const loop=()=>{clearInterval(A.iv);A.iv=setInterval(()=>{if(A.playing){A.t=Math.min(60,A.t+.2);if(A.t>=60)toggle(false)}draw();upd()},200)};
 const toggle=p=>{A.playing=p;$('#pp',b).textContent=p?'❚❚ Pause':'▶ Play';$('#pp',b).setAttribute('aria-label',p?'Pause':'Play');
  if(p&&!A.src){try{A.ctx=A.ctx||new AudioContext();const buf=A.ctx.createBuffer(1,A.ctx.sampleRate*2,A.ctx.sampleRate),d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;A.src=A.ctx.createBufferSource();A.src.buffer=buf;A.src.loop=true;A.gain=A.ctx.createGain();A.gain.gain.value=A.mute?0:$('#vol',b).value/1000;A.src.connect(A.gain).connect(A.ctx.destination);A.src.start()}catch{}}
  if(!p)audioStop(),A.playing=false};
 $('#pp',b).onclick=()=>toggle(!A.playing);$('#sc',b).oninput=e=>{A.t=+e.target.value;draw();upd()};
 $('#vol',b).oninput=e=>{if(A.gain)A.gain.gain.value=A.mute?0:e.target.value/1000};
 $('#mu',b).onclick=e=>{A.mute=!A.mute;e.target.setAttribute('aria-pressed',A.mute);e.target.textContent=A.mute?'Unmute':'Mute';if(A.gain)A.gain.gain.value=A.mute?0:$('#vol',b).value/1000};
 $('#tx',b).onclick=()=>modal('Transcript','[static, 60 seconds]<br>[00:10 low tone, bin four] [00:20 faint click, bin one] [00:30 rising whine, bin twenty-three] [00:40 breath, bin fourteen]<br>[faint voice, 00:52] "…count it. Then wait for morning."');
 loop();draw()}
/* ---- terminal ---- */
function buildTerm(b){b.innerHTML=`<div id="term"><div id="tout" aria-live="polite"></div><div class="tline"><span id="pr">nx7&gt;</span><input id="ti" aria-label="Terminal command" autocomplete="off" spellcheck="false"></div></div>`;
 const out=$('#tout',b),ti=$('#ti',b),H=[];let hi=0,pw=false,tries=0;const P=(t,c)=>out.append(el('div',c||'',t));
 const CMD=['help','list','inspect','recover final_message.enc','clear'];
 P('NEXUS-7 restricted shell. Type help.','g');
 const run=v=>{
  if(pw){pw=false;$('#pr',b).textContent='nx7>';if(v.trim().toUpperCase()==='DAWN'){P('Password accepted.','g');let p=0;const row=el('div','');out.append(row);const iv=setInterval(()=>{p+=rm()?20:5;row.textContent='Decrypting ['+'#'.repeat(p/5)+'.'.repeat(20-p/5)+'] '+p+'%';if(p>=100){clearInterval(iv);S.solved.term=1;ev('final');setTimeout(final,rm()?200:900)}},250)}
   else{tries++;P('ACCESS DENIED (attempt '+tries+')','e');redflash()}return}
  P('nx7> '+v);const [c,...a]=v.trim().toLowerCase().split(/\s+/);if(!c)return;H.push(v);hi=H.length;
  if(c==='help')P('help · list · inspect <file> · recover final_message.enc · clear');
  else if(c==='list')P(`final_message.enc   ${S.flags.enc?'restored · locked':'[not indexed]'}\naud_0317.wav        ${S.solved.file?'ok':'[corrupted]'}\nproject_██.txt      [clearance NX-4]`);
  else if(c==='inspect'){const f=a[0];if(f==='final_message.enc')P(S.flags.enc?'AES-like container. Key: 4 letters. Created 03.17 00:17.':'No such file in index.',S.flags.enc?'':'e');else if(f==='aud_0317.wav')P(S.solved.file?'60s, mono. Anomalous signal in bins 1–32.':'Unreadable.','w');else P('inspect: unknown file','e')}
  else if(c==='recover'&&a[0]==='final_message.enc'){if(!S.flags.enc){P('File not in index. Check the Recycle Bin.','e');redflash()}else{P('Password required.','w');pw=true;$('#pr',b).textContent='PASSWORD:'}}
  else if(c==='clear')out.innerHTML='';
  else{P('Unknown command: '+c,'e');redflash()}};
 const redflash=()=>{if(rm())return;const t=$('#term',b);t.classList.add('redflash');setTimeout(()=>t.classList.remove('redflash'),500)};
 ti.addEventListener('keydown',k=>{if(k.key==='Enter'){run(ti.value);ti.value=''}else if(k.key==='ArrowUp'&&H.length){hi=Math.max(0,hi-1);ti.value=H[hi];k.preventDefault()}else if(k.key==='ArrowDown'){hi=Math.min(H.length,hi+1);ti.value=H[hi]||'';k.preventDefault()}
  else if(k.key==='Tab'){k.preventDefault();const m=CMD.find(c=>c.startsWith(ti.value.toLowerCase())&&ti.value);if(m)ti.value=m}});
 if(pw===false)setTimeout(()=>ti.focus(),50)}
/* ---- final + endings ---- */
function final(){screen('final');const bar=$('#decbar'),fr=$('#fragments');fr.innerHTML='';$('#choices').hidden=true;let p=0;
 const L=['Fragment 1 — 03.15: Halden\'s app records microphones even when closed.','Fragment 2 — 03.16: 4.1M profiles sold. Dev copied the ledger. Dev has not answered since.','Fragment 3 — 03.17 00:17: "I\'m sending nothing from here. They watch the line. If you are reading this, the drive is the only copy."','Mira\'s warning: "Whatever you choose, someone will pay for it. Choose knowing that."'];
 const iv=setInterval(()=>{p+=rm()?50:4;bar.style.width=Math.min(p,100)+'%';if(p>=100){clearInterval(iv);L.forEach((t,i)=>setTimeout(()=>{fr.append(el('p',i<3?'frag':'',t));if(i===3){$('#choices').hidden=false;$('.ch').focus()}},rm()?0:i*900))}},150)}
const ENDS={broadcast:['Broadcast','The drive finds an open channel for eleven seconds. It is enough. By dawn the ledger is everywhere, and Halden Group is a name people say with their hands over their mouths.'],
 silence:['Silence','The disk overwrites itself in quiet passes. Nothing is sent. Nothing is left. Somewhere, a voice you will never hear stops being afraid.'],
 trace:['Trace','The last uplink resolves to cold storage unit 14, Harbor Road. A new message arrives: "You followed the signal. Come alone. — M."']};
document.addEventListener('click',e=>{const c=e.target.closest('[data-end]');if(c)ending(c.dataset.end)});
function ending(k){S.end=k;S.tEnd=Date.now();save();const e=$('#ending'),[t,n]=ENDS[k],s=Math.floor((S.tEnd-S.t0)/1000),tm=Math.floor(s/60)+'m '+s%60+'s';
 const card=`DEAD SIGNAL — ${t.toUpperCase()} ENDING\nEvidence: ${S.ev.length}/6 · Hints: ${S.hints} · Time: ${tm}${S.hints?'':'\n◆ No Hint'}`;
 e.className='scr '+k;e.innerHTML=`<h2>${t} Ending</h2><p>${n}</p><p class="mono">Choice: ${{broadcast:'Send the evidence',silence:'Delete everything',trace:'Trace Mira'}[k]}</p><p class="mono">Clues: ${S.ev.length}/6 · Hints used: ${S.hints} · Completion: ${tm}${S.lore?' · Hidden lore found':''}</p><div class="card" id="card">${card}</div><div class="ctl"><button class="btn" id="cp">Copy ending card</button><button class="btn pri" id="rs">Restart</button></div>`;
 screen('ending');$('#cp').onclick=()=>navigator.clipboard?.writeText(card);$('#rs').onclick=()=>{localStorage.removeItem('ds');location.reload()}}
/* ---- hints & settings ---- */
$('#hintbtn').onclick=()=>{const st=stage(),n=(S.hl[st]||0);modal('Hint','<p>Hint '+Math.min(n+1,3)+' of 3 for the current puzzle. Using hints removes the No Hint badge.</p><button class="btn" id="gh">Reveal hint</button><p id="hh" role="status"></p>');
 $('#gh').onclick=()=>{const k=Math.min(S.hl[st]||0,2);S.hl[st]=(S.hl[st]||0)+1;S.hints++;save();$('#hh').textContent=CONTENT.hints[st][k]}};
$('#setbtn').onclick=()=>{modal('Settings','<label for="fsz">Font size</label><input id="fsz" type="range" min="14" max="22" value="'+parseInt(getComputedStyle(document.documentElement).fontSize)+'"><p><label><input type="checkbox" id="rmc" '+(document.body.classList.contains('rm')?'checked':'')+'> Reduced motion</label></p>');
 $('#fsz').oninput=e=>document.documentElement.style.setProperty('--fs',e.target.value+'px');$('#rmc').onchange=e=>document.body.classList.toggle('rm',e.target.checked)};
$('#bell').onclick=()=>{$('#bell').classList.remove('lit');modal('Notifications',S.notes.length?S.notes.map(n=>'<p>'+n+'</p>').join(''):'<p>None.</p>')};
$('#lockbtn').onclick=()=>{
 audioStop();
 Object.values(WM.w).forEach(w=>w.el.remove());
 WM.w={};tb();
 S.solved.login=0;save();
 $('#pw').value='';
 $('#pwmsg').className='';
 $('#pwmsg').textContent='';
 screen('login');
 $('#pw').focus();
};
/* ---- start ---- */
(async()=>{try{const r=await fetch(API.content);if(r.ok)Object.assign(CONTENT,await r.json())}catch{}
 if(S.end)return ending(S.end);if(S.solved.term)return final();S.solved.login?toDesktop():boot()})();
