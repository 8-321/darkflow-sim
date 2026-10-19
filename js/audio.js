// DARKFLOW // 程序化音效（WebAudio，无任何外部素材）
let ctx = null;
let master = null;
let enabled = true;
let noiseBuf = null;

export function initAudio() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.16;
    master.connect(ctx.destination);
    const len = ctx.sampleRate * 0.5;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  } catch (e) { ctx = null; }
}

export function setSound(on) {
  enabled = on;
  if (master) master.gain.value = on ? 0.16 : 0;
}

const tone = (freq, dur, type = 'square', vol = 0.5, slide = 0) => {
  if (!ctx || !enabled) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, ctx.currentTime);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), ctx.currentTime + dur);
  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  o.connect(g); g.connect(master);
  o.start(); o.stop(ctx.currentTime + dur + 0.02);
};

const noise = (dur, vol = 0.2, hp = 800) => {
  if (!ctx || !enabled || !noiseBuf) return;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = 'highpass'; f.frequency.value = hp;
  const g = ctx.createGain();
  g.gain.value = vol;
  src.connect(f); f.connect(g); g.connect(master);
  src.start(); src.stop(ctx.currentTime + dur);
};

export function sfx(name) {
  if (!ctx || !enabled) return;
  switch (name) {
    case 'click': tone(880, 0.035, 'square', 0.25); break;
    case 'hover': tone(1320, 0.018, 'sine', 0.06); break;
    case 'type': noise(0.02, 0.12, 2200); tone(240 + Math.random() * 160, 0.012, 'square', 0.06); break;
    case 'open': tone(320, 0.08, 'sawtooth', 0.18, 180); break;
    case 'close': tone(420, 0.07, 'sawtooth', 0.14, -220); break;
    case 'coin': tone(1180, 0.06, 'square', 0.24); setTimeout(() => tone(1560, 0.09, 'square', 0.2), 55); break;
    case 'buy': [560, 720, 980].forEach((f, i) => setTimeout(() => tone(f, 0.08, 'triangle', 0.25), i * 70)); break;
    case 'seal': noise(0.12, 0.25, 300); tone(180, 0.12, 'square', 0.3); break;
    case 'error': tone(180, 0.16, 'sawtooth', 0.3, -60); break;
    case 'alarm': [0, 180, 360].forEach((d) => setTimeout(() => { tone(880, 0.09, 'sawtooth', 0.28); tone(660, 0.09, 'sawtooth', 0.2); }, d)); break;
    case 'win': [660, 880, 1180, 1480].forEach((f, i) => setTimeout(() => tone(f, 0.1, 'triangle', 0.22), i * 90)); break;
    case 'heart': tone(58, 0.14, 'sine', 0.55); setTimeout(() => tone(46, 0.18, 'sine', 0.35), 150); break;
    case 'bid': tone(660, 0.05, 'square', 0.22); setTimeout(() => tone(990, 0.06, 'square', 0.18), 60); break;
    case 'boot': tone(110, 0.4, 'sine', 0.25, 220); break;
    case 'glitch': noise(0.09, 0.18, 500); break;
  }
}
