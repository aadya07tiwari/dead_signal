'use strict';
const assert=require('node:assert/strict');
const core=require('../js/member-b-core.js');

const fresh=core.freshState(1);
assert.equal(fresh.v,5);
assert.equal(fresh.accessibility.subtitles,true);
assert.equal(fresh.accessibility.masterVolume,100);
assert.equal(core.audioPuzzleReady({},59),true);
assert.equal(core.audioPuzzleReady({},58),false);
assert.equal(core.verifyAudioSequence('4, 1, 23, 14'),'matched');
assert.equal(core.verifyAudioSequence('4 1 23 14'),'matched');
assert.equal(core.verifyAudioSequence('4 1 23 13'),'sequence-mismatch');
assert.equal(core.verifyAudioSequence('4 1 23'),'sequence-mismatch');

const migrated=core.migrate({v:2,t0:1,solved:{file:1},flags:{},ev:[],notes:[]});
assert.equal(migrated.flags.audioRestored,1);
assert.equal(migrated.accessibility.reducedGlitch,false);

assert.equal(core.endingConsequences('early').trace,true);
assert.equal(core.endingConsequences('late').trace,false);
assert.equal(core.endingConsequences('ignored').broadcast,false);
assert.equal(core.endingConsequences('ignored').silence,true);

console.log('member-b-core tests passed');

const oldSolvedAudio=core.migrate({v:3,solved:{file:1,audio:1,term:1},flags:{audioRestored:1,enc:1,timelineComplete:1},ev:['file','audio','enc','final'],notes:[],board:{items:{'recording-name':{id:'recording-name'},'audio-sequence':{id:'audio-sequence'},dawn:{id:'dawn'}},connections:[],deductions:[]}});
assert.equal(oldSolvedAudio.solved.file,1);
assert.equal(oldSolvedAudio.solved.audio,undefined);
assert.equal(oldSolvedAudio.solved.term,undefined);
assert.equal(oldSolvedAudio.flags.timelineComplete,0);
assert.equal(oldSolvedAudio.board.items['recording-name']!==undefined,true);
assert.equal(oldSolvedAudio.board.items.dawn,undefined);
