import { bootApp } from './ui.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootApp);
} else {
  bootApp();
}

// 暴露给自动化验收
window.addEventListener('error', (e) => {
  const t = document.getElementById('toasts');
  if (!t) return;
  const n = document.createElement('div');
  n.className = 'toast bad in';
  n.innerHTML = `<div class="t-ico">✕</div><div class="t-body"><div class="t-title">运行时错误</div><div class="t-text">${String(e.message || e).slice(0, 120)}</div></div>`;
  t.appendChild(n);
  setTimeout(() => n.remove(), 8000);
});
