/* Günlük Asistan 4.0, iskelet + Bugün + Vardiya + Mola + Ayarlar */
(function () {
  'use strict';
  const TYPES = ['Sabah', 'Akşam', 'Gece', 'İzin'];
  const WD = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const WD_LONG = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const ICON = {
    Sabah: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    Akşam: '<svg viewBox="0 0 24 24"><path d="M17 18a5 5 0 0 0-10 0M12 2v7M4.2 10.2l1.4 1.4M1 18h2M21 18h2M18.4 11.6l1.4-1.4M23 22H1M8 6l4 4 4-4"/></svg>',
    Gece: '<svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    İzin: '<svg viewBox="0 0 24 24"><path d="M2 21h20M7 21V11M7 11c-3 0-4-3-4-3s3-3 6 0M7 11c3 0 4-3 4-3s-3-3-6 0M7 11c0-3 2-6 2-6"/></svg>',
    yok: '<svg viewBox="0 0 24 24"><rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/></svg>',
    left: '<svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>',
    right: '<svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M7 4v16l13-8z" fill="currentColor"/></svg>',
    stop: '<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/></svg>',
    repeat: '<svg viewBox="0 0 24 24"><path d="m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3"/></svg>',
    clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    coffee: '<svg viewBox="0 0 24 24"><path d="M4 9h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15"/></svg>',
    up: '<svg viewBox="0 0 24 24"><path d="M12 21V9M7 14l5-5 5 5M4 3h16"/></svg>',
    user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.2"/><path d="M5 19.5c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5"/></svg>',
    share: '<svg viewBox="0 0 24 24"><path d="M12 3v12M8 7l4-4 4 4M5 11v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9"/></svg>',
    car: '<svg viewBox="0 0 24 24"><path d="M5 17h14M3 17v-4l2-5a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 5v4h-2M5 17H3"/><circle cx="7.5" cy="17" r="2"/><circle cx="16.5" cy="17" r="2"/></svg>',
    cal: '<svg viewBox="0 0 24 24"><rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4M12 13v5M9.5 15.5h5"/></svg>',
    bell: '<svg viewBox="0 0 24 24"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0"/></svg>'
  };
  for (const k in ICON) ICON[k] = ICON[k].replace('<svg ', '<svg aria-hidden="true" focusable="false" ');

  // Nayro'nun yüzü: kırmızı, sevimli bir damla (Tetris modu logosu)
  let logoN = 0;
  function nayroLogo() {
    const id = 'nyg' + (++logoN);
    return `<svg class="nayro-svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <defs><radialGradient id="${id}" cx="38%" cy="30%" r="75%"><stop offset="0" stop-color="#FF7A6E"/><stop offset=".55" stop-color="#FF3B30"/><stop offset="1" stop-color="#C9241B"/></radialGradient></defs>
      <path stroke="none" fill="url(#${id})" d="M33 4c9.5 0 16 3.5 21 10s7.5 12.5 6.5 20.5-4.5 15-10.5 19-12.5 6-19 5-13.5-3.5-17.5-8.5S5 38.5 5.5 31.5 9 17 14 12 23.5 4 33 4z"/>
      <ellipse stroke="none" fill="#fff" cx="24" cy="28" rx="5.6" ry="7"/><ellipse stroke="none" fill="#fff" cx="41" cy="28" rx="5.6" ry="7"/>
      <circle stroke="none" fill="#1c1c1e" cx="25.2" cy="29.6" r="3"/><circle stroke="none" fill="#1c1c1e" cx="42.2" cy="29.6" r="3"/>
      <circle stroke="none" fill="#fff" cx="26.3" cy="28.2" r="1"/><circle stroke="none" fill="#fff" cx="43.3" cy="28.2" r="1"/>
      <ellipse stroke="none" fill="#FF9AA2" opacity=".55" cx="17.5" cy="38.5" rx="3.6" ry="2.2"/><ellipse stroke="none" fill="#FF9AA2" opacity=".55" cx="47.5" cy="38.5" rx="3.6" ry="2.2"/>
      <path fill="none" stroke="#1c1c1e" stroke-width="2.6" stroke-linecap="round" d="M27 40.5q5.5 5 11 0"/>
    </svg>`;
  }

  // ---------- yardımcılar ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { toast('Kaydedilemedi'); return false; } }
  };
  let appearance = store.get('appearance', 'system');
  if (!['system', 'light', 'dark'].includes(appearance)) appearance = 'system';
  function applyAppearance() {
    if (appearance === 'system') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = appearance;
    const dark = appearance === 'dark' || (appearance === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.querySelectorAll('meta[name="theme-color"]').forEach(el => {
      el.content = dark ? '#101722' : '#f3f5f9';
    });
  }
  function pageHeader(title, subtitle) {
    return `<header class="page-header"><p class="eyebrow">Günlük Asistan</p><h1 class="large-title">${title}</h1><p class="subtitle">${subtitle}</p></header>`;
  }
  const $ = (s, r = document) => r.querySelector(s);
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const hm = t => { const d = new Date(t); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  const mmss = ms => { const s = Math.max(0, Math.floor(ms / 1000)); const h = Math.floor(s / 3600); return (h ? h + ':' + pad(Math.floor(s / 60) % 60) : pad(Math.floor(s / 60))) + ':' + pad(s % 60); };
  const dur = min => { min = Math.round(min); const h = Math.floor(min / 60), m = min % 60; return h ? (m ? h + ' sa ' + m + ' dk' : h + ' sa') : m + ' dk'; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const longDate = d => d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + WD_LONG[d.getDay()];
  // "05:45'te", "06:30'da" gibi Türkçe bulunma eki
  function atTime(t) {
    const [h, m] = t.split(':').map(Number), n = m ? m : (h || 12);
    const U = ['', 'de', 'de', 'te', 'te', 'te', 'da', 'de', 'de', 'da'], T = ['', 'da', 'de', 'da', 'ta', 'de'];
    return t + "'" + (n % 10 ? U[n % 10] : T[Math.floor(n / 10)]);
  }
  const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
  const sheetOpen = () => $('#sheet').classList.contains('on');
  function dayLabel(d, now = new Date()) {
    const diff = Math.round((parse(ymd(d)) - parse(ymd(now))) / 864e5);
    return diff === 0 ? 'Bugün' : diff === 1 ? 'Yarın' : longDate(d);
  }
  // "HH:MM" saatini, verilen ana en yakın güne yerleştirir (gece yarısını aşan molalar için)
  function resolveTime(str, anchor) {
    const [h, m] = str.split(':').map(Number), a = new Date(anchor); let best = null;
    for (const off of [-1, 0, 1]) { const t = new Date(a.getFullYear(), a.getMonth(), a.getDate() + off, h, m).getTime(); if (best == null || Math.abs(t - anchor) < Math.abs(best - anchor)) best = t; }
    return best;
  }

  function toast(t, opt) {
    const el = $('#toast');
    el.innerHTML = '<span>' + esc(t) + '</span>' + (opt && opt.action ? '<button type="button">' + esc(opt.action) + '</button>' : '');
    el.classList.toggle('act', !!(opt && opt.action));
    if (opt && opt.action) el.querySelector('button').onclick = ev => { ev.stopPropagation(); el.classList.remove('on', 'act'); clearTimeout(toast._t); opt.fn(); };
    el.classList.add('on'); clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove('on', 'act'), opt && opt.action ? 5000 : 1800);
  }
  function haptic() { try { navigator.vibrate && navigator.vibrate(10); } catch (e) {} }
  let sheetReturnFocus = null;
  function openSheet(html, onMount) {
    const s = $('#sheet');
    if (!sheetOpen()) sheetReturnFocus = document.activeElement;
    s.style.transform = ''; $('#sheet-body').innerHTML = html;
    const title = $('#sheet-body h3');
    if (title) { title.id = 'sheet-title'; s.setAttribute('aria-labelledby', title.id); }
    else s.removeAttribute('aria-labelledby');
    s.inert = false; s.classList.add('on'); $('#sheet-backdrop').classList.add('on'); s.scrollTop = 0;
    $('#screens').inert = true; $('#tabbar').inert = true;
    onMount && onMount($('#sheet-body'));
    $('.sheet-close').focus({ preventScroll: true });
  }
  function closeSheet() {
    const s = $('#sheet'); s.style.transform = ''; s.classList.remove('on', 'drag'); s.inert = true;
    $('#sheet-backdrop').classList.remove('on'); $('#screens').inert = false; $('#tabbar').inert = false;
    const target = sheetReturnFocus && sheetReturnFocus.isConnected ? sheetReturnFocus : $('#tabbar button.active');
    target && target.focus({ preventScroll: true });
  }
  // iOS tarzı onay (eylem) sayfası; tarayıcı onay kutusu yerine
  function confirmSheet(title, msg, okLabel, onOk, danger = true) {
    openSheet(`<h3>${esc(title)}</h3><div class="section-foot" style="margin:0 8px 18px;text-align:center">${esc(msg)}</div>
      <div class="stack"><button class="btn ${danger ? 'danger' : ''}" data-ok>${esc(okLabel)}</button><button class="btn secondary" data-no>Vazgeç</button></div>`, root => {
      root.querySelector('[data-ok]').onclick = () => { haptic(); closeSheet(); onOk(); };
      root.querySelector('[data-no]').onclick = closeSheet;
    });
  }

  // ---------- veri ----------
  const DEF = { times: { Sabah: ['06:30', '14:30'], Akşam: ['14:30', '22:30'], Gece: ['22:30', '06:30'] }, breakMin: 60, commuteMin: 45, rotation: { seq: ['Sabah','Sabah','Akşam','Akşam','Gece','Gece','İzin','İzin'], start: '2026-09-01' } };
  const ALARM_LEAD = 2 * 3600000;
  function normalizeSettings(raw) {
    const S = Object.assign({}, DEF, raw || {});
    S.times = Object.assign({}, DEF.times, S.times || {});
    let fixed = false;
    for (const k in DEF.times) {
      const v = S.times[k];
      if (!Array.isArray(v) || v.length !== 2 || !TIME_RE.test(v[0]) || !TIME_RE.test(v[1]) || v[0] === v[1]) { S.times[k] = DEF.times[k].slice(); fixed = true; }
      else S.times[k] = v.slice();
    }
    if (!(S.breakMin >= 5 && S.breakMin <= 240)) S.breakMin = DEF.breakMin;
    if (!(S.commuteMin >= 0 && S.commuteMin <= 180)) S.commuteMin = DEF.commuteMin;
    if (!S.v || S.v < 2) {
      const OLD = { Sabah: ['08:00', '16:00'], Akşam: ['16:00', '00:00'], Gece: ['00:00', '08:00'] };
      for (const k in OLD) if (S.times[k] && S.times[k][0] === OLD[k][0] && S.times[k][1] === OLD[k][1]) S.times[k] = DEF.times[k].slice();
      if (!S.rotation) S.rotation = DEF.rotation;
      S.v = 2; fixed = true;
    }
    return { S, fixed };
  }
  const norm0 = normalizeSettings(store.get('settings', {}));
  let S = norm0.S;
  if (norm0.fixed) store.set('settings', S);
  let overrides = store.get('overrides', {});
  if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides)) overrides = {};
  let breaks = store.get('breaks', []);
  if (!Array.isArray(breaks)) breaks = [];
  breaks = breaks.filter(x => x && typeof x.b === 'number' && typeof x.s === 'number' && x.s > x.b);
  let active = store.get('activeBreak', null);
  if (typeof active !== 'number') active = null;
  let alarm = store.get('alarm', null);
  if (!alarm || typeof alarm !== 'object' || Array.isArray(alarm)) alarm = { on: false, lastFired: 0 };
  alarm.on = !!alarm.on;
  if (typeof alarm.lastFired !== 'number') alarm.lastFired = 0;
  let syncAt = store.get('syncAt', 0);
  if (typeof syncAt !== 'number' || !isFinite(syncAt)) syncAt = 0;
  let applyingRemote = false;
  let accountStatusText = 'Giriş yap, verilerini eşitle';
  try { const gu = store.get('gaUser', null); if (gu && gu.email) accountStatusText = gu.email; } catch (e) {}
  function touchSync() {
    if (applyingRemote) return;
    syncAt = Date.now();
    store.set('syncAt', syncAt);
    store.set('alarm', alarm);
    if (window.GAAccount && GAAccount.push) GAAccount.push();
  }
  const save = () => {
    store.set('settings', S); store.set('overrides', overrides); store.set('breaks', breaks); store.set('activeBreak', active); store.set('alarm', alarm);
    touchSync();
    scheduleAlarm();
    window.dispatchEvent(new Event('ga:breakchange'));
  };

  function shiftType(dateStr) {
    if (overrides[dateStr]) return overrides[dateStr];
    const r = S.rotation;
    if (r && r.seq && r.seq.length && r.start) {
      const diff = Math.round((parse(dateStr) - parse(r.start)) / 864e5);
      const n = r.seq.length;
      return r.seq[((diff % n) + n) % n];
    }
    return null;
  }
  function shiftSpan(dateStr) {
    const type = shiftType(dateStr);
    if (!type || type === 'İzin' || !S.times[type]) return { type };
    const [b, e] = S.times[type];
    const d = parse(dateStr);
    const [bh, bm] = b.split(':').map(Number), [eh, em] = e.split(':').map(Number);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), bh, bm);
    let end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), eh, em);
    if (end <= start) end = addDays(end, 1);
    return { type, start, end, b, e, min: (end - start) / 6e4 };
  }
  function currentShift(now = new Date()) {
    for (const off of [-1, 0]) { const sp = shiftSpan(ymd(addDays(now, off))); if (sp.start && now >= sp.start && now < sp.end) return sp; }
    return null;
  }
  function nextShift(now = new Date()) {
    for (let i = 0; i < 60; i++) { const sp = shiftSpan(ymd(addDays(now, i))); if (sp.start && sp.start > now) return sp; }
    return null;
  }
  function alarmInfo(sp) {
    if (!sp || !sp.start) return null;
    return { at: new Date(sp.start.getTime() - ALARM_LEAD), type: sp.type, b: sp.b, e: sp.e, start: sp.start, end: sp.end, day: ymd(sp.start) };
  }
  function alarmsAround(now, from, to) {
    const out = [];
    for (let i = from; i < to; i++) { const a = alarmInfo(shiftSpan(ymd(addDays(now, i)))); if (a) out.push(a); }
    return out;
  }
  // Sonraki alarm, vardiya başlangıcından tam 2 saat önce. İzin günlerinde alarm yok.
  function nextAlarm(now = new Date()) {
    const t = now.getTime();
    for (const a of alarmsAround(now, -1, 70)) if (a.at.getTime() > t) return a;
    return null;
  }
  // Kaçırılan alarm yalnızca vardiya henüz başlamadıysa geçerlidir.
  function dueAlarm(now = new Date()) {
    const t = now.getTime();
    let best = null;
    for (const a of alarmsAround(now, -1, 3)) {
      const at = a.at.getTime();
      if (at <= t && at > (alarm.lastFired || 0) && t < a.start.getTime() && (!best || at < best.at.getTime())) best = a;
    }
    return best;
  }
  let alarmTimer = null;
  function postAlarm(msg) {
    if (!('serviceWorker' in navigator)) return;
    const send = reg => { if (reg && reg.active) reg.active.postMessage(msg); };
    if (navigator.serviceWorker.controller) send(navigator.serviceWorker.controller && { active: navigator.serviceWorker.controller });
    navigator.serviceWorker.ready.then(send).catch(() => {});
  }
  function unlockAudio() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!unlockAudio.ctx) unlockAudio.ctx = new AC();
      if (unlockAudio.ctx.state === 'suspended') unlockAudio.ctx.resume().catch(() => {});
    } catch (e) {}
  }
  function beep() {
    try {
      const ctx = unlockAudio.ctx;
      if (!ctx) return;
      const tone = (freq, t0, dur) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = freq; o.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.18, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        o.start(t0); o.stop(t0 + dur + 0.02);
      };
      const play = () => { const t = ctx.currentTime; tone(880, t, 0.28); tone(1175, t + 0.34, 0.32); };
      if (ctx.state === 'suspended') ctx.resume().then(play).catch(() => {});
      else play();
    } catch (e) {}
  }
  function notifyAlarm(info) {
    const title = 'Vardiya alarmı';
    const body = info.type + ' vardiyası ' + atTime(info.b) + ' başlıyor';
    const opts = { body, tag: 'ga-alarm-' + info.at.getTime(), renotify: true };
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const show = reg => reg.showNotification(title, opts).catch(() => { try { new Notification(title, { body, tag: opts.tag }); } catch (e) {} });
    if (navigator.serviceWorker && navigator.serviceWorker.ready) navigator.serviceWorker.ready.then(show).catch(() => show({ showNotification: (t, o) => Promise.resolve(new Notification(t, o)) }));
    else { try { new Notification(title, { body, tag: opts.tag }); } catch (e) {} }
  }
  function fireAlarm(info) {
    if (!alarm.on || !info) return null;
    if ((alarm.lastFired || 0) >= info.at.getTime()) return null;
    alarm.lastFired = info.at.getTime();
    store.set('alarm', alarm);
    beep();
    notifyAlarm(info);
    touchSync();
    if (typeof window.__gaOnAlarm === 'function') { try { window.__gaOnAlarm(info); } catch (e) {} }
    scheduleAlarm();
    if (!sheetOpen()) renderBugun();
    return info;
  }
  function scheduleAlarm() {
    clearTimeout(alarmTimer); alarmTimer = null;
    if (!alarm.on) { postAlarm({ type: 'alarm-cancel' }); return; }
    const now = new Date();
    const due = dueAlarm(now);
    if (due) { fireAlarm(due); return; }
    const nx = nextAlarm(now);
    if (!nx) return;
    const delta = nx.at.getTime() - now.getTime();
    const wait = delta > 3600000 ? 3600000 : Math.max(0, delta);
    alarmTimer = setTimeout(() => { if (alarm.on) scheduleAlarm(); }, wait);
    postAlarm({ type: 'alarm-schedule', at: nx.at.getTime(), title: 'Vardiya alarmı', body: nx.type + ' vardiyası ' + atTime(nx.b) + ' başlıyor' });
  }
  function setAlarmOn(on, skipPast) {
    alarm.on = !!on;
    if (on && skipPast) alarm.lastFired = Date.now();
    store.set('alarm', alarm);
    touchSync();
    scheduleAlarm();
  }
  async function toggleAlarm() {
    haptic();
    if (alarm.on) { setAlarmOn(false); renderAll(); return toast('Uygulama uyarısı kapalı. Telefon alarmı Saat uygulamasından kapatılır.'); }
    unlockAudio();
    let perm = typeof Notification === 'undefined' ? 'unsupported' : Notification.permission;
    if (perm === 'default') {
      try { perm = await Notification.requestPermission(); } catch (e) { perm = Notification.permission; }
    }
    setAlarmOn(true, true);
    renderAll();
    if (perm === 'granted') toast('Uygulama içi uyarı açık');
    else if (perm === 'denied') toast('Bildirim izni yok. Uygulama açıkken ses çalar.');
    else toast('Uygulama içi uyarı açık. Bildirim desteği kısıtlı olabilir.');
  }
  // Mola hangi güne sayılır: vardiya içindeyse vardiyanın başladığı gün (gece vardiyası gece yarısında bölünmez)
  function shiftDay(ts) {
    const d = new Date(ts), cur = currentShift(d);
    return cur ? ymd(cur.start) : ymd(d);
  }
  const todayKey = () => shiftDay(Date.now());
  function breakTotal(key) {
    let t = breaks.filter(x => shiftDay(x.b) === key).reduce((s, x) => s + (x.s - x.b), 0);
    if (active && shiftDay(active) === key) t += Date.now() - active;
    return t;
  }
  const pruneBreaks = () => { breaks = breaks.filter(x => x.b > Date.now() - 365 * 864e5); };
  let lastToggle = 0;
  function toggleBreak() {
    const now = Date.now();
    if (now - lastToggle < 800) return; // çift dokunmayı yok say
    lastToggle = now;
    haptic();
    const prev = { breaks: breaks.slice(), active };
    const undo = { action: 'Geri al', fn: () => { breaks = prev.breaks; active = prev.active; save(); renderAll(); haptic(); } };
    if (active) {
      if (now - active < 5000) { active = null; save(); renderAll(); return toast('Mola çok kısaydı, kaydedilmedi'); }
      breaks.push({ b: active, s: now }); active = null; toast('Mola bitti', undo);
    } else { active = now; toast('Mola başladı', undo); }
    pruneBreaks(); save(); renderAll();
  }

  // ---------- BUGÜN ----------
  function upcomingHtml(now) {
    const nx = nextShift(now), today = ymd(now);
    let rows = '';
    if (nx) {
      const leave = new Date(nx.start - S.commuteMin * 6e4);
      const leaveNow = now >= leave && now < nx.start;
      const detail = S.commuteMin ? (leaveNow ? '<span style="color:var(--orange);font-weight:600">Çıkma vakti</span>' : atTime(hm(leave)) + ' çık') : '';
      rows += `<div class="cell"><div class="dot c-${nx.type}">${ICON[nx.type]}</div>
        <div class="cell-main">${dayLabel(nx.start, now)} · ${nx.type} ${nx.b}<div class="cell-sub">Sonraki vardiya · başlamasına ${dur((nx.start - now) / 6e4)}</div></div>
        <div class="cell-detail">${detail}</div></div>`;
    }
    if (shiftType(today) === 'İzin') {
      let n = 1; while (n < 60 && shiftType(ymd(addDays(now, n))) === 'İzin') n++;
      const back = shiftSpan(ymd(addDays(now, n)));
      rows += `<div class="cell"><div class="dot c-İzin">${ICON.İzin}</div>
        <div class="cell-main">${n === 1 ? 'İznin son günü' : 'Bugün dahil ' + n + ' gün izin'}<div class="cell-sub">İşe dönüş: ${dayLabel(addDays(now, n), now)}${back.start ? ' · ' + back.type + ' ' + back.b : ''}</div></div></div>`;
    } else {
      let i = 1; while (i < 60 && shiftType(ymd(addDays(now, i))) !== 'İzin') i++;
      const d = addDays(now, i);
      rows += i < 60 ? `<div class="cell"><div class="dot c-İzin">${ICON.İzin}</div>
        <div class="cell-main">${i === 1 ? 'Yarın izin' : 'Sonraki izne ' + i + ' gün'}<div class="cell-sub">${longDate(d)}</div></div></div>`
        : `<div class="cell"><div class="dot c-İzin">${ICON.İzin}</div><div class="cell-main">Sonraki izin<div class="cell-sub">Önümüzdeki 60 günde izin yok</div></div></div>`;
    }
    return `<div class="section-title">Sıradakiler</div><div class="group">${rows}</div>`;
  }
  function alarmCard(now) {
    const nx = nextAlarm(now);
    const when = nx ? dayLabel(nx.at, now) + ' ' + hm(nx.at) + ' · ' + nx.type : 'Önümüzdeki günlerde vardiya yok';
    const perm = typeof Notification === 'undefined' ? 'unsupported' : Notification.permission;
    let sub = 'Uygulama açıkken, vardiyadan 2 saat önce uyarır.';
    if (alarm.on) sub = 'Sonraki: ' + when + (perm === 'denied' ? ' · bildirim izni yok' : '');
    return `<div class="section-title">Alarm</div>
      <div class="group">
        <div class="cell"><div class="dot" style="background:var(--red)">${ICON.bell}</div>
          <div class="cell-main">Uygulama içi uyarı<div class="cell-sub">${esc(sub)}</div></div>
          <button type="button" class="switch ${alarm.on ? 'on' : ''}" data-act="alarm" role="switch" aria-checked="${alarm.on ? 'true' : 'false'}" aria-label="Alarm"><i></i></button></div>
        <div tabindex="0" class="cell tap chev" data-act="phone-alarm" role="button"><div class="dot" style="background:var(--accent)">${ICON.clock}</div><div class="cell-main">Telefonda alarm kur<div class="cell-sub">${nx ? esc(when) : 'Önce vardiya düzenini ayarla'}</div></div></div>
        <div tabindex="0" class="cell tap" data-act="alarm-ics" role="button"><div class="cell-main">Takvim hatırlatıcısı<div class="cell-sub">Vardiyaları telefon takvimine ekle</div></div></div>
      </div>
      <div class="section-foot">Kilitli ekranda çalması için “Telefonda alarm kur” adımlarını tamamla. Üstteki anahtar yalnız uygulama içi uyarıyı yönetir.</div>`;
  }
  function renderBugun() {
    const now = new Date(), today = ymd(now), h = now.getHours();
    const greet = h < 6 ? 'İyi geceler' : h < 12 ? 'Günaydın' : h < 18 ? 'İyi günler' : 'İyi akşamlar';
    const cur = currentShift(now), sp = shiftSpan(today);
    let hero;
    if (cur) {
      const pct = Math.min(100, (now - cur.start) / (cur.end - cur.start) * 100);
      hero = `<div class="hero t-${cur.type}"><div class="label">Şu an vardiyadasın</div><h2>${cur.type} vardiyası</h2>
        <div class="meta">${cur.b} - ${cur.e} · bitmesine ${dur((cur.end - now) / 6e4)}</div><div class="progress"><i style="width:${pct}%"></i></div></div>`;
    } else if (sp.type === 'İzin') {
      hero = `<div class="hero t-İzin"><div class="label">Bugün</div><h2>İzin günü</h2><div class="meta">Dinlenmenin tadını çıkar.</div></div>`;
    } else if (sp.start) {
      const done = now >= sp.end;
      hero = `<div class="hero t-${sp.type}"><div class="label">Bugün</div><h2>${sp.type} vardiyası</h2>
        <div class="meta">${sp.b} - ${sp.e} · ${done ? 'tamamlandı' : 'başlamasına ' + dur((sp.start - now) / 6e4)}</div></div>`;
    } else {
      hero = `<div class="hero t-yok"><div class="label">Bugün</div><h2>Vardiya yok</h2><div class="meta">Vardiya sekmesinden dönen düzenini ayarla.</div></div>`;
    }
    const used = breakTotal(todayKey()), allow = S.breakMin * 6e4;
    let week = '';
    for (let i = 1; i <= 7; i++) {
      const d = addDays(now, i), s = shiftSpan(ymd(d)), t = s.type || 'yok';
      week += `<div class="cell"><div class="dot ${s.type ? 'c-' + s.type : ''}" style="${s.type ? '' : 'background:var(--muted)'}">${ICON[t]}</div>
        <div class="cell-main">${i === 1 ? 'Yarın' : WD_LONG[d.getDay()]}<div class="cell-sub">${d.getDate()} ${MONTHS[d.getMonth()]}</div></div>
        <div class="cell-detail">${s.type ? (s.start ? s.type + ' · ' + s.b + '-' + s.e : 'İzin') : '-'}</div></div>`;
    }
    $('#screen-bugun').innerHTML = `
      <div class="brand-row"><img class="brand-mark" src="icons/icon-180.png" alt="TGS" width="30" height="30"><span>Günlük Asistan</span></div>
      <header class="page-header"><h1 class="large-title">${greet}</h1><p class="subtitle">${longDate(now)}</p></header>
      ${hero}
      <div class="tiles">
        <div class="tile"><div class="k">Bugünkü mola</div><div class="v">${dur(used / 6e4)}</div></div>
        <div class="tile"><div class="k">${used > allow ? 'Aşılan süre' : 'Kalan mola'}</div><div class="v" style="color:${used > allow ? 'var(--red)' : 'var(--green)'}">${dur(Math.abs(allow - used) / 6e4)}</div></div>
      </div>
      <div class="quick-action"><button class="btn ${active ? 'danger' : 'green'}" data-act="break">${active ? ICON.stop + ' Molayı bitir · ' + mmss(Date.now() - active) : ICON.play + ' Molaya başla'}</button></div>
      ${alarmCard(now)}
      ${upcomingHtml(now)}
      <div class="section-title">Önümüzdeki 7 gün</div><div class="group">${week}</div>`;
  }
  // ---------- VARDİYA ----------
  let calMonth = new Date(); calMonth.setDate(1);
  function renderVardiya() {
    const y = calMonth.getFullYear(), m = calMonth.getMonth(), today = ymd(new Date());
    const first = new Date(y, m, 1), startOff = (first.getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
    let cells = WD.map(w => `<div class="cal-wd">${w}</div>`).join('');
    for (let i = 0; i < 42; i++) {
      const d = new Date(y, m, 1 - startOff + i), ds = ymd(d), t = shiftType(ds);
      if (i >= 35 && d.getMonth() !== m) break;
      cells += `<button type="button" class="cal-day ${d.getMonth() !== m ? 'out' : ''} ${ds === today ? 'today' : ''}" data-day="${ds}" aria-label="${longDate(d)} ${d.getFullYear()}, ${t || 'vardiya yok'}" ${ds === today ? 'aria-current="date"' : ''}><span>${d.getDate()}</span><i aria-hidden="true" class="${t ? 'c-' + t : ''}"></i></button>`;
    }
    let work = 0, min = 0, off = 0, cnt = { Sabah: 0, Akşam: 0, Gece: 0 };
    for (let d = 1; d <= days; d++) { const sp = shiftSpan(ymd(new Date(y, m, d))); if (sp.start) { work++; min += sp.min; cnt[sp.type]++; } else if (sp.type === 'İzin') off++; }
    const r = S.rotation;
    const rotTxt = r && r.seq && r.seq.length ? compress(r.seq) : 'Ayarlanmadı';
    $('#screen-vardiya').innerHTML = `
      ${pageHeader('Vardiya', 'Çalışma günlerin, bir bakışta.')}
      <div class="cal">
        <div class="cal-head" style="padding:4px 8px 6px"><h3>${MONTHS[m]} ${y}</h3>
          <div class="row" style="flex:none;gap:8px"><button class="icon-btn" data-act="prev" aria-label="Önceki ay">${ICON.left}</button><button class="icon-btn" data-act="next" aria-label="Sonraki ay">${ICON.right}</button></div></div>
        <div class="cal-grid">${cells}</div>
        <div class="legend">${TYPES.map(t => `<span><b class="c-${t}"></b>${t}</span>`).join('')}</div>
      </div>
      <div class="section-foot" style="text-align:center">Bir güne dokunarak o günü tek seferlik değiştirebilirsin.</div>
      <div class="section-title">Dönen düzen</div>
      <div class="group"><div role="button" tabindex="0" class="cell tap chev" data-act="rotation"><div class="dot" style="background:var(--accent)">${ICON.repeat}</div>
        <div class="cell-main">Vardiya düzeni<div class="cell-sub">${esc(rotTxt)}</div></div></div></div>
      <div class="section-title">${MONTHS[m]} özeti</div>
      <div class="tiles" style="margin-top:0">
        <div class="tile"><div class="k">Çalışma saati</div><div class="v">${Math.round(min / 60)} sa</div></div>
        <div class="tile"><div class="k">Çalışma günü</div><div class="v">${work}</div></div>
        <div class="tile"><div class="k">İzin günü</div><div class="v">${off}</div></div>
        <div class="tile"><div class="k">Sabah / Akşam / Gece</div><div class="v">${cnt.Sabah} / ${cnt.Akşam} / ${cnt.Gece}</div></div>
      </div>
      <div class="distribution" role="img" aria-label="${MONTHS[m]} vardiya dağılımı: ${cnt.Sabah} sabah, ${cnt.Akşam} akşam, ${cnt.Gece} gece, ${off} izin günü">
        <div class="cell-sub">Ayın dağılımı</div>
        <div class="distribution-bar" aria-hidden="true">${TYPES.map(t => `<i class="c-${t}" style="flex:${t === 'İzin' ? off : cnt[t]}"></i>`).join('')}</div>
        <div class="distribution-labels" aria-hidden="true">${TYPES.map(t => `<span><strong>${t === 'İzin' ? off : cnt[t]}</strong>${t}</span>`).join('')}</div>
      </div>`;
  }
  function compress(seq) {
    const out = []; for (const t of seq) { const l = out[out.length - 1]; if (l && l.t === t) l.n++; else out.push({ t, n: 1 }); }
    return out.map(x => x.n + ' ' + x.t.toLocaleLowerCase('tr')).join(', ');
  }
  function daySheet(ds) {
    const d = parse(ds), cur = shiftType(ds), isOv = !!overrides[ds];
    openSheet(`<h3>${longDate(d)}</h3>
      <div class="section-title" style="margin-top:0">Bu gün için vardiya</div>
      <div class="chips">${TYPES.map(t => `<button class="chip c-${t}" data-set="${t}" style="${cur === t ? 'box-shadow:0 0 0 3px var(--bg),0 0 0 5px var(--accent)' : ''}">${t}</button>`).join('')}</div>
      ${isOv ? `<div style="margin-top:20px"><button class="btn secondary" data-set="">Düzene geri dön</button></div>` : ''}
      <div class="section-foot" style="margin-top:14px">${isOv ? 'Bu gün elle değiştirildi.' : 'Bu gün dönen düzenden geliyor.'}</div>`, root => {
      root.querySelectorAll('[data-set]').forEach(b => b.onclick = () => {
        const v = b.dataset.set; if (v) overrides[ds] = v; else delete overrides[ds];
        save(); haptic(); closeSheet(); renderAll(); toast('Kaydedildi');
      });
    });
  }
  function rotationSheet() {
    let seq = (S.rotation && S.rotation.seq ? S.rotation.seq.slice() : []);
    const start = (S.rotation && S.rotation.start) || ymd(new Date());
    openSheet(`<h3>Vardiya düzeni</h3>
      <div class="section-foot" style="margin:0 0 12px">Düzenini gün gün sırayla ekle. Örneğin 2 sabah, 2 gece, 2 izin için Sabah, Sabah, Gece, Gece, İzin, İzin'e dokun. Düzen kendini sonsuza kadar tekrar eder.</div>
      <div class="chips">${TYPES.map(t => `<button class="chip c-${t}" data-add="${t}">+ ${t}</button>`).join('')}</div>
      <div class="section-title">Sıra (${'<span id="rcount"></span>'} günlük döngü)</div>
      <div class="group" style="padding:12px"><div class="chips" id="rseq"></div></div>
      <div class="row" style="margin-top:10px"><button class="btn secondary" data-act="rundo">Sonuncuyu sil</button><button class="btn secondary" data-act="rclear" style="color:var(--red)">Temizle</button></div>
      <div class="section-title">Döngünün ilk günü</div>
      <div class="group"><div class="cell"><div class="cell-main">Başlangıç tarihi</div><input type="date" id="rstart" value="${start}"></div></div>
      <div class="section-foot">Sıradaki ilk vardiyanın olduğu bir günü seç.</div>
      <div style="margin-top:20px"><button class="btn" data-act="rsave">Kaydet</button></div>`, root => {
      const draw = () => {
        root.querySelector('#rseq').innerHTML = seq.length ? seq.map((t, i) => `<button class="chip c-${t}" data-rm="${i}">${i + 1}. ${t}</button>`).join('') : '<span class="cell-sub">Henüz gün eklenmedi</span>';
        root.querySelector('#rcount').textContent = seq.length;
        root.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { seq.splice(+b.dataset.rm, 1); draw(); });
      };
      draw();
      root.querySelectorAll('[data-add]').forEach(b => b.onclick = () => { seq.push(b.dataset.add); haptic(); draw(); });
      root.querySelector('[data-act=rundo]').onclick = () => { seq.pop(); draw(); };
      root.querySelector('[data-act=rclear]').onclick = () => { seq = []; draw(); };
      root.querySelector('[data-act=rsave]').onclick = () => {
        const st = root.querySelector('#rstart').value;
        if (!seq.length) return toast('En az bir gün ekle');
        if (!st) return toast('Başlangıç tarihini seç');
        S.rotation = { seq, start: st }; save(); closeSheet(); renderAll(); toast('Düzen kaydedildi');
      };
    });
  }

  // ---------- MOLA ----------
  function renderMola() {
    const key = todayKey(), used = breakTotal(key), allow = S.breakMin * 6e4;
    const C = 2 * Math.PI * 104, frac = Math.min(1, used / allow), over = used > allow;
    const list = breaks.filter(x => shiftDay(x.b) === key).sort((a, b) => b.b - a.b);
    let hist = '';
    for (let i = 1; i <= 6; i++) {
      const d = addDays(parse(key), -i), t = breakTotal(ymd(d));
      if (t > 0) hist += `<div class="cell"><div class="cell-main">${WD_LONG[d.getDay()]}<div class="cell-sub">${d.getDate()} ${MONTHS[d.getMonth()]}</div></div><div class="cell-detail" style="${t > allow ? 'color:var(--red)' : ''}">${dur(t / 6e4)}</div></div>`;
    }
    $('#screen-mola').innerHTML = `
      ${pageHeader('Bir nefes al.', 'Mola süren ve gün içindeki dengen.')}
      <div style="text-align:center;min-height:26px">${active ? `<span class="pill live">Moladasın · ${hm(active)}'den beri</span>` : '<span class="cell-sub">Kendine ayırdığın zaman</span>'}</div>
      <div class="ring-wrap"><svg viewBox="0 0 240 240" aria-hidden="true"><circle class="ring-bg" cx="120" cy="120" r="104" fill="none"/>
        <circle class="ring-fg" id="ringfg" cx="120" cy="120" r="104" fill="none" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - frac)}" style="stroke:${over ? 'var(--red)' : frac > .8 ? 'var(--orange)' : 'var(--green)'}"/></svg>
        <button type="button" class="ring-center" data-act="break-options" aria-label="Mola süresini seç"><span class="time" id="ringtime">${active ? mmss(Date.now() - active) : mmss(over ? used - allow : allow - used)}</span>
        <span class="cap">${active ? 'bu mola' : over ? 'hakkı aştın' : 'kalan mola hakkı'}</span><span class="ring-hint">Süreyi seç ${ICON.right}</span></button></div>
      <button class="btn ${active ? 'danger' : 'green'}" data-act="break">${active ? ICON.stop + ' Molayı bitir' : ICON.play + ' Molaya başla'}</button>
      <div class="tiles">
        <div class="tile"><div class="k">Bugün toplam</div><div class="v">${dur(used / 6e4)}</div></div>
        <div class="tile"><div class="k">Günlük hak</div><div class="v">${dur(S.breakMin)}</div></div>
      </div>
      <div class="section-title">Bugünkü molalar</div>
      <div class="group">${(active ? `<div class="cell"><div class="dot" style="background:var(--green)">${ICON.coffee}</div><div class="cell-main">${hm(active)} - şimdi</div><div class="cell-detail">sürüyor</div></div>` : '') +
        (list.map(x => `<div tabindex="0" class="cell tap chev" data-brk="${x.b}" role="button" aria-label="${hm(x.b)} - ${hm(x.s)} molasını düzenle"><div class="dot" style="background:var(--teal)">${ICON.coffee}</div><div class="cell-main">${hm(x.b)} - ${hm(x.s)}</div><div class="cell-detail">${dur((x.s - x.b) / 6e4)}</div></div>`).join('') ||
        (active ? '' : '<div class="empty" style="padding:18px 16px">Bugün henüz mola vermedin.</div>')) +
        `<div tabindex="0" class="cell tap" data-act="addBreak" role="button"><div class="cell-main" style="color:var(--accent)">+ Mola ekle</div></div>`}</div>
      <div class="section-foot">Unuttuğun molayı ekleyebilir, bir molaya dokunup düzeltebilirsin. Gece vardiyasındaki molalar vardiyanın başladığı güne sayılır.</div>
      ${hist ? `<div class="section-title">Son günler</div><div class="group">${hist}</div>` : ''}
      ${list.length ? `<div style="margin-top:16px"><button class="btn plain danger" data-act="clearToday">Bugünün molalarını sil</button></div>` : ''}`;
  }
  function breakOptions() {
    const options = [[15,'15 dk'],[30,'30 dk'],[45,'45 dk'],[60,'1 saat'],[90,'1 saat 30 dk'],[120,'2 saat']];
    openSheet(`<h3>Mola süren</h3><p class="section-foot" style="margin:0 0 20px;text-align:center">Günlük mola hakkını seç. Kullandığın süre ve devam eden molan korunur.</p><div class="break-options">${options.map(([min,label]) => `<button type="button" class="duration-option" data-minutes="${min}" aria-pressed="${S.breakMin === min}"><span>${label}</span>${S.breakMin === min ? '<span class="duration-check" aria-hidden="true">✓</span>' : ''}</button>`).join('')}</div>`, root => {
      root.querySelectorAll('[data-minutes]').forEach(button => button.onclick = () => {
        S.breakMin = Number(button.dataset.minutes); save(); haptic(); closeSheet(); renderAll(); toast('Günlük mola hakkı: ' + dur(S.breakMin));
      });
    });
  }
  function breakSheet(orig) {
    const now = Date.now();
    const b0 = orig ? orig.b : now - 15 * 6e4, s0 = orig ? orig.s : now;
    openSheet(`<h3>${orig ? 'Molayı düzenle' : 'Mola ekle'}</h3>
      <div class="group">
        <div class="cell"><div class="cell-main">Başlangıç</div><input type="time" id="bk-b" value="${hm(b0)}"></div>
        <div class="cell"><div class="cell-main">Bitiş</div><input type="time" id="bk-s" value="${hm(s0)}"></div>
      </div>
      <div class="section-foot">Gece yarısını geçen molalar da olur, örneğin 23:50 - 00:10.</div>
      <div class="stack" style="margin-top:20px"><button class="btn" data-bk="save">Kaydet</button>
      ${orig ? '<button class="btn plain danger" data-bk="del">Molayı sil</button>' : '<button class="btn secondary" data-bk="cancel">Vazgeç</button>'}</div>`, root => {
      root.querySelector('[data-bk=save]').onclick = () => {
        const bv = root.querySelector('#bk-b').value, sv = root.querySelector('#bk-s').value;
        if (!TIME_RE.test(bv) || !TIME_RE.test(sv)) return toast('Saatleri gir');
        const b = resolveTime(bv, orig ? orig.b : now);
        let s = resolveTime(sv, b);
        if (s <= b) s += 864e5;
        if (s - b > 12 * 36e5 || s === b) return toast('Bitiş başlangıçtan sonra olmalı');
        if (s > Date.now() + 6e4) return toast('Bitiş saati gelecekte olamaz');
        if (orig) breaks = breaks.filter(x => x !== orig);
        breaks.push({ b, s }); pruneBreaks(); save(); haptic(); closeSheet(); renderAll(); toast('Kaydedildi');
      };
      const del = root.querySelector('[data-bk=del]');
      if (del) del.onclick = () => confirmSheet('Mola silinsin mi?', hm(orig.b) + ' - ' + hm(orig.s) + ' molası silinecek.', 'Molayı sil', () => { breaks = breaks.filter(x => x !== orig); save(); renderAll(); toast('Silindi'); });
      const c = root.querySelector('[data-bk=cancel]'); if (c) c.onclick = closeSheet;
    });
  }
  // Unutulan mola koruması
  let forgottenAsked = null;
  function checkForgotten() {
    if (!active || forgottenAsked === active || sheetOpen() || window.Tetris && Tetris.isOpen && Tetris.isOpen()) return;
    const now = Date.now(), cur = currentShift(new Date(active));
    if (!(now - active > 2 * S.breakMin * 6e4 || (cur && now > cur.end))) return;
    forgottenAsked = active;
    const a = active;
    openSheet(`<h3>Mola hâlâ açık (${dur((now - a) / 6e4)})</h3>
      <div class="section-foot" style="margin:0 8px 14px;text-align:center">Mola ${hm(a)} itibarıyla başladı; bitirmeyi unutmuş olabilirsin. Molanın bittiği saati seç.</div>
      <div class="group"><div class="cell"><div class="cell-main">Bitiş saati</div><input type="time" id="fg-s" value="${hm(now)}"></div></div>
      <div class="stack" style="margin-top:20px"><button class="btn" data-fg="end">Molayı bitir</button><button class="btn secondary" data-fg="keep">Mola sürüyor</button></div>`, root => {
      root.querySelector('[data-fg=end]').onclick = () => {
        const v = root.querySelector('#fg-s').value; if (!TIME_RE.test(v)) return toast('Saati gir');
        let s = resolveTime(v, Date.now()); if (s > Date.now()) s = Date.now();
        if (s <= a) return toast('Bitiş başlangıçtan sonra olmalı');
        if (active === a) { breaks.push({ b: a, s }); active = null; pruneBreaks(); save(); }
        haptic(); closeSheet(); renderAll(); toast('Mola kaydedildi');
      };
      root.querySelector('[data-fg=keep]').onclick = closeSheet;
    });
  }

  // ---------- dosya paylaşma / indirme ----------
  async function shareOrDownload(name, text, mime) {
    const file = new File([text], name, { type: mime });
    if (navigator.canShare && navigator.share) {
      try { if (navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: name }); return true; } }
      catch (e) { if (e && e.name === 'AbortError') return false; }
    }
    const url = URL.createObjectURL(file), a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return true;
  }
  async function exportBackup() {
    const payload = { format: 'ga-backup', v: 1, exportedAt: new Date().toISOString(),
      data: { settings: S, overrides, breaks, activeBreak: active, alarm, syncAt, tetrisBest: store.get('tetrisBest', 0) } };
    const ok = await shareOrDownload('gunluk-asistan-yedek-' + ymd(new Date()) + '.json', JSON.stringify(payload, null, 2), 'application/json');
    if (ok) { store.set('lastBackup', Date.now()); renderAyarlar(); toast('Yedek hazır'); }
  }
  function readBackup(obj) {
    if (!obj || typeof obj !== 'object') return null;
    const raw = obj.format === 'ga-backup' && obj.data && typeof obj.data === 'object' ? obj.data : obj; // eski biçim: düz anahtar -> metin
    const val = k => { const v = raw[k]; if (typeof v !== 'string') return v; try { return JSON.parse(v); } catch (e) { return undefined; } };
    const out = {}, st = val('settings'), ov = val('overrides'), br = val('breaks'), ab = val('activeBreak'), tb = val('tetrisBest'), al = val('alarm'), sy = val('syncAt');
    if (st && typeof st === 'object' && !Array.isArray(st)) out.settings = st;
    if (ov && typeof ov === 'object' && !Array.isArray(ov)) out.overrides = Object.fromEntries(Object.entries(ov).filter(([k, v]) => /^\d{4}-\d{2}-\d{2}$/.test(k) && TYPES.includes(v)));
    if (Array.isArray(br)) out.breaks = br.filter(x => x && typeof x.b === 'number' && typeof x.s === 'number' && x.s > x.b);
    if (typeof ab === 'number') out.activeBreak = ab;
    if (typeof tb === 'number') out.tetrisBest = tb;
    if (al && typeof al === 'object' && !Array.isArray(al)) out.alarm = { on: !!al.on, lastFired: typeof al.lastFired === 'number' ? al.lastFired : 0 };
    if (typeof sy === 'number') out.syncAt = sy;
    return out.settings || out.breaks || out.overrides ? out : null;
  }
  function restoreFrom(file) {
    if (!file) return;
    file.text().then(txt => {
      let d = null; try { d = readBackup(JSON.parse(txt)); } catch (e) {}
      if (!d) return toast('Bu dosya bir Günlük Asistan yedeği değil');
      const nb = (d.breaks || []).length, no = Object.keys(d.overrides || {}).length;
      openSheet(`<h3>Yedeği geri yükle</h3>
        <div class="group"><div class="cell"><div class="dot" style="background:var(--accent)">${ICON.up}</div><div class="cell-main">${nb} mola, ${no} gün değişikliği<div class="cell-sub">${d.settings ? 'Vardiya düzeni ve saatleri dahil' : 'Ayar yok'}</div></div></div></div>
        <div class="section-foot">Bu telefondaki mevcut vardiya ve mola verileri yedektekilerle değiştirilecek.</div>
        <div class="stack" style="margin-top:20px"><button class="btn" data-rs="ok">Geri yükle</button><button class="btn secondary" data-rs="no">Vazgeç</button></div>`, root => {
        root.querySelector('[data-rs=no]').onclick = closeSheet;
        root.querySelector('[data-rs=ok]').onclick = () => {
          const ok = ['settings', 'overrides', 'breaks', 'activeBreak', 'alarm', 'syncAt', 'tetrisBest'].every(k => {
            if (k in d) return store.set(k, d[k]);
            if (k !== 'tetrisBest' && k !== 'alarm' && k !== 'syncAt') { try { localStorage.removeItem(k); } catch (e) {} }
            return true;
          });
          if (!ok) return;
          closeSheet(); toast('Yedek geri yüklendi'); setTimeout(() => location.reload(), 700);
        };
      });
    }).catch(() => toast('Dosya okunamadı'));
  }
  // ---------- takvim (.ics) ----------
  function icsStamp(d) { return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + 'T' + pad(d.getHours()) + pad(d.getMinutes()) + '00'; }
  function buildIcs() {
    const now = new Date(), utc = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Gunluk Asistan//TR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Vardiyalarım', 'X-WR-TIMEZONE:Europe/Istanbul',
      'BEGIN:VTIMEZONE', 'TZID:Europe/Istanbul', 'BEGIN:STANDARD', 'DTSTART:19700101T000000', 'TZOFFSETFROM:+0300', 'TZOFFSETTO:+0300', 'TZNAME:+03', 'END:STANDARD', 'END:VTIMEZONE'];
    let n = 0;
    for (let i = 0; i < 60; i++) {
      const ds = ymd(addDays(now, i)), sp = shiftSpan(ds);
      if (!sp.start || sp.end <= now) continue;
      n++;
      L.push('BEGIN:VEVENT', 'UID:' + ds + '-' + sp.b.replace(':', '') + '@gunluk-asistan', 'DTSTAMP:' + utc,
        'DTSTART;TZID=Europe/Istanbul:' + icsStamp(sp.start), 'DTEND;TZID=Europe/Istanbul:' + icsStamp(sp.end),
        'SUMMARY:' + sp.type + ' vardiyası', 'DESCRIPTION:' + sp.b + ' - ' + sp.e + ' (Günlük Asistan)',
        'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + sp.type + ' vardiyası 1 saat sonra başlıyor', 'TRIGGER:-PT60M', 'END:VALARM', 'END:VEVENT');
    }
    L.push('END:VCALENDAR');
    return { text: L.join('\r\n') + '\r\n', n };
  }
  async function exportIcs() {
    const { text, n } = buildIcs();
    if (!n) return toast('Önümüzdeki 60 günde vardiya yok');
    const ok = await shareOrDownload('vardiyalar-' + ymd(new Date()) + '.ics', text, 'text/calendar');
    if (ok) toast(n + ' vardiya takvim dosyasına eklendi');
  }
  function buildAlarmIcs() {
    const now = new Date(), utc = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Gunluk Asistan//TR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Vardiya alarmları', 'X-WR-TIMEZONE:Europe/Istanbul',
      'BEGIN:VTIMEZONE', 'TZID:Europe/Istanbul', 'BEGIN:STANDARD', 'DTSTART:19700101T000000', 'TZOFFSETFROM:+0300', 'TZOFFSETTO:+0300', 'TZNAME:+03', 'END:STANDARD', 'END:VTIMEZONE'];
    let n = 0;
    for (const a of alarmsAround(now, -1, 60)) {
      if (a.at <= now) continue;
      n++;
      const end = new Date(a.at.getTime() + 5 * 60000);
      L.push('BEGIN:VEVENT', 'UID:alarm-' + a.day + '-' + a.b.replace(':', '') + '@gunluk-asistan', 'DTSTAMP:' + utc,
        'DTSTART;TZID=Europe/Istanbul:' + icsStamp(a.at), 'DTEND;TZID=Europe/Istanbul:' + icsStamp(end),
        'SUMMARY:Vardiya alarmı ' + a.type + ' ' + a.b, 'DESCRIPTION:' + a.type + ' vardiyası ' + a.b + ' de başlıyor. Alarm 2 saat önce.',
        'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + a.type + ' vardiyası 2 saat sonra', 'TRIGGER:-PT1S', 'END:VALARM', 'END:VEVENT');
    }
    L.push('END:VCALENDAR');
    return { text: L.join('\r\n') + '\r\n', n };
  }
  async function exportAlarmIcs() {
    const { text, n } = buildAlarmIcs();
    if (!n) return toast('Önümüzdeki günlerde alarm yok');
    const ok = await shareOrDownload('vardiya-alarmlari-' + ymd(new Date()) + '.ics', text, 'text/calendar');
    if (ok) toast(n + ' alarm takvim dosyasına eklendi');
  }

  // ---------- AYARLAR ----------
  function renderAyarlar() {
    const t = S.times, lb = store.get('lastBackup', 0);
    const lbDays = lb ? Math.floor((Date.now() - lb) / 864e5) : -1;
    const lbTxt = lb ? 'Son yedek: ' + (lbDays <= 0 ? 'bugün' : lbDays + ' gün önce') : 'Henüz yedek alınmadı';
    $('#screen-ayarlar').innerHTML = `
      ${pageHeader('Ayarlar', 'Gününü kendi düzenine göre ayarla.')}
      <div class="section-title">Görünüm</div>
      <div class="theme-picker" role="group" aria-label="Görünüm teması">${[['system','Otomatik'],['light','Açık'],['dark','Koyu']].map(([value,label]) => `<button type="button" data-theme-choice="${value}" aria-pressed="${appearance === value}">${label}</button>`).join('')}</div>
      <div class="section-foot">Otomatik görünüm, cihazının açık veya koyu temasını izler.</div>
      <div class="section-title" style="margin-top:8px">Vardiya saatleri</div>
      <div class="group">${['Sabah', 'Akşam', 'Gece'].map(k => `<div class="cell"><div class="dot c-${k}">${ICON[k]}</div><div class="cell-main">${k}<div class="time-pair"><input type="time" data-time="${k}-0" value="${t[k][0]}" aria-label="${k} başlangıç"><span class="cell-detail">-</span><input type="time" data-time="${k}-1" value="${t[k][1]}" aria-label="${k} bitiş"></div></div></div>`).join('')}</div>
      <div class="section-foot">Bitiş başlangıçtan önceyse vardiya ertesi güne geçer, örneğin 22:30 - 06:30.</div>
      <div class="section-title">Mola ve yol</div>
      <div class="group"><div class="cell stepper-cell"><div class="dot" style="background:var(--green)">${ICON.clock}</div><div class="cell-main">Günlük mola hakkı</div>
        <button class="icon-btn" data-act="bm-" aria-label="Mola hakkını azalt">−</button><span style="min-width:62px;text-align:center;font-variant-numeric:tabular-nums">${S.breakMin} dk</span><button class="icon-btn" data-act="bm+" aria-label="Mola hakkını artır">+</button></div>
        <div class="cell stepper-cell"><div class="dot" style="background:var(--indigo)">${ICON.car}</div><div class="cell-main">Yol süresi</div>
        <button class="icon-btn" data-act="cm-" aria-label="Yol süresini azalt">−</button><span style="min-width:62px;text-align:center;font-variant-numeric:tabular-nums">${S.commuteMin} dk</span><button class="icon-btn" data-act="cm+" aria-label="Yol süresini artır">+</button></div></div>
      <div class="section-foot">Yol süresi, Bugün ekranındaki "…'te çık" saatini hesaplar.</div>
      <div class="section-title">Takvim</div>
      <div class="group"><div tabindex="0" class="cell tap chev" data-act="ics" role="button"><div class="dot" style="background:var(--red)">${ICON.cal}</div><div class="cell-main">Takvime aktar (.ics)<div class="cell-sub">Önümüzdeki 60 günün vardiyaları</div></div></div></div>
      <div class="section-foot">Dosyayı iPhone Takvim'e ekleyince her vardiyadan 1 saat önce hatırlatma gelir. Düzenin değişirse yeniden aktar.</div>
      <div class="section-title">Veriler</div>
      <div class="group">
        <div tabindex="0" class="cell tap" data-act="export" role="button"><div class="dot" style="background:var(--accent)">${ICON.share}</div><div class="cell-main">Yedek al<div class="cell-sub">${lbTxt}</div></div></div>
        <div tabindex="0" class="cell tap" data-act="restore" role="button"><div class="dot" style="background:var(--teal)">${ICON.up}</div><div class="cell-main">Yedeği geri yükle</div></div>
        <div tabindex="0" class="cell tap" data-act="reset" role="button"><div class="dot" style="background:var(--red)">${ICON.trash}</div><div class="cell-main" style="color:var(--red)">Kişisel verileri sil</div></div>
      </div>
      <input type="file" id="restore-file" accept="application/json,.json" hidden>
      <div class="section-foot">Verilerin bu telefonda durur. Hesaba girince diğer cihazlarla da eşitlenir. Ara sıra yedek alıp Dosyalar'a kaydetmen iyi olur.</div>
      <div class="section-title">Hesap</div>
      <div class="group"><div tabindex="0" class="cell tap chev" data-act="account" role="button"><div class="dot" style="background:var(--accent)">${ICON.user}</div><div class="cell-main">Hesap<div class="cell-sub" id="account-sub">${esc(accountStatusText)}</div></div></div></div>
      <div class="section-foot">Google veya e-posta ile giriş. Kurulmadıysa uygulama eskisi gibi çalışır.</div>
      <div class="group" style="margin-top:24px"><div tabindex="0" class="cell tap chev" data-act="tetris" role="button"><span class="nayro-logo">${nayroLogo()}</span><div class="cell-main">Tetris modu</div></div></div>
      <div class="empty brand-foot"><img class="brand-mark" src="icons/icon-180.png" alt="" width="44" height="44"><div>Günlük Asistan 4.0<br>Nayro ve nayronayt</div></div>`;
    $('#screen-ayarlar').querySelectorAll('[data-time]').forEach(inp => inp.onchange = () => {
      const [k, i] = inp.dataset.time.split('-');
      if (!TIME_RE.test(inp.value)) { inp.value = S.times[k][+i]; return; }
      if (inp.value === S.times[k][1 - i]) { inp.value = S.times[k][+i]; return toast('Başlangıç ve bitiş aynı olamaz'); }
      S.times[k][+i] = inp.value; save(); renderAll(); toast('Kaydedildi');
    });
    $('#restore-file').onchange = e => { restoreFrom(e.target.files[0]); e.target.value = ''; };
  }

  // ---------- Tetris modu (tetris.js ilk açılışta yüklenir) ----------
  function openTetris() {
    haptic();
    if (window.Tetris) return Tetris.open();
    const s = document.createElement('script'); s.src = 'tetris.js';
    s.onload = () => window.Tetris ? Tetris.open() : toast('Oyun açılamadı');
    s.onerror = () => { s.remove(); toast('Oyun açılamadı'); };
    document.body.appendChild(s);
  }

  // ---------- olaylar ----------
  function onClick(e) {
    if (e.target.closest('#sheet') || e.target.closest('#toast')) return;
    const theme = e.target.closest('[data-theme-choice]');
    if (theme) {
      appearance = theme.dataset.themeChoice; store.set('appearance', appearance); applyAppearance();
      document.querySelectorAll('[data-theme-choice]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.themeChoice === appearance)));
      return haptic();
    }
    const day = e.target.closest('[data-day]'); if (day) return daySheet(day.dataset.day);
    const bk = e.target.closest('[data-brk]'); if (bk) { const o = breaks.find(x => x.b === +bk.dataset.brk); return o && breakSheet(o); }
    const a = e.target.closest('[data-act]'); if (!a) return;
    switch (a.dataset.act) {
      case 'break': return toggleBreak();
      case 'break-options': return breakOptions();
      case 'prev': calMonth.setMonth(calMonth.getMonth() - 1); haptic(); return renderVardiya();
      case 'next': calMonth.setMonth(calMonth.getMonth() + 1); haptic(); return renderVardiya();
      case 'rotation': return rotationSheet();
      case 'bm-': S.breakMin = Math.max(5, S.breakMin - 5); save(); haptic(); return renderAll();
      case 'bm+': S.breakMin = Math.min(240, S.breakMin + 5); save(); haptic(); return renderAll();
      case 'cm-': S.commuteMin = Math.max(0, S.commuteMin - 5); save(); haptic(); return renderAll();
      case 'cm+': S.commuteMin = Math.min(180, S.commuteMin + 5); save(); haptic(); return renderAll();
      case 'addBreak': return breakSheet(null);
      case 'clearToday': return confirmSheet('Bugünün molaları silinsin mi?', 'Bu vardiyada kaydedilen molaların hepsi silinir.', 'Molaları sil', () => {
        const k = todayKey(); breaks = breaks.filter(x => shiftDay(x.b) !== k); save(); renderAll(); toast('Silindi');
      });
      case 'export': return exportBackup();
      case 'restore': return $('#restore-file').click();
      case 'ics': return exportIcs();
      case 'alarm': return toggleAlarm();
      case 'phone-alarm': return GAPhoneAlarm.open();
      case 'alarm-ics': return exportAlarmIcs();
      case 'account': return loadAccount(true);
      case 'tetris': return openTetris();
      case 'reset': return confirmSheet('Kişisel veriler silinsin mi?', 'Vardiya düzeni, gün değişiklikleri ve mola kayıtların silinir. Ekip üyeliklerin ve gönderdiğin mesajlar kalır. Bu geri alınamaz.', 'Kişisel verileri sil', () => {
        const done = () => { localStorage.clear(); location.reload(); };
        if (window.GAAccount && GAAccount.wipe) GAAccount.wipe().then(done, done);
        else done();
      });
    }
  }

  function renderAll() { renderBugun(); renderVardiya(); renderMola(); renderAyarlar(); }
  function setAccountStatus(t) {
    accountStatusText = t || 'Giriş yap, verilerini eşitle';
    const el = document.getElementById('account-sub');
    if (el) el.textContent = accountStatusText;
  }
  function cleanPayload(data) {
    const src = data && typeof data === 'object' ? data : {};
    const norm = normalizeSettings(src.settings || S);
    const ov = src.overrides && typeof src.overrides === 'object' && !Array.isArray(src.overrides) ? src.overrides : {};
    const overridesOut = Object.fromEntries(Object.entries(ov).filter(([k, v]) => /^\d{4}-\d{2}-\d{2}$/.test(k) && TYPES.includes(v)));
    const br = Array.isArray(src.breaks) ? src.breaks.filter(x => x && typeof x.b === 'number' && typeof x.s === 'number' && x.s > x.b).map(x => ({ b: x.b, s: x.s })) : [];
    const al = src.alarm && typeof src.alarm === 'object' ? src.alarm : alarm;
    return {
      v: 1,
      updatedAt: typeof src.updatedAt === 'number' ? src.updatedAt : 0,
      settings: norm.S,
      overrides: overridesOut,
      breaks: br,
      activeBreak: typeof src.activeBreak === 'number' ? src.activeBreak : null,
      alarm: { on: !!al.on, lastFired: typeof al.lastFired === 'number' ? al.lastFired : 0 }
    };
  }
  function getSyncPayload() {
    return { v: 1, updatedAt: syncAt || 0, settings: S, overrides, breaks, activeBreak: active, alarm: { on: !!alarm.on, lastFired: alarm.lastFired || 0 } };
  }
  function mergeSync(local, remote) {
    const L = cleanPayload(local), R = cleanPayload(remote);
    const newer = (R.updatedAt || 0) > (L.updatedAt || 0) ? R : L;
    const older = newer === R ? L : R;
    const map = new Map();
    for (const b of [...older.breaks, ...newer.breaks]) map.set(b.b + ':' + b.s, b);
    const breaks = [...map.values()].sort((a, b) => a.b - b.b);
    const overrides = Object.assign({}, older.overrides, newer.overrides);
    const newerBreaks = [...newer.breaks].sort((a, b) => a.b - b.b);
    const changed = JSON.stringify(breaks) !== JSON.stringify(newerBreaks) || JSON.stringify(overrides) !== JSON.stringify(newer.overrides);
    return {
      v: 1,
      updatedAt: changed ? Date.now() : (newer.updatedAt || 0),
      settings: newer.settings,
      overrides,
      breaks,
      activeBreak: newer.activeBreak,
      alarm: newer.alarm
    };
  }
  function applySyncPayload(data) {
    const p = cleanPayload(data);
    applyingRemote = true;
    try {
      S = p.settings;
      overrides = p.overrides;
      breaks = p.breaks;
      active = p.activeBreak;
      alarm = p.alarm;
      syncAt = typeof data.updatedAt === 'number' ? data.updatedAt : syncAt;
      store.set('settings', S); store.set('overrides', overrides); store.set('breaks', breaks); store.set('activeBreak', active); store.set('alarm', alarm); store.set('syncAt', syncAt);
    } finally { applyingRemote = false; }
    scheduleAlarm();
    renderAll();
    window.dispatchEvent(new Event('ga:breakchange'));
  }
  function loadAccount(open) {
    if (open) window.__gaAccountOpen = true;
    if (window.GAAccount) { if (open) GAAccount.open(); else GAAccount.bootIfNeeded(); return; }
    if (loadAccount.started) return;
    loadAccount.started = true;
    const s = document.createElement('script');
    s.src = 'account.js';
    s.onerror = () => { loadAccount.started = false; if (open) toast('Hesap ekranı yüklenemedi'); };
    document.body.appendChild(s);
  }

  function show(name) {
    if (name === 'ekip') loadGroups();
    document.querySelectorAll('.screen').forEach(s => {
      const on = s.id === 'screen-' + name;
      s.classList.toggle('active', on);
      if (on) { s.removeAttribute('aria-hidden'); s.inert = false; } else { s.setAttribute('aria-hidden', 'true'); s.inert = true; }
    });
    document.querySelectorAll('.tabbar button').forEach(b => {
      const on = b.dataset.screen === name;
      b.classList.toggle('active', on);
      if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    store.set('lastTab', name);
  }
  function loadGroups() {
    if (window.GAGroups) return GAGroups.open();
    if (loadGroups.pending) return;
    loadGroups.pending = true;
    $('#screen-ekip').innerHTML = pageHeader('Ekip', 'Aynı vardiya, aynı ekip.') + '<div class="empty">Ekip alanı açılıyor…</div>';
    const s = document.createElement('script'); s.src = 'groups.js';
    s.onload = () => { loadGroups.pending = false; window.GAGroups && GAGroups.open(); };
    s.onerror = () => { loadGroups.pending = false; $('#screen-ekip').innerHTML = pageHeader('Ekip', 'Ekip alanı yüklenemedi.') + '<div class="empty">Bağlantını kontrol edip bu sekmeyi tekrar aç.</div>'; s.remove(); };
    document.body.appendChild(s);
  }
  function breakPresence() {
    const spentBefore = breakTotal(todayKey()) - (active ? Date.now() - active : 0);
    return { state: active ? 'break' : 'ready', breakStartedAt: active || 0,
      breakEndsAt: active ? active + Math.max(0, S.breakMin * 6e4 - spentBefore) : 0 };
  }

  // Alt sayfayı aşağı sürükleyerek kapatma
  function initSheetDrag() {
    const sh = $('#sheet'); let y0 = null, dy = 0;
    sh.addEventListener('touchstart', e => {
      if (!sh.classList.contains('on') || e.touches.length !== 1 || e.target.closest('button,input,select,textarea,a')) return;
      const y = e.touches[0].clientY;
      if (y - sh.getBoundingClientRect().top > 56 || sh.scrollTop > 0) return;
      y0 = y; dy = 0; sh.classList.add('drag');
    }, { passive: true });
    sh.addEventListener('touchmove', e => {
      if (y0 == null) return;
      dy = Math.max(0, e.touches[0].clientY - y0);
      if (dy > 0) e.preventDefault();
      sh.style.transform = 'translateY(' + dy + 'px)';
    }, { passive: false });
    const end = () => {
      if (y0 == null) return;
      y0 = null; sh.classList.remove('drag');
      if (dy > 100) closeSheet(); else sh.style.transform = '';
    };
    sh.addEventListener('touchend', end); sh.addEventListener('touchcancel', end);
  }

  function initUpdates() {
    if (!('serviceWorker' in navigator) || !location.protocol.startsWith('http')) return;
    let had = !!navigator.serviceWorker.controller, reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!had) { had = true; return; } // ilk kurulum, yeniden yüklemeye gerek yok
      if (reloading) return; reloading = true;
      toast('Yeni sürüm yüklendi');
      const go = () => { if (sheetOpen() || (window.Tetris && Tetris.isOpen && Tetris.isOpen())) return setTimeout(go, 2000); location.reload(); };
      setTimeout(go, 1200);
    });
    navigator.serviceWorker.register('sw.js').then(reg => {
      document.addEventListener('visibilitychange', () => { if (!document.hidden) reg.update().catch(() => {}); });
    }).catch(() => {});
  }

  function boot() {
    applyAppearance();
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyAppearance);
    document.querySelectorAll('.tabbar button').forEach(b => b.onclick = () => { haptic(); show(b.dataset.screen); });
    document.addEventListener('click', onClick);
    window.addEventListener('ga:auth', e => { if (e.detail) loadGroups(); });
    document.addEventListener('keydown', e => {
      if (sheetOpen()) {
        if (e.key === 'Escape') { e.preventDefault(); closeSheet(); }
        if (e.key === 'Tab') {
          const items = [...$('#sheet').querySelectorAll('button,input,select,textarea,[tabindex="0"]')].filter(el => !el.disabled && el.getClientRects().length);
          const first = items[0], last = items[items.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      } else if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.cell.tap')) {
        e.preventDefault(); e.target.click();
      }
    });
    $('.sheet-close').onclick = closeSheet;
    $('#sheet-backdrop').onclick = closeSheet;
    initSheetDrag();
    renderAll();
    try { Object.keys(localStorage).forEach(k => { if (k.indexOf('ceviri.') === 0) localStorage.removeItem(k); }); } catch (e) {}
    try { const p = navigator.storage && navigator.storage.persist && navigator.storage.persist(); p && p.catch && p.catch(() => {}); } catch (e) {}
    const last = store.get('lastTab', 'bugun');
    show(location.hash.startsWith('#invite=') ? 'ekip' : document.getElementById('screen-' + last) ? last : 'bugun');
    if (location.hash === '#alarm-setup') GAPhoneAlarm.open('android');
    window.addEventListener('hashchange', () => { if (location.hash === '#alarm-setup') GAPhoneAlarm.open('android'); });
    window.addEventListener('hashchange', () => { if (location.hash.startsWith('#invite=')) show('ekip'); });
    setInterval(() => {
      if (active) {
        const t = $('#ringtime'); if (t) t.textContent = mmss(Date.now() - active);
        const b = $('#screen-bugun [data-act=break]'); if (b) b.innerHTML = ICON.stop + ' Molayı bitir · ' + mmss(Date.now() - active);
      }
    }, 1000);
    setInterval(() => { if (!sheetOpen()) { renderBugun(); renderMola(); } }, 30000);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) { scheduleAlarm(); if (!sheetOpen()) renderAll(); checkForgotten(); }
    });
    setInterval(() => { if (alarm.on && dueAlarm(new Date())) scheduleAlarm(); }, 15000);
    setTimeout(checkForgotten, 600);
    initUpdates();
    scheduleAlarm();
    try {
      if (store.get('gaUser', null) || sessionStorage.getItem('ga-auth-redirect') === '1') { loadAccount(false); loadGroups(); }
    } catch (e) {}
  }

  window.App = {
    boot, store, toast, haptic, openSheet, closeSheet, shiftType, shiftSpan, show, nayroLogo, openTetris, breakPresence, toggleBreak,
    nextAlarm, dueAlarm, getSyncPayload, applySyncPayload, mergeSync, setAccountStatus, exportAlarmIcs,
    _setAlarm: on => { setAlarmOn(!!on, false); },
    _tickAlarm(now) {
      if (!alarm.on) return null;
      const due = dueAlarm(now instanceof Date ? now : new Date(now));
      return due ? fireAlarm(due) : null;
    }
  };
})();
