// LifeVerse V2.10 — immersive family adventure + role-specific entry modes.
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
      document.querySelectorAll('.players').forEach(el => el.setAttribute('aria-hidden', 'true'));
      document.querySelectorAll('.nav button').forEach(btn => {
        const text = (btn.textContent || '').toLowerCase();
        if (text.includes('family') || text.includes('家庭') || text.includes('admin') || text.includes('管理')) btn.style.display = 'none';
      });
      document.querySelectorAll('.mom-admin').forEach(el => el.style.display = 'none');
      const greeting = document.getElementById('greeting');
      if (greeting) greeting.textContent = `Welcome back, ${requestedPlayer}!`;
    }
  };

  render();
})();
