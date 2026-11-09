(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.DeadSignalGame=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const OBJECTIVES=[
    {id:'login',act:0,title:'Unlock NEXUS-7',detail:'Use the recovered login clue to open Mira’s workstation.',app:null},
    {id:'caesar',act:1,title:'Restore Mira’s timestamp',detail:'Open Messages and recover the missing timestamp.',app:'msg'},
    {id:'file',act:1,title:'Rebuild the recording name',detail:'Use Mail and File Explorer to restore the damaged recording.',app:'mail'},
    {id:'audio',act:2,title:'Isolate the hidden signal',detail:'Play the recovered audio and identify its four signal bands.',app:'audio'},
    {id:'bin',act:2,title:'Restore the protected archive',detail:'Reconstruct the deleted encrypted archive in Recycle Bin.',app:'bin'},
    {id:'board',act:3,title:'Build the event timeline',detail:'Pin the missing evidence and connect the six matching clue pairs.',app:'board'},
    {id:'term',act:3,title:'Decrypt the final message',detail:'Use the recovered password in Terminal to unlock the archive.',app:'term'},
    {id:'complete',act:4,title:'Choose an ending',detail:'Review Mira’s final message and decide what happens to the evidence.',app:null}
  ];

  function objective(state={}){
    const solved=state.solved||{},flags=state.flags||{};
    if(!solved.login)return OBJECTIVES[0];
    if(!solved.caesar)return OBJECTIVES[1];
    if(!solved.file)return OBJECTIVES[2];
    if(!solved.audio)return OBJECTIVES[3];
    if(!flags.enc)return OBJECTIVES[4];
    if(!flags.timelineComplete)return OBJECTIVES[5];
    if(!solved.term)return OBJECTIVES[6];
    return OBJECTIVES[7];
  }

  function appAccess(appId,state={}){
    const solved=state.solved||{},flags=state.flags||{};
    if(appId==='bin'&&!solved.audio)return {allowed:false,reason:'Recycle Bin unlocks after Audio Lab is complete.'};
    if(appId==='term'&&!flags.timelineComplete)return {allowed:false,reason:'Terminal unlocks after the Evidence Board timeline is complete.'};
    return {allowed:true,reason:''};
  }

  function endingEligibility(state={},evidenceTags=[]){
    const flags=state.flags||{},tags=new Set(evidenceTags);
    const common=!!state.solved?.term;
    return {
      broadcast:common,
      silence:common,
      trace:common&&!!flags.timelineComplete&&tags.has('location')&&tags.has('external-session')
    };
  }

  function progressiveHint(hints=[],revealed=0){
    if(!hints.length)return {text:'No hint is available for this objective.',level:0,total:0};
    const index=Math.min(Math.max(0,revealed),hints.length-1);
    return {text:hints[index],level:index+1,total:hints.length};
  }

  function snapshot(state,windows=[],savedAt=Date.now()){
    const copy=JSON.parse(JSON.stringify(state||{}));
    delete copy.resumeWindows;
    return {version:2,savedAt,state:copy,windows:JSON.parse(JSON.stringify(windows||[]))};
  }

  return {OBJECTIVES,objective,appAccess,endingEligibility,progressiveHint,snapshot};
});
