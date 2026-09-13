// LifeVerse persistence layer — keeps player progress stable across reloads.
// Loaded after index.html's interactive game script by the Pages workflow.
(function () {
  const SHOP_COSTS = [60, 40, 80, 180];
  const PLAYER_NAMES = ['Alex', 'Leo', 'Rina', 'Roy'];
  const MAX_LEVEL = 10000;
  const XP_STEP = 100;
  const FRESH_START_VERSION = 1;

  // One-time fresh start requested by Mom: keep tasks, but reset all game progress.
  // This runs once per browser after deployment so old localStorage progress cannot reappear.
  if ((state.freshStartVersion || 0) < FRESH_START_VERSION) {
    PLAYER_NAMES.forEach((name) => {
      if (!DATA[name]) return;
      DATA[name].level = 0;
      DATA[name].xp = 0;
      DATA[name].next = XP_STEP;
      DATA[name].coins = 0;
      if ('streak' in DATA[name]) DATA[name].streak = 0;
    });
    state.stats = Object.fromEntries(PLAYER_NAMES.map((name) => [name, { level: 0, xp: 0, next: XP_STEP, coins: 0 }]));
    state.done = {};
    state.owned = {};
    state.combo = 0;
    state.freshStartVersion = FRESH_START_VERSION;
  }

  function taskId(name, task, index) {
    if (!task[5]) task[5] = `${name.toLowerCase()}-${index + 1}`;
    return task[5];
  }

  function hydrateTasks() {
    const oldDone = state.done || {};
    if (!state.tasksByPlayer) {
      state.tasksByPlayer = {};
      PLAYER_NAMES.forEach((name) => {
        DATA[name].tasks.forEach((task, index) => {
          const id = taskId(name, task, index);
          if (oldDone[`${name}-${index}`]) oldDone[`${name}-${id}`] = true;
        });
        state.tasksByPlayer[name] = DATA[name].tasks;
      });
    }
    PLAYER_NAMES.forEach((name) => {
      if (Array.isArray(state.tasksByPlayer[name])) DATA[name].tasks = state.tasksByPlayer[name];
      DATA[name].tasks.forEach((task, index) => taskId(name, task, index));
    });
    state.done = oldDone;
  }

  function snapshotTasks() {
    const tasks = {};
    PLAYER_NAMES.forEach((name) => { tasks[name] = DATA[name].tasks; });
    return tasks;
  }

  function baseStats(name) {
    const p = DATA[name];
    return { level: p.level, xp: p.xp, next: p.next, coins: p.coins };
  }

  function migrateLegacyProgress() {
    const migrated = {};
    PLAYER_NAMES.forEach((name) => {
      const p = DATA[name];
      const stats = baseStats(name);
      p.tasks.forEach((task, index) => {
        if (state.done && state.done[name + '-' + index]) {
          stats.xp += task[2];
          stats.coins += task[3];
        }
      });
      SHOP_COSTS.forEach((cost, index) => {
        if (state.owned && state.owned[name + '-' + index]) stats.coins = Math.max(0, stats.coins - cost);
      });
      migrated[name] = stats;
    });
    return migrated;
  }

  function hydrateStats() {
    if (!state.stats) state.stats = migrateLegacyProgress();
    PLAYER_NAMES.forEach((name) => {
      const saved = state.stats[name];
      const p = DATA[name];
      if (!saved || !p) return;
      if (Number.isFinite(saved.level)) p.level = saved.level;
      if (Number.isFinite(saved.xp)) p.xp = saved.xp;
      if (Number.isFinite(saved.next)) p.next = saved.next;
      if (Number.isFinite(saved.coins)) p.coins = saved.coins;
    });
  }

  function snapshotStats() {
    const stats = {};
    PLAYER_NAMES.forEach((name) => {
      const p = DATA[name];
      stats[name] = { level: p.level, xp: p.xp, next: p.next, coins: p.coins };
    });
    return stats;
  }

  function levelUp(player) {
    let gained = 0;
    while (player.xp >= player.next && player.level < MAX_LEVEL) {
      player.xp -= player.next;
      player.level += 1;
      player.next += XP_STEP;
      gained += 1;
    }
    return gained;
  }

  function reverseLevels(player) {
    let lost = 0;
    while (player.xp < 0 && player.level > 0) {
      player.level -= 1;
      player.next = Math.max(XP_STEP, player.next - XP_STEP);
      player.xp += player.next;
      lost += 1;
    }
    player.xp = Math.max(0, player.xp);
    return lost;
  }

  function showLevelUp(player, gained) {
    let banner = document.getElementById('level-up-banner');
    if (!banner) {
      const style = document.createElement('style');
      style.textContent = '#level-up-banner{position:fixed;inset:0;z-index:120;display:grid;place-items:center;background:rgba(230,244,255,.42);backdrop-filter:blur(5px);opacity:0;pointer-events:none;transition:.22s}#level-up-banner.show{opacity:1}#level-up-banner>div{min-width:260px;padding:28px 34px;border:2px solid rgba(255,255,255,.9);border-radius:28px;text-align:center;color:#fff;background:linear-gradient(135deg,#5bb8ff,#8c75ef 58%,#ff91bd);box-shadow:0 24px 70px rgba(73,104,184,.35);transform:scale(.72) translateY(18px);transition:.28s}#level-up-banner.show>div{transform:scale(1) translateY(0)}#level-up-banner strong{display:block;font-size:35px;letter-spacing:2px;text-shadow:0 3px 14px rgba(61,64,160,.3)}#level-up-banner b{display:block;margin-top:7px;font-size:19px}#level-up-banner small{display:block;margin-top:4px;font-size:11px;opacity:.9}';
      document.head.appendChild(style);
      banner = document.createElement('div');
      banner.id = 'level-up-banner';
      document.body.appendChild(banner);
    }
    banner.innerHTML = `<div><strong>LEVEL UP!</strong><b>${state.player} · Level ${player.level}</b><small>${gained > 1 ? `连续提升 ${gained} 级！` : '升级成功！继续向前！'}</small></div>`;
    requestAnimationFrame(() => banner.classList.add('show'));
    clearTimeout(window.lifeVerseLevelTimer);
    window.lifeVerseLevelTimer = setTimeout(() => banner.classList.remove('show'), 1800);
  }

  hydrateTasks();
  hydrateStats();

  k = function stableTaskKey(index) {
    const task = P().tasks[index];
    return `${state.player}-${task ? taskId(state.player, task, index) : index}`;
  };

  const originalSave = save;
  save = function persistLifeVerseState() {
    state.stats = snapshotStats();
    state.tasksByPlayer = snapshotTasks();
    state.progressVersion = 4;
    state.freshStartVersion = FRESH_START_VERSION;
    originalSave();
  };

  completeTask = function completeTaskWithLevelUp(index) {
    const player = P();
    const key = k(index);
    const wasDone = Boolean(state.done[key]);
    const task = player.tasks[index];
    if (!task) return;
    state.done[key] = !wasDone;
    if (!wasDone) {
      player.xp += task[2];
      player.coins += task[3];
      const gained = levelUp(player);
      burst(); combo();
      toast(`+${task[2]} XP · +${task[3]} Coins`, gained ? `升级到 Level ${player.level}！` : '任务完成！');
      save(); render();
      if (gained) showLevelUp(player, gained);
      return;
    }
    player.xp -= task[2];
    player.coins = Math.max(0, player.coins - task[3]);
    reverseLevels(player);
    save(); render();
  };

  window.LifeVerseLevelSystem = { levelUp, reverseLevels };

  function safe(value) { return String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
  function adminTarget() { if (!PLAYER_NAMES.includes(state.adminTarget)) state.adminTarget = 'Alex'; return state.adminTarget; }
  function adminTaskRows() {
    const name = adminTarget();
    return DATA[name].tasks.map((task) => `<div class="mom-task"><span><b>${safe(task[0])}</b><small>${safe(task[1] || '暂无中文说明')} · ${task[2]} XP · ${task[3]} 金币</small></span><button onclick="editManagedTask('${task[5]}')">修改</button><button class="danger" onclick="removeManagedTask('${task[5]}')">删除</button></div>`).join('') || '<div class="mom-empty">还没有任务，可以在下面添加第一项。</div>';
  }

  const originalFamilyPage = familyPage;
  familyPage = function familyPageWithMomAdmin() {
    const name = adminTarget();
    return originalFamilyPage() + `<section class="mom-admin"><div class="mom-head"><div><span>MOM ADMIN · 妈妈后台</span><h2>安排每日任务</h2><p>选择家庭成员，设置任务、XP 和金币奖励。</p></div><select onchange="selectAdminTarget(this.value)">${PLAYER_NAMES.map((personName) => `<option value="${personName}" ${personName === name ? 'selected' : ''}>${personName}</option>`).join('')}</select></div><div class="mom-list">${adminTaskRows()}</div><div class="mom-form"><label>任务名称<input id="mom-task-en" placeholder="例如：Read for 20 minutes"></label><label>中文说明<input id="mom-task-zh" placeholder="例如：阅读 20 分钟"></label><label>XP<input id="mom-task-xp" type="number" min="0" value="30"></label><label>金币<input id="mom-task-coins" type="number" min="0" value="5"></label><button onclick="addManagedTask()">＋ 添加给 ${name}</button></div></section>`;
  };

  window.selectAdminTarget = function selectAdminTarget(name) { if (!PLAYER_NAMES.includes(name)) return; state.adminTarget = name; save(); render(); };
  window.addManagedTask = function addManagedTask() {
    const name = adminTarget();
    const title = document.getElementById('mom-task-en').value.trim();
    const chinese = document.getElementById('mom-task-zh').value.trim();
    const xp = Math.max(0, Number(document.getElementById('mom-task-xp').value) || 0);
    const coins = Math.max(0, Number(document.getElementById('mom-task-coins').value) || 0);
    if (!title) return toast('Please enter a task name', '请填写任务名称');
    DATA[name].tasks.push([title, chinese, xp, coins, 'star', `custom-${Date.now()}`]);
    save(); render(); toast(`Quest added for ${name}`, `已给 ${name} 添加任务`);
  };
  window.editManagedTask = function editManagedTask(id) {
    const name = adminTarget(); const task = DATA[name].tasks.find((item) => item[5] === id); if (!task) return;
    const title = prompt('任务名称', task[0]); if (title === null || !title.trim()) return;
    const chinese = prompt('中文说明', task[1] || ''); if (chinese === null) return;
    const xp = prompt('XP 奖励', task[2]); if (xp === null) return;
    const coins = prompt('金币奖励', task[3]); if (coins === null) return;
    task[0] = title.trim(); task[1] = chinese.trim(); task[2] = Math.max(0, Number(xp) || 0); task[3] = Math.max(0, Number(coins) || 0);
    save(); render(); toast('Quest updated', '任务已修改');
  };
  window.removeManagedTask = function removeManagedTask(id) {
    const name = adminTarget(); const index = DATA[name].tasks.findIndex((task) => task[5] === id);
    if (index < 0 || !confirm(`删除 ${DATA[name].tasks[index][0]}？`)) return;
    delete state.done[`${name}-${id}`]; DATA[name].tasks.splice(index, 1); save(); render(); toast('Quest removed', '任务已删除');
  };

  const adminStyle = document.createElement('style');
  adminStyle.textContent = '.mom-admin{margin-top:18px;padding:22px;border-radius:26px;background:linear-gradient(145deg,#fff,#f5f0ff);border:1px solid #deddf7;box-shadow:0 16px 42px rgba(77,122,174,.13)}.mom-head{display:flex;align-items:center;justify-content:space-between;gap:16px}.mom-head span{font-size:10px;font-weight:900;letter-spacing:1.2px;color:#8c6be1}.mom-head h2{margin:5px 0 2px;font-size:22px}.mom-head p{margin:0;color:#8297b2;font-size:11px}.mom-head select{min-width:120px;padding:10px;border:1px solid #d9e4f4;border-radius:13px;background:#fff;color:#315879;font-weight:800}.mom-list{margin-top:18px}.mom-task{display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:center;padding:11px 0;border-top:1px solid #e9edf6}.mom-task b,.mom-task small{display:block}.mom-task b{font-size:12px}.mom-task small{margin-top:3px;color:#8a9db5;font-size:9px}.mom-task button{border:0;border-radius:10px;padding:7px 10px;background:#eaf4ff;color:#477ab5;font-size:10px;font-weight:800;cursor:pointer}.mom-task button.danger{background:#fff0f3;color:#d65f7d}.mom-empty{padding:18px;text-align:center;color:#8a9db5}.mom-form{display:grid;grid-template-columns:2fr 2fr .65fr .65fr auto;gap:9px;align-items:end;margin-top:16px;padding-top:16px;border-top:1px solid #e2e8f3}.mom-form label{font-size:9px;font-weight:800;color:#69819d}.mom-form input{width:100%;margin-top:5px;padding:10px;border:1px solid #d9e4f4;border-radius:11px;background:#fff;color:#244a70}.mom-form button{border:0;border-radius:12px;padding:11px 14px;background:linear-gradient(135deg,#6faeff,#987ced);color:#fff;font-size:10px;font-weight:900;cursor:pointer}@media(max-width:800px){.mom-form{grid-template-columns:1fr 1fr}.mom-form label:nth-child(-n+2),.mom-form button{grid-column:1/-1}.mom-head{align-items:flex-start;flex-direction:column}.mom-head select{width:100%}}';
  document.head.appendChild(adminStyle);

  save();
  render();
})();
