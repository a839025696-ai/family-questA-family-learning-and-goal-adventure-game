(() => {
  'use strict';

  const STYLE_ID = 'lifeverse-anime-world-v4';
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

    /* Six-zone maps now read like RPG destinations rather than dashboard cards. */
    .six-zone-map{background:linear-gradient(180deg,#9fddff 0%,#dff5ff 25%,#f8edc8 52%,#bde5b7 100%)!important;box-shadow:inset 0 0 70px rgba(62,112,166,.13),0 20px 45px rgba(51,94,135,.14)}
    .six-zone-map:after{content:"";position:absolute;inset:0;pointer-events:none;z-index:1;background:radial-gradient(ellipse at 8% 82%,rgba(54,154,103,.25) 0 8%,transparent 8.5%),radial-gradient(ellipse at 88% 76%,rgba(45,133,94,.20) 0 10%,transparent 10.5%),radial-gradient(circle at 82% 10%,rgba(255,242,151,.8) 0 3%,rgba(255,242,151,.18) 9%,transparent 16%)}
    .six-zone-route{z-index:2;background:linear-gradient(90deg,#58cfa4,#56b8ee,#9a7ee9,#f5b85d);box-shadow:0 0 0 5px rgba(255,255,255,.58),0 0 24px rgba(104,176,230,.35)}
    .zone-node{overflow:visible;backdrop-filter:blur(9px);transform-origin:center;transition:transform .22s ease,box-shadow .22s ease,filter .22s ease;background:linear-gradient(155deg,rgba(255,255,255,.97),rgba(245,251,255,.88))}
    .zone-node:not(:disabled):hover{transform:translateY(-6px) scale(1.035);box-shadow:0 20px 38px rgba(50,89,126,.25)}
    .zone-node:before{content:"";position:absolute;left:50%;top:-18px;width:42px;height:24px;transform:translateX(-50%);border-radius:50% 50% 38% 38%;opacity:.9;z-index:-1;box-shadow:0 5px 12px rgba(55,92,112,.15)}
    .zone-node.z1:before{background:linear-gradient(145deg,#73d59c,#3cae7a)}
    .zone-node.z2:before{background:linear-gradient(145deg,#79c6ff,#597ee8)}
    .zone-node.z3:before{background:linear-gradient(145deg,#ffd56d,#f39a61)}
    .zone-node.z4:before{background:linear-gradient(145deg,#9a8cff,#6e62d8)}
    .zone-node.z5:before{background:linear-gradient(145deg,#64d9d2,#3b9fc5)}
    .zone-node.z6:before{background:linear-gradient(145deg,#ffd76d,#ff9f6c)}
    .zone-node.current{outline:4px solid rgba(255,255,255,.45);outline-offset:4px;animation:lvZoneAura 2s ease-in-out infinite}
    .zone-node.done{box-shadow:0 12px 30px rgba(53,163,119,.18)}
    .zone-node.locked{backdrop-filter:blur(5px);filter:grayscale(.72) saturate(.55);opacity:.62}
    .zone-node .modern-icon{filter:drop-shadow(0 4px 5px rgba(50,78,105,.16));transition:transform .22s ease}
    .zone-node:not(:disabled):hover .modern-icon{transform:scale(1.14) rotate(-3deg)}
    .zone-legend{border:1px solid rgba(255,255,255,.82);backdrop-filter:blur(12px)}

    @keyframes lvFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    @keyframes lvSparkle{0%{transform:translate3d(0,0,0)}50%{opacity:.72}100%{transform:translate3d(18px,-12px,0)}}
    @keyframes lvQuestPulse{0%,100%{box-shadow:0 7px 18px rgba(69,126,171,.18),0 0 0 0 rgba(153,119,239,.26)}50%{box-shadow:0 9px 22px rgba(69,126,171,.22),0 0 0 8px rgba(153,119,239,0)}}
    @keyframes lvZoneAura{0%,100%{box-shadow:0 14px 30px rgba(117,86,190,.24),0 0 0 0 rgba(169,140,240,.30)}50%{box-shadow:0 20px 42px rgba(117,86,190,.31),0 0 0 12px rgba(169,140,240,0)}}
    @media(max-width:760px){
      .world{min-height:390px;border-radius:24px}.world-copy{left:20px;top:20px;max-width:76%}.world-copy h3{font-size:30px}.hero-avatar{left:18px;bottom:18px}.float-label{font-size:9px;padding:7px 10px}.lab-label{right:10px;top:112px}.rowing-label{right:12px;bottom:105px}
      .six-zone-map{border-radius:24px}.zone-node{backdrop-filter:blur(7px)}.zone-node:not(:disabled):hover{transform:none}.zone-node.current{outline-width:3px;outline-offset:2px}
    }
    @media(prefers-reduced-motion:reduce){.float-label,.map-node.current,.goal-node.current,.world .scene:after,.zone-node.current{animation:none!important}.zone-node{transition:none!important}}
  `;
  document.head.appendChild(style);

  // Decorative only: the existing HTML buttons and JS state remain the real UI.
  document.documentElement.dataset.animeVisuals = 'rpg-v4';
})();
