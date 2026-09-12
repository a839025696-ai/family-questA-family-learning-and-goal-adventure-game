const STORAGE_KEY = 'lifeVerseV2';

const defaultState = {
  activeChild: 'alex',
  children: {
    alex: {
      name: 'Alex', avatar: '🧑‍🚀', level: 1284, xp: 320, nextXp: 500, coins: 145, streak: 6,
      title: '科学探索者',
      goals: [
        { title: '建立稳定学习习惯', detail: '每天完成学习任务并保持连续记录', status: 'completed' },
        { title: '科学探索', detail: '每周完成科学阅读、观察或实验', status: 'current' },
        { title: '历史与金融启蒙', detail: '逐步建立自己的知识地图', status: 'locked' },
        { title: '未来职业探索', detail: '探索医学、科学、服务与其他人生可能', status: 'locked' }
      ],
      tasks: [
        { id: 'a1', title: '数学练习 25 分钟', xp: 30, coins: 8, done: false },
        { id: 'a2', title: '英文阅读 20 分钟', xp: 25, coins: 6, done: false },
        { id: 'a3', title: '科学/历史自由探索', xp: 35, coins: 10, done: false }
      ]
    },
    leo: {
      name: 'Leo', avatar: '🦖', level: 932, xp: 210, nextXp: 400, coins: 118, streak: 4,
      title: '探索者',
      goals: [
        { title: '建立稳定学习习惯', detail: '短任务、及时反馈、每天完成一点', status: 'completed' },
        { title: '动物与古生物', detail: '阅读、观察并建立自己的知识卡片', status: 'current' },
        { title: '编程探索', detail: '从逻辑训练逐步进入真正的编程', status: 'locked' },
        { title: 'AI 与网络世界', detail: '未来逐步探索 AI、数据与网络安全', status: 'locked' }
      ],
      tasks: [
        { id: 'l1', title: '数学小任务 20 分钟', xp: 30, coins: 8, done: false },
        { id: 'l2', title: '英文阅读 15 分钟', xp: 25, coins: 6, done: false },
        { id: 'l3', title: '动物/恐龙知识任务', xp: 35, coins: 10, done: false }
      ]
    }
  }
};

let state = loadState();
let currentView = 'home';
function loadState(){try{const saved=localStorage.getItem(STORAGE_KEY);return saved?JSON.parse(saved):structuredClone(defaultState)}catch{return JSON.parse(JSON.stringify(defaultState))}}
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function child(){return state.children[state.activeChild]}
function renderAll(){renderSwitcher();renderHome();renderRoadmap();renderTasks();renderMom()}
function renderSwitcher(){const el=document.getElementById('characterSwitcher');el.innerHTML=Object.entries(state.children).map(([key,c])=>`<button class="character-button ${key===state.activeChild?'active':''}" onclick="switchChild('${key}')"><span class="avatar">${c.avatar}</span>${c.name}</button>`).join('')}
function switchChild(key){state.activeChild=key;saveState();renderAll()}
function statsHtml(c){return `<div class="grid grid-3"><div class="stat-card"><div class="stat-icon">◈</div><div><p class="stat-label">HUMAN LEVEL</p><strong class="stat-value">Lv. ${c.level.toLocaleString()} / 10,000</strong></div></div><div class="stat-card"><div class="stat-icon">◎</div><div><p class="stat-label">成长积分</p><strong class="stat-value">${c.coins}</strong></div></div><div class="stat-card"><div class="stat-icon">↗</div><div><p class="stat-label">连续行动</p><strong class="stat-value">${c.streak} 天</strong></div></div></div>`}
function renderHome(){const c=child();const pct=Math.min(100,(c.level/10000)*100);const remaining=c.tasks.filter(t=>!t.done).length;document.getElementById('homeView').innerHTML=`<div class="hero-card"><div><p>${c.name} · HUMAN ${c.level.toLocaleString()}</p><h3>${c.title}</h3><p>人生不是一次通关。今天还有 ${remaining} 项行动等待完成。</p><div class="progress-wrap"><div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div><div class="progress-meta"><span>Human Lv. ${c.level.toLocaleString()}</span><span>Lifetime · 10,000</span></div></div></div><div class="hero-emoji">${c.avatar}</div></div>${statsHtml(c)}<div class="grid grid-2 section-spacer"><div class="panel"><h3>当前人生路线</h3>${c.goals.filter(g=>g.status==='current').map(g=>`<strong>${g.title}</strong><p class="muted">${g.detail}</p>`).join('')}<button class="btn-secondary" onclick="showView('roadmap')">查看人生路线</button></div><div class="panel"><h3>Today</h3><p class="muted">${c.tasks.filter(t=>t.done).length}/${c.tasks.length} 已完成</p><button class="btn-primary" onclick="showView('tasks')">进入今日行动</button></div></div>`}
function renderRoadmap(){const c=child();document.getElementById('roadmapView').innerHTML=`<div class="panel"><h3>${c.name} · Life Path</h3><p class="muted">目标会随着人生阶段逐渐展开。已经获得的能力不会因为改变方向而消失。</p><div class="roadmap section-spacer">${c.goals.map((g,i)=>`<div class="road-node ${g.status}"><span class="road-dot"></span><div class="road-card"><strong>${i+1}. ${g.title}</strong><span class="muted">${g.detail}</span></div></div>`).join('')}</div></div>`}
function renderTasks(){const c=child();document.getElementById('tasksView').innerHTML=`<div class="panel"><h3>${c.name} · Today</h3><p class="muted">现实中的行动推动 Human Level、技能和人生路线。</p><div class="task-list section-spacer">${c.tasks.map(t=>`<div class="task-item ${t.done?'done':''}"><div class="task-main"><button class="task-check" onclick="toggleTask('${t.id}')">${t.done?'✓':''}</button><div><div class="task-title">${t.title}</div><div class="muted">+${t.xp} XP</div></div></div><div class="reward">+${t.coins} ◎</div></div>`).join('')}</div></div>`}
function toggleTask(id){const c=child(),task=c.tasks.find(t=>t.id===id);if(!task)return;if(!task.done){task.done=true;c.xp+=task.xp;c.coins+=task.coins;if(c.xp>=c.nextXp&&c.level<10000){c.xp-=c.nextXp;c.level+=1}}else{task.done=false;c.xp=Math.max(0,c.xp-task.xp);c.coins=Math.max(0,c.coins-task.coins)}saveState();renderAll()}
function renderMom(){const c=child();document.getElementById('momView').innerHTML=`<div class="grid grid-2"><div class="panel"><h3>Family · 新增任务</h3><p class="muted">当前管理：${c.name}</p><div class="form-grid"><div class="field" style="grid-column:1/-1"><label>任务名称</label><input id="newTaskTitle" placeholder="例如：数学练习 20 分钟"></div><div class="field"><label>经验值 XP</label><input id="newTaskXp" type="number" value="25" min="0"></div><div class="field"><label>成长积分</label><input id="newTaskCoins" type="number" value="5" min="0"></div></div><div class="row section-spacer"><button class="btn-primary" onclick="addTask()">添加今日任务</button></div></div><div class="panel"><h3>调整人生目标</h3><div class="field"><label>目标名称</label><input id="goalTitle" value="${c.goals.find(g=>g.status==='current')?.title||''}"></div><div class="field section-spacer"><label>目标说明</label><input id="goalDetail" value="${c.goals.find(g=>g.status==='current')?.detail||''}"></div><div class="row section-spacer"><button class="btn-primary" onclick="updateCurrentGoal()">保存目标</button></div></div><div class="panel"><h3>手动奖励</h3><p class="muted">家庭管理者可以对现实中的额外行动给予奖励。</p><div class="row"><button class="btn-secondary" onclick="bonus(20,5)">+20 XP / +5 ◎</button><button class="btn-secondary" onclick="bonus(50,15)">+50 XP / +15 ◎</button></div></div><div class="panel"><h3>Prototype Data</h3><p class="muted">当前仍然只保存在浏览器。本阶段不产生云服务器费用。</p><button class="btn-secondary" onclick="resetDemo()">恢复 LifeVerse 演示数据</button></div></div>`}
function addTask(){const title=document.getElementById('newTaskTitle').value.trim(),xp=Number(document.getElementById('newTaskXp').value)||0,coins=Number(document.getElementById('newTaskCoins').value)||0;if(!title)return alert('请先填写任务名称');child().tasks.push({id:`${state.activeChild}-${Date.now()}`,title,xp,coins,done:false});saveState();renderAll();alert('任务已经添加')}
function updateCurrentGoal(){const g=child().goals.find(x=>x.status==='current');if(!g)return;g.title=document.getElementById('goalTitle').value.trim()||g.title;g.detail=document.getElementById('goalDetail').value.trim()||g.detail;saveState();renderAll();alert('目标已经保存')}
function bonus(xp,coins){const c=child();c.xp+=xp;c.coins+=coins;saveState();renderAll()}
function resetDemo(){if(!confirm('确定恢复 LifeVerse 初始演示数据吗？'))return;state=JSON.parse(JSON.stringify(defaultState));saveState();renderAll()}
function showView(view){currentView=view;document.querySelectorAll('.view').forEach(el=>el.classList.remove('active'));document.getElementById(`${view}View`).classList.add('active');document.querySelectorAll('.nav-item').forEach(el=>el.classList.toggle('active',el.dataset.view===view));const titles={home:'今天，继续你的人生。',roadmap:'你正在成为怎样的人？',tasks:'今天的现实行动',mom:'Family · 家庭管理'};document.getElementById('pageTitle').textContent=titles[view]}
document.querySelectorAll('.nav-item').forEach(btn=>btn.addEventListener('click',()=>showView(btn.dataset.view)));renderAll();
