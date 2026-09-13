// LifeVerse V2.11 — immersive family adventure + stronger role-specific entry modes.
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

  function lockChildChrome() {
    if (!isChildMode) return;

    const players = document.getElementById('players');
    if (players) {
      players.setAttribute('aria-hidden', 'true');
      players.style.display = 'none';
    }

    document.querySelectorAll('.nav button').forEach(btn => {
      const text = (btn.textContent || '').toLowerCase();
      const blocked = text.includes('family') || text.includes('家庭') || text.includes('admin') || text.includes('管理');
      if (blocked) {
        btn.style.display = 'none';
        btn.setAttribute('aria-hidden', 'true');
        btn.tabIndex = -1;
      }
    });

    document.querySelectorAll('.mom-admin').forEach(el => {
      el.style.display = 'none';
      el.setAttribute('aria-hidden', 'true');
    });

    const greeting = document.getElementById('greeting');
    if (greeting) greeting.textContent = `Welcome back, ${requestedPlayer}!`;
  }

  const originalRender = render;
  render = function renderAnimeWorld() {
    if (isChildMode) {
      if (state.page === 'family') state.page = 'home';
      if (state.player !== requestedPlayer) state.player = requestedPlayer;
    }

    originalRender();
    document.body.dataset.player = state.player;
    document.body.dataset.mode = isChildMode ? 'child' : (isParentMode ? 'parent' : 'family');

    const title = document.querySelector('.world-copy h3');
    if (title) {
      title.innerHTML = state.player === 'Leo'
        ? 'Dino Valley<br>Adventure'
        : state.player === 'Alex'
          ? 'Explore a<br>Brighter Tomorrow'
          : 'Guide the Family<br>Adventure';
    }

    const copy = document.querySelector('.world-copy p');
    if (copy) copy.textContent = isChildMode ? 'Your quests · Your goals · Your adventure' : 'Learn · Create · Explore · Grow Together';

    lockChildChrome();
  };

  // Keep child entries locked even if legacy controls try to switch player or page.
  if (isChildMode) {
    const originalShowPage = window.showPage;
    if (typeof originalShowPage === 'function') {
      window.showPage = function (nextPage) {
        if (nextPage === 'family') nextPage = 'home';
        state.player = requestedPlayer;
        return originalShowPage(nextPage);
      };
    }

    const originalSetPlayer = window.setPlayer;
    if (typeof originalSetPlayer === 'function') {
      window.setPlayer = function () {
        state.player = requestedPlayer;
        render();
      };
    }
  }

  render();
})();
