/* Hesap: Firebase yalnızca bu dosya yüklenince ve yapılandırma doluysa indirilir. */
(function () {
  'use strict';
  const FB = 'https://www.gstatic.com/firebasejs/13.0.0/';
  let mods = null, auth = null, user = null, pushTimer = null, pushGen = 0, syncing = null, redirectChecked = false;

  function configReady(cfg) {
    if (!cfg || typeof cfg !== 'object') return false;
    return ['apiKey', 'authDomain', 'projectId', 'appId'].every(k => {
      const v = cfg[k];
      return typeof v === 'string' && v.trim() && !/YOUR_|BURAYA|xxx|placeholder/i.test(v);
    });
  }
  function loadConfig() {
    return new Promise(resolve => {
      if (window.GA_FIREBASE_CONFIG) return resolve(window.GA_FIREBASE_CONFIG);
      const s = document.createElement('script');
      s.src = 'firebase-config.js';
      s.onload = () => resolve(window.GA_FIREBASE_CONFIG || null);
      s.onerror = () => resolve(null);
      document.head.appendChild(s);
    });
  }
  function authTr(e) {
    const c = (e && e.code) || '';
    const map = {
      'auth/invalid-email': 'E-posta geçersiz',
      'auth/missing-email': 'E-postayı yaz',
      'auth/user-not-found': 'Bu e-posta kayıtlı değil',
      'auth/wrong-password': 'E-posta veya şifre hatalı',
      'auth/invalid-credential': 'E-posta veya şifre hatalı',
      'auth/email-already-in-use': 'Bu e-posta zaten kayıtlı',
      'auth/weak-password': 'Şifre en az 6 karakter olmalı',
      'auth/too-many-requests': 'Çok fazla deneme. Biraz sonra tekrar dene',
      'auth/network-request-failed': 'İnternet bağlantısı gerekli',
      'auth/popup-closed-by-user': 'Giriş penceresi kapatıldı',
      'auth/cancelled-popup-request': 'Giriş penceresi kapatıldı',
      'auth/popup-blocked': 'Giriş penceresi engellendi',
      'auth/operation-not-supported-in-this-environment': 'Google penceresi burada açılamadı. E-posta ile giriş yap.',
      'auth/unauthorized-domain': 'Bu adres Firebase yetkili alan adlarında yok'
    };
    return map[c] || 'Giriş yapılamadı';
  }
  function standalone() {
    return window.navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
  }
  function remember(u) {
    try {
      if (u) App.store.set('gaUser', { uid: u.uid, email: u.email || '' });
      else localStorage.removeItem('gaUser');
    } catch (e) {}
  }
  function statusLine(u, extra) {
    const who = (u && (u.email || 'Hesap')) || '';
    App.setAccountStatus(who ? who + (extra ? ' · ' + extra : '') : 'Giriş yap, verilerini eşitle');
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  async function ensureFirebase() {
    const cfg = await loadConfig();
    if (!configReady(cfg)) return null;
    if (mods) return cfg;
    if (ensureFirebase.pending) return ensureFirebase.pending;
    window.__gaFirebaseLoaded = true;
    ensureFirebase.pending = (async () => {
    const [{ initializeApp }, authMod, fs] = await Promise.all([
      import(FB + 'firebase-app.js'),
      import(FB + 'firebase-auth.js'),
      import(FB + 'firebase-firestore-lite.js')
    ]);
    const app = initializeApp(cfg);
    auth = authMod.getAuth(app);
    const db = fs.getFirestore(app);
    mods = { authMod, fs, db };
    authMod.onAuthStateChanged(auth, u => {
      user = u || null;
      if (!u) { statusLine(null); return; }
      statusLine(u, 'eşitleniyor');
      remember(u);
      syncUser(u);
    });
    if (!redirectChecked) {
      redirectChecked = true;
      try {
        const res = await authMod.getRedirectResult(auth);
        try { sessionStorage.removeItem('ga-auth-redirect'); } catch (e) {}
        if (res && res.user) App.toast('Giriş yapıldı');
      } catch (e) {
        try { sessionStorage.removeItem('ga-auth-redirect'); } catch (e2) {}
        if (e && e.code && e.code !== 'auth/no-auth-event') App.toast(authTr(e));
      }
    }
    await new Promise(resolve => {
      const unsub = authMod.onAuthStateChanged(auth, () => { unsub(); resolve(); });
    });
    return cfg;
    })();
    try { return await ensureFirebase.pending; } finally { ensureFirebase.pending = null; }
  }

  async function syncUser(u) {
    if (syncing) return syncing;
    syncing = (async () => {
      const ref = mods.fs.doc(mods.db, 'users', u.uid);
      let remote = null;
      try {
        const snap = await mods.fs.getDoc(ref);
        if (snap.exists()) remote = snap.data();
      } catch (e) { statusLine(u, 'çevrimdışı'); return; }
      const local = App.getSyncPayload();
      const merged = remote ? App.mergeSync(local, remote) : Object.assign({}, local, { updatedAt: local.updatedAt || Date.now() });
      App.applySyncPayload(merged);
      try {
        await mods.fs.setDoc(ref, App.getSyncPayload());
        statusLine(u, 'eşitlendi');
      } catch (e) { statusLine(u, 'eşitlenemedi'); }
    })();
    try { await syncing; } finally { syncing = null; }
  }

  async function pushNow() {
    if (!user || !mods) return;
    const gen = ++pushGen;
    const payload = App.getSyncPayload();
    try {
      await mods.fs.setDoc(mods.fs.doc(mods.db, 'users', user.uid), payload);
      if (gen === pushGen) statusLine(user, 'eşitlendi');
      else pushNow();
    } catch (e) { if (gen === pushGen) statusLine(user, 'eşitlenemedi'); }
  }
  function push() {
    clearTimeout(pushTimer);
    pushTimer = setTimeout(pushNow, 500);
  }
  async function pull() {
    if (!user || !mods || syncing) return;
    try {
      const snap = await mods.fs.getDoc(mods.fs.doc(mods.db, 'users', user.uid));
      if (!snap.exists()) return pushNow();
      const data = snap.data() || {};
      const cur = App.getSyncPayload();
      if ((data.updatedAt || 0) > (cur.updatedAt || 0)) {
        const merged = App.mergeSync(cur, data);
        App.applySyncPayload(merged);
        if ((merged.updatedAt || 0) > (data.updatedAt || 0)) pushNow();
        else statusLine(user, 'eşitlendi');
      } else if ((cur.updatedAt || 0) > (data.updatedAt || 0)) pushNow();
    } catch (e) {}
  }

  function sheetUnconfigured() {
    App.openSheet(`<h3>Hesap</h3>
      <div class="empty" style="padding-top:8px">Hesap özelliği henüz kurulmadı</div>
      <div class="section-foot" style="text-align:center">firebase-config.js doldurulunca Google ve e-posta ile giriş açılır. Kurulum adımları depodaki KURULUM-HESAP.md dosyasında. Vardiya, mola ve alarm hesapsız çalışmaya devam eder.</div>`);
  }
  function sheetOffline() {
    App.openSheet(`<h3>Hesap</h3>
      <div class="empty" style="padding-top:8px">Hesap servisine şu an ulaşılamıyor</div>
      <div class="section-foot" style="text-align:center">İnternet gelince tekrar dene. Uygulama bu telefonda çalışmaya devam eder.</div>`);
  }
  function sheetSignedOut() {
    App.openSheet(`<h3>Hesap</h3>
      <div class="section-foot" style="margin-top:0;text-align:center">Giriş yapınca vardiya, izin, mola ve alarm bu hesabın altında diğer cihazlara eşitlenir. Telefondaki kayıt yerinde kalır.</div>
      <div class="stack">
        <button class="btn" type="button" id="acc-google">Google ile giriş</button>
        <button class="btn secondary" type="button" id="acc-email">E-posta ile giriş</button>
        <button class="btn secondary" type="button" id="acc-signup">Kayıt ol</button>
      </div>
      <div class="section-foot">iPhone'da ana ekrana eklenmiş uygulamada Google penceresi çoğu zaman açılmaz. E-posta ile giriş daha güvenilir.</div>`, root => {
      root.querySelector('#acc-google').onclick = google;
      root.querySelector('#acc-email').onclick = () => sheetEmail(false);
      root.querySelector('#acc-signup').onclick = () => sheetEmail(true);
    });
  }
  function sheetEmail(signup) {
    App.openSheet(`<h3>${signup ? 'Kayıt ol' : 'E-posta ile giriş'}</h3>
      <div class="stack">
        <input class="input" id="acc-mail" type="email" autocomplete="username" inputmode="email" placeholder="E-posta" aria-label="E-posta">
        <input class="input" id="acc-pass" type="password" autocomplete="${signup ? 'new-password' : 'current-password'}" placeholder="Şifre" aria-label="Şifre">
        <button class="btn" type="button" id="acc-go">${signup ? 'Kayıt ol' : 'Giriş yap'}</button>
        ${signup ? '' : '<button class="btn plain" type="button" id="acc-forgot">Şifremi unuttum</button>'}
        <button class="btn secondary" type="button" id="acc-back">Geri</button>
      </div>`, root => {
      const mail = () => root.querySelector('#acc-mail').value.trim();
      const pass = () => root.querySelector('#acc-pass').value;
      root.querySelector('#acc-go').onclick = async () => {
        if (!mail() || !pass()) return App.toast('E-posta ve şifreyi yaz');
        try {
          if (signup) await mods.authMod.createUserWithEmailAndPassword(auth, mail(), pass());
          else await mods.authMod.signInWithEmailAndPassword(auth, mail(), pass());
          App.toast(signup ? 'Hesap açıldı' : 'Giriş yapıldı');
          App.closeSheet();
        } catch (e) { App.toast(authTr(e)); }
      };
      const forgot = root.querySelector('#acc-forgot');
      if (forgot) forgot.onclick = async () => {
        if (!mail()) return App.toast('Önce e-postayı yaz');
        try { await mods.authMod.sendPasswordResetEmail(auth, mail()); App.toast('Sıfırlama e-postası gönderildi'); }
        catch (e) { App.toast(authTr(e)); }
      };
      root.querySelector('#acc-back').onclick = sheetSignedOut;
    });
  }
  function sheetSignedIn() {
    const email = esc(user && user.email ? user.email : 'Hesap');
    App.openSheet(`<h3>Hesap</h3>
      <div class="group"><div class="cell"><div class="cell-main">${email}<div class="cell-sub">Vardiya, izin, mola ve alarm bu hesapla eşitlenir</div></div></div></div>
      <div class="section-foot">Uygulama açılınca ve bir kayıt değişince eşitlenir. Çıkış yapmak bu telefondaki veriyi silmez.</div>
      <div class="stack" style="margin-top:20px"><button class="btn secondary" type="button" id="acc-out">Çıkış yap</button></div>`, root => {
      root.querySelector('#acc-out').onclick = async () => {
        try { await mods.authMod.signOut(auth); } catch (e) {}
        user = null; remember(null); statusLine(null);
        App.toast('Çıkış yapıldı'); App.closeSheet();
      };
    });
  }
  async function google() {
    const provider = new mods.authMod.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await mods.authMod.signInWithPopup(auth, provider);
      App.toast('Giriş yapıldı');
      App.closeSheet();
    } catch (e) {
      const code = e && e.code;
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return;
      const blocked = code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment';
      if (blocked && standalone()) return App.toast('Google penceresi ana ekran uygulamasında açılamadı. E-posta ile giriş yap.');
      if (blocked) {
        try { sessionStorage.setItem('ga-auth-redirect', '1'); } catch (err) {}
        try { await mods.authMod.signInWithRedirect(auth, provider); return; }
        catch (err) { return App.toast(authTr(err)); }
      }
      App.toast(authTr(e));
    }
  }

  async function open() {
    App.openSheet('<h3>Hesap</h3><div class="empty">Yükleniyor…</div>');
    const cfg = await loadConfig();
    if (!configReady(cfg)) return sheetUnconfigured();
    try {
      await ensureFirebase();
    } catch (e) { return sheetOffline(); }
    if (user) sheetSignedIn();
    else sheetSignedOut();
  }
  async function bootIfNeeded() {
    const cfg = await loadConfig();
    if (!configReady(cfg)) return;
    try { await ensureFirebase(); } catch (e) {}
  }
  async function wipe() {
    try {
      if (user && mods) await mods.fs.deleteDoc(mods.fs.doc(mods.db, 'users', user.uid));
    } catch (e) {}
    try { if (mods && auth) await mods.authMod.signOut(auth); } catch (e) {}
    remember(null);
  }

  document.addEventListener('visibilitychange', () => { if (!document.hidden) pull(); });
  setInterval(() => { if (!document.hidden) pull(); }, 60000);

  window.GAAccount = { open, bootIfNeeded, push, wipe, ready: true };
  if (window.__gaAccountOpen) open();
  else bootIfNeeded();
})();
