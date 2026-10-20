/* Opt-in team rooms. Personal shifts/alarms remain in users/{uid}/data/state. */
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const esc = s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const header = '<header class="page-header"><p class="eyebrow">Günlük Asistan</p><h1 class="large-title">Ekip</h1><p class="subtitle">Aynı vardiya, aynı ekip.</p></header>';
  const privacy = 'Katıldığın odalarda adın ve mola durumun paylaşılır. Kişisel vardiya takvimin ve alarmların paylaşılmaz.';
  let ctx, user, rooms = [], selected = null, members = [], messages = [], roomName = '';
  let listUnsub, roomUnsubs = [], epoch = 0, opening = null, errorText = '', connected = false, invite = null;
  let manualState = null, lastBreakStart = null, draft = '', sending = false;
  const ms = t => t && typeof t.toMillis === 'function' ? t.toMillis() : 0;
  const ref = (...parts) => ctx.fs.doc(ctx.db, ...parts);
  const token = () => Array.from(crypto.getRandomValues(new Uint8Array(24)), b => b.toString(16).padStart(2, '0')).join('');
  const inviteToken = () => { const t = new URLSearchParams(location.hash.slice(1)).get('invite'); return t && /^[a-f0-9]{48}$/.test(t) ? t : null; };
  function err(e) {
    if (!navigator.onLine || e?.code === 'unavailable') return 'Ekip için internet bağlantısı gerekiyor. Kişisel vardiya ve molanı kullanmaya devam edebilirsin.';
    if (e?.code === 'permission-denied') return 'Bu odaya erişilemiyor. Üyeliğini veya davet bağlantını kontrol et. Yeni ekip kurulumu henüz etkinleşmemiş de olabilir.';
    return 'İşlem tamamlanamadı. Bağlantını kontrol edip yeniden dene.';
  }
  function requireOnline() { if (!navigator.onLine) throw {code:'unavailable'}; }
  async function account() {
    if (!window.GAAccount) {
      await new Promise((resolve, reject) => {
        const existing = document.querySelector('script[src="account.js"]');
        if (existing) { existing.addEventListener('load', resolve, {once:true}); existing.addEventListener('error', reject, {once:true}); return; }
        const s = document.createElement('script'); s.src = 'account.js'; s.onload = resolve; s.onerror = reject; document.body.appendChild(s);
      });
    }
    return GAAccount.connection();
  }
  function stopRoom() { roomUnsubs.forEach(fn => fn()); roomUnsubs = []; members = []; messages = []; selected = null; draft = ''; sending = false; }
  function clear() { epoch++; listUnsub?.(); listUnsub = null; stopRoom(); rooms = []; invite = null; errorText = ''; connected = false; manualState = null; }
  function home() {
    if (selected) return;
    const root = $('#screen-ekip');
    if (!user) {
      root.innerHTML = header + `<div class="team-intro"><div class="team-symbol" aria-hidden="true">↗</div><h2>Ekibinle bağlantıda kal.</h2><p>Kendi odanı oluştur, davetini paylaş. Kim molada, kim dönüyor; tek yerden gör.</p><button class="btn" data-team="login">Google veya e-posta ile giriş</button><div class="section-foot">${inviteToken() ? 'Davetin hazır. Giriş yaptıktan sonra odaya katılabilirsin.' : 'Bireysel kullanım için hesap veya ekip gerekmez.'}</div></div><div class="section-foot">${privacy}</div>`;
      return;
    }
    root.innerHTML = header + `<div class="team-identity"><span class="avatar">${esc((user.displayName || 'E')[0])}</span><div><strong>${esc(user.displayName || 'Ekip hesabın')}</strong><div class="cell-sub">${esc(user.email)}</div></div></div>
      <div id="team-alert" role="status">${errorText ? `<div class="team-notice">${esc(errorText)} <button class="btn plain" data-team="retry">Yeniden dene</button></div>` : ''}</div>
      ${invite ? `<div class="invite-card"><p class="eyebrow">Oda daveti</p><h2>${esc(invite.name)}</h2><p>${privacy}</p><button class="btn" data-team="join">Odaya katıl</button><button class="btn plain" data-team="dismiss-invite">Şimdi değil</button></div>` : ''}
      <div class="section-title">Odaların <span class="count">${rooms.length}</span></div>
      <div class="group">${rooms.length ? rooms.map(r=>`<button class="cell room-link" data-room="${esc(r.id)}"><span class="avatar">${esc(r.name[0])}</span><span class="cell-main">${esc(r.name)}<span class="cell-sub">Sohbet ve mola durumu</span></span><span aria-hidden="true">›</span></button>`).join('') : `<div class="empty">${connected ? 'Henüz bir odaya katılmadın.<br>Ekibin için ilk odayı oluştur.' : 'Odalar yükleniyor…'}</div>`}</div>
      <button class="btn quick-action" data-team="create">+ Yeni oda oluştur</button><p class="section-foot">${privacy}</p>`;
  }
  async function boot() {
    if (opening) return opening;
    opening = (async () => {
      try {
        const next = await account();
        if (!next) throw new Error('unconfigured');
        if (ctx && user?.uid === next.user?.uid && listUnsub) return readInvite();
        clear(); ctx = next; user = next.user;
        if (user) {
          lastBreakStart = App.breakPresence().breakStartedAt;
          const saved = App.store.get('teamStatus:' + user.uid, null);
          if (saved && saved.breakStartedAt === lastBreakStart && ['returning','ready'].includes(saved.state)) manualState = saved.state;
        }
        home();
        if (!user) return;
        const myEpoch = epoch;
        listUnsub = ctx.fs.onSnapshot(ctx.fs.collection(ctx.db, 'users', user.uid, 'rooms'), {includeMetadataChanges:true}, snap => {
          if (epoch !== myEpoch) return;
          rooms = snap.docs.map(d=>({id:d.id,...d.data()})); connected = !snap.metadata.fromCache;
          if (connected) errorText = '';
          home();
        }, e => { if (epoch === myEpoch) {errorText = err(e); home();} });
        await readInvite();
      } catch (e) {
        $('#screen-ekip').innerHTML = header + `<div class="team-notice" role="status">${esc(err(e))}</div><button class="btn secondary" data-team="retry">Yeniden dene</button>`;
      }
    })();
    try { await opening; } finally { opening = null; }
  }
  async function readInvite() {
    const t = inviteToken();
    if (!t || !user) return;
    if (selected) stopRoom();
    try {
      const snap = await ctx.fs.getDocFromServer(ref('invites', t));
      if (!snap.exists() || ms(snap.data().expiresAt) <= Date.now()) { errorText = 'Bu davetin süresi dolmuş veya davet kaldırılmış. Ekip arkadaşından yeni bağlantı iste.'; invite = null; }
      else { invite = {token:t,...snap.data()}; errorText = ''; }
    } catch (e) { errorText = err(e); }
    home();
  }
  function identityForm(title, nameLabel, callback, withRoom) {
    App.openSheet(`<h3>${title}</h3><form id="team-form" class="stack">
      ${withRoom ? '<label class="form-label" for="room-name">Oda adı</label><input class="input" id="room-name" required maxlength="60" placeholder="Örn. F kontuvarı ekibi">' : ''}
      <label class="form-label" for="member-name">Ekipte görünecek adın</label><input class="input" id="member-name" required maxlength="40" autocomplete="name" value="${esc(user.displayName || App.store.get('teamName:' + user.uid, ''))}" placeholder="Adın">
      <p class="section-foot">${privacy}</p><p class="form-error" role="alert"></p><button class="btn" type="submit">${nameLabel}</button></form>`, root => {
      root.querySelector('form').onsubmit = async e => {
        e.preventDefault(); const name = root.querySelector('#member-name').value.trim(); const room = withRoom ? root.querySelector('#room-name').value.trim() : null;
        if (!name || (withRoom && !room)) return;
        const button = root.querySelector('[type=submit]'); button.disabled = true;
        try { requireOnline(); await callback(name, room); App.store.set('teamName:' + user.uid, name); App.closeSheet(); }
        catch (errObj) { root.querySelector('.form-error').textContent = err(errObj); }
        finally { button.disabled = false; }
      };
    });
  }
  function membership(name, joinToken) {
    return {name, uid:user.uid, joinToken, joinedAt:ctx.fs.serverTimestamp(), updatedAt:ctx.fs.serverTimestamp(), ...App.breakPresence()};
  }
  function create() {
    identityForm('Yeni oda', 'Odayı oluştur', async (name, room) => {
      const r = ctx.fs.doc(ctx.fs.collection(ctx.db, 'rooms'));
      const batch = ctx.fs.writeBatch(ctx.db);
      batch.set(r, {name:room, createdBy:user.uid, createdAt:ctx.fs.serverTimestamp()});
      batch.set(ref('rooms', r.id, 'members', user.uid), membership(name, ''));
      batch.set(ref('users', user.uid, 'rooms', r.id), {name:room, joinedAt:ctx.fs.serverTimestamp()});
      await batch.commit(); openRoom(r.id, room); App.toast('Odan hazır');
    }, true);
  }
  function join() {
    if (!invite) return;
    const invitation = {...invite};
    if (rooms.some(r=>r.id === invitation.roomId)) { dismissInvite(); return openRoom(invitation.roomId, invitation.name); }
    identityForm(invitation.name, 'Katıl ve durumumu paylaş', async name => {
      const batch = ctx.fs.writeBatch(ctx.db);
      batch.set(ref('rooms', invitation.roomId, 'members', user.uid), membership(name, invitation.token));
      batch.set(ref('users', user.uid, 'rooms', invitation.roomId), {name:invitation.name, joinedAt:ctx.fs.serverTimestamp()});
      await batch.commit(); dismissInvite(); openRoom(invitation.roomId, invitation.name); App.toast('Ekibe katıldın');
    }, false);
  }
  function dismissInvite() { invite = null; history.replaceState(null, '', location.pathname + location.search); home(); }
  function roomShell() {
    $('#screen-ekip').innerHTML = `<div class="room-toolbar"><button class="icon-btn" data-team="back" aria-label="Odalara dön">‹</button><div><p class="eyebrow">Ekip odası</p><h1>${esc(roomName)}</h1></div><button class="icon-btn" data-team="invite" aria-label="Davet bağlantısı">↗</button></div>
      <div id="team-alert" class="section-foot" role="status">Bağlanıyor…</div>
      <div class="section-title">Ekipte şu an</div><div id="team-members" class="group"><div class="empty">Üyeler yükleniyor…</div></div>
      <div class="status-actions"><button class="btn secondary" data-team="returning">Geliyorum</button><button class="btn secondary" data-team="ready">Döndüm</button></div>
      <p class="section-foot">Mola başlangıç ve bitişin otomatik paylaşılır. Durumlar, uygulama açıkken güncellenir.</p>
      <div class="section-title">Sohbet <span class="cell-sub">Son 60 mesaj</span></div>
      <div id="team-messages" class="messages" role="log" aria-label="Ekip mesajları" aria-live="polite"><div class="empty">Mesajlar yükleniyor…</div></div>
      <form id="team-compose" class="composer"><label class="sr-only" for="team-message">Mesajın</label><textarea id="team-message" rows="2" maxlength="2000" placeholder="Ekibine bir mesaj yaz…" required></textarea><button class="icon-btn" type="submit" aria-label="Mesaj gönder">↑</button></form>
      <div id="message-error" class="form-error" role="alert"></div><button class="btn plain danger" data-team="leave">Odadan ayrıl</button>`;
    $('#team-message').value = draft;
    $('#team-message').oninput = e => { draft = e.target.value; };
    $('#team-compose').onsubmit = send;
  }
  function roomError(e) {
    $('#team-alert').textContent = err(e);
    $('#team-alert').className = 'team-notice';
  }
  function openRoom(id, name) {
    stopRoom(); selected = id; roomName = name; roomShell();
    const localEpoch = epoch;
    const valid = () => selected === id && localEpoch === epoch;
    roomUnsubs.push(ctx.fs.onSnapshot(ref('rooms', id), {includeMetadataChanges:true}, snap => {
      if (!valid()) return;
      if (!snap.exists()) return roomError({code:'permission-denied'});
      $('#team-alert').textContent = snap.metadata.fromCache ? 'Bağlantı bekleniyor · son alınan bilgiler gösteriliyor' : 'Bağlı · ekip bilgileri güncelleniyor';
    }, e => { if (valid()) roomError(e); }));
    roomUnsubs.push(ctx.fs.onSnapshot(ctx.fs.collection(ctx.db, 'rooms', id, 'members'), snap => {
      if (!valid()) return;
      members = snap.docs.map(d=>({id:d.id,...d.data()})); drawMembers();
    }, e=>{if(valid()) roomError(e);}));
    const query = ctx.fs.query(ctx.fs.collection(ctx.db, 'rooms', id, 'messages'), ctx.fs.orderBy('createdAt','desc'), ctx.fs.limit(60));
    roomUnsubs.push(ctx.fs.onSnapshot(query, snap => {
      if (!valid()) return;
      messages = snap.docs.map(d=>({id:d.id,...d.data(),pending:d.metadata.hasPendingWrites})).reverse(); drawMessages();
    }, e=>{if(valid()) roomError(e);}));
    publishPresence();
  }
  function stateText(m) {
    if (m.state === 'returning') return 'Geliyorum';
    if (m.state === 'break') {
      const left = Math.ceil((m.breakEndsAt - Date.now()) / 60000);
      return left > 0 ? 'Molada · ' + left + ' dk kaldı' : 'Mola süresi doldu · dönüş bekleniyor';
    }
    return 'Görevde';
  }
  function drawMembers() {
    const el = $('#team-members'); if (!el) return;
    el.innerHTML = members.map(m=>{
      const age = ms(m.updatedAt) ? Math.max(0, Math.floor((Date.now()-ms(m.updatedAt))/60000)) : null;
      return `<div class="cell"><span class="avatar ${m.state === 'break' ? 'on-break' : ''}">${esc(m.name[0])}</span><div class="cell-main">${esc(m.name)}${m.uid === user.uid ? ' <span class="cell-sub">(sen)</span>' : ''}<div class="cell-sub">${age !== null && age >= 2 ? 'Son bilgi: ' + age + ' dk önce' : 'Az önce güncellendi'}</div></div><span class="member-state state-${esc(m.state)}">${esc(stateText(m))}</span></div>`;
    }).join('') || '<div class="empty">Üyeler bekleniyor…</div>';
  }
  function drawMessages() {
    const el = $('#team-messages'); if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 64;
    el.innerHTML = messages.map(m=>`<article class="message ${m.uid === user.uid ? 'mine' : ''}"><div class="message-author">${esc(m.name)} <time>${m.pending ? 'Gönderiliyor…' : ms(m.createdAt) ? new Date(ms(m.createdAt)).toLocaleTimeString('tr',{hour:'2-digit',minute:'2-digit'}) : ''}</time></div><p>${esc(m.text)}</p></article>`).join('') || '<div class="empty">Sohbeti sen başlat.<br>Bu odanın mesajlarını yalnız üyeler görebilir.</div>';
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }
  async function send(e) {
    e.preventDefault(); const text = draft.trim(); if (!text || sending) return;
    const me = members.find(m=>m.uid === user.uid); if (!me) return App.toast('Önce üyelik bilgilerin yüklenmeli');
    const id = selected; const button = $('#team-compose button');
    try {
      requireOnline(); sending = true; button.disabled = true; $('#message-error').textContent = '';
      await ctx.fs.addDoc(ctx.fs.collection(ctx.db, 'rooms', id, 'messages'), {uid:user.uid,name:me.name,text,createdAt:ctx.fs.serverTimestamp()});
      if (selected === id) { draft = ''; $('#team-message').value = ''; }
    } catch (e) { if (selected === id) $('#message-error').textContent = err(e); }
    finally { if (selected === id) { sending = false; button.disabled = false; } }
  }
  async function publishPresence() {
    if (!ctx || !user || !navigator.onLine || !rooms.length) return;
    const data = App.breakPresence();
    if (manualState) data.state = manualState;
    // Each independent write avoids the Firestore multi-document rules access limit.
    await Promise.all(rooms.map(r => ctx.fs.updateDoc(ref('rooms',r.id,'members',user.uid), {...data,updatedAt:ctx.fs.serverTimestamp()}).catch(e=>{if(selected === r.id) roomError(e);} )));
  }
  async function setState(state) {
    if (!navigator.onLine) return App.toast('Durum paylaşmak için internet gerekli');
    if (state === 'ready' && App.breakPresence().state === 'break') {
      App.toggleBreak();
      if (App.breakPresence().state === 'break') return;
    }
    manualState = state;
    App.store.set('teamStatus:' + user.uid, {state, breakStartedAt:App.breakPresence().breakStartedAt});
    await publishPresence();
  }
  async function inviteSheet() {
    const id = selected;
    App.openSheet('<h3>Ekibini davet et</h3><div class="empty">Davet hazırlanıyor…</div>');
    try {
      requireOnline();
      const t = token();
      await ctx.fs.setDoc(ref('invites', t), {roomId:id,name:roomName,createdBy:user.uid,createdAt:ctx.fs.serverTimestamp(),expiresAt:ctx.fs.Timestamp.fromMillis(Date.now()+7*86400000)});
      const url = new URL(location.pathname, location.origin); url.hash = 'invite=' + t;
      App.openSheet(`<h3>Ekibini davet et</h3><p class="section-foot">${esc(roomName)} odasına katılmak için bu bağlantıyı paylaş. Bağlantı 7 gün geçerli; bağlantıya sahip olan ve giriş yapan herkes katılabilir.</p><input class="input invite-url" readonly aria-label="Davet bağlantısı" value="${esc(url.href)}"><div class="stack"><button class="btn" id="invite-share">Bağlantıyı paylaş</button><button class="btn secondary" id="invite-copy">Kopyala</button><button class="btn plain danger" id="invite-revoke">Bu daveti iptal et</button></div>`, root=>{
        root.querySelector('#invite-copy').onclick = async()=>{try {await navigator.clipboard.writeText(url.href); App.toast('Bağlantı kopyalandı');} catch (_) {root.querySelector('input').select(); App.toast('Bağlantıyı seçip kopyalayabilirsin');}};
        root.querySelector('#invite-share').onclick = async()=>{if(!navigator.share) return root.querySelector('#invite-copy').click();try {await navigator.share({title:roomName,text:'Günlük Asistan ekibimize katıl',url:url.href});} catch(e) {if(e.name!=='AbortError') App.toast('Paylaşım açılamadı; bağlantıyı kopyalayabilirsin');}};
        root.querySelector('#invite-revoke').onclick = async()=>{try {requireOnline();await ctx.fs.deleteDoc(ref('invites',t));App.closeSheet();App.toast('Davet iptal edildi');}catch(e){App.toast(err(e));}};
      });
    } catch (e) { App.openSheet(`<h3>Davet oluşturulamadı</h3><div class="empty">${esc(err(e))}</div>`); }
  }
  function leave() {
    const id = selected;
    App.openSheet(`<h3>Odadan ayrıl?</h3><p class="section-foot">Mola durumun odadan kaldırılır. Gönderdiğin mesajlar odada kalır. Yeniden katılmak için davet gerekir.</p><div class="stack"><button class="btn danger" id="leave-confirm">Odadan ayrıl</button><button class="btn secondary" id="leave-cancel">Vazgeç</button></div>`, root=>{
      root.querySelector('#leave-cancel').onclick=App.closeSheet;
      root.querySelector('#leave-confirm').onclick=async()=>{
        try {requireOnline();const batch=ctx.fs.writeBatch(ctx.db);batch.delete(ref('rooms',id,'members',user.uid));batch.delete(ref('users',user.uid,'rooms',id));await batch.commit();stopRoom();App.closeSheet();home();App.toast('Odadan ayrıldın');}
        catch(e){App.toast(err(e));}
      };
    });
  }
  document.addEventListener('click', e => {
    const r=e.target.closest('[data-room]'); if(r) return openRoom(r.dataset.room,rooms.find(x=>x.id===r.dataset.room).name);
    const action=e.target.closest('[data-team]')?.dataset.team;
    if(action==='login') return GAAccount.open();
    if(action==='retry') {clear();return boot();}
    if(action==='create') return create();
    if(action==='join') return join();
    if(action==='dismiss-invite') return dismissInvite();
    if(action==='back') {stopRoom();return home();}
    if(action==='invite') return inviteSheet();
    if(action==='leave') return leave();
    if(action==='returning'||action==='ready') return setState(action);
  });
  window.addEventListener('ga:auth',()=>{clear();user=null;home();setTimeout(boot,0);});
  window.addEventListener('ga:breakchange',()=>{
    const start = App.breakPresence().breakStartedAt;
    if (start !== lastBreakStart) {
      manualState = null; lastBreakStart = start;
      if (user) App.store.set('teamStatus:' + user.uid, null);
    }
    publishPresence();
  });
  window.addEventListener('hashchange',readInvite);
  window.addEventListener('offline',()=>{if(selected) roomError({code:'unavailable'});});
  window.addEventListener('online',()=>{publishPresence();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden) publishPresence();});
  setInterval(()=>{if(!document.hidden){drawMembers();publishPresence();}},60000);
  window.GAGroups={open:boot};
})();
