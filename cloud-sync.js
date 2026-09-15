// LifeVerse cloud sync — reliable cross-device Supabase bridge
(function () {
  const URL='https://akanblwhlejhkfvsuvxv.supabase.co';
  const KEY='sb_publishable__256m4XdYqv05feUlpKiFw_6gus4DWW';
  const FAMILY_ID='lifeverse-family';
  const LOCAL_KEY='lifeverseLightV1';
  let applyingRemote=false, saveTimer=null, pollTimer=null;
  let lastCloudText='';
  const originalSetItem=Storage.prototype.setItem;
  // Supabase publishable keys are API keys, not JWTs. Sending one as a Bearer JWT
  // can make PostgREST reject the request. Use the apikey header only.
  function headers(extra){return Object.assign({apikey:KEY,'Content-Type':'application/json'},extra||{});}
  function localText(){return localStorage.getItem(LOCAL_KEY)||'';}
  function readLocal(){try{return JSON.parse(localText()||'{}')}catch(_){return {}}}
  function normalize(v){try{return JSON.stringify(typeof v==='string'?JSON.parse(v):v)}catch(_){return ''}}
  function applyRemote(payload){
    if(!payload||typeof payload!=='object')return;
    const remote=normalize(payload),current=normalize(localText());lastCloudText=remote;
    if(!remote||remote===current)return;
    applyingRemote=true;originalSetItem.call(localStorage,LOCAL_KEY,remote);applyingRemote=false;
    window.dispatchEvent(new CustomEvent('lifeverse-cloud-update',{detail:payload}));
    const marker='lv-cloud-applied';
    if(sessionStorage.getItem(marker)!==remote){sessionStorage.setItem(marker,remote);setTimeout(()=>location.reload(),80);}
  }
  async function pull(){
    try{
      const r=await fetch(`${URL}/rest/v1/lifeverse_family_state?family_id=eq.${encodeURIComponent(FAMILY_ID)}&select=payload,updated_at`,{headers:headers(),cache:'no-store'});
      if(!r.ok)throw new Error(`pull ${r.status}: ${await r.text()}`);const rows=await r.json();
      if(rows[0]&&rows[0].payload)applyRemote(rows[0].payload);else await pushNow(true);
    }catch(e){console.warn('LifeVerse cloud pull unavailable',e);}
  }
  async function pushNow(force=false){
    if(applyingRemote)return;const payload=readLocal(),text=normalize(payload);if(!text||(!force&&text===lastCloudText))return;
    try{
      const r=await fetch(`${URL}/rest/v1/lifeverse_family_state?on_conflict=family_id`,{method:'POST',headers:headers({Prefer:'resolution=merge-duplicates,return=minimal'}),body:JSON.stringify({family_id:FAMILY_ID,payload,updated_at:new Date().toISOString()})});
      if(!r.ok)throw new Error(`push ${r.status}: ${await r.text()}`);lastCloudText=text;
    }catch(e){console.warn('LifeVerse cloud push unavailable',e);}
  }
  function queuePush(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>pushNow(false),180);}
  Storage.prototype.setItem=function(key,value){originalSetItem.apply(this,arguments);if(this===localStorage&&key===LOCAL_KEY&&!applyingRemote)queuePush();};
  window.addEventListener('storage',e=>{if(e.key===LOCAL_KEY&&!applyingRemote)queuePush();});
  function startRealtime(){
    try{
      const ws=new WebSocket(`${URL.replace('https://','wss://')}/realtime/v1/websocket?apikey=${encodeURIComponent(KEY)}&vsn=1.0.0`);let ref=1;
      ws.onopen=()=>ws.send(JSON.stringify({topic:'realtime:public:lifeverse_family_state',event:'phx_join',payload:{config:{broadcast:{self:false},presence:{key:''},postgres_changes:[{event:'*',schema:'public',table:'lifeverse_family_state',filter:`family_id=eq.${FAMILY_ID}`}] }},ref:String(ref++)}));
      ws.onmessage=e=>{try{const m=JSON.parse(e.data),r=m&&m.payload&&m.payload.data&&m.payload.data.record;if(m.event==='postgres_changes'&&r&&r.payload)applyRemote(r.payload)}catch(_){}};
      ws.onclose=()=>setTimeout(startRealtime,3000);ws.onerror=()=>ws.close();
    }catch(_){setTimeout(startRealtime,5000);}
  }
  function startPolling(){clearInterval(pollTimer);pollTimer=setInterval(()=>{if(!document.hidden)pull();},3000);}
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)pull();});window.addEventListener('pageshow',()=>pull());
  window.LifeVerseCloud={pull,push:()=>pushNow(true)};
  pull().then(()=>{startRealtime();startPolling();});
})();
