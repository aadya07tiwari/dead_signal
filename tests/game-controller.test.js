'use strict';
const assert=require('node:assert/strict');
const game=require('../js/game-controller.js');

const state=()=>({solved:{},flags:{}});
let s=state();
assert.equal(game.objective(s).id,'login');
s.solved.login=1; assert.equal(game.objective(s).id,'caesar');
s.solved.caesar=1; assert.equal(game.objective(s).id,'file');
s.solved.file=1; assert.equal(game.objective(s).id,'bin');
assert.equal(game.appAccess('bin',s).allowed,true);
s.flags.audioRestored=1; assert.equal(game.objective(s).id,'audio');
s.solved.audio=1; assert.equal(game.objective(s).id,'board');
s.flags.enc=1; assert.equal(game.objective(s).id,'board');
assert.equal(game.appAccess('term',s).allowed,false);
s.flags.timelineComplete=1; assert.equal(game.objective(s).id,'term');
s.solved.term=1; assert.equal(game.objective(s).id,'complete');

assert.equal(game.progressiveHint(['broad','specific','answer'],0).text,'broad');
assert.equal(game.progressiveHint(['broad','specific','answer'],2).text,'answer');
assert.equal(game.progressiveHint(['broad','specific','answer'],99).text,'answer');

let endings=game.endingEligibility(s,['location']);
assert.equal(endings.broadcast,true);
assert.equal(endings.trace,false);
s.finale={outcome:'early'};
endings=game.endingEligibility(s,['location','external-session']);
assert.equal(endings.trace,true);
s.finale.outcome='late';
endings=game.endingEligibility(s,['location','external-session']);
assert.equal(endings.trace,false);
s.finale.outcome='ignored';
endings=game.endingEligibility(s,['location','external-session']);
assert.equal(endings.broadcast,false);
assert.equal(endings.silence,true);

const original={solved:{login:1},resumeWindows:[{id:'mail'}]};
const saved=game.snapshot(original,[{id:'files',left:'20px'}],1234);
assert.equal(saved.savedAt,1234);
assert.equal(saved.state.resumeWindows,undefined);
assert.deepEqual(saved.windows,[{id:'files',left:'20px'}]);
saved.state.solved.login=0;
assert.equal(original.solved.login,1);

console.log('game-controller tests passed');
