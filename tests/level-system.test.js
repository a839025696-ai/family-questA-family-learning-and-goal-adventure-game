const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const players = ['Alex', 'Leo', 'Rina', 'Roy'];
const DATA = Object.fromEntries(players.map((name) => [name, {
  level: name === 'Alex' ? 4 : 1,
  xp: name === 'Alex' ? 480 : 0,
  next: name === 'Alex' ? 500 : 100,
  coins: 0,
  tasks: name === 'Alex' ? [['Big quest', '大任务', 1120, 10]] : []
}]));

const state = { player: 'Alex', done: {}, owned: {}, stats: Object.fromEntries(players.map((name) => [name, {
  level: DATA[name].level, xp: DATA[name].xp, next: DATA[name].next, coins: DATA[name].coins
}])) };

const elements = {};
function element() {
  return {
    id: '', innerHTML: '', textContent: '',
    classList: { add() {}, remove() {} },
    appendChild(child) { if (child.id) elements[child.id] = child; }
  };
}

const sandbox = {
  DATA,
  state,
  window: {},
  localStorage: { setItem() {} },
  document: {
    head: element(), body: element(), createElement: element,
    getElementById: (id) => elements[id] || null
  },
  requestAnimationFrame() {},
  clearTimeout() {},
  setTimeout() {},
  P: () => DATA[state.player],
  k: (index) => `${state.player}-${index}`,
  save() {},
  render() {},
  burst() {},
  combo() {},
  toast() {}
  ,familyPage() { return '<div>Family</div>'; }
};

vm.runInNewContext(fs.readFileSync('persistence.js', 'utf8'), sandbox);

sandbox.completeTask(0);
assert.deepEqual(
  [DATA.Alex.level, DATA.Alex.xp, DATA.Alex.next, DATA.Alex.coins],
  [6, 500, 700, 10],
  'large XP rewards can grant multiple levels and preserve overflow XP'
);

sandbox.completeTask(0);
assert.deepEqual(
  [DATA.Alex.level, DATA.Alex.xp, DATA.Alex.next, DATA.Alex.coins],
  [4, 480, 500, 0],
  'undo restores the exact pre-completion level progress'
);

console.log('Level system tests passed');
