(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.DeadSignalMemberB=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const VERSION=2;
  const PRIMARY_KEY='ds_friend_original_v1';
  const BACKUP_KEY='ds_friend_original_v1_backup';
  const QUARANTINE_KEY='ds_friend_original_v1_quarantine';

  function freshState(now=Date.now()){
    return {
      v:VERSION,t0:now,solved:{},ev:[],hints:0,hl:{},flags:{evidenceHold:0},notes:[],lore:0,
      fs:{path:'research',view:'details',preview:false,history:['research'],hi:0,sort:{key:'name',dir:1},evidence:{},restored:{},recovered:{}},
      audio:{markers:[],captions:true,captionSize:16,visual:false,loop:false,speed:1,preservePitch:true,position:0,transcriptMode:'raw',announceTranscript:false,filter:{preset:'clear',type:'allpass',cutoff:2400,q:4}},
      logs:[],termHistory:[],board:{items:{},connections:[],deductions:[]},guidance:{mode:'manual',inactivityMinutes:5,lastActivity:now,suggestedStage:''},
      accessibility:{size:16,reducedMotion:false,highContrast:false},sessionWindows:[],finale:{stage:'idle',deleted:[],destroyed:[],startedAt:0,protectedAt:0,step:0,outcome:'pending'}
    };
  }

  function object(value){return value&&typeof value==='object'&&!Array.isArray(value)}
  function mergeDefaults(target,defaults){
    const out=object(target)?{...target}:{};
    for(const [key,value] of Object.entries(defaults)){
      if(out[key]===undefined)out[key]=value;
      else if(object(value))out[key]=mergeDefaults(out[key],value);
    }
    return out;
  }
  function migrate(input){
    const source=object(input)?JSON.parse(JSON.stringify(input)):{};
    let version=Number.isInteger(source.v)?source.v:0;
    let state=source;
    if(version<1){
      state=mergeDefaults(state,freshState(state.t0||Date.now()));
      state.v=1; version=1;
    }
    if(version<2){
      const defaults=freshState(state.t0||Date.now());
      state=mergeDefaults(state,defaults);
      state.audio=mergeDefaults(state.audio,defaults.audio);
      state.fs=mergeDefaults(state.fs,defaults.fs);
      state.finale=mergeDefaults(state.finale,defaults.finale);
      state.v=2; version=2;
    }
    state=mergeDefaults(state,freshState(state.t0||Date.now()));
    state.v=VERSION;
    return state;
  }

  function fnv1a(text){
    let hash=0x811c9dc5;
    for(let i=0;i<text.length;i++){
      hash^=text.charCodeAt(i);
      hash=Math.imul(hash,0x01000193)>>>0;
    }
    return hash.toString(16).padStart(8,'0');
  }
  function encode(state,now=Date.now()){
    const data=migrate(state),serialized=JSON.stringify(data);
    return JSON.stringify({v:VERSION,savedAt:now,checksum:fnv1a(serialized),data});
  }
  function validShape(data){
    return object(data)&&object(data.solved)&&object(data.flags)&&Array.isArray(data.ev)&&Array.isArray(data.notes)&&object(data.fs)&&object(data.audio)&&Array.isArray(data.termHistory)&&object(data.finale);
  }
  function validCoreShape(data){return object(data)&&object(data.solved)&&object(data.flags)&&Array.isArray(data.ev)&&Array.isArray(data.notes)}
  function decode(raw){
    if(typeof raw!=='string'||!raw.trim())throw new Error('Save is empty.');
    const parsed=JSON.parse(raw);
    if(object(parsed)&&Object.hasOwn(parsed,'checksum')&&Object.hasOwn(parsed,'data')){
      const serialized=JSON.stringify(parsed.data);
      if(parsed.checksum!==fnv1a(serialized))throw new Error('Save checksum does not match.');
      if(!validCoreShape(parsed.data))throw new Error('Save is missing required fields.');
      const state=migrate(parsed.data);
      if(!validShape(state))throw new Error('Save has an invalid shape.');
      return {state,savedAt:parsed.savedAt||0,legacy:false};
    }
    if(!validCoreShape(parsed))throw new Error('Legacy save is missing required fields.');
    const state=migrate(parsed);
    if(!validShape(state))throw new Error('Legacy save has an invalid shape.');
    return {state,savedAt:0,legacy:true};
  }
  function safeGet(storage,key){try{return storage.getItem(key)}catch(error){return null}}
  function safeSet(storage,key,value){try{storage.setItem(key,value);return true}catch(error){return false}}
  function loadSession(storage,now=Date.now()){
    const primary=safeGet(storage,PRIMARY_KEY);
    if(primary){try{return {...decode(primary),source:'primary',storageOK:true}}catch(primaryError){
      const backup=safeGet(storage,BACKUP_KEY);
      if(backup){try{return {...decode(backup),source:'backup',storageOK:true,recoveredFromBackup:true,primaryError:String(primaryError.message||primaryError)}}catch{}}
      safeSet(storage,QUARANTINE_KEY,primary);
      return {state:freshState(now),source:'fresh',storageOK:true,quarantinedRaw:primary,error:String(primaryError.message||primaryError)};
    }}
    const probe='ds_storage_probe';
    if(!safeSet(storage,probe,'1'))return {state:freshState(now),source:'memory',storageOK:false};
    try{storage.removeItem(probe)}catch{}
    return {state:freshState(now),source:'fresh',storageOK:true};
  }
  function saveSession(storage,state,now=Date.now()){
    const next=encode(state,now),previous=safeGet(storage,PRIMARY_KEY);
    if(previous){try{decode(previous);if(!safeSet(storage,BACKUP_KEY,previous))return {ok:false,raw:next}}catch{}}
    if(!safeSet(storage,PRIMARY_KEY,next))return {ok:false,raw:next};
    return {ok:true,raw:next};
  }

  function transcriptRows(rows,mode='raw',reconstructed=false){
    if(!Array.isArray(rows)||!rows.length)return [];
    const enhanced=mode==='enhanced'&&reconstructed;
    return rows.map(row=>({...row,display:enhanced?String(row.text||row.clean||row.corrupt||''):String(row.corrupt||'[static]')}));
  }
  function activeTranscriptIndex(rows,time){
    if(!Array.isArray(rows))return -1;
    return rows.findIndex(row=>Number.isFinite(row.start)&&Number.isFinite(row.end)&&time>=row.start&&time<row.end);
  }
  const SPEEDS=[.5,.75,1,1.25,1.5,2];
  const PRESETS={
    voice:{preset:'voice',type:'bandpass',cutoff:1800,q:5},hum:{preset:'hum',type:'notch',cutoff:50,q:18},
    hiss:{preset:'hiss',type:'lowpass',cutoff:3200,q:2},notch:{preset:'notch',type:'notch',cutoff:1200,q:10},
    reverse:{preset:'reverse',type:'allpass',cutoff:2400,q:4},clear:{preset:'clear',type:'allpass',cutoff:2400,q:4}
  };
  function speedStep(speed,direction){
    const current=SPEEDS.reduce((best,value)=>Math.abs(value-speed)<Math.abs(best-speed)?value:best,1),index=SPEEDS.indexOf(current);
    return SPEEDS[Math.max(0,Math.min(SPEEDS.length-1,index+direction))];
  }
  function audioShortcut(audio,key,{shift=false}={}){
    const next=mergeDefaults(audio||{},freshState().audio),filter={...next.filter};
    if(key==='[')next.speed=speedStep(next.speed,-1);
    else if(key===']')next.speed=speedStep(next.speed,1);
    else if(key==='\\')next.speed=1;
    else if(/^[0-5]$/.test(key)){const names=['clear','voice','hum','hiss','notch','reverse'];next.filter={...PRESETS[names[+key]]};}
    else if(shift&&key==='ArrowUp')filter.cutoff=Math.min(12000,filter.cutoff+100),next.filter=filter;
    else if(shift&&key==='ArrowDown')filter.cutoff=Math.max(20,filter.cutoff-100),next.filter=filter;
    else if(shift&&key==='ArrowRight')filter.q=Math.min(30,+(filter.q+.5).toFixed(1)),next.filter=filter;
    else if(shift&&key==='ArrowLeft')filter.q=Math.max(.1,+(filter.q-.5).toFixed(1)),next.filter=filter;
    else if(key.toLowerCase()==='c')next.captions=!next.captions;
    else if(key.toLowerCase()==='t')next.transcriptMode=next.transcriptMode==='enhanced'?'raw':'enhanced';
    else if(key===' '||key==='Space')next.playing=!next.playing;
    else if(!shift&&key==='ArrowRight')next.position=Math.min(60,(next.position||0)+5);
    else if(!shift&&key==='ArrowLeft')next.position=Math.max(0,(next.position||0)-5);
    else if(key.toLowerCase()==='m')next.markers=[...(next.markers||[]),{time:next.position||0,label:`Marker ${(next.markers||[]).length+1}`}];
    return next;
  }

  function debounce(fn,wait=400){let timer=0;const wrapped=(...args)=>{clearTimeout(timer);timer=setTimeout(()=>fn(...args),wait)};wrapped.flush=(...args)=>{clearTimeout(timer);timer=0;fn(...args)};return wrapped}
  function recoveryTransition(state,item,action){
    const next=JSON.parse(JSON.stringify(state||{restored:[],destroyed:[]}));next.restored=next.restored||[];next.destroyed=next.destroyed||[];
    if(action==='restore'){if(!item?.valid)return {ok:false,reason:'validation',state:next};if(next.restored.includes(item.id))return {ok:false,reason:'already-restored',state:next};next.restored.push(item.id);return {ok:true,state:next}}
    if(action==='destroy'){if(next.evidenceHold)return {ok:false,reason:'evidence-hold',state:next};if(item?.confirm!=='DELETE')return {ok:false,reason:'confirmation',state:next};next.destroyed.push(item.id);return {ok:true,state:next}}
    return {ok:false,reason:'unknown-action',state:next};
  }

  function finaleEligible(state){return !!state?.flags?.enc&&!!state?.solved?.audio}
  function finaleOutcome(finale={}){
    if(finale.outcome&&finale.outcome!=='pending')return finale.outcome;
    const lost=(finale.deleted||[]).length+(finale.destroyed||[]).length;
    if(finale.stage==='protected')return lost<=1?'early':lost<=3?'late':'ignored';
    if(finale.stage==='lost'||finale.stage==='timeout')return 'ignored';
    return 'pending';
  }

  return {VERSION,PRIMARY_KEY,BACKUP_KEY,QUARANTINE_KEY,freshState,migrate,fnv1a,encode,decode,loadSession,saveSession,transcriptRows,activeTranscriptIndex,SPEEDS,PRESETS,speedStep,audioShortcut,debounce,recoveryTransition,finaleEligible,finaleOutcome};
});
