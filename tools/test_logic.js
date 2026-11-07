/* Smoke test for core logic in app.js, run under Node with minimal stubs. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// --- minimal stubs ---
const store = {};
const localStorage = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; }
};
function fakeEl() {
  return {
    _children: [], style: {}, dataset: {}, classList: { toggle() {}, add() {}, remove() {}, contains() { return false; } },
    addEventListener() {}, appendChild() {}, append() {}, replaceChildren() {}, querySelectorAll() { return []; },
    setAttribute() {}, removeChild() {}, click() {}, set innerHTML(v) {}, get innerHTML() { return ''; }, textContent: '', value: ''
  };
}
const document = {
  getElementById: () => fakeEl(),
  createElement: () => fakeEl(),
  querySelectorAll: () => [],
  addEventListener: () => {},
  body: fakeEl()
};
const window = { addEventListener() {}, scrollTo() {}, devicePixelRatio: 1 };

const code = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const sandbox = { localStorage, document, window, console, setTimeout, clearTimeout, FileReader: function () {}, Blob: function () {}, URL: { createObjectURL() { return ''; }, revokeObjectURL() {} }, Date };
vm.createContext(sandbox);
// expose internals by appending references
vm.runInContext(code + '\nthis.__test = { PLAN, ensureExerciseLog, getExerciseLog, topSet, clampWeek, sessionHasData, state, loadLog, saveLog };', sandbox);
const T = sandbox.__test;

let pass = 0, fail = 0;
function ok(name, cond) { cond ? (pass++, console.log('  ✓ ' + name)) : (fail++, console.error('  ✗ ' + name)); }

// 1. plan integrity
ok('3 sessions (HIT)', T.PLAN.length === 3);
const allEx = T.PLAN.flatMap(s => s.exercises);
ok('unique exercise ids', new Set(allEx.map(e => e.id)).size === allEx.length);
ok('d3 session is variable', !!T.PLAN.find(s => s.id === 'hit_d3').variable);
ok('no supersets in HIT base', allEx.filter(e => e.supersetGroup).length === 0);

// 2. clampWeek (6-week cycle)
ok('clamp low', T.clampWeek(0) === 1);
ok('clamp high', T.clampWeek(99) === 6);
ok('clamp nan', T.clampWeek('x') === 1);

// 3. ensure / get / save / reload
T.state.log = {};
const exLog = T.ensureExerciseLog('hit_d1', 1, 'hit_d1_2', 3);
ok('default sets length', exLog.sets.length === 3);
exLog.sets[0].weight = 100; exLog.sets[0].reps = 12;
exLog.sets[1].weight = 100; exLog.sets[1].reps = 10;
exLog.sets[2].weight = 120; exLog.sets[2].reps = 8;
ok('sessionHasData true', T.sessionHasData('hit_d1', 1) === true);
ok('sessionHasData false other week', T.sessionHasData('hit_d1', 2) === false);

// 4. topSet picks highest weight then reps
const top = T.topSet(exLog);
ok('topSet weight', top.weight === 120);
ok('topSet reps', top.reps === 8);

// 5. persistence round-trip
T.saveLog(T.state.log);
const reloaded = T.loadLog();
ok('persisted weight survives', reloaded.hit_d1[1].hit_d1_2.sets[2].weight === 120);

// 6. getExerciseLog null path
ok('get missing session', T.getExerciseLog('nope', 1, 'x') === null);
ok('get missing week', T.getExerciseLog('hit_d1', 9, 'hit_d1_2') === null);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
