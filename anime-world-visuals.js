(() => {
  'use strict';

  const STYLE_ID = 'lifeverse-anime-world-v3';
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .world{isolation:isolate;background:linear-gradient(180deg,#aee2ff 0%,#dff5ff 37%,#f8fcff 53%,#dff6dc 100%);border-color:rgba(135,199,240,.72);box-shadow:0 22px 55px rgba(64,121,180,.22),inset 0 0 0 1px rgba(255,255,255,.68)}
    .world:after{content:"";position:absolute;inset:0;z-index:3;pointer-events:none;background:radial-gradient(circle at 78% 18%,rgba(255,245,171,.72) 0 3%,rgba(255,245,171,.20) 8%,transparent 17%),linear-gradient(180deg,rgba(255,255,255,.04),rgba(108,186,255,.06) 48%,rgba(87,173,115,.09));mix-blend-mode:screen}
    .world-copy{filter:drop-shadow(0 3px 10px rgba(255,255,255,.85))}
    .world-copy h3{background:linear-gradient(135deg,#214f8c,#6551bd 72%);-webkit-background-clip:text;background-clip:text;color:transparent;letter-spacing:-1px}
    .hero-avatar{border:1px solid rgba(255,255,255,.9);box-shadow:0 15px 34px rgba(48,101,164,.22),inset 0 1px rgba(255,255,255,.9)}
    .float-label{border:1px solid rgba(255,255,255,.88);backdrop-filter:blur(12px);animation:lvFloat 4.2s ease-in-out infinite}
    .rowing-label{animation-delay:-2.1s}
    .world .scene{filter:saturate(1.08) contrast(1.025)}
    .world .scene:after{content:"";position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(circle,rgba(255,255,255,.9) 0 1.2px,transparent 1.8px),radial-gradient(circle,rgba(255,236,148,.72) 0 1px,transparent 1.7px);background-size:73px 67px,101px 89px;background-position:12px 18px,43px 27px;opacity:.48;animation:lvSparkle 7s linear infinite}
    .hudcard{background:linear-gradient(160deg,rgba(255,255,255,.97),rgba(246,250,255,.93));box-shadow:0 18px 45px rgba(64,113,169,.16)}
    .map-mini,.goalmap{background:linear-gradient(180deg,#d8f2ff 0%,#f6fbff 43%,#dff4e5 100%)}
    .map-node.current,.goal-node.current{animation:lvQuestPulse 2.2s ease-in-out infinite}
    @keyframes lvFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    @keyframes lvSparkle{0%{transform:translate3d(0,0,0)}50%{opacity:.72}100%{transform:translate3d(18px,-12px,0)}}
    @keyframes lvQuestPulse{0%,100%{box-shadow:0 7px 18px rgba(69,126,171,.18),0 0 0 0 rgba(153,119,239,.26)}50%{box-shadow:0 9px 22px rgba(69,126,171,.22),0 0 0 8px rgba(153,119,239,0)}}
    @media(max-width:760px){
      .world{min-height:390px;border-radius:24px}.world-copy{left:20px;top:20px;max-width:76%}.world-copy h3{font-size:30px}.hero-avatar{left:18px;bottom:18px}.float-label{font-size:9px;padding:7px 10px}.lab-label{right:10px;top:112px}.rowing-label{right:12px;bottom:105px}
    }
    @media(prefers-reduced-motion:reduce){.float-label,.map-node.current,.goal-node.current,.world .scene:after{animation:none!important}}
  `;
  document.head.appendChild(style);

  // Keep the enhancement decorative: existing HTML controls remain the real UI.
  document.documentElement.dataset.animeVisuals = 'enhanced';
})();
