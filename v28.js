// LifeVerse V2.11 — immersive family adventure + role-specific entry modes.
(function () {
  const params = new URLSearchParams(window.location.search);
  const requestedMode = (params.get('mode') || '').toLowerCase();
  const requestedPlayer = params.get('player');
  const allowedChildren = ['Alex', 'Leo'];
  const isChildMode = requestedMode === 'child' && allowedChildren.includes(requestedPlayer);
  const isParentMode = requestedMode === 'parent';

  if (isChildMode) {
    state.player = requestedPlayer;
    state.page = 'home';
  } else if (isParentMode) {
    state.player = requestedPlayer || 'Rina';
  }

  // Upgrade the old goal blocks into a game-style chapter path.
  const originalGoalsPage = goalsPage;
  goalsPage = function gameGoalsPage() {
    const p = P();
    const c = completed();
    const unlocked = Math.min(p.goals.length - 1, Math.max(1, c));
    return panelTitle('Adventure Path','冒险路线') + `
      <div class="chapter-head">
        <div><span class="chapter-kicker">${state.player.toUpperCase()} · CHAPTER 1</span><h3>${state.player === 'Leo' ? 'Dino Valley Expedition' : 'Bright Future Expedition'}</h3><p>Complete daily quests to unlock the next checkpoint.</p></div>
        <div class="chapter-progress"><strong>${c}</strong><span>quests cleared</span></div>
      </div>
      <div class="goalmap adventure-map">
        <div class="path-ribbon"></div>
        ${p.goals.map((g,i)=>{
          const status = i===0 ? 'done' : i<=unlocked ? 'current' : 'locked';
          const tag = status==='done' ? 'CLEARED' : status==='current' ? 'NEXT' : 'LOCKED';
          const mark = status==='done' ? '✓' : status==='locked' ? '🔒' : '✦';
          const need = Math.max(0, i-c);
          return `<button class="goal-node game-stage g${i+1} ${status}">
            <span class="stage-badge">${tag}</span>
            <span class="stage-mark">${mark}</span>
            <span class="modern-icon">${icon(g[2])}</span>
            <b>${g[0]}</b><small>${g[1]}</small>
            ${status==='locked'?`<em>${need} more quest${need===1?'':'s'} to unlock</em>`:'<em>Tap into your next adventure</em>'}
          </button>`;
        }).join('')}
      </div>`;
  };

  // Give the quest hall a clearer game loop and reward hierarchy.
  const originalTasksPage = tasksPage;
  tasksPage = function gameTasksPage() {
    const p = P();
    const c = completed();
    return panelTitle('Quest Hall','任务大厅') + `
      <div class="quest-summary">
        <div><span>TODAY'S RUN</span><strong>${c}/${p.tasks.length}</strong><small>quests complete</small></div>
        <div class="quest-summary-bar"><i style="width:${p.tasks.length?Math.min(100,c/p.tasks.length*100):0}%"></i></div>
        <div class="quest-summary-reward">🎁 ${c>=3?'Mystery Box ready':'Complete 3 quests for a Mystery Box'}</div>
      </div>
      <div class="quest-grid game-quest-grid">${p.tasks.map((t,i)=>{
        const done=state.done[k(i)];
        return `<div class="quest-card game-quest ${done?'quest-cleared':''}">
          <div class="quest-number">${done?'✓':String(i+1).padStart(2,'0')}</div>
          <div class="icon modern-icon">${icon(t[4])}</div>
          <h3>${t[0]}</h3><p>${t[1]}</p>
          <div class="quest-loot"><span>+${t[2]} XP</span><span>+${t[3]} Coins</span></div>
          <button class="action" onclick="completeTask(${i})">${done?'Quest Cleared ✓':'Complete Quest'}</button>
        </div>`;
      }).join('')}</div>`;
  };

  const originalRender = render;
  render = function renderAnimeWorld() {
    if (isChildMode && state.page === 'family') state.page = 'home';
    if (isChildMode && state.player !== requestedPlayer) state.player = requestedPlayer;

    originalRender();
    document.body.dataset.player = state.player;
    document.body.dataset.mode = isChildMode ? 'child' : (isParentMode ? 'parent' : 'family');

    const title = document.querySelector('.world-copy h3');
    if (title) title.innerHTML = state.player === 'Leo' ? 'Dino Valley<br>Adventure' : state.player === 'Alex' ? 'Explore a<br>Brighter Tomorrow' : 'Guide the Family<br>Adventure';
    const copy = document.querySelector('.world-copy p');
    if (copy) copy.textContent = isChildMode ? 'Your quests · Your goals · Your adventure' : 'Learn · Create · Explore · Grow Together';

    if (isChildMode) {
      const playerStrip = document.querySelector('.players');
      if (playerStrip) playerStrip.style.display = 'none';
      document.querySelectorAll('.nav button').forEach(btn => {
        const text = (btn.textContent || '').toLowerCase();
        if (text.includes('family') || text.includes('家庭') || text.includes('admin') || text.includes('管理')) btn.style.display = 'none';
      });
      document.querySelectorAll('.mom-admin').forEach(el => el.style.display = 'none');
      document.querySelectorAll('.tile').forEach(tile => {
        const text=(tile.textContent||'').toLowerCase();
        if(text.includes('family')||text.includes('家庭')) tile.style.display='none';
      });
      const greeting = document.getElementById('greeting');
      if (greeting) greeting.textContent = `Welcome back, ${requestedPlayer}!`;
    }
  };

  render();
})();
