// DARKFLOW // 小游戏：密码破解 / 数据清洗 / 拍卖压哨
import { CRACK_WORDS } from './data.js';

const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};
const rnd = (a, b) => a + Math.random() * (b - a);

// ── 1. 密码破解（Fallout 风格）────────────────────────────
export function crackGame(root, onDone) {
  const pool = [...CRACK_WORDS].sort(() => Math.random() - 0.5).slice(0, 12);
  const target = pool[Math.floor(Math.random() * pool.length)];
  let tries = 4;
  let locked = false;

  root.innerHTML = `
    <div class="mg-head">
      <div class="mg-title">ROOT ACCESS // 密码破解</div>
      <div class="mg-sub">从 12 个候选串中找出唯一正确的那一个。每次尝试会返回「相同位置字符数」。剩余尝试 <b class="mg-tries">4</b>。</div>
    </div>
    <div class="crack-wrap">
      <div class="crack-words"></div>
      <div class="crack-log"><div class="crack-line dim">&gt; 连接目标 10.0.0.${Math.floor(rnd(2, 250))} … 握手完成</div></div>
    </div>
    <div class="mg-foot"><button class="btn ghost" data-close>断开连接 (Esc)</button><span class="mg-hint">大写 = 正确字符，位置也算。</span></div>`;

  const wordsBox = root.querySelector('.crack-words');
  const log = root.querySelector('.crack-log');
  const triesEl = root.querySelector('.mg-tries');

  const line = (txt, cls = '') => {
    const d = el('div', 'crack-line ' + cls, txt);
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
  };

  pool.forEach((w, i) => {
    const b = el('button', 'crack-word', `<span class="idx">${String(i + 1).padStart(2, '0')}</span>${w}`);
    b.onclick = () => {
      if (locked) return;
      if (w === target) {
        locked = true;
        b.classList.add('ok');
        line(`&gt; ${w} … ACCESS GRANTED`, 'ok');
        setTimeout(() => onDone(true), 700);
        return;
      }
      let same = 0;
      for (let k = 0; k < w.length; k++) if (w[k] === target[k]) same++;
      tries--;
      triesEl.textContent = tries;
      b.classList.add('bad');
      b.disabled = true;
      line(`&gt; ${w} … 匹配 ${same}/${target.length} · 拒绝`, 'bad');
      if (tries <= 0) {
        locked = true;
        line('&gt; 尝试次数耗尽 · 目标已锁定 · 追踪启动', 'bad');
        setTimeout(() => onDone(false), 900);
      }
    };
    wordsBox.appendChild(b);
  });

  const esc = (e) => { if (e.key === 'Escape') { cleanup(); onDone(false); } };
  const cleanup = () => { document.removeEventListener('keydown', esc); };
  document.addEventListener('keydown', esc);
  root.querySelector('[data-close]').onclick = () => { cleanup(); onDone(false); };
  return cleanup;
}

// ── 2. 数据清洗（Simon 序列）──────────────────────────────
export function cleanGame(root, onDone) {
  const size = 9;
  const rounds = 5;
  let seq = [];
  let idx = 0;
  let playing = true;
  let round = 0;

  root.innerHTML = `
    <div class="mg-head">
      <div class="mg-title">WASH // 数据清洗</div>
      <div class="mg-sub">按顺序复现闪过的节点，共 5 轮。错一次即污染。序列长度 <b class="mg-len">1</b>。</div>
    </div>
    <div class="clean-wrap">
      <div class="clean-grid">${Array.from({ length: size }, (_, i) => `<button class="clean-cell" data-i="${i}"><span>${i + 1}</span></button>`).join('')}</div>
      <div class="clean-side">
        <div class="clean-status">准备…</div>
        <div class="clean-meter"><i style="width:0%"></i></div>
        <div class="clean-note dim">污染的数据会跟着你的名字走。</div>
      </div>
    </div>
    <div class="mg-foot"><button class="btn ghost" data-close>中止 (Esc)</button><span class="mg-hint">观察 → 复现。不要急。</span></div>`;

  const cells = [...root.querySelectorAll('.clean-cell')];
  const status = root.querySelector('.clean-status');
  const meter = root.querySelector('.clean-meter i');
  const lenEl = root.querySelector('.mg-len');
  let timers = [];

  const flash = (i, ms = 380) => new Promise((res) => {
    cells[i].classList.add('lit');
    timers.push(setTimeout(() => { cells[i].classList.remove('lit'); setTimeout(res, 110); }, ms));
  });

  async function play() {
    playing = false;
    status.textContent = `第 ${round} / ${rounds} 轮 · 观察`;
    for (const i of seq) { await flash(i, Math.max(180, 420 - round * 40)); }
    playing = true;
    idx = 0;
    status.textContent = `第 ${round} / ${rounds} 轮 · 复现`;
  }

  function nextRound() {
    round++;
    lenEl.textContent = round;
    seq.push(Math.floor(Math.random() * size));
    meter.style.width = `${(round / rounds) * 100}%`;
    play();
  }

  function click(i) {
    if (!playing) return;
    cells[i].classList.add('press');
    setTimeout(() => cells[i].classList.remove('press'), 120);
    if (seq[idx] === i) {
      idx++;
      if (idx >= seq.length) {
        playing = false;
        if (round >= rounds) {
          status.textContent = '清洗完成 · 数据已脱敏';
          meter.style.width = '100%';
          setTimeout(() => onDone(true), 800);
        } else {
          status.textContent = '通过 · 载入下一段';
          setTimeout(nextRound, 700);
        }
      }
    } else {
      playing = false;
      status.textContent = '污染 · 数据链断裂';
      root.querySelector('.clean-grid').classList.add('broke');
      setTimeout(() => onDone(false), 900);
    }
  }

  cells.forEach((c) => { c.onclick = () => click(+c.dataset.i); });

  const esc = (e) => { if (e.key === 'Escape') { cleanup(); onDone(false); } };
  const cleanup = () => { timers.forEach(clearTimeout); document.removeEventListener('keydown', esc); };
  document.addEventListener('keydown', esc);
  root.querySelector('[data-close]').onclick = () => { cleanup(); onDone(false); };
  setTimeout(nextRound, 600);
  return cleanup;
}

// ── 3. 拍卖压哨（时机条）─────────────────────────────────
export function snipeGame(root, onDone) {
  root.innerHTML = `
    <div class="mg-head">
      <div class="mg-title">SNIPE // 压哨加价</div>
      <div class="mg-sub">指针进入绿色区间时按下。命中 = 原价；偏出 = 溢价 8%；完全脱靶 = 失去资格。</div>
    </div>
    <div class="snipe-wrap">
      <div class="snipe-track">
        <div class="snipe-zone"></div>
        <div class="snipe-needle"></div>
      </div>
      <div class="snipe-ticks">${Array.from({ length: 21 }, () => '<i></i>').join('')}</div>
      <button class="btn primary big snipe-btn">按 空格 / 点击 锁定</button>
    </div>
    <div class="mg-foot"><button class="btn ghost" data-close>放弃 (Esc)</button><span class="mg-hint">越晚下注，越接近胜利，也越接近失误。</span></div>`;

  const needle = root.querySelector('.snipe-needle');
  const zone = root.querySelector('.snipe-zone');
  const zoneStart = rnd(0.62, 0.8);
  const zoneW = 0.085;
  zone.style.left = `${zoneStart * 100}%`;
  zone.style.width = `${zoneW * 100}%`;

  let pos = 0;
  let dir = 1;
  let done = false;
  let raf;
  const t0 = performance.now();

  const loop = (t) => {
    if (done) return;
    const dt = (t - t0) / 1000;
    pos = (Math.sin(dt * 2.4) * 0.5 + 0.5);
    needle.style.left = `${pos * 100}%`;
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  const fire = () => {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    needle.classList.add('frozen');
    let result = 'miss';
    if (pos >= zoneStart && pos <= zoneStart + zoneW) result = 'hit';
    else if (pos >= zoneStart - 0.12 && pos <= zoneStart + zoneW + 0.12) result = 'ok';
    root.querySelector('.snipe-track').classList.add('res-' + result);
    setTimeout(() => onDone(result), 800);
  };

  const key = (e) => { if (e.code === 'Space') { e.preventDefault(); fire(); } if (e.key === 'Escape') { done = true; cancelAnimationFrame(raf); onDone('abort'); } };
  document.addEventListener('keydown', key);
  root.querySelector('.snipe-btn').onclick = fire;
  root.querySelector('[data-close]').onclick = () => { done = true; cancelAnimationFrame(raf); document.removeEventListener('keydown', key); onDone('abort'); };
  return () => { cancelAnimationFrame(raf); document.removeEventListener('keydown', key); };
}
