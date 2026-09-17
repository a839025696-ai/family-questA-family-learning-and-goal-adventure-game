// LifeVerse skill progression — independent XP/levels tied to completed quests.
(function () {
  const PLAYERS = ['Alex', 'Leo', 'Rina', 'Roy'];
  const BASE_NEXT = 100;
  const NEXT_STEP = 40;

  const SKILL_BY_ICON = {
    Alex: { book:'English', math:'Math', science:'Science', rowing:'Rowing', heart:'Life Skills', history:'History' },
    Leo: { book:'English', math:'Coding', dino:'Animals', bone:'Paleontology', code:'Coding', robot:'AI', sport:'Sports' },
    Rina: { plan:'Planning', chart:'Planning', book:'Learning', heart:'Family', map:'Travel' },
    Roy: { sport:'Fitness', heart:'Family', map:'Travel', book:'Learning' }
  };

  if (!state.skillStats || typeof state.skillStats !== 'object') state.skillStats = {};

  function skillKey(name) { return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-'); }
  function ensurePlayer(name) {
    if (!state.skillStats[name]) state.skillStats[name] = {};
    const player = DATA[name];
    if (!player || !Array.isArray(player.skills)) return;
    player.skills.forEach((skill) => {
      const key = skillKey(skill[0]);
      if (!state.skillStats[name][key]) {
        // Preserve the old visual progress as a gentle starting point instead of wiping it.
        const seed = Math.max(0, Number(skill[2]) || 0);
        state.skillStats[name][key] = { name:skill[0], zh:skill[1], icon:skill[3], level:1, xp:seed, next:BASE_NEXT };
      }
    });
  }
  PLAYERS.forEach(ensurePlayer);

  function statForTask(name, task) {
    ensurePlayer(name);
    const icon = task && task[4];
    const mapped = (SKILL_BY_ICON[name] || {})[icon];
    if (!mapped) return null;
    return state.skillStats[name][skillKey(mapped)] || null;
  }

  function normalize(stat) {
    while (stat.xp >= stat.next) {
      stat.xp -= stat.next;
      stat.level += 1;
      stat.next += NEXT_STEP;
    }
    while (stat.xp < 0 && stat.level > 1) {
      stat.level -= 1;
      stat.next = Math.max(BASE_NEXT, stat.next - NEXT_STEP);
      stat.xp += stat.next;
    }
    stat.xp = Math.max(0, stat.xp);
  }

  function skillReward(task) { return Math.max(5, Math.round((Number(task[2]) || 0) * 0.5)); }

  const previousCompleteTask = completeTask;
  completeTask = function completeTaskWithSkillXP(index) {
    const name = state.player;
    const task = P().tasks[index];
    if (!task) return;
    const key = k(index);
    const wasDone = Boolean(state.done[key]);
    const stat = statForTask(name, task);
    if (stat) {
      stat.xp += (wasDone ? -1 : 1) * skillReward(task);
      normalize(stat);
    }
    previousCompleteTask(index);
  };

  const previousSkillsPage = skillsPage;
  skillsPage = function leveledSkillsPage() {
    ensurePlayer(state.player);
    const stats = Object.values(state.skillStats[state.player] || {});
    if (!stats.length) return previousSkillsPage();
    return panelTitle('My Skills','技能成长') + `<div class="skills-grid">${stats.map((s) => {
      const pct = Math.min(100, Math.round(s.xp / s.next * 100));
      return `<div class="skill-card"><div class="icon modern-icon">${icon(s.icon)}</div><h3>${s.name}</h3><p>${s.zh} · Skill Lv. ${s.level}</p><div class="mini"><span style="width:${pct}%"></span></div><div class="skill-xp-label"><span>${s.xp} XP</span><span>${s.next} XP</span></div></div>`;
    }).join('')}</div>`;
  };

  const style = document.createElement('style');
  style.textContent = '.skill-xp-label{display:flex;justify-content:space-between;margin-top:7px;font-size:9px;font-weight:800;color:#8298b4}.skill-card .mini span{transition:width .35s ease}@media(max-width:800px){.skills-grid{grid-template-columns:1fr 1fr}.skill-card{min-width:0}}@media(max-width:480px){.skills-grid{grid-template-columns:1fr}}';
  document.head.appendChild(style);

  // Persist migration immediately; the existing persistence/cloud layer includes state.
  save();
  window.LifeVerseSkillSystem = { statForTask, skillReward };
})();
