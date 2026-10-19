// DARKFLOW // 行情卡：把当前存档画成一张 1080×1350 的分享图
// 纯 Canvas 生成，无外部图片/字体文件。

const W = 1080;
const H = 1350;
const ACID = '#9dff3c';
const FG = '#e6f5e0';
const DIM = '#6c7d72';
const DIM2 = '#3d4a45';
const LINE = '#16212b';
const RED = '#ff4b4b';
const AMBER = '#ffb64d';

const F = (size, weight = '400', mono = false) =>
  `${weight} ${size}px ${mono ? '"Consolas","SFMono-Regular",monospace' : '"Microsoft YaHei","PingFang SC",sans-serif'}`;

function clip(ctx, text, max, font) {
  ctx.font = font;
  if (ctx.measureText(text).width <= max) return text;
  let s = text;
  while (s.length > 1 && ctx.measureText(s + '…').width > max) s = s.slice(0, -1);
  return s + '…';
}

function grid(ctx) {
  ctx.strokeStyle = 'rgba(30, 48, 58, .55)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 60) {
    ctx.beginPath(); ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, H); ctx.stroke();
  }
  for (let y = 0; y <= H; y += 60) {
    ctx.beginPath(); ctx.moveTo(0, y + .5); ctx.lineTo(W, y + .5); ctx.stroke();
  }
  const g = ctx.createRadialGradient(W * .5, H * .32, 80, W * .5, H * .45, H * .78);
  g.addColorStop(0, 'rgba(5, 8, 11, 0)');
  g.addColorStop(1, 'rgba(3, 5, 7, .96)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function label(ctx, text, x, y, color = DIM2, size = 18) {
  ctx.fillStyle = color;
  ctx.font = F(size, '400', true);
  ctx.fillText(text, x, y);
}

export function drawShareCard(state, meta, clock, fmt, netWorth, itemDef) {
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext('2d');

  ctx.fillStyle = '#05070a';
  ctx.fillRect(0, 0, W, H);
  grid(ctx);

  // 顶部品牌
  ctx.fillStyle = ACID;
  ctx.font = F(18, '500', true);
  ctx.fillText('DARKFLOW  //  SIMULATION ONLY', 72, 88);

  ctx.fillStyle = FG;
  ctx.font = F(76, '700');
  ctx.fillText('暗河', 68, 190);
  ctx.fillStyle = DIM;
  ctx.font = F(16, '400', true);
  ctx.fillText('DARKFLOW MARKET · 今日行情', 238, 186);

  const d = clock();
  ctx.textAlign = 'right';
  ctx.fillStyle = DIM;
  ctx.font = F(20, '400', true);
  ctx.fillText(`第 ${String(d.day).padStart(2, '0')} 天  ${String(d.h).padStart(2, '0')}:00`, W - 72, 100);
  ctx.fillStyle = DIM2;
  ctx.font = F(12, '400', true);
  ctx.fillText('OPERATOR / 代号', W - 72, 158);
  ctx.fillStyle = ACID;
  ctx.font = F(22, '500');
  ctx.fillText(`@${state.alias}`, W - 72, 184);
  ctx.textAlign = 'left';

  // 分隔
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(72, 236.5); ctx.lineTo(W - 72, 236.5); ctx.stroke();
  ctx.fillStyle = ACID;
  ctx.fillRect(72, 236, 96, 2);

  // 净资产
  label(ctx, 'NET WORTH / 净资产', 72, 304);
  const worth = Math.round(netWorth());
  const worthText = fmt(worth);
  ctx.fillStyle = ACID;
  ctx.font = F(104, '700', true);
  ctx.fillText(worthText, 68, 412);
  const worthW = ctx.measureText(worthText).width;
  ctx.font = F(24, '400', true);
  ctx.fillText('DKC', 68 + worthW + 20, 408);

  // 四项
  const cells = [
    ['现金 BALANCE', `${fmt(Math.round(state.credits))} DKC`],
    ['声望 REP', `${Math.round(state.rep)} / 100`],
    ['热度 HEAT', `${Math.round(state.heat)} / 100`],
    ['库存 STOCK', `${state.inv.reduce((s, i) => s + i.qty, 0)} 件`],
  ];
  const cellW = (W - 144) / 4;
  cells.forEach(([k, v], i) => {
    const x = 72 + i * cellW;
    ctx.strokeStyle = LINE;
    ctx.strokeRect(x + .5, 468.5, cellW - 12, 92);
    label(ctx, k, x + 18, 500, DIM2, 14);
    ctx.fillStyle = i === 2 && state.heat >= 60 ? RED : FG;
    ctx.font = F(26, '500', true);
    ctx.fillText(clip(ctx, v, cellW - 36, F(26, '500', true)), x + 18, 540);
  });

  // 行情列表
  label(ctx, 'TODAY / 今日涨跌', 72, 630);
  ctx.strokeStyle = LINE;
  ctx.beginPath(); ctx.moveTo(72, 648.5); ctx.lineTo(W - 72, 648.5); ctx.stroke();

  const scored = state.market.map((m) => {
    const ref = m.open || m.price;
    return { m, pct: ((m.price - ref) / ref) * 100 };
  });
  const up = scored.filter((r) => r.pct > 0).sort((a, b) => b.pct - a.pct).slice(0, 3);
  const dn = scored.filter((r) => r.pct < 0).sort((a, b) => a.pct - b.pct).slice(0, 3);
  const rest = scored
    .filter((r) => !up.includes(r) && !dn.includes(r))
    .sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));
  const rows = [...up, ...dn, ...rest].slice(0, 6);

  rows.forEach(({ m, pct }, i) => {
    const y = 690 + i * 62;
    const def = itemDef(m.defId);
    const name = def.name;
    const code = def.code;
    ctx.fillStyle = DIM2;
    ctx.font = F(16, '400', true);
    ctx.fillText(String(i + 1).padStart(2, '0'), 72, y);
    ctx.fillStyle = FG;
    ctx.font = F(22, '500', true);
    ctx.fillText(code, 112, y);
    ctx.fillStyle = DIM;
    ctx.font = F(20, '400');
    ctx.fillText(clip(ctx, name, 420, F(20, '400')), 300, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = FG;
    ctx.font = F(22, '400', true);
    ctx.fillText(fmt(m.price), W - 210, y);
    ctx.fillStyle = pct >= 0 ? ACID : RED;
    ctx.font = F(20, '500', true);
    ctx.fillText(`${pct >= 0 ? '▲' : '▼'} ${Math.abs(pct).toFixed(1)}%`, W - 72, y);
    ctx.textAlign = 'left';
    ctx.strokeStyle = 'rgba(22, 33, 43, .7)';
    ctx.beginPath(); ctx.moveTo(72, y + 20.5); ctx.lineTo(W - 72, y + 20.5); ctx.stroke();
  });

  // 金句
  ctx.fillStyle = DIM2;
  ctx.font = F(20, '400');
  ctx.fillText('“价格是这里唯一诚实的东西。”', 72, 1082);

  // 页脚
  const fy = 1180;
  ctx.strokeStyle = LINE;
  ctx.beginPath(); ctx.moveTo(72, fy - 34.5); ctx.lineTo(W - 72, fy - 34.5); ctx.stroke();
  ctx.fillStyle = ACID;
  ctx.font = F(26, '400', true);
  ctx.fillText(meta.addr, 72, fy);
  ctx.fillStyle = DIM;
  ctx.font = F(17, '400');
  ctx.fillText('虚构模拟 · 无真实交易 · 无真实服务 · 所有代号均为程序生成', 72, fy + 38);
  ctx.fillStyle = DIM2;
  ctx.font = F(15, '400', true);
  ctx.fillText('8-321.github.io/darkflow-sim', 72, fy + 72);

  ctx.textAlign = 'right';
  ctx.fillStyle = DIM2;
  ctx.font = F(15, '400', true);
  ctx.fillText(state.walletAddr ? state.walletAddr.slice(0, 26) : 'NO WALLET', W - 72, fy + 72);
  ctx.textAlign = 'left';

  return cv;
}
