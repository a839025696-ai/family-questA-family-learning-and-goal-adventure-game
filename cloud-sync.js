// LifeVerse cloud sync — Supabase realtime bridge
(function () {
  const URL = 'https://akanblwhlejhkfvsuvxv.supabase.co';
  const KEY = 'sb_publishable__256m4XdYqv05feUlpKiFw_6gus4DWW';
  const FAMILY_ID = 'lifeverse-family';
  const LOCAL_KEY = 'lifeverseLightV1';
  let applyingRemote = false;
  let saveTimer = null;
  let lastPayload = localStorage.getItem(LOCAL_KEY) || '';

  function headers(extra) {
    return Object.assign({ apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }, extra || {});
  }
  function readLocal() {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}'); } catch (_) { return {}; }
  }
  function applyRemote(payload) {
    if (!payload || typeof payload !== 'object') return;
    const text = JSON.stringify(payload);
    const current = localStorage.getItem(LOCAL_KEY) || '';
    if (text === current || text === lastPayload) {
      lastPayload = text;
      return;
    }
    applyingRemote = true;
    lastPayload = text;
    localStorage.setItem(LOCAL_KEY, text);
    window.dispatchEvent(new CustomEvent('lifeverse-cloud-update', { detail: payload }));
    setTimeout(() => { applyingRemote = false; location.reload(); }, 80);
  }
  async function pull() {
    try {
      const r = await fetch(`${URL}/rest/v1/lifeverse_family_state?family_id=eq.${encodeURIComponent(FAMILY_ID)}&select=payload`, { headers: headers() });
      if (!r.ok) throw new Error(`pull ${r.status}`);
      const rows = await r.json();
      if (rows[0] && rows[0].payload) applyRemote(rows[0].payload);
      else await pushNow();
    } catch (e) { console.warn('LifeVerse cloud pull unavailable', e); }
  }
  async function pushNow() {
    if (applyingRemote) return;
    const payload = readLocal();
    const text = JSON.stringify(payload);
    if (!text || text === lastPayload) return;
    try {
      const r = await fetch(`${URL}/rest/v1/lifeverse_family_state?on_conflict=family_id`, {
        method: 'POST', headers: headers({ Prefer: 'resolution=merge-duplicates,return=minimal' }),
        body: JSON.stringify({ family_id: FAMILY_ID, payload, updated_at: new Date().toISOString() })
      });
      if (!r.ok) throw new Error(`push ${r.status}`);
      lastPayload = text;
    } catch (e) { console.warn('LifeVerse cloud push unavailable', e); }
  }
  function queuePush() { clearTimeout(saveTimer); saveTimer = setTimeout(pushNow, 250); }

  const originalSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function (key, value) {
    originalSetItem.apply(this, arguments);
    if (this === localStorage && key === LOCAL_KEY && !applyingRemote) queuePush();
  };
  window.addEventListener('storage', (e) => { if (e.key === LOCAL_KEY && !applyingRemote) queuePush(); });

  function startRealtime() {
    try {
      const ws = new WebSocket(`${URL.replace('https://','wss://')}/realtime/v1/websocket?apikey=${encodeURIComponent(KEY)}&vsn=1.0.0`);
      let ref = 1;
      ws.onopen = () => ws.send(JSON.stringify({ topic: 'realtime:public:lifeverse_family_state', event: 'phx_join', payload: { config: { broadcast: { self: false }, presence: { key: '' }, postgres_changes: [{ event: '*', schema: 'public', table: 'lifeverse_family_state', filter: `family_id=eq.${FAMILY_ID}` }] } }, ref: String(ref++) }));
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.event === 'postgres_changes' && msg.payload && msg.payload.data && msg.payload.data.record && msg.payload.data.record.payload) applyRemote(msg.payload.data.record.payload);
        } catch (_) {}
      };
      ws.onclose = () => setTimeout(startRealtime, 2500);
      ws.onerror = () => ws.close();
    } catch (_) { setTimeout(startRealtime, 5000); }
  }

  window.LifeVerseCloud = { pull, push: pushNow };
  pull().then(startRealtime);
})();
