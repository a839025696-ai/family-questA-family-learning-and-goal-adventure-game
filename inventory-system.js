// LifeVerse inventory + equipment system
// Loaded after the core game so it can extend the real interactive UI without replacing it.
(function () {
  const ITEMS = [
    { id:'explorer-badge', name:'Explorer Badge', zh:'探索者徽章', icon:'star', slot:'badge', unlock:() => true },
    { id:'starter-pack', name:'Adventure Pack', zh:'冒险背包', icon:'gift', slot:'gear', unlock:() => true },
    { id:'lab-goggles', name:'Lab Goggles', zh:'实验护目镜', icon:'science', slot:'gear', unlock:(p) => p.level >= 2 },
    { id:'dino-pack', name:'Dino Pack', zh:'恐龙背包', icon:'dino', slot:'gear', players:['Leo'], unlock:(p) => p.level >= 2 },
    { id:'mini-telescope', name:'Mini Telescope', zh:'迷你望远镜', icon:'science', slot:'gear', players:['Alex'], unlock:(p) => p.level >= 4 },
    { id:'rowing-medal', name:'Rowing Medal', zh:'赛艇奖牌', icon:'rowing', slot:'badge', players:['Alex'], unlock:(p) => p.level >= 5 }
  ];

  if (!state.inventory || typeof state.inventory !== 'object') state.inventory = {};
  if (!state.equipped || typeof state.equipped !== 'object') state.equipped = {};

  function bag(name) {
    if (!Array.isArray(state.inventory[name])) state.inventory[name] = ['explorer-badge','starter-pack'];
    return state.inventory[name];
  }
  function equipment(name) {
    if (!state.equipped[name] || typeof state.equipped[name] !== 'object') state.equipped[name] = {};
    return state.equipped[name];
  }
  function available(item, name) {
    return (!item.players || item.players.includes(name)) && item.unlock(DATA[name]);
  }
  function syncUnlocks(name) {
    const owned = bag(name);
    ITEMS.forEach(item => {
      if (available(item, name) && !owned.includes(item.id)) owned.push(item.id);
    });
  }
  function itemById(id) { return ITEMS.find(item => item.id === id); }
  function equippedLabel(name) {
    const eq = equipment(name);
    const labels = Object.values(eq).map(itemById).filter(Boolean).map(item => item.name);
    return labels.length ? labels.join(' · ') : 'Nothing equipped yet';
  }

  window.equipLifeVerseItem = function equipLifeVerseItem(id) {
    const item = itemById(id);
    if (!item || !bag(state.player).includes(id)) return;
    const eq = equipment(state.player);
    eq[item.slot] = eq[item.slot] === id ? null : id;
    save();
    render();
    toast(eq[item.slot] ? `${item.name} equipped!` : `${item.name} removed`, eq[item.slot] ? '装备成功！' : '已卸下');
  };

  const originalAssetsPage = assetsPage;
  assetsPage = function inventoryEquipmentPage() {
    const name = state.player;
    syncUnlocks(name);
    const owned = bag(name);
    const eq = equipment(name);
    const cards = ITEMS.filter(item => !item.players || item.players.includes(name)).map(item => {
      const has = owned.includes(item.id);
      const active = eq[item.slot] === item.id;
      return `<div class="lv-inventory-item ${has?'owned':'locked'} ${active?'equipped':''}">
        <div class="lv-item-icon modern-icon">${icon(item.icon)}</div>
        <div class="lv-item-copy"><b>${item.name}</b><small>${item.zh} · ${item.slot === 'gear' ? '装备' : '徽章'}</small></div>
        ${has ? `<button class="action ${active?'lv-equipped-btn':''}" onclick="equipLifeVerseItem('${item.id}')">${active?'Equipped ✓':'Equip'}</button>` : `<span class="lv-lock">🔒 Level ${item.id==='rowing-medal'?5:item.id==='mini-telescope'?4:2}</span>`}
      </div>`;
    }).join('');
    return panelTitle('Inventory & Equipment','背包与装备') + `
      <section class="lv-loadout card">
        <div class="lv-loadout-head"><div><span class="eyebrow">${name.toUpperCase()} LOADOUT</span><h3>Current Equipment</h3><small>当前装备 · ${equippedLabel(name)}</small></div><strong>${owned.length}</strong><span class="zh">已收藏</span></div>
      </section>
      <div class="lv-inventory-grid">${cards}</div>
      <div class="card lv-inventory-note"><b>How it works · 装备规则</b><p>Items stay in each character’s inventory after refresh. Level rewards unlock automatically, and each equipment slot can hold one active item.</p><span class="zh">每个人的背包独立保存；达到等级会自动解锁。每个装备槽一次只能装备一件。</span></div>`;
  };

  const style = document.createElement('style');
  style.textContent = `
    .lv-loadout{margin-bottom:14px;background:linear-gradient(135deg,#fff8df,#eef5ff)}
    .lv-loadout-head{display:grid;grid-template-columns:1fr auto;align-items:center;gap:8px}.lv-loadout-head h3{margin:4px 0 2px;font-size:22px}.lv-loadout-head small{color:#7f93ab}.lv-loadout-head strong{font-size:34px;color:#6c7fe0}.lv-loadout-head>.zh{grid-column:2;text-align:center}
    .lv-inventory-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px}.lv-inventory-item{min-height:178px;padding:16px;border-radius:22px;background:#fff;border:1px solid #e1ebf7;box-shadow:0 12px 30px rgba(74,113,157,.1);display:flex;flex-direction:column;align-items:flex-start}.lv-inventory-item.equipped{border-color:#8bcbb4;background:linear-gradient(155deg,#f1fff9,#fffaf0);box-shadow:0 15px 34px rgba(78,165,132,.16)}.lv-inventory-item.locked{opacity:.58;filter:grayscale(.35)}.lv-item-icon{width:48px;height:48px;padding:10px;border-radius:15px;background:linear-gradient(135deg,#e7f5ff,#f2eaff)}.lv-item-copy{margin:12px 0 auto}.lv-item-copy b,.lv-item-copy small{display:block}.lv-item-copy b{font-size:14px}.lv-item-copy small{margin-top:3px;color:#8a9db5;font-size:9px}.lv-inventory-item .action{width:100%;margin-top:12px}.lv-equipped-btn{background:linear-gradient(135deg,#58c99f,#5fa7e8)!important}.lv-lock{margin-top:14px;font-size:9px;font-weight:900;color:#8293a7}.lv-inventory-note{margin-top:14px}.lv-inventory-note p{font-size:10px;color:#7188a3;margin-bottom:5px}
    @media(max-width:900px){.lv-inventory-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:600px){.lv-inventory-grid{grid-template-columns:1fr}.lv-inventory-item{min-height:145px}.lv-loadout-head h3{font-size:19px}}
  `;
  document.head.appendChild(style);

  ['Alex','Leo','Rina','Roy'].forEach(syncUnlocks);
  save();
  if (state.page === 'assets') render();
})();