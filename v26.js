// LifeVerse V2.6 — immersive bilingual game dashboard (no private likeness assets in public repo)
(function(){
  const PEOPLE_ART={
    rina:{glyph:'✦',role:'Creator · Planner · Explorer',cn:'创造者 · 规划者 · 探索者',pose:'SWEET-COOL · 甜酷探索'},
    roy:{glyph:'▲',role:'Dad · Supporter · Adventurer',cn:'家长 · 支持者 · 探索者',pose:'SUPPORT · EXPLORE'},
    alex:{glyph:'◆',role:'Science · History · Sports',cn:'科学 · 历史 · 运动',pose:'FOCUS · DISCOVER'},
    leo:{glyph:'●',role:'Animals · Games · AI',cn:'动物 · 游戏 · AI',pose:'CURIOUS · CREATE'}
  };
  function keyOfActive(){return state.activePerson||'rina'}
  function artOf(k=keyOfActive()){return PEOPLE_ART[k]||{glyph:'✦',role:'Explorer',cn:'探索者',pose:'EXPLORE'}}
  function safeCount(a){return Array.isArray(a)?a.length:0}
  function activeAssets(p){return (state.assetTypes||[]).filter(a=>a.active).slice(0,6).map(a=>({name:a.name,icon:a.icon,value:a.id==='points'?p.points:a.id==='game'?p.gameMinutes:0}))}
  function memberCard(k,p){const a=artOf(k);return `<button class="v26-member-card" onclick="switchPerson('${k}')"><span class="v26-member-portrait ${k}"><i>${a.glyph}</i></span><b>${p.name}</b><small>${k==='rina'?'Owner':k==='roy'?'Dad':k==='alex'?'哥哥':'弟弟'}</small></button>`}
  function taskRows(p){if(!p.tasks.length)return `<div class="v26-empty">今天还没有任务 · No quests yet</div>`;return p.tasks.slice(0,4).map(t=>`<div class="v26-task ${t.done?'done':''}"><button onclick="toggleTask('${t.id}')">${t.done?'✓':'□'}</button><span>${t.title}</span><small>+${t.xp} XP · +${t.points} ◎</small></div>`).join('')}
  renderHome=function(){
    const p=person(),k=keyOfActive(),a=artOf(k),done=p.tasks.filter(t=>t.done).length,total=p.tasks.length,goal=p.goals[0];
    document.getElementById('homeView').innerHTML=`<div class="v26-dashboard">
      <section class="v26-world-hero">
        <div class="v26-sky-copy"><span>✦ LIFEVERSE WORLD</span><h3>Good evening, ${p.name}!</h3><p>更好的自己，更广阔的世界。<br><small>A Better Me · A Bigger World</small></p></div>
        <div class="v26-floating-city"><i></i><i></i><i></i><i></i><i></i></div>
        <div class="v26-character ${k}"><div class="v26-character-glow"></div><div class="v26-character-face">${a.glyph}</div><strong>${p.name}</strong><span>${a.role}</span><small>${a.cn}</small><em>${a.pose}</em></div>
        <div class="v26-family-strip">${Object.entries(state.people).filter(([id,x])=>x.active&&(!window.lifeVerseViewer||window.lifeVerseViewer==='rina'||id===window.lifeVerseViewer||window.lifeVerseViewer==='roy'&&['roy','alex','leo'].includes(id))).map(([id,x])=>memberCard(id,x)).join('')}</div>
      </section>
      <aside class="v26-profile-hud"><div class="v26-profile-top"><span class="v26-mini-portrait ${k}">${a.glyph}</span><div><h3>${p.name}</h3><p>${a.cn}</p></div><button onclick="showView('settings')">编辑资料</button></div><blockquote>“Small steps every day make a big life.”</blockquote><div class="v26-level"><b>Human Lv. ${p.level}</b><span>${p.xp} / ${p.nextXp} XP</span><i><u style="width:${Math.min(100,p.xp/p.nextXp*100)}%"></u></i></div><div class="v26-stats"><button onclick="showView('wallet')"><em>◎</em><b>${p.points}</b><small>积分<br>Points</small></button><button onclick="showView('wallet')"><em>🎮</em><b>${p.gameMinutes}</b><small>游戏时间<br>Game Time</small></button><button><em>★</em><b>0</b><small>成就<br>Badges</small></button><button onclick="showView('family')"><em>⌂</em><b>${Object.values(state.people).filter(x=>x.active).length}</b><small>家庭成员<br>Family</small></button></div></aside>
      <section class="v26-focus"><div class="v26-card-head"><h3>⚡ 今日任务 <small>Today's Tasks</small></h3><button onclick="showView('tasks')">查看全部 ›</button></div>${taskRows(p)}<button class="v26-start" onclick="showView('tasks')">▶ 开始任务 <small>Start Quest</small></button></section>
      <section class="v26-week"><div class="v26-card-head"><h3>✦ 本周进度 <small>Weekly Progress</small></h3><b>${total?Math.round(done/total*100):0}%</b></div><div class="v26-weekdots">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i)=>`<span class="${i<done?'on':''}"><i></i><small>${d}</small></span>`).join('')}</div><div class="v26-chest">🏆<small>完成 7 天<br>解锁宝箱!</small></div></section>
      <section class="v26-bottom-grid">
        <button class="v26-feature goals" onclick="showView('roadmap')"><span>🎯</span><h3>我的目标 <small>My Goals</small></h3><p>${goal?.title||'设定目标，走向更远的自己。'}</p><b>${safeCount(p.goals)} 总目标</b></button>
        <button class="v26-feature assets" onclick="showView('wallet')"><span>✦</span><h3>成长资产 <small>Growth Assets</small></h3><div class="v26-mini-assets">${activeAssets(p).slice(0,4).map(x=>`<i>${x.icon}<b>${x.value}</b><small>${x.name}</small></i>`).join('')}</div></button>
        <button class="v26-feature shop" onclick="showView('shop')"><span>◇</span><h3>奖励商店 <small>Reward Shop</small></h3><p>用积分兑换你喜欢的奖励。</p></button>
        <button class="v26-feature family" onclick="showView('family')"><span>♧</span><h3>家庭 <small>Family</small></h3><p>不同的道路，同一个家。<br>Different Paths, One Family.</p></button>
      </section>
    </div>`
  };
  function poseBanner(view,title,subtitle){const p=person(),k=keyOfActive(),a=artOf(k);return `<div class="v26-page-hero ${view}"><div><span>✦ ${subtitle}</span><h3>${title}</h3><p>${a.cn} · ${a.pose}</p></div><div class="v26-page-character ${k}"><i>${a.glyph}</i><b>${p.name}</b></div></div>`}
  const baseTasks=renderTasks; renderTasks=function(){baseTasks();document.getElementById('tasksView')?.insertAdjacentHTML('afterbegin',poseBanner('tasks','完成今天的任务，真实世界也会升级。','QUEST MODE · 任务模式'))};
  const baseRoad=renderRoadmap; renderRoadmap=function(){baseRoad();document.getElementById('roadmapView')?.insertAdjacentHTML('afterbegin',poseBanner('goals','一步一步，走向你真正想去的地方。','LIFE PATH · 人生路线'))};
  const baseWallet=renderWallet; renderWallet=function(){baseWallet();document.getElementById('walletView')?.insertAdjacentHTML('afterbegin',poseBanner('assets','看得见的积累，构成未来的你。','GROWTH ASSETS · 成长资产'))};
  const baseShop=renderShop; renderShop=function(){baseShop();document.getElementById('shopView')?.insertAdjacentHTML('afterbegin',poseBanner('shop','努力值得被奖励。','REWARD SHOP · 奖励商店'))};
  const baseFamily=renderFamily; renderFamily=function(){baseFamily();document.getElementById('familyView')?.insertAdjacentHTML('afterbegin',poseBanner('family','不同的道路，同一个家。','FAMILY · 家庭'))};
  function ensureExtraViews(){const main=document.querySelector('.main-content');[['skills','Skills · 技能'],['calendar','Calendar · 日历'],['achievements','Achievements · 成就']].forEach(([id])=>{if(!document.getElementById(id+'View')){const s=document.createElement('section');s.id=id+'View';s.className='view';main.appendChild(s)}})}
  window.renderSkills=function(){let p=person();document.getElementById('skillsView').innerHTML=poseBanner('skills','让能力像技能树一样一点点点亮。','SKILLS · 技能')+`<div class="v26-skill-tree">${['学习 Learning','健康 Health','生活 Life','理财 Finance','沟通 Communication','探索 Explore'].map((x,i)=>`<div class="v26-skill-node"><i>${['📚','💪','🏠','◎','💬','🚀'][i]}</i><b>${x}</b><small>Lv.0 · Coming next</small></div>`).join('')}</div>`}
  window.renderCalendar=function(){document.getElementById('calendarView').innerHTML=poseBanner('calendar','把学校、运动、家庭和人生放在同一张地图上。','CALENDAR · 日历')+`<div class="panel"><h3>Calendar · 日历</h3><p class="muted">V2.6 先建立入口；下一阶段接真正的活动与重复日程。</p></div>`}
  window.renderAchievements=function(){document.getElementById('achievementsView').innerHTML=poseBanner('achievements','每一次坚持，都值得留下一个徽章。','ACHIEVEMENTS · 成就')+`<div class="v26-badges">${['First Step','7 Day Streak','Goal Clear','Family Quest','Explorer','Helper'].map((x,i)=>`<div><i>${['✦','🔥','🏆','♧','🚀','♡'][i]}</i><b>${x}</b><small>Locked</small></div>`).join('')}</div>`}
  ensureExtraViews();
  const oldShow=showView; showView=function(v){if(v==='skills')renderSkills();if(v==='calendar')renderCalendar();if(v==='achievements')renderAchievements();oldShow(v)};
  const oldAll=renderAll;renderAll=function(){oldAll();ensureExtraViews();renderSkills();renderCalendar();renderAchievements()};
  renderAll();showView('home');
})();