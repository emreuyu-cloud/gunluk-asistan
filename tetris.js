/* Günlük Asistan, gizli "Tetris modu". Ayarlar'daki satıra ilk dokunuşta yüklenir. */
(function () {
  'use strict';
  const COLS = 10, ROWS = 20;
  const SHAPES = {
    I: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    O: [[1, 1], [1, 1]],
    T: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
    S: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
    Z: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
    J: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
    L: [[0, 0, 1], [1, 1, 1], [0, 0, 0]]
  };
  const COLORS = { I: '#32D4F5', O: '#FFD60A', T: '#AF52DE', S: '#34C759', Z: '#FF3B30', J: '#0A84FF', L: '#FF9F0A' };
  const PTS = [0, 100, 300, 500, 800];
  const KICKS = [[0, 0], [-1, 0], [1, 0], [-2, 0], [2, 0], [0, -1]];
  const store = (window.App && App.store) || { get: (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const haptic = () => { try { window.App && App.haptic(); } catch (e) {} };

  const SVG = (d, extra = '') => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" style="width:28px;height:28px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round">${d}${extra}</svg>`;
  const IC = {
    left: SVG('<path d="m15 18-6-6 6-6"/>'), right: SVG('<path d="m9 18 6-6-6-6"/>'),
    rot: SVG('<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>'),
    down: SVG('<path d="m6 9 6 6 6-6"/>'), drop: SVG('<path d="M12 3v13M6 11l6 6 6-6M5 21h14"/>'),
    close: SVG('<path d="M6 6l12 12M18 6 6 18"/>')
  };

  let root, cv, ctx, nv, nctx, wrap, msg, el = {};
  let board, cur, nextK, bag = [], score = 0, lines = 0, level = 1, best = 0;
  let over = false, paused = false, running = false, isOpen = false, raf = 0, lastT = 0, acc = 0, dirty = true;
  let cell = 24, dpr = 1, palette = {};
  let splash, splashing = false, splashT = 0;

  const css = `
  .tt{position:fixed;inset:0;z-index:50;background:var(--bg);color:var(--text);display:none;flex-direction:column;padding:env(safe-area-inset-top) 12px calc(env(safe-area-inset-bottom) + 8px);touch-action:none;-webkit-user-select:none;user-select:none;overscroll-behavior:none;-webkit-touch-callout:none}
  .tt.on{display:flex}
  .tt-top{display:flex;align-items:center;gap:8px;height:54px;flex:none}
  .tt-title{flex:1;display:flex;align-items:center;gap:8px;font:700 20px -apple-system,system-ui;min-width:0}
  .tt-title .nayro-svg{width:36px;height:36px;flex:none}
  .tt-ib{width:40px;height:40px;border-radius:20px;border:0;background:var(--card2);color:var(--text);display:grid;place-items:center;flex:none}
  .tt-ib svg{width:20px!important;height:20px!important}
  .tt-pill{border:0;background:var(--card2);color:var(--accent);font:600 15px -apple-system,system-ui;height:36px;padding:0 14px;border-radius:18px;flex:none}
  .tt-main{flex:1;min-height:0;display:flex;gap:10px;padding-top:4px}
  .tt-board{flex:1;min-width:0;min-height:0;display:flex;align-items:center;justify-content:center}
  .tt-cv{position:relative}
  .tt-cv canvas{display:block;border-radius:10px}
  .tt-side{width:84px;flex:none;display:flex;flex-direction:column;gap:8px}
  .tt-box{background:var(--card);border-radius:12px;padding:8px 6px;text-align:center}
  .tt-box .k{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.3px}
  .tt-box .v{font:700 18px -apple-system,system-ui;font-variant-numeric:tabular-nums;margin-top:2px}
  .tt-box canvas{display:block;margin:6px auto 0}
  .tt-side .tt-pill{width:100%;padding:0 4px;font-size:13px;height:40px;border-radius:12px;margin-top:auto}
  .tt-ctrl{flex:none;display:grid;grid-template-columns:repeat(5,1fr);gap:8px;padding-top:10px}
  .tt-ctrl button{height:66px;border:0;border-radius:18px;background:var(--card);color:var(--text);display:grid;place-items:center;transition:transform .08s}
  .tt-ctrl button:active{transform:scale(.94);background:var(--card2)}
  .tt-ctrl .drop{background:var(--accent);color:#fff}
  .tt-msg{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:rgba(0,0,0,.55);border-radius:10px;color:#fff;text-align:center;padding:16px}
  .tt-msg.on{display:flex}
  .tt-msg h4{margin:0;font:700 24px -apple-system,system-ui}
  .tt-msg p{margin:0;font-size:15px;opacity:.85}
  .tt-msg .nayro-svg{width:64px;height:64px}
  .tt-msg button{border:0;background:#fff;color:#000;font:600 16px -apple-system,system-ui;height:44px;padding:0 22px;border-radius:22px;margin-top:6px}
  html.tt-lock,html.tt-lock body{overflow:hidden}
  .tt-splash{position:absolute;inset:0;z-index:2;background:var(--bg);display:none;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;padding:env(safe-area-inset-top) 24px env(safe-area-inset-bottom)}
  .tt-splash.on{display:flex}
  .tt-splash .nayro-svg{width:96px;height:96px;margin-bottom:10px}
  .tt-splash .who{font:600 26px -apple-system,system-ui;letter-spacing:.2px}
  .tt-splash .sub{font:600 22px -apple-system,system-ui;color:var(--muted)}
  .tt-splash button{margin-top:26px;border:0;background:var(--accent);color:#fff;font:600 17px -apple-system,system-ui;height:48px;padding:0 34px;border-radius:24px}
  .tt-splash.on>*{animation:ttFade 1.8s ease both}
  .tt-splash.on .who{animation-delay:.25s}.tt-splash.on .sub{animation-delay:.6s}.tt-splash.on button{animation-delay:.9s}
  @keyframes ttFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  @media (prefers-reduced-motion:reduce){.tt-splash.on>*{animation:none}}`;

  function build() {
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    const logo = window.App && App.nayroLogo ? App.nayroLogo() : '';
    root = document.createElement('div'); root.className = 'tt'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Tetris modu');
    root.innerHTML = `
      <div class="tt-top"><button class="tt-ib" data-t="close" aria-label="Kapat">${IC.close}</button>
        <div class="tt-title">${logo}<span>Tetris</span></div>
        <button class="tt-pill" data-t="pause">Duraklat</button></div>
      <div class="tt-main">
        <div class="tt-board"><div class="tt-cv"><canvas id="tt-cv" aria-label="Oyun alanı"></canvas>
          <div class="tt-msg"></div></div></div>
        <div class="tt-side">
          <div class="tt-box"><div class="k">Sonraki</div><canvas id="tt-next"></canvas></div>
          <div class="tt-box"><div class="k">Skor</div><div class="v" id="tt-score">0</div></div>
          <div class="tt-box"><div class="k">Satır</div><div class="v" id="tt-lines">0</div></div>
          <div class="tt-box"><div class="k">Seviye</div><div class="v" id="tt-level">1</div></div>
          <div class="tt-box"><div class="k">En iyi</div><div class="v" id="tt-best">0</div></div>
          <button class="tt-pill" data-t="restart">Yeniden başla</button>
        </div>
      </div>
      <div class="tt-ctrl">
        <button data-c="left" aria-label="Sola">${IC.left}</button><button data-c="right" aria-label="Sağa">${IC.right}</button>
        <button data-c="rot" aria-label="Döndür">${IC.rot}</button><button data-c="down" aria-label="Aşağı">${IC.down}</button>
        <button data-c="drop" class="drop" aria-label="Bırak">${IC.drop}</button>
      </div>
      <div class="tt-splash" role="button" aria-label="Oyuna başla">${logo}<div class="who">Nayro ve nayronayt</div><div class="sub">gururla sunar</div><button type="button">Başla</button></div>`;
    document.body.appendChild(root);
    cv = root.querySelector('#tt-cv'); ctx = cv.getContext('2d');
    nv = root.querySelector('#tt-next'); nctx = nv.getContext('2d');
    wrap = root.querySelector('.tt-board'); msg = root.querySelector('.tt-msg');
    splash = root.querySelector('.tt-splash');
    splash.addEventListener('click', e => { e.stopPropagation(); haptic(); endSplash(); });
    ['score', 'lines', 'level', 'best'].forEach(k => el[k] = root.querySelector('#tt-' + k));
    el.pause = root.querySelector('[data-t=pause]');

    root.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
    root.addEventListener('gesturestart', e => e.preventDefault());
    root.addEventListener('contextmenu', e => e.preventDefault());
    root.querySelector('[data-t=close]').onclick = close;
    root.querySelector('[data-t=restart]').onclick = () => { haptic(); newGame(); };
    el.pause.onclick = () => { haptic(); if (over) return; paused ? resume() : pause(); };
    msg.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; haptic(); b.dataset.m === 'resume' ? resume() : newGame(); });

    const act = { left: () => move(-1, 0), right: () => move(1, 0), rot: rotate, down: softDrop, drop: hardDrop };
    root.querySelectorAll('[data-c]').forEach(b => {
      const fn = act[b.dataset.c], rep = b.dataset.c === 'left' || b.dataset.c === 'right' || b.dataset.c === 'down';
      let t1 = 0, t2 = 0;
      const stop = () => { clearTimeout(t1); clearInterval(t2); };
      b.addEventListener('pointerdown', e => {
        e.preventDefault(); if (!playing()) return;
        haptic(); fn(); dirty = true; stop();
        if (rep) t1 = setTimeout(() => { t2 = setInterval(() => { if (playing()) { fn(); dirty = true; } else stop(); }, 55); }, 170);
      });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => b.addEventListener(ev, stop));
    });

    // Oyun alanında kaydırma: sağ/sol kaydır, aşağı sürükle, hızlı aşağı fırlat = bırak, dokun = döndür
    let sx = 0, sy = 0, lx = 0, ly = 0, t0 = 0, moved = false, pid = null;
    cv.addEventListener('pointerdown', e => { if (!playing()) return; pid = e.pointerId; sx = lx = e.clientX; sy = ly = e.clientY; t0 = performance.now(); moved = false; try { cv.setPointerCapture(pid); } catch (er) {} });
    cv.addEventListener('pointermove', e => {
      if (pid !== e.pointerId || !playing()) return;
      const step = Math.max(18, cell * .9);
      while (e.clientX - lx >= step) { move(1, 0); lx += step; moved = true; }
      while (lx - e.clientX >= step) { move(-1, 0); lx -= step; moved = true; }
      while (e.clientY - ly >= step) { softDrop(); ly += step; moved = true; }
      dirty = true;
    });
    cv.addEventListener('pointerup', e => {
      if (pid !== e.pointerId) return; pid = null; if (!playing()) return;
      const dt = performance.now() - t0, dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved && Math.abs(dx) < 10 && Math.abs(dy) < 10 && dt < 300) { haptic(); rotate(); }
      else if (dy > 70 && dt < 250 && Math.abs(dy) > Math.abs(dx) * 1.5) { haptic(); hardDrop(); }
      dirty = true;
    });
    cv.addEventListener('pointercancel', () => { pid = null; });

    document.addEventListener('visibilitychange', () => { if (document.hidden && isOpen) pause(); });
    window.addEventListener('pagehide', () => { if (isOpen) pause(); });
    window.addEventListener('blur', () => { if (isOpen) pause(); });
    window.addEventListener('resize', () => { if (isOpen) layout(); });
  }

  const playing = () => isOpen && running && !paused && !over && !splashing;

  function readPalette() {
    const cs = getComputedStyle(document.documentElement);
    palette = { bg: cs.getPropertyValue('--card').trim() || '#1c1c1e', grid: cs.getPropertyValue('--sep').trim() || 'rgba(128,128,128,.2)', text: cs.getPropertyValue('--text').trim() || '#fff' };
  }
  function layout() {
    readPalette();
    dpr = Math.min(3, window.devicePixelRatio || 1);
    const w = wrap.clientWidth, h = wrap.clientHeight;
    cell = Math.max(10, Math.floor(Math.min(w / COLS, h / ROWS)));
    cv.style.width = cell * COLS + 'px'; cv.style.height = cell * ROWS + 'px';
    cv.width = cell * COLS * dpr; cv.height = cell * ROWS * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const nc = 16; nv.style.width = nv.style.height = nc * 4 + 'px'; nv.width = nv.height = nc * 4 * dpr;
    nctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dirty = true; draw();
  }

  function fromBag() {
    if (!bag.length) { bag = Object.keys(SHAPES); for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; } }
    return bag.pop();
  }
  const rot = m => m[0].map((_, i) => m.map(r => r[i]).reverse());
  function collide(m, x, y) {
    for (let r = 0; r < m.length; r++) for (let c = 0; c < m[r].length; c++) {
      if (!m[r][c]) continue;
      const nx = x + c, ny = y + r;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
    return false;
  }
  function spawn() {
    const k = nextK || fromBag(); nextK = fromBag();
    const m = SHAPES[k].map(r => r.slice());
    cur = { k, m, x: Math.floor((COLS - m[0].length) / 2), y: k === 'I' ? -1 : 0 };
    if (collide(cur.m, cur.x, cur.y)) gameOver();
    dirty = true;
  }
  function move(dx, dy) { if (!cur || collide(cur.m, cur.x + dx, cur.y + dy)) return false; cur.x += dx; cur.y += dy; dirty = true; return true; }
  function rotate() {
    if (!cur || cur.k === 'O') return;
    const m = rot(cur.m);
    for (const [kx, ky] of KICKS) if (!collide(m, cur.x + kx, cur.y + ky)) { cur.m = m; cur.x += kx; cur.y += ky; dirty = true; return; }
  }
  function softDrop() { if (!cur) return; if (move(0, 1)) score += 1; else lock(); acc = 0; updateStats(); }
  function hardDrop() { if (!cur) return; let n = 0; while (move(0, 1)) n++; score += n * 2; lock(); acc = 0; updateStats(); }
  function lock() {
    for (let r = 0; r < cur.m.length; r++) for (let c = 0; c < cur.m[r].length; c++) {
      if (!cur.m[r][c]) continue;
      if (cur.y + r < 0) return gameOver();
      board[cur.y + r][cur.x + c] = cur.k;
    }
    let n = 0;
    for (let r = ROWS - 1; r >= 0; r--) if (board[r].every(Boolean)) { board.splice(r, 1); board.unshift(Array(COLS).fill(null)); n++; r++; }
    if (n) { score += PTS[n] * level; lines += n; level = Math.floor(lines / 10) + 1; haptic(); }
    updateStats(); spawn();
  }
  const speed = () => Math.max(90, 800 * Math.pow(0.85, level - 1));

  function updateStats() {
    if (score > best) { best = score; store.set('tetrisBest', best); }
    el.score.textContent = score; el.lines.textContent = lines; el.level.textContent = level; el.best.textContent = best;
  }
  function showMsg(html) { msg.innerHTML = html; msg.classList.toggle('on', !!html); }

  function newGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    bag = []; nextK = null; score = 0; lines = 0; level = 1; over = false; paused = false;
    best = +store.get('tetrisBest', 0) || 0;
    spawn(); updateStats(); showMsg(''); el.pause.textContent = 'Duraklat';
    start();
  }
  function start() { running = true; lastT = performance.now(); acc = 0; cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); }
  function stopLoop() { running = false; cancelAnimationFrame(raf); }
  function pause() {
    if (over || paused || !board) return;
    paused = true; stopLoop(); el.pause.textContent = 'Devam'; draw();
    showMsg(`<h4>Duraklatıldı</h4><p>Skor ${score}</p><button data-m="resume">Devam</button>`);
  }
  function resume() { if (over) return; paused = false; el.pause.textContent = 'Duraklat'; showMsg(''); start(); }
  function gameOver() {
    over = true; stopLoop(); draw(); updateStats();
    const logo = window.App && App.nayroLogo ? App.nayroLogo() : '';
    showMsg(`${logo}<h4>Oyun bitti</h4><p>Skor ${score} · En iyi ${best}</p><button data-m="restart">Yeniden başla</button>`);
  }

  function loop(t) {
    if (!running) return;
    const dt = Math.min(100, t - lastT); lastT = t; acc += dt;
    if (acc >= speed()) { acc = 0; if (!move(0, 1)) lock(); }
    if (dirty) draw();
    if (running) raf = requestAnimationFrame(loop);
  }

  function block(c, x, y, s, color, alpha = 1) {
    c.globalAlpha = alpha; c.fillStyle = color;
    const p = Math.max(1, s * .06), r = s * .18, w = s - p * 2;
    c.beginPath();
    if (c.roundRect) c.roundRect(x + p, y + p, w, w, r); else c.rect(x + p, y + p, w, w);
    c.fill();
    if (alpha === 1) { c.fillStyle = 'rgba(255,255,255,.22)'; c.fillRect(x + p + r * .6, y + p + s * .1, w - r * 1.2, s * .14); }
    c.globalAlpha = 1;
  }
  function draw() {
    if (!ctx || !board) return;
    dirty = false;
    const W = cell * COLS, H = cell * ROWS;
    ctx.fillStyle = palette.bg; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = palette.grid; ctx.lineWidth = 0.5; ctx.beginPath();
    for (let c = 1; c < COLS; c++) { ctx.moveTo(c * cell, 0); ctx.lineTo(c * cell, H); }
    for (let r = 1; r < ROWS; r++) { ctx.moveTo(0, r * cell); ctx.lineTo(W, r * cell); }
    ctx.stroke();
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (board[r][c]) block(ctx, c * cell, r * cell, cell, COLORS[board[r][c]]);
    if (cur && !over) {
      let gy = cur.y; while (!collide(cur.m, cur.x, gy + 1)) gy++;
      for (let r = 0; r < cur.m.length; r++) for (let c = 0; c < cur.m[r].length; c++) if (cur.m[r][c]) {
        if (gy + r >= 0) block(ctx, (cur.x + c) * cell, (gy + r) * cell, cell, COLORS[cur.k], .22);
        if (cur.y + r >= 0) block(ctx, (cur.x + c) * cell, (cur.y + r) * cell, cell, COLORS[cur.k]);
      }
    }
    // sonraki parça
    const ns = 16; nctx.clearRect(0, 0, ns * 4, ns * 4);
    if (nextK) {
      const m = SHAPES[nextK], rows = m.filter(r => r.some(Boolean)), cols = m[0].length;
      const minC = Math.min(...m.map(r => r.indexOf(1)).filter(i => i >= 0)), maxC = Math.max(...m.map(r => r.lastIndexOf(1)));
      const w = maxC - minC + 1, ox = (4 - w) / 2 * ns, oy = (4 - rows.length) / 2 * ns;
      rows.forEach((r, ri) => { for (let c = 0; c < cols; c++) if (r[c]) block(nctx, ox + (c - minC) * ns, oy + ri * ns, ns, COLORS[nextK]); });
    }
  }

  function open() {
    if (!root) build();
    root.classList.add('on'); isOpen = true;
    document.documentElement.classList.add('tt-lock');
    // Açılış ekranı: "Nayro ve nayronayt gururla sunar"; bitene kadar oyun (yerçekimi) çalışmaz
    splashing = true; clearTimeout(splashT);
    splash.classList.remove('on'); void splash.offsetWidth; splash.classList.add('on');
    splashT = setTimeout(endSplash, 2500);
    requestAnimationFrame(() => { layout(); });
  }
  function endSplash() {
    if (!splashing) return;
    splashing = false; clearTimeout(splashT);
    splash.classList.remove('on');
    if (!isOpen) return;
    layout();
    if (!board || over) newGame();
    else if (paused) draw();
    else start();
  }
  function close() {
    haptic();
    if (board && !over && !paused && !splashing) pause();
    splashing = false; clearTimeout(splashT); splash.classList.remove('on');
    stopLoop(); isOpen = false;
    root.classList.remove('on');
    document.documentElement.classList.remove('tt-lock');
  }

  window.Tetris = { open, close, isOpen: () => isOpen };
})();
