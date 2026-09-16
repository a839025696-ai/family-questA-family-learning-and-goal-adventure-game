// LifeVerse six-zone child world maps — Alex and Leo.
(function () {
  const WORLDS = {
    Alex: [
      ['Habit Harbor','习惯港湾','home',0,0],
      ['Reading Ridge','阅读山脊','book',1,1],
      ['Science Lab','科学实验室','science',2,2],
      ['History Citadel','历史城堡','history',3,3],
      ['Rowing Coast','赛艇海岸','rowing',4,4],
      ['Future Tower','未来之塔','star',5,5]
    ],
    Leo: [
      ['Habit Camp','习惯营地','home',0,0],
      ['Animal Meadow','动物草原','dino',1,1],
      ['Dino Valley','恐龙谷','bone',2,2],
      ['Code Forest','代码森林','code',3,3],
      ['AI Sky Lab','AI天空实验室','robot',4,4],
      ['Future Tower','未来之塔','star',5,5]
    ]
  };

  const style = document.createElement('style');
  style.textContent = `
    .six-zone-map{min-height:650px!important;position:relative;overflow:hidden;background:linear-gradient(180deg,#dff5ff 0 30%,#f8f4d8 30% 64%,#dff3d4 64%)!important}
    .six-zone-map:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 12% 16%,rgba(255,255,255,.9) 0 6%,transparent 6.5%),radial-gradient(circle at 78% 12%,rgba(255,255,255,.7) 0 8%,transparent 8.5%);pointer-events:none}
    .six-zone-route{position:absolute;left:10%;right:10%;top:50%;height:8px;border-radius:99px;background:linear-gradient(90deg,#65d0ac,#64aef2,#9b7ceb,#ffbf67);transform:rotate(-10deg);box-shadow:0 0 0 5px rgba(255,255,255,.55)}
    .zone-node{position:absolute;width:150px;min-height:116px;padding:14px 10px;border-radius:24px;border:3px solid #fff;background:rgba(255,255,255,.95);box-shadow:0 14px 28px rgba(52,87,118,.18);z-index:3;text-align:center;color:#315678;transition:.2s}
    .zone-node .modern-icon{display:block;width:32px;height:32px;margin:0 auto 5px}.zone-node b,.zone-node small,.zone-node em{display:block}.zone-node b{font-size:12px}.zone-node small{font-size:8px;color:#8295aa;margin-top:3px}.zone-node em{font-style:normal;font-size:8px;margin-top:7px;font-weight:900}.zone-node.done{border-color:#71d2ae;background:#effdf6}.zone-node.current{border-color:#a98cf0;background:#f7f1ff;animation:zonePulse 1.8s ease-in-out infinite}.zone-node.locked{filter:grayscale(.55);opacity:.58}.zone-node.locked:after{content:'🔒';position:absolute;right:8px;top:7px;font-size:13px}.z1{left:4%;bottom:8%}.z2{left:19%;top:45%}.z3{left:36%;top:15%}.z4{right:35%;bottom:12%}.z5{right:18%;top:35%}.z6{right:3%;top:7%}
    .zone-legend{position:absolute;left:18px;top:18px;z-index:4;padding:10px 12px;border-radius:15px;background:rgba(255,255,255,.86);font-size:9px;color:#617b96;box-shadow:0 8px 20px rgba(61,91,121,.12)}
    @keyframes zonePulse{50%{transform:translateY(-5px);box-shadow:0 20px 36px rgba(117,86,190,.28)}}
    @media(max-width:700px){.six-zone-map{min-height:920px!important}.six-zone-route{left:48%;right:auto;top:10%;bottom:10%;width:7px;height:auto;transform:none}.zone-node{width:138px;min-height:110px}.z1{left:5%;bottom:4%}.z2{right:5%;left:auto;bottom:20%;top:auto}.z3{left:5%;top:auto;bottom:36%}.z4{right:5%;bottom:52%;top:auto}.z5{left:5%;top:17%}.z6{right:5%;top:3%}.zone-legend{top:auto;bottom:1%;left:50%;transform:translateX(-50%);white-space:nowrap}}
  `;
  document.head.appendChild(style);

  function zoneStatus(zone, index) {
    const p = P();
    const questCount = completed();
    const levelNeed = zone[3];
    const questNeed = zone[4];
    const unlocked = p.level >= levelNeed && questCount >= questNeed;
    const next = WORLDS[state.player].findIndex(z => !(p.level >= z[3] && questCount >= z[4]));
    if (unlocked && (next === -1 || index < next - 1)) return 'done';
    if (unlocked) return 'current';
    return 'locked';
  }

  function requirement(zone) {
    if (zone[3] === 0) return 'Starting zone · 起点';
    return `Lv.${zone[3]} + ${zone[4]} quests · 等级${zone[3]}＋${zone[4]}任务`;
  }

  const baseGoalsPage = goalsPage;
  goalsPage = function sixZoneGoalsPage() {
    const zones = WORLDS[state.player];
    if (!zones) return baseGoalsPage();
    return panelTitle(`${state.player} World · 6 Zones`, `${state.player} 六区域成长地图`) + `<div class="goalmap six-zone-map"><i class="six-zone-route"></i><div class="zone-legend">Complete quests + level up to unlock new zones · 完成任务并升级解锁新区</div>${zones.map((z,i)=>{const status=zoneStatus(z,i);return `<button class="zone-node z${i+1} ${status}" ${status==='locked'?'disabled':''} title="${requirement(z)}"><span class="modern-icon">${icon(z[2])}</span><b>${z[0]}</b><small>${z[1]}</small><em>${status==='locked'?requirement(z):status==='done'?'✓ Cleared · 已解锁':'★ Current Zone · 当前区域'}</em></button>`}).join('')}</div>`;
  };

  // Keep the compact home map in sync with the six-zone progression.
  const baseHome = home;
  home = function homeWithSixZoneSummary() {
    if (!WORLDS[state.player]) return baseHome();
    const html = baseHome();
    const unlocked = WORLDS[state.player].filter((z,i)=>zoneStatus(z,i)!=='locked').length;
    return html.replace('World Map <span class="zh">成长地图</span>', `World Map · ${unlocked}/6 <span class="zh">成长地图 · 已解锁 ${unlocked}/6</span>`);
  };

  render();
})();
