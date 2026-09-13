// LifeVerse V2.12 — immersive family adventure + role-specific entry modes + categorized tasks/subtasks.
(function () {
  const style = document.createElement('style');
  style.textContent = `
    .chapter-head{display:flex;justify-content:space-between;gap:20px;align-items:center;margin:0 0 14px;padding:18px 20px;border-radius:22px;background:linear-gradient(135deg,#fff7dd,#edf5ff);border:1px solid #eadbb8;box-shadow:0 12px 30px rgba(49,78,108,.11)}
    .chapter-kicker{font-size:9px;font-weight:1000;letter-spacing:1.6px;color:#a5782d}.chapter-head h3{font-family:Georgia,serif;font-size:25px;margin:4px 0;color:#274d7e}.chapter-head p{margin:0;color:#71859d;font-size:11px}.chapter-progress{min-width:105px;text-align:center;padding:12px;border-radius:18px;background:rgba(255,255,255,.7)}.chapter-progress strong{display:block;font-size:28px}.chapter-progress span{font-size:8px;color:#8596aa}
    .adventure-map{min-height:620px;background:linear-gradient(180deg,#dff5ff 0%,#f8fbef 47%,#e8f0d1 100%);border:3px solid #f3e5bf;box-shadow:inset 0 0 60px rgba(65,126,157,.12),0 16px 38px rgba(46,77,107,.13)}
    .adventure-map:before,.adventure-map:after{content:'';position:absolute;border-radius:50%;background:rgba(104,192,142,.22);filter:blur(1px)}.adventure-map:before{width:290px;height:160px;left:-40px;bottom:40px}.adventure-map:after{width:250px;height:140px;right:-20px;top:45px}
    .path-ribbon{position:absolute;left:12%;right:12%;top:49%;height:9px;border-radius:99px;background:linear-gradient(90deg,#69d3b0 0 25%,#65aef2 25% 55%,#9b7cea 55% 77%,#d5c8b3 77%);transform:rotate(-7deg);box-shadow:0 0 0 5px rgba(255,255,255,.5)}
    .game-stage{width:178px;min-height:145px;padding:16px 13px 12px;border-radius:28px!important;z-index:3;background:rgba(255,251,240,.96);border:3px solid #fff;box-shadow:0 16px 30px rgba(54,86,115,.18)}.game-stage.current{animation:stagePulse 1.9s ease-in-out infinite;border-color:#c6a3ff;background:linear-gradient(160deg,#fffaf0,#f1eaff)}.game-stage.done{border-color:#78d7b5;background:linear-gradient(160deg,#f4fff9,#e9fbf3)}.game-stage.locked{opacity:.6;filter:grayscale(.45)}
    @keyframes stagePulse{50%{transform:translateY(-4px) scale(1.02);box-shadow:0 22px 40px rgba(126,91,195,.28)}}
    .stage-badge{position:absolute;top:10px;right:12px;font-size:7px;font-weight:1000;letter-spacing:1px;padding:4px 7px;border-radius:999px;background:#edf2f7;color:#71849c}.current .stage-badge{background:#efe5ff;color:#8157c8}.done .stage-badge{background:#dcf7ec;color:#3b9676}.stage-mark{position:absolute;left:10px;top:9px;width:27px;height:27px;border-radius:50%;display:grid;place-items:center;background:#fff;box-shadow:0 4px 10px rgba(60,84,110,.12);font-size:12px}.game-stage .modern-icon{width:34px;height:34px;margin:17px auto 4px}.game-stage b{font-size:13px}.game-stage small{display:block;margin-top:3px;line-height:1.3}.game-stage em{display:block;margin-top:8px;font-style:normal;font-size:8px;color:#8a9aac}
    .quest-summary{display:grid;grid-template-columns:140px 1fr auto;gap:14px;align-items:center;padding:16px 18px;margin-bottom:14px;border-radius:22px;background:linear-gradient(135deg,#fff7da,#f1edff);border:1px solid #ebddbc}.quest-summary>div:first-child span,.quest-summary>div:first-child small{display:block;font-size:8px;color:#8b7a5b}.quest-summary strong{font-size:27px}.quest-summary-bar{height:13px;border-radius:999px;background:rgba(255,255,255,.72);overflow:hidden;box-shadow:inset 0 1px 3px rgba(42,65,89,.12)}.quest-summary-bar i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#65d1ae,#68aef3,#9a7bea)}.quest-summary-reward{font-size:10px;font-weight:900;color:#755f2f}
    .game-quest-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.game-quest{position:relative;overflow:hidden;padding-top:20px}.game-quest:before{content:'';position:absolute;left:0;top:0;right:0;height:5px;background:linear-gradient(90deg,#65b5f2,#987be9)}.quest-cleared:before{background:#68d0ac}.quest-cleared{background:linear-gradient(160deg,#f5fff9,#fffaf0)}.quest-number{position:absolute;right:14px;top:14px;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:#eff4fa;color:#66809d;font-size:9px;font-weight:1000}.quest-cleared .quest-number{background:#dff8ee;color:#3d9878}.quest-loot{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0}.quest-loot span{font-size:8px;font-weight:900;padding:5px 7px;border-radius:999px;background:#f1f5fb;color:#5e7894}
    .cat-chip{display:inline-flex;align-items:center;gap:4px;margin:0 0 7px;padding:5px 8px;border-radius:999px;font-size:8px;font-weight:1000;letter-spacing:.4px}.cat-life{background:#e6f8ee;color:#348765}.cat-study{background:#e8f2ff;color:#3974b6}.cat-interest{background:#f4eaff;color:#8058b4}
    .subtask-list{display:grid;gap:6px;margin:10px 0 12px;padding:10px;border-radius:14px;background:#f7f9fc}.subtask{display:flex;align-items:center;gap:8px;border:0;background:transparent;text-align:left;color:#516b86;cursor:pointer;padding:3px}.subtask i{width:20px;height:20px;display:grid;place-items:center;border-radius:7px;border:1px solid #cfdaea;background:#fff;font-style:normal;font-size:10px}.subtask.done{color:#6c9b83;text-decoration:line-through}.subtask.done i{background:#68cfaa;color:#fff;border-color:#68cfaa}.subtask-note{display:block;font-size:8px;color:#8da0b5;margin-top:4px}
    .mom-v212{margin-top:18px;padding:22px;border-radius:26px;background:linear-gradient(145deg,#fffaf0,#f3efff);border:1px solid #e2d9ef;box-shadow:0 16px 42px rgba(77,122,174,.13)}.mom-v212-head{display:flex;justify-content:space-between;gap:14px;align-items:center}.mom-v212-head h2{margin:4px 0;font-size:23px}.mom-v212-head p{margin:0;color:#8297b2;font-size:10px}.mom-v212-head select{padding:10px 12px;border:1px solid #d7e1ef;border-radius:12px;background:#fff;font-weight:800}.task-tabs{display:flex;gap:7px;flex-wrap:wrap;margin:16px 0}.task-tabs button{border:1px solid #dbe4ef;background:#fff;border-radius:999px;padding:8px 11px;font-size:9px;font-weight:900;cursor:pointer}.task-tabs button.active{background:#274d7e;color:#fff;border-color:#274d7e}.mom-task-v212{display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:center;padding:12px 0;border-top:1px solid #e9edf4}.mom-task-v212:first-child{border-top:0}.mom-task-v212 b,.mom-task-v212 small{display:block}.mom-task-v212 small{margin-top:4px;color:#899bb0;font-size:8px}.mom-task-v212 button{border:0;border-radius:10px;padding:7px 9px;background:#eaf4ff;color:#497ab4;font-size:9px;font-weight:900;cursor:pointer}.mom-task-v212 button.danger{background:#fff0f2;color:#cc5f77}.mom-form-v212{display:grid;grid-template-columns:1.2fr 1.6fr 1.6fr .55fr .55fr auto;gap:9px;align-items:end;margin-top:16px;padding-top:16px;border-top:1px solid #e0e6ef}.mom-form-v212 label{font-size:9px;font-weight:900;color:#687f99}.mom-form-v212 input,.mom-form-v212 select,.mom-form-v212 textarea{width:100%;margin-top:5px;padding:10px;border:1px solid #d8e2ef;border-radius:11px;background:#fff;color:#284b6e}.mom-form-v212 textarea{min-height:78px;resize:vertical}.mom-form-v212 button{border:0;border-radius:12px;padding:12px 14px;background:linear-gradient(135deg,#5aa7ff,#8d7cf0);color:#fff;font-size:10px;font-weight:1000;cursor:pointer}
    body[data-mode="child"] .players{display:none!important}body[data-mode="child"] .tiles{grid-template-columns:repeat(3,1fr)}
    @media(max-width:1000px){.mom-form-v212{grid-template-columns:1fr 1fr}.mom-form-v212 label:nth-child(2),.mom-form-v212 label:nth-child(3),.mom-form-v212 button{grid-column:1/-1}}
    @media(max-width:900px){.game-quest-grid{grid-template-columns:repeat(2,1fr)}.chapter-head{align-items:flex-start}.quest-summary{grid-template-columns:1fr}.quest-summary-reward{text-align:left}}
    @media(max-width:600px){.game-quest-grid{grid-template-columns:1fr}.chapter-head{display:block}.chapter-progress{margin-top:12px}.adventure-map{min-height:720px}.game-stage{width:145px;min-height:132px}.quest-summary{display:block}.quest-summary-bar{margin:10px 0}.mom-v212-head{display:block}.mom-v212-head select{width:100%;margin-top:10px}.mom-form-v212{grid-template-columns:1fr}.mom-form-v212>*{grid-column:1!important}}
  `;
  document.head.appendChild(style);

  const params = new URLSearchParams(window.location.search);
  const requestedMode = (params.get('mode') || '').toLowerCase();
  const requestedPlayer = params.get('player');
  const allowedChildren = ['Alex', 'Leo'];
  const isChildMode = requestedMode === 'child' && allowedChildren.includes(requestedPlayer);
  const isParentMode = requestedMode === 'parent';
  const CATS = {life:['日常生活','🏠'],study:['学习任务','📚'],interest:['兴趣活动','🎨']};

  if (isChildMode) {
    state.player = requestedPlayer;
    state.page = 'home';
  } else if (isParentMode) {
    state.player = requestedPlayer || 'Rina';
  }
  if (!state.subDone) state.subDone = {};
  if (!state.adminCategory) state.adminCategory = 'all';

  function safeText(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function taskCategory(task){
    if (task[6] && CATS[task[6]]) return task[6];
    const s=((task[0]||'')+' '+(task[1]||'')+' '+(task[4]||'')).toLowerCase();
    if(/sport|row|football|soccer|music|art|draw|dino|club|piano|兴趣|运动|画|音乐/.test(s)) return 'interest';
    if(/clean|room|bed|dish|shower|brush|laundry|生活|房间|刷牙|洗澡/.test(s)) return 'life';
    return 'study';
  }
  function subtasks(task){return Array.isArray(task[7])?task[7]:[];}
  function subKey(task,index){return `${state.player}-${task[5]||task[0]}-sub-${index}`;}
  function allSubsDone(task){const subs=subtasks(task);return !subs.length||subs.every((_,i)=>!!state.subDone[subKey(task,i)]);}
  function catChip(task){const c=taskCategory(task),meta=CATS[c];return `<span class="cat-chip cat-${c}">${meta[1]} ${meta[0]}</span>`;}

  DATA && Object.keys(DATA).forEach(name=>{
    (DATA[name].tasks||[]).forEach(t=>{if(!t[6]) t[6]=taskCategory(t);if(!Array.isArray(t[7])) t[7]=[];});
  });

  const completeTaskBase = completeTask;
  completeTask = function completeTaskWithSubtasks(index){
    const task=P().tasks[index];
    if(task && !state.done[k(index)] && !allSubsDone(task)){
      toast('Finish the subtasks first','请先完成所有子任务');
      return;
    }
    return completeTaskBase(index);
  };

  window.toggleSubtask = function toggleSubtask(taskIndex, subIndex){
    const task=P().tasks[taskIndex]; if(!task) return;
    const key=subKey(task,subIndex); state.subDone[key]=!state.subDone[key]; save(); render();
  };

  goalsPage = function gameGoalsPage() {
    const p = P();
    const c = completed();
    const unlocked = Math.min(p.goals.length - 1, Math.max(1, c));
    return panelTitle('Adventure Path','冒险路线') + `
      <div class="chapter-head">
        <div><span class="chapter-kicker">${state.player.toUpperCase()} · CHAPTER 1</span><h3>${state.player === 'Leo' ? 'Dino Valley Expedition' : 'Bright Future Expedition'}</h3><p>Complete daily quests to unlock the next checkpoint.</p></div>
        <div class="chapter-progress"><strong>${c}</strong><span>quests cleared</span></div>
      </div>
      <div class="goalmap adventure-map"><div class="path-ribbon"></div>${p.goals.map((g,i)=>{
        const status=i===0?'done':i<=unlocked?'current':'locked'; const tag=status==='done'?'CLEARED':status==='current'?'NEXT':'LOCKED'; const mark=status==='done'?'✓':status==='locked'?'🔒':'✦'; const need=Math.max(0,i-c);
        return `<button class="goal-node game-stage g${i+1} ${status}"><span class="stage-badge">${tag}</span><span class="stage-mark">${mark}</span><span class="modern-icon">${icon(g[2])}</span><b>${g[0]}</b><small>${g[1]}</small>${status==='locked'?`<em>${need} more quest${need===1?'':'s'} to unlock</em>`:'<em>Tap into your next adventure</em>'}</button>`;
      }).join('')}</div>`;
  };

  tasksPage = function gameTasksPage() {
    const p=P(),c=completed();
    return panelTitle('Quest Hall','任务大厅')+`<div class="quest-summary"><div><span>TODAY'S RUN</span><strong>${c}/${p.tasks.length}</strong><small>quests complete</small></div><div class="quest-summary-bar"><i style="width:${p.tasks.length?Math.min(100,c/p.tasks.length*100):0}%"></i></div><div class="quest-summary-reward">🎁 ${c>=3?'Mystery Box ready':'Complete 3 quests for a Mystery Box'}</div></div><div class="quest-grid game-quest-grid">${p.tasks.map((t,i)=>{
      const done=state.done[k(i)], subs=subtasks(t), subsDone=subs.filter((_,si)=>state.subDone[subKey(t,si)]).length;
      return `<div class="quest-card game-quest ${done?'quest-cleared':''}"><div class="quest-number">${done?'✓':String(i+1).padStart(2,'0')}</div>${catChip(t)}<div class="icon modern-icon">${icon(t[4])}</div><h3>${safeText(t[0])}</h3><p>${safeText(t[1])}</p>${subs.length?`<div class="subtask-list">${subs.map((s,si)=>{const sd=!!state.subDone[subKey(t,si)];return `<button class="subtask ${sd?'done':''}" onclick="toggleSubtask(${i},${si})"><i>${sd?'✓':''}</i><span>${safeText(s)}</span></button>`}).join('')}<span class="subtask-note">${subsDone}/${subs.length} 子任务完成</span></div>`:''}<div class="quest-loot"><span>+${t[2]} XP</span><span>+${t[3]} Coins</span></div><button class="action" onclick="completeTask(${i})">${done?'Quest Cleared ✓':subs.length&&!allSubsDone(t)?'Finish Subtasks':'Complete Quest'}</button></div>`;
    }).join('')}</div>`;
  };

  function adminTargetName(){if(!['Alex','Leo','Rina','Roy'].includes(state.adminTarget)) state.adminTarget='Alex';return state.adminTarget;}
  function advancedAdminRows(){
    const name=adminTargetName(), filter=state.adminCategory||'all';
    const rows=DATA[name].tasks.map((t,i)=>({t,i,c:taskCategory(t)})).filter(x=>filter==='all'||x.c===filter);
    return rows.length?rows.map(({t,i,c})=>`<div class="mom-task-v212"><span>${catChip(t)}<b>${safeText(t[0])}</b><small>${safeText(t[1]||'')} · ${subtasks(t).length} 个子任务 · ${t[2]} XP · ${t[3]} 金币</small></span><button onclick="editAdvancedTask(${i})">修改</button><button class="danger" onclick="removeAdvancedTask(${i})">删除</button></div>`).join(''):'<div class="mom-empty">这个分类还没有任务。</div>';
  }

  familyPage = function advancedFamilyPage(){
    const name=adminTargetName();
    return panelTitle('Family','家庭中心')+`<div class="family-grid">${['Alex','Leo','Rina','Roy'].map(n=>`<div class="member-card ${state.player===n?'active':''}" onclick="pick('${n}')"><div class="avatar">${avatar(n==='Leo'?'Leo':'Alex')}</div><h3>${n}</h3><span class="zh">${DATA[n].title}</span></div>`).join('')}</div><section class="mom-v212"><div class="mom-v212-head"><div><span class="chapter-kicker">MOM ADMIN · 妈妈后台</span><h2>发布任务</h2><p>日常生活、学习、兴趣活动都可以发布，并可拆成多个子任务。</p></div><select onchange="selectAdvancedTarget(this.value)">${['Alex','Leo','Rina','Roy'].map(n=>`<option value="${n}" ${n===name?'selected':''}>${n}</option>`).join('')}</select></div><div class="task-tabs">${[['all','全部'],['life','🏠 日常生活'],['study','📚 学习任务'],['interest','🎨 兴趣活动']].map(x=>`<button class="${state.adminCategory===x[0]?'active':''}" onclick="setAdminCategory('${x[0]}')">${x[1]}</button>`).join('')}</div><div>${advancedAdminRows()}</div><div class="mom-form-v212"><label>分类<select id="mom-cat"><option value="life">日常生活</option><option value="study">学习任务</option><option value="interest">兴趣活动</option></select></label><label>主任务<input id="mom-title" placeholder="例如：完成数学作业"></label><label>子任务（每行一个）<textarea id="mom-subs" placeholder="口算 20 题\n应用题 3 题\n订正错题"></textarea></label><label>XP<input id="mom-xp" type="number" min="0" value="30"></label><label>金币<input id="mom-coins" type="number" min="0" value="5"></label><button onclick="publishAdvancedTask()">＋ 发布给 ${name}</button></div></section>`;
  };

  window.selectAdvancedTarget=function(name){state.adminTarget=name;save();render();};
  window.setAdminCategory=function(cat){state.adminCategory=cat;save();render();};
  window.publishAdvancedTask=function(){
    const name=adminTargetName(),title=document.getElementById('mom-title').value.trim(),cat=document.getElementById('mom-cat').value,xp=Math.max(0,Number(document.getElementById('mom-xp').value)||0),coins=Math.max(0,Number(document.getElementById('mom-coins').value)||0),subs=document.getElementById('mom-subs').value.split(/\n/).map(s=>s.trim()).filter(Boolean);
    if(!title)return toast('Please enter a task name','请填写主任务');
    const labels={life:'日常生活',study:'学习任务',interest:'兴趣活动'};
    DATA[name].tasks.push([title,labels[cat],xp,coins,cat==='study'?'book':cat==='interest'?'star':'home',`custom-${Date.now()}`,cat,subs]);
    save();render();toast(`Quest published for ${name}`,`已发布给 ${name}`);
  };
  window.editAdvancedTask=function(index){
    const name=adminTargetName(),t=DATA[name].tasks[index];if(!t)return;
    const title=prompt('主任务',t[0]);if(title===null||!title.trim())return;
    const cat=prompt('分类：life=日常生活 / study=学习 / interest=兴趣',taskCategory(t));if(cat===null||!CATS[cat])return;
    const sub=prompt('子任务，每行一个',subtasks(t).join('\n'));if(sub===null)return;
    const xp=prompt('XP 奖励',t[2]);if(xp===null)return;const coins=prompt('金币奖励',t[3]);if(coins===null)return;
    t[0]=title.trim();t[6]=cat;t[7]=sub.split(/\n/).map(s=>s.trim()).filter(Boolean);t[2]=Math.max(0,Number(xp)||0);t[3]=Math.max(0,Number(coins)||0);save();render();toast('Quest updated','任务已修改');
  };
  window.removeAdvancedTask=function(index){const name=adminTargetName(),t=DATA[name].tasks[index];if(!t||!confirm(`删除 ${t[0]}？`))return;delete state.done[`${name}-${t[5]}`];subtasks(t).forEach((_,si)=>delete state.subDone[`${name}-${t[5]}-sub-${si}`]);DATA[name].tasks.splice(index,1);save();render();toast('Quest removed','任务已删除');};

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
      const playerStrip = document.querySelector('.players'); if (playerStrip) playerStrip.style.display = 'none';
      document.querySelectorAll('.nav button').forEach(btn => {const text=(btn.textContent||'').toLowerCase();if(text.includes('family')||text.includes('家庭')||text.includes('admin')||text.includes('管理'))btn.style.display='none';});
      document.querySelectorAll('.mom-admin,.mom-v212').forEach(el=>el.style.display='none');
      document.querySelectorAll('.tile').forEach(tile=>{const text=(tile.textContent||'').toLowerCase();if(text.includes('family')||text.includes('家庭'))tile.style.display='none';});
      const greeting=document.getElementById('greeting');if(greeting)greeting.textContent=`Welcome back, ${requestedPlayer}!`;
    }
  };

  save();
  render();
})();
