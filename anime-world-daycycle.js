(() => {
  'use strict';

  const world = document.querySelector('.world');
  if (!world || document.getElementById('lifeverse-daycycle-v1')) return;

  const style = document.createElement('style');
  style.id = 'lifeverse-daycycle-v1';
  style.textContent = `
    .world.lv-morning{background:linear-gradient(180deg,#ffd9c2 0%,#bfe8ff 31%,#f8fcff 55%,#dff6dc 100%)}
    .world.lv-day{background:linear-gradient(180deg,#9fdcff 0%,#dff5ff 38%,#f8fcff 55%,#dff6dc 100%)}
    .world.lv-evening{background:linear-gradient(180deg,#9d9eea 0%,#ffc7a8 35%,#ffe8bd 53%,#d9edcf 100%)}
    .world.lv-night{background:linear-gradient(180deg,#172c5d 0%,#34568b 39%,#7692ba 58%,#bfd5c5 100%)}
    .lv-day-orb{position:absolute;right:9%;top:9%;z-index:2;width:58px;height:58px;border-radius:50%;pointer-events:none;transition:background .6s ease,box-shadow .6s ease,opacity .6s ease}
    .lv-morning .lv-day-orb,.lv-day .lv-day-orb{background:#fff4a8;box-shadow:0 0 22px 8px rgba(255,238,139,.42)}
    .lv-evening .lv-day-orb{background:#ffd28a;box-shadow:0 0 28px 10px rgba(255,164,112,.34)}
    .lv-night .lv-day-orb{background:#f4f1d8;box-shadow:inset -12px -6px 0 #d8d9d4,0 0 20px 6px rgba(214,225,255,.24)}
    .lv-stars{position:absolute;inset:0;z-index:1;pointer-events:none;opacity:0;transition:opacity .6s ease;background-image:radial-gradient(circle at 15% 13%,#fff 0 1px,transparent 1.6px),radial-gradient(circle at 35% 20%,#fff 0 1.2px,transparent 1.8px),radial-gradient(circle at 57% 11%,#fff6c5 0 1px,transparent 1.7px),radial-gradient(circle at 74% 27%,#fff 0 1px,transparent 1.6px),radial-gradient(circle at 91% 16%,#fff 0 1.2px,transparent 1.8px);background-size:180px 130px}
    .lv-night .lv-stars{opacity:.8}
    .lv-night .world-copy h3{background:linear-gradient(135deg,#f5fbff,#d9d1ff 72%);-webkit-background-clip:text;background-clip:text;color:transparent}
    .lv-night .world-copy p,.lv-night .eyebrow{color:#e7f0ff;text-shadow:0 1px 8px rgba(12,30,65,.45)}
    .lv-night .lv-cloud{opacity:.28}.lv-evening .lv-cloud{opacity:.5}
    @media(max-width:760px){.lv-day-orb{width:44px;height:44px;right:8%;top:8%}.lv-stars{background-size:150px 110px}}
    @media(prefers-reduced-motion:reduce){.lv-day-orb,.lv-stars{transition:none}}
  `;
  document.head.appendChild(style);

  const orb = document.createElement('span');
  orb.className = 'lv-day-orb';
  orb.setAttribute('aria-hidden', 'true');
  const stars = document.createElement('span');
  stars.className = 'lv-stars';
  stars.setAttribute('aria-hidden', 'true');
  world.prepend(stars, orb);

  const phases = ['lv-morning', 'lv-day', 'lv-evening', 'lv-night'];
  const applyPhase = () => {
    const hour = new Date().getHours();
    const phase = hour >= 6 && hour < 10 ? 'lv-morning' : hour >= 10 && hour < 17 ? 'lv-day' : hour >= 17 && hour < 20 ? 'lv-evening' : 'lv-night';
    world.classList.remove(...phases);
    world.classList.add(phase);
    document.documentElement.dataset.worldTime = phase.slice(3);
  };

  applyPhase();
  window.setInterval(applyPhase, 15 * 60 * 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) applyPhase(); });
})();
