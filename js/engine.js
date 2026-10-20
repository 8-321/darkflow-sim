// DARKFLOW // 引擎：状态、时间、市场、交易、拍卖、资产、事件
import { ITEMS, VENDORS, COMPANIES, AUCTION_POOL, EVENTS, CONTRACTS, DIALOGS, CATS, RARITY, ACHIEVEMENTS, STORY } from './data.js';

const SAVE_KEY = 'darkflow.save.v1';
const DAILY_KEY = 'darkflow.daily.v1';
const BOARD_KEY = 'darkflow.daily.board.v1';
let slotKey = SAVE_KEY;
let rand = Math.random;

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash32(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}
export function seedRng(seed) {
  rand = seed == null ? Math.random : mulberry32(typeof seed === 'number' ? seed : hash32(String(seed)));
}
const rnd = (a = 0, b = 1) => a + rand() * (b - a);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const uid = () => rand().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);

export const fmt = (n) => Math.round(n).toLocaleString('en-US');
export const itemDef = (id) => ITEMS.find((i) => i.id === id) || null;
export const vendorOf = (id) => VENDORS.find((v) => v.id === id) || VENDORS[0];
export const catOf = (id) => CATS.find((c) => c.id === id) || CATS[0];
export const rarityOf = (r) => RARITY[r] || RARITY.common;

export const S = {
  version: 1,
  alias: 'null_pointer',
  walletAddr: null,
  credits: 2500,
  rep: 12,
  heat: 8,
  hour: 9,
  market: [],
  orders: [],
  inv: [],
  sellOrders: [],
  auctions: [],
  companies: { rig: 0, forge: 0, logi: 0, intel: 0, laundry: 0 },
  msgs: [],
  log: [],
  contracts: {},
  achievements: [],
  flags: {},
  stats: {
    trades: 0, inspections: 0, auctionsWon: 0, auctionsLost: 0, hacks: 0,
    ids: 0, profit: 0, maxSingle: 0, raids: 0, peakHeat: 0, leaks: 0,
  },
  settings: { sound: true, crt: true, fx: true },
  ending: null,
  pendingEvent: null,
  debt: {
    principal: STORY.debt.principal, left: STORY.debt.periods, paid: 0, overdue: 0, missed: 0,
    nextAt: STORY.debt.firstDue, cleared: false,
  },
  med: { cost: STORY.med.cost, paid: 0, missed: 0, nextAt: STORY.med.firstDue },
  lastSaved: 0,
  broadcast: [],
  seen: {},
  story: { chapter: 1, seen: {} },
};

const listeners = new Set();
export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
export const emit = (type = 'change', payload = null) => listeners.forEach((fn) => fn(type, payload));

// ── 时间 ────────────────────────────────────────────────
export const clock = () => {
  const day = Math.floor(S.hour / 24) + 1;
  const h = S.hour % 24;
  return { day, h, label: `第${String(day).padStart(2, '0')}天 ${String(h).padStart(2, '0')}:00` };
};

// ── 新局 / 存档 ─────────────────────────────────────────
export function newGame(alias) {
  Object.assign(S, {
    version: 1,
    alias: alias || 'null_pointer',
    walletAddr: null,
    credits: 2500,
    rep: 12,
    heat: 8,
    hour: 9,
    market: [],
    orders: [],
    inv: [],
    sellOrders: [],
    auctions: [],
    companies: { rig: 0, forge: 0, logi: 0, intel: 0, laundry: 0 },
    msgs: [],
    log: [],
    contracts: {},
    achievements: [],
    flags: {},
    stats: { trades: 0, inspections: 0, auctionsWon: 0, auctionsLost: 0, hacks: 0, ids: 0, profit: 0, maxSingle: 0, raids: 0, peakHeat: 0, leaks: 0 },
    settings: S.settings,
    ending: null,
    pendingEvent: null,
    debt: {
      principal: STORY.debt.principal, left: STORY.debt.periods, paid: 0, overdue: 0, missed: 0,
      nextAt: STORY.debt.firstDue, cleared: false,
    },
    med: { cost: STORY.med.cost, paid: 0, missed: 0, nextAt: STORY.med.firstDue },
    broadcast: [],
    seen: {},
    story: { chapter: 1, seen: {} },
  });
  buildMarket();
  seedAuctions();
  S.log.unshift({ t: Date.now(), type: 'sys', text: '会话建立 · 三跳电路就绪', delta: 0 });
  pushMsg('MOTH', '你能看见这行字，说明你的入口节点还没被标记。很好。');
  setTimeout(() => pushMsg('MOTH', '我是飞蛾。这里叫暗河。先从一单小生意开始——市场里三位数的货，随便挑一件。'), 4000);
  if (slotKey === SAVE_KEY) {
    setTimeout(() => pushMsg('LZ', '哥，今天抽血了。护士说下周还要一盒白舒。'), 6000);
    setTimeout(() => pushMsg('ASH', '48,000，十二期，每期 5,200。第 6 天 09:00 是第一期。别让我上门。'), 7600);
  }
  save();
  emit('new');
}

export function save() {
  try {
    localStorage.setItem(slotKey, JSON.stringify(S));
    S.lastSaved = Date.now();
  } catch (e) { /* quota */ }
}

export function load() {
  try {
    const raw = localStorage.getItem(slotKey);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data || data.version !== 1) return false;
    Object.keys(S).forEach((k) => { delete S[k]; });
    Object.assign(S, data);
    if (!S.market || !S.market.length) buildMarket();
    if (!S.auctions || !S.auctions.length) seedAuctions();
    if (!S.debt) S.debt = { principal: STORY.debt.principal, left: STORY.debt.periods, paid: 0, overdue: 0, missed: 0, nextAt: S.hour + 120, cleared: false };
    if (!S.med) S.med = { cost: STORY.med.cost, paid: 0, missed: 0, nextAt: S.hour + 48 };
    if (!S.story) S.story = { chapter: 1, seen: {} };
    return true;
  } catch (e) { return false; }
}

export function wipe() {
  localStorage.removeItem(SAVE_KEY);
  localStorage.removeItem(DAILY_KEY);
  localStorage.removeItem(BOARD_KEY);
}

// ── 每日挑战（固定种子 · 10 分钟 · 本机榜） ────────────────
export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}
function readBoard() {
  try { return JSON.parse(localStorage.getItem(BOARD_KEY)) || {}; } catch (e) { return {}; }
}
function writeBoard(b) {
  try { localStorage.setItem(BOARD_KEY, JSON.stringify(b)); } catch (e) { /* quota */ }
}
export function dailyBoard(date = todayStr()) {
  const list = readBoard()[date] || [];
  return list.slice().sort((a, b) => b.worth - a.worth);
}
export function dailyInfo() {
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data && data.daily ? data.daily : null;
  } catch (e) { return null; }
}
export function dailyLeft() {
  if (!S.daily || S.daily.finished) return 0;
  return Math.max(0, S.daily.endsAt - Date.now());
}
export function startDaily() {
  if (slotKey === DAILY_KEY && S.daily && !S.daily.finished) return S.daily;
  const date = todayStr();
  const prev = dailyInfo();
  if (prev && prev.date === date && prev.finished) return null;   // 一天一局
  save();                      // 主线进度先落盘
  const keepSettings = S.settings;
  slotKey = DAILY_KEY;
  seedRng('DF-' + date);
  Object.keys(S).forEach((k) => { delete S[k]; });
  newGame('challenger');
  S.alias = 'challenger';
  S.settings = keepSettings || S.settings;
  S.daily = { date, endsAt: Date.now() + 10 * 60 * 1000, start: Math.round(netWorth()), finished: false, score: 0, rank: 0 };
  save();
  emit('dailyStart');
  return S.daily;
}
export function resumeDaily() {
  if (slotKey === DAILY_KEY) return true;
  const info = dailyInfo();
  if (!info || info.finished || info.date !== todayStr()) return false;
  slotKey = DAILY_KEY;
  const ok = load();
  if (ok) seedRng('DF-' + info.date);
  emit('dailyStart');
  return ok;
}
export function finishDaily() {
  if (!S.daily || S.daily.finished) return S.daily;
  const score = Math.round(netWorth());
  const board = readBoard();
  const list = board[S.daily.date] || [];
  const entry = { id: uid(), alias: S.alias, worth: score, at: Date.now() };
  list.push(entry);
  list.sort((a, b) => b.worth - a.worth);
  const trimmed = list.slice(0, 10);
  board[S.daily.date] = trimmed;
  writeBoard(board);
  S.daily.finished = true;
  S.daily.score = score;
  S.daily.rank = trimmed.findIndex((e) => e.id === entry.id) + 1;
  save();
  emit('dailyEnd');
  return S.daily;
}
export function checkDaily() {
  if (S.daily && !S.daily.finished && Date.now() >= S.daily.endsAt) return finishDaily();
  return null;
}
export function abandonDaily() {
  localStorage.removeItem(DAILY_KEY);
  slotKey = SAVE_KEY;
  seedRng(null);
  emit('dailyExit');
}
export function exitDaily() {
  save();
  slotKey = SAVE_KEY;
  seedRng(null);
  Object.keys(S).forEach((k) => { delete S[k]; });
  const ok = load();
  emit('dailyExit');
  return ok;
}

// ── 存档码（离线迁移 / 私域分享） ─────────────────────────
const b64enc = (str) => {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  const CH = 0x8000;
  for (let i = 0; i < bytes.length; i += CH) bin += String.fromCharCode(...bytes.subarray(i, i + CH));
  return btoa(bin);
};
const b64dec = (b64) => {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
};
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(16).toUpperCase().padStart(8, '0');
}

export function exportCode() {
  const body = JSON.stringify({ k: 'DF1', v: 1, at: Date.now(), s: S });
  return `DF1-${fnv1a(body)}-${b64enc(body)}`;
}

export function importCode(input) {
  const raw = String(input || '').trim().replace(/\s+/g, '');
  const m = raw.match(/^DF1-([0-9A-F]{8})-(.+)$/);
  if (!m) return { ok: false, msg: '格式不正确：应以 DF1- 开头' };
  let body;
  try { body = b64dec(m[2]); } catch (e) { return { ok: false, msg: '编码无法解析，可能复制不完整' }; }
  if (fnv1a(body) !== m[1]) return { ok: false, msg: '校验失败：存档码被截断或改动过' };
  let data;
  try { data = JSON.parse(body); } catch (e) { return { ok: false, msg: '内容损坏' }; }
  if (!data || data.k !== 'DF1' || !data.s || data.s.version !== 1) return { ok: false, msg: '版本不兼容' };
  const st = data.s;
  for (const k of ['market', 'auctions', 'inv', 'orders', 'sellOrders', 'log', 'achievements', 'companies', 'settings', 'stats']) {
    if (st[k] == null) return { ok: false, msg: `字段缺失：${k}` };
  }
  Object.keys(S).forEach((k) => { delete S[k]; });
  Object.assign(S, st);
  if (!S.market.length) buildMarket();
  if (!S.debt) S.debt = { principal: STORY.debt.principal, left: STORY.debt.periods, paid: 0, overdue: 0, missed: 0, nextAt: S.hour + 120, cleared: false };
  if (!S.med) S.med = { cost: STORY.med.cost, paid: 0, missed: 0, nextAt: S.hour + 48 };
  if (!S.story) S.story = { chapter: 1, seen: {} };
  if (!S.auctions.length) seedAuctions();
  S.pendingEvent = null;
  save();
  emit('change');
  return { ok: true, at: data.at, alias: S.alias };
}


// ── 市场生成 ────────────────────────────────────────────
function buildMarket() {
  S.market = ITEMS.map((def) => {
    const v = vendorOf(def.vendor);
    const open = Math.round(def.base * rnd(0.9, 1.08));
    const price = Math.max(30, Math.round(open * rnd(0.95, 1.05)));
    return {
      uid: 'm' + def.id,
      defId: def.id,
      price,
      prev: price,
      open,
      vendorId: v.id,
      stock: Math.floor(rnd(1, 5)),
      trend: 0,
    };
  });
}

function seedAuctions() {
  S.auctions = [];
  const pool = [...AUCTION_POOL].sort(() => rand() - 0.5).slice(0, 3);
  pool.forEach((p) => spawnAuction(p));
}

function spawnAuction(p) {
  const def = itemDef(p.defId);
  const names = ['灰鹭', 'ZERO', '第七个买家', '南风', 'THE_BANKER', '无人', 'm0th', '9'];
  const bidders = names.sort(() => rand() - 0.5).slice(0, 4).map((n, i) => ({
    name: n, aggression: rnd(.35, 1), delay: rnd(1500, 6000), lastBid: 0,
  }));
  S.auctions.push({
    id: 'a' + uid(),
    defId: p.defId,
    title: p.title,
    desc: p.desc,
    start: p.start,
    step: p.step,
    current: p.start,
    endsAt: Date.now() + rnd(55, 115) * 1000,
    topBidder: null,
    playerTop: false,
    held: 0,
    bidders,
    history: [],
    def,
  });
}

export const refreshAuctions = () => {
  while (S.auctions.length < 3) {
    const used = S.auctions.map((a) => a.defId);
    const pool = AUCTION_POOL.filter((p) => !used.includes(p.defId));
    spawnAuction(pick(pool.length ? pool : AUCTION_POOL));
  }
};

// ── 价格波动 ────────────────────────────────────────────
function driftMarket() {
  const catTrend = {};
  CATS.forEach((c) => { catTrend[c.id] = rnd(-0.06, 0.07); });
  S.market.forEach((m) => {
    const def = itemDef(m.defId);
    const prev = m.price;
    const noise = rnd(-def.vol, def.vol) * 0.35;
    let next = prev * (1 + noise + catTrend[def.cat]);
    // 回归基准价
    next = next * 0.92 + def.base * 0.08;
    m.price = Math.max(30, Math.round(next));
    m.prev = prev;
    m.trend = m.price - prev;
    if (rand() < 0.25) m.stock = clamp(m.stock + Math.floor(rnd(-1, 2)), 0, 6);
  });
}

export const priceDelta = (m) => (m.price - m.prev);

// ── 交易 ────────────────────────────────────────────────
export function buyListing(uidOrId, qty = 1) {
  const m = S.market.find((x) => x.uid === uidOrId || x.defId === uidOrId);
  if (!m) return { ok: false, msg: '商品不存在' };
  const def = itemDef(m.defId);
  if (m.stock < qty) return { ok: false, msg: '库存不足' };
  const total = m.price * qty;
  if (S.credits < total) return { ok: false, msg: '余额不足' };

  S.credits -= total;
  m.stock -= qty;
  const speed = S.companies.logi ? S.companies.logi * 2 : 0;
  const arrives = Math.max(2, Math.round(rnd(4, 9) - speed));
  const order = {
    id: 'o' + uid(),
    defId: m.defId,
    name: def.name,
    code: def.code,
    price: total,
    qty,
    vendorId: m.vendorId,
    placed: S.hour,
    arriveAt: S.hour + arrives,
    status: 'transit',
    fake: false,
    inspected: false,
    escrow: '0x' + rand().toString(16).slice(2, 10) + rand().toString(16).slice(2, 10),
  };
  S.orders.push(order);
  S.stats.trades++;
  S.stats.maxSingle = Math.max(S.stats.maxSingle, total);
  addHeat(def.risk * 0.55 + total / 2200);
  pushLog('buy', `托管下单 ${def.code} × ${qty}`, -total);
  progressContracts();
  save(); emit('buy', order);
  return { ok: true, order };
}

export function arriveOrders() {
  S.orders.forEach((o) => {
    if (o.status === 'transit' && S.hour >= o.arriveAt) {
      o.status = 'arrived';
      pushLog('arrive', `包裹到达 · ${o.code} · 等待验货`, 0);
      emit('notify', { kind: 'info', title: '包裹到达', text: `${o.code} 已送达自提点，请在「订单」中验货。` });
      if (!S.seen.arrive) { S.seen.arrive = 1; pushMsg('GHOST', '货到了不代表是你的。验货之前，别点确认。'); }
    }
  });
}

export function inspectOrder(orderId) {
  const o = S.orders.find((x) => x.id === orderId);
  if (!o || o.status !== 'arrived') return { ok: false, msg: '无法验货' };
  const v = vendorOf(o.vendorId);
  const def = itemDef(o.defId);
  const marketNow = S.market.find((m) => m.defId === o.defId);
  const below = marketNow ? clamp((marketNow.price - o.price / o.qty) / marketNow.price, 0, .35) : 0;
  let fakeChance = clamp((5 - v.rating) * 0.075 + below * 0.9 + 0.015, 0.01, 0.55);
  if (S.companies.intel > 0) fakeChance *= 0.82;
  const fake = rand() < fakeChance;
  o.fake = fake;
  o.inspected = true;
  o.status = 'inspected';
  S.stats.inspections++;
  if (!S.seen.inspect) { S.seen.inspect = 1; }
  progressContracts();
  if (!fake) {
    o.status = 'done';
    addInv(o.defId, o.qty, o.price / o.qty, false);
    pushLog('inspect', `验货通过 · ${o.code} × ${o.qty}`, 0);
    emit('notify', { kind: 'good', title: '验货通过', text: `${o.code} 已入库。` });
  } else {
    addHeat(3);
    pushLog('inspect', `验货异常 · ${o.code} 疑似假货`, 0);
  }
  save(); emit('inspect', o);
  return { ok: true, order: o, fake, chance: fakeChance, def };
}

export function resolveFake(orderId, choice) {
  const o = S.orders.find((x) => x.id === orderId);
  if (!o) return { ok: false };
  const v = vendorOf(o.vendorId);
  if (choice === 'return') {
    const back = Math.round(o.price * 0.7);
    S.credits += back;
    S.rep = clamp(S.rep - 1, 0, 100);
    addHeat(-2);
    pushLog('refund', `退货 · 退回 ${fmt(back)} DKC`, back);
    emit('notify', { kind: 'warn', title: '已退货', text: `扣除 30% 处理费，退回 ${fmt(back)} DKC。` });
  } else if (choice === 'expose') {
    S.rep = clamp(S.rep + 6, 0, 100);
    addHeat(2);
    S.flags['blacklist_' + v.id] = true;
    S.stats.leaks++;
    pushLog('expose', `揭发卖家 ${v.name} · 声望 +6`, 0);
    emit('notify', { kind: 'good', title: '已揭发', text: `${v.name} 被平台降权，声望 +6。` });
  } else {
    addInv(o.defId, o.qty, o.price / o.qty, true);
    S.rep = clamp(S.rep - 6, 0, 100);
    addHeat(5);
    pushLog('resell', `劣质货入库 · ${o.code}（不可声明为正品）`, 0);
    emit('notify', { kind: 'warn', title: '已入库（劣质）', text: '这批货只能低价出手，成交会损伤声望。' });
  }
  o.status = 'done';
  save(); emit('change');
  return { ok: true };
}

function addInv(defId, qty, cost, fake = false) {
  const found = S.inv.find((i) => i.defId === defId && i.fake === fake);
  if (found) {
    found.qty += qty;
    found.cost = (found.cost * (found.qty - qty) + cost * qty) / found.qty;
  } else {
    S.inv.push({ uid: 'i' + uid(), defId, qty, cost, fake });
  }
}

export function sellInv(uidStr, ask, qty = 1) {
  const it = S.inv.find((i) => i.uid === uidStr);
  if (!it) return { ok: false, msg: '库存不存在' };
  if (it.qty < qty) return { ok: false, msg: '数量不足' };
  const m = S.market.find((x) => x.defId === it.defId);
  const askTotal = Math.round(ask * qty);
  it.qty -= qty;
  S.sellOrders.push({
    id: 's' + uid(),
    defId: it.defId,
    qty,
    ask: askTotal,
    cost: it.cost * qty,
    fake: it.fake,
    listedAt: S.hour,
    expireAt: S.hour + 12,
    marketRef: m ? m.price : ask,
  });
  if (it.qty <= 0) S.inv = S.inv.filter((x) => x !== it);
  pushLog('list', `挂单 ${itemDef(it.defId).code} × ${qty} @ ${fmt(ask)}`, 0);
  save(); emit('change');
  return { ok: true };
}

function settleSellOrders() {
  const done = [];
  S.sellOrders.forEach((so) => {
    if (S.hour >= so.expireAt) { done.push(so); return; }
    const def = itemDef(so.defId);
    const premium = so.ask / Math.max(1, so.marketRef);
    const repF = 0.45 + S.rep / 90;
    const fakeF = so.fake ? 0.55 : 1;
    const p = clamp(0.22 * repF * fakeF * clamp(1.55 - premium, 0.03, 1.4), 0.01, 0.75);
    if (rand() < p) {
      const fee = Math.round(so.ask * 0.03);
      S.credits += so.ask - fee;
      S.stats.trades++;
      S.stats.profit += so.ask - fee - so.cost;
      if (so.fake) { S.rep = clamp(S.rep - 5, 0, 100); addHeat(4); S.stats.leaks++; }
      else S.rep = clamp(S.rep + 0.6, 0, 100);
      addHeat(def.risk * 0.15);
      pushLog('sold', `成交 ${def.code} × ${so.qty} · 平台费 ${fmt(fee)}`, so.ask - fee);
      emit('notify', { kind: 'good', title: '挂单成交', text: `${def.code} 售出，到账 ${fmt(so.ask - fee)} DKC。` });
      done.push(so);
      progressContracts();
    }
  });
  if (done.length) {
    S.sellOrders = S.sellOrders.filter((x) => !done.includes(x));
    // 过期未售退回库存
    done.filter((x) => S.hour >= x.expireAt).forEach((x) => addInv(x.defId, x.qty, x.cost, x.fake));
    emit('tick');
  }
}

export function cancelSell(id) {
  const so = S.sellOrders.find((x) => x.id === id);
  if (!so) return { ok: false, msg: '挂单不存在' };
  addInv(so.defId, so.qty, so.cost, so.fake);
  S.sellOrders = S.sellOrders.filter((x) => x.id !== id);
  pushLog('cancel', `撤单 ${itemDef(so.defId).code} × ${so.qty}`, 0);
  save(); emit('change');
  return { ok: true };
}

// ── 拍卖 ────────────────────────────────────────────────
export function auctionBid(id, amount) {
  const a = S.auctions.find((x) => x.id === id);
  if (!a) return { ok: false, msg: '拍品不存在' };
  if (Date.now() > a.endsAt) return { ok: false, msg: '已结束' };
  const min = a.current + a.step;
  if (amount < min) return { ok: false, msg: `最低出价 ${fmt(min)}` };
  const extra = a.held;
  if (S.credits + extra < amount) return { ok: false, msg: '余额不足' };
  S.credits += extra;
  S.credits -= amount;
  a.held = amount;
  a.current = amount;
  a.topBidder = 'YOU';
  a.playerTop = true;
  a.history.push({ who: 'YOU', amount, at: Date.now() });
  pushLog('bid', `出价 ${fmt(amount)} · ${a.title}`, -amount);
  emit('bid', a);
  save();
  return { ok: true, auction: a };
}

export function refundAuction(a) {
  if (a.held && a.playerTop) { S.credits += a.held; a.held = 0; }
  a.playerTop = false;
}

export function aiAuctionTick() {
  const now = Date.now();
  S.auctions.forEach((a) => {
    if (now > a.endsAt) return resolveAuction(a);
    if (now > a.endsAt - 9000) return; // 最后 9 秒不再 AI 抬价（留给压哨）
    a.bidders.forEach((b) => {
      if (b.name === a.topBidder) return;
      if (now - b.lastBid < b.delay) return;
      b.lastBid = now;
      const left = (a.endsAt - now) / 1000;
      const heat = a.current / a.start;
      const urgency = left < 30 ? 1.6 : 1;
      const chance = clamp(0.10 + b.aggression * 0.22 * urgency - (heat - 1) * 0.15, 0.02, 0.55);
      if (rand() < chance) {
        const inc = a.step * (rand() < 0.18 ? 2 : 1);
        const amount = a.current + inc;
        const wasPlayer = a.playerTop;
        if (wasPlayer) refundAuction(a);
        a.current = amount;
        a.topBidder = b.name;
        a.history.push({ who: b.name, amount, at: now });
        emit(wasPlayer ? 'outbid' : 'bid', a);
        if (a.history.length > 14) a.history.shift();
      }
    });
  });
}

export function resolveAuction(a) {
  if (a.resolved) return;
  a.resolved = true;
  const def = itemDef(a.defId);
  if (a.playerTop) {
    a.held = 0;
    addInv(a.defId, 1, a.current, false);
    S.stats.auctionsWon++;
    S.rep = clamp(S.rep + 2.5, 0, 100);
    addHeat(4 + a.current / 3000);
    pushLog('won', `赢拍 ${def.code} @ ${fmt(a.current)}`, -a.current);
    emit('notify', { kind: 'good', title: '拍卖成交', text: `你赢下了 ${a.title}，${fmt(a.current)} DKC 已从托管扣除。` });
  } else {
    const involved = a.held > 0 || a.history.some((h) => h.who === 'YOU');
    if (a.held) { S.credits += a.held; a.held = 0; }
    if (involved) {
      S.stats.auctionsLost++;
      pushLog('lost', `被反超 · ${def.code}`, 0);
      emit('notify', { kind: 'bad', title: '拍卖被反超', text: `${a.title} 以 ${fmt(a.current)} DKC 成交，冻结资金已退回。` });
    }
  }
  S.auctions = S.auctions.filter((x) => x.id !== a.id);
  setTimeout(() => { refreshAuctions(); emit('change'); }, 900);
  progressContracts();
  save();
}

export function snipe(id, success) {
  const a = S.auctions.find((x) => x.id === id);
  if (!a) return { ok: false };
  const min = a.current + a.step;
  const fee = success ? 1 : 1.08;
  const amount = Math.round(min * fee);
  if (S.credits + a.held < amount) return { ok: false, msg: '余额不足' };
  S.credits += a.held; S.credits -= amount;
  a.held = amount; a.current = amount;
  a.topBidder = 'YOU'; a.playerTop = true;
  a.endsAt += success ? 5000 : 0;
  a.history.push({ who: 'YOU', amount, at: Date.now() });
  pushLog('snipe', `压哨加价 ${fmt(amount)}`, -amount);
  emit('bid', a); save();
  return { ok: true, amount };
}

// ── 公司 ────────────────────────────────────────────────
const compDef = (id) => COMPANIES.find((c) => c.id === id);
export const companyCost = (id) => {
  const c = compDef(id); const lv = S.companies[id] || 0;
  return Math.round(c.base * Math.pow(2.35, lv));
};
export function buyCompany(id) {
  const c = compDef(id); if (!c) return { ok: false };
  const cost = companyCost(id);
  if (S.credits < cost) return { ok: false, msg: '余额不足' };
  S.credits -= cost;
  S.companies[id] = (S.companies[id] || 0) + 1;
  addHeat(2.5);
  pushLog('asset', `收购 ${c.name} Lv.${S.companies[id]}`, -cost);
  emit('notify', { kind: 'good', title: '资产过户', text: `${c.name} Lv.${S.companies[id]} 已归属你，每小时产出。` });
  progressContracts(); save(); emit('change');
  return { ok: true, level: S.companies[id], cost };
}
export const companiesOwned = () => COMPANIES.filter((c) => (S.companies[c.id] || 0) > 0).length;

function companyTick() {
  COMPANIES.forEach((c) => {
    const lv = S.companies[c.id] || 0;
    if (!lv) return;
    const p = c.perLevel;
    if (p.income) S.credits += p.income * lv;
    if (p.heat) addHeat(p.heat * lv);
    if (c.id === 'rig') { /* income only */ }
    if (c.id === 'forge' && S.hour % 4 === 0) {
      const ids = ITEMS.filter((i) => i.cat === 'id');
      for (let k = 0; k < lv; k++) {
        const d = pick(ids);
        addInv(d.id, 1, d.base * 0.45, rand() < 0.08);
      }
      pushLog('forge', `工坊产出 ${lv} 件身份货`, 0);
    }
  });
}

export const netWorth = () => {
  const invVal = S.inv.reduce((s, i) => {
    const m = S.market.find((x) => x.defId === i.defId);
    return s + (m ? m.price : itemDef(i.defId).base) * (i.fake ? 0.35 : 0.82) * i.qty;
  }, 0);
  const compVal = COMPANIES.reduce((s, c) => s + (S.companies[c.id] || 0) * c.base * 0.7, 0);
  return Math.round(S.credits + invVal + compVal);
};

export const inventoryValue = () => S.inv.reduce((s, i) => {
  const m = S.market.find((x) => x.defId === i.defId);
  return s + (m ? m.price : 0) * i.qty * (i.fake ? 0.35 : 1);
}, 0);

// ── 风险 ────────────────────────────────────────────────
export function addHeat(x) {
  S.heat = clamp(S.heat + x, 0, 100);
  S.stats.peakHeat = Math.max(S.stats.peakHeat, S.heat);
  if (S.heat >= 100 && !S.ending) triggerEnding('arrest');
  checkAchievements();
}

export function mix(amount) {
  amount = Math.round(amount);
  if (amount < 100) return { ok: false, msg: '至少 100 DKC' };
  if (S.credits < amount) return { ok: false, msg: '余额不足' };
  const laundry = S.companies.laundry || 0;
  const feeRate = 0.08 * (1 - Math.min(0.5, laundry * 0.1));
  const fee = Math.round(amount * feeRate);
  const contaminated = rand() < 0.12;
  S.credits -= fee;
  let lost = 0;
  if (contaminated) { lost = Math.round(amount * 0.3); S.credits -= lost; }
  const drop = clamp((amount / 2200) * (1 + laundry * 0.15), 1, 16);
  addHeat(-drop);
  pushLog(contaminated ? 'mix-fail' : 'mix', contaminated ? `混币污染 · 损失 ${fmt(lost)}` : `混币成功 · 热度 -${drop.toFixed(1)}`, -fee - lost);
  save(); emit('change');
  return { ok: true, fee, lost, drop, contaminated };
}

export function newIdentity() {
  const cost = Math.round(5000 * Math.pow(2.2, S.stats.ids));
  if (S.credits < cost) return { ok: false, msg: `需要 ${fmt(cost)} DKC` };
  S.credits -= cost;
  S.stats.ids++;
  S.heat = 0;
  S.rep = clamp(S.rep - 10, 0, 100);
  S.orders = S.orders.filter((o) => o.status === 'transit' ? false : true);
  pushLog('id', `更换身份 · 旧身份已销毁`, -cost);
  emit('notify', { kind: 'good', title: '新身份生效', text: '热度清零，声望 -10。过去的东西不会跟着你。' });
  checkAchievements(); save(); emit('change');
  return { ok: true, cost };
}

// ── 事件 ────────────────────────────────────────────────
export function maybeEvent() {
  if (S.pendingEvent) return;
  const h = S.hour;
  if (h % 6 === 0 && S.heat > 25) {
    const chance = clamp((S.heat - 25) / 105, 0.06, 0.72);
    if (rand() < chance) {
      const ev = EVENTS.find((e) => e.id === 'raid');
      S.pendingEvent = { ...ev, ctx: {} };
      return;
    }
  }
  if (h % 3 === 0) {
    const pool = EVENTS.filter((e) => e.id !== 'raid' && S.heat >= (e.minHeat || 0) && (S.debt ? S.debt.missed >= (e.minMissed || 0) : !e.minMissed));
    const total = pool.reduce((s, e) => s + e.weight, 0);
    if (rand() < 0.26) {
      let r = rand() * total;
      let chosen = pool[0];
      for (const e of pool) { r -= e.weight; if (r <= 0) { chosen = e; break; } }
      S.pendingEvent = { ...chosen, ctx: {} };
    }
  }
}

export function resolveEvent(choiceIndex) {
  const ev = S.pendingEvent;
  if (!ev) return null;
  const choice = ev.choices[choiceIndex];
  if (!choice) return null;
  const e = choice.effect || {};
  if (e.credits) { S.credits = Math.max(0, S.credits + e.credits); pushLog('event', `${ev.title} · 资金 ${e.credits > 0 ? '+' : ''}${fmt(e.credits)}`, e.credits); }
  if (e.rep) { S.rep = clamp(S.rep + e.rep, 0, 100); }
  if (e.heat) { addHeat(e.heat); }
  if (e.flag) S.flags[e.flag] = true;
  if (e.debtOverdue) S.debt.overdue = Math.max(0, S.debt.overdue + e.debtOverdue);
  if (e.debtPenalty) { S.debt.overdue += e.debtPenalty; pushLog('debt', `灰账追加欠款 +${fmt(e.debtPenalty)}`, 0); }
  if (e.riskRaid) {
    S.stats.raids++;
    if (rand() < 0.45) {
      const lost = Math.round(S.credits * 0.15);
      S.credits -= lost;
      if (S.inv.length) S.inv.splice(Math.floor(rand() * S.inv.length), 1);
      addHeat(10);
      pushLog('raid', `扫荡命中 · 损失 ${fmt(lost)} DKC 与部分库存`, -lost);
      S.pendingEvent = null; save(); emit('change');
      return { text: choice.result + ' 但这一次，他们进了门。', hit: true, lost };
    }
  }
  S.stats.raids += ev.id === 'raid' ? 0 : 0;
  S.pendingEvent = null;
  pushLog('event', `事件 · ${ev.title}`, 0);
  save(); emit('change');
  return { text: choice.result, hit: false };
}

// ── 任务 / 成就 / 结局 ──────────────────────────────────
function progressContracts() {
  CONTRACTS.forEach((c) => {
    const st = S.contracts[c.id] || (S.contracts[c.id] = { done: false, claimed: false, at: 0 });
    if (!st.done && contractProgress(c.id) >= 1) {
      st.done = true;
      S.credits += c.reward;
      S.rep = clamp(S.rep + c.rep, 0, 100);
      pushLog('contract', `任务完成 · ${c.title} · +${fmt(c.reward)}`, c.reward);
      emit('notify', { kind: 'good', title: `任务完成 · ${c.title}`, text: `+${fmt(c.reward)} DKC，声望 +${c.rep}` });
      emit('contract', c);
    }
  });
}

export function contractProgress(id) {
  switch (id) {
    case 'k1': return Math.min(1, S.stats.trades / 1);
    case 'k2': return Math.min(1, S.stats.inspections / 1);
    case 'k3': return Math.min(1, S.stats.auctionsWon / 1);
    case 'k4': return Math.min(1, companiesOwned() / 1);
    case 'k5': return (S.stats.peakHeat >= 60 && S.hour >= 12) ? 1 : (S.stats.peakHeat >= 60 ? .6 : Math.min(.5, S.heat / 120));
    case 'k6': return Math.min(1, netWorth() / 100000);
    default: return 0;
  }
}

function checkAchievements() {
  const has = (id) => S.achievements.includes(id);
  const grant = (id) => { if (!has(id)) { S.achievements.push(id); const a = ACHIEVEMENTS.find((x) => x.id === id); emit('notify', { kind: 'good', title: '成就解锁', text: a ? a.name : id }); } };
  if (S.stats.trades >= 1) grant('a1');
  if (S.stats.inspections >= 5) grant('a2');
  if (S.stats.auctionsWon >= 5) grant('a3');
  if (companiesOwned() >= 3) grant('a4');
  if (S.stats.peakHeat >= 85 && !S.ending) grant('a5');
  if (S.stats.hacks >= 3) grant('a6');
  if (S.stats.ids >= 1) grant('a7');
  if (netWorth() >= 100000) grant('a8');
  if (S.heat <= 5 && S.hour > 6) grant('a9');
  if (S.ending === 'kingpin') grant('a10');
}

export function triggerEnding(kind) {
  if (S.ending) return;
  S.ending = { kind, at: S.hour, worth: netWorth(), rep: S.rep, stats: { ...S.stats } };
  S.stats.arrests = kind === 'arrest' ? (S.stats.arrests || 0) + 1 : S.stats.arrests || 0;
  pushLog('ending', kind === 'arrest' ? '被捕 · 会话被强制终止' : kind === 'kingpin' ? '登顶 · 暗河之主' : '金盆洗手', 0);
  save(); emit('ending', S.ending);
}

export function retire() { if (!S.ending) triggerEnding('retire'); }

// ── 破解奖励 ────────────────────────────────────────────
export function cleanReward() {
  const gain = Math.round(320 + rand() * 680);
  S.credits += gain;
  S.heat = clamp(S.heat - 1.5, 0, 100);
  S.rep = clamp(S.rep + 1, 0, 100);
  S.stats.gigs = (S.stats.gigs || 0) + 1;
  pushLog('gig', `数据清洗 +${fmt(gain)}`, gain);
  checkAchievements();
  save(); emit('change');
  return { gain };
}

export function crackReward() {
  const gain = Math.round(rnd(500, 1400));
  S.credits += gain;
  S.stats.hacks++;
  addHeat(4.5);
  const ids = ITEMS.filter((i) => i.cat === 'data');
  const d = pick(ids);
  addInv(d.id, 1, d.base * 0.4, false);
  pushLog('crack', `破解成功 · 截获 ${d.code} · +${fmt(gain)} DKC`, gain);
  checkAchievements(); save(); emit('change');
  return { gain, def: d };
}

// ── 债务 / 药费 ─────────────────────────────────────────
export const daysLeft = (at) => Math.max(0, Math.ceil((at - S.hour) / 24));
export const dueLabel = (at) => `第 ${String(Math.floor(at / 24) + 1).padStart(2, '0')} 天 ${String(at % 24).padStart(2, '0')}:00`;
export function debtInfo() {
  const d = S.debt || {};
  const inst = STORY.debt.installment;
  return {
    installment: inst, left: d.left || 0, paid: d.paid || 0, overdue: d.overdue || 0, missed: d.missed || 0,
    cleared: !!d.cleared, nextAt: d.nextAt || 0, days: daysLeft(d.nextAt || 0),
    totalLeft: d.cleared ? 0 : (d.left || 0) * inst + (d.overdue || 0),
    settle: d.cleared ? 0 : Math.round((d.left || 0) * inst * 0.92 + (d.overdue || 0)),
  };
}
export function medInfo() {
  const m = S.med || {};
  return { cost: m.cost || STORY.med.cost, paid: m.paid || 0, missed: m.missed || 0, nextAt: m.nextAt || 0, days: daysLeft(m.nextAt || 0) };
}

export function payInstallment() {
  const d = S.debt;
  if (d.cleared) return { ok: false, msg: '已经结清了。' };
  const inst = STORY.debt.installment;
  if (S.credits < inst) return { ok: false, msg: `余额不够这一期，还差 ${fmt(inst - S.credits)}。` };
  S.credits -= inst; d.paid += inst; d.left -= 1;
  d.nextAt = S.hour + STORY.debt.period;
  pushLog('debt', `提前还一期 -${fmt(inst)} · 剩 ${d.left} 期`, -inst);
  if (d.left <= 0) clearDebt();
  else { pushMsg('ASH', `提前还的一期收到了。剩 ${d.left} 期。`); award('a11'); }
  save(); emit('change'); storyTick();
  return { ok: true, left: d.left };
}
export function settleDebt() {
  const info = debtInfo();
  if (info.cleared) return { ok: false, msg: '已经结清了。' };
  if (S.credits < info.settle) return { ok: false, msg: `还差 ${fmt(info.settle - S.credits)}。` };
  S.credits -= info.settle;
  S.debt.paid += info.settle;
  clearDebt();
  save(); emit('change');
  return { ok: true, cost: info.settle };
}
function clearDebt() {
  S.debt.cleared = true; S.debt.left = 0; S.debt.nextAt = 0;
  pushLog('debt', '灰账结清 · 债务清零', 0);
  pushMsg('ASH', STORY.beats.cleared);
  pushMsg('LZ', STORY.beats.clearedSis);
  if (!S.story) S.story = { chapter: 1, seen: {} };
  if (S.story.chapter < 4) { S.story.chapter = 4; emit('chapter', STORY.chapters[4]); }
  award('a12');
}

// ── 主循环 ──────────────────────────────────────────────
export function tick(hours = 1) {
  if (S.ending) return;
  if (S.daily && !S.daily.finished && Date.now() >= S.daily.endsAt) finishDaily();
  for (let i = 0; i < hours; i++) {
    S.hour++;
    driftMarket();
    arriveOrders();
    settleSellOrders();
    companyTick();
    addHeat(-0.15);
    S.rep = clamp(S.rep + 0.02, 0, 100);
    maybeEvent();
    debtTick();
    medTick();
    storyTick();
    if (S.heat >= 100) { triggerEnding('arrest'); break; }
  }
  if (netWorth() >= 500000 && S.rep >= 80 && !S.ending) triggerEnding('kingpin');
  progressContracts();
  checkAchievements();
  if (!S.seen.heat60 && S.heat >= 60) {
    S.seen.heat60 = 1;
    pushMsg('GHOST', '你的热度到 60 了。现在开始，每一次大额交易都像是在黑暗里点火。去洗币，或者换个身份。');
  }
  save(); emit('tick');
}

function debtTick() {
  const d = S.debt;
  if (!d || d.cleared || S.ending) return;
  if (S.hour < d.nextAt) return;
  const inst = STORY.debt.installment;
  if (S.credits >= inst) {
    S.credits -= inst; d.paid += inst; d.left -= 1; d.nextAt += STORY.debt.period;
    pushLog('debt', `月供自动扣款 -${fmt(inst)} · 剩 ${d.left} 期`, -inst);
    if (d.left === STORY.debt.periods - 1 && once('payFirst')) {
      pushMsg('ASH', STORY.beats.payFirst); pushMsg('LZ', STORY.beats.payFirstSis);
    } else pushMsg('ASH', `第 ${STORY.debt.periods - d.left} 期已扣。剩 ${d.left} 期。`);
    award('a11');
    if (d.left <= 0) clearDebt();
  } else {
    const pen = Math.round(inst * STORY.debt.penalty);
    d.overdue += inst + pen; d.missed += 1; d.nextAt += STORY.debt.period;
    addHeat(10); S.rep = clamp(S.rep - 5, 0, 100);
    pushLog('debt', `月供违约 · 罚息 ${fmt(pen)} 已记`, 0);
    if (d.missed === 1) pushMsg('ASH', STORY.beats.miss1);
    else if (d.missed === 2) pushMsg('ASH', STORY.beats.miss2);
    else pushMsg('ASH', `第 ${d.missed} 次没扣到。罚息 ${fmt(pen)}。`);
    if (d.missed >= STORY.debt.maxMiss) triggerEnding('liquidated');
  }
}

function medTick() {
  const m = S.med;
  if (!m || S.ending) return;
  if (S.hour < m.nextAt) return;
  if (S.credits >= m.cost) {
    S.credits -= m.cost; m.paid += 1; m.nextAt += STORY.med.period;
    pushLog('med', `续药 -${fmt(m.cost)} · ${STORY.drug.name}`, -m.cost);
    if (m.paid === 1) pushMsg('LZ', '药拿到了。哥，你别太晚睡。');
    if (m.paid === 3 && once('med3')) pushMsg('LZ', STORY.beats.med3);
  } else {
    m.missed += 1; m.nextAt += STORY.med.period;
    pushLog('med', `药费不足 · 欠 ${fmt(m.cost)}`, 0);
    if (m.missed === 1) pushMsg('LZ', STORY.beats.medMiss1);
    else if (m.missed === 2) pushMsg('LZ', STORY.beats.medMiss2);
    else pushMsg('LZ', '哥，药停了。医生说不能停。');
    if (m.missed >= STORY.med.maxMiss) triggerEnding('medstop');
  }
}

function award(id) {
  if (S.achievements.includes(id)) return;
  S.achievements.push(id);
  const a = ACHIEVEMENTS.find((x) => x.id === id);
  emit('notify', { kind: 'good', title: '成就解锁', text: a ? a.name : id });
}

// ── 剧情节拍 ───────────────────────────────────────────
function once(key) {
  if (!S.story) S.story = { chapter: 1, seen: {} };
  if (S.story.seen[key]) return false;
  S.story.seen[key] = true;
  return true;
}

export function sisterState() {
  const m = S.med || { missed: 0, paid: 0 };
  if (m.missed >= 2) return { k: 'critical', cn: '危急', hint: '断药两次，指标在往下掉' };
  if (m.missed >= 1) return { k: 'weak', cn: '虚弱', hint: '断过一次药' };
  if (m.paid < 1) return { k: 'weak', cn: '待药', hint: '第一盒还没续上' };
  return { k: 'stable', cn: '稳定', hint: `已续 ${m.paid} 盒` };
}

function storyTick() {
  if (!S.story) S.story = { chapter: 1, seen: {} };
  const d = S.debt, m = S.med;
  let ch = 1;
  if (d && d.left < STORY.debt.periods) ch = 2;
  if (d && d.missed >= 1) ch = 3;
  if (d && d.cleared) ch = 4;
  if (ch > S.story.chapter) {
    S.story.chapter = ch;
    const def = STORY.chapters[ch];
    if (def) { pushLog('story', `进入 ${def.tag}`, 0); emit('chapter', def); }
    save();
  }
  if (d && !d.cleared && d.nextAt > S.hour && d.nextAt - S.hour <= 48 && once('warn48')) {
    pushMsg('ASH', STORY.beats.warn48);
  }
}

export function pushMsg(from, text) {
  S.msgs.push({ id: 'msg' + uid(), from, text, at: S.hour, read: false });
  if (S.msgs.length > 60) S.msgs.shift();
  emit('msg');
}

export function pushLog(type, text, delta = 0) {
  S.log.unshift({ t: Date.now(), at: S.hour, type, text, delta, bal: S.credits });
  if (S.log.length > 80) S.log.pop();
  emit('log');
}

export function markMsgsRead() {
  S.msgs.forEach((m) => { m.read = true; });
  save(); emit('change');
}

export const unread = () => S.msgs.filter((m) => !m.read).length;

// 自动化测试口
export const __test = { tick, addHeat, buildMarket, settleSellOrders };
