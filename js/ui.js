// DARKFLOW // 界面层
import {
  S, fmt, clock, itemDef, vendorOf, catOf, rarityOf, priceDelta, netWorth, inventoryValue,
  buyListing, inspectOrder, resolveFake, sellInv, cancelSell, auctionBid, snipe, refundAuction,
  buyCompany, companyCost, companiesOwned, mix, newIdentity, resolveEvent, markMsgsRead, unread,
  contractProgress, retire, triggerEnding, crackReward, cleanReward, subscribe, save, wipe, newGame, load, pushMsg, exportCode, importCode,
  tick, aiAuctionTick,
} from './engine.js';
import { CATS, RARITY, VENDORS, COMPANIES, CONTRACTS, NPCS, ACHIEVEMENTS, BROADCASTS, TERMINAL_HELP, META, FLAVOR, AUCTION_POOL, ITEMS } from './data.js';
import { initAudio, sfx, setSound } from './audio.js';
import { crackGame, cleanGame, snipeGame } from './minigames.js';
import { drawShareCard } from './sharecard.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const stars = (r) => '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r));
const riskDots = (r) => {
  const n = clamp(Math.ceil(r / 2), 1, 5);
  return `<span class="dots">${Array.from({ length: 5 }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</span>`;
};

let view = 'market';
let cargoTab = 'transit';
let mktFilter = { cat: 'all', q: '', sort: 'price' };
let termLines = [];
let modalActions = [];
let eventShown = null;
let endingShown = false;
let started = false;
let timers = [];
let broadcasts = [];
let lastCredits = 0;
let busy = false;

// ═══════════════════════════════════════════════════════════
// 基础组件
// ═══════════════════════════════════════════════════════════
function openModal({ title, sub = '', body = '', actions = [], wide = false, esc: closable = true }) {
  closeModal();
  modalActions = actions;
  const root = $('#modal-root');
  root.innerHTML = `
    <div class="modal-back" data-back>
      <div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div><div class="mh-title">${title}</div>${sub ? `<div class="mh-sub">${sub}</div>` : ''}</div>
          <button class="x" data-x aria-label="关闭">✕</button>
        </div>
        <div class="modal-body"></div>
        ${actions.length ? `<div class="modal-foot">${actions.map((a, i) => `<button class="btn ${a.primary ? 'primary' : ''} ${a.danger ? 'danger' : ''}" data-act="${i}">${a.label}</button>`).join('')}</div>` : ''}
      </div>
    </div>`;
  const bodyEl = $('.modal-body', root);
  if (typeof body === 'string') bodyEl.innerHTML = body; else if (body) bodyEl.appendChild(body);
  root.classList.add('open');
  $('[data-x]', root).onclick = closeModal;
  $('[data-back]', root).onclick = (e) => { if (e.target === e.currentTarget && closable) closeModal(); };
  $$('[data-act]', root).forEach((b) => {
    b.onclick = () => {
      sfx('click');
      const a = modalActions[+b.dataset.act];
      if (a && a.onClick) a.onClick(bodyEl, b);
    };
  });
  document.body.classList.add('modal-open');
  sfx('open');
  return bodyEl;
}

function closeModal() {
  const root = $('#modal-root');
  if (!root.classList.contains('open')) return;
  root.classList.remove('open');
  root.innerHTML = '';
  document.body.classList.remove('modal-open');
  sfx('close');
}

function modalBodyEl() { return $('#modal-root .modal-body'); }

let lastToast = { at: 0, title: '' };
function toast(kind, title, text = '') {
  if (lastToast.title === title && Date.now() - lastToast.at < 2500) return;
  lastToast = { at: Date.now(), title };
  const wrap = $('#toasts');
  const n = document.createElement('div');
  n.className = 'toast ' + kind;
  n.innerHTML = `<div class="t-ico">${kind === 'good' ? '✓' : kind === 'warn' ? '!' : kind === 'bad' ? '✕' : '›'}</div>
    <div class="t-body"><div class="t-title">${esc(title)}</div>${text ? `<div class="t-text">${esc(text)}</div>` : ''}</div>
    <button class="t-x">✕</button>`;
  wrap.appendChild(n);
  requestAnimationFrame(() => n.classList.add('in'));
  const kill = () => { n.classList.remove('in'); setTimeout(() => n.remove(), 260); };
  n.querySelector('.t-x').onclick = kill;
  setTimeout(kill, 4400);
  while (wrap.children.length > 4) wrap.firstElementChild.remove();
}

function num(el, val, suffix = '') {
  if (!el) return;
  const from = Number(String(el.dataset.v || el.textContent).replace(/[^\d.-]/g, '')) || 0;
  const to = val;
  const t0 = performance.now();
  const dur = 420;
  const step = (t) => {
    const p = Math.min(1, (t - t0) / dur);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt(from + (to - from) * e) + suffix;
    if (p < 1) requestAnimationFrame(step); else el.dataset.v = to;
  };
  requestAnimationFrame(step);
}

// ═══════════════════════════════════════════════════════════
// 顶栏 / 侧栏 / 右栏
// ═══════════════════════════════════════════════════════════
function renderTop() {
  const c = clock();
  $('#clock').textContent = c.label;
  const online = 1200 + Math.round(Math.sin(Date.now() / 60000) * 120 + Math.random() * 60);
  $('#online').innerHTML = `<i class="pulse"></i>${fmt(online)} 在线`;
  num($('#credits'), S.credits);
  num($('#rep'), Math.round(S.rep));
  const h = Math.round(S.heat);
  $('#heatVal').textContent = h;
  $('#heatFill').style.width = h + '%';
  $('#heatBox').classList.toggle('warn', h >= 30 && h < 60);
  $('#heatBox').classList.toggle('danger', h >= 60);
  document.body.classList.toggle('heat-warn', h >= 60 && h < 85);
  document.body.classList.toggle('heat-danger', h >= 85);
  $('#credits').classList.toggle('low', S.credits < 300);
  $('#ident').textContent = '@' + S.alias;
  const u = unread();
  const badge = $('#navMsg b');
  badge.textContent = u;
  badge.classList.toggle('hide', !u);
  const arrived = S.orders.filter((o) => o.status === 'arrived').length;
  const cb = $('#navCargo b');
  cb.textContent = arrived;
  cb.classList.toggle('hide', !arrived);
}

function renderRail() {
  const rail = $('#rail');
  const feed = broadcasts.slice(0, 9).map((b) => `<div class="feed-row"><span class="dot"></span><span>${esc(b.text)}</span></div>`).join('');
  const cs = CONTRACTS.map((c) => ({ c, p: contractProgress(c.id) })).filter((x) => x.p < 1).slice(0, 2);
  const logs = S.log.slice(0, 7).map((l) => `<div class="log-row ${l.delta < 0 ? 'neg' : l.delta > 0 ? 'pos' : ''}"><span class="lt">${esc(l.text)}</span>${l.delta ? `<span class="ld">${l.delta > 0 ? '+' : ''}${fmt(l.delta)}</span>` : ''}</div>`).join('');
  rail.innerHTML = `
    <section class="panel">
      <div class="panel-head"><span>实时广播</span><i class="live"></i></div>
      <div class="feed">${feed}</div>
    </section>
    <section class="panel">
      <div class="panel-head"><span>进行中的委托</span><span class="mini">${cs.length}/6</span></div>
      ${cs.length ? cs.map(({ c, p }) => `
        <div class="mini-contract">
          <div class="mc-top"><b>${c.title}</b><span>${Math.round(p * 100)}%</span></div>
          <div class="mc-desc">${c.desc}</div>
          <div class="mini-bar"><i style="width:${p * 100}%"></i></div>
        </div>`).join('') : `<div class="empty-mini">全部委托已完成。暗河里没有真正的终点。</div>`}
    </section>
    <section class="panel grow">
      <div class="panel-head"><span>会话日志</span><span class="mini">LOCAL</span></div>
      <div class="loglist">${logs || '<div class="empty-mini">还没有记录。</div>'}</div>
    </section>
    <div class="rail-foot">${esc(FLAVOR[Math.floor(Math.random() * FLAVOR.length)])}</div>`;
}

// ═══════════════════════════════════════════════════════════
// 视图：市场
// ═══════════════════════════════════════════════════════════
function renderMarket() {
  const cats = [{ id: 'all', name: '全部', en: 'ALL', glyph: '✳' }, ...CATS];
  let list = S.market.filter((m) => {
    const d = itemDef(m.defId);
    if (!d) return false;
    if (mktFilter.cat !== 'all' && d.cat !== mktFilter.cat) return false;
    if (mktFilter.q) {
      const q = mktFilter.q.toLowerCase();
      if (!(d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q))) return false;
    }
    return true;
  });
  const sorters = {
    price: (a, b) => a.price - b.price,
    priceDesc: (a, b) => b.price - a.price,
    risk: (a, b) => itemDef(a.defId).risk - itemDef(b.defId).risk,
    rating: (a, b) => vendorOf(b.vendorId).rating - vendorOf(a.vendorId).rating,
  };
  list.sort(sorters[mktFilter.sort] || sorters.price);

  $('#view').innerHTML = `
    <div class="view-head">
      <div class="vh-left">
        <h1>市场 <span class="en">MARKET</span></h1>
        <p class="sub">共 ${list.length} 件在售 · 托管交易 · 验货前不放款。价格每小时波动。</p>
      </div>
      <div class="vh-tools">
        <div class="search"><span>⌕</span><input id="mktSearch" placeholder="搜索代号 / 名称 / 描述" value="${esc(mktFilter.q)}"></div>
        <select id="mktSort">
          <option value="price">价格 低→高</option>
          <option value="priceDesc">价格 高→低</option>
          <option value="risk">风险 低→高</option>
          <option value="rating">卖家评分</option>
        </select>
      </div>
    </div>
    <div class="cats">${cats.map((c) => `<button class="cat ${mktFilter.cat === c.id ? 'on' : ''}" data-cat="${c.id}"><span>${c.glyph}</span>${c.name}<i>${c.en}</i></button>`).join('')}</div>
    <div class="grid items">${list.map(cardItem).join('')}</div>`;
  $('#mktSort').value = mktFilter.sort;
  $('#mktSearch').oninput = (e) => { mktFilter.q = e.target.value; const p = e.target.selectionStart; renderMarket(); const i = $('#mktSearch'); i.focus(); i.setSelectionRange(p, p); };
  $$('[data-cat]').forEach((b) => b.onclick = () => { mktFilter.cat = b.dataset.cat; sfx('click'); renderMarket(); });
  $('#mktSort').onchange = (e) => { mktFilter.sort = e.target.value; renderMarket(); };
  $$('.item').forEach((card) => {
    card.onclick = (e) => {
      if (e.target.closest('[data-buy]')) return;
      sfx('hover');
      openDetail(card.dataset.def, card.dataset.uid);
    };
  });
  $$('[data-buy]').forEach((b) => b.onclick = (e) => { e.stopPropagation(); sfx('click'); openBuy(b.dataset.buy); });
}

function cardItem(m) {
  const d = itemDef(m.defId);
  const v = vendorOf(m.vendorId);
  const r = rarityOf(d.rarity);
  const ref = (m.prev && m.prev !== m.price) ? m.prev : (m.open || m.price);
  const dl = m.price - ref;
  const pct = (dl / ref) * 100;
  const can = S.credits >= m.price && m.stock > 0;
  return `
  <article class="card item ${m.stock === 0 ? 'out' : ''}" data-def="${d.id}" data-uid="${m.uid}">
    <div class="card-top">
      <span class="code">${d.code}</span>
      ${d.rarity === 'common' ? '' : `<span class="rar r-${d.rarity}">${r.name}</span>`}
    </div>
    <h3>${esc(d.name)}</h3>
    <div class="vendor"><span class="stars">${stars(v.rating)}</span> ${v.name} <i>· ${v.trades} 单</i></div>
    <p class="desc">${esc(d.desc)}</p>
    <div class="meta-row">
      <span class="risk-l">风险 ${riskDots(d.risk)}</span>
      <span class="stock">库存 ${m.stock}</span>
    </div>
    <div class="card-foot">
      <div class="price">${fmt(m.price)}<i>DKC</i><span class="delta ${dl >= 0 ? 'up' : 'down'}">${dl >= 0 ? '▲' : '▼'}${Math.abs(pct).toFixed(1)}%</span></div>
      <button class="btn primary sm" data-buy="${m.uid}" ${can ? '' : 'disabled'}>${m.stock ? '买入' : '缺货'}</button>
    </div>
    <div class="sweep"></div>
  </article>`;
}

function openDetail(defId, uid) {
  const d = itemDef(defId);
  const m = S.market.find((x) => x.uid === uid) || S.market.find((x) => x.defId === defId);
  const v = vendorOf(m.vendorId);
  const intel = (S.companies.intel || 0) > 0;
  const fakeChance = clamp((5 - v.rating) * 0.075 + 0.015, .01, .55) * (intel ? 0.82 : 1);
  openModal({
    title: `${d.code} · ${d.name}`,
    sub: `${catOf(d.cat).name} / ${rarityOf(d.rarity).name} · 卖家 ${v.name}`,
    body: `
      <div class="detail">
        <div class="d-hero">
          <div class="d-glyph">${catOf(d.cat).glyph}</div>
          <div class="d-price"><span>当前报价</span><b>${fmt(m.price)}</b><i>DKC</i></div>
        </div>
        <p class="d-desc">${esc(d.desc)}</p>
        <div class="d-specs">
          <div><label>卖家评分</label><b class="stars">${stars(v.rating)}</b><span>${v.rating} / 5 · ${v.trades} 单</span></div>
          <div><label>风险等级</label><b>${riskDots(d.risk)}</b><span>${d.risk} / 10</span></div>
          <div><label>剩余库存</label><b>${m.stock}</b><span>件</span></div>
          <div><label>预估到货</label><b>${Math.max(2, 4 - (S.companies.logi || 0) * 2)}–${Math.max(3, 9 - (S.companies.logi || 0) * 2)}h</b><span>游戏时间</span></div>
          ${intel ? `<div class="intel"><label>情报站评估</label><b class="fake">${(fakeChance * 100).toFixed(0)}%</b><span>假货概率</span></div>` : ''}
        </div>
        <div class="d-note">${esc(v.note)}</div>
      </div>`,
    actions: [
      { label: `建立托管 · ${fmt(m.price)} DKC`, primary: true, onClick: () => openBuy(m.uid) },
      { label: '关闭', onClick: closeModal },
    ],
  });
}

function openBuy(uid) {
  const m = S.market.find((x) => x.uid === uid || x.defId === uid);
  if (!m) return;
  const d = itemDef(m.defId);
  const v = vendorOf(m.vendorId);
  const fee = 0;
  openModal({
    title: '建立托管 · ESCROW',
    sub: `${d.code} · 卖家 ${v.name}`,
    body: `
      <div class="buy-box">
        <div class="buy-line"><span>商品</span><b>${esc(d.name)}</b></div>
        <div class="buy-line"><span>单价</span><b>${fmt(m.price)} DKC</b></div>
        <div class="buy-line"><span>平台费</span><b>${fmt(fee)} DKC</b></div>
        <div class="buy-line total"><span>托管总额</span><b>${fmt(m.price)} DKC</b></div>
        <div class="buy-line"><span>你的余额</span><b class="${S.credits < m.price ? 'bad' : ''}">${fmt(S.credits)} DKC</b></div>
      </div>
      <div class="escrow-steps" id="escrowSteps"></div>
      <p class="fine">托管期间资金由平台锁定，验货通过后才向卖家放款。若为假货，可申请仲裁。</p>`,
    actions: [
      {
        label: `确认支付 ${fmt(m.price)} DKC`, primary: true,
        onClick: async (bodyEl, btn) => {
          if (busy) return;
          busy = true;
          btn.disabled = true;
          const box = $('#escrowSteps');
          const steps = [
            '生成一次性托管地址 ……',
            `锁定 ${fmt(m.price)} DKC ……`,
            '构建合约 · 计算哈希 ……',
            '广播至 3 个中继节点 ……',
            '托管已建立 · 等待卖家发货',
          ];
          for (let i = 0; i < steps.length; i++) {
            await new Promise((r) => setTimeout(r, 340));
            const line = document.createElement('div');
            line.className = 'esc-line';
            line.innerHTML = `<span class="ok">✓</span>${steps[i]}`;
            box.appendChild(line);
            sfx('type');
          }
          const hash = '0x' + Math.random().toString(16).slice(2, 12) + Math.random().toString(16).slice(2, 12);
          const hl = document.createElement('div');
          hl.className = 'esc-hash';
          hl.textContent = 'TX ' + hash;
          box.appendChild(hl);
          const res = buyListing(m.uid);
          busy = false;
          if (!res.ok) {
            sfx('error');
            toast('bad', '交易失败', res.msg);
            closeModal();
            return;
          }
          sfx('buy');
          await new Promise((r) => setTimeout(r, 420));
          closeModal();
          toast('good', '托管已建立', `${d.code} 将在 ${Math.max(2, 4 - (S.companies.logi || 0) * 2)}–${Math.max(3, 9 - (S.companies.logi || 0) * 2)} 游戏小时内到达。`);
          renderAll();
        },
      },
      { label: '取消', onClick: closeModal },
    ],
  });
}

// ═══════════════════════════════════════════════════════════
// 视图：拍卖
// ═══════════════════════════════════════════════════════════
function renderAuction() {
  const heldSum = S.auctions.reduce((n, a) => n + (a.held || 0), 0);
  const cards = S.auctions.map((a) => {
    const d = itemDef(a.defId);
    const left = Math.max(0, a.endsAt - Date.now());
    const urgent = left < 12000;
    const sec = Math.floor(left / 1000);
    const time = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
    const hist = a.history.slice(-4).reverse().map((h) => `<div class="bid-row ${h.who === 'YOU' ? 'you' : ''}"><span>${esc(h.who)}</span><b>${fmt(h.amount)}</b></div>`).join('');
    return `
      <article class="card auction ${urgent ? 'urgent' : ''}" data-aid="${a.id}">
        <div class="au-top">
          <span class="code">${d.code}</span>
          <div class="au-clock ${urgent ? 'hot' : ''}"><span>剩余</span><b>${time}</b></div>
        </div>
        <h3>${esc(a.title)}</h3>
        <p class="desc">${esc(a.desc)}</p>
        <div class="au-price"><span>当前出价</span><b>${fmt(a.current)}</b><i>DKC</i></div>
        <div class="au-top-bid">${a.topBidder === 'YOU' ? '<span class="you">你正在领先</span>' : a.topBidder ? `领先者 <b>${esc(a.topBidder)}</b>` : '尚无出价'}</div>
        <div class="bid-list">${hist || '<div class="bid-row dim"><span>等待第一个出价</span></div>'}</div>
        <div class="au-actions">
          <button class="btn sm" data-bid="1">+${fmt(a.step)}</button>
          <button class="btn sm" data-bid="3">+${fmt(a.step * 3)}</button>
          <button class="btn primary sm" data-snipe="${a.id}" ${left < 9000 ? '' : 'disabled title="最后 9 秒开放"'}>压哨</button>
        </div>
        <div class="au-bar"><i style="width:${clamp(100 - (left / 120000) * 100, 0, 100)}%"></i></div>
      </article>`;
  }).join('');

  $('#view').innerHTML = `
    <div class="view-head">
      <div class="vh-left"><h1>拍卖行 <span class="en">AUCTION</span></h1>
        <p class="sub">3 件同时竞拍 · 最后 9 秒可压哨 · 赢拍后立刻入库。</p></div>
      <div class="vh-tools"><div class="wallet-pill">可用 ${fmt(S.credits)} DKC${heldSum ? ` · 冻结 ${fmt(heldSum)}` : ''}</div></div>
    </div>
    <div class="grid auctions">${cards || '<div class="empty">暂无拍品，正在上架…</div>'}</div>
    <div class="auction-note">规则：每次加价不得低于当前价 + 一档。被反超后资金立即退回。压哨命中按原价，偏出加价 8%。</div>`;

  $$('[data-aid]').forEach((card) => {
    const a = S.auctions.find((x) => x.id === card.dataset.aid);
    $$('[data-bid]', card).forEach((b) => b.onclick = () => {
      const steps = +b.dataset.bid;
      const amount = a.current + a.step * steps;
      const r = auctionBid(a.id, amount);
      if (!r.ok) { sfx('error'); toast('bad', '出价失败', r.msg); return; }
      sfx('bid');
      toast('info', '出价已提交', `${fmt(amount)} DKC · 你暂时领先`);
      renderAll();
    });
    const sb = $('[data-snipe]', card);
    if (sb) sb.onclick = () => openSnipe(a);
  });
}

function updateAuctionClocks() {
  $$('[data-aid]').forEach((card) => {
    const a = S.auctions.find((x) => x.id === card.dataset.aid);
    if (!a) return;
    const left = Math.max(0, a.endsAt - Date.now());
    const sec = Math.floor(left / 1000);
    const time = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
    const clk = card.querySelector('.au-clock');
    const b = clk?.querySelector('b');
    if (b) b.textContent = time;
    if (clk) clk.classList.toggle('hot', left < 12000);
    card.classList.toggle('urgent', left < 12000);
    const sb = card.querySelector('[data-snipe]');
    if (sb) sb.disabled = left >= 9000;
  });
}

function openSnipe(a) {
  const body = openModal({
    title: '压哨加价 · 最后 9 秒',
    sub: a.title,
    wide: false,
    body: `<div id="snipeRoot"></div>`,
    actions: [],
  });
  const done = snipeGame(body.querySelector('#snipeRoot'), (res) => {
    closeModal();
    if (res === 'abort') return;
    if (res === 'miss') { sfx('error'); toast('bad', '脱靶', '指针完全偏出，你连加价的资格都没有了。'); renderAll(); return; }
    const r = snipe(a.id, res === 'hit');
    if (!r.ok) { toast('bad', '加价失败', r.msg); return; }
    sfx('win');
    toast('good', res === 'hit' ? '压哨命中' : '偏出但仍成交', `${fmt(r.amount)} DKC · 你重新领先`);
    renderAll();
  });
  return done;
}

// ═══════════════════════════════════════════════════════════
// 视图：货舱
// ═══════════════════════════════════════════════════════════
function emptyBox(glyph, title, sub, cta) {
  const label = cta === 'market' ? '去市场 →' : cta === 'inv' ? '去库存 →' : '去拍卖行 →';
  return `<div class="empty empty-cta"><div class="ec-glyph">${glyph}</div><b>${title}</b><p>${sub}</p>${cta ? `<button class="btn sm" data-goto="${cta}">${label}</button>` : ''}<div class="ec-steps"><span>01 选货</span><span>02 托管</span><span>03 验货</span><span>04 转手</span></div></div>`;
}

function renderCargo() {
  const tabs = [
    { id: 'transit', name: '在途', n: S.orders.filter((o) => o.status === 'transit' || o.status === 'arrived').length },
    { id: 'inv', name: '库存', n: S.inv.reduce((s, i) => s + i.qty, 0) },
    { id: 'sell', name: '挂单', n: S.sellOrders.length },
  ];
  let bodyHtml = '';
  if (cargoTab === 'transit') {
    const list = S.orders.filter((o) => o.status === 'transit' || o.status === 'arrived');
    bodyHtml = list.length ? list.map((o) => {
      const def = itemDef(o.defId);
      const v = vendorOf(o.vendorId);
      const total = Math.max(1, o.arriveAt - o.placed);
      const p = o.status === 'arrived' ? 100 : clamp(((S.hour - o.placed) / total) * 100, 0, 100);
      return `<div class="cargo-row ${o.status === 'arrived' ? 'ready' : ''}">
        <div class="cr-glyph">${catOf(def.cat).glyph}</div>
        <div class="cr-main">
          <div class="cr-top"><b>${esc(def.name)}</b><span class="code">${def.code} × ${o.qty}</span></div>
          <div class="cr-sub">卖家 ${v.name} · ${o.status === 'arrived' ? '已到达自提点' : `约 ${Math.max(0, o.arriveAt - S.hour)} 游戏小时后到达`}</div>
          <div class="prog"><i style="width:${p}%"></i></div>
        </div>
        <div class="cr-act">
          <div class="cr-money">${fmt(o.price)} DKC</div>
          ${o.status === 'arrived' ? `<button class="btn primary sm" data-inspect="${o.id}">验货</button>` : '<span class="tag">运输中</span>'}
        </div>
      </div>`;
    }).join('') : emptyBox('▤', '没有在途包裹', '市场里的每一笔交易都从托管开始。挑一件三位数的货，练练手。', 'market');
  } else if (cargoTab === 'inv') {
    bodyHtml = S.inv.length ? `<table class="tbl"><thead><tr><th>货品</th><th>数量</th><th>成本</th><th>现价</th><th>状态</th><th></th></tr></thead><tbody>
      ${S.inv.map((i) => {
        const d = itemDef(i.defId);
        const m = S.market.find((x) => x.defId === i.defId);
        return `<tr class="${i.fake ? 'fake' : ''}">
          <td><b>${esc(d.name)}</b><span class="code">${d.code}</span></td>
          <td>${i.qty}</td><td>${fmt(i.cost)}</td><td>${fmt(m ? m.price : 0)}</td>
          <td>${i.fake ? '<span class="tag bad">劣质</span>' : '<span class="tag good">正品</span>'}</td>
          <td><button class="btn sm" data-sell="${i.uid}">挂单</button></td></tr>`;
      }).join('')}</tbody></table>` : emptyBox('▥', '库存为空', '先去市场买一件，或者让伪造工坊替你产出。', 'market');
  } else {
    bodyHtml = S.sellOrders.length ? S.sellOrders.map((so) => {
      const d = itemDef(so.defId);
      return `<div class="cargo-row">
        <div class="cr-glyph">▤</div>
        <div class="cr-main"><div class="cr-top"><b>${esc(d.name)}</b><span class="code">${d.code} × ${so.qty}</span></div>
        <div class="cr-sub">挂单 ${fmt(so.ask)} DKC · 剩余 ${Math.max(0, so.expireAt - S.hour)}h · 溢价 ${((so.ask / so.marketRef - 1) * 100).toFixed(0)}%</div>
        <div class="prog"><i style="width:${clamp(((S.hour - so.listedAt) / 12) * 100, 0, 100)}%"></i></div></div>
        <div class="cr-act"><div class="cr-money">${fmt(so.ask)}</div><button class="btn sm" data-cancel="${so.id}">撤单</button></div>
      </div>`;
    }).join('') : emptyBox('▦', '没有挂单', '挂单会在 12 游戏小时内寻找买家。定价越贴近市价，成交越快。', 'market');
  }

  $('#view').innerHTML = `
    <div class="view-head"><div class="vh-left"><h1>货舱 <span class="en">CARGO</span></h1>
      <p class="sub">在途 / 库存 / 挂单。库存估值 ${fmt(inventoryValue())} DKC。</p></div>
      <div class="vh-tools"><div class="wallet-pill">净资产 ${fmt(netWorth())} DKC</div></div></div>
    <div class="tabs">${tabs.map((t) => `<button class="tab ${cargoTab === t.id ? 'on' : ''}" data-tab="${t.id}">${t.name}<b>${t.n}</b></button>`).join('')}</div>
    <div class="cargo-list">${bodyHtml}</div>`;

  $$('[data-tab]').forEach((b) => b.onclick = () => { cargoTab = b.dataset.tab; sfx('click'); renderCargo(); });
  $$('[data-goto]').forEach((b) => b.onclick = () => { sfx('click'); route(b.dataset.goto); });
  $$('[data-inspect]').forEach((b) => b.onclick = () => openInspect(b.dataset.inspect));
  $$('[data-sell]').forEach((b) => b.onclick = () => openSell(b.dataset.sell));
  $$('[data-goto]').forEach((b) => b.onclick = () => {
    const g = b.dataset.goto;
    if (g === 'inv') { cargoTab = 'inv'; renderCargo(); } else route(g);
  });
  $$('[data-cancel]').forEach((b) => b.onclick = () => {
    const r = cancelSell(b.dataset.cancel);
    if (r.ok) { sfx('close'); toast('info', '已撤单', '货品已退回库存。'); renderAll(); }
  });
}

function openInspect(orderId) {
  const o = S.orders.find((x) => x.id === orderId);
  const d = itemDef(o.defId);
  openModal({
    title: '拆包验货',
    sub: `${d.code} · 来自 ${vendorOf(o.vendorId).name}`,
    body: `<div class="inspect-wrap" id="inspWrap">
      <div class="pkg"><div class="pkg-tape"></div><div class="pkg-code">${d.code}</div><div class="scanline"></div></div>
      <div class="inspect-log" id="inspLog"></div>
    </div>`,
    actions: [{ label: '开始扫描', primary: true, onClick: async (bodyEl, btn) => {
      btn.disabled = true;
      const log = $('#inspLog');
      const lines = ['剥离封条 ……', '读取芯片标签 ……', '比对重量与密度 ……', '抽样光谱（模拟）……', '生成结论'];
      for (const l of lines) {
        await new Promise((r) => setTimeout(r, 300));
        const n = document.createElement('div');
        n.className = 'esc-line';
        n.innerHTML = `<span class="ok">·</span>${l}`;
        log.appendChild(n);
        sfx('type');
      }
      const r = inspectOrder(o.id);
      if (!r.ok) { toast('bad', '验货失败', r.msg); closeModal(); return; }
      if (!r.fake) {
        sfx('coin');
        toast('good', '验货通过', `${d.code} 已入库。`);
        closeModal(); renderAll();
        return;
      }
      sfx('alarm');
      const wrap = $('#inspWrap');
      wrap.classList.add('bad');
      log.innerHTML += `<div class="insp-verdict bad">结论：批次不符 · 疑似假货 / 调包</div>`;
      modalActions = [
        { label: '退货（退 70%）', onClick: () => { resolveFake(o.id, 'return'); closeModal(); renderAll(); } },
        { label: '揭发卖家（声望 +6）', onClick: () => { resolveFake(o.id, 'expose'); closeModal(); renderAll(); } },
        { label: '收下，之后转手', danger: true, onClick: () => { resolveFake(o.id, 'resell'); closeModal(); renderAll(); } },
      ];
      const foot = $('#modal-root .modal-foot');
      foot.innerHTML = modalActions.map((a, i) => `<button class="btn ${a.danger ? 'danger' : ''}" data-act="${i}">${a.label}</button>`).join('');
      $$('[data-act]', foot).forEach((b) => b.onclick = () => modalActions[+b.dataset.act].onClick());
      wrap.insertAdjacentHTML('beforeend', `<div class="fake-note">你付了 ${fmt(o.price)} DKC。现在决定怎么处理这件事。</div>`);
    } }],
  });
}

function openSell(uid) {
  const it = S.inv.find((i) => i.uid === uid);
  const d = itemDef(it.defId);
  const m = S.market.find((x) => x.defId === it.defId);
  const base = m ? m.price : it.cost;
  openModal({
    title: '挂单出售 · ' + d.code,
    sub: `库存 ${it.qty} 件 · 市场价 ${fmt(base)} DKC`,
    body: `<div class="sell-box">
      <label>你的报价（每件）</label>
      <div class="sell-input"><input id="sellAsk" type="number" value="${Math.round(base * 1.05)}" min="1"><span>DKC</span></div>
      <div class="quick"><button data-q="1">市价</button><button data-q="1.15">+15%</button><button data-q="0.9">-10% 快出</button></div>
      <div class="sell-calc">预计成交价 <b id="sellTotal">${fmt(Math.round(base * 1.05))}</b> DKC · 平台费 3%</div>
      <p class="fine">挂单有效期 12 游戏小时。溢价越高，成交越慢。</p>
    </div>`,
    actions: [{ label: '挂单', primary: true, onClick: () => {
      const ask = Math.max(1, Math.round(+$('#sellAsk').value || 0));
      const r = sellInv(it.uid, ask);
      if (!r.ok) { toast('bad', '挂单失败', r.msg); return; }
      sfx('coin'); closeModal(); toast('good', '已挂单', `${d.code} @ ${fmt(ask)} DKC`); renderAll();
    } }, { label: '取消', onClick: closeModal }],
  });
  const inp = $('#sellAsk');
  const upd = () => { $('#sellTotal').textContent = fmt(Math.round(+inp.value || 0)); };
  inp.oninput = upd;
  $$('[data-q]').forEach((b) => b.onclick = () => { inp.value = Math.round(base * +b.dataset.q); upd(); });
}

// ═══════════════════════════════════════════════════════════
// 视图：钱包
// ═══════════════════════════════════════════════════════════
function renderWallet() {
  if (!S.walletAddr) { S.walletAddr = 'dk1' + Array.from({ length: 34 }, () => '0123456789abcdefghjkmnpqrstuvwxyz'[Math.floor(Math.random() * 32)]).join(''); save(); }
  const txs = S.log.filter((l) => l.delta).slice(0, 18);
  const idCost = Math.round(5000 * Math.pow(2.2, S.stats.ids));
  $('#view').innerHTML = `
    <div class="view-head"><div class="vh-left"><h1>钱包 <span class="en">WALLET</span></h1>
      <p class="sub">暗币 DKC · 本地台账 · 不可提现，也没有地方可提。</p></div></div>
    <div class="wallet-grid">
      <section class="panel balance-panel">
        <div class="bp-label">可用余额</div>
        <div class="bp-amount">${fmt(S.credits)}<i>DKC</i></div>
        <div class="bp-sub">净资产 ${fmt(netWorth())} DKC · 库存 ${fmt(inventoryValue())}</div>
        <div class="bp-chips">
          <div><label>在途</label><b>${S.orders.filter((o) => o.status !== 'done').length}</b></div>
          <div><label>挂单</label><b>${S.sellOrders.length}</b></div>
          <div><label>公司</label><b>${companiesOwned()} / 5</b></div>
        </div>
        <div class="addr-row"><span>收款地址</span><code id="walletAddr">${S.walletAddr}</code><button class="btn sm" id="copyAddr">复制</button></div>
      </section>
      <section class="panel">
        <div class="panel-head"><span>混币 MIXER</span><span class="mini">降温</span></div>
        <p class="p-note">把钱拆成多份走三跳，降低被追踪的概率。手续费 8%${S.companies.laundry ? `（洗币所 -${Math.min(50, S.companies.laundry * 10)}%）` : ''}，有 12% 概率污染。</p>
        <div class="mix-row"><input id="mixAmt" type="number" value="${Math.min(S.credits, 1000)}"><div class="quick"><button data-mix="0.25">25%</button><button data-mix="0.5">50%</button><button data-mix="1">全部</button></div></div>
        <button class="btn primary" id="doMix">执行混币</button>
      </section>
      <section class="panel danger-panel">
        <div class="panel-head"><span>更换身份 NEW ID</span><span class="mini red">高危</span></div>
        <p class="p-note">销毁当前身份，热度清零，声望 -10，在途包裹全部作废。费用随次数指数上涨。</p>
        <div class="id-row"><div><label>当前热度</label><b class="heat-num">${Math.round(S.heat)}</b></div><div><label>费用</label><b>${fmt(idCost)} DKC</b></div><div><label>已换</label><b>${S.stats.ids} 次</b></div></div>
        <button class="btn danger" id="doId" ${S.credits < idCost ? 'disabled' : ''}>执行更换</button>
      </section>
    </div>
    <section class="panel">
      <div class="panel-head"><span>台账 / LEDGER</span><span class="mini">最近 18 笔</span></div>
      <table class="tbl ledger"><thead><tr><th>时间</th><th>摘要</th><th class="right">金额</th><th class="right">余额</th></tr></thead><tbody>
        ${txs.length ? txs.map((t) => `<tr><td class="dim">D${Math.floor(t.at / 24) + 1} ${String(t.at % 24).padStart(2, '0')}:00</td><td>${esc(t.text)}</td><td class="right ${t.delta > 0 ? 'pos' : 'neg'}">${t.delta > 0 ? '+' : ''}${fmt(t.delta)}</td><td class="right dim">${fmt(t.bal || 0)}</td></tr>`).join('') : '<tr><td colspan="4" class="empty">暂无流水。</td></tr>'}
      </tbody></table>
    </section>`;

  $('#copyAddr').onclick = async () => {
    try { await navigator.clipboard.writeText(S.walletAddr); toast('good', '已复制', '地址只在本机有效。'); }
    catch (e) { toast('warn', '复制失败', '请手动选中复制。'); }
  };
  $$('[data-mix]').forEach((b) => b.onclick = () => { $('#mixAmt').value = Math.max(100, Math.round(S.credits * +b.dataset.mix)); sfx('click'); });
  $('#doMix').onclick = () => {
    const amt = Math.round(+$('#mixAmt').value || 0);
    const r = mix(amt);
    if (!r.ok) { sfx('error'); toast('bad', '混币失败', r.msg); return; }
    if (r.contaminated) { sfx('alarm'); toast('bad', '混币被污染', `损失 ${fmt(r.lost)} DKC，手续费 ${fmt(r.fee)}。`); }
    else { sfx('coin'); toast('good', '混币完成', `手续费 ${fmt(r.fee)} DKC · 热度 -${r.drop.toFixed(1)}`); }
    renderAll();
  };
  $('#doId').onclick = () => {
    openModal({
      title: '销毁当前身份？',
      sub: '这个操作不可撤销',
      body: `<p class="p-note big">旧身份的所有在途包裹会被丢弃，声望 -10，热度清零。你会得到一个新的代号入口，但账本还在。</p>`,
      actions: [
        { label: '我确定', danger: true, onClick: () => {
          const r = newIdentity();
          if (!r.ok) { toast('bad', '失败', r.msg); return; }
          sfx('seal'); closeModal(); toast('good', '身份已更换', '热度清零。别回头看。'); renderAll();
        } },
        { label: '再想想', onClick: closeModal },
      ],
    });
  };
}

// ═══════════════════════════════════════════════════════════
// 视图：资产
// ═══════════════════════════════════════════════════════════
function renderAssets() {
  const cards = COMPANIES.map((c) => {
    const lv = S.companies[c.id] || 0;
    const cost = companyCost(c.id);
    return `<article class="card company">
      <div class="co-top"><span class="co-icon">${c.icon}</span><div><h3>${c.name} <i>${c.en}</i></h3><div class="co-lv">${lv ? `Lv.${lv} · 运转中` : '未持有'}</div></div></div>
      <p class="desc">${esc(c.desc)}</p>
      <div class="co-effect">${esc(c.effect)}</div>
      <div class="co-pips">${Array.from({ length: 5 }, (_, i) => `<i class="${i < lv ? 'on' : ''}"></i>`).join('')}</div>
      <div class="co-foot"><div class="price">${fmt(cost)}<i>DKC</i></div>
        <button class="btn ${S.credits >= cost ? 'primary' : ''} sm" data-co="${c.id}" ${S.credits < cost ? 'disabled' : ''}>${lv ? '升级' : '收购'}</button></div>
    </article>`;
  }).join('');

  $('#view').innerHTML = `
    <div class="view-head"><div class="vh-left"><h1>资产 <span class="en">ASSETS</span></h1>
      <p class="sub">${companiesOwned()} / 5 家公司 · 每小时结算 · 资产也会留下地址。</p></div>
      <div class="vh-tools"><div class="wallet-pill">净资产 ${fmt(netWorth())} DKC</div></div></div>
    <div class="asset-summary">
      <div><label>每小时收入</label><b>+${fmt(COMPANIES.reduce((s, c) => s + (S.companies[c.id] || 0) * (c.perLevel.income || 0), 0))} DKC</b></div>
      <div><label>每小时热度</label><b class="${COMPANIES.reduce((s, c) => s + (S.companies[c.id] || 0) * (c.perLevel.heat || 0), 0) > 0 ? 'warn' : ''}">${(COMPANIES.reduce((s, c) => s + (S.companies[c.id] || 0) * (c.perLevel.heat || 0), 0)).toFixed(1)}</b></div>
      <div><label>公司估值</label><b>${fmt(COMPANIES.reduce((s, c) => s + (S.companies[c.id] || 0) * c.base * 0.7, 0))} DKC</b></div>
    </div>
    <div class="grid companies">${cards}</div>`;

  $$('[data-co]').forEach((b) => b.onclick = () => {
    const c = COMPANIES.find((x) => x.id === b.dataset.co);
    const lv = S.companies[c.id] || 0;
    openModal({
      title: `${lv ? '升级' : '收购'} · ${c.name}`,
      sub: `${fmt(companyCost(c.id))} DKC`,
      body: `<div class="co-modal"><div class="co-big">${c.icon}</div><p>${esc(c.desc)}</p>
        <div class="buy-line"><span>当前等级</span><b>${lv} / 5</b></div>
        <div class="buy-line"><span>升级后</span><b>${lv + 1} / 5</b></div>
        <div class="buy-line"><span>效果</span><b>${esc(c.effect)}</b></div>
        <div class="buy-line total"><span>需要支付</span><b>${fmt(companyCost(c.id))} DKC</b></div></div>`,
      actions: [{ label: '确认过户', primary: true, onClick: () => {
        const r = buyCompany(c.id);
        if (!r.ok) { toast('bad', '过户失败', r.msg); return; }
        sfx('seal'); closeModal(); toast('good', '过户完成', `${c.name} 现在属于你，等级 ${r.level}。`); renderAll();
      } }, { label: '取消', onClick: closeModal }],
    });
  });
}

// ═══════════════════════════════════════════════════════════
// 视图：消息
// ═══════════════════════════════════════════════════════════
function renderMessages() {
  markMsgsRead();
  const groups = {};
  S.msgs.forEach((m) => { (groups[m.from] ||= []).push(m); });
  const order = ['MOTH', 'GHOST', 'KIRA', 'BANKER'];
  const roster = Object.entries(NPCS).map(([k, npc]) => {
    const msgs = groups[k] || [];
    const last = msgs[msgs.length - 1];
    return `<div class="contact ${msgs.length ? '' : 'quiet'}" style="--npc:${npc.color}">
      <div class="avatar">${esc(npc.name[0])}</div>
      <div class="ct-info"><b>${npc.name}</b><span>${npc.cn}</span><i>${last ? esc(last.text.slice(0, 22)) + (last.text.length > 22 ? '…' : '') : '还没有联系过'}</i></div>
      <span class="ct-dot"></span>
    </div>`;
  }).join('');
  const html = order.filter((k) => groups[k]).map((k) => {
    const npc = NPCS[k] || { name: k, cn: '', color: '#9dff3c' };
    return `<section class="thread" style="--npc:${npc.color}">
      <div class="th-head"><div class="avatar">${esc(npc.name[0])}</div><div><b>${npc.name}</b><span>${npc.cn}</span></div><div class="th-count">${groups[k].length} 条</div></div>
      <div class="th-body">${groups[k].map((m) => `<div class="bubble"><p>${esc(m.text)}</p><span class="th-time">D${Math.floor(m.at / 24) + 1} ${String(m.at % 24).padStart(2, '0')}:00</span></div>`).join('')}</div>
    </section>`;
  }).join('');
  $('#view').innerHTML = `
    <div class="view-head"><div class="vh-left"><h1>消息 <span class="en">MESSAGES</span></h1>
      <p class="sub">端到端加密（并不存在）。所有对话都是本地生成的。</p></div></div>
    <div class="msg-grid">
      <div class="threads">${html || '<div class="empty">没有消息。暗河里安静得可怕。</div>'}</div>
      <aside class="msg-side"><div class="panel-head"><span>联系人</span><span class="mini">${Object.keys(groups).length}/4</span></div>${roster}</aside>
    </div>
    <div class="msg-tip">给飞蛾发一条消息：<button class="btn sm" id="askMoth">「最近有什么风声？」</button></div>`;
  $('#askMoth').onclick = () => {
    const tips = [
      '有人在扫低价货，别急着卖。',
      '热度 60 以上就别做大单了，真的。',
      '拍卖行最后三秒，AI 不会加价。你懂我意思。',
      '洗币所的手续费比罚款便宜。',
      '别买 0xDEAD 的东西。我说完了。',
    ];
    pushMsg('MOTH', tips[Math.floor(Math.random() * tips.length)]);
    sfx('type'); renderAll();
  };
}

// ═══════════════════════════════════════════════════════════
// 视图：终端
// ═══════════════════════════════════════════════════════════
function termOut(text, cls = '') {
  termLines.push(`<div class="tl ${cls}">${text}</div>`);
  if (termLines.length > 200) termLines.shift();
  const box = $('#termOut');
  if (box) { box.innerHTML = termLines.join(''); box.scrollTop = box.scrollHeight; }
}

function runCommand(raw) {
  const input = raw.trim();
  termOut(`<span class="prompt">${esc(S.alias)}@darkflow:~$</span> ${esc(input)}`);
  if (!input) return;
  const [cmd, ...args] = input.split(/\s+/);
  const a = args.join(' ');
  sfx('type');
  switch (cmd.toLowerCase()) {
    case 'help': TERMINAL_HELP.forEach((l) => termOut(esc(l))); break;
    case 'clear': termLines = []; $('#termOut').innerHTML = ''; break;
    case 'market': {
      const cat = a || 'all';
      const list = S.market.filter((m) => cat === 'all' || itemDef(m.defId).cat === cat);
      termOut(`<b>${list.length}</b> 件在售：`);
      list.slice(0, 14).forEach((m) => { const d = itemDef(m.defId); termOut(`  ${d.code.padEnd(12)} ${fmt(m.price).padStart(7)} DKC  ${esc(d.name)}`); });
      break;
    }
    case 'buy': {
      const m = S.market.find((x) => x.defId === a || itemDef(x.defId).code.toLowerCase() === a.toLowerCase());
      if (!m) { termOut('未找到该商品。用 market 查看代号。', 'err'); break; }
      const r = buyListing(m.uid);
      termOut(r.ok ? `托管建立：${itemDef(m.defId).code}，${fmt(m.price)} DKC。` : `失败：${r.msg}`, r.ok ? 'ok' : 'err');
      renderAll(); break;
    }
    case 'inv': {
      if (!S.inv.length) { termOut('库存为空。'); break; }
      S.inv.forEach((i, k) => { const d = itemDef(i.defId); termOut(`  [${k}] ${d.code.padEnd(12)} ×${i.qty}  成本 ${fmt(i.cost)}${i.fake ? '  [劣质]' : ''}`); });
      break;
    }
    case 'sell': {
      const [idx, price] = args;
      const it = S.inv[+idx];
      if (!it) { termOut('序号无效。', 'err'); break; }
      const r = sellInv(it.uid, Math.max(1, +price || itemDef(it.defId).base));
      termOut(r.ok ? '挂单已建立，12 游戏小时内结算。' : `失败：${r.msg}`, r.ok ? 'ok' : 'err');
      renderAll(); break;
    }
    case 'wallet': termOut(`余额 ${fmt(S.credits)} DKC · 净资产 ${fmt(netWorth())} · 地址 ${S.walletAddr || '未生成'}`); break;
    case 'status':
      termOut(`余额 ${fmt(S.credits)} DKC · 净资产 ${fmt(netWorth())} · 热度 ${Math.round(S.heat)}/100 · 声望 ${Math.round(S.rep)}/100 · 在途 ${S.orders.filter((o) => o.status === 'transit' || o.status === 'arrived').length} · 库存 ${S.inv.reduce((n, i) => n + i.qty, 0)}`);
      break;
    case 'orders': {
      const os = S.orders.filter((o) => o.status === 'transit' || o.status === 'arrived');
      if (!os.length) { termOut('没有在途包裹。'); break; }
      os.forEach((o) => {
        const d = itemDef(o.defId);
        const left = Math.max(0, o.eta - Date.now());
        termOut(`  ${d.code.padEnd(12)} ${o.status === 'arrived' ? '待验货' : `ETA ${Math.ceil(left / 60000)} 分钟`}  ${fmt(o.price)} DKC`);
      });
      break;
    }
    case 'netstat':
      termOut('  relay-01   10.0.0.4    12ms   OK');
      termOut('  relay-02   10.0.0.9    38ms   OK');
      termOut('  exit-03    10.0.0.21   61ms   OK');
      termOut('  3/3 跳 · 出口位于虚构节点 · 无真实连接');
      break;
    case 'mix': {
      const r = mix(+a || 0);
      termOut(r.ok ? `混币完成 · 手续费 ${fmt(r.fee)} · 热度 -${r.drop.toFixed(1)}${r.contaminated ? ' · 污染，损失 ' + fmt(r.lost) : ''}` : `失败：${r.msg}`, r.ok ? 'ok' : 'err');
      renderAll(); break;
    }
    case 'scan': termOut(`节点 3/3 · 延迟 ${Math.floor(120 + Math.random() * 180)}ms · 热度 ${Math.round(S.heat)} · 声望 ${Math.round(S.rep)} · 在线 ${fmt(1400 + Math.floor(Math.random() * 300))}`); break;
    case 'whoami': termOut(`${S.alias} · 中间人 · 存活 ${clock().day} 天 · 成交 ${S.stats.trades} · 净值 ${fmt(netWorth())}`); break;
    case 'crack': termOut('正在连接目标终端 ……'); openCrack(); break;
    case 'clean': termOut('载入待清洗数据集 ……'); openClean(); break;
    case 'gig': termOut('可用杂活：clean（数据清洗）· crack（密码破解）· auction（拍卖清单）'); break;
    case 'auction': {
      S.auctions.forEach((x) => termOut(`  ${itemDef(x.defId).code.padEnd(10)} 现价 ${fmt(x.current).padStart(7)}  剩余 ${Math.max(0, Math.round((x.endsAt - Date.now()) / 1000))}s`));
      break;
    }
    case 'exit': termOut('没有出口。这个页面在你关掉它之前不会消失。', 'warn'); break;
    default: termOut(`未知命令：${esc(cmd)}。输入 help 查看。`, 'err');
  }
}

function renderTerminal() {
  $('#view').innerHTML = `
    <div class="view-head"><div class="vh-left"><h1>终端 <span class="en">TERMINAL</span></h1>
      <p class="sub">本地 shell · 所有输出由本机生成 · 输入 help 开始。</p></div></div>
    <div class="term-grid">
      <div class="terminal">
        <div class="term-bar"><i></i><i></i><i></i><span>root@darkflow — /dev/onion</span><b>ENCRYPTED</b></div>
        <div class="term-out" id="termOut">${termLines.join('') || '<div class="tl dim">DARKFLOW shell v1.0 · 会话已建立。输入 help。</div>'}</div>
        <form class="term-input" id="termForm"><span class="prompt">${esc(S.alias)}@darkflow:~$</span><input id="termIn" autocomplete="off" spellcheck="false" placeholder="输入命令…"><button class="btn sm" type="submit">↵</button></form>
      </div>
      <aside class="gig-side">
        <div class="panel-head"><span>杂活</span><span class="mini">SIDE JOBS</span></div>
        <button class="gig" data-gig="clean"><b>数据清洗</b><span>把一份脏数据集洗成可卖的。500 条，限时。+320~1,000 DKC · 热度 -1.5</span></button>
        <button class="gig" data-gig="crack"><b>密码破解</b><span>接入一台虚构终端，猜出 6 位口令。+400~1,300 DKC · 截获一件数据货。</span></button>
        <button class="gig" data-gig="market"><b>翻市场</b><span>跳回市场，找低于均价 8% 的货。转手就是利润。</span></button>
        <div class="gig-note">杂活不计入委托进度，但会推高在线时长与热度。</div>
      </aside>
    </div>
    <div class="term-hints">${['help', 'market', 'auction', 'scan', 'crack', 'clean'].map((c) => `<button class="chip" data-cmd="${c}">${c}</button>`).join('')}</div>`;

  const sc = $('#termOut'); sc.scrollTop = sc.scrollHeight;
  $('#termForm').onsubmit = (e) => {
    e.preventDefault();
    const v = $('#termIn').value;
    $('#termIn').value = '';
    runCommand(v);
  };
  $$('[data-cmd]').forEach((b) => b.onclick = () => { runCommand(b.dataset.cmd); $('#termIn').focus(); });
  $$('[data-gig]').forEach((b) => b.onclick = () => {
    const g = b.dataset.gig;
    if (g === 'clean') openClean();
    else if (g === 'crack') openCrack();
    else route('market');
  });
  $('#termIn').focus();
}

function openCrack() {
  const body = openModal({ title: 'ROOT ACCESS · 目标终端', sub: '虚构目标 · 本地模拟', body: `<div id="crackRoot"></div>`, actions: [], wide: true });
  crackGame(body.querySelector('#crackRoot'), (ok) => {
    closeModal();
    if (ok) {
      const r = crackReward();
      sfx('win');
      toast('good', '破解成功', `截获 ${r.def.code}，+${fmt(r.gain)} DKC。热度上升。`);
      termOut(`破解成功 · 截获 ${r.def.code} · +${fmt(r.gain)} DKC`, 'ok');
    } else {
      sfx('alarm');
      toast('bad', '破解失败', '目标锁定，追踪程序已启动。');
      termOut('破解失败 · 目标已锁定', 'err');
    }
    if (view === 'terminal') renderTerminal();
    renderAll();
  });
}

function openClean() {
  const body = openModal({ title: 'SIDE JOB · 数据清洗', sub: '虚构数据集 · 本地模拟', body: `<div id="cleanRoot"></div>`, actions: [], wide: true });
  cleanGame(body.querySelector('#cleanRoot'), (ok) => {
    closeModal();
    if (ok) {
      const r = cleanReward();
      sfx('coin');
      toast('good', '清洗完成', `+${fmt(r.gain)} DKC · 热度 -1.5 · 声望 +1`);
      termOut(`数据清洗完成 · +${fmt(r.gain)} DKC`, 'ok');
    } else {
      sfx('error');
      toast('bad', '清洗失败', '数据集被污染，对方拒付。');
      termOut('清洗失败 · 对方拒付', 'err');
    }
    if (view === 'terminal') renderTerminal();
    renderAll();
  });
}

// ═══════════════════════════════════════════════════════════
// 视图：档案
// ═══════════════════════════════════════════════════════════
function renderProfile() {
  const stats = [
    ['存活天数', clock().day],
    ['成交笔数', S.stats.trades],
    ['验货次数', S.stats.inspections],
    ['赢下拍卖', S.stats.auctionsWon],
    ['破解次数', S.stats.hacks],
    ['杂活次数', S.stats.gigs || 0],
    ['换过身份', S.stats.ids],
    ['峰值热度', Math.round(S.stats.peakHeat)],
    ['最高单笔', fmt(S.stats.maxSingle) + ' DKC'],
  ];
  $('#view').innerHTML = `
    <div class="view-head"><div class="vh-left"><h1>档案 <span class="en">PROFILE</span></h1>
      <p class="sub">代号 ${esc(S.alias)} · 中间人 · 所有记录保存在本机。</p></div>
      <div class="vh-tools"><button class="btn sm" id="retireBtn">金盆洗手</button><button class="btn danger sm" id="resetBtn">销毁会话</button></div></div>
    <div class="profile-grid">
      <section class="panel idcard">
        <div class="id-top"><div class="id-glyph">◉</div><div><b>${esc(S.alias)}</b><span>BROKER · 中间人</span></div><div class="id-stamp">SIM</div></div>
        <div class="id-rows">
          <div><label>余额</label><b>${fmt(S.credits)} DKC</b></div>
          <div><label>净资产</label><b>${fmt(netWorth())} DKC</b></div>
          <div><label>声望</label><b>${Math.round(S.rep)} / 100</b></div>
          <div><label>热度</label><b class="${S.heat >= 60 ? 'bad' : ''}">${Math.round(S.heat)} / 100</b></div>
        </div>
        <div class="id-note">此证件不具备任何法律效力。</div>
      </section>
      <section class="panel"><div class="panel-head"><span>统计</span><span class="mini">SESSION</span></div>
        <div class="stat-grid">${stats.map(([k, v]) => `<div class="sg"><label>${k}</label><b>${v}</b></div>`).join('')}</div>
      </section>
    </div>
    <section class="panel"><div class="panel-head"><span>委托</span><span class="mini">${CONTRACTS.filter((c) => contractProgress(c.id) >= 1).length}/6</span></div>
      <div class="contract-list">${CONTRACTS.map((c) => {
        const p = contractProgress(c.id);
        return `<div class="ct ${p >= 1 ? 'done' : ''}"><div class="ct-top"><b>${c.title}</b><span>${c.giver}</span><i>${p >= 1 ? '已完成' : Math.round(p * 100) + '%'}</i></div>
          <div class="ct-desc">${c.desc}</div>
          <div class="ct-meta"><span>奖励 <b>${fmt(c.reward)} DKC</b></span><span>声望 +${c.rep}</span></div>
          <div class="mini-bar"><i style="width:${p * 100}%"></i></div></div>`;
      }).join('')}</div>
    </section>
    <section class="panel"><div class="panel-head"><span>成就</span><span class="mini">${S.achievements.length}/10</span></div>
      <div class="ach-grid">${ACHIEVEMENTS.map((a) => `<div class="ach ${S.achievements.includes(a.id) ? 'on' : ''}"><b>${a.name}</b><span>${a.desc}</span></div>`).join('')}</div>
    </section>
    <section class="panel"><div class="panel-head"><span>设置</span><span class="mini">LOCAL</span></div>
      <div class="settings">
        <label class="sw"><input type="checkbox" id="setSound" ${S.settings.sound ? 'checked' : ''}><span>音效</span></label>
        <label class="sw"><input type="checkbox" id="setCrt" ${S.settings.crt ? 'checked' : ''}><span>CRT 扫描线</span></label>
        <label class="sw"><input type="checkbox" id="setFx" ${S.settings.fx ? 'checked' : ''}><span>减少动效</span></label>
      </div>
      <div class="save-tools">
        <button class="btn sm" id="btnShareCard">生成行情卡</button>
        <button class="btn sm" id="btnExportCode">导出存档码</button>
        <button class="btn sm" id="btnImportCode">导入存档码</button>
      </div>
      <div class="save-info">存档：localStorage · 上次保存 ${S.lastSaved ? new Date(S.lastSaved).toLocaleTimeString('zh-CN') : '—'} · 版本 ${META.version}</div>
    </section>`;

  $('#setSound').onchange = (e) => { S.settings.sound = e.target.checked; setSound(e.target.checked); save(); };
  $('#setCrt').onchange = (e) => { S.settings.crt = e.target.checked; document.body.classList.toggle('no-crt', !e.target.checked); save(); };
  $('#setFx').onchange = (e) => { S.settings.fx = e.target.checked; document.body.classList.toggle('reduce-motion', e.target.checked); save(); };
  $('#btnShareCard').onclick = () => {
    const cv = drawShareCard(S, META, clock, fmt, netWorth, itemDef);
    const url = cv.toDataURL('image/png');
    openModal({
      title: '今日行情卡', sub: '1080 × 1350 · 可直接发群', wide: true,
      body: `<div class="card-prev"><img src="${url}" alt="行情卡预览"></div>
        <p class="p-note">图上只有代号与虚构数据，不含任何真实信息。</p>`,
      actions: [
        { label: '保存 PNG', primary: true, onClick: () => {
          const a = document.createElement('a');
          a.href = url;
          a.download = `darkflow-${S.alias}-d${String(clock().day).padStart(2, '0')}.png`;
          document.body.appendChild(a); a.click(); a.remove();
          toast('good', '已保存', '在下载目录里。');
        } },
        { label: '关闭', onClick: closeModal },
      ],
    });
  };

  $('#btnExportCode').onclick = () => {
    const code = exportCode();
    openModal({
      title: '导出存档码', sub: `${code.length} 字符 · 本机生成`, wide: true,
      body: `<p class="p-note">整段复制，存到备忘录或发给自己。换设备时贴回即可继续。存档码包含全部进度，不要公开发。</p>
        <textarea class="save-code" readonly>${esc(code)}</textarea>`,
      actions: [
        { label: '复制', primary: true, onClick: () => {
          const ta = $('.save-code');
          const done = () => toast('good', '已复制', '粘贴到备忘录保存。');
          if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(code).then(done).catch(() => { ta.select(); document.execCommand('copy'); done(); });
          else { ta.select(); document.execCommand('copy'); done(); }
        } },
        { label: '关闭', onClick: closeModal },
      ],
    });
    setTimeout(() => { const ta = $('.save-code'); if (ta) { ta.focus(); ta.select(); } }, 80);
  };

  $('#btnImportCode').onclick = () => {
    openModal({
      title: '导入存档码', sub: '会覆盖当前进度', wide: true,
      body: `<p class="p-note">把之前导出的整段文本贴进来。导入前请先导出当前进度，否则会被覆盖。</p>
        <textarea class="save-code" id="importCodeBox" placeholder="DF1-XXXXXXXX-..."></textarea>
        <div class="save-err" id="saveErr"></div>`,
      actions: [
        { label: '导入', primary: true, onClick: () => {
          const r = importCode($('#importCodeBox').value);
          if (!r.ok) { $('#saveErr').textContent = r.msg; return; }
          closeModal();
          renderAll();
          toast('good', '存档已载入', `@${r.alias} · ${new Date(r.at).toLocaleString('zh-CN')}`);
        } },
        { label: '取消', onClick: closeModal },
      ],
    });
    setTimeout(() => $('#importCodeBox')?.focus(), 80);
  };

  $('#retireBtn').onclick = () => openModal({
    title: '金盆洗手？', sub: '按净资产结算', body: `<p class="p-note big">你会带着现有的钱离开暗河。没有结局过场，只有一张账单。</p>`,
    actions: [{ label: '结算', primary: true, onClick: () => { closeModal(); retire(); showEnding(); } }, { label: '再干一会', onClick: closeModal }],
  });
  $('#resetBtn').onclick = () => openModal({
    title: '销毁会话', sub: '本地存档会被清除', body: `<p class="p-note big">这会删除本机的全部进度，重新开始。</p>`,
    actions: [{ label: '销毁并重开', danger: true, onClick: () => { wipe(); location.reload(); } }, { label: '取消', onClick: closeModal }],
  });
}

// ═══════════════════════════════════════════════════════════
// 事件 / 结局
// ═══════════════════════════════════════════════════════════
function checkEvent() {
  if (!S.pendingEvent) { eventShown = null; return; }
  if (document.querySelector('#modal-root .modal') && !document.querySelector('#modal-root .modal.event')) return;
  if (eventShown === S.pendingEvent.id + S.pendingEvent.title) return;
  const ev = S.pendingEvent;
  eventShown = ev.id + ev.title;
  sfx('alarm');
  openModal({
    title: `事件 · ${ev.title}`,
    sub: ev.tag,
    body: `<div class="event-body"><p class="ev-text">${esc(ev.text)}</p>
      <div class="ev-choices">${ev.choices.map((c, i) => `<button class="ev-choice" data-ev="${i}"><b>${esc(c.label)}</b><span>${esc((c.effect && c.effect.credits ? `资金 ${c.effect.credits > 0 ? '+' : ''}${fmt(c.effect.credits)} · ` : '') + (c.effect && c.effect.heat ? `热度 ${c.effect.heat > 0 ? '+' : ''}${c.effect.heat} · ` : '') + (c.effect && c.effect.rep ? `声望 ${c.effect.rep > 0 ? '+' : ''}${c.effect.rep}` : ''))}</span></button>`).join('')}</div></div>`,
    actions: [],
    esc: false,
  });
  $('#modal-root .modal')?.classList.add('event');
  $$('[data-ev]').forEach((b) => b.onclick = () => {
    const i = +b.dataset.ev;
    const res = resolveEvent(i);
    const body = modalBodyEl();
    if (res) {
      body.innerHTML = `<div class="event-result"><div class="er-mark">${res.hit ? '✕' : '✓'}</div><p>${esc(res.text)}</p>${res.lost ? `<p class="bad">损失 ${fmt(res.lost)} DKC。</p>` : ''}</div>`;
      const foot = $('#modal-root .modal-foot');
      if (foot) foot.remove();
      const b2 = document.createElement('div');
      b2.className = 'modal-foot';
      b2.innerHTML = '<button class="btn primary" data-close2>继续</button>';
      $('.modal').appendChild(b2);
      $('[data-close2]').onclick = () => { closeModal(); renderAll(); };
      $('[data-x]').onclick = () => { closeModal(); renderAll(); };
      sfx(res.hit ? 'alarm' : 'coin');
      renderAll();
    }
    setTimeout(() => save(), 100);
  });
}

function showEnding() {
  if (!S.ending || endingShown) return;
  endingShown = true;
  $('#toasts').innerHTML = '';
  closeModal();
  const e = S.ending;
  const titles = { arrest: '被捕', kingpin: '暗河之主', retire: '金盆洗手' };
  const grades = [['S', 500000], ['A', 250000], ['B', 100000], ['C', 40000], ['D', 0]];
  const grade = e.kind === 'kingpin' ? 'S' : e.kind === 'arrest' ? 'F' : (grades.find(([, v]) => e.worth >= v) || ['D'])[0];
  const root = document.createElement('div');
  root.className = 'ending ' + e.kind;
  root.innerHTML = `
    <div class="end-inner">
      <div class="end-tag">${e.kind === 'arrest' ? 'SESSION TERMINATED' : e.kind === 'kingpin' ? 'ASCENSION' : 'EXIT'}</div>
      <h1>${titles[e.kind]}</h1>
      <div class="end-num">${grade}</div>
      <p class="end-text">${e.kind === 'arrest'
        ? '门被敲响的时候，你正在核对一笔 4,000 的托管。你没有回头。判决书上的代号拼错了两个字母，但没人会为此上诉。'
        : e.kind === 'kingpin'
          ? '你成了暗河里最安静的那个人。所有人都知道你的名字，但没人敢在广播里提起。你终于明白：这不是王座，只是一张更贵的椅子。'
          : '你关掉终端，把硬盘放进微波炉。第二天早上，你在楼下买了豆浆，第一次觉得阳光有点刺眼。'}</p>
      <div class="end-stats">${[
        ['净资产', fmt(e.worth) + ' DKC'], ['声望', Math.round(e.rep)], ['存活', Math.floor(e.at / 24) + 1 + ' 天'],
        ['成交', (e.stats.trades || 0) + ' 笔'], ['赢拍', (e.stats.auctionsWon || 0)], ['峰值热度', Math.round(e.stats.peakHeat || 0)],
      ].map(([k, v]) => `<div><label>${k}</label><b>${v}</b></div>`).join('')}</div>
      <div class="end-actions"><button class="btn primary" id="againBtn">重新开始</button><button class="btn" id="stayBtn">继续看账本</button></div>
      <div class="end-fine">${esc(META.disclaimer)} · 本作不提供任何真实服务</div>
    </div>`;
  $('#modal-root').appendChild(root);
  requestAnimationFrame(() => root.classList.add('in'));
  sfx(e.kind === 'arrest' ? 'alarm' : 'win');
  $('#againBtn').onclick = () => { wipe(); location.reload(); };
  $('#stayBtn').onclick = () => { root.classList.remove('in'); setTimeout(() => root.remove(), 400); };
}

// ═══════════════════════════════════════════════════════════
// 路由 / 主循环
// ═══════════════════════════════════════════════════════════
const VIEWS = {
  market: renderMarket, auction: renderAuction, cargo: renderCargo, wallet: renderWallet,
  assets: renderAssets, messages: renderMessages, terminal: renderTerminal, profile: renderProfile,
};

function route(v) {
  if (!VIEWS[v]) v = 'market';
  view = v;
  $$('#side [data-view]').forEach((b) => b.classList.toggle('on', b.dataset.view === v));
  document.body.classList.add('glitch');
  setTimeout(() => document.body.classList.remove('glitch'), 220);
  sfx('glitch');
  renderView();
  if (v === 'messages') renderTop();
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

function renderView() {
  VIEWS[view]();
  renderTop();
}

function renderAll() {
  if (!started) return;
  renderTop();
  renderView();
  renderRail();
}

function startLoop() {
  const tickMs = 10000;
  timers.push(setInterval(() => {
    if (document.hidden || S.ending) return;
    const before = S.hour;
    tick(1);
    if (view === 'market' || view === 'auction') renderView();
    renderTop(); renderRail();
    if (clock().day !== Math.floor(before / 24) + 1) toast('info', '新的一天', clock().label);
  }, tickMs));

  timers.push(setInterval(() => {
    if (document.hidden || S.ending) return;
    aiAuctionTick();
    if (view === 'auction') updateAuctionClocks();
    renderTop();
  }, 2200));

  timers.push(setInterval(() => {
    if (document.hidden) return;
    const tpl = BROADCASTS[Math.floor(Math.random() * BROADCASTS.length)];
    const d = itemDef(ITEMS[Math.floor(Math.random() * ITEMS.length)].id);
    const text = tpl.replace('{code}', d.code).replace('{price}', fmt(Math.round(300 + Math.random() * 9000))).replace('{ms}', Math.round(80 + Math.random() * 400)).replace('{addr}', (S.walletAddr || 'dk1…').slice(0, 10) + '…');
    broadcasts.unshift({ text, at: Date.now() });
    if (broadcasts.length > 14) broadcasts.pop();
    renderRail();
  }, 6500));

  timers.push(setInterval(() => {
    if (document.hidden) return;
    checkEvent();
    if (S.pendingEvent) checkEvent();
    if (S.ending) showEnding();
    renderTop();
    if (view === 'auction') updateAuctionClocks();
  }, 800));

  document.addEventListener('visibilitychange', () => { if (!document.hidden) { renderAll(); } });
}

function applySettings() {
  setSound(S.settings.sound !== false);
  document.body.classList.toggle('no-crt', S.settings.crt === false);
  document.body.classList.toggle('reduce-motion', S.settings.fx === true);
}

function emitHandler(type, payload) {
  if (type === 'notify' && payload) toast(payload.kind, payload.title, payload.text);
  if (type === 'outbid') { toast('warn', '你被反超了', '资金已退回钱包。'); }
  if (type === 'msg') renderTop();
  if (type === 'ending') setTimeout(showEnding, 400);
  if (type === 'bid' && view === 'auction') renderAuction();
  if (type === 'contract') { /* toast 已由 engine 发 */ }
  renderRail();
}

// ═══════════════════════════════════════════════════════════
// 启动
// ═══════════════════════════════════════════════════════════
const BOOT_LINES = [
  ['DARKFLOW BIOS v1.0.4 © NIGHTSHIFT LABS', 12],
  ['> mem check ................ 64K OK', 10],
  ['> mount /dev/onion ......... OK', 10],
  ['> tor circuit ............... building', 10],
  ['> node[1] entry  · 141.98.x.x', 26],
  ['> node[2] relay  · 185.220.x.x', 26],
  ['> node[3] exit   · 51.15.x.x', 26],
  ['> circuit established ....... 3/3', 12],
  ['> handshake · ed25519 ....... OK', 10],
  ['> load market interface ..... OK', 10],
  ['WARNING: 本环境为虚构模拟，不含任何真实服务。', 14],
];

async function typeBoot() {
  const out = $('#bootOut');
  const fast = !!savedBoot;
  for (const [line, speed] of BOOT_LINES) {
    const div = document.createElement('div');
    div.className = 'bl';
    out.appendChild(div);
    for (let i = 0; i < line.length; i++) {
      div.textContent += line[i];
      if (i % 2 === 0) sfx('type');
      await new Promise((r) => setTimeout(r, fast ? 1 : Math.max(3, speed * 0.42)));
      out.scrollTop = out.scrollHeight;
    }
    if (line.includes('node[')) {
      $$('#circuit .node')[+line.match(/node\[(\d)\]/)[1] - 1]?.classList.add('lit');
      sfx('boot');
    }
    await new Promise((r) => setTimeout(r, fast ? 10 : 45));
  }
  $('#bootGate').classList.add('in');
  const sk = $('#bootSkip'); if (sk) sk.style.display = 'none';
}

let savedBoot = false;
function boot() {
  const saved = load();
  savedBoot = !!saved;
  $('#boot').classList.add('show');
  typeBoot();
  $('#bootGate .enter').onclick = () => enter(false);
  $('#bootGate .resume').onclick = () => enter(true);
  if (saved) {
    $('#bootGate .resume').classList.remove('hide');
    $('#bootAgree').checked = true;
    $('#bootGate .gate-who').textContent = '@' + S.alias + ' · ' + clock().label;
  } else {
    $('#bootGate .resume').classList.add('hide');
    $('#bootGate .gate-who').textContent = '';
  }
  $('#bootAlias').onkeydown = (e) => { if (e.key === 'Enter') enter(false); };
  const skip = $('#bootSkip');
  if (skip) skip.onclick = () => {
    if ($('#bootGate').classList.contains('in')) return;
    $('#bootOut').innerHTML = BOOT_LINES.map(([l]) => `<div class="bl">${l.replace(/</g, '&lt;')}</div>`).join('');
    $$('#circuit .node').forEach((n) => n.classList.add('lit'));
    $('#bootGate').classList.add('in');
    const sk = $('#bootSkip'); if (sk) sk.style.display = 'none';
    sfx('glitch');
  };
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $('#boot').classList.contains('show') && !started) {
      $('#bootGate').classList.add('in');
    }
  });
}

function enter(resume) {
  if (started) return;
  initAudio();
  const agree = $('#bootAgree').checked;
  if (!resume && !agree) { toast('warn', '需要确认', '请先勾选「我已知晓这是虚构模拟」。'); sfx('error'); return; }
  if (!resume) {
    const alias = ($('#bootAlias').value || '').trim().replace(/[^\w\u4e00-\u9fa5.-]/g, '').slice(0, 16);
    newGame(alias || 'null_pointer');
  }
  started = true;
  $('#boot').classList.remove('show');
  $('#boot').style.display = 'none';
  $('#app').classList.add('on');
  applySettings();
  broadcastSeed();
  renderAll();
  startLoop();
  subscribe(emitHandler);
  save();
  if (!resume) {
    setTimeout(() => toast('info', '会话已建立', '左栏选择市场，先买一件三位数的货。'), 1200);
  }
}

function broadcastSeed() {
  for (let i = 0; i < 6; i++) {
    const d = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    broadcasts.push({ text: `成交 · ${d.code} · ${fmt(Math.round(400 + Math.random() * 7000))} DKC · 托管已释放`, at: Date.now() - i * 60000 });
  }
}

function initShell() {
  $$('#side [data-view]').forEach((b) => b.onclick = () => { sfx('click'); route(b.dataset.view); });
  $('#btnHelp').onclick = () => openModal({
    title: '操作手册', sub: 'SIMULATION',
    body: `<div class="help-body">
      <p><b>1. 市场</b> — 用暗币买入虚构货品，平台托管，验货通过才放款。</p>
      <p><b>2. 货舱</b> — 在途包裹到达后必须验货；假货可退货、揭发或转手。</p>
      <p><b>3. 拍卖</b> — 最后 9 秒开放「压哨」，命中按原价，偏出加价 8%。</p>
      <p><b>4. 资产</b> — 收购公司获得每小时被动收入，但会产生热度。</p>
      <p><b>5. 热度</b> — 超过 60 进入危险区，可能触发扫荡；洗币或换身份可降温。</p>
      <p><b>6. 结局</b> — 热度 100 被捕；净资产 50 万且声望 80 登顶；也可主动洗手。</p>
      <p class="fine">所有内容均为本地生成的虚构数据，不连接任何真实网络服务。</p>
    </div>`,
    actions: [{ label: '知道了', primary: true, onClick: closeModal }],
  });
  $('#btnSound').onclick = () => {
    S.settings.sound = !S.settings.sound;
    setSound(S.settings.sound);
    $('#btnSound').classList.toggle('off', !S.settings.sound);
    save();
  };
  $('#btnCrt').onclick = () => {
    S.settings.crt = !S.settings.crt;
    document.body.classList.toggle('no-crt', !S.settings.crt);
    $('#btnCrt').classList.toggle('off', !S.settings.crt);
    save();
  };
  $('#btnFx').onclick = () => {
    S.settings.fx = !S.settings.fx;
    document.body.classList.toggle('reduce-motion', S.settings.fx);
    $('#btnFx').classList.toggle('off', S.settings.fx);
    save();
    toast('info', S.settings.fx ? '已减少动效' : '动效已开启', '');
  };
  $('#addr').onclick = () => { navigator.clipboard?.writeText(META.addr); toast('info', '地址已复制', '（虚构地址，无法访问）'); };
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeModal(); }
    if (e.target.matches('input, textarea, select')) return;
    const map = { m: 'market', a: 'auction', c: 'cargo', w: 'wallet', s: 'assets', n: 'messages', t: 'terminal', p: 'profile' };
    if (map[e.key] && started) route(map[e.key]);
  });
  ['btnSound', 'btnCrt', 'btnFx'].forEach((id) => { if (!({ btnSound: S.settings.sound, btnCrt: S.settings.crt, btnFx: S.settings.fx })[id]) $('#' + id).classList.add('off'); });
}

// 背景矩阵雨
function rain() {
  const cv = $('#rain');
  const ctx = cv.getContext('2d');
  let w, h, cols, ys, chars = '01ABCDEFアカサタナハマヤラワ暗河';
  const resize = () => {
    w = cv.width = window.innerWidth; h = cv.height = window.innerHeight;
    cols = Math.floor(w / 18); ys = Array.from({ length: cols }, () => Math.random() * h);
  };
  resize(); window.addEventListener('resize', resize);
  let last = 0;
  const draw = (t) => {
    requestAnimationFrame(draw);
    if (document.body.classList.contains('reduce-motion')) return;
    if (t - last < 70) return;
    last = t;
    ctx.fillStyle = 'rgba(5,7,9,0.09)';
    ctx.fillRect(0, 0, w, h);
    ctx.font = '14px ui-monospace, monospace';
    ctx.fillStyle = 'rgba(157,255,60,0.16)';
    for (let i = 0; i < cols; i++) {
      const ch = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(ch, i * 18, ys[i]);
      ys[i] = ys[i] > h + Math.random() * 400 ? 0 : ys[i] + 18;
    }
  };
  requestAnimationFrame(draw);
}

export function bootApp() {
  initShell();
  rain();
  boot();
  window.__DF__ = { S, save, load, renderAll, route, tick: (...a) => import('./engine.js').then((E) => E.tick(...a)) };
}
