// LifeVerse V2.8 — selected warm anime adventure direction.
(function () {
  const originalRender = render;
  render = function renderAnimeWorld() {
    originalRender();
    document.body.dataset.player = state.player;
    const title = document.querySelector('.world-copy h3');
    if (title) title.innerHTML = state.player === 'Leo' ? 'Dino Valley<br>Adventure' : 'Explore a<br>Brighter Tomorrow';
    const copy = document.querySelector('.world-copy p');
    if (copy) copy.textContent = 'Learn · Create · Explore · Grow Together';
  };
  render();
})();
