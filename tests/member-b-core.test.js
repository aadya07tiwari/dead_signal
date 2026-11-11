'use strict';
const assert=require('node:assert/strict');
const core=require('../js/member-b-core.js');

const fresh=core.freshState(1);
assert.equal(fresh.v,3);
assert.equal(fresh.accessibility.subtitles,true);
assert.equal(fresh.accessibility.masterVolume,100);
assert.equal(core.audioPuzzleReady({filter:{preset:'voice'},speed:.75,transcriptMode:'enhanced'},50),true);
assert.equal(core.audioPuzzleReady({filter:{preset:'voice'},speed:1,transcriptMode:'enhanced'},50),false);
assert.equal(core.audioPuzzleReady({filter:{preset:'voice'},speed:.75,transcriptMode:'raw'},50),false);

const migrated=core.migrate({v:2,t0:1,solved:{file:1},flags:{},ev:[],notes:[]});
assert.equal(migrated.flags.audioRestored,1);
assert.equal(migrated.accessibility.reducedGlitch,false);

assert.equal(core.endingConsequences('early').trace,true);
assert.equal(core.endingConsequences('late').trace,false);
assert.equal(core.endingConsequences('ignored').broadcast,false);
assert.equal(core.endingConsequences('ignored').silence,true);

console.log('member-b-core tests passed');
