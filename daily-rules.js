// LifeVerse V2.14 — daily quest dates, time windows, expiry and half late rewards
(function(){
  const KEY='lifeverseLightV1';
  const pad=n=>String(n).padStart(2,'0');
  const ymd=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const dayNames=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const today=()=>ymd(new Date());
  const metaFor=t=>(window.state?.reminderMeta&&state.reminderMeta[t?.[5]])||{};
  const isDaily=m=>['daily','weekdays'].includes(m.repeat)||!!m.date;
  const taskDate=m=>m.date||today();
  const mins=s=>{if(!s)return null;const [h,m]=s.split(':').map(Number);return h*60+m};
  const nowMins=()=>{const d=new Date();return d.getHours()*60+d.getMinutes()+d.getSeconds()/60};
  const fmt=n=>Number.isInteger(n)?String(n):String(Math.round(n*100)/100);
  const dateLabel=date=>{const d=new Date(date+'T12:00:00');return `${date.replaceAll('-','/')} · ${dayNames[d.getDay()]}`};
  function status(m){
    if(!isDaily(m))return 'normal';
    if(taskDate(m)<today())return 'expired';
    if(taskDate(m)>today())return 'future';
    const end=mins(m.endTime||m.time);
    return end!==null&&nowMins()>end?'late':'ontime';
  }
  function saveState(){
    if(typeof state==='undefined')return;
    state.updatedAt=Date.now();localStorage.setItem(KEY,JSON.stringify(state));
  }

  // Mom editor: add a start/end time window. Existing single time becomes end time for compatibility.
  function enhanceMom(){
    if(!document.title.includes('Mom'))return;
    const editor=document.getElementById('editor'); if(!editor)return;
    const selected=window.selectedId||globalThis.selectedId; if(!selected||typeof findTask!=='function')return;
    const x=findTask(selected); if(!x||editor.querySelector('#lv-time-window'))return;
    const anchor=editor.querySelector('#e-time')?.closest('.field'); if(!anchor)return;
    const box=document.createElement('div');box.id='lv-time-window';box.className='field';
    box.innerHTML=`<label>每日任务时间区间</label><div class="grid2"><input id="lv-start" type="time" value="${x.m.startTime||''}" aria-label="开始时间"><input id="lv-end" type="time" value="${x.m.endTime||x.m.time||''}" aria-label="截止时间"></div><div style="font-size:11px;color:#8e8e93;margin-top:6px">截止前 100% 奖励 · 截止后至 23:59 奖励 50% · 00:00 后过期</div>`;
    anchor.insertAdjacentElement('afterend',box);
    const commit=()=>{x.m.startTime=box.querySelector('#lv-start').value;x.m.endTime=box.querySelector('#lv-end').value;x.m.time=x.m.endTime;if(typeof save==='function')save('time-window');};
    box.querySelectorAll('input').forEach(el=>{el.addEventListener('input',commit);el.addEventListener('change',commit)});
    // XP / coins may be decimal values.
    ['e-xp','e-coins'].forEach(id=>{const el=document.getElementById(id);if(el){el.step='0.5';el.min='0';}});
  }
  if(document.title.includes('Mom')){
    new MutationObserver(()=>enhanceMom()).observe(document.body,{childList:true,subtree:true});
    setTimeout(enhanceMom,100);
    return;
  }

  function decorateChild(){
    if(typeof state==='undefined'||typeof P!=='function')return;
    const tasks=P().tasks||[];
    document.querySelectorAll('.game-quest,.current-focus').forEach((card,i)=>{
      const task=tasks[i]||tasks.find(t=>card.textContent.includes(t[0]));if(!task)return;
      const m=metaFor(task);if(!isDaily(m))return;
      if(card.querySelector('.lv-daily-rule'))return;
      const st=status(m), start=m.startTime||'', end=m.endTime||m.time||'';
      const line=document.createElement('div');line.className='lv-daily-rule';
      line.style.cssText='margin:8px 0;padding:7px 9px;border-radius:10px;background:#f3f6fa;font-size:9px;font-weight:800;color:#60758d';
      const reward=st==='late'?`${fmt(Number(task[2]||0)/2)} XP · ${fmt(Number(task[3]||0)/2)} Coins`:`${fmt(Number(task[2]||0))} XP · ${fmt(Number(task[3]||0))} Coins`;
      line.textContent=`📅 ${dateLabel(taskDate(m))}${start||end?`  ⏰ ${start||'00:00'}–${end||'23:59'}`:''}  · ${st==='expired'?'🔒 Expired':st==='late'?'Late · 50% reward':'On time · 100% reward'} · ${reward}`;
      card.prepend(line);
      if(st==='expired')card.querySelectorAll('button').forEach(b=>{if(/complete|finish|cleared/i.test(b.textContent)){b.disabled=true;b.textContent='Expired · 已过期';}});
    });
  }

  // Enforce expiry and late reward at the actual completion click.
  if(typeof completeTask==='function'){
    const base=completeTask;
    completeTask=function(index){
      const task=typeof P==='function'?P().tasks[index]:null;if(!task)return base(index);
      const m=metaFor(task),st=status(m);
      if(st==='expired'||st==='future'){
        if(typeof toast==='function')toast(st==='expired'?'This daily quest expired at midnight.':'This quest is not available yet.');
        return;
      }
      if(st==='late'){
        const xp=Number(task[2]||0),coins=Number(task[3]||0);task[2]=xp/2;task[3]=coins/2;
        try{return base(index)}finally{task[2]=xp;task[3]=coins;saveState();}
      }
      return base(index);
    };
  }
  const style=document.createElement('style');style.textContent='.lv-daily-rule+*{margin-top:4px}.quest-card button:disabled{opacity:.45;cursor:not-allowed}';document.head.appendChild(style);
  new MutationObserver(()=>decorateChild()).observe(document.body,{childList:true,subtree:true});
  setTimeout(decorateChild,150);
  // Crossing midnight makes yesterday's open page expire without manual refresh.
  setInterval(decorateChild,30000);
})();
