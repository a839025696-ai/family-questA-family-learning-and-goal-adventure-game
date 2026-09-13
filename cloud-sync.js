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

  // The main UI keeps XP / coins / level in DATA while save() serializes state.
  // Mirror those mutable values into state.progress so refreshes and cloud sync
  // never reset a child's earned progress. Existing saves without progress remain valid.
  function canReadGameData() {
    return typeof DATA !== 'undefined' && DATA && typeof DATA === 'object';
  }
  function progressSnapshot() {
    if (!canReadGameData()) return null;
    const out = {};
    Object.keys(DATA).forEach((name) => {
      const p = DATA[name];
      if (!p) return;
      out[name] = {
        level: Number(p.level) || 0,
        xp: Number(p.xp) || 0,
        next: Number(p.next) || 100,
        coins: Number(p.coins) || 0,
        streak: Number(p.streak) || 0
      };
    });
    return out;
  }
  function hydrateProgress(payload) {
    if (!canReadGameData() || !payload || !payload.progress) return;
    Object.entries(payload.progress).forEach(([name, saved]) => {
      const p = DATA[name];
      if (!p || !saved) return;
      ['level', 'xp', 'next', 'coins', 'streak'].forEach((field) => {
        if (Number.isFinite(Number(saved[field]))) p[field] = Number(saved[field]);
      });
    });
  }
  function enrichProgress(value) {
    if (!canReadGameData()) return value;
    try {
      const payload = JSON.parse(value || '{}');
      payload.progress = progressSnapshot();
      return JSON.stringify(payload);
    } catch (_) {
      return value;
    }
  }

  // Rehydrate before the first render-side interaction. This is deliberately
  // tolerant of the older schema, which had no progress object.
  hydrateProgress(readLocal());

  function applyRemote(payload) {
    if (!payload || typeof payload !== 'object') return;
    const text = JSON.stringify(payload);
    const current = localStorage.getItem(LOCAL_KEY) || '';
    if (text === current || text === lastPayload) {
      lastPayload = text;
      hydrateProgress(payload);
      return;
    }
    applyingRemote = true;
    lastPayload = text;
    originalSetItem.call(localStorage, LOCAL_KEY, text);
    hydrateProgress(payload);
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
    let payload = readLocal();
    const progress = progressSnapshot();
    if (progress) payload.progress = progress;
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
    let nextValue = value;
    if (this === localStorage && key === LOCAL_KEY && !applyingRemote) nextValue = enrichProgress(value);
    originalSetItem.call(this, key, nextValue);
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

  window.LifeVerseCloud = { pull, push: pushNow, progressSnapshot };
  pull().then(startRealtime);
})();
