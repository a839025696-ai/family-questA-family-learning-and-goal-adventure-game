// LifeVerse persistence layer — keeps player progress stable across reloads.
// Loaded after index.html's interactive game script by the Pages workflow.
(function () {
  const SHOP_COSTS = [60, 40, 80, 180];
  const PLAYER_NAMES = ['Alex', 'Leo', 'Rina', 'Roy'];
  const MAX_LEVEL = 10000;
  const XP_STEP = 100;

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
        if (state.owned && state.owned[name + '-' + index]) {
          stats.coins = Math.max(0, stats.coins - cost);
        }
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
      stats[name] = {
        level: p.level,
        xp: p.xp,
        next: p.next,
        coins: p.coins
      };
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

  hydrateStats();

  const originalSave = save;
  save = function persistLifeVerseState() {
    state.stats = snapshotStats();
    state.progressVersion = 3;
    originalSave();
  };

  // Replace the prototype task handler with reversible, multi-level progression.
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
      burst();
      combo();
      toast(`+${task[2]} XP · +${task[3]} Coins`, gained ? `升级到 Level ${player.level}！` : '任务完成！');
      save();
      render();
      if (gained) showLevelUp(player, gained);
      return;
    }

    player.xp -= task[2];
    player.coins = Math.max(0, player.coins - task[3]);
    reverseLevels(player);
    save();
    render();
  };

  window.LifeVerseLevelSystem = { levelUp, reverseLevels };

  // Commit the migration immediately, then refresh the already-rendered UI.
  save();
  render();
})();
