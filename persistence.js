// LifeVerse persistence layer — keeps player progress stable across reloads.
// Loaded after index.html's interactive game script by the Pages workflow.
(function () {
  const SHOP_COSTS = [60, 40, 80, 180];
  const PLAYER_NAMES = ['Alex', 'Leo', 'Rina', 'Roy'];

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

  hydrateStats();

  const originalSave = save;
  save = function persistLifeVerseState() {
    state.stats = snapshotStats();
    state.progressVersion = 2;
    originalSave();
  };

  // Commit the migration immediately, then refresh the already-rendered UI.
  save();
  render();
})();
