// LifeVerse V2.5 — family member entries + approval-based permissions
(function(){
  function ensureV25(){
    if(!state.people.roy){
      state.people.roy={name:'Roy',avatar:'🧔🏻',avatarImage:'',managed:true,active:true,birthday:'',gender:'男',roles:['家长','支持者','探索者'],level:0,xp:0,nextXp:100,points:0,gameMinutes:0,streak:0,nameSetAt:'',goals:[],tasks:[],history:[{time:now(),type:'SYSTEM',text:'LifeVerse 人物建立',actor:'System'}]};
    }
    if(!state.permissions){
      state.permissions={
        owner:'rina',
        members:{
          rina:{canView:['rina','roy','alex','leo'],canEdit:['rina','roy','alex','leo'],canManageFamily:true},
          roy:{canView:['roy','alex','leo'],canEdit:['roy'],canManageFamily:false},
          alex:{canView:['alex'],canEdit:['alex'],canManageFamily:false},
          leo:{canView:['leo'],canEdit:['leo'],canManageFamily:false}
        }
      };
    }
    Object.entries(state.people).forEach(([k,p])=>{(p.tasks||[]).forEach(t=>{if(!t.createdBy)t.createdBy='rina';});});
    save();
  }
  ensureV25();

  const params=new URLSearchParams(location.search); const requested=params.get('user');
  if(requested && state.people[requested] && state.people[requested].active){state.activePerson=requested;save();}
  const viewer=requested && state.people[requested]?requested:'rina';
  window.lifeVerseViewer=viewer;
  function perm(){return state.permissions.members[viewer]||state.permissions.members.rina}
  function canView(k){return viewer==='rina'||perm().canView.includes(k)}
  function canEdit(k){return viewer==='rina'||perm().canEdit.includes(k)}
  function self(){return viewer===state.activePerson}

  const oldSwitcher=renderSwitcher;
  renderSwitcher=function(){
    const el=document.getElementById('characterSwitcher');
    el.innerHTML=Object.entries(state.people).filter(([k,p])=>p.active&&canView(k)).map(([k,p])=>`<button class="character-button ${k===state.activePerson?'active':''}" onclick="switchPerson('${k}')">${avatarHtml(p)}${p.name}</button>`).join('');
  };
  const oldSwitch=switchPerson;
  switchPerson=function(k){if(!canView(k))return alert('你没有查看这个人物的权限');oldSwitch(k)};

  const baseRenderTasks=renderTasks;
  renderTasks=function(){baseRenderTasks(); const p=person(); const el=document.getElementById('tasksView'); if(!el)return;
    const ownTasks=(p.tasks||[]).map(t=>`<div class="manage-row"><span><b>${t.title}</b><small>Created by ${t.createdBy||'rina'}</small></span>${t.createdBy===viewer?`<button class="btn-secondary" onclick="deleteOwnTask('${t.id}')">删除我创建的</button>`:''}</div>`).join('');
    if(canEdit(state.activePerson)) el.insertAdjacentHTML('beforeend',`<div class="panel section-spacer"><h3>＋ Add My Task · 添加我的任务</h3><p class="muted">你可以给自己添加任务；只能删除自己创建的任务。</p><div class="field"><label>任务名称</label><input id="selfTaskTitle" placeholder="例如：运动30分钟"></div><button class="btn-primary section-spacer" onclick="addSelfTask()">添加任务</button>${ownTasks}</div>`);
    else el.insertAdjacentHTML('afterbegin',`<div class="readonly-banner">👁 View only · 只读查看。你可以看 ${p.name} 的情况，但不能更改。</div>`);
  };
  window.addSelfTask=function(){let p=person(),title=document.getElementById('selfTaskTitle')?.value.trim();if(!title||!canEdit(state.activePerson))return;p.tasks.push({id:'t'+Date.now(),title,xp:10,points:5,minutes:0,done:false,createdBy:viewer});log(p,'TASK',`新增任务：${title}`,state.people[viewer].name);save();renderAll();showView('tasks')};
  window.deleteOwnTask=function(id){let p=person(),t=p.tasks.find(x=>x.id===id);if(!t||t.createdBy!==viewer)return alert('只能删除自己创建的任务');p.tasks=p.tasks.filter(x=>x.id!==id);log(p,'TASK',`删除自己创建的任务：${t.title}`,state.people[viewer].name);save();renderAll();showView('tasks')};

  const baseRenderShop=renderShop;
  renderShop=function(){baseRenderShop(); if(viewer==='roy'&&state.activePerson==='roy')document.getElementById('shopView').insertAdjacentHTML('beforeend',`<div class="panel section-spacer"><h3>Roy · Personal Rewards</h3><p class="muted">Roy 可以给自己增加奖励项目；只能管理自己创建的项目。</p><button class="btn-primary" onclick="addOwnReward()">＋ 添加我的奖励</button>${state.shop.filter(i=>i.createdBy==='roy').map(i=>`<div class="manage-row"><span><b>${i.title}</b><small>${i.cost} ◎</small></span><button class="btn-secondary" onclick="deleteOwnReward('${i.id}')">删除</button></div>`).join('')}</div>`)};
  window.addOwnReward=function(){let title=prompt('奖励名称');if(!title)return;let cost=+prompt('积分价格','20');if(!Number.isFinite(cost)||cost<0)return;state.shop.push({id:'s'+Date.now(),title,cost,type:'request',active:true,createdBy:viewer});save();renderAll();showView('shop')};
  window.deleteOwnReward=function(id){let i=state.shop.find(x=>x.id===id);if(!i||i.createdBy!==viewer)return alert('只能删除自己创建的奖励项目');state.shop=state.shop.filter(x=>x.id!==id);save();renderAll();showView('shop')};

  const baseRenderFamily=renderFamily;
  renderFamily=function(){
    if(viewer!=='rina'){
      const allowed=Object.entries(state.people).filter(([k,p])=>p.active&&canView(k));
      document.getElementById('familyView').innerHTML=`<div class="admin-banner"><strong>Family · 家庭</strong><span>${viewer==='roy'?'Roy：可查看孩子，只能编辑自己':'Child mode · 儿童模式'}</span></div><div class="grid grid-2">${allowed.map(([k,p])=>`<div class="panel"><h3>${p.name}</h3><p class="muted">Human Lv.${p.level} · ${p.xp}/${p.nextXp} XP</p><p>任务：${p.tasks.filter(t=>t.done).length}/${p.tasks.length}</p><p>目标：${p.goals.length}</p><button class="btn-secondary" onclick="switchPerson('${k}');showView('home')">查看</button></div>`).join('')}</div>`;
      return;
    }
    baseRenderFamily();
    document.getElementById('familyView').insertAdjacentHTML('afterbegin',`<div class="panel permission-panel"><h3>🔐 Permissions · 权限审批</h3><p class="muted">Rina 是 Family Owner。所有成员权限由你批准。</p><div class="permission-grid"><div><b>Roy</b><small>可查看：自己、Alex、Leo<br>可编辑：仅自己<br>不可修改孩子数据</small></div><div><b>Alex</b><small>仅自己的 LifeVerse</small></div><div><b>Leo</b><small>仅自己的 LifeVerse</small></div></div><p class="muted">原型阶段权限固定按本次确认执行；下一步可做成可切换审批开关。</p></div>`);
  };

  const oldSettings=renderSettings;
  renderSettings=function(){oldSettings();const el=document.getElementById('settingsView');if(el)el.insertAdjacentHTML('beforeend',`<div class="panel"><h3>🔗 Personal Entry Links · 个人入口</h3><p class="muted">这是原型入口，不是安全登录。正式账号系统后会替换。</p><div class="link-list">${Object.keys(state.people).filter(k=>state.people[k].active).map(k=>`<div class="manage-row"><span><b>${state.people[k].name}</b><small>?user=${k}</small></span><button class="btn-secondary" onclick="copyEntry('${k}')">复制入口</button></div>`).join('')}</div></div>`)};
  window.copyEntry=function(k){const u=location.origin+location.pathname+'?user='+k;navigator.clipboard?.writeText(u);alert(state.people[k].name+' 的入口链接已复制')};

  const prevRenderAll=renderAll; renderAll=function(){prevRenderAll();renderSettings()};
  renderAll();showView('home');
})();