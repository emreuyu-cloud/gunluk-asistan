/* Çeviri ekranı - nayronayt. Sözleşme: DESIGN.md -> window.initCeviri(root) */
(function () {
  'use strict';
  var A = window.App || {};
  var store = A.store || {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { localStorage.setItem(k, JSON.stringify(v)); }
  };
  function toast(t) { (window.App && App.toast) ? App.toast(t) : console.log(t); }
  function haptic() { if (window.App && App.haptic) App.haptic(); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  var ICON = {
    swap: '<path d="M7 7h12l-3-3M17 17H5l3 3"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
    speak: '<path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
    clear: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    chev: '<path d="m9 6 6 6-6 6"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'
  };
  function svg(n, fill) { return '<svg width="22" height="22" viewBox="0 0 24 24" fill="' + (fill ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[n] + '</svg>'; }

  // İş yerinde sık lazım olan hazır kalıplar (İngilizce / Türkçe)
  var PHRASES = [
    { cat: 'Vardiya', items: [
      ['What time does my shift start?', 'Vardiyam saat kaçta başlıyor?'],
      ['Can I swap shifts with someone?', 'Biriyle vardiya değiştirebilir miyim?'],
      ['I am working the night shift this week.', 'Bu hafta gece vardiyasındayım.'],
      ['I will be about ten minutes late.', 'Yaklaşık on dakika geç kalacağım.'],
      ['Who is covering the next shift?', 'Sonraki vardiyayı kim devralıyor?']
    ]},
    { cat: 'Mola', items: [
      ['I am taking my break now.', 'Şimdi molaya çıkıyorum.'],
      ['I will be back in fifteen minutes.', 'On beş dakika içinde dönerim.'],
      ['When is my lunch break?', 'Öğle molam ne zaman?'],
      ['Can you cover for me during my break?', 'Molamda yerime bakabilir misin?']
    ]},
    { cat: 'İş yeri', items: [
      ['Could you repeat that, please?', 'Tekrar eder misiniz, lütfen?'],
      ['Could you speak a little slower?', 'Biraz daha yavaş konuşabilir misiniz?'],
      ['I do not understand. Can you show me?', 'Anlamadım. Bana gösterebilir misiniz?'],
      ['Where should I put this?', 'Bunu nereye koymalıyım?'],
      ['The machine is not working.', 'Makine çalışmıyor.'],
      ['I need to talk to my supervisor.', 'Amirimle konuşmam gerekiyor.']
    ]},
    { cat: 'İzin ve sağlık', items: [
      ['I am sick and cannot come in today.', 'Hastayım, bugün gelemiyorum.'],
      ['I would like to request a day off.', 'Bir gün izin istemek istiyorum.'],
      ['I have a doctor appointment.', 'Doktor randevum var.']
    ]}
  ];

  var K = { dir: 'ceviri.yon', hist: 'ceviri.gecmis', fav: 'ceviri.favoriler', draft: 'ceviri.taslak' };
  var LANG = { en: 'İngilizce', tr: 'Türkçe' };

  var CSS = '' +
    '#screen-ceviri .cv-langbar{display:flex;align-items:center;gap:8px;margin:8px 0 12px}' +
    '#screen-ceviri .cv-langbar .cv-lang{flex:1;text-align:center;font-weight:600;font-size:17px;padding:10px 0;border-radius:12px;background:var(--card)}' +
    '#screen-ceviri .cv-box{background:var(--card);border-radius:12px;padding:12px 14px;position:relative}' +
    '#screen-ceviri .cv-box textarea{width:100%;border:0;outline:0;resize:none;background:transparent;color:var(--text);font:inherit;font-size:19px;line-height:1.35;min-height:96px;padding:0 28px 0 0}' +
    '#screen-ceviri .cv-clear{position:absolute;top:8px;right:8px;border:0;background:none;color:var(--muted);padding:4px}' +
    '#screen-ceviri .cv-meta{display:flex;justify-content:space-between;align-items:center;color:var(--muted);font-size:13px;margin-top:6px}' +
    '#screen-ceviri .cv-result{margin-top:12px;background:var(--card);border-radius:12px;padding:14px;border-left:4px solid var(--accent);min-height:64px}' +
    '#screen-ceviri .cv-result .cv-out{font-size:21px;line-height:1.35;font-weight:500;white-space:pre-wrap;word-break:break-word}' +
    '#screen-ceviri .cv-result .cv-ph{color:var(--muted);font-size:16px}' +
    '#screen-ceviri .cv-actions{display:flex;gap:8px;margin-top:10px}' +
    '#screen-ceviri .cv-actions .icon-btn.on{color:var(--orange)}' +
    '#screen-ceviri .cv-loading{display:inline-block;width:18px;height:18px;border:2px solid var(--sep);border-top-color:var(--accent);border-radius:50%;animation:cvspin .8s linear infinite;vertical-align:-3px;margin-right:8px}' +
    '@keyframes cvspin{to{transform:rotate(360deg)}}' +
    '#screen-ceviri .cell.cv-item{cursor:pointer;align-items:flex-start;flex-direction:column;gap:2px}' +
    '#screen-ceviri .cv-item .cv-src{font-size:16px}' +
    '#screen-ceviri .cv-item .cv-dst{font-size:14px;color:var(--muted)}' +
    '#screen-ceviri .cv-row{display:flex;align-items:center;gap:8px;width:100%}' +
    '#screen-ceviri .cv-row .cv-txt{flex:1;min-width:0}' +
    '#screen-ceviri .cv-del{border:0;background:none;color:var(--muted);padding:4px}' +
    '#screen-ceviri details.cv-cat summary{list-style:none;display:flex;justify-content:space-between;align-items:center;cursor:pointer}' +
    '#screen-ceviri details.cv-cat summary::-webkit-details-marker{display:none}' +
    '#screen-ceviri details.cv-cat summary svg{transition:transform .2s;color:var(--muted)}' +
    '#screen-ceviri details.cv-cat[open] summary svg{transform:rotate(90deg)}' +
    '#screen-ceviri .cv-empty{color:var(--muted);font-size:15px;padding:12px 16px}' +
    '#screen-ceviri .cv-link{color:var(--accent);text-decoration:none;display:inline-flex;align-items:center;gap:4px}';

  window.initCeviri = function (root) {
    if (!root || root.dataset.cvReady) return;
    root.dataset.cvReady = '1';
    if (!document.getElementById('cv-style')) { var st = document.createElement('style'); st.id = 'cv-style'; st.textContent = CSS; document.head.appendChild(st); }

    var dir = store.get(K.dir, 'en|tr');
    var hist = store.get(K.hist, []);
    var favs = store.get(K.fav, []);
    var last = null, busy = false, seq = 0;

    root.innerHTML =
      '<h1 class="large-title">Çeviri</h1>' +
      '<div class="cv-langbar"><div class="cv-lang" id="cv-from"></div>' +
      '<button class="icon-btn" id="cv-swap" aria-label="Dilleri değiştir">' + svg('swap') + '</button>' +
      '<div class="cv-lang" id="cv-to"></div></div>' +
      '<div class="cv-box"><textarea id="cv-in" rows="3" enterkeyhint="go" autocapitalize="sentences" placeholder="Metni yaz veya yapıştır"></textarea>' +
      '<button class="cv-clear" id="cv-clear" aria-label="Temizle" hidden>' + svg('clear') + '</button>' +
      '<div class="cv-meta"><span id="cv-count">0 / 1000</span></div></div>' +
      '<button class="btn" id="cv-go" style="margin-top:12px">Çevir</button>' +
      '<div class="cv-result" id="cv-result"><div class="cv-ph">Çeviri burada görünecek.</div></div>' +
      '<div class="section-title" style="margin-top:24px">Favoriler</div><div class="group" id="cv-favs"></div>' +
      '<div class="section-title" style="margin-top:24px">İş yerinde hazır kalıplar</div><div class="group" id="cv-phr"></div>' +
      '<div class="section-title" style="margin-top:24px;display:flex;justify-content:space-between"><span>Son çeviriler</span><button class="cv-del" id="cv-hclear" style="font-size:13px;color:var(--accent)">Temizle</button></div>' +
      '<div class="group" id="cv-hist"></div><div style="height:24px"></div>';

    var $ = function (id) { return root.querySelector('#' + id); };
    var inp = $('cv-in'), out = $('cv-result');
    inp.value = store.get(K.draft, '');

    function langs() { return dir.split('|'); }
    function drawLangs() { var l = langs(); $('cv-from').textContent = LANG[l[0]]; $('cv-to').textContent = LANG[l[1]]; inp.lang = l[0]; }
    function onInput() {
      if (inp.value.length > 1000) inp.value = inp.value.slice(0, 1000);
      $('cv-count').textContent = inp.value.length + ' / 1000';
      $('cv-clear').hidden = !inp.value;
      inp.style.height = 'auto'; inp.style.height = Math.max(96, inp.scrollHeight) + 'px';
      store.set(K.draft, inp.value);
    }
    function isFav(q, t) { return favs.some(function (f) { return f.q === q && f.t === t; }); }

    function showResult(r) {
      last = r;
      var fav = isFav(r.q, r.t);
      out.innerHTML = '<div class="cv-out" lang="' + r.tl + '">' + esc(r.t) + '</div>' +
        '<div class="cv-actions">' +
        '<button class="icon-btn" data-a="speak" aria-label="Sesli oku">' + svg('speak') + '</button>' +
        '<button class="icon-btn" data-a="copy" aria-label="Kopyala">' + svg('copy') + '</button>' +
        '<button class="icon-btn' + (fav ? ' on' : '') + '" data-a="fav" aria-label="Favorilere ekle">' + svg('star', fav) + '</button></div>';
    }

    function fetchJSON(url, ms) {
      var c = window.AbortController ? new AbortController() : null;
      var t = setTimeout(function () { if (c) c.abort(); }, ms || 8000);
      return fetch(url, c ? { signal: c.signal } : {}).then(function (r) { clearTimeout(t); if (!r.ok) throw new Error(r.status); return r.json(); });
    }
    function translate(q, sl, tl) {
      return fetchJSON('https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=' + sl + '&tl=' + tl + '&q=' + encodeURIComponent(q))
        .then(function (j) { var t = (j && j[0] || []).map(function (x) { return x[0]; }).join(''); if (!t) throw 0; return t; })
        .catch(function () {
          return fetchJSON('https://api.mymemory.translated.net/get?q=' + encodeURIComponent(q) + '&langpair=' + sl + '|' + tl)
            .then(function (j) { var t = j && j.responseData && j.responseData.translatedText; if (!t || /MYMEMORY WARNING|QUERY LENGTH/i.test(t)) throw 0; return t; });
        });
    }
    function offlineLookup(q, sl) {
      var n = q.trim().toLowerCase().replace(/[.?!]+$/, '');
      var all = favs.map(function (f) { return [f.q, f.t, f.sl]; }).concat(hist.map(function (h) { return [h.q, h.t, h.sl]; }));
      PHRASES.forEach(function (c) { c.items.forEach(function (p) { all.push([p[0], p[1], 'en'], [p[1], p[0], 'tr']); }); });
      for (var i = 0; i < all.length; i++) if (all[i][2] === sl && all[i][0].trim().toLowerCase().replace(/[.?!]+$/, '') === n) return all[i][1];
      return null;
    }

    function go() {
      var q = inp.value.trim(); if (!q || busy) return;
      inp.blur(); haptic();
      var l = langs(), sl = l[0], tl = l[1], my = ++seq; busy = true;
      $('cv-go').disabled = true;
      out.innerHTML = '<div class="cv-ph"><span class="cv-loading"></span>Çevriliyor…</div>';
      translate(q, sl, tl).then(function (t) {
        if (my !== seq) return;
        var r = { q: q, t: t, sl: sl, tl: tl, at: Date.now() };
        showResult(r);
        hist = hist.filter(function (h) { return !(h.q === q && h.sl === sl); }); hist.unshift(r); hist = hist.slice(0, 30);
        store.set(K.hist, hist); drawHist();
      }).catch(function () {
        if (my !== seq) return;
        var off = offlineLookup(q, sl);
        if (off) { showResult({ q: q, t: off, sl: sl, tl: tl }); toast('İnternet yok, kayıtlı çeviri gösteriliyor'); return; }
        out.innerHTML = '<div class="cv-ph">' + (navigator.onLine === false ? 'İnternet bağlantısı yok. ' : 'Çeviri şu an yapılamadı. ') +
          '<a class="cv-link" target="_blank" rel="noopener" href="https://translate.google.com/?sl=' + sl + '&tl=' + tl + '&text=' + encodeURIComponent(q) + '">Google Çeviri\'de aç ' + svg('ext') + '</a></div>';
      }).then(function () { if (my === seq) { busy = false; $('cv-go').disabled = false; } });
    }

    function speak(text, lang) {
      if (!('speechSynthesis' in window)) return toast('Sesli okuma desteklenmiyor');
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text); u.lang = lang === 'tr' ? 'tr-TR' : 'en-US'; u.rate = 0.95;
      var v = speechSynthesis.getVoices().filter(function (x) { return x.lang && x.lang.replace('_', '-').indexOf(u.lang.slice(0, 2)) === 0; })[0];
      if (v) u.voice = v;
      speechSynthesis.speak(u);
    }
    function copy(text) {
      var done = function () { toast('Kopyalandı'); haptic(); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
      function fallback() { var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) { toast('Kopyalanamadı'); } ta.remove(); }
    }
    function toggleFav(r) {
      if (isFav(r.q, r.t)) { favs = favs.filter(function (f) { return !(f.q === r.q && f.t === r.t); }); toast('Favorilerden çıkarıldı'); }
      else { favs.unshift({ q: r.q, t: r.t, sl: r.sl, tl: r.tl }); toast('Favorilere eklendi'); }
      store.set(K.fav, favs); haptic(); drawFavs(); if (last) showResult(last);
    }
    function useItem(q, t, sl, tl) {
      dir = sl + '|' + tl; store.set(K.dir, dir); drawLangs();
      inp.value = q; onInput(); showResult({ q: q, t: t, sl: sl, tl: tl });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function itemHTML(i, q, t, del) {
      return '<div class="cell cv-item" data-i="' + i + '"><div class="cv-row"><div class="cv-txt"><div class="cv-src">' + esc(q) + '</div><div class="cv-dst">' + esc(t) + '</div></div>' +
        (del ? '<button class="cv-del" data-del="' + i + '" aria-label="Sil">' + svg('trash') + '</button>' : '') + '</div></div>';
    }
    function drawFavs() {
      $('cv-favs').innerHTML = favs.length ? favs.map(function (f, i) { return itemHTML(i, f.q, f.t, true); }).join('') :
        '<div class="cv-empty">Bir çevirideki yıldıza dokunarak buraya ekle.</div>';
    }
    function drawHist() {
      $('cv-hist').innerHTML = hist.length ? hist.map(function (h, i) { return itemHTML(i, h.q, h.t, true); }).join('') :
        '<div class="cv-empty">Henüz çeviri yok.</div>';
      $('cv-hclear').hidden = !hist.length;
    }
    function drawPhrases() {
      $('cv-phr').innerHTML = PHRASES.map(function (c, ci) {
        return '<details class="cv-cat"><summary class="cell"><span>' + esc(c.cat) + '</span><span class="cell-detail" style="display:flex;align-items:center;gap:4px">' + c.items.length + svg('chev') + '</span></summary>' +
          c.items.map(function (p, pi) {
            return '<div class="cell cv-item" data-p="' + ci + ',' + pi + '"><div class="cv-row"><div class="cv-txt"><div class="cv-src" lang="en">' + esc(p[0]) + '</div><div class="cv-dst">' + esc(p[1]) + '</div></div>' +
              '<button class="cv-del" data-say="' + ci + ',' + pi + '" aria-label="Sesli oku">' + svg('speak') + '</button></div></div>';
          }).join('') + '</details>';
      }).join('');
    }

    // Olaylar
    inp.addEventListener('input', onInput);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); go(); } });
    $('cv-go').addEventListener('click', go);
    $('cv-clear').addEventListener('click', function () { inp.value = ''; onInput(); seq++; busy = false; $('cv-go').disabled = false; last = null; out.innerHTML = '<div class="cv-ph">Çeviri burada görünecek.</div>'; inp.focus(); });
    $('cv-swap').addEventListener('click', function () {
      var l = langs(); dir = l[1] + '|' + l[0]; store.set(K.dir, dir); drawLangs(); haptic();
      if (last) { inp.value = last.t; onInput(); last = null; out.innerHTML = '<div class="cv-ph">Çeviri burada görünecek.</div>'; }
    });
    out.addEventListener('click', function (e) {
      var b = e.target.closest('[data-a]'); if (!b || !last) return;
      if (b.dataset.a === 'speak') speak(last.t, last.tl);
      if (b.dataset.a === 'copy') copy(last.t);
      if (b.dataset.a === 'fav') toggleFav(last);
    });
    $('cv-favs').addEventListener('click', function (e) {
      var d = e.target.closest('[data-del]');
      if (d) { e.stopPropagation(); favs.splice(+d.dataset.del, 1); store.set(K.fav, favs); drawFavs(); if (last) showResult(last); return; }
      var c = e.target.closest('[data-i]'); if (c) { var f = favs[+c.dataset.i]; useItem(f.q, f.t, f.sl, f.tl); }
    });
    $('cv-hist').addEventListener('click', function (e) {
      var d = e.target.closest('[data-del]');
      if (d) { e.stopPropagation(); hist.splice(+d.dataset.del, 1); store.set(K.hist, hist); drawHist(); return; }
      var c = e.target.closest('[data-i]'); if (c) { var h = hist[+c.dataset.i]; useItem(h.q, h.t, h.sl, h.tl); }
    });
    $('cv-hclear').addEventListener('click', function () { if (confirm('Son çeviriler silinsin mi?')) { hist = []; store.set(K.hist, hist); drawHist(); } });
    $('cv-phr').addEventListener('click', function (e) {
      var s = e.target.closest('[data-say]');
      if (s) { e.stopPropagation(); var ij = s.dataset.say.split(','); speak(PHRASES[ij[0]].items[ij[1]][0], 'en'); return; }
      var c = e.target.closest('[data-p]'); if (c) { var p = c.dataset.p.split(','), it = PHRASES[p[0]].items[p[1]]; useItem(it[0], it[1], 'en', 'tr'); }
    });
    if ('speechSynthesis' in window) speechSynthesis.getVoices();

    drawLangs(); onInput(); drawFavs(); drawHist(); drawPhrases();
  };

  // app.js çağırmazsa kendi başına da açılsın
  function auto() { var r = document.getElementById('screen-ceviri'); if (r && !r.dataset.cvReady && !window.__cvWaitApp) window.initCeviri(r); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(auto, 0); }); else setTimeout(auto, 0);
})();
