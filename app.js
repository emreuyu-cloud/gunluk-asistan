/* Günlük Asistan, iskelet + Bugün + Vardiya + Mola + Ayarlar */
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
    down: '<svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 21h16"/></svg>'
  };

  // ---------- yardımcılar ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
  };
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

  function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('on'), 1800); }
  function haptic() { try { navigator.vibrate && navigator.vibrate(10); } catch (e) {} }
  function openSheet(html, onMount) { $('#sheet-body').innerHTML = html; $('#sheet').classList.add('on'); $('#sheet-backdrop').classList.add('on'); onMount && onMount($('#sheet-body')); }
  function closeSheet() { $('#sheet').classList.remove('on'); $('#sheet-backdrop').classList.remove('on'); }

  // ---------- veri ----------
  const DEF = { times: { Sabah: ['06:30', '14:30'], Akşam: ['14:30', '22:30'], Gece: ['22:30', '06:30'] }, breakMin: 60, rotation: { seq: ['Sabah','Sabah','Akşam','Akşam','Gece','Gece','İzin','İzin'], start: '2026-09-01' } };
  let S = Object.assign({}, DEF, store.get('settings', {}));
  S.times = Object.assign({}, DEF.times, S.times || {});
  if (!S.v || S.v < 2) {
    const OLD = { Sabah: ['08:00', '16:00'], Akşam: ['16:00', '00:00'], Gece: ['00:00', '08:00'] };
    for (const k in OLD) if (S.times[k] && S.times[k][0] === OLD[k][0] && S.times[k][1] === OLD[k][1]) S.times[k] = DEF.times[k].slice();
    if (!S.rotation) S.rotation = DEF.rotation;
    S.v = 2; store.set('settings', S);
  }
  let overrides = store.get('overrides', {});
  let breaks = store.get('breaks', []);
  let active = store.get('activeBreak', null);
  const save = () => { store.set('settings', S); store.set('overrides', overrides); store.set('breaks', breaks); store.set('activeBreak', active); };

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
  function breakTotal(dayStr) {
    let t = breaks.filter(x => ymd(new Date(x.b)) === dayStr).reduce((s, x) => s + (x.s - x.b), 0);
    if (active && ymd(new Date(active)) === dayStr) t += Date.now() - active;
    return t;
  }
  function toggleBreak() {
    haptic();
    if (active) { breaks.push({ b: active, s: Date.now() }); active = null; toast('Mola bitti'); }
    else { active = Date.now(); toast('Mola başladı'); }
    breaks = breaks.filter(x => x.b > Date.now() - 60 * 864e5);
    save(); renderAll();
  }

  // ---------- BUGÜN ----------
  function renderBugun() {
    const now = new Date(), today = ymd(now), h = now.getHours();
    const greet = h < 6 ? 'İyi geceler' : h < 12 ? 'Günaydın' : h < 18 ? 'İyi günler' : 'İyi akşamlar';
    const cur = currentShift(now), sp = shiftSpan(today), nx = nextShift(now);
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
    const used = breakTotal(today), allow = S.breakMin * 6e4;
    let week = '';
    for (let i = 1; i <= 7; i++) {
      const d = addDays(now, i), s = shiftSpan(ymd(d)), t = s.type || 'yok';
      week += `<div class="cell"><div class="dot ${s.type ? 'c-' + s.type : ''}" style="${s.type ? '' : 'background:var(--muted)'}">${ICON[t]}</div>
        <div class="cell-main">${i === 1 ? 'Yarın' : WD_LONG[d.getDay()]}<div class="cell-sub">${d.getDate()} ${MONTHS[d.getMonth()]}</div></div>
        <div class="cell-detail">${s.type ? (s.start ? s.type + ' · ' + s.b + '-' + s.e : 'İzin') : '-'}</div></div>`;
    }
    $('#screen-bugun').innerHTML = `
      <div class="subtitle" style="margin:8px 0 0">${longDate(now)}</div>
      <h1 class="large-title" style="margin-top:2px">${greet}</h1>
      ${hero}
      <div class="tiles">
        <div class="tile"><div class="k">Bugünkü mola</div><div class="v">${dur(used / 6e4)}</div></div>
        <div class="tile"><div class="k">${used > allow ? 'Aşılan süre' : 'Kalan mola'}</div><div class="v" style="color:${used > allow ? 'var(--red)' : 'var(--green)'}">${dur(Math.abs(allow - used) / 6e4)}</div></div>
      </div>
      <div style="margin-top:10px"><button class="btn ${active ? 'danger' : 'green'}" data-act="break">${active ? ICON.stop + ' Molayı bitir · ' + mmss(Date.now() - active) : ICON.play + ' Molaya başla'}</button></div>
      ${nx && !cur ? '' : ''}
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
      cells += `<div class="cal-day ${d.getMonth() !== m ? 'out' : ''} ${ds === today ? 'today' : ''}" data-day="${ds}"><span>${d.getDate()}</span><i class="${t ? 'c-' + t : ''}"></i></div>`;
    }
    let work = 0, min = 0, off = 0, cnt = { Sabah: 0, Akşam: 0, Gece: 0 };
    for (let d = 1; d <= days; d++) { const sp = shiftSpan(ymd(new Date(y, m, d))); if (sp.start) { work++; min += sp.min; cnt[sp.type]++; } else if (sp.type === 'İzin') off++; }
    const r = S.rotation;
    const rotTxt = r && r.seq && r.seq.length ? compress(r.seq) : 'Ayarlanmadı';
    $('#screen-vardiya').innerHTML = `
      <h1 class="large-title">Vardiya</h1>
      <div class="cal">
        <div class="cal-head" style="padding:4px 8px 6px"><h3>${MONTHS[m]} ${y}</h3>
          <div class="row" style="flex:none;gap:8px"><button class="icon-btn" data-act="prev">${ICON.left}</button><button class="icon-btn" data-act="next">${ICON.right}</button></div></div>
        <div class="cal-grid">${cells}</div>
        <div class="legend">${TYPES.map(t => `<span><b class="c-${t}"></b>${t}</span>`).join('')}</div>
      </div>
      <div class="section-foot" style="text-align:center">Bir güne dokunarak o günü tek seferlik değiştirebilirsin.</div>
      <div class="section-title">Dönen düzen</div>
      <div class="group"><div class="cell tap chev" data-act="rotation"><div class="dot" style="background:var(--accent)">${ICON.repeat}</div>
        <div class="cell-main">Vardiya düzeni<div class="cell-sub">${esc(rotTxt)}</div></div></div></div>
      <div class="section-title">${MONTHS[m]} özeti</div>
      <div class="tiles" style="margin-top:0">
        <div class="tile"><div class="k">Çalışma saati</div><div class="v">${Math.round(min / 60)} sa</div></div>
        <div class="tile"><div class="k">Çalışma günü</div><div class="v">${work}</div></div>
        <div class="tile"><div class="k">İzin günü</div><div class="v">${off}</div></div>
        <div class="tile"><div class="k">Sabah / Akşam / Gece</div><div class="v">${cnt.Sabah} / ${cnt.Akşam} / ${cnt.Gece}</div></div>
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
    const today = ymd(new Date()), used = breakTotal(today), allow = S.breakMin * 6e4;
    const C = 2 * Math.PI * 104, frac = Math.min(1, used / allow), over = used > allow;
    const list = breaks.filter(x => ymd(new Date(x.b)) === today).sort((a, b) => b.b - a.b);
    let hist = '';
    for (let i = 1; i <= 6; i++) {
      const d = addDays(new Date(), -i), t = breakTotal(ymd(d));
      if (t > 0) hist += `<div class="cell"><div class="cell-main">${WD_LONG[d.getDay()]}<div class="cell-sub">${d.getDate()} ${MONTHS[d.getMonth()]}</div></div><div class="cell-detail" style="${t > allow ? 'color:var(--red)' : ''}">${dur(t / 6e4)}</div></div>`;
    }
    $('#screen-mola').innerHTML = `
      <h1 class="large-title">Mola</h1>
      <div style="text-align:center;min-height:26px">${active ? `<span class="pill live">Moladasın · ${hm(active)}'den beri</span>` : ''}</div>
      <div class="ring-wrap"><svg viewBox="0 0 240 240"><circle class="ring-bg" cx="120" cy="120" r="104" fill="none"/>
        <circle class="ring-fg" id="ringfg" cx="120" cy="120" r="104" fill="none" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - frac)}" style="stroke:${over ? 'var(--red)' : frac > .8 ? 'var(--orange)' : 'var(--green)'}"/></svg>
        <div class="ring-center"><div class="time" id="ringtime">${active ? mmss(Date.now() - active) : mmss(over ? used - allow : allow - used)}</div>
        <div class="cap">${active ? 'bu mola' : over ? 'hakkı aştın' : 'kalan mola hakkı'}</div></div></div>
      <button class="btn ${active ? 'danger' : 'green'}" data-act="break">${active ? ICON.stop + ' Molayı bitir' : ICON.play + ' Molaya başla'}</button>
      <div class="tiles">
        <div class="tile"><div class="k">Bugün toplam</div><div class="v">${dur(used / 6e4)}</div></div>
        <div class="tile"><div class="k">Günlük hak</div><div class="v">${dur(S.breakMin)}</div></div>
      </div>
      <div class="section-title">Bugünkü molalar</div>
      <div class="group">${(active ? `<div class="cell"><div class="dot" style="background:var(--green)">${ICON.coffee}</div><div class="cell-main">${hm(active)} - şimdi</div><div class="cell-detail">sürüyor</div></div>` : '') +
        (list.map((x, i) => `<div class="cell"><div class="dot" style="background:var(--teal)">${ICON.coffee}</div><div class="cell-main">${hm(x.b)} - ${hm(x.s)}</div><div class="cell-detail">${dur((x.s - x.b) / 6e4)}</div></div>`).join('') ||
        (active ? '' : '<div class="empty">Bugün henüz mola vermedin.</div>'))}</div>
      ${hist ? `<div class="section-title">Son günler</div><div class="group">${hist}</div>` : ''}
      ${list.length ? `<div style="margin-top:16px"><button class="btn plain danger" data-act="clearToday">Bugünün molalarını sil</button></div>` : ''}`;
  }

  // ---------- AYARLAR ----------
  function renderAyarlar() {
    const t = S.times;
    $('#screen-ayarlar').innerHTML = `
      <h1 class="large-title">Ayarlar</h1>
      <div class="section-title" style="margin-top:8px">Vardiya saatleri</div>
      <div class="group">${['Sabah', 'Akşam', 'Gece'].map(k => `<div class="cell"><div class="dot c-${k}">${ICON[k]}</div><div class="cell-main">${k}<div class="time-pair"><input type="time" data-time="${k}-0" value="${t[k][0]}"><span class="cell-detail">-</span><input type="time" data-time="${k}-1" value="${t[k][1]}"></div></div></div>`).join('')}</div>
      <div class="section-foot">Bitiş başlangıçtan önceyse vardiya ertesi güne geçer, örneğin 20:00 - 08:00.</div>
      <div class="section-title">Mola</div>
      <div class="group"><div class="cell"><div class="dot" style="background:var(--green)">${ICON.clock}</div><div class="cell-main">Günlük mola hakkı</div>
        <button class="icon-btn" data-act="bm-">−</button><span style="min-width:62px;text-align:center;font-variant-numeric:tabular-nums">${S.breakMin} dk</span><button class="icon-btn" data-act="bm+">+</button></div></div>
      <div class="section-title">Veriler</div>
      <div class="group">
        <div class="cell tap" data-act="export"><div class="dot" style="background:var(--accent)">${ICON.down}</div><div class="cell-main">Yedeği indir</div></div>
        <div class="cell tap" data-act="reset"><div class="dot" style="background:var(--red)">${ICON.trash}</div><div class="cell-main" style="color:var(--red)">Tüm verileri sil</div></div>
      </div>
      <div class="section-foot">Verilerin yalnızca bu telefonda saklanır, hiçbir yere gönderilmez.</div>
      <div class="empty" style="padding-top:36px">Günlük Asistan 3.0<br>Nayro ve nayronayt</div>`;
    $('#screen-ayarlar').querySelectorAll('[data-time]').forEach(inp => inp.onchange = () => {
      const [k, i] = inp.dataset.time.split('-'); if (!inp.value) return; S.times[k][+i] = inp.value; save(); renderAll(); toast('Kaydedildi');
    });
  }

  // ---------- olaylar ----------
  function onClick(e) {
    const day = e.target.closest('[data-day]'); if (day) return daySheet(day.dataset.day);
    const a = e.target.closest('[data-act]'); if (!a) return;
    switch (a.dataset.act) {
      case 'break': return toggleBreak();
      case 'prev': calMonth.setMonth(calMonth.getMonth() - 1); haptic(); return renderVardiya();
      case 'next': calMonth.setMonth(calMonth.getMonth() + 1); haptic(); return renderVardiya();
      case 'rotation': return rotationSheet();
      case 'bm-': S.breakMin = Math.max(5, S.breakMin - 5); save(); haptic(); return renderAll();
      case 'bm+': S.breakMin = Math.min(240, S.breakMin + 5); save(); haptic(); return renderAll();
      case 'clearToday': if (confirm('Bugünün molaları silinsin mi?')) { const t = ymd(new Date()); breaks = breaks.filter(x => ymd(new Date(x.b)) !== t); save(); renderAll(); } return;
      case 'export': {
        const data = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); data[k] = localStorage.getItem(k); }
        const a2 = document.createElement('a'); a2.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
        a2.download = 'gunluk-asistan-yedek-' + ymd(new Date()) + '.json'; a2.click(); return;
      }
      case 'reset': if (confirm('Vardiya, mola ve çeviri verilerinin hepsi silinsin mi? Bu geri alınamaz.')) { localStorage.clear(); location.reload(); } return;
    }
  }

  function renderAll() { renderBugun(); renderVardiya(); renderMola(); renderAyarlar(); }

  function show(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === 'screen-' + name));
    document.querySelectorAll('.tabbar button').forEach(b => b.classList.toggle('active', b.dataset.screen === name));
    store.set('lastTab', name);
  }

  function boot() {
    document.querySelectorAll('.tabbar button').forEach(b => b.onclick = () => { haptic(); show(b.dataset.screen); });
    document.addEventListener('click', onClick);
    $('#sheet-backdrop').onclick = closeSheet;
    renderAll();
    const root = $('#screen-ceviri');
    if (typeof window.initCeviri === 'function') { try { window.initCeviri(root); } catch (e) { console.error(e); } }
    else root.innerHTML = '<h1 class="large-title">Çeviri</h1><div class="empty">Çeviri ekranı yükleniyor...</div>';
    show(store.get('lastTab', 'bugun'));
    setInterval(() => {
      if (active) {
        const t = $('#ringtime'); if (t) t.textContent = mmss(Date.now() - active);
        const b = $('#screen-bugun [data-act=break]'); if (b) b.innerHTML = ICON.stop + ' Molayı bitir · ' + mmss(Date.now() - active);
      }
    }, 1000);
    setInterval(() => { if (!$('#sheet').classList.contains('on')) { renderBugun(); renderMola(); } }, 30000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) renderAll(); });
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  window.App = { boot, store, toast, haptic, openSheet, closeSheet, shiftType, shiftSpan };
})();
